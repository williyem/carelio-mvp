import { backendApiClient, API_BASE_URL } from '@/integration/config';
import { NextResponse } from 'next/server';
import { setPatientSessionCookies } from '../session-cookies';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const response = await backendApiClient.post(
      `${API_BASE_URL}/auth/patient/verify-login-email`,
      body
    );
    await setPatientSessionCookies(response.data);
    return NextResponse.json(response.data);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as {
        response?: { status?: number; data?: unknown };
      };
      return NextResponse.json(
        axiosError.response?.data ?? { error: 'Verification failed' },
        { status: axiosError.response?.status || 500 }
      );
    }
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
