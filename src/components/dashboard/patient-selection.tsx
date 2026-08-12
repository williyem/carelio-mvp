'use client';

import * as React from 'react';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSearchPatients } from '@/integration/patient';
import { Patient as IntegrationPatient } from '@/integration/patient/type';
import { useDebounce } from '@/hooks/use-debounce';
import RecentConsultationRow from './patients/recent-consultation-row';
import { Patient } from '@/types/patient.types';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface PatientSelectionProps {
  selectedPatient: Patient | null;
  onSelect: (patient: Patient) => void;
}

export function PatientSelection({
  selectedPatient,
  onSelect,
}: PatientSelectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [page, setPage] = React.useState(1);
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Clear patientId from URL when user starts typing
  React.useEffect(() => {
    if (searchQuery.length > 0 && searchParams.get('patientId')) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('patientId');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [searchQuery, searchParams, pathname, router]);

  // Reset page when search query changes
  React.useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  const { data: patientsData, isLoading: isLoadingPatients } =
    useSearchPatients(
      { search: debouncedQuery, limit: 5, page },
      !!debouncedQuery
    );

  const patients = debouncedQuery ? patientsData?.docs || [] : [];
  const totalPages = patientsData?.totalPages || 0;
  const hasNextPage = patientsData?.hasNextPage || false;
  const hasPrevPage = patientsData?.hasPrevPage || false;

  const isWaitingForDebounce = searchQuery && searchQuery !== debouncedQuery;

  const handlePatientSelect = (patient: Patient) => {
    onSelect(patient);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search by patient name or Patient ID..."
          className="h-14 pl-12 rounded-full border-gray-200 text-base"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Select Patient */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">
          Select Patient
        </Label>
        <div className="space-y-3 w-full min-h-[100px]">
          {isLoadingPatients || isWaitingForDebounce ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
            </div>
          ) : patients.length > 0 ? (
            <>
              {patients.map((patient: IntegrationPatient) => (
                <RecentConsultationRow
                  key={patient.id}
                  patient={patient as unknown as Patient}
                  selectedPatient={selectedPatient}
                  handlePatientSelect={handlePatientSelect}
                />
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-xs text-gray-500">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={!hasPrevPage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={!hasNextPage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : selectedPatient && !debouncedQuery ? (
            <RecentConsultationRow
              patient={selectedPatient}
              selectedPatient={selectedPatient}
              handlePatientSelect={handlePatientSelect}
            />
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              {debouncedQuery
                ? 'No patients found.'
                : 'Start typing to search for patients.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
