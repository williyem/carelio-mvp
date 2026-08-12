import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient, API_BASE_URL } from '@/integration/config';
import type {
  Disable2FARequest,
  Disable2FAResponse,
} from '@/integration/auth/doctor/types';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/doctor/disable-2fa
 * Proxy endpoint for disabling 2FA
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('doctor_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: Disable2FARequest = await request.json();

    const response = await backendApiClient.post<Disable2FAResponse>(
      `${API_BASE_URL}/auth/doctor/disable-2fa`,
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Disable 2FA error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        { error: 'Disable 2FA failed', details: axiosError.response?.data },
        { status: axiosError.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
