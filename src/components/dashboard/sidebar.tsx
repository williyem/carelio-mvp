'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  CreditCard,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { useLogout } from '@/hooks/use-logout';

const NAV_ITEMS = [
  { label: 'Overview', icon: LayoutDashboard, href: ROUTES.DASHBOARD.ROOT },
  { label: 'Patients', icon: Users, href: ROUTES.DASHBOARD.PATIENT.ROOT },
  { label: 'Schedule', icon: Calendar, href: '/dashboard/schedule' },
  { label: 'Message', icon: MessageSquare, href: '/dashboard/messages' },
  { label: 'Transactions', icon: CreditCard, href: '/dashboard/transactions' },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const logout = useLogout();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-full w-[250px] flex-col bg-(--bg-white) dark:bg-card border-r border-(--border-stroke) dark:border-border">
      <div className="flex h-16 items-center px-6 pt-6 pb-2">
        <Link href={ROUTES.DASHBOARD.ROOT} className="flex items-center">
          <Image
            src="/images/carelio-logo.png"
            alt="Carelio"
            width={150}
            height={46}
            className="object-contain h-10 w-auto"
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col gap-1 px-4 py-6">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                  : 'text-(--text-muted) hover:bg-(--bg-primary) hover:text-(--text-primary) dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5',
                  isActive
                    ? 'text-white'
                    : 'text-(--text-muted) group-hover:text-(--text-secondary)'
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 mt-auto border-t border-gray-50 dark:border-border/50">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-(--text-muted) hover:bg-state-error-lighter hover:text-red-600 rounded-xl transition-all duration-200 group"
        >
          <LogOut className="h-5 w-5 text-(--text-muted) group-hover:text-red-500" />
          Logout
        </button>
      </div>
    </div>
  );
}
