import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient, API_BASE_URL } from '@/integration/config';
import type {
  InvitePatientRequest,
  InvitePatientResponse,
} from '@/integration/auth/doctor/types';
import { cookies } from 'next/headers';
import { doctorAccessToken } from '@/lib/constants';

/**
 * POST /api/auth/doctor/invite-patient
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
      `${API_BASE_URL}/auth/patient/invite`,
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
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
