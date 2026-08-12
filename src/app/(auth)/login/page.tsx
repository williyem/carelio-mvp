'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDoctorLoginForm } from '@/hooks/page-hooks/use-doctor-login';
import { Spinner } from '@/components/ui/spinner';
import ErrorMessage from '@/components/ui/error-message';

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    showPassword,
    setShowPassword,
    isPending,
  } = useDoctorLoginForm();
  return (
    <div className="flex items-center justify-center py-12 px-6 lg:px-8 w-full">
      <div className="mx-auto grid w-full max-w-[400px] gap-6">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
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
          {/* Headers are implicit in the design */}
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-gray-500 font-normal">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                disabled={isPending}
                className="pl-9 placeholder:text-gray-400"
                {...register('email')}
              />
            </div>
            <ErrorMessage message={errors.email?.message} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-gray-500 font-normal">
              Password
            </Label>
            <div className="relative w-full">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="pl-9 placeholder:text-gray-400"
                disabled={isPending}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <ErrorMessage message={errors.password?.message} />
          </div>

          <Button
            type="submit"
            variant="brand"
            className="w-full h-11 rounded-full text-base mt-2"
            disabled={isPending || !isValid}
          >
            {isPending ? <Spinner /> : 'Log in'}
          </Button>
        </form>
        <div className="text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-gray-600 hover:text-brand-blue hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
