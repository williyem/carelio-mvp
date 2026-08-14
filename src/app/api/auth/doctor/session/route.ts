import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { backendApiClient, API_BASE_URL } from '@/integration/config';
import type { GetSessionResponse } from '@/integration/auth/doctor/types';
import { doctorAccessToken } from '@/lib/constants';

/**
 * GET /api/auth/doctor/session
 * Proxy endpoint for getting current session
 */
export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(doctorAccessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await backendApiClient.get<GetSessionResponse>(
      `${API_BASE_URL}/auth/doctor/session`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Get session error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };

      if (axiosError.response?.status === 401) {
        const cookieStore = await cookies();
        cookieStore.delete(doctorAccessToken);
        cookieStore.delete('doctor_refresh_token');
      }

      return NextResponse.json(
        { error: 'Failed to get session', details: axiosError.response?.data },
        { status: axiosError.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
