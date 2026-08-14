import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import { getDoctorToken, proxyError, unauthorized } from '@/lib/bff-auth';
import { APPOINTMENT_ENDPOINTS } from '@/integration/appointments/endpoints';
import { USER_TYPE_HEADER } from '@/lib/constants';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getDoctorToken();
    if (!token) return unauthorized();

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const endpoint = APPOINTMENT_ENDPOINTS.SHARE_CONSULTATION_PLAN.replace(
      ':appointmentId',
      id
    );
    const body = await request.json().catch(() => ({}));

    const response = await backendApiClient.post(endpoint, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...USER_TYPE_HEADER,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return proxyError(error, 'Failed to send treatment plan');
  }
}
