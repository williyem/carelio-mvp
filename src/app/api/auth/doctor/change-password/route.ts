import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient, API_BASE_URL } from '@/integration/config';
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from '@/integration/auth/doctor/types';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/doctor/change-password
 * Proxy endpoint for changing password
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('doctor_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ChangePasswordRequest = await request.json();

    const response = await backendApiClient.post<ChangePasswordResponse>(
      `${API_BASE_URL}/auth/doctor/change-password`,
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Change password error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        { error: 'Change password failed', details: axiosError.response?.data },
        { status: axiosError.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
