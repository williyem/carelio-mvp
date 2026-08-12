import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import { cookies } from 'next/headers';
import { healthAssistantAccessToken, USER_TYPE_HEADER } from '@/lib/constants';
import { APPOINTMENT_ENDPOINTS } from '@/integration/appointments/endpoints';
import type {
  ScheduleAppointmentRequest,
  ScheduleAppointmentResponse,
} from '@/integration/appointments/types';

/**
 * POST /api/health-assistant/appointments/schedule
 * Proxy endpoint for scheduling an appointment
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(healthAssistantAccessToken)?.value;

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
      APPOINTMENT_ENDPOINTS.SCHEDULE_APPOINTMENT,
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
          ...USER_TYPE_HEADER,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Schedule appointment error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        {
          error: 'Schedule appointment failed',
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
