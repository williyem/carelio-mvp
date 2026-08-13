import { NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import {
  authHeaders,
  getPatientToken,
  proxyError,
  unauthorized,
} from '@/lib/bff-auth';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ granteeId: string }> }
) {
  try {
    const token = await getPatientToken();
    if (!token) return unauthorized();
    const { granteeId } = await params;
    const response = await backendApiClient.delete(
      `/patients/me/access-grants/${granteeId}`,
      { headers: authHeaders(token) }
    );
    return NextResponse.json(response.data);
  } catch (error) {
    return proxyError(error, 'Failed to revoke access');
  }
}
