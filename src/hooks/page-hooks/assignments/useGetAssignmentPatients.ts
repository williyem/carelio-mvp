import { useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import useGetAllPatientsQuery from '@/integration/patient/queries/useGetAllPatientsQuery';
import { PatientSearchParams } from '@/integration/patient/type';
import {
  mapAssignedPatientsToAppointmentRows,
  extractSearchParams,
  createSearchParams,
} from '@/lib/easy';
import { AppointmentRow } from '@/types/appointment.types';

interface UseGetAssignmentPatientsReturn {
  appointments: AppointmentRow[];
  totalPatients: number;
  isLoading: boolean;
  error: unknown;
  search: string;
  page: number;
  limit: number;
  handleSearchChange: (value: string) => void;
}

const useGetAssignmentPatients = (): UseGetAssignmentPatientsReturn => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { search, page, limit } = useMemo(
    () => extractSearchParams(searchParams),
    [searchParams]
  );

  const queryParams: PatientSearchParams = useMemo(
    () => ({ search, page, limit }),
    [search, page, limit]
  );

  const { data, isLoading, error } = useGetAllPatientsQuery(queryParams);

  const appointments = useMemo(() => {
    if (!data?.docs) return [];
    return mapAssignedPatientsToAppointmentRows(data.docs);
  }, [data]);

  const totalPatients = data?.totalDocs || 0;

  const handleSearchChange = useCallback(
    (value: string) => {
      const params = createSearchParams(searchParams, value);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  return {
    appointments,
    totalPatients,
    isLoading,
    error,
    search,
    page,
    limit,
    handleSearchChange,
  };
};

export default useGetAssignmentPatients;
