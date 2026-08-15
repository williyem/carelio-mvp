import { NextResponse } from 'next/server';
import axios from 'axios';
import { API_BASE_URL } from '@/integration/config';
import { DOCTOR_ENDPOINTS } from '@/integration/doctor/endpoint';
import { cookies } from 'next/headers';
import { doctorAccessToken } from '@/lib/constants';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(doctorAccessToken)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(doctorAccessToken)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const response = await axios.patch(
      `${API_BASE_URL}${DOCTOR_ENDPOINTS.PROFILE}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status: number; data: unknown };
    };
    return NextResponse.json(
      {
        error: 'Failed to update profile',
        details: axiosError?.response?.data,
      },
      { status: axiosError?.response?.status || 500 }
    );
  }
}
