'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import ErrorMessage from '@/components/ui/error-message';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import useGetHealthAssistantsQuery from '@/integration/health-assistant/queries/useGetHealthAssistantsQuery';
import { Spinner } from '@/components/ui/spinner';

interface MedicalAssistantAssignmentProps {
  onAssign: (clinicianId: string) => void | Promise<void>;
  isSubmitting?: boolean;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  currentAssistantId?: string;
  currentAssistantName?: string;
}

const assignmentSchema = z.object({
  clinicianId: z.string().min(1, 'Please select a medical assistant'),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

const MedicalAssistantAssignment = ({
  onAssign,
  isSubmitting = false,
  title = 'Assign Medical Assistant',
  subtitle = 'Assign a medical assistant to patient.',
  buttonText = 'Confirm Reassignment',
  currentAssistantId,
  currentAssistantName,
}: MedicalAssistantAssignmentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: clinicians = [], isLoading } = useGetHealthAssistantsQuery();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    mode: 'onChange',
    defaultValues: {
      clinicianId: '',
    },
  });

  const selectedClinicianId = watch('clinicianId');

  const onSubmit = async (data: AssignmentFormData) => {
    await onAssign(data.clinicianId);
  };

  const selectedClinician = clinicians.find(
    (c) => c.id === selectedClinicianId
  );

  return (
    <div className="flex flex-col gap-[36px] items-start w-full">
      <div className="flex flex-col gap-[40px] items-start w-full">
        <div className="flex flex-col gap-[2px] items-start">
          <h2 className="font-bold leading-[20px] text-(--text-dark) text-[16px]">
            {title}
          </h2>
          <p className="font-normal leading-[20px] text-(--text-gray) text-[14px]">
            {subtitle}
          </p>
          {currentAssistantName && (
            <p className="font-medium leading-[20px] text-(--text-blue) text-[14px] mt-2">
              Current Assistant:{' '}
              <span className="text-(--text-dark)">{currentAssistantName}</span>
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-2 items-start w-full"
        >
          <Label
            htmlFor="clinician-select"
            className="font-medium leading-[20px] text-(--text-label) text-[14px]"
          >
            Select Medical Assistant
          </Label>
          <Controller
            name="clinicianId"
            control={control}
            render={({ field }) => (
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    id="clinician-select"
                    className={cn(
                      'bg-(--bg-white) border border-(--border-light) flex gap-2 items-center justify-between px-[14px] py-[10px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] w-full h-[44px] text-left hover:bg-gray-50 transition-colors',
                      errors.clinicianId && 'border-destructive'
                    )}
                  >
                    <span
                      className={cn(
                        'flex-1 font-normal leading-[24px] text-[14px]',
                        selectedClinician
                          ? 'text-(--text-primary)'
                          : 'text-(--text-placeholder)'
                      )}
                    >
                      {selectedClinician
                        ? selectedClinician.name
                        : 'Select a Medical Assistant'}
                    </span>
                    <ChevronDown className="w-6 h-6 text-(--text-primary) shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className=" w-(--radix-popover-trigger-width) max-sm:max-w-[293px] p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Search medical assistant..." />
                    <CommandList className="max-h-none overflow-visible">
                      <ScrollArea
                        className="h-[200px]"
                        onWheel={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                      >
                        {isLoading ? (
                          <CommandEmpty>Loading...</CommandEmpty>
                        ) : clinicians.length === 0 ? (
                          <CommandEmpty>
                            No medical assistants found.
                          </CommandEmpty>
                        ) : (
                          <CommandGroup>
                            {clinicians.map((clinician) => (
                              <CommandItem
                                key={clinician.id}
                                value={`${clinician.name} ${clinician.email}`}
                                onSelect={() => {
                                  if (clinician.id !== currentAssistantId) {
                                    field.onChange(clinician.id);
                                    setIsOpen(false);
                                  }
                                }}
                                className={cn(
                                  'flex items-center gap-2',
                                  clinician.id === currentAssistantId &&
                                    'opacity-50 cursor-not-allowed select-none'
                                )}
                              >
                                {clinician.id === currentAssistantId ? (
                                  <Check
                                    className={cn(
                                      'w-4 h-4',
                                      field.value === clinician.id
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                ) : (
                                  <Check
                                    className={cn(
                                      'w-4 h-4',
                                      field.value === clinician.id
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                )}
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-normal">
                                      {clinician.name}
                                    </span>
                                    {clinician.id === currentAssistantId && (
                                      <span className="text-[10px] bg-(--bg-info) text-(--text-blue) px-1.5 py-0.5 rounded-full font-medium">
                                        Current
                                      </span>
                                    )}
                                  </div>
                                  {clinician.specialization && (
                                    <span className="text-xs text-(--text-muted)">
                                      {clinician.specialization}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </ScrollArea>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          />
          <ErrorMessage message={errors.clinicianId?.message} />
        </form>
      </div>

      <Button
        type="button"
        onClick={handleSubmit(onSubmit)}
        variant="brand"
        disabled={isSubmitting || !!errors.clinicianId}
        className="w-full h-[50px] rounded-[8px] px-4 py-4 text-[14px] font-bold leading-[20px]"
      >
        {isSubmitting ? <Spinner /> : buttonText}
      </Button>
    </div>
  );
};

export default MedicalAssistantAssignment;
