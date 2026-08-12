import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient, API_BASE_URL } from '@/integration/config';
import type {
  HealthAssistantRegisterRequest,
  HealthAssistantLoginResponse,
} from '@/integration/auth/health-assistant/types';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/health-assistant/register
 * Proxy endpoint for health assistant registration
 */
export async function POST(request: NextRequest) {
  try {
    const body: HealthAssistantRegisterRequest = await request.json();

    const response = await backendApiClient.post<HealthAssistantLoginResponse>(
      `${API_BASE_URL}/auth/assistant/create`,
      body
    );

    const data = response.data;

    // Set httpOnly cookies
    const cookieStore = await cookies();
    cookieStore.set('health_assistant_access_token', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    cookieStore.set('health_assistant_refresh_token', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return NextResponse.json({ user: data.user });
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
