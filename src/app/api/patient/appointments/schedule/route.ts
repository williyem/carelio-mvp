import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, backendApiClient } from '@/integration/config';
import { cookies } from 'next/headers';
import { patientAccessToken } from '@/lib/constants';
import type {
  ScheduleAppointmentRequest,
  ScheduleAppointmentResponse,
} from '@/integration/appointments/types';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(patientAccessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ScheduleAppointmentRequest = await request.json();

    if (!body.patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    if (!body.doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    if (typeof body.isImmediate !== 'boolean') {
      return NextResponse.json(
        { error: 'isImmediate is required and must be a boolean' },
        { status: 400 }
      );
    }

    const response = await backendApiClient.post<ScheduleAppointmentResponse>(
      `${API_BASE_URL}/appointments`,
      {
        patientId: body.patientId,
        isImmediate: body.isImmediate,
        doctorId: body.doctorId,
        ...(body.startTime && { startTime: body.startTime }),
        ...(body.endTime && { endTime: body.endTime }),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Patient schedule appointment error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        axiosError.response?.data ?? {
          error: 'Schedule appointment failed',
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
