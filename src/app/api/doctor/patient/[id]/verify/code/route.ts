import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';
import { cookies } from 'next/headers';
import { doctorAccessToken, USER_TYPE_HEADER } from '@/lib/constants';
import { HEALTH_ASSISTANT_ENDPOINTS } from '@/integration/health-assistant/endpoints';
import type {
  VerifyPatientResponse,
  VerifyPatientCodeRequest,
} from '@/integration/health-assistant/types';

/**
 * POST /api/health-assistant/patient/[id]/verify/code
 * Proxy endpoint for verifying patient code
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(doctorAccessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: patientId } = await params;

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    const body: VerifyPatientCodeRequest = await request.json();

    if (!body.code) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    const endpoint = HEALTH_ASSISTANT_ENDPOINTS.VERIFY_PATIENT_CODE.replace(
      ':id',
      patientId
    );

    const response = await backendApiClient.post<VerifyPatientResponse>(
      endpoint,
      { code: body.code, type: body.type },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...USER_TYPE_HEADER,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Verify patient code error:', error);

    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data: unknown };
      };
      return NextResponse.json(
        {
          error: 'Verify patient code failed',
          details: axiosError.response?.data,
        },
        { status: axiosError.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
