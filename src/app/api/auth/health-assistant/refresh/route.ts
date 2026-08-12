import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import type {
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '@/integration/auth/health-assistant/types.ts';
import { cookies } from 'next/headers';
import {
  healthAssistantAccessToken,
  healthAssistantRefreshToken,
} from '@/lib/constants';
import { HEALTH_ASSISTANT_ENDPOINTS } from '@/integration/auth/health-assistant/endpoints';
import { API_BASE_URL } from '@/integration/config';

/**
 * POST /api/auth/health-assistant/refresh
 * Proxy endpoint for token refresh
 */
export async function POST(request: NextRequest) {
  try {
    // Try to get refresh token from cookie first, then body
    const cookieStore = await cookies();
    const refreshTokenFromCookie = cookieStore.get(
      healthAssistantRefreshToken
    )?.value;

    const body: RefreshTokenRequest = await request.json();
    const refreshToken = refreshTokenFromCookie || body.refreshToken;

    const response = await backendApiClient.post<RefreshTokenResponse>(
      `${API_BASE_URL}${HEALTH_ASSISTANT_ENDPOINTS.REFRESH_TOKEN}`,
      { refreshToken }
    );

    const data = response.data;

    // Update cookies
    cookieStore.set(healthAssistantAccessToken, data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    cookieStore.set(healthAssistantRefreshToken, data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
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
