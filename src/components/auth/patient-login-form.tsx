'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ErrorMessage from '@/components/ui/error-message';
import PasscodeSvg from '@/assets/icons/passcode-svg';
import LogoSvgMd from '@/assets/icons/logo-svg-md';
import { usePatientLoginForm } from '@/hooks/page-hooks/use-patient-login';
import { Spinner } from '../ui/spinner';

const PatientLoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    isPending,
  } = usePatientLoginForm();

  return (
    <section className="flex flex-col h-full items-center justify-center px-4 w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-[26px] items-start w-full max-w-[420px]"
      >
        <div className="w-full  mx-auto flex items-center justify-center lg:hidden">
          <LogoSvgMd />
        </div>
        <h1 className="font-bold leading-[1.2] text-(--text-primary) text-[24px] w-full hide-below-lg">
          Login with Patient ID
        </h1>

        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex flex-col items-end justify-center w-full">
            <div className="flex flex-col gap-6 items-start w-full">
              <div className="flex flex-col items-start w-full">
                <div className="flex flex-col gap-2 items-start w-full">
                  <Label
                    htmlFor="patientId"
                    className="text-[12px] leading-[16px] text-(--text-muted)"
                  >
                    Patient ID
                  </Label>
                  <Input
                    id="patientId"
                    type="text"
                    placeholder="Enter your ID"
                    icon={
                      <span className="text-(--text-muted)">
                        <PasscodeSvg />
                      </span>
                    }
                    disabled={isPending}
                    {...register('patientId')}
                  />
                  <ErrorMessage message={errors.patientId?.message} />
                </div>
              </div>

              <Button
                type="submit"
                variant="brand"
                className="w-full h-[50px] rounded-[8px] px-4 py-[17px] text-[16px] font-bold leading-[16px]"
                disabled={isPending || !isValid}
              >
                {isPending ? <Spinner /> : 'Login'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};

export default PatientLoginForm;
