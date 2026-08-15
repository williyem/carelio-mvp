import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ErrorMessage from '@/components/ui/error-message';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FullNameSvg from '@/assets/icons/full-name-svg';
import DateOfBirthSvg from '@/assets/icons/date-of-birth-svg';
import GenderIconSvg from '@/assets/icons/gender-icon-svg';
import EmailIconSvg from '@/assets/icons/email-icon-svg';
import PhoneNumberSvg from '@/assets/icons/phone-number-svg';
import BloodTypeSvg from '@/assets/icons/blood-type-svg';

import {
  AddPatientFormData,
  BLOOD_TYPE_OPTIONS,
  GENDER_OPTIONS,
  useAddPatientForm,
} from '@/hooks/page-hooks/use-add-patient';
import { Controller } from 'react-hook-form';

const PatientRegistrationContent = ({
  submitButtonText = 'Add Patient',
  onSubmit,
  isLoading,
}: {
  submitButtonText?: string;
  onSubmit: (data: AddPatientFormData) => void | Promise<void>;
  isLoading?: boolean;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    control,
    isPending,
  } = useAddPatientForm({ onSubmit: onSubmit, isPending: isLoading });

  return (
    <>
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
            <div className="relative w-full">
              <Input
                id="dateOfBirth"
                type="text"
                placeholder="dd/mm/yyyy"
                // icon={<CalendarSvg />}
                className="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
                disabled={isPending}
                {...register('dateOfBirth')}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <DateOfBirthSvg stroke="#80898E" />
              </div>
            </div>
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
                    <SelectTrigger className=" bg-transparent border-(--border-light) h-[44px] data-placeholder:text-(--text-muted) data-placeholder:font-light rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] border  text-(--text-primary) focus:ring-2 focus:ring-primary focus:ring-offset-2">
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
              // icon={<InputEmailSvg />}
              disabled={isPending}
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
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="e.g., 02330303000303"
              className="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
              // icon={<PhoneSvg />}
              disabled={isPending}
              {...register('phoneNumber')}
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
                    <SelectTrigger className=" bg-transparent border-(--border-light) data-placeholder:text-(--text-muted) data-placeholder:font-light data-placeholder:sm:text-[14px] leading-[16px] h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] border  text-(--text-primary) focus:ring-2 focus:ring-primary focus:ring-offset-2">
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
    </>
  );
};

export default PatientRegistrationContent;
