import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import {
  consultationAuthHeaders,
  getConsultationAccessToken,
} from '@/lib/consultation-bff-auth';
import { proxyError, unauthorized } from '@/lib/bff-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const token = await getConsultationAccessToken();
    if (!token) return unauthorized();

    const { appointmentId } = await params;
    const body = await request.json();

    const response = await backendApiClient.post(
      `/vitals/appointment/${appointmentId}/confirm`,
      body,
      { headers: consultationAuthHeaders(token) }
    );
    return NextResponse.json(response.data);
  } catch (error) {
    return proxyError(error, 'Failed to confirm vitals');
  }
}
