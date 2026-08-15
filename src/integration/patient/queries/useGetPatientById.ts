import { useQuery } from '@tanstack/react-query';
import { PATIENT_QUERY_KEYS } from '../query-keys';
import { getHealthAssistantPatientById, getPatientById } from '../api-function';

type PatientPortal = 'doctor' | 'health-assistant';

const useGetPatientByIdQuery = (
  id: string,
  portal: PatientPortal = 'doctor'
) => {
  const queryKey =
    typeof PATIENT_QUERY_KEYS.GET_PATIENT_BY_ID === 'function'
      ? [...PATIENT_QUERY_KEYS.GET_PATIENT_BY_ID(id), portal]
      : [PATIENT_QUERY_KEYS.PATIENT_BY_ID, id, portal];

  const { data, isLoading, error, isFetching, isError } = useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: () =>
      portal === 'health-assistant'
        ? getHealthAssistantPatientById(id)
        : getPatientById(id),
    enabled: !!id,
    retry: false,
  });

  return {
    patient: data,
    data,
    isLoading,
    isFetching,
    isError,
    error,
  };
};

export const useGetPatientById = (
  id: string,
  enabled = true,
  portal: PatientPortal = 'doctor'
) => {
  return useQuery({
    queryKey:
      typeof PATIENT_QUERY_KEYS.GET_PATIENT_BY_ID === 'function'
        ? [...PATIENT_QUERY_KEYS.GET_PATIENT_BY_ID(id), portal]
        : [PATIENT_QUERY_KEYS.PATIENT_BY_ID, id, portal],
    queryFn: () =>
      portal === 'health-assistant'
        ? getHealthAssistantPatientById(id)
        : getPatientById(id),
    enabled: !!id && enabled,
    retry: false,
  });
};

export default useGetPatientByIdQuery;
