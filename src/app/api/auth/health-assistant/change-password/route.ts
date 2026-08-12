import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';

import { cookies } from 'next/headers';
import { healthAssistantAccessToken } from '@/lib/constants';
import { HEALTH_ASSISTANT_ENDPOINTS } from '@/integration/auth/health-assistant/endpoints';
import { API_BASE_URL } from '@/integration/config';
import {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from '@/integration/auth/health-assistant';

/**
 * POST /api/auth/health-assistant/change-password
 * Proxy endpoint for changing password
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(healthAssistantAccessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ChangePasswordRequest = await request.json();

    const response = await backendApiClient.post<ChangePasswordResponse>(
      `${API_BASE_URL}${HEALTH_ASSISTANT_ENDPOINTS.CHANGE_PASSWORD}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Change password error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        { error: 'Change password failed', details: axiosError.response?.data },
        { status: axiosError.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
