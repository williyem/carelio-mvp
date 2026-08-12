import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient, API_BASE_URL } from '@/integration/config';
import type {
  RegenerateRecoveryCodesRequest,
  RegenerateRecoveryCodesResponse,
} from '@/integration/auth/doctor/types';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/doctor/regenerate-recovery-codes
 * Proxy endpoint for regenerating recovery codes
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('doctor_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: RegenerateRecoveryCodesRequest = await request.json();

    const response =
      await backendApiClient.post<RegenerateRecoveryCodesResponse>(
        `${API_BASE_URL}/auth/doctor/regenerate-recovery-codes`,
        body,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Regenerate recovery codes error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        {
          error: 'Regenerate recovery codes failed',
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
