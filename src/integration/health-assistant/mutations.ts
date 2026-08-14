import { useMutation } from '@tanstack/react-query';
import {
  registerPatient,
  verifyPatientEmail,
  verifyPatientCode,
} from './api-functions';

const useHealthAssistantMutations = () => {
  const registerPatientMutation = useMutation({
    mutationFn: registerPatient,
  });

  const verifyPatientEmailMutation = useMutation({
    mutationFn: verifyPatientEmail,
  });

  const verifyPatientCodeMutation = useMutation({
    mutationFn: ({
      patientId,
      code,
      type,
    }: {
      patientId: string;
      code: string;
      type: 'email';
    }) => verifyPatientCode(patientId, code, type),
  });

  return {
    registerPatientMutation,
    verifyPatientEmailMutation,
    verifyPatientCodeMutation,
  };
};

export default useHealthAssistantMutations;
