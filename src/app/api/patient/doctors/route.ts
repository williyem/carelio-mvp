import { NextResponse } from 'next/server';
import { API_BASE_URL, backendApiClient } from '@/integration/config';
import { cookies } from 'next/headers';
import { patientAccessToken } from '@/lib/constants';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(patientAccessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await backendApiClient.get(`${API_BASE_URL}/doctors`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Patient get doctors error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        {
          error: 'Failed to fetch doctors',
          details: axiosError.response?.data,
        },
        { status: axiosError.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
