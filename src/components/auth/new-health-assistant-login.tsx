'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputEmailSvg from '@/assets/icons/input-email-svg';
import PasswordSvg from '@/assets/icons/password-svg';
import LogoSvgMd from '@/assets/icons/logo-svg-md';
import ErrorMessage from '@/components/ui/error-message';
import { Spinner } from '../ui/spinner';
import { Eye, EyeOff } from 'lucide-react';
import { useHealthAssistantLoginForm } from '@/hooks/page-hooks/use-health-assistant-login';

export default function NewHealthAssistantLogin() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    showPassword,
    setShowPassword,
    isPending,
  } = useHealthAssistantLoginForm();

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
          Login as Health Assistant
        </h1>

        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex flex-col items-end justify-center w-full">
            <div className="flex flex-col gap-6 items-start w-full">
              <div className="flex flex-col items-start w-full">
                <div className="flex flex-col gap-2 items-start w-full">
                  <Label
                    htmlFor="email"
                    className="text-[12px] leading-[16px] text-(--text-muted)"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    icon={<InputEmailSvg />}
                    disabled={isPending}
                    {...register('email')}
                  />
                  <ErrorMessage message={errors.email?.message} />
                </div>
              </div>
              <div className="flex flex-col items-start w-full">
                <div className="flex flex-col gap-2 items-start w-full">
                  <Label
                    htmlFor="password"
                    className="text-[12px] leading-[16px] text-(--text-muted)"
                  >
                    Password
                  </Label>
                  <div className="relative w-full">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      icon={<PasswordSvg />}
                      disabled={isPending}
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
                  <ErrorMessage message={errors.password?.message} />
                </div>
              </div>

              <Button
                type="submit"
                variant="brand"
                className="w-full h-[50px] rounded-[8px] px-4 py-[17px] text-[16px] font-bold leading-[16px]"
                disabled={isPending || !isValid}
              >
                {isPending ? <Spinner /> : 'Log in'}
              </Button>

              <div className=" w-full text-center">
                <Link
                  href="/forgot-password"
                  className="text-sm text-(--text-secondary) hover:text-brand-blue hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
