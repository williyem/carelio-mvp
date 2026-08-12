import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import type {
  InvitePatientRequest,
  InvitePatientResponse,
} from '@/integration/patient/type';
import { cookies } from 'next/headers';
import { doctorAccessToken } from '@/lib/constants';
import { HEALTH_ASSISTANT_ENDPOINTS } from '@/integration/health-assistant/endpoints';

/**
 * POST /api/auth/health-assistant/invite-patient
 * Proxy endpoint for inviting a patient
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(doctorAccessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: InvitePatientRequest = await request.json();

    const response = await backendApiClient.post<InvitePatientResponse>(
      `${HEALTH_ASSISTANT_ENDPOINTS.REGISTER_PATIENT}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Invite patient error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        { error: 'Invite patient failed', details: axiosError.response?.data },
        { status: axiosError.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
