import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient, API_BASE_URL } from '@/integration/config';
import type { VerifyInvitationResponse } from '@/integration/auth/patient/types';

/**
 * GET /api/auth/patient/verify-invitation
 * Proxy endpoint for verifying invitation token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const response = await backendApiClient.get<VerifyInvitationResponse>(
      `${API_BASE_URL}/auth/patient/verify-invitation`,
      {
        params: { token },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Verify invitation error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        { error: 'Verification failed', details: axiosError.response?.data },
        { status: axiosError.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
