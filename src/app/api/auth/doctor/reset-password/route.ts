import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient, API_BASE_URL } from '@/integration/config';
import type {
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '@/integration/auth/doctor/types';
import { cookies } from 'next/headers';
import {
  doctorTempToken,
  doctorAccessToken,
  doctorRefreshToken,
  doctorCookieObj,
} from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body: ResetPasswordRequest = await request.json();
    const cookieStore = await cookies();
    const token = cookieStore.get(doctorTempToken)?.value;

    const response = await backendApiClient.post<ResetPasswordResponse>(
      `${API_BASE_URL}/auth/doctor/reset-password`,
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
      res.cookies.set(doctorAccessToken, data.tokenData.access.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      if (data.tokenData.refresh?.token) {
        res.cookies.set(doctorRefreshToken, data.tokenData.refresh.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
        });
      }
      if (data.user) {
        res.cookies.set(doctorCookieObj, JSON.stringify(data.user), {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
      }
      res.cookies.delete(doctorTempToken);
    } else if (data.requiresSetup && data.setupToken) {
      res.cookies.set(doctorTempToken, data.setupToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 10,
      });
    } else {
      res.cookies.delete(doctorTempToken);
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
