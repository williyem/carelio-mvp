import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import { cookies } from 'next/headers';
import {
  doctorAccessToken,
  healthAssistantAccessToken,
  USER_TYPE,
} from '@/lib/constants';
import { APPOINTMENT_ENDPOINTS } from '@/integration/appointments/endpoints';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const doctorToken = cookieStore.get(doctorAccessToken)?.value;
    const assistantToken = cookieStore.get(healthAssistantAccessToken)?.value;
    // Health assistants join consultations too, so they need the note as well.
    const accessToken = doctorToken || assistantToken;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userType = doctorToken ? USER_TYPE.doctor : USER_TYPE.healthAssistant;

    const { appointmentId } = await params;

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const endpoint = APPOINTMENT_ENDPOINTS.GET_APPOINTMENT_NOTE.replace(
      ':appointmentId',
      appointmentId
    );

    const response = await backendApiClient.get(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-user-type': userType,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Get consultation note error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      if (axiosError.response?.status === 404) {
        return NextResponse.json({ data: null });
      }
      return NextResponse.json(
        {
          error: 'Get consultation note failed',
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
