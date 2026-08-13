'use client';

import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';

export default function OnboardingTopbar({ onBack }: { onBack?: () => void }) {
  return (
    <div className="w-full flex justify-between items-center">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 typography-label-small text-text-sub-600"
        >
          <ChevronLeft size={18} /> Go Back
        </button>
      ) : (
        <div />
      )}

      <Image
        src="/images/carelio-logo.png"
        alt="Carelio"
        width={160}
        height={49}
        className="object-contain"
      />
      <div />
    </div>
  );
}
