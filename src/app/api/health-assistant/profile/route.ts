import { NextResponse } from 'next/server';
import axios from 'axios';
import { API_BASE_URL } from '@/integration/config';
import { cookies } from 'next/headers';
import {
  healthAssistantAccessToken,
  healthAssistantRefreshToken,
  healthAssistantCookieObj,
} from '@/lib/constants';
import { HEALTH_ASSISTANT_API_ENDPOINTS } from '@/integration/health-assistant/endpoints';

export async function GET() {
  const cookieStore = await cookies();

  const clearAuthCookies = () => {
    cookieStore.delete(healthAssistantAccessToken);
    cookieStore.delete(healthAssistantRefreshToken);
    cookieStore.delete(healthAssistantCookieObj);
  };

  try {
    const token = cookieStore.get(healthAssistantAccessToken)?.value;

    if (!token) {
      clearAuthCookies();
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await axios.get(
      `${API_BASE_URL}${HEALTH_ASSISTANT_API_ENDPOINTS.PROFILE}`,
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

    const status = axiosError?.response?.status || 500;

    if (status === 401) {
      clearAuthCookies();
    }

    return NextResponse.json(
      {
        error:
          axiosError?.response?.data?.message ||
          axiosError?.response?.data?.error ||
          'Failed to fetch doctor profile',
        details: axiosError?.response?.data,
      },
      { status }
    );
  }
}
