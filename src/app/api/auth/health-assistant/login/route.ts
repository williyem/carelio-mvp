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
      return NextResponse.json(response.data);
    }

    const { accessToken, resetToken } = body;

    if (resetToken) {
      cookieStore.set(healthAssistantTempToken, resetToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 10,
      });
    } else if (accessToken) {
      cookieStore.set(healthAssistantTempToken, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 10,
      });
    }

    return NextResponse.json({ message: 'Temporary cookie set successfully!' });
  } catch (error) {
    console.error('Health assistant login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
