'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Mail, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForgotPasswordForm } from '@/hooks/page-hooks/use-forgot-password';
import ErrorMessage from '@/components/ui/error-message';
import { Spinner } from '@/components/ui/spinner';
import PatientForgotPasswordForm from '@/components/auth/patient-forgot-password-form';

function StaffForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    isPending,
  } = useForgotPasswordForm();

  return (
    <>
      <div className="w-full text-left space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Forgot Your Password?
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your email account and we will send you a link to reset your
          password
        </p>
      </div>

      <form className="w-full grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-gray-500 font-normal">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="Email"
              required
              className="pl-9 placeholder:text-gray-400"
              disabled={isPending}
              {...register('email')}
            />
          </div>
          <ErrorMessage message={errors.email?.message} />
        </div>

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
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to log in
      </Link>
    </>
  );
}

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const isPatient = searchParams.get('role') === 'patient';

  return isPatient ? (
    <PatientForgotPasswordForm />
  ) : (
    <StaffForgotPasswordForm />
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center sm:p-6 bg-white dark:bg-background h-full">
      <div className="w-full max-w-[400px] flex flex-col items-center gap-6">
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

        <Suspense fallback={<Spinner />}>
          <ForgotPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
