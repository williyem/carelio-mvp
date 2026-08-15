import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import { PATIENT_ENDPOINTS } from '@/integration/patient/endpoints';
import {
  authHeaders,
  getHaToken,
  proxyError,
  unauthorized,
} from '@/lib/bff-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getHaToken();
    if (!token) return unauthorized();

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    const body = (await request.json()) as { doctorId?: string };
    if (!body.doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    const endpoint = PATIENT_ENDPOINTS.REQUEST_DOCTOR_ACCESS.replace(':id', id);
    const response = await backendApiClient.post(
      endpoint,
      { doctorId: body.doctorId },
      { headers: authHeaders(token) }
    );

    return NextResponse.json(response.data, { status: 201 });
  } catch (error: unknown) {
    return proxyError(error, 'Failed to request doctor access');
  }
}
