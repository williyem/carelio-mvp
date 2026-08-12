'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ErrorMessage from '@/components/ui/error-message';
import PasscodeSvg from '@/assets/icons/passcode-svg';
import { useRouter } from 'nextjs-toploader/app';
import { ROUTES } from '@/lib/routes';
import LogoSvgMd from '@/assets/icons/logo-svg-md';

const healthAssistantLoginSchema = z.object({
  staffCode: z
    .string()
    .min(1, 'Staff code is required')
    .min(3, 'Staff code must be at least 3 characters')
    .max(50, 'Staff code must be less than 50 characters'),
});

type HealthAssistantLoginFormData = z.infer<typeof healthAssistantLoginSchema>;

interface HealthAssistantLoginFormProps {
  onSubmit?: (data: HealthAssistantLoginFormData) => void | Promise<void>;
  isLoading?: boolean;
}

const HealthAssistantLoginForm = ({
  onSubmit,
  isLoading = false,
}: HealthAssistantLoginFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<HealthAssistantLoginFormData>({
    resolver: zodResolver(healthAssistantLoginSchema),
    mode: 'onChange',
    defaultValues: {
      staffCode: '',
    },
  });

  const router = useRouter();

  const onSubmitForm = async (data: HealthAssistantLoginFormData) => {
    router.push(ROUTES.HEALTH_ASSISTANT.PATIENT.ROOT);

    if (onSubmit) {
      await onSubmit(data);
    } else {
      console.log('Health Assistant login attempt:', data);
    }
  };

  const isFormLoading = isSubmitting || isLoading;

  return (
    <section className="flex flex-col h-full items-center justify-center px-4 w-full">
      <form
        onSubmit={handleSubmit(onSubmitForm)}
        className="flex flex-col gap-[26px] items-start w-full max-w-[420px]"
      >
        <div className="w-full  mx-auto flex items-center justify-center lg:hidden">
          <LogoSvgMd />
        </div>
        <h1 className="font-bold leading-[1.2] text-(--text-primary) text-[24px] w-full hide-below-lg ">
          Login with Staff Code
        </h1>

        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex flex-col items-end justify-center w-full">
            <div className="flex flex-col gap-6 items-start w-full">
              <div className="flex flex-col items-start w-full">
                <div className="flex flex-col gap-2 items-start w-full">
                  <Label
                    htmlFor="staff-code"
                    className="text-[12px] leading-[16px] text-(--text-muted)"
                  >
                    Staff Code
                  </Label>
                  <Input
                    id="staff-code"
                    type="text"
                    placeholder="Enter your staff code"
                    icon={
                      <span className="text-(--text-muted)">
                        <PasscodeSvg />
                      </span>
                    }
                    disabled={isFormLoading}
                    {...register('staffCode')}
                  />
                  <ErrorMessage message={errors.staffCode?.message} />
                </div>
              </div>

              <Button
                type="submit"
                variant="brand"
                className="w-full h-[50px] rounded-[8px] px-4 py-[17px] text-[16px] font-bold leading-[16px]"
                disabled={isFormLoading || !isValid}
              >
                Access System
              </Button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};

export default HealthAssistantLoginForm;
