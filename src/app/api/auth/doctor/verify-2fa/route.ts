import {
  doctorAccessToken,
  doctorCookieObj,
  doctorRefreshToken,
  doctorTempToken,
} from '@/lib/constants';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import axios from 'axios';
import { API_BASE_URL } from '@/integration/config';
import { DOCTOR_ENDPOINTS } from '@/integration/auth/doctor/endpoints';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const cookieStore = await cookies();
    const token = cookieStore.get(doctorTempToken)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await axios.post(
      `${API_BASE_URL}${DOCTOR_ENDPOINTS.VERIFY_2FA}`,
      { code: body.code, token },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    const data = response.data;
    const accessToken = data?.tokenData?.access?.token;
    const refreshToken = data?.tokenData?.refresh?.token;
    const userId = data?.user?.id;

    if (!accessToken || !refreshToken || !userId) {
      return NextResponse.json(
        { error: 'Invalid response from server' },
        { status: 500 }
      );
    }

    const userData = JSON.stringify({
      id: userId,
      email: data?.user?.email,
      firstName: data?.user?.firstName,
      lastName: data?.user?.lastName,
      phoneNumber: data?.user?.phoneNumber,
    });

    // Set permanent cookies after successful 2FA verification
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

    (await cookies()).set(doctorCookieObj, userData, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // Clear temporary token after successful verification
    cookieStore.delete(doctorTempToken);

    return NextResponse.json({
      success: true,
      message: '2FA verified successfully',
    });
  } catch (error: unknown) {
    console.error('Verify 2FA error:', error);
    const axiosError = error as {
      response?: { status: number; data: { message?: string; error?: string } };
    };
    return NextResponse.json(
      {
        error:
          axiosError?.response?.data?.message ||
          axiosError?.response?.data?.error ||
          '2FA verification failed',
        details: axiosError?.response?.data,
      },
      { status: axiosError?.response?.status || 500 }
    );
  }
}
