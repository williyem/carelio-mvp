import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient, API_BASE_URL } from '@/integration/config';
import type { GetSessionResponse } from '@/integration/auth/patient/types';
import { cookies } from 'next/headers';

/**
 * GET /api/auth/patient/session
 * Proxy endpoint for getting current session
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('patient_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await backendApiClient.get<GetSessionResponse>(
      `${API_BASE_URL}/auth/patient/session`,
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
        cookieStore.delete('patient_access_token');
        cookieStore.delete('patient_refresh_token');
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
