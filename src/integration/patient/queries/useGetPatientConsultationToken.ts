import { useQuery } from '@tanstack/react-query';
import { getPatientConsultationToken } from '../api-function';
import { PATIENT_QUERY_KEYS } from '../query-keys';

export const useGetPatientConsultationTokenQuery = (patientId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: PATIENT_QUERY_KEYS.GET_PATIENT_CONSULTATION_TOKEN(patientId),
    queryFn: () => getPatientConsultationToken(patientId),
    enabled: !!patientId,
  });

  return {
    data,
    isLoading,
    error,
  };
};
