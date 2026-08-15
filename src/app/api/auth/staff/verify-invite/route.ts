import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient, API_BASE_URL } from '@/integration/config';

/**
 * GET /api/auth/staff/verify-invite
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const role = searchParams.get('role');

    if (!token || !role) {
      return NextResponse.json(
        { error: 'token and role are required' },
        { status: 400 }
      );
    }

    const response = await backendApiClient.get(
      `${API_BASE_URL}/auth/staff/verify-invite`,
      { params: { token, role } }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Verify staff invite error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        {
          error: 'Verification failed',
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
