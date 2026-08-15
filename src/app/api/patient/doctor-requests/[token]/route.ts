import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import { PATIENT_ENDPOINTS } from '@/integration/patient/endpoints';
import { proxyError } from '@/lib/bff-auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const endpoint = PATIENT_ENDPOINTS.GET_DOCTOR_ACCESS_REQUEST.replace(
      ':token',
      token
    );
    const response = await backendApiClient.get(endpoint);
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    return proxyError(error, 'Failed to load doctor access request');
  }
}
