import { useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useSearchPatients } from '@/integration/patient';
import {
  mapAssignedPatientsToAppointmentRows,
  extractSearchParams,
  createSearchParams,
} from '@/lib/easy';
import { AppointmentRow } from '@/types/appointment.types';

interface UseGetDoctorPatientsReturn {
  patients: AppointmentRow[];
  totalPatients: number;
  isLoading: boolean;
  error: unknown;
  search: string;
  page: number;
  limit: number;
  handleSearchChange: (value: string) => void;
}

const useGetDoctorPatients = (): UseGetDoctorPatientsReturn => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { search, page, limit } = useMemo(
    () => extractSearchParams(searchParams),
    [searchParams]
  );

  const { data, isLoading, error } = useSearchPatients({
    search,
    page,
    limit,
  });

  const patients = useMemo(() => {
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
    patients,
    totalPatients,
    isLoading,
    error,
    search,
    page,
    limit,
    handleSearchChange,
  };
};

export default useGetDoctorPatients;
