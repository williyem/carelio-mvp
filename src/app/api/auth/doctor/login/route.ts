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
        `${API_BASE_URL}${DOCTOR_ENDPOINTS.LOGIN}`,
        body
      );
      return NextResponse.json(response.data);
    }

    // Temporary token cookie (2FA / password reset flow)
    const { accessToken, resetToken } = body;

    if (resetToken) {
      cookieStore.set(doctorTempToken, resetToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 10,
      });
    } else if (accessToken) {
      cookieStore.set(doctorTempToken, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 10,
      });
    }

    return NextResponse.json({ message: 'Temporary cookie set successfully!' });
  } catch (error) {
    console.error('Login route error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
