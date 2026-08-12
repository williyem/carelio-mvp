import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  doctorAccessToken,
  doctorRefreshToken,
  doctorCookieObj,
  doctorTempToken,
  patientAccessToken,
  patientRefreshToken,
  patientCookieObj,
  healthAssistantAccessToken,
  healthAssistantRefreshToken,
  healthAssistantCookieObj,
  healthAssistantTempToken,
} from '@/lib/constants';

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete(doctorAccessToken);
  cookieStore.delete(doctorRefreshToken);
  cookieStore.delete(doctorCookieObj);
  cookieStore.delete(doctorTempToken);

  cookieStore.delete(healthAssistantAccessToken);
  cookieStore.delete(healthAssistantRefreshToken);
  cookieStore.delete(healthAssistantCookieObj);
  cookieStore.delete(healthAssistantTempToken);

  cookieStore.delete(patientAccessToken);
  cookieStore.delete(patientRefreshToken);
  cookieStore.delete(patientCookieObj);

  return NextResponse.json({ message: 'Cookies cleared' });
}
