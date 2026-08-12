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
import { ROUTES } from '@/lib/routes';

export async function POST(req: Request) {
  const cookieStore = await cookies();

  // Clear all doctor cookies
  cookieStore.delete(doctorAccessToken);
  cookieStore.delete(doctorRefreshToken);
  cookieStore.delete(doctorCookieObj);
  cookieStore.delete(doctorTempToken);

  // Clear all health assistant cookies
  cookieStore.delete(healthAssistantAccessToken);
  cookieStore.delete(healthAssistantRefreshToken);
  cookieStore.delete(healthAssistantCookieObj);
  cookieStore.delete(healthAssistantTempToken);

  // Clear all patient cookies
  cookieStore.delete(patientAccessToken);
  cookieStore.delete(patientRefreshToken);
  cookieStore.delete(patientCookieObj);

  return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, req.url));
}
