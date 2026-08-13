import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import {
  authHeaders,
  getDoctorToken,
  proxyError,
  unauthorized,
} from '@/lib/bff-auth';

export async function GET() {
  try {
    const token = await getDoctorToken();
    if (!token) return unauthorized();
    const response = await backendApiClient.get('/doctor/billing', {
      headers: authHeaders(token),
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return proxyError(error, 'Failed to load billing');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await getDoctorToken();
    if (!token) return unauthorized();
    const body = await request.json();
    const response = await backendApiClient.patch('/doctor/billing', body, {
      headers: authHeaders(token),
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return proxyError(error, 'Failed to save billing');
  }
}
