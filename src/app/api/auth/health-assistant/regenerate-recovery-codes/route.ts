import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import type {
  RegenerateRecoveryCodesRequest,
  RegenerateRecoveryCodesResponse,
} from '@/integration/auth/health-assistant/types.ts';
import { cookies } from 'next/headers';
import { healthAssistantAccessToken } from '@/lib/constants';
import { HEALTH_ASSISTANT_ENDPOINTS } from '@/integration/auth/health-assistant/endpoints';
import { API_BASE_URL } from '@/integration/config';

/**
 * POST /api/auth/health-assistant/regenerate-recovery-codes
 * Proxy endpoint for regenerating recovery codes
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(healthAssistantAccessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: RegenerateRecoveryCodesRequest = await request.json();

    const response =
      await backendApiClient.post<RegenerateRecoveryCodesResponse>(
        `${API_BASE_URL}${HEALTH_ASSISTANT_ENDPOINTS.REGENERATE_RECOVERY_CODES}`,
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
