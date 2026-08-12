import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import { cookies } from 'next/headers';
import { healthAssistantAccessToken, USER_TYPE_HEADER } from '@/lib/constants';
import type { PatientAppointmentsResponse } from '@/integration/appointments/types';
import { PATIENT_ENDPOINTS } from '@/integration/patient/endpoints';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(healthAssistantAccessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    const endpoint = PATIENT_ENDPOINTS.GET_PATIENT_BY_ID.replace(':id', id);

    const response = await backendApiClient.get<PatientAppointmentsResponse>(
      endpoint,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...USER_TYPE_HEADER,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Get patient  error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        {
          error: 'Get patient failed',
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
