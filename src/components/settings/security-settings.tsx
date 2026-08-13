'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ErrorMessage from '@/components/ui/error-message';
import { Spinner } from '@/components/ui/spinner';
import SettingsPageHeader from './settings-page-header';
import { getErrorMessage } from '@/integration';
import { useChangePassword as useDoctorChangePassword } from '@/integration/auth/doctor';
import { useChangePassword as useHaChangePassword } from '@/integration/auth/health-assistant';
import type { StaffRole } from '@/stores/staff-profile-store';

const schema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function SecuritySettings({
  role,
  twoFactorEnabled: _twoFactorEnabled,
}: {
  role: StaffRole;
  twoFactorEnabled?: boolean;
}) {
  const doctorMutation = useDoctorChangePassword();
  const haMutation = useHaChangePassword();
  const mutation = role === 'doctor' ? doctorMutation : haMutation;
  const [show, setShow] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(
      { oldPassword: data.oldPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          toast.success('Password updated');
          reset();
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, 'Could not update password'));
        },
      }
    );
  };

  return (
    <div className="space-y-8">
      <SettingsPageHeader
        title="Security"
        description="Change your password."
      />

      <section className="rounded-[20px] border border-(--border-stroke) p-6 space-y-4">
        <h2 className="text-base font-semibold">Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <Label htmlFor="oldPassword">Current password</Label>
            <Input
              id="oldPassword"
              type={show ? 'text' : 'password'}
              {...register('oldPassword')}
              className="h-11"
            />
            <ErrorMessage message={errors.oldPassword?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type={show ? 'text' : 'password'}
              {...register('newPassword')}
              className="h-11"
            />
            <ErrorMessage message={errors.newPassword?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type={show ? 'text' : 'password'}
              {...register('confirmPassword')}
              className="h-11"
            />
            <ErrorMessage message={errors.confirmPassword?.message} />
          </div>
          <button
            type="button"
            className="text-xs text-brand-blue"
            onClick={() => setShow((v) => !v)}
          >
            {show ? 'Hide passwords' : 'Show passwords'}
          </button>
          <div>
            <Button
              type="submit"
              variant="brand"
              disabled={mutation.isPending}
              className="rounded-full px-6"
            >
              {mutation.isPending ? <Spinner /> : 'Update password'}
            </Button>
          </div>
        </form>
      </section>

      {/* 2FA is temporarily disabled.
      <section className="rounded-[20px] border border-(--border-stroke) p-6 space-y-3">
        <h2 className="text-base font-semibold">Two-factor authentication</h2>
        <p className="text-sm text-(--text-secondary)">
          {twoFactorEnabled
            ? 'Two-factor authentication is enabled on this account.'
            : 'Add an extra layer of security when you sign in.'}
        </p>
        {!twoFactorEnabled && (
          <Button asChild variant="outline" className="rounded-full">
            <Link href={ROUTES.AUTH.SETUP_2FA}>Set up 2FA</Link>
          </Button>
        )}
      </section>
      */}
    </div>
  );
}
