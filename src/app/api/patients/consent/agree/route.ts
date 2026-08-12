import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    console.log('token', token);

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const body = await request.json();
    const { agreements } = body;

    const response = await backendApiClient.post(
      `/patients/consent/agree`,
      {
        agreements,
        token: token,
      },
      {
        params: { token },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Consent agreement submission error:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response: { status: number; data: unknown };
      };
      const status = axiosError.response?.status || 500;
      const data = axiosError.response?.data || {
        message: 'Internal server error',
      };
      return NextResponse.json(data, { status });
    }
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
