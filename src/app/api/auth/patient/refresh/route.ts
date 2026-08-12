import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient, API_BASE_URL } from '@/integration/config';
import type {
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '@/integration/auth/patient/types';
import { cookies } from 'next/headers';
import { patientAccessToken, patientRefreshToken } from '@/lib/constants';

/**
 * POST /api/auth/patient/refresh
 * Proxy endpoint for token refresh
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshTokenFromCookie = cookieStore.get(patientRefreshToken)?.value;

    const body: RefreshTokenRequest = await request.json();
    const refreshToken = refreshTokenFromCookie || body.refreshToken;

    const response = await backendApiClient.post<RefreshTokenResponse>(
      `${API_BASE_URL}/auth/patient/refresh`,
      { refreshToken }
    );

    const data = response.data;

    cookieStore.set(patientAccessToken, data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    cookieStore.set(patientRefreshToken, data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return NextResponse.json({ message: 'Token refreshed' });
  } catch (error: unknown) {
    console.error('Token refresh error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        { error: 'Token refresh failed', details: axiosError.response?.data },
        { status: axiosError.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
