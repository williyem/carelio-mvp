import { useMutation } from '@tanstack/react-query';
import {
  invitePatient,
  getPatientConsultationToken,
  submitConsentForm,
  submitConsentAgreement,
} from './api-function';
import type { InvitePatientRequest } from './type';

export const useInvitePatient = () => {
  return useMutation({
    mutationFn: (data: InvitePatientRequest) => invitePatient(data),
  });
};

const usePatientMutations = () => {
  const getPatientConsultationTokenMutation = useMutation({
    mutationFn: getPatientConsultationToken,
  });
  const submitConsentFormMutation = useMutation({
    mutationFn: submitConsentForm,
  });
  const submitConsentAgreementMutation = useMutation({
    mutationFn: submitConsentAgreement,
  });
  return {
    getPatientConsultationTokenMutation,
    submitConsentFormMutation,
    submitConsentAgreementMutation,
  };
};

export default usePatientMutations;
