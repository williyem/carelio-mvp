import { cookies } from 'next/headers';
import {
  patientAccessToken,
  patientCookieObj,
  patientRefreshToken,
} from '@/lib/constants';

type LoginPayload = {
  tokenData?: {
    access: { token: string };
    refresh: { token: string };
  };
  user?: {
    id: string;
    patientId?: string;
  };
};

export async function setPatientSessionCookies(loginResponse: LoginPayload) {
  if (!loginResponse.tokenData || !loginResponse.user) return;
  const cookieStore = await cookies();
  cookieStore.set(patientAccessToken, loginResponse.tokenData.access.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  cookieStore.set(patientRefreshToken, loginResponse.tokenData.refresh.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
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
