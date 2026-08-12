import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient, API_BASE_URL } from '@/integration/config';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/doctor/logout
 * Proxy endpoint for logout
 */
export async function POST(request: NextRequest) {
  try {
    // Get access token from cookie
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('doctor_access_token')?.value;

    if (accessToken) {
      // Call backend logout
      await backendApiClient.post(
        `${API_BASE_URL}/auth/doctor/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    }

    // Clear cookies
    cookieStore.delete('doctor_access_token');
    cookieStore.delete('doctor_refresh_token');

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error: unknown) {
    console.error('Logout error:', error);

    // Clear cookies even if backend call fails
    const cookieStore = await cookies();
    cookieStore.delete('doctor_access_token');
    cookieStore.delete('doctor_refresh_token');

    return NextResponse.json({ message: 'Logged out successfully' });
  }
}
