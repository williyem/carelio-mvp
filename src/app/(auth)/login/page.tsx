'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDoctorLoginForm } from '@/hooks/page-hooks/use-doctor-login';
import { usePatientLoginForm } from '@/hooks/page-hooks/use-patient-login';
import { useHealthAssistantLoginForm } from '@/hooks/page-hooks/use-health-assistant-login';
import { Spinner } from '@/components/ui/spinner';
import ErrorMessage from '@/components/ui/error-message';

type LoginRole = 'doctor' | 'patient' | 'health-assistant';

export default function LoginPage() {
  const [loginRole, setLoginRole] = useState<LoginRole>('doctor');

  const doctorForm = useDoctorLoginForm();
  const patientForm = usePatientLoginForm();
  const healthAssistantForm = useHealthAssistantLoginForm();

  const staffForm = loginRole === 'doctor' ? doctorForm : healthAssistantForm;
  const isPending =
    loginRole === 'patient' ? patientForm.isPending : staffForm.isPending;

  return (
    <div className="flex items-center justify-center py-12 px-6 lg:px-8 w-full">
      <div className="mx-auto grid w-full max-w-[400px] gap-6">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="flex items-center justify-center mb-6">
            <Link href="/login" className="transition-opacity hover:opacity-80">
              <Image
                src="/images/carelio-logo.png"
                alt="Carelio"
                width={200}
                height={61}
                className="object-contain"
              />
            </Link>
          </div>
        </div>

        <Tabs
          value={loginRole}
          onValueChange={(value) => setLoginRole(value as LoginRole)}
          className="w-full gap-0"
        >
          <TabsList className="h-auto w-full border border-(--border-stroke) p-[5px]">
            <TabsTrigger
              value="doctor"
              className="h-auto flex-1 cursor-pointer p-[10px] text-[13px] leading-[1.2] text-(--text-primary) data-[state=active]:bg-(--bg-white) data-[state=active]:border-(--border-stroke)"
            >
              Doctor
            </TabsTrigger>
            <TabsTrigger
              value="patient"
              className="h-auto flex-1 cursor-pointer p-[10px] text-[13px] leading-[1.2] text-(--text-primary) data-[state=active]:bg-(--bg-white) data-[state=active]:border-(--border-stroke)"
            >
              Patient
            </TabsTrigger>
            <TabsTrigger
              value="health-assistant"
              className="h-auto flex-1 cursor-pointer p-[10px] text-[13px] leading-[1.2] text-(--text-primary) data-[state=active]:bg-(--bg-white) data-[state=active]:border-(--border-stroke)"
            >
              Health Assistant
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {loginRole === 'patient' ? (
          <form
            className="grid gap-4"
            onSubmit={
              patientForm.pendingPatientId
                ? patientForm.handleOtpSubmit
                : patientForm.handleSubmit
            }
          >
            {patientForm.pendingPatientId ? (
              <div className="grid gap-2">
                <Label
                  htmlFor="otp"
                  className="text-(--text-muted) font-normal"
                >
                  Email code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="6-digit code"
                  disabled={patientForm.isPending}
                  className="placeholder:text-(--text-muted)"
                  {...patientForm.otpRegister('otp')}
                />
                <ErrorMessage
                  message={patientForm.otpFormState.errors.otp?.message}
                />
              </div>
            ) : (
              <>
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
                      disabled={patientForm.isPending}
                      className="pl-9 placeholder:text-(--text-muted)"
                      {...patientForm.register('identifier')}
                    />
                  </div>
                  <ErrorMessage
                    message={patientForm.formState.errors.identifier?.message}
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="patient-password"
                    className="text-(--text-muted) font-normal"
                  >
                    Password
                  </Label>
                  <div className="relative w-full">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-muted)" />
                    <Input
                      id="patient-password"
                      type={patientForm.showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-9 placeholder:text-(--text-muted)"
                      disabled={patientForm.isPending}
                      {...patientForm.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        patientForm.setShowPassword(!patientForm.showPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-secondary) focus:outline-none"
                      tabIndex={-1}
                    >
                      {patientForm.showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <ErrorMessage
                    message={patientForm.formState.errors.password?.message}
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              variant="brand"
              className="w-full h-11 rounded-full text-base mt-2"
              disabled={
                patientForm.isPending ||
                (patientForm.pendingPatientId
                  ? !patientForm.otpFormState.isValid
                  : !patientForm.formState.isValid)
              }
            >
              {isPending ? (
                <Spinner />
              ) : patientForm.pendingPatientId ? (
                'Verify'
              ) : (
                'Log in'
              )}
            </Button>
          </form>
        ) : (
          <form className="grid gap-4" onSubmit={staffForm.handleSubmit}>
            <div className="grid gap-2">
              <Label
                htmlFor="email"
                className="text-(--text-muted) font-normal"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-muted)" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  disabled={staffForm.isPending}
                  className="pl-9 placeholder:text-(--text-muted)"
                  {...staffForm.register('email')}
                />
              </div>
              <ErrorMessage
                message={staffForm.formState.errors.email?.message}
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="password"
                className="text-(--text-muted) font-normal"
              >
                Password
              </Label>
              <div className="relative w-full">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-muted)" />
                <Input
                  id="password"
                  type={staffForm.showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-9 placeholder:text-(--text-muted)"
                  disabled={staffForm.isPending}
                  {...staffForm.register('password')}
                />
                <button
                  type="button"
                  onClick={() =>
                    staffForm.setShowPassword(!staffForm.showPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-secondary) focus:outline-none"
                  tabIndex={-1}
                >
                  {staffForm.showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <ErrorMessage
                message={staffForm.formState.errors.password?.message}
              />
            </div>

            <Button
              type="submit"
              variant="brand"
              className="w-full h-11 rounded-full text-base mt-2"
              disabled={staffForm.isPending || !staffForm.formState.isValid}
            >
              {isPending ? <Spinner /> : 'Log in'}
            </Button>
          </form>
        )}

        <div className="text-center">
          <Link
            href={
              loginRole === 'patient'
                ? '/forgot-password?role=patient'
                : '/forgot-password'
            }
            className="text-sm text-(--text-secondary) hover:text-brand-blue hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
