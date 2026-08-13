import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import type {
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '@/integration/auth/health-assistant/types.ts';
import { API_BASE_URL } from '@/integration/config';
import { cookies } from 'next/headers';
import {
  healthAssistantTempToken,
  healthAssistantAccessToken,
  healthAssistantRefreshToken,
  healthAssistantCookieObj,
} from '@/lib/constants';
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
    const data = response.data as {
      requiresSetup?: boolean;
      setupToken?: string;
      tokenData?: {
        access?: { token: string };
        refresh?: { token: string };
      };
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
      };
    };

    if (data.tokenData?.access?.token) {
      res.cookies.set(healthAssistantAccessToken, data.tokenData.access.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      if (data.tokenData.refresh?.token) {
        res.cookies.set(
          healthAssistantRefreshToken,
          data.tokenData.refresh.token,
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
          }
        );
      }
      if (data.user) {
        res.cookies.set(healthAssistantCookieObj, JSON.stringify(data.user), {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
      }
      res.cookies.delete(healthAssistantTempToken);
    } else if (data.requiresSetup && data.setupToken) {
      res.cookies.set(healthAssistantTempToken, data.setupToken, {
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
