import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient, API_BASE_URL } from '@/integration/config';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/patient/logout
 * Proxy endpoint for logout
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('patient_access_token')?.value;

    if (accessToken) {
      await backendApiClient.post(
        `${API_BASE_URL}/auth/patient/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    }

    // Clear cookies
    cookieStore.delete('patient_access_token');
    cookieStore.delete('patient_refresh_token');

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error: unknown) {
    console.error('Logout error:', error);

    // Clear cookies even if backend call fails
    const cookieStore = await cookies();
    cookieStore.delete('patient_access_token');
    cookieStore.delete('patient_refresh_token');

    return NextResponse.json({ message: 'Logged out successfully' });
  }
}
