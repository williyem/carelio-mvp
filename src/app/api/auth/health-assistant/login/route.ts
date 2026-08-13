import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  healthAssistantAccessToken,
  healthAssistantCookieObj,
  healthAssistantRefreshToken,
  healthAssistantTempToken,
} from '@/lib/constants';
import { isDummyDataEnabled } from '@/lib/dummy-data/config';
import { backendApiClient, API_BASE_URL } from '@/integration/config';
import type { HealthAssistantLoginRequest } from '@/integration/auth/health-assistant/types';

function isConnRefused(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'ECONNREFUSED'
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();

    if (isDummyDataEnabled() && body.email && body.password) {
      const loginResponse = {
        authenticated: true,
        user: {
          id: 'ha-demo-1',
          email: body.email as string,
          firstName: 'Demo',
          lastName: 'Assistant',
          phoneNumber: '',
        },
        tokenData: {
          access: { token: 'dummy-ha-access-token' },
          refresh: { token: 'dummy-ha-refresh-token' },
        },
      };

      const userData = JSON.stringify({
        id: loginResponse.user.id,
        email: loginResponse.user.email,
        firstName: loginResponse.user.firstName,
        lastName: loginResponse.user.lastName,
      });

      cookieStore.set(
        healthAssistantAccessToken,
        loginResponse.tokenData.access.token,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        }
      );

      cookieStore.set(
        healthAssistantRefreshToken,
        loginResponse.tokenData.refresh.token,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
        }
      );

      cookieStore.set(healthAssistantCookieObj, userData, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      return NextResponse.json(loginResponse);
    }

    if (!isDummyDataEnabled() && body.email && body.password) {
      const response = await backendApiClient.post(
        `${API_BASE_URL}/auth/assistant/login`,
        body as HealthAssistantLoginRequest
      );
      const loginResponse = response.data as {
        tokenData?: {
          access: { token: string };
          refresh: { token: string };
        };
        user?: {
          id: string;
          email: string;
          firstName: string;
          lastName: string;
          phoneNumber?: string;
        };
        authenticated?: boolean;
      };

      if (loginResponse.tokenData && loginResponse.user) {
        const userData = JSON.stringify({
          id: loginResponse.user.id,
          email: loginResponse.user.email,
          firstName: loginResponse.user.firstName,
          lastName: loginResponse.user.lastName,
          phoneNumber: loginResponse.user.phoneNumber ?? '',
        });

        cookieStore.set(
          healthAssistantAccessToken,
          loginResponse.tokenData.access.token,
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
          }
        );

        cookieStore.set(
          healthAssistantRefreshToken,
          loginResponse.tokenData.refresh.token,
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
          }
        );

        cookieStore.set(healthAssistantCookieObj, userData, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });

        return NextResponse.json({
          ...loginResponse,
          authenticated: true,
        });
      }

      return NextResponse.json(loginResponse);
    }

    const { accessToken, refreshToken, resetToken, user } = body as {
      accessToken?: string;
      refreshToken?: string;
      resetToken?: string;
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
      };
    };

    if (resetToken) {
      cookieStore.set(healthAssistantTempToken, resetToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 10,
      });
      return NextResponse.json({
        message: 'Temporary cookie set successfully!',
      });
    }

    if (accessToken && refreshToken) {
      cookieStore.set(healthAssistantAccessToken, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      cookieStore.set(healthAssistantRefreshToken, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
      if (user) {
        cookieStore.set(healthAssistantCookieObj, JSON.stringify(user), {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
      }
      return NextResponse.json({
        message: 'Session cookies set successfully!',
      });
    }

    if (accessToken) {
      cookieStore.set(healthAssistantTempToken, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 10,
      });
      return NextResponse.json({
        message: 'Temporary cookie set successfully!',
      });
    }

    return NextResponse.json({ message: 'No cookies set' }, { status: 400 });
  } catch (error) {
    console.error('Health assistant login error:', error);

    if (isConnRefused(error)) {
      return NextResponse.json(
        {
          error: 'Backend unreachable',
          message: `Cannot connect to API at ${API_BASE_URL}. Start carelio-backend (npm run dev on :4000).`,
        },
        { status: 503 }
      );
    }

    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as {
        response?: { status?: number; data?: unknown };
      };
      return NextResponse.json(
        axiosError.response?.data ?? { error: 'Login failed' },
        { status: axiosError.response?.status || 500 }
      );
    }

    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
