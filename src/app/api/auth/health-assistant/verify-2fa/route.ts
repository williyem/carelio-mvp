import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import axios from 'axios';
import { API_BASE_URL } from '@/integration/config';
import { HEALTH_ASSISTANT_ENDPOINTS } from '@/integration/auth/health-assistant/endpoints';
import {
  healthAssistantAccessToken,
  healthAssistantCookieObj,
  healthAssistantRefreshToken,
  healthAssistantTempToken,
} from '@/lib/constants';

/**
 * POST /api/auth/health-assistant/verify-2fa
 * Proxy endpoint for verifying 2FA
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const cookieStore = await cookies();
    const token = cookieStore.get(healthAssistantTempToken)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await axios.post(
      `${API_BASE_URL}${HEALTH_ASSISTANT_ENDPOINTS.VERIFY_2FA}`,
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
    });

    // Set permanent cookies after successful 2FA verification
    (await cookieStore).set(healthAssistantAccessToken, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    (await cookieStore).set(healthAssistantRefreshToken, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    (await cookies()).set(healthAssistantCookieObj, userData, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // Clear temporary token after successful verification
    cookieStore.delete(healthAssistantTempToken);

    return NextResponse.json({ message: 'Success' });
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
