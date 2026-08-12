import { useQuery } from '@tanstack/react-query';
import { getAssignedPatients, searchAssignedPatients } from '../api-function';
import { PATIENT_QUERY_KEYS } from '../query-keys';
import type { GetAssignedPatientsParams, PatientSearchParams } from '../type';

export const useGetAssignedPatients = (params?: GetAssignedPatientsParams) => {
  return useQuery({
    queryKey: [PATIENT_QUERY_KEYS.ASSIGNED_PATIENTS, params],
    queryFn: () => getAssignedPatients(params),
  });
};

const useGetAssignedPatientsQuery = (
  params: PatientSearchParams & { assistantId: string }
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: PATIENT_QUERY_KEYS.SEARCH_ASSIGNED_PATIENTS(
      params.search || '',
      params.page || 1,
      params.limit || 10,
      params.assistantId
    ),
    queryFn: () => searchAssignedPatients(params as PatientSearchParams & { assistantId: string }),
    enabled: !!params.assistantId,
  });

  return {
    data,
    isLoading,
    error,
  };
};

export default useGetAssignedPatientsQuery;
