import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import { cookies } from 'next/headers';
import { healthAssistantAccessToken, USER_TYPE_HEADER } from '@/lib/constants';
import { APPOINTMENT_ENDPOINTS } from '@/integration/appointments/endpoints';
import type { PatientAppointmentsResponse } from '@/integration/appointments/types';

/**
 * GET /api/health-assistant/appointments/[patientId]
 * Proxy endpoint for getting patient appointments
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(healthAssistantAccessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { patientId } = await params;

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const status = searchParams.get('status');

    const queryParams = new URLSearchParams({});

    if (status) queryParams.append('status', status);
    if (limit) queryParams.append('limit', limit);
    if (page) queryParams.append('page', page);

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    const endpoint = APPOINTMENT_ENDPOINTS.GET_PATIENT_APPOINTMENTS.replace(
      ':patientId',
      patientId
    );

    const response = await backendApiClient.get<PatientAppointmentsResponse>(
      `${endpoint}?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...USER_TYPE_HEADER,
        },
        // params: { page, limit },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Get patient appointments error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        {
          error: 'Get patient appointments failed',
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
