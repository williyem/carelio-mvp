import { NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import {
  authHeaders,
  getDoctorToken,
  proxyError,
  unauthorized,
} from '@/lib/bff-auth';

export async function proxyAdmin(
  path: string,
  init?: { method?: string; body?: unknown }
) {
  const token = await getDoctorToken();
  if (!token) return unauthorized();

  try {
    const response = await backendApiClient.request({
      url: path,
      method: init?.method || 'GET',
      data: init?.body,
      headers: authHeaders(token),
    });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    return proxyError(error, 'Admin request failed');
  }
}
