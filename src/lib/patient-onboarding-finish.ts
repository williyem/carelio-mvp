import { buildPatientAgreementFiles } from '@/lib/patient-agreement-pdf';
import { uploadFile } from '@/integration/files/api-function';
import { completeRegistration } from '@/integration/auth/patient/api-functions';
import { submitConsentAgreement } from '@/integration/patient/api-function';
import type { BloodType, Gender } from '@/integration/auth/patient/types';
import { extractResponseData } from '@/integration/utils';

export type PatientOnboardingDemographics = {
  fullName?: string;
  dateOfBirth?: Date | string | null;
  dob?: string | null;
  gender?: string;
  phoneNumber?: string;
  phone?: string;
  address?: string;
  email?: string;
  bloodType?: string;
  patientSignature?: string;
  insuranceCompany?: string;
  memberId?: string;
  printedName?: string;
  date?: string;
};

export function toPatientIsoDob(
  value: Date | string | null | undefined
): string {
  if (!value) return '';
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? ''
      : value.toISOString().slice(0, 10);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? String(value)
    : parsed.toISOString().slice(0, 10);
}

function pdfInputFromForm(formData: PatientOnboardingDemographics) {
  const name = formData.printedName || formData.fullName || 'Patient';
  return {
    name,
    date: formData.date || new Date().toLocaleDateString('en-CA'),
    phone: formData.phoneNumber || formData.phone || '',
    email: formData.email || '',
    address: formData.address || '',
    insuranceCompany: formData.insuranceCompany || '',
    memberId: formData.memberId || '',
    signatureDataUrl: formData.patientSignature || undefined,
  };
}

export async function uploadPatientAgreementPdfs(
  formData: PatientOnboardingDemographics
) {
  const { signed, template } = await buildPatientAgreementFiles(
    pdfInputFromForm(formData)
  );
  const [signedUpload, templateUpload] = await Promise.all([
    uploadFile(signed),
    uploadFile(template),
  ]);
  return {
    signatureUrl: signedUpload.url,
    documentUrl: templateUpload.url,
  };
}

/** Invite / register: completeRegistration → Carelio PDF → consent/agree */
export async function finishInvitePatientRegistration(
  token: string,
  formData: PatientOnboardingDemographics
) {
  const dob =
    toPatientIsoDob(formData.dateOfBirth) ||
    toPatientIsoDob(formData.dob) ||
    '';

  const registrationResponse = await completeRegistration({
    token,
    fullName: formData.fullName || formData.printedName || '',
    dob,
    gender: (formData.gender || 'other') as Gender,
    phoneNumber: formData.phoneNumber || formData.phone || '',
    address: formData.address || '',
    bloodType: (formData.bloodType || 'O+') as BloodType,
    email: formData.email || undefined,
  });
  const registration = extractResponseData(registrationResponse);

  const { signatureUrl, documentUrl } =
    await uploadPatientAgreementPdfs(formData);

  await submitConsentAgreement({
    token,
    agreements: [
      {
        type: 'consent',
        signatureUrl,
        documentUrl,
      },
    ],
  });

  return registration;
}
