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
    const response = await backendApiClient.get('/patients/me', {
      headers: authHeaders(token),
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return proxyError(error, 'Failed to load profile');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await getPatientToken();
    if (!token) return unauthorized();
    const body = await request.json();
    const response = await backendApiClient.patch('/patients/me', body, {
      headers: authHeaders(token),
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return proxyError(error, 'Failed to update profile');
  }
}
