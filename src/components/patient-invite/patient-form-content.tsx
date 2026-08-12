import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import ErrorMessage from '@/components/ui/error-message';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import FullNameSvg from '@/assets/icons/full-name-svg';
import DateOfBirthSvg from '@/assets/icons/date-of-birth-svg';
import GenderIconSvg from '@/assets/icons/gender-icon-svg';
import EmailIconSvg from '@/assets/icons/email-icon-svg';
import PhoneNumberSvg from '@/assets/icons/phone-number-svg';
import BloodTypeSvg from '@/assets/icons/blood-type-svg';
import {
  useAddPatientForm,
  AddPatientFormData,
} from '@/hooks/page-hooks/use-add-patient';
import { Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const BLOOD_TYPE_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

interface PatientFormContentProps {
  submitButtonText?: string;
  onSubmit: (data: AddPatientFormData) => void | Promise<void>;
  isPending?: boolean;
  resetRef?: React.MutableRefObject<(() => void) | null>;
  hideEmail?: boolean;
  defaultValues?: Partial<AddPatientFormData>;
  disabledFields?: {
    email?: boolean;
    phoneNumber?: boolean;
  };
}

const PatientFormContent = ({
  submitButtonText = 'Add Patient',
  onSubmit,
  isPending: externalIsPending,
  resetRef,
  hideEmail = false,
  defaultValues,
  disabledFields,
}: PatientFormContentProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    control,
    reset,
    isPending: hookIsPending,
  } = useAddPatientForm({
    onSubmit,
    optionalEmail: hideEmail,
    defaultValues,
  });

  useEffect(() => {
    if (resetRef) {
      resetRef.current = reset;
    }
  }, [resetRef, reset]);

  const isPending = externalIsPending ?? hookIsPending;
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 items-start w-full"
    >
      {/* Full Name */}
      <div className="flex flex-col items-start w-full">
        <div className="flex flex-col gap-2 items-start w-full">
          <Label
            htmlFor="fullName"
            className="text-[12px] leading-[16px] font-medium text-sm flex items-center gap-2"
          >
            <FullNameSvg />
            Full Name
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter full name"
            className="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
            disabled={isPending}
            {...register('fullName')}
          />
          <ErrorMessage message={errors.fullName?.message} />
        </div>
      </div>

      {/* Date of Birth */}
      <div className="flex flex-col items-start w-full">
        <div className="flex flex-col gap-2 items-start w-full">
          <Label
            htmlFor="dateOfBirth"
            className="text-[12px] leading-[16px] font-medium text-sm flex items-center gap-2"
          >
            <DateOfBirthSvg />
            Date of Birth
          </Label>
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={isPending}
                    className={cn(
                      'bg-transparent border border-(--border-light) flex gap-2 items-center justify-between px-[14px] py-[10px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] w-full h-[44px] text-left hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
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
                    disabled={(date: Date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date > today;
                    }}
                    captionLayout="dropdown"
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          <ErrorMessage message={errors.dateOfBirth?.message} />
        </div>
      </div>

      {/* Gender */}
      <div className="flex flex-col items-start w-full">
        <div className="flex flex-col gap-2 items-start w-full">
          <Label
            htmlFor="gender"
            className="text-[12px] leading-[16px] font-medium text-sm flex items-center gap-2"
          >
            <GenderIconSvg />
            Gender
          </Label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <div className="relative w-full">
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger className=" bg-transparent border-(--border-light) h-[44px] data-placeholder:text-[#262626]/60 data-placeholder:font-light rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] border  text-(--text-primary) focus:ring-2 focus:ring-primary focus:ring-offset-2">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />
          <ErrorMessage message={errors.gender?.message} />
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col items-start w-full">
        <div className="flex flex-col gap-2 items-start w-full">
          <Label
            htmlFor="email"
            className="text-[12px] leading-[16px] font-medium text-sm flex items-center gap-2"
          >
            <EmailIconSvg />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="example@gmail.com"
            className="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
            disabled={isPending || disabledFields?.email}
            {...register('email')}
          />
          <ErrorMessage message={errors.email?.message} />
        </div>
      </div>

      {/* Phone Number */}
      <div className="flex flex-col items-start w-full">
        <div className="flex flex-col gap-2 items-start w-full">
          <Label
            htmlFor="phoneNumber"
            className="text-[12px] leading-[16px] font-medium text-sm flex items-center gap-2"
          >
            <PhoneNumberSvg />
            Phone Number
          </Label>
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <PhoneInput
                defaultCountry="US"
                value={field.value || ''}
                disabled={isPending || disabledFields?.phoneNumber}
                onChange={field.onChange}
                placeholder="+1 (555) 000-0000"
                className="w-full"
                inputClassName="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
                countryButtonClassName="bg-transparent border-(--border-light) hover:bg-transparent"
              />
            )}
          />
          <ErrorMessage message={errors.phoneNumber?.message} />
        </div>
      </div>

      {/* Address */}
      <div className="flex flex-col items-start w-full">
        <div className="flex flex-col gap-2 items-start w-full">
          <Label
            htmlFor="address"
            className="text-[12px] leading-[16px] font-medium text-sm"
          >
            Address
          </Label>
          <Input
            id="address"
            type="text"
            placeholder="Enter your address"
            // icon={<MapPin className="w-4 h-4" />}
            className="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
            disabled={isPending}
            {...register('address')}
          />
          <ErrorMessage message={errors.address?.message} />
        </div>
      </div>

      {/* Blood Type (Optional) */}
      <div className="flex flex-col items-start w-full">
        <div className="flex flex-col gap-2 items-start w-full">
          <Label
            htmlFor="bloodType"
            className="text-[12px] leading-[16px] font-medium text-sm flex items-center gap-2"
          >
            <BloodTypeSvg />
            Blood Type (Optional)
          </Label>
          <Controller
            name="bloodType"
            control={control}
            render={({ field }) => (
              <div className="relative w-full">
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger className=" bg-transparent border-(--border-light) data-placeholder:text-[#262626]/60 data-placeholder:font-light data-placeholder:sm:text-[14px] leading-[16px] h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] border  text-(--text-primary) focus:ring-2 focus:ring-primary focus:ring-offset-2">
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />
          <ErrorMessage message={errors.bloodType?.message} />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="brand"
        className="w-full h-[50px] rounded-[8px] px-4 py-[17px] text-[16px] font-bold leading-[16px] mt-2"
        disabled={isPending || !isValid}
      >
        {isPending ? <Spinner /> : submitButtonText}
      </Button>
    </form>
  );
};

export default PatientFormContent;
