import { NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import {
  authHeaders,
  getDoctorToken,
  proxyError,
  unauthorized,
} from '@/lib/bff-auth';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const token = await getDoctorToken();
    if (!token) return unauthorized();

    const response = await backendApiClient.post(
      `/consultations/${id}/ai/summary`,
      {},
      { headers: authHeaders(token) }
    );
    return NextResponse.json(response.data);
  } catch (error) {
    return proxyError(error, 'Failed to generate visit AI summary');
  }
}
