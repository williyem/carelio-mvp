import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, backendApiClient } from '@/integration/config';
import { cookies } from 'next/headers';
import {
  USER_TYPE_HEADER,
  doctorAccessToken,
  healthAssistantAccessToken,
  patientAccessToken,
} from '@/lib/constants';
import { DOCTOR_ENDPOINTS } from '@/integration/doctor/endpoint';
import { isDummyDataEnabled } from '@/lib/dummy-data/config';
import { getConsultationToken } from '@/lib/dummy-data/loader';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: appointmentId } = await params;
  try {
    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const accessToken =
      cookieStore.get(doctorAccessToken)?.value ||
      cookieStore.get(healthAssistantAccessToken)?.value ||
      cookieStore.get(patientAccessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (isDummyDataEnabled()) {
      return NextResponse.json(getConsultationToken(appointmentId));
    }

    const response = await backendApiClient.get(
      `${API_BASE_URL}${DOCTOR_ENDPOINTS.GET_DOCTOR_CONSULTATION_TOKEN.replace(':id', appointmentId)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...USER_TYPE_HEADER,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Get patient consultation token error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        {
          error: 'Failed to fetch patient consultation token',
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
