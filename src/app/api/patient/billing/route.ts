import { NextResponse } from 'next/server';
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
    const response = await backendApiClient.get('/patients/me/billing', {
      headers: authHeaders(token),
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return proxyError(error, 'Failed to load billing');
  }
}
