import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, backendApiClient } from '@/integration/config';
import { cookies } from 'next/headers';
import { USER_TYPE_HEADER, doctorAccessToken } from '@/lib/constants';
import { isDummyDataEnabled } from '@/lib/dummy-data/config';
import { getVitalsByAppointment } from '@/lib/dummy-data/loader';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(doctorAccessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appointmentId } = await params;

    if (isDummyDataEnabled()) {
      return NextResponse.json(getVitalsByAppointment(appointmentId));
    }

    const response = await backendApiClient.get(
      `${API_BASE_URL}/vitals/appointment/${appointmentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...USER_TYPE_HEADER,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Get vitals error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        { error: 'Get vitals failed', details: axiosError.response?.data },
        { status: axiosError.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
