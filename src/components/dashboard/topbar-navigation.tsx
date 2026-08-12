'use client';

import { Users, Settings, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HomeSvg from '@/assets/icons/home-svg';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import useUser from '@/hooks/use-user';
import { useLogout } from '@/hooks/use-logout';

interface TopbarNavigationProps {
  onDevicesClick?: () => void;
  onLogoutClick?: () => void;
}

const TopbarNavigation = ({
  onDevicesClick,
  onLogoutClick,
}: TopbarNavigationProps) => {
  const pathname = usePathname();
  const isHomeActive = pathname === ROUTES.HEALTH_ASSISTANT.PATIENT.ROOT;
  const isAssignmentsActive = pathname?.startsWith(
    ROUTES.HEALTH_ASSISTANT.ASSIGNMENTS.ROOT
  );

  const logout = useLogout();
  const { fullName, isLoading, isFetching, email } = useUser();

  const handleLogout = () => {
    if (onLogoutClick) {
      onLogoutClick();
    } else {
      logout();
    }
  };

  const initials = fullName
    ? fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  const navItemClass = (isActive: boolean) =>
    cn(
      'flex items-center gap-2 px-1 py-0 hover:opacity-70 transition-opacity',
      isActive ? 'text-brand-blue' : 'text-(--text-primary)'
    );

  return (
    <>
      {/* Desktop Navigation (md and above) */}
      <div className="hidden md:flex gap-5 items-center justify-end">
        {/* Home */}
        <Link
          href={ROUTES.HEALTH_ASSISTANT.PATIENT.ROOT}
          className={navItemClass(isHomeActive)}
        >
          <HomeSvg className="w-5 h-5" />
          <span className="text-[14px] leading-[1.2] font-normal">Home</span>
        </Link>

        {/* Divider */}
        <div className="bg-(--border-stroke) h-[44px] w-px" />

        {/* Assignments */}
        <Link
          href={ROUTES.HEALTH_ASSISTANT.ASSIGNMENTS.ROOT}
          className={navItemClass(isAssignmentsActive)}
        >
          <Users className="w-5 h-5" />
          <span className="text-[14px] leading-[1.2] font-normal">
            Patients
          </span>
        </Link>

        {/* Divider */}
        <div className="bg-(--border-stroke) h-[44px] w-px" />

        {/* Devices */}
        <button
          type="button"
          onClick={onDevicesClick}
          className="flex items-center gap-2 px-1 py-0 text-(--text-primary) hover:opacity-70 transition-opacity"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[14px] leading-[1.2] font-normal whitespace-nowrap">
            Devices
          </span>
        </button>

        {/* Divider */}
        <div className="bg-(--border-stroke) h-[44px] w-px" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pl-1 outline-none hover:opacity-80 transition-opacity cursor-pointer text-left">
              {isLoading || isFetching ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="hidden md:block space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-(--border-stroke)">
                    <AvatarImage src="" alt={fullName || 'User'} />
                    <AvatarFallback className="bg-brand-blue/5 text-brand-blue text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-[14px] font-medium text-(--text-primary) leading-none">
                      {fullName || 'User'}
                    </p>
                    <p className="text-[11px] truncate text-(--text-secondary) mt-1">
                      {email || 'Clinician'}
                    </p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="9"
                    height="5"
                    viewBox="0 0 9 5"
                    fill="none"
                  >
                    <path d="M4.5 4.5L0 0H9L4.5 4.5Z" fill="#5C5C5C" />
                  </svg>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px] mt-2">
            <div className="px-2 py-1.5 md:hidden">
              <p className="text-sm font-semibold">{fullName || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{email}</p>
            </div>
            <DropdownMenuSeparator className="md:hidden" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-700 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Navigation (below md) - Dropdown Menu */}
      <div className="flex md:hidden items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-white border border-(--border-stroke) h-[44px] w-[44px] p-0 shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] hover:bg-(--bg-primary)"
            >
              <Menu className="w-5 h-5 text-(--text-primary)" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[200px] bg-white border border-(--border-stroke) shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] rounded-[8px] p-1"
          >
            {/* Home */}
            <DropdownMenuItem asChild>
              <Link
                href={ROUTES.HEALTH_ASSISTANT.PATIENT.ROOT}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 cursor-pointer rounded-[6px]',
                  isHomeActive
                    ? 'bg-brand-blue/5 text-brand-blue'
                    : 'text-(--text-primary) hover:bg-(--bg-primary)'
                )}
              >
                <HomeSvg
                  className={cn(
                    'w-5 h-5',
                    isHomeActive ? 'text-brand-blue' : 'text-(--text-primary)'
                  )}
                />
                <span className="text-[14px] leading-[1.2] font-normal">
                  Home
                </span>
              </Link>
            </DropdownMenuItem>

            {/* Assignments */}
            <DropdownMenuItem asChild>
              <Link
                href={ROUTES.HEALTH_ASSISTANT.ASSIGNMENTS.ROOT}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 cursor-pointer rounded-[6px]',
                  isAssignmentsActive
                    ? 'bg-brand-blue/5 text-brand-blue'
                    : 'text-(--text-primary) hover:bg-(--bg-primary)'
                )}
              >
                <Users
                  className={cn(
                    'w-5 h-5',
                    isAssignmentsActive
                      ? 'text-brand-blue'
                      : 'text-(--text-primary)'
                  )}
                />
                <span className="text-[14px] leading-[1.2] font-normal">
                  Patients
                </span>
              </Link>
            </DropdownMenuItem>

            {/* Devices */}
            <DropdownMenuItem
              onClick={onDevicesClick}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-[6px] text-(--text-primary) hover:bg-(--bg-primary)"
            >
              <Settings className="w-5 h-5 text-(--text-primary)" />
              <span className="text-[14px] leading-[1.2] font-normal">
                Devices
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-(--border-stroke) my-1" />

            {/* Logout */}
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-[6px] text-(--text-primary) hover:bg-(--bg-primary)"
            >
              <LogOut className="w-5 h-5 text-(--text-primary)" />
              <span className="text-[14px] leading-[1.2] font-normal">
                Logout
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

export default TopbarNavigation;
