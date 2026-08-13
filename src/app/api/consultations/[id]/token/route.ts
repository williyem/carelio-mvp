import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, backendApiClient } from '@/integration/config';
import { cookies } from 'next/headers';
import {
  doctorAccessToken,
  healthAssistantAccessToken,
  patientAccessToken,
} from '@/lib/constants';
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
    const doctorToken = cookieStore.get(doctorAccessToken)?.value;
    const assistantToken = cookieStore.get(healthAssistantAccessToken)?.value;
    const patientToken = cookieStore.get(patientAccessToken)?.value;
    const accessToken = doctorToken || assistantToken || patientToken;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (isDummyDataEnabled()) {
      return NextResponse.json(getConsultationToken(appointmentId));
    }

    const backendPath =
      patientToken && !doctorToken && !assistantToken
        ? `/consultations/${appointmentId}/token/patient`
        : `/consultations/${appointmentId}/token/doctor`;

    const response = await backendApiClient.get(
      `${API_BASE_URL}${backendPath}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Get consultation token error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        axiosError.response?.data ?? {
          error: 'Failed to fetch consultation token',
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
