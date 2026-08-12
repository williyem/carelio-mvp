import {
  patientAccessToken,
  patientCookieObj,
  patientRefreshToken,
} from '@/lib/constants';
import { isDummyDataEnabled } from '@/lib/dummy-data/config';
import { backendApiClient, API_BASE_URL } from '@/integration/config';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();

    // Dummy patient ID login
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

    // Real backend patient login
    if (!isDummyDataEnabled() && body.patientId && !body.accessToken) {
      const response = await backendApiClient.post(
        `${API_BASE_URL}/auth/patient/login`,
        { patientId: body.patientId }
      );
      return NextResponse.json(response.data);
    }

    // Set cookies from tokens (post-login cookie step)
    const { accessToken, refreshToken, id } = body;
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
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
