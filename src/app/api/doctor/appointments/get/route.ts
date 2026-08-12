import { NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import { cookies } from 'next/headers';
import { doctorAccessToken, USER_TYPE_HEADER } from '@/lib/constants';
import { APPOINTMENT_ENDPOINTS } from '@/integration/appointments/endpoints';
import type { PatientAppointmentsResponse } from '@/integration/appointments/types';
import { isDummyDataEnabled } from '@/lib/dummy-data/config';
import { getDoctorAppointments } from '@/lib/dummy-data/loader';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const cookieStore = await cookies();
    const accessToken = cookieStore.get(doctorAccessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (isDummyDataEnabled()) {
      const result = getDoctorAppointments({
        page: params.page ? Number(params.page) : 1,
        limit: params.limit ? Number(params.limit) : 50,
        status: params.status,
        startDate: params.startDate,
        endDate: params.endDate,
      });
      return NextResponse.json(result);
    }

    const endpoint = APPOINTMENT_ENDPOINTS.GET_DOCTOR_APPOINTMENTS;

    const response = await backendApiClient.get<PatientAppointmentsResponse>(
      endpoint,
      {
        params,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...USER_TYPE_HEADER,
        },
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
