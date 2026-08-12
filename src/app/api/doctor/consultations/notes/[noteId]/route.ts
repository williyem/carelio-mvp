import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import { cookies } from 'next/headers';
import { doctorAccessToken, USER_TYPE_HEADER } from '@/lib/constants';
import { APPOINTMENT_ENDPOINTS } from '@/integration/appointments/endpoints';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(doctorAccessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { noteId } = await params;

    if (!noteId) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const endpoint = APPOINTMENT_ENDPOINTS.UPDATE_CONSULTATION_NOTE.replace(
      ':noteId',
      noteId
    );

    const response = await backendApiClient.put(endpoint, body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...USER_TYPE_HEADER,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Update consultation note error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        {
          error: 'Update consultation note failed',
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
