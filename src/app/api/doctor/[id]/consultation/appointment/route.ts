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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const doctorToken = cookieStore.get(doctorAccessToken)?.value;
    const assistantToken = cookieStore.get(healthAssistantAccessToken)?.value;
    const accessToken = doctorToken || assistantToken;

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

    const endpoint = APPOINTMENT_ENDPOINTS.GET_APPOINTMENT_BY_ID.replace(
      ':id',
      id
    );

    const response = await backendApiClient.get(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-user-type': doctorToken
          ? USER_TYPE.doctor
          : USER_TYPE.healthAssistant,
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
