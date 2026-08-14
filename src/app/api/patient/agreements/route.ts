import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import {
  authHeaders,
  getPatientToken,
  proxyError,
  unauthorized,
} from '@/lib/bff-auth';

export async function POST(request: NextRequest) {
  try {
    const token = await getPatientToken();
    if (!token) return unauthorized();
    const body = await request.json();
    const response = await backendApiClient.post(
      '/patients/me/agreements',
      body,
      {
        headers: authHeaders(token),
      }
    );
    return NextResponse.json(response.data);
  } catch (error) {
    return proxyError(error, 'Failed to save agreements');
  }
}
