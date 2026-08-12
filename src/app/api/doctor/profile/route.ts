import { NextResponse } from 'next/server';
import axios from 'axios';
import { API_BASE_URL } from '@/integration/config';
import { DOCTOR_ENDPOINTS } from '@/integration/doctor/endpoint';
import { cookies } from 'next/headers';
import { doctorAccessToken } from '@/lib/constants';
import { isDummyDataEnabled } from '@/lib/dummy-data/config';
import { getDoctorProfile } from '@/lib/dummy-data/loader';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(doctorAccessToken)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (isDummyDataEnabled()) {
      return NextResponse.json(getDoctorProfile());
    }

    const response = await axios.get(
      `${API_BASE_URL}${DOCTOR_ENDPOINTS.PROFILE}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Get doctor profile error:', error);
    const axiosError = error as {
      response?: { status: number; data: { message?: string; error?: string } };
    };
    return NextResponse.json(
      {
        error:
          axiosError?.response?.data?.message ||
          axiosError?.response?.data?.error ||
          'Failed to fetch doctor profile',
        details: axiosError?.response?.data,
      },
      { status: axiosError?.response?.status || 500 }
    );
  }
}
