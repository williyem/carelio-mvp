import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import { cookies } from 'next/headers';
import {
  healthAssistantAccessToken,
  healthAssistantRefreshToken,
} from '@/lib/constants';
import { HEALTH_ASSISTANT_ENDPOINTS } from '@/integration/auth/health-assistant/endpoints';
import { API_BASE_URL } from '@/integration/config';

/**
 * POST /api/auth/health-assistant/logout
 * Proxy endpoint for logout
 */
export async function POST(request: NextRequest) {
  try {
    // Get access token from cookie
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(healthAssistantAccessToken)?.value;

    if (accessToken) {
      // Call backend logout
      await backendApiClient.post(
        `${API_BASE_URL}${HEALTH_ASSISTANT_ENDPOINTS.LOGOUT}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    }

    // Clear cookies
    cookieStore.delete(healthAssistantAccessToken);
    cookieStore.delete(healthAssistantRefreshToken);

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error: unknown) {
    console.error('Logout error:', error);

    // Clear cookies even if backend call fails
    const cookieStore = await cookies();
    cookieStore.delete(healthAssistantAccessToken);
    cookieStore.delete(healthAssistantRefreshToken);

    return NextResponse.json({ message: 'Logged out successfully' });
  }
}
