'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

function PasswordResetSuccessContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next');

  const ctaHref = next ?? ROUTES.AUTH.LOGIN;
  const ctaLabel = next ? 'Continue to 2FA Setup' : 'Go to login';

  return (
    <div className="w-full flex flex-col items-center justify-center sm:p-6 bg-white dark:bg-background h-full">
      <div className="w-full max-w-[400px] flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <Image
            src="/images/carelio-logo.png"
            alt="Carelio"
            width={200}
            height={61}
            className="object-contain"
          />
        </div>

        {/* Illustration */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <Image
            src="/images/password-verified-illustration.png"
            alt="Password Verified"
            width={160}
            height={160}
            className="object-contain"
          />
        </div>

        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Password Reset Successful
          </h1>
          <p className="text-muted-foreground text-sm max-w-[300px] mx-auto leading-relaxed">
            Your password has been updated successfully. Use your new
            credentials to log in securely.
          </p>
        </div>

        <div className="w-full">
          <Link href={ctaHref} className="w-full block">
            <Button
              variant="brand"
              className="w-full h-12 rounded-full text-base"
            >
              {ctaLabel}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PasswordResetSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex flex-col items-center justify-center sm:p-6 bg-white dark:bg-background h-full">
          <div className="w-full max-w-[400px] flex flex-col items-center gap-8">
            <div className="flex items-center justify-center">
              <Image
                src="/images/carelio-logo.png"
                alt="Carelio"
                width={200}
                height={61}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      }
    >
      <PasswordResetSuccessContent />
    </Suspense>
  );
}
