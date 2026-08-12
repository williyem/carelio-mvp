'use client';

import { useRouter } from 'nextjs-toploader/app';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import TimePicker from '@/components/ui/time-picker';
import ErrorMessage from '@/components/ui/error-message';
import BackButton from '@/components/dashboard/back-button';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';

const vitalsSchema = z.object({
  date: z.date({
    error: 'Date is required',
  }),
  time: z.string().min(1, 'Time is required'),
  systolic: z
    .string()
    .min(1, 'Systolic is required')
    .regex(/^\d+$/, 'Systolic must be a number'),
  diastolic: z
    .string()
    .min(1, 'Diastolic is required')
    .regex(/^\d+$/, 'Diastolic must be a number'),
  heartRate: z
    .string()
    .min(1, 'Heart rate is required')
    .regex(/^\d+$/, 'Heart rate must be a number'),
  temperature: z
    .string()
    .min(1, 'Temperature is required')
    .regex(/^\d+(\.\d+)?$/, 'Temperature must be a valid number'),
  respiratoryRate: z
    .string()
    .min(1, 'Respiratory rate is required')
    .regex(/^\d+$/, 'Respiratory rate must be a number'),
  oxygenSaturation: z
    .string()
    .min(1, 'Oxygen saturation is required')
    .regex(/^\d+$/, 'Oxygen saturation must be a number'),
  notes: z.string().optional(),
});

type VitalsFormData = z.infer<typeof vitalsSchema>;

