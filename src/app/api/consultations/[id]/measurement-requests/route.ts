import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import {
  consultationAuthHeaders,
  getConsultationAccessToken,
} from '@/lib/consultation-bff-auth';
import { proxyError, unauthorized } from '@/lib/bff-auth';

type RouteParams = { params: Promise<{ id: string }> };

async function proxyConsultation(
  appointmentId: string,
  init: { method: string; path: string; body?: unknown }
) {
  const token = await getConsultationAccessToken();
  if (!token) return unauthorized();

  const response = await backendApiClient.request({
    url: `/consultations/${appointmentId}${init.path}`,
    method: init.method,
    data: init.body,
    headers: consultationAuthHeaders(token),
  });
  return NextResponse.json(response.data);
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    return proxyConsultation(id, {
      method: 'GET',
      path: '/measurement-requests',
    });
  } catch (error) {
    return proxyError(error, 'Failed to load measurement requests');
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    return proxyConsultation(id, {
      method: 'POST',
      path: '/measurement-requests',
      body,
    });
  } catch (error) {
    return proxyError(error, 'Failed to confirm measurement requests');
  }
}
