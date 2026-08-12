import { useQuery } from '@tanstack/react-query';
import { getAssignedPatients } from '../api-function';
import { PATIENT_QUERY_KEYS } from '../query-keys';
import type { GetAssignedPatientsParams } from '../type';

export const useGetAssignedPatients = (params?: GetAssignedPatientsParams) => {
  return useQuery({
    queryKey: [PATIENT_QUERY_KEYS.ASSIGNED_PATIENTS, params],
    queryFn: () => getAssignedPatients(params),
  });
};