const RecordVitalsPage = () => {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VitalsFormData>({
    resolver: zodResolver(vitalsSchema),
    mode: 'onChange',
    defaultValues: {
      date: undefined,
      time: '',
      systolic: '',
      diastolic: '',
      heartRate: '',
      temperature: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      notes: '',
    },
  });

  const onSubmit = async (data: VitalsFormData) => {
    console.log('Vitals data:', data);
    // TODO: Implement actual API call to save vitals
  };

  const handleBack = () => {
    router.push(ROUTES.PATIENT.ROOT);
  };

  // Prevent past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="flex flex-col gap-[15px] items-start pt-4 sm:pt-10 px-4 sm:px-0 w-full max-w-[900px] mx-auto">
      <BackButton onClick={handleBack} />

      <div className="flex flex-col gap-[20px] items-start w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 w-full">
          <h1 className="font-bold leading-[1.2] text-(--text-primary) text-[20px] sm:text-[24px]">
            Vitals Tracker
          </h1>
          <Button
            variant="outline"
            onClick={() => router.push(ROUTES.PATIENT.VITAL_HISTORY)}
            className="border border-(--brand-blue) max-sm:w-full  h-[40px] sm:h-[50px] px-4 sm:py-[10px] rounded-[100px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] text-(--brand-blue-text) hover:bg-white"
          >
            <span className="text-[14px] leading-[1.2] font-normal">
              View Vital History
            </span>
          </Button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-[20px] items-start w-full"
        >
          {/* Date and Time */}
          <div className="flex gap-[20px] items-start w-full">
            <div className="flex-1 flex flex-col gap-2 items-start">
              <Label className="font-medium leading-[20px] text-(--text-label) text-[14px]">
                Date
              </Label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          'bg-(--bg-white) border border-(--border-light) flex gap-2 items-center justify-between px-[14px] py-[10px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] w-full h-[48px] text-left hover:bg-gray-50 transition-colors',
                          !field.value && 'text-(--text-placeholder)'
                        )}
                      >
                        <span className="flex-1 font-normal leading-[24px] text-[14px] text-left">
                          {field.value
                            ? format(field.value, 'dd/MM/yyyy')
                            : 'dd/mm/yyyy'}
                        </span>
                        <CalendarIcon className="w-[14px] h-[14px] text-(--text-secondary) shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date: Date) => date < today}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              <ErrorMessage message={errors.date?.message} />
            </div>

            <div className="flex-1 flex flex-col gap-2 items-start">
              <Label className="font-medium leading-[20px] text-(--text-label) text-[14px]">
                Time
              </Label>
              <TimePicker
                control={control}
                name="time"
                placeholder="Select time"
                selectedDate={undefined}
                ignorePastTimes={false}
              />
              <ErrorMessage message={errors.time?.message} />
            </div>
          </div>

          {/* Blood Pressure */}
          <div className="flex gap-[5px] items-end w-full">
            <div className="flex-1 flex flex-col gap-2 items-start">
              <Label className="font-medium leading-[20px] text-(--text-label) text-[14px]">
                Blood Pressure (mmHg)
              </Label>
              <Controller
                name="systolic"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Systolic"
                    className="h-[48px] bg-white"
                  />
                )}
              />
              <ErrorMessage message={errors.systolic?.message} />
            </div>
            <div className="flex h-[41.688px] items-center justify-center w-[15.989px]">
              <div className="flex-none rotate-20">
                <div className="bg-(--border-gray) h-[44px] w-px" />
              </div>
            </div>
            <div className="flex-1 flex flex-col items-start">
              <div className="h-6" /> {/* Spacer for label */}
              <Controller
                name="diastolic"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Diastolic"
                    className="h-[48px] bg-white"
                  />
                )}
              />
              <ErrorMessage message={errors.diastolic?.message} />
            </div>
          </div>

          {/* Heart Rate */}
          <div className="flex flex-col gap-2 items-start w-full">
            <Label className="font-medium leading-[20px] text-(--text-label) text-[14px]">
              Heart Rate (bpm)
            </Label>
            <Controller
              name="heartRate"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="e.g., 72"
                  className="h-[48px] bg-white"
                />
              )}
            />
            <ErrorMessage message={errors.heartRate?.message} />
          </div>

          {/* Temperature */}
          <div className="flex flex-col gap-2 items-start w-full">
            <Label className="font-medium leading-[20px] text-(--text-label) text-[14px]">
              Temperature (°F)
            </Label>
            <Controller
              name="temperature"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="e.g., 98.6"
                  className="h-[48px] bg-white"
                />
              )}
            />
            <ErrorMessage message={errors.temperature?.message} />
          </div>

          {/* Respiratory Rate */}
          <div className="flex flex-col gap-2 items-start w-full">
            <Label className="font-medium leading-[20px] text-(--text-label) text-[14px]">
              Respiratory Rate (breaths/min)
            </Label>
            <Controller
              name="respiratoryRate"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="e.g., 16"
                  className="h-[48px] bg-white"
                />
              )}
            />
            <ErrorMessage message={errors.respiratoryRate?.message} />
          </div>

          {/* Oxygen Saturation */}
          <div className="flex flex-col gap-2 items-start w-full">
            <Label className="font-medium leading-[20px] text-(--text-label) text-[14px]">
              Oxygen Saturation (%)
            </Label>
            <Controller
              name="oxygenSaturation"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="e.g., 98"
                  className="h-[48px] bg-white"
                />
              )}
            />
            <ErrorMessage message={errors.oxygenSaturation?.message} />
          </div>

          {/* Notes (Optional) */}
          <div className="flex flex-col gap-2 items-start w-full">
            <Label className="font-medium leading-[20px] text-(--text-label) text-[14px]">
              Notes (optional)
            </Label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  placeholder="Any additional observation or symptoms"
                  className="bg-(--bg-white) border border-(--border-light) rounded-[8px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] w-full h-[186px] px-[14px] py-[10px] text-[14px] font-normal leading-[24px] text-(--text-primary) placeholder:text-(--text-placeholder) resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
              )}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="brand"
            disabled={isSubmitting}
            className="w-full h-[50px] rounded-[100px] px-4 py-[10px] text-[14px] font-normal leading-[1.2]"
          >
            {isSubmitting ? 'Recording...' : 'Record Vital'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RecordVitalsPage;
