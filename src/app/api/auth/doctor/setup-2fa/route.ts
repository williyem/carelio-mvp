/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import { API_BASE_URL } from '@/integration/config';
import { DOCTOR_ENDPOINTS } from '@/integration/auth/doctor/endpoints';
import { doctorTempToken } from '@/lib/constants';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(doctorTempToken)?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}${DOCTOR_ENDPOINTS.SETUP_2FA}`,
      { setupToken: token },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to setup 2FA', details: error?.response?.data },
      { status: error?.response?.status || 500 }
    );
  }
}
