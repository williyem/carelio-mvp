import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import type {
  VerifyOtpRequest,
  VerifyOtpResponse,
} from '@/integration/auth/health-assistant/types.ts';
import { API_BASE_URL } from '@/integration/config';
import { cookies } from 'next/headers';
import { healthAssistantTempToken } from '@/lib/constants';
import { HEALTH_ASSISTANT_ENDPOINTS } from '@/integration/auth/health-assistant/endpoints';

export async function POST(request: NextRequest) {
  try {
    const body: VerifyOtpRequest = await request.json();
    const cookieStore = await cookies();

    const response = await backendApiClient.post<VerifyOtpResponse>(
      `${API_BASE_URL}${HEALTH_ASSISTANT_ENDPOINTS.VERIFY_OTP}`,
      body
    );

    const token = response.data?.token;
    if (!token) {
      return NextResponse.json(
        { error: 'Invalid response: missing token' },
        { status: 502 }
      );
    }

    cookieStore.set(healthAssistantTempToken, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 10, // 10 minutes
    });

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Verify OTP error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        { error: 'Verification failed', details: axiosError.response?.data },
        { status: axiosError.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
