import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import {
  consultationAuthHeaders,
  getConsultationAccessToken,
} from '@/lib/consultation-bff-auth';
import { proxyError, unauthorized } from '@/lib/bff-auth';
import { APPOINTMENT_ENDPOINTS } from '@/integration/appointments/endpoints';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getConsultationAccessToken();
    if (!token) return unauthorized();

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const endpoint = APPOINTMENT_ENDPOINTS.GET_APPOINTMENT_NOTE.replace(
      ':appointmentId',
      id
    );

    const response = await backendApiClient.get(endpoint, {
      headers: consultationAuthHeaders(token),
    });

    return NextResponse.json(response.data);
  } catch (error) {
    const axiosError = error as {
      response?: { status?: number };
    };
    if (axiosError.response?.status === 404) {
      return NextResponse.json({ data: null });
    }
    return proxyError(error, 'Failed to load consultation note');
  }
}
