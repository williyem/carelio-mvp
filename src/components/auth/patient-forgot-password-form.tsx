'use client';

import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, Hash, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ErrorMessage from '@/components/ui/error-message';
import { Spinner } from '@/components/ui/spinner';
import { usePatientForgotPasswordForm } from '@/hooks/page-hooks/use-patient-forgot-password';

export default function PatientForgotPasswordForm() {
  const {
    step,
    showPassword,
    setShowPassword,
    isPending,
    identifierRegister,
    handleIdentifierSubmit,
    identifierFormState,
    otpRegister,
    handleOtpSubmit,
    otpFormState,
    passwordRegister,
    handlePasswordSubmit,
    passwordFormState,
  } = usePatientForgotPasswordForm();

  const title =
    step === 'identifier'
      ? 'Forgot Your Password?'
      : step === 'otp'
        ? 'Enter the code'
        : 'Set a new password';

  const description =
    step === 'identifier'
      ? 'Enter your Patient ID or email. If an account exists, we will send a code to the email on file.'
      : step === 'otp'
        ? 'Enter the 6-digit code we sent to your email.'
        : 'Choose a password with at least 8 characters.';

  const onSubmit =
    step === 'identifier'
      ? handleIdentifierSubmit
      : step === 'otp'
        ? handleOtpSubmit
        : handlePasswordSubmit;

  const isValid =
    step === 'identifier'
      ? identifierFormState.isValid
      : step === 'otp'
        ? otpFormState.isValid
        : passwordFormState.isValid;

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="w-full text-left space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <form className="w-full grid gap-4" onSubmit={onSubmit}>
        {step === 'identifier' && (
          <div className="grid gap-2">
            <Label
              htmlFor="identifier"
              className="text-(--text-muted) font-normal"
            >
              Patient ID or email
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-muted)" />
              <Input
                id="identifier"
                type="text"
                placeholder="PAT-1001 or you@email.com"
                className="pl-9 placeholder:text-(--text-muted)"
                disabled={isPending}
                {...identifierRegister('identifier')}
              />
            </div>
            <ErrorMessage
              message={identifierFormState.errors.identifier?.message}
            />
          </div>
        )}

        {step === 'otp' && (
          <div className="grid gap-2">
            <Label htmlFor="otp" className="text-(--text-muted) font-normal">
              Email code
            </Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              placeholder="6-digit code"
              disabled={isPending}
              className="placeholder:text-(--text-muted)"
              {...otpRegister('otp')}
            />
            <ErrorMessage message={otpFormState.errors.otp?.message} />
          </div>
        )}

        {step === 'password' && (
          <>
            <div className="grid gap-2">
              <Label
                htmlFor="password"
                className="text-(--text-muted) font-normal"
              >
                New password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-muted)" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  className="pl-9 placeholder:text-(--text-muted)"
                  disabled={isPending}
                  {...passwordRegister('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-secondary)"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <ErrorMessage
                message={passwordFormState.errors.password?.message}
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="confirmPassword"
                className="text-(--text-muted) font-normal"
              >
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                className="placeholder:text-(--text-muted)"
                disabled={isPending}
                {...passwordRegister('confirmPassword')}
              />
              <ErrorMessage
                message={passwordFormState.errors.confirmPassword?.message}
              />
            </div>
          </>
        )}

        <Button
          disabled={isPending || !isValid}
          type="submit"
          variant="brand"
          className="w-full h-11 rounded-full text-base font-medium mt-2"
        >
          {isPending ? <Spinner /> : 'Continue'}
        </Button>
      </form>

      <Link
        href="/login"
        className="flex items-center gap-2 text-sm text-(--text-secondary) hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to log in
      </Link>
    </div>
  );
}
