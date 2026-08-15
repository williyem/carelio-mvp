'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useVerifyOtpForm } from '@/hooks/page-hooks/use-verify-otp';
import ErrorMessage from '@/components/ui/error-message';
import { ROUTES } from '@/lib/routes';
import { Spinner } from '@/components/ui/spinner';

function VerifyOtpForm() {
  const {
    handleSubmit,
    setValue,
    otp,
    formState: { errors, isValid },
    email,
    isPending,
    handleResend,
  } = useVerifyOtpForm();

  return (
    <div className="w-full flex flex-col items-center justify-center sm:p-6 bg-(--bg-white) dark:bg-background h-full">
      <div className="w-full max-w-[450px] flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <Link
            href="/dashboard"
            className="transition-opacity hover:opacity-80"
          >
            <Image
              src="/images/carelio-logo.png"
              alt="Carelio"
              width={200}
              height={61}
              className="object-contain"
            />
          </Link>
        </div>

        <div className="w-full text-left space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            OTP Verification
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter the 6-digit code sent to{' '}
            {email ? (
              <strong className="text-brand-blue">{email}</strong>
            ) : (
              <span className="text-muted-foreground">your email</span>
            )}{' '}
            to verify your account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-0 flex flex-col items-center gap-6 w-full"
        >
          <div className="w-full">
            <div className="text-left text-sm text-(--text-muted) mb-2">
              Enter Code
            </div>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) =>
                setValue('otp', value, { shouldValidate: true })
              }
            >
              <InputOTPGroup className="gap-3 w-full justify-between">
                <InputOTPSlot
                  index={0}
                  className="w-12 h-14 border border-(--border-stroke) bg-(--bg-primary) rounded-md text-lg"
                />
                <InputOTPSlot
                  index={1}
                  className="w-12 h-14 border border-(--border-stroke) bg-(--bg-primary) rounded-md text-lg"
                />
                <InputOTPSlot
                  index={2}
                  className="w-12 h-14 border border-(--border-stroke) bg-(--bg-primary) rounded-md text-lg"
                />
                <InputOTPSlot
                  index={3}
                  className="w-12 h-14 border border-(--border-stroke) bg-(--bg-primary) rounded-md text-lg"
                />
                <InputOTPSlot
                  index={4}
                  className="w-12 h-14 border border-(--border-stroke) bg-(--bg-primary) rounded-md text-lg"
                />
                <InputOTPSlot
                  index={5}
                  className="w-12 h-14 border border-(--border-stroke) bg-(--bg-primary) rounded-md text-lg"
                />
              </InputOTPGroup>
            </InputOTP>
            <ErrorMessage message={errors.otp?.message} />
          </div>

          <div className="w-full pt-2">
            <Button
              variant="brand"
              type="submit"
              className="w-full h-11 rounded-full text-base font-medium"
              disabled={!isValid || !email || isPending}
            >
              {isPending ? <Spinner /> : 'Continue'}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Didn&apos;t receive the email?{' '}
            <button
              onClick={handleResend}
              type="button"
              disabled={isPending}
              className="text-brand-blue underline"
            >
              Click to resend
            </button>
          </div>
        </form>

        <Link
          href={ROUTES.AUTH.LOGIN}
          className="flex items-center gap-2 text-sm text-(--text-secondary) hover:text-foreground transition-colors mt-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to log in
        </Link>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex flex-col items-center justify-center sm:p-6 bg-(--bg-white) dark:bg-background h-full">
          <div className="w-full max-w-[500px] flex flex-col items-center gap-6">
            <div className="flex items-center justify-center mb-6">
              <Link
                href="/dashboard"
                className="transition-opacity hover:opacity-80"
              >
                <Image
                  src="/images/carelio-logo.png"
                  alt="Carelio"
                  width={200}
                  height={61}
                  className="object-contain"
                />
              </Link>
            </div>
            <div className="w-full text-left space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                OTP Verification
              </h1>
              <p className="text-muted-foreground text-sm">
                Enter the 6-digit code sent to your email to verify your
                account.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <Spinner />
            </div>
          </div>
        </div>
      }
    >
      <VerifyOtpForm />
    </Suspense>
  );
}
