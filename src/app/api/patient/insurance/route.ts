import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import {
  authHeaders,
  getPatientToken,
  proxyError,
  unauthorized,
} from '@/lib/bff-auth';

export async function GET() {
  try {
    const token = await getPatientToken();
    if (!token) return unauthorized();
    const response = await backendApiClient.get('/patients/me/insurance', {
      headers: authHeaders(token),
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return proxyError(error, 'Failed to load insurance');
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getPatientToken();
    if (!token) return unauthorized();
    const body = await request.json();
    const response = await backendApiClient.post(
      '/patients/me/insurance',
      body,
      { headers: authHeaders(token) }
    );
    return NextResponse.json(response.data);
  } catch (error) {
    return proxyError(error, 'Failed to add insurance');
  }
}
