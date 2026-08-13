import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import {
  authHeaders,
  getAnyAccessToken,
  proxyError,
  unauthorized,
} from '@/lib/bff-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAnyAccessToken();
    if (!token) return unauthorized();
    const { id } = await params;
    const date = new URL(request.url).searchParams.get('date');
    const response = await backendApiClient.get(`/doctors/${id}/availability`, {
      params: date ? { date } : undefined,
      headers: authHeaders(token),
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return proxyError(error, 'Failed to load availability');
  }
}
