import { useMutation } from '@tanstack/react-query';
import {
  getPatientConsultationToken,
  submitConsentForm,
  submitConsentAgreement,
} from './api-function';

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
