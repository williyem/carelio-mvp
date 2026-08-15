'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleCheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

const COUNTDOWN_SECONDS = 5;

export default function SuccessStep({
  goToPatient = false,
}: {
  goToPatient?: boolean;
}) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const destination = goToPatient ? ROUTES.PATIENT.ROOT : ROUTES.AUTH.LOGIN;

  useEffect(() => {
    if (secondsLeft <= 0) {
      router.replace(destination);
      return;
    }
    const timer = window.setTimeout(() => {
      setSecondsLeft((value) => value - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft, router, destination]);

  return (
    <div className="w-[900px] mx-auto mt-8 max-w-[90%] flex flex-col items-center justify-center min-h-[50vh] text-center p-8 rounded-[16px] x-small-shadow border border-(--border-stroke) bg-bg-white-0">
      <CircleCheckIcon
        size={64}
        color="#1fc16b"
        className="mx-auto mb-4 rounded-full"
      />
      <h2 className="text-[24px] font-bold mb-2">You&apos;re registered</h2>
      <p className="font-normal text-text-secondary mb-4 max-w-md">
        {goToPatient
          ? 'Your Carelio patient profile is ready. Continuing to your home…'
          : 'Your Carelio patient profile is ready. Sign in with your Patient ID to book visits, join calls, and manage your records.'}
      </p>
      <p className="text-sm text-text-sub-600 mb-6">
        Redirecting in {secondsLeft}s…
      </p>
      <Button
        variant="brand"
        className="h-[48px] rounded-[8px] font-bold px-8"
        onClick={() => router.replace(destination)}
      >
        {goToPatient ? 'Go to home' : 'Go to sign in'}
      </Button>
    </div>
  );
}
