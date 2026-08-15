'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirstTimeResetPasswordForm } from '@/hooks/page-hooks/use-first-time-reset-password';
import { Spinner } from '@/components/ui/spinner';
import ErrorMessage from '@/components/ui/error-message';

function FirstTimeResetPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    requirements,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isPending,
  } = useFirstTimeResetPasswordForm();

  return (
    <div className="w-full flex flex-col items-center justify-center sm:p-6 bg-(--bg-white) dark:bg-background h-full">
      <div className="w-full max-w-[400px] flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <Image
            src="/images/carelio-logo.png"
            alt="Carelio"
            width={120}
            height={120}
            className="object-contain"
          />
        </div>

        <div className="w-full text-left space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Set Up Your Password
          </h1>
          <p className="text-muted-foreground text-sm">
            Create a secure password to protect your Carelio account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full grid gap-4">
          <div className="grid gap-2">
            <Label
              htmlFor="password"
              className="text-(--text-muted) font-normal"
            >
              New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-muted)" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="pl-9 pr-9 placeholder:text-(--text-muted)"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-secondary) focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="confirmPassword"
              className="text-(--text-muted) font-normal"
            >
              Confirm New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-muted)" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Password"
                className="pl-9 pr-9 placeholder:text-(--text-muted)"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-secondary) focus:outline-none"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <ErrorMessage message={errors.confirmPassword?.message} />
          </div>

          <Button
            type="submit"
            variant="brand"
            className="w-full h-11 rounded-full text-base mt-2"
            disabled={!isValid || isPending}
          >
            {isPending ? <Spinner /> : 'Continue'}
          </Button>
        </form>

        {/* Requirements List */}
        <div className="w-full space-y-3 mt-2">
          {requirements.map((req, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-(--text-muted)"
            >
              <CheckCircle2
                className={`h-4 w-4 ${
                  req.valid
                    ? 'text-brand-blue'
                    : 'text-(--text-gray-placeholder)'
                }`}
              />
              <span className={req.valid ? 'text-foreground font-medium' : ''}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FirstTimeResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex flex-col items-center justify-center sm:p-6 bg-(--bg-white) dark:bg-background h-full">
          <div className="w-full max-w-[400px] flex flex-col items-center gap-6">
            <div className="flex items-center justify-center mb-6">
              <Image
                src="/images/carelio-logo.png"
                alt="Carelio"
                width={120}
                height={120}
                className="object-contain"
              />
            </div>
            <div className="w-full text-left space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Set Up Your Password
              </h1>
              <p className="text-muted-foreground text-sm">
                Create a secure password to protect your Carelio account
              </p>
            </div>
            <div className="flex items-center justify-center">
              <Spinner />
            </div>
          </div>
        </div>
      }
    >
      <FirstTimeResetPasswordForm />
    </Suspense>
  );
}
