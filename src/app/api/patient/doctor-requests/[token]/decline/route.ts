import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import { PATIENT_ENDPOINTS } from '@/integration/patient/endpoints';
import { proxyError } from '@/lib/bff-auth';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const endpoint = PATIENT_ENDPOINTS.DECLINE_DOCTOR_ACCESS.replace(
      ':token',
      token
    );
    const response = await backendApiClient.post(endpoint);
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    return proxyError(error, 'Failed to decline doctor access');
  }
}
