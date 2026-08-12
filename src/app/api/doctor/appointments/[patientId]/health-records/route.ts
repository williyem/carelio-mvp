import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import { cookies } from 'next/headers';
import { doctorAccessToken, USER_TYPE_HEADER } from '@/lib/constants';
import { APPOINTMENT_ENDPOINTS } from '@/integration/appointments/endpoints';
import type { PatientAppointmentsResponse } from '@/integration/appointments/types';
import { isDummyDataEnabled } from '@/lib/dummy-data/config';
import { getPatientHealthRecords } from '@/lib/dummy-data/loader';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(doctorAccessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { patientId } = await params;
    const { searchParams } = new URL(request.url);

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    if (isDummyDataEnabled()) {
      return NextResponse.json(
        getPatientHealthRecords(patientId, {
          page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
          limit: searchParams.get('limit')
            ? Number(searchParams.get('limit'))
            : 10,
          search: searchParams.get('search') ?? undefined,
        })
      );
    }

    const endpoint = APPOINTMENT_ENDPOINTS.GET_PATIENT_NOTES.replace(
      ':patientId',
      patientId
    );

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
    console.error('Get patient health records error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        {
          error: 'Get patient health records failed',
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
