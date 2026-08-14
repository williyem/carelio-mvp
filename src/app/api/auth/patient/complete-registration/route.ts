import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import type {
  CompleteRegistrationRequest,
  CompleteRegistrationResponse,
} from '@/integration/auth/patient/types';
import {
  patientAccessToken,
  patientCookieObj,
  patientRefreshToken,
} from '@/lib/constants';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/patient/complete-registration
 */
export async function POST(request: NextRequest) {
  try {
    const body: CompleteRegistrationRequest = await request.json();

    const response = await backendApiClient.post<CompleteRegistrationResponse>(
      '/auth/patient/complete-registration',
      body
    );

    const data = response.data;
    const cookieStore = await cookies();

    cookieStore.set(patientAccessToken, data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    cookieStore.set(patientRefreshToken, data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    cookieStore.set(
      patientCookieObj,
      JSON.stringify({
        id: data.user.id,
        patientId: data.user.patientId,
      }),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      }
    );

    return NextResponse.json({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  } catch (error: unknown) {
    console.error('Complete registration error:', error);

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
