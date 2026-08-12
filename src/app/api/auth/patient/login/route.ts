import {
  patientAccessToken,
  patientCookieObj,
  patientRefreshToken,
} from '@/lib/constants';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { accessToken, refreshToken, id } = await req.json();
    const userData = JSON.stringify({
      id,
    });
    const cookieStore = cookies();

    (await cookieStore).set(patientAccessToken, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    (await cookieStore).set(patientRefreshToken, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    (await cookies()).set(patientCookieObj, userData, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
