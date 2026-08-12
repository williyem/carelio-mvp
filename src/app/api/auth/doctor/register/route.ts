import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient, API_BASE_URL } from '@/integration/config';
import type {
  DoctorRegisterRequest,
  DoctorLoginResponse,
} from '@/integration/auth/doctor/types';
import { cookies } from 'next/headers';
import { doctorAccessToken, doctorRefreshToken } from '@/lib/constants';

/**
 * POST /api/auth/doctor/register
 * Proxy endpoint for doctor registration
 */
export async function POST(request: NextRequest) {
  try {
    const body: DoctorRegisterRequest = await request.json();

    const response = await backendApiClient.post<DoctorLoginResponse>(
      `${API_BASE_URL}/auth/doctor/create`,
      body
    );

    const data = response.data;

    // Set httpOnly cookies
    const cookieStore = await cookies();

    // Check if response has tokenData (2FA not enabled) or requires2FA (2FA enabled)
    if ('tokenData' in data) {
      // 2FA is NOT enabled - set cookies and return user data
      cookieStore.set(doctorAccessToken, data.tokenData.access.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      cookieStore.set(doctorRefreshToken, data.tokenData.refresh.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });

      return NextResponse.json({
        user: data.user,
        requires2FA: false,
      });
    } else if ('requires2FA' in data && data.requires2FA) {
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
    console.error('Doctor register error:', error);

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
