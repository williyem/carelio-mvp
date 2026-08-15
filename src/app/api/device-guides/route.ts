import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient, API_BASE_URL } from '@/integration/config';
import { cookies } from 'next/headers';
import {
  doctorAccessToken,
  healthAssistantAccessToken,
  patientAccessToken,
} from '@/lib/constants';

async function getAnyStaffOrPatientToken() {
  const cookieStore = await cookies();
  return (
    cookieStore.get(doctorAccessToken)?.value ||
    cookieStore.get(healthAssistantAccessToken)?.value ||
    cookieStore.get(patientAccessToken)?.value ||
    null
  );
}

/**
 * GET /api/device-guides
 */
export async function GET(_request: NextRequest) {
  try {
    const token = await getAnyStaffOrPatientToken();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await backendApiClient.get(
      `${API_BASE_URL}/device-guides`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status: number; data: unknown };
    };
    return NextResponse.json(
      {
        error: 'Failed to fetch device guides',
        details: axiosError.response?.data,
      },
      { status: axiosError.response?.status || 500 }
    );
  }
}
