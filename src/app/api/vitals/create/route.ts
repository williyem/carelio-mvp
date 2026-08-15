import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import {
  consultationAuthHeaders,
  getConsultationAccessToken,
} from '@/lib/consultation-bff-auth';
import { proxyError, unauthorized } from '@/lib/bff-auth';

export async function POST(request: NextRequest) {
  try {
    const token = await getConsultationAccessToken();
    if (!token) return unauthorized();

    const body = await request.json();
    const response = await backendApiClient.post('/vitals', body, {
      headers: consultationAuthHeaders(token),
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return proxyError(error, 'Failed to record vital');
  }
}
