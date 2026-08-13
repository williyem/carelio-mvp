import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  doctorAccessToken,
  doctorCookieObj,
  doctorRefreshToken,
  doctorTempToken,
} from '@/lib/constants';
import { isDummyDataEnabled } from '@/lib/dummy-data/config';
import { getLoginResponse, validateLogin } from '@/lib/dummy-data/loader';
import { backendApiClient, API_BASE_URL } from '@/integration/config';
import { DOCTOR_ENDPOINTS } from '@/integration/auth/doctor/endpoints';
import type { DoctorLoginRequest } from '@/integration/auth/doctor/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();

    // Dummy data login with email/password
    if (isDummyDataEnabled() && body.email && body.password) {
      const { email, password } = body as DoctorLoginRequest;

      if (!validateLogin(email, password)) {
        return NextResponse.json(
          { message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const loginResponse = getLoginResponse();
      const userData = JSON.stringify({
        id: loginResponse.user.id,
        email: loginResponse.user.email,
        firstName: loginResponse.user.firstName,
        lastName: loginResponse.user.lastName,
        phoneNumber: loginResponse.user.phoneNumber,
      });

      cookieStore.set(doctorAccessToken, loginResponse.tokenData.access.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      cookieStore.set(
        doctorRefreshToken,
        loginResponse.tokenData.refresh.token,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
        }
      );

      cookieStore.set(doctorCookieObj, userData, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      return NextResponse.json(loginResponse);
    }

    // Real backend login proxy
    if (!isDummyDataEnabled() && body.email && body.password) {
      const response = await backendApiClient.post(
        DOCTOR_ENDPOINTS.LOGIN,
        body
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
          phoneNumber: string;
        };
      };

      if (loginResponse.tokenData && loginResponse.user) {
        const userData = JSON.stringify({
          id: loginResponse.user.id,
          email: loginResponse.user.email,
          firstName: loginResponse.user.firstName,
          lastName: loginResponse.user.lastName,
          phoneNumber: loginResponse.user.phoneNumber,
        });

        cookieStore.set(
          doctorAccessToken,
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
          doctorRefreshToken,
          loginResponse.tokenData.refresh.token,
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
          }
        );

        cookieStore.set(doctorCookieObj, userData, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
      }

      return NextResponse.json(loginResponse);
    }

    // Cookie sync after direct backend login, or temp tokens for 2FA / reset
    const { accessToken, refreshToken, resetToken, user } = body as {
      accessToken?: string;
      refreshToken?: string;
      resetToken?: string;
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
      };
    };

    if (resetToken) {
      cookieStore.set(doctorTempToken, resetToken, {
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
      cookieStore.set(doctorAccessToken, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      cookieStore.set(doctorRefreshToken, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
      if (user) {
        cookieStore.set(doctorCookieObj, JSON.stringify(user), {
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
      cookieStore.set(doctorTempToken, accessToken, {
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
    console.error('Login route error:', error);

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'ECONNREFUSED'
    ) {
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
