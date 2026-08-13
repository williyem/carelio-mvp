import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, backendApiClient } from '@/integration/config';
import { cookies } from 'next/headers';
import { patientAccessToken } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(patientAccessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const patientId = request.nextUrl.searchParams.get('patientId');
    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId is required' },
        { status: 400 }
      );
    }

    const page = request.nextUrl.searchParams.get('page') ?? '1';
    const limit = request.nextUrl.searchParams.get('limit') ?? '20';
    const status = request.nextUrl.searchParams.get('status');

    const query = new URLSearchParams({ page, limit });
    if (status) query.set('status', status);

    const response = await backendApiClient.get(
      `${API_BASE_URL}/patients/${patientId}/appointments?${query.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Patient get appointments error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        {
          error: 'Failed to fetch appointments',
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
