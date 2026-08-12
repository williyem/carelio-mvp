import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';

import { cookies } from 'next/headers';
import { healthAssistantAccessToken } from '@/lib/constants';
import { API_BASE_URL } from '@/integration/config';

/**
 * GET /api/auth/health-assistant/patient/search
 * Proxy endpoint for searching patients
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(healthAssistantAccessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    const response = await backendApiClient.get(`${API_BASE_URL}/patients`, {
      params: {
        search,
        page,
        limit,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Search patient error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        { error: 'Search patient failed', details: axiosError.response?.data },
        { status: axiosError.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
