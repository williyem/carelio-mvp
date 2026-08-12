import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import type {
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '@/integration/auth/health-assistant/types.ts';
import { API_BASE_URL } from '@/integration/config';
import { cookies } from 'next/headers';
import { healthAssistantTempToken } from '@/lib/constants';
import { HEALTH_ASSISTANT_ENDPOINTS } from '@/integration/auth/health-assistant/endpoints';

export async function POST(request: NextRequest) {
  try {
    const body: ResetPasswordRequest = await request.json();
    const cookieStore = await cookies();
    const token = cookieStore.get(healthAssistantTempToken)?.value;

    const response = await backendApiClient.post<ResetPasswordResponse>(
      `${API_BASE_URL}${HEALTH_ASSISTANT_ENDPOINTS.RESET_PASSWORD}`,
      { ...body, token }
    );

    const res = NextResponse.json(response.data);

    if (response?.data?.requiresSetup) {
      res.cookies.set(healthAssistantTempToken, response.data.setupToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 10,
      });
    } else {
      res.cookies.delete(healthAssistantTempToken);
    }

    return res;
  } catch (error: unknown) {
    console.error('Reset password error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        { error: 'Reset failed', details: axiosError.response?.data },
        { status: axiosError.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
