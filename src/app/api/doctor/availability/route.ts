import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import {
  authHeaders,
  getDoctorToken,
  proxyError,
  unauthorized,
} from '@/lib/bff-auth';

export async function GET(request: NextRequest) {
  try {
    const token = await getDoctorToken();
    if (!token) return unauthorized();
    const date = new URL(request.url).searchParams.get('date');
    const response = await backendApiClient.get('/doctor/availability', {
      params: date ? { date } : undefined,
      headers: authHeaders(token),
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return proxyError(error, 'Failed to load availability');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = await getDoctorToken();
    if (!token) return unauthorized();
    const body = await request.json();
    const response = await backendApiClient.put('/doctor/availability', body, {
      headers: authHeaders(token),
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return proxyError(error, 'Failed to save availability');
  }
}
