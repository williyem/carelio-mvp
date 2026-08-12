import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import type {
  HealthAssistantRegisterRequest,
  HealthAssistantLoginResponse,
} from '@/integration/auth/health-assistant/types';
import { cookies } from 'next/headers';
import {
  healthAssistantAccessToken,
  healthAssistantRefreshToken,
} from '@/lib/constants';
import { HEALTH_ASSISTANT_ENDPOINTS } from '@/integration/auth/health-assistant/endpoints';
import { API_BASE_URL } from '@/integration/config';

/**
 * POST /api/auth/health-assistant/register
 * Proxy endpoint for health assistant registration
 */
export async function POST(request: NextRequest) {
  try {
    const body: HealthAssistantRegisterRequest = await request.json();

    const response = await backendApiClient.post<HealthAssistantLoginResponse>(
      `${API_BASE_URL}${HEALTH_ASSISTANT_ENDPOINTS.CREATE}`,
      body
    );

    const data = response.data;

    // Set httpOnly cookies
    const cookieStore = await cookies();

    // Check if response has tokenData (2FA not enabled) or requires2FA (2FA enabled)
    if ('tokenData' in data) {
      // 2FA is NOT enabled - set cookies and return user data
      cookieStore.set(healthAssistantAccessToken, data.tokenData.access.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      cookieStore.set(
        healthAssistantRefreshToken,
        data.tokenData.refresh.token,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
        }
      );

      return NextResponse.json({
        user: data.user,
        requires2FA: false,
      });
    } else if ('requires2FA' in data && data.requires2FA) {
      // 2FA is enabled - return token for 2FA verification
      return NextResponse.json({
        requires2FA: true,
        twoFactorToken: data.token,
      });
    }

    // Fallback error if response structure is unexpected
    return NextResponse.json(
      { error: 'Unexpected response structure' },
      { status: 500 }
    );
  } catch (error: unknown) {
    console.error('Health assistant register error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        { error: 'Registration failed', details: axiosError.response?.data },
        { status: axiosError.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
