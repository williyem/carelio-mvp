import { NextResponse } from 'next/server';
import { API_BASE_URL, backendApiClient } from '@/integration/config';
import { cookies } from 'next/headers';
import { USER_TYPE_HEADER, healthAssistantAccessToken } from '@/lib/constants';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(healthAssistantAccessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await backendApiClient.get(`${API_BASE_URL}/stats`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...USER_TYPE_HEADER,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Get health assistant stats error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        {
          error: 'Failed to fetch health assistant stats',
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
