import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient, API_BASE_URL } from '@/integration/config';
import type {
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '@/integration/auth/doctor/types';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/doctor/refresh
 * Proxy endpoint for token refresh
 */
export async function POST(request: NextRequest) {
  try {
    // Try to get refresh token from cookie first, then body
    const cookieStore = await cookies();
    const refreshTokenFromCookie = cookieStore.get(
      'doctor_refresh_token'
    )?.value;

    const body: RefreshTokenRequest = await request.json();
    const refreshToken = refreshTokenFromCookie || body.refreshToken;

    const response = await backendApiClient.post<RefreshTokenResponse>(
      `${API_BASE_URL}/auth/doctor/refresh`,
      { refreshToken }
    );

    const data = response.data;

    // Update cookies
    cookieStore.set('doctor_access_token', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    cookieStore.set('doctor_refresh_token', data.refreshToken, {
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
