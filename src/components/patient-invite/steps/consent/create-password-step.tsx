'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ErrorMessage from '@/components/ui/error-message';
import { usePatientInviteStore } from '@/stores/patient-invite-store';

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function CreatePasswordStep() {
  const { formData, updateFormData, nextStep } = usePatientInviteStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange',
    defaultValues: {
      password: formData.password || '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: PasswordFormData) => {
    updateFormData({ password: data.password });
    nextStep();
  };

  return (
    <div className="w-[900px] mx-auto mt-8 max-w-[90%] rounded-[16px] x-small-shadow border border-(--border-stroke) p-5">
      <div className="space-y-3 mb-6">
        <h2 className="text-[24px] font-bold">Create a password</h2>
        <p className="font-normal text-text-secondary">
          You will use this password with your Patient ID or email to sign in.
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 items-start w-full"
      >
        <div className="flex flex-col items-start w-full">
          <div className="flex flex-col gap-2 items-start w-full relative">
            <Label
              htmlFor="password"
              className="text-[12px] leading-[16px] font-medium text-sm"
            >
              Password
            </Label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              className="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
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
        </div>
        <div className="flex flex-col items-start w-full">
          <div className="flex flex-col gap-2 items-start w-full relative">
            <Label
              htmlFor="confirmPassword"
              className="text-[12px] leading-[16px] font-medium text-sm"
            >
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              className="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] pr-10"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="absolute right-3 top-8 text-(--text-muted)"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
            <ErrorMessage message={errors.confirmPassword?.message} />
          </div>
        </div>
        <Button
          type="submit"
          variant="brand"
          className="w-full h-[50px] rounded-[8px] px-4 py-[17px] text-[16px] font-bold leading-[16px] mt-2"
          disabled={!isValid}
        >
          Continue
        </Button>
      </form>
    </div>
  );
}
