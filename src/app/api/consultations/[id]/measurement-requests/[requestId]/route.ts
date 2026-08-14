import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import {
  consultationAuthHeaders,
  getConsultationAccessToken,
} from '@/lib/consultation-bff-auth';
import { proxyError, unauthorized } from '@/lib/bff-auth';

type RouteParams = {
  params: Promise<{ id: string; requestId: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, requestId } = await params;
    const token = await getConsultationAccessToken();
    if (!token) return unauthorized();

    const body = await request.json();
    const response = await backendApiClient.patch(
      `/consultations/${id}/measurement-requests/${requestId}`,
      body,
      { headers: consultationAuthHeaders(token) }
    );
    return NextResponse.json(response.data);
  } catch (error) {
    return proxyError(error, 'Failed to update measurement request');
  }
}
