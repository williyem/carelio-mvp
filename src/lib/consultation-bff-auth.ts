import { cookies } from 'next/headers';
import {
  doctorAccessToken,
  healthAssistantAccessToken,
  patientAccessToken,
} from '@/lib/constants';

export async function getConsultationAccessToken() {
  const store = await cookies();
  return (
    store.get(doctorAccessToken)?.value ||
    store.get(healthAssistantAccessToken)?.value ||
    store.get(patientAccessToken)?.value ||
    null
  );
}

export function consultationAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}
