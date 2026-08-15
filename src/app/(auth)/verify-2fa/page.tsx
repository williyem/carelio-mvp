'use client';

import Link from 'next/link';
import Image from 'next/image';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Tabs } from '@/components/ui/tabs';
import { ROUTES } from '@/lib/routes';
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from 'nextjs-toploader/app';
import { useVerify2FAForm } from '@/hooks/page-hooks/use-verify-2fa';

export default function Verify2FAPage() {
  const { code, setCode, handleVerify, isPending } = useVerify2FAForm();
  const router = useRouter();

  return (
    <div className="w-full flex flex-col items-center justify-center sm:p-6 bg-(--bg-white) dark:bg-background h-full">
      <div className="w-full max-w-[500px] flex flex-col items-center gap-6">
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

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Two-Factor Authentication
          </h1>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Enter the 6-digit code from your authenticator app to complete sign
            in.
          </p>
        </div>

        <Tabs
          defaultValue="authenticator"
          className="w-full"
          onValueChange={setCode}
        >
          <div className="mt-8 flex flex-col items-center gap-6">
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup className="gap-3">
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

            <div className="theme-alert-info w-full p-4 rounded-lg text-sm">
              <strong className="block mb-1 text-(--text-primary)">
                Using authenticator app?
              </strong>
              Open your app (Google Authenticator, Authy, etc.) and enter the
              6-digit code
            </div>
          </div>
        </Tabs>

        <div className="flex gap-4 w-full mt-2">
          <Button
            variant="brand"
            className="flex-1 h-12 rounded-full text-base"
            disabled={code.length !== 6 || isPending}
            onClick={handleVerify}
          >
            {isPending ? <Spinner /> : 'Verify'}
          </Button>
          <Button
            onClick={() => router.push(ROUTES.AUTH.LOGIN)}
            variant="outline"
            className="flex-1 h-12 rounded-full text-base border-(--border-stroke)"
          >
            Cancel
          </Button>
        </div>

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
