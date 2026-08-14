import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient, API_BASE_URL } from '@/integration/config';
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from '@/integration/auth/doctor/types';

/**
 * POST /api/auth/doctor/forgot-password
 * Proxy endpoint for forgot password
 */
export async function POST(request: NextRequest) {
  try {
    const body: ForgotPasswordRequest = await request.json();

    const response = await backendApiClient.post<ForgotPasswordResponse>(
      `${API_BASE_URL}/auth/doctor/forgot-password`,
      body
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Forgot password error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        { error: 'Request failed', details: axiosError.response?.data },
        { status: axiosError.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
