import { backendApiClient, API_BASE_URL } from '@/integration/config';
import { NextResponse } from 'next/server';
import { setPatientSessionCookies } from '../session-cookies';

function isConnRefused(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'ECONNREFUSED'
  );
}

function proxyError(error: unknown, fallback: string) {
  console.error(fallback, error);

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
    return NextResponse.json(axiosError.response?.data ?? { error: fallback }, {
      status: axiosError.response?.status || 500,
    });
  }

  return NextResponse.json({ error: fallback }, { status: 500 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if ((body.identifier || body.patientId) && body.password) {
      const response = await backendApiClient.post(
        `${API_BASE_URL}/auth/patient/login`,
        {
          identifier: body.identifier || body.patientId,
          password: body.password,
        }
      );
      const loginResponse = response.data as {
        requiresEmailVerification?: boolean;
        patientId?: string;
        tokenData?: {
          access: { token: string };
          refresh: { token: string };
        };
        user?: { id: string; patientId?: string };
      };

      if (
        !loginResponse.requiresEmailVerification &&
        loginResponse.tokenData &&
        loginResponse.user
      ) {
        await setPatientSessionCookies(loginResponse);
      }

      return NextResponse.json(loginResponse);
    }

    const { accessToken, refreshToken, id } = body;
    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: 'identifier and password are required' },
        { status: 400 }
      );
    }

    await setPatientSessionCookies({
      tokenData: {
        access: { token: accessToken },
        refresh: { token: refreshToken },
      },
      user: { id },
    });

    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    return proxyError(error, 'Login failed');
  }
}
