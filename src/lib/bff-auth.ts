import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  doctorAccessToken,
  healthAssistantAccessToken,
  patientAccessToken,
  USER_TYPE_HEADER,
} from '@/lib/constants';

export async function getAnyAccessToken() {
  const store = await cookies();
  return (
    store.get(doctorAccessToken)?.value ||
    store.get(healthAssistantAccessToken)?.value ||
    store.get(patientAccessToken)?.value ||
    null
  );
}

export async function getDoctorToken() {
  const store = await cookies();
  return store.get(doctorAccessToken)?.value || null;
}

export async function getHaToken() {
  const store = await cookies();
  return store.get(healthAssistantAccessToken)?.value || null;
}

export async function getPatientToken() {
  const store = await cookies();
  return store.get(patientAccessToken)?.value || null;
}

export function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    ...USER_TYPE_HEADER,
  };
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function proxyError(error: unknown, fallback: string) {
  const axiosError = error as {
    response?: { status?: number; data?: { message?: string } };
  };
  return NextResponse.json(
    {
      error: fallback,
      message: axiosError.response?.data?.message || fallback,
      details: axiosError.response?.data,
    },
    { status: axiosError.response?.status || 500 }
  );
}
