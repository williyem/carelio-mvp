'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ErrorMessage from '@/components/ui/error-message';
import PasscodeSvg from '@/assets/icons/passcode-svg';
import LogoSvgMd from '@/assets/icons/logo-svg-md';
import { usePatientLoginForm } from '@/hooks/page-hooks/use-patient-login';
import { Spinner } from '../ui/spinner';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const PatientLoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    isPending,
    showPassword,
    setShowPassword,
    pendingPatientId,
    otpRegister,
    handleOtpSubmit,
    otpFormState,
  } = usePatientLoginForm();

  return (
    <section className="flex flex-col h-full items-center justify-center px-4 w-full">
      <form
        onSubmit={pendingPatientId ? handleOtpSubmit : handleSubmit}
        className="flex flex-col gap-[26px] items-start w-full max-w-[420px]"
      >
        <div className="w-full  mx-auto flex items-center justify-center lg:hidden">
          <LogoSvgMd />
        </div>
        <h1 className="font-bold leading-[1.2] text-(--text-primary) text-[24px] w-full hide-below-lg">
          {pendingPatientId ? 'Verify your email' : 'Login'}
        </h1>

        {pendingPatientId ? (
          <div className="flex flex-col gap-2 items-start w-full">
            <Label
              htmlFor="otp"
              className="text-[12px] leading-[16px] text-(--text-muted)"
            >
              Email code
            </Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              placeholder="6-digit code"
              disabled={isPending}
              {...otpRegister('otp')}
            />
            <ErrorMessage message={otpFormState.errors.otp?.message} />
          </div>
        ) : (
          <div className="flex flex-col gap-6 items-start w-full">
            <div className="flex flex-col gap-2 items-start w-full">
              <Label
                htmlFor="identifier"
                className="text-[12px] leading-[16px] text-(--text-muted)"
              >
                Patient ID or email
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder="PAT-1001 or you@email.com"
                icon={
                  <span className="text-(--text-muted)">
                    <PasscodeSvg />
                  </span>
                }
                disabled={isPending}
                {...register('identifier')}
              />
              <ErrorMessage message={errors.identifier?.message} />
            </div>
            <div className="flex flex-col gap-2 items-start w-full relative">
              <Label
                htmlFor="password"
                className="text-[12px] leading-[16px] text-(--text-muted)"
              >
                Password
              </Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                disabled={isPending}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-(--text-muted)"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              <ErrorMessage message={errors.password?.message} />
            </div>
            <Link
              href="/forgot-password?role=patient"
              className="text-sm text-gray-600 hover:text-brand-blue hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        )}

        <Button
          type="submit"
          variant="brand"
          className="w-full h-[50px] rounded-[8px] px-4 py-[17px] text-[16px] font-bold leading-[16px]"
          disabled={
            isPending || (pendingPatientId ? !otpFormState.isValid : !isValid)
          }
        >
          {isPending ? <Spinner /> : pendingPatientId ? 'Verify' : 'Login'}
        </Button>
      </form>
    </section>
  );
};

export default PatientLoginForm;
