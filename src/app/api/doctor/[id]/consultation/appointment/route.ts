import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import { cookies } from 'next/headers';
import { doctorAccessToken, USER_TYPE_HEADER } from '@/lib/constants';
import { APPOINTMENT_ENDPOINTS } from '@/integration/appointments/endpoints';
import { isDummyDataEnabled } from '@/lib/dummy-data/config';
import { getAppointmentById } from '@/lib/dummy-data/loader';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(doctorAccessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    if (isDummyDataEnabled()) {
      const appointment = getAppointmentById(id);
      if (!appointment) {
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(appointment);
    }

    const endpoint = APPOINTMENT_ENDPOINTS.GET_APPOINTMENT_BY_ID.replace(
      ':id',
      id
    );

    const response = await backendApiClient.get(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...USER_TYPE_HEADER,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Get appointment by ID error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        {
          error: 'Get appointment by ID failed',
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
