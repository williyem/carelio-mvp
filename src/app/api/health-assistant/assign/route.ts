import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import type { AssignHealthAssistantRequest } from '@/integration/health-assistant/types';
import { cookies } from 'next/headers';
import { doctorAccessToken, USER_TYPE_HEADER } from '@/lib/constants';
import { HEALTH_ASSISTANT_ENDPOINTS } from '@/integration/health-assistant/endpoints';
import { AssignedPatient } from '@/integration/patient/type';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(doctorAccessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: AssignHealthAssistantRequest = await request.json();

    const response = await backendApiClient.post<AssignedPatient>(
      `${HEALTH_ASSISTANT_ENDPOINTS.ASSIGN_HEALTH_ASSISTANT}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...USER_TYPE_HEADER,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Assign health assistant error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        {
          error: 'Assign health assistant failed',
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
