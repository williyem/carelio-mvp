import { useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import useGetAssignedPatientsQuery from '@/integration/patient/queries/useGetAssignedPatientsQuery';
import useGetUnassignedPatientsQuery from '@/integration/patient/queries/useGetUnassignedPatientsQuery';
import useGetAllPatientsQuery from '@/integration/patient/queries/useGetAllPatientsQuery';
import { PatientSearchParams } from '@/integration/patient/type';
import {
  mapAssignedPatientsToAppointmentRows,
  extractSearchParams,
  createSearchParams,
} from '@/lib/easy';
import { AppointmentRow } from '@/types/appointment.types';

interface UseGetAssignmentPatientsArgs {
  assistantId?: string;
  showUnassigned?: boolean;
}

interface UseGetAssignmentPatientsReturn {
  // Data
  appointments: AppointmentRow[];
  totalPatients: number;
  isLoading: boolean;
  error: unknown;
  // URL params
  search: string;
  page: number;
  limit: number;
  // Handlers
  handleSearchChange: (value: string) => void;
}

const useGetAssignmentPatients = ({
  assistantId,
  showUnassigned,
}: UseGetAssignmentPatientsArgs = {}): UseGetAssignmentPatientsReturn => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Extract URL params with defaults
  const { search, page, limit } = useMemo(
    () => extractSearchParams(searchParams),
    [searchParams]
  );

  // Query params for API
  const queryParams: PatientSearchParams = useMemo(
    () => ({ search, page, limit }),
    [search, page, limit]
  );

  // Conditional queries
  const allPatientsQuery = useGetAllPatientsQuery({
    ...queryParams,
    enabled: !assistantId && !showUnassigned,
  });

  const assignedQuery = useGetAssignedPatientsQuery({
    ...queryParams,
    assistantId: assistantId!,
  });

  const unassignedQuery = useGetUnassignedPatientsQuery({
    ...queryParams,
    enabled: !!showUnassigned,
  });

  // Determine which data to use
  let data, isLoading, error;

  if (showUnassigned) {
    ({ data, isLoading, error } = unassignedQuery);
  } else if (assistantId) {
    ({ data, isLoading, error } = assignedQuery);
  } else {
    ({ data, isLoading, error } = allPatientsQuery);
  }

  // Transform data
  const appointments = useMemo(() => {
    if (!data?.docs) return [];
    return mapAssignedPatientsToAppointmentRows(data.docs);
  }, [data]);

  const totalPatients = useMemo(() => {
    return data?.totalDocs || 0;
  }, [data]);

  // Handle search change
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
