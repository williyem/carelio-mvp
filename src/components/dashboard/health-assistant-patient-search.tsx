'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import PatientSearchResultItem from './patient-search-result-item';
import PatientVerificationDialog from './patient-verification-dialog';
import SearchSvg from '@/assets/icons/search-svg';
import useSearchAssignedPatientsQuery from '@/integration/patient/queries/useSearchAssignedPatientQuery';
import { AssignedPatient } from '@/integration/patient/type';
import { usePatientVerificationStore } from '@/stores/patient-verifcation-store';
import { ROUTES } from '@/lib/routes';
import { useRouter } from 'nextjs-toploader/app';
import useUser from '@/hooks/use-user';
import { Button } from '../ui/button';
import AddPatientSvg from '@/assets/icons/add-patient-svg';
import useGetUpcomingAppointments from '@/integration/appointments/queries/useGetUpcomingAppointments';
import RecentConsultationRow from './recent-consultation-row';
import { UpcomingAppointment } from '@/integration/appointments/types';
import RecentConsultationsSkeleton from '../skeletons/recent-consultations-skeleton';
import AppointmentsEmptyState from '@/components/dashboard/appointments-empty-state';

interface PatientSearchProps {
  placeholder?: string;
  className?: string;
}

const PatientSearch = ({
  placeholder = 'Search patients by name or ID',
  className,
}: PatientSearchProps) => {
  const [searchValue, setSearchValue] = useState('');
  const { userId } = useUser();
  const [showResults, setShowResults] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const debouncedSearch = useDebounce(searchValue, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  const { setSelectedPatient } = usePatientVerificationStore();
  const router = useRouter();
  const { data, isLoading, error } = useSearchAssignedPatientsQuery({
    search: debouncedSearch,
    page: 1,
    limit: 10,
    assistantId: userId,
  });

  const [consultationPage, setConsultationPage] = useState(1);
  const { data: upcomingAppointments, isLoading: isLoadingUpcoming } =
    useGetUpcomingAppointments(userId, consultationPage, 5);

  const results = useMemo(() => {
    if (!data?.docs) return [];
    return data.docs;
  }, [data]);

  const shouldShowResults =
    debouncedSearch && debouncedSearch.trim().length > 0 && showResults;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (patient: AssignedPatient) => {
    setSearchValue(patient.fullName);
    setShowResults(false);

    if (patient.linked) {
      router.push(ROUTES.HEALTH_ASSISTANT.PATIENT.DETAILS(patient.id));
      return;
    }
    setSelectedPatient({
      id: patient.id,
      fullName: patient.fullName || patient.patientId,
      email: patient.email || '',
      linked: patient.linked,
    });
    setShowVerificationDialog(true);
  };

  const handleRecentConsultationSelect = (appointment: UpcomingAppointment) => {
    if (!appointment.patient?.id) return;
    router.push(
      ROUTES.HEALTH_ASSISTANT.PATIENT.DETAILS(appointment.patient.id)
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    if (e.target.value.length > 0) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleAddNewPatient = () => {
    router.push(ROUTES.HEALTH_ASSISTANT.PATIENT.ADD_NEW);
  };

  return (
    <div
      ref={searchRef}
      className={cn(
        'flex flex-col gap-5 items-center w-full max-w-[900px] relative',
        className
      )}
    >
      <div className="flex items-center justify-between w-full">
        <h1 className="font-bold leading-[1.2] text-(--text-primary) max-md:text-[20px] text-[24px] w-full">
          Welcome back
        </h1>
        <div className="flex items-center justify-end w-full">
          <Button
            onClick={handleAddNewPatient}
            className="text-white cursor-pointer h-[44px] border border-brand-blue bg-brand-blue w-[168px] hover:text-gray-50 rounded-full px-6 py-3 font-normal text-sm flex items-center gap-2 transition-colors"
          >
            <div className="relative">
              <AddPatientSvg />
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-brand-blue rounded-full" />
            </div>
            New Patient
          </Button>
        </div>
      </div>

      <div className="relative w-full">
        <Input
          type="text"
          placeholder={placeholder}
          className="h-[50px]! "
          value={searchValue}
          onChange={handleChange}
          icon={<SearchSvg />}
          onFocus={() => {
            if (debouncedSearch && debouncedSearch.trim().length > 0) {
              setShowResults(true);
            }
          }}
        />

        {shouldShowResults && (
          <div className="absolute bg-white border border-(--border-stroke) flex flex-col gap-4 items-start left-0 px-5 py-[23px] rounded-[12px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.12)] animate-in fade-in slide-in-from-top-2 duration-200 space-y-2 top-[calc(100%+8px)] w-full z-50">
            {isLoading ? (
              <div className="p-10 flex flex-col w-full items-center justify-center text-center space-y-3">
                <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
                <p className="text-(--text-secondary) font-medium text-sm">
                  Searching...
                </p>
              </div>
            ) : error ? (
              <div className="p-10 text-center text-sm text-red-500 py-2">
                Error searching patients. Please try again.
              </div>
            ) : results.length > 0 ? (
              results.map((patient) => (
                <PatientSearchResultItem
                  key={patient.id}
                  patient={patient}
                  onClick={handleSelect}
                />
              ))
            ) : (
              <div className="p-12 flex flex-col  w-full items-center justify-center text-center space-y-3">
                <div className="h-12 w-12 rounded-full  flex items-center  justify-center text-gray-400">
                  <Search className="h-6 w-6" />
                </div>
                <p className="text-(--text-primary) text-sm">
                  No patients found
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <PatientVerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        portal="health-assistant"
        onLinked={() => {
          const patient =
            usePatientVerificationStore.getState().selectedPatient;
          if (patient?.id) {
            router.push(ROUTES.HEALTH_ASSISTANT.PATIENT.DETAILS(patient.id));
          }
        }}
      />
      {!shouldShowResults && (
        <div className="w-full flex flex-col gap-4 mt-8">
          <h2 className="text-base font-normal text-gray-900">
            Upcoming Consultation
          </h2>
          <div className="flex flex-col gap-3">
            {isLoadingUpcoming ? (
              <RecentConsultationsSkeleton />
            ) : upcomingAppointments?.docs &&
              upcomingAppointments.docs.length > 0 ? (
              upcomingAppointments.docs.map(
                (appointment: UpcomingAppointment) => (
                  <RecentConsultationRow
                    key={appointment.id}
                    appointment={appointment}
                    handlePatientSelect={handleRecentConsultationSelect}
                  />
                )
              )
            ) : (
              <AppointmentsEmptyState
                title="No upcoming appointments"
                description="No upcoming appointments found."
              />
            )}
          </div>

          {/* Pagination Controls */}
          {(upcomingAppointments?.totalPages ?? 0) > 1 && (
            <div className="flex items-center justify-between pt-2 w-full">
              <p className="text-xs text-gray-500">
                Page {consultationPage} of {upcomingAppointments?.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setConsultationPage((p) => Math.max(1, p - 1))}
                  disabled={!upcomingAppointments?.hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() =>
                    setConsultationPage((p) =>
                      Math.min(upcomingAppointments?.totalPages ?? p, p + 1)
                    )
                  }
                  disabled={!upcomingAppointments?.hasNextPage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientSearch;
