import useSearchPatientQuery from '@/integration/patient/queries/useSearchAssignedPatientQuery';
import { PatientSearchParams } from '@/integration/patient/type';
import useUser from '../use-user';

const useSearchPatient = (params: PatientSearchParams) => {
  const { userId } = useUser();
  const { data, isLoading, error } = useSearchPatientQuery({
    ...params,
    assistantId: userId || '',
  });

  return {
    patients: data?.docs || [],
    pagination: data
      ? {
          page: data.page,
          limit: data.limit,
          total: data.totalDocs,
          totalPages: data.totalPages,
        }
      : undefined,
    isLoading,
    error,
  };
};

export default useSearchPatient;
