import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient, API_BASE_URL } from '@/integration/config';

/**
 * POST /api/auth/staff/complete-invite
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await backendApiClient.post(
      `${API_BASE_URL}/auth/staff/complete-invite`,
      body
    );
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Complete staff invite error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        {
          error: 'Could not complete invite',
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
