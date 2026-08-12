import { useMemo } from 'react';
import useGetDoctors from '@/integration/health-assistant/queries/useGetDoctors';
import { mapDoctorsToClinicians } from '@/lib/easy';

export const useDoctors = () => {
  const { doctors, isLoading, error } = useGetDoctors();

  const clinicians = useMemo(() => {
    return mapDoctorsToClinicians(doctors);
  }, [doctors]);

  const cliniciansWithSearch = useMemo(() => {
    return clinicians.map((clinician) => ({
      ...clinician,
      searchValue: [
        clinician.firstName,
        clinician.lastName,
        clinician.name,
        clinician.email,
        clinician.phoneNumber,
      ]
        .filter(Boolean)
        .join(' '),
    }));
  }, [clinicians]);

  return {
    clinicians,
    cliniciansWithSearch,
    isLoading,
    error,
  };
};
