'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import VerificationDialogCloseButton from '@/components/dashboard/verification/verification-dialog-close-button';
import { useDoctors } from '@/hooks/page-hooks/useDoctors';
import { requestDoctorAccess } from '@/integration/patient/api-function';
import { getErrorMessage } from '@/integration';
import { cn } from '@/lib/utils';

interface AssignDoctorDialogProps {
  patientId: string;
  patientName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AssignDoctorDialog = ({
  patientId,
  patientName,
  open,
  onOpenChange,
}: AssignDoctorDialogProps) => {
  const [doctorId, setDoctorId] = useState('');
  const { clinicians, isLoading } = useDoctors();

  const mutation = useMutation({
    mutationFn: () => requestDoctorAccess(patientId, doctorId),
  });

  const selected = clinicians.find((doctor) => doctor.id === doctorId);

  const handleSubmit = () => {
    if (!doctorId) return;
    mutation.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(data?.message || 'Approval email sent to the patient', {
          description: data?.doctorName
            ? `${data.doctorName} can cover this visit once booked. Ongoing chart access still needs patient approval.`
            : 'You can book this covering doctor now. Chart access waits on the patient.',
        });
        setDoctorId('');
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(
          getErrorMessage(error, 'Failed to request covering doctor')
        );
      },
    });
  };

  const handleClose = () => {
    setDoctorId('');
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-(--bg-white) rounded-[30px] p-6 max-w-[443px] w-full">
        <VerificationDialogCloseButton onClose={handleClose} />
        <AlertDialogHeader className="items-start text-left p-0 pr-8">
          <AlertDialogTitle className="font-bold leading-[20px] text-(--text-dark) text-[16px]">
            Request covering doctor
          </AlertDialogTitle>
          <AlertDialogDescription className="font-normal leading-[20px] text-(--text-gray) text-[14px] mt-[2px]">
            {patientName
              ? `Ask ${patientName} to approve this covering doctor’s chart access. You can still book an appointment now.`
              : 'The patient will get an email to approve covering-doctor chart access. You can still book an appointment now.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Command className="border border-(--border-stroke) rounded-[12px]">
          <CommandInput placeholder="Search doctors..." />
          <CommandList className="max-h-none overflow-visible">
            <ScrollArea className="h-[220px]">
              {isLoading ? (
                <CommandEmpty>Loading doctors...</CommandEmpty>
              ) : clinicians.length === 0 ? (
                <CommandEmpty>No doctors found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {clinicians.map((doctor) => (
                    <CommandItem
                      key={doctor.id}
                      value={`${doctor.name} ${doctor.email}`}
                      onSelect={() => setDoctorId(doctor.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate">{doctor.name}</span>
                        <span className="text-xs text-(--text-secondary) truncate">
                          {doctor.email}
                        </span>
                      </div>
                      <Check
                        className={cn(
                          'h-4 w-4 shrink-0',
                          doctorId === doctor.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </ScrollArea>
          </CommandList>
        </Command>

        {selected ? (
          <p className="text-sm text-(--text-primary)">
            Selected: {selected.name}
          </p>
        ) : null}

        <Button
          variant="brand"
          disabled={!doctorId || mutation.isPending}
          onClick={handleSubmit}
          className="w-full h-[50px] rounded-[8px]"
        >
          {mutation.isPending ? <Spinner /> : 'Send approval email'}
        </Button>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AssignDoctorDialog;
