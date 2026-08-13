import {
  patientAccessToken,
  patientCookieObj,
  patientRefreshToken,
} from '@/lib/constants';
import { isDummyDataEnabled } from '@/lib/dummy-data/config';
import { backendApiClient, API_BASE_URL } from '@/integration/config';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

    if (isDummyDataEnabled() && body.patientId && !body.accessToken) {
      const id = String(body.patientId);
      const accessToken = `dummy-patient-access-${id}`;
      const refreshToken = `dummy-patient-refresh-${id}`;
      const userData = JSON.stringify({ id });

      cookieStore.set(patientAccessToken, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      cookieStore.set(patientRefreshToken, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });

      cookieStore.set(patientCookieObj, userData, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });

      return NextResponse.json({
        user: { id },
        tokenData: {
          access: { token: accessToken },
          refresh: { token: refreshToken },
        },
      });
    }

    if (!isDummyDataEnabled() && body.patientId && !body.accessToken) {
      const response = await backendApiClient.post(
        `${API_BASE_URL}/auth/patient/login`,
        { patientId: body.patientId }
      );
      const loginResponse = response.data as {
        tokenData?: {
          access: { token: string };
          refresh: { token: string };
        };
        user?: {
          id: string;
          patientId?: string;
          [key: string]: unknown;
        };
      };

      if (loginResponse.tokenData && loginResponse.user) {
        cookieStore.set(
          patientAccessToken,
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
          patientRefreshToken,
          loginResponse.tokenData.refresh.token,
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
          }
        );

        cookieStore.set(
          patientCookieObj,
          JSON.stringify({
            id: loginResponse.user.id,
            patientId: loginResponse.user.patientId,
          }),
          {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
          }
        );
      }

      return NextResponse.json(loginResponse);
    }

    const { accessToken, refreshToken, id } = body;
    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: 'accessToken and refreshToken are required' },
        { status: 400 }
      );
    }

    const userData = JSON.stringify({ id });

    cookieStore.set(patientAccessToken, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    cookieStore.set(patientRefreshToken, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    cookieStore.set(patientCookieObj, userData, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    console.error('Patient login error:', error);

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
