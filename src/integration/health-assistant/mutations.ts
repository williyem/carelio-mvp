import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  assignHealthAssistant,
  registerPatient,
  verifyPatientEmail,
  verifyPatientCode,
} from './api-functions';

const useHealthAssistantMutations = () => {
  const queryClient = useQueryClient();

  const registerPatientMutation = useMutation({
    mutationFn: registerPatient,
  });

  const assignHealthAssistantMutation = useMutation({
    mutationFn: assignHealthAssistant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient'] });
    },
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
    assignHealthAssistantMutation,
    verifyPatientEmailMutation,
    verifyPatientCodeMutation,
  };
};

export default useHealthAssistantMutations;
