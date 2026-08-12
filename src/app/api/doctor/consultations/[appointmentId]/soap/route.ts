import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import { cookies } from 'next/headers';
import { doctorAccessToken, USER_TYPE_HEADER } from '@/lib/constants';
import { APPOINTMENT_ENDPOINTS } from '@/integration/appointments/endpoints';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(doctorAccessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appointmentId } = await params;

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const endpoint = APPOINTMENT_ENDPOINTS.SUBMIT_SOAP_NOTES.replace(
      ':appointmentId',
      appointmentId
    );

    const response = await backendApiClient.post(endpoint, body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...USER_TYPE_HEADER,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Submit SOAP notes error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        {
          error: 'Submit SOAP notes failed',
          details: axiosError.response?.data,
        },
        { status: axiosError.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
