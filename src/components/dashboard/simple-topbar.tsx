'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import HomeSvg from '@/assets/icons/home-svg';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';

interface SimpleTopbarProps {
  className?: string;
  onLogoutClick?: () => void;
}

const SimpleTopbar = ({ className, onLogoutClick }: SimpleTopbarProps) => {
  const pathname = usePathname();
  const isHomeActive = pathname === ROUTES.PATIENT.ROOT;

  if (pathname === '/patient/register') {
    return null;
  }

  return (
    <div
      className={cn(
        'bg-white border-b border-(--border-stroke) flex items-center justify-between max-h-[84px] px-4 md:px-[44px] py-[20px] w-full sticky top-0 z-50',
        className
      )}
    >
      <Link
        href={ROUTES.PATIENT.ROOT}
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

      <div className="flex gap-5 items-center justify-end">
        <Link
          href={ROUTES.PATIENT.ROOT}
          className={cn(
            'flex items-center gap-2 px-1 py-0 hover:opacity-70 transition-opacity',
            isHomeActive ? 'text-(--brand-blue)' : 'text-(--text-primary)'
          )}
        >
          <HomeSvg className="w-5 h-5" />
          <span className="text-[14px] leading-[1.2] font-normal">Home</span>
        </Link>

        <div className="bg-(--border-stroke) h-[44px] w-px" />

        <Button
          variant="outline"
          onClick={onLogoutClick}
          className="bg-white border border-(--border-stroke) h-[44px] px-5 py-2 shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] text-[14px] font-medium leading-[20px] tracking-[-0.084px]"
        >
          <LogOut className="w-4 h-4 mr-1" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default SimpleTopbar;
