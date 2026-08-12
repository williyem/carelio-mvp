'use client';

import Image from 'next/image';
import Link from 'next/link';
import TopbarNavigation from './topbar-navigation';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';

interface HealthAssistantTopbarProps {
  className?: string;
  onDevicesClick?: () => void;
  onLogoutClick?: () => void;
}

const HealthAssistantTopbar = ({
  className,
  onDevicesClick,
  onLogoutClick,
}: HealthAssistantTopbarProps) => {
  return (
    <div
      className={cn(
        'bg-white border-b border-(--border-stroke) flex items-center justify-between max-h-[84px] px-4 md:px-[44px] py-[20px] w-full sticky top-0 z-50',
        className
      )}
    >
      <Link
        href={ROUTES.HEALTH_ASSISTANT.PATIENT.ROOT}
        className="relative h-9 md:h-11 w-[120px] md:w-[140px]"
      >
        <Image
          src="/images/carelio-logo.png"
          alt="Carelio"
          fill
          className="object-contain object-left"
          priority
        />
      </Link>

      <TopbarNavigation
        onDevicesClick={onDevicesClick}
        onLogoutClick={onLogoutClick}
      />
    </div>
  );
};

export default HealthAssistantTopbar;
