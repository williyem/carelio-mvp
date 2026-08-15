import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import {
  authHeaders,
  getDoctorToken,
  proxyError,
  unauthorized,
} from '@/lib/bff-auth';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const token = await getDoctorToken();
    if (!token) return unauthorized();

    const response = await backendApiClient.get(
      `/consultations/${id}/ai/summary`,
      { headers: authHeaders(token) }
    );
    return NextResponse.json(response.data);
  } catch (error) {
    return proxyError(error, 'Failed to load visit AI summary');
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const token = await getDoctorToken();
    if (!token) return unauthorized();

    let body: { regenerate?: boolean } = {};
    try {
      body = (await request.json()) as { regenerate?: boolean };
    } catch {
      body = {};
    }

    const response = await backendApiClient.post(
      `/consultations/${id}/ai/summary`,
      body,
      { headers: authHeaders(token) }
    );
    return NextResponse.json(response.data);
  } catch (error) {
    return proxyError(error, 'Failed to generate visit AI summary');
  }
}
