'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useLogout } from '@/hooks/use-logout';
import useUser from '@/hooks/useUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, Users } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import HomeSvg from '@/assets/icons/home-svg';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import StaffOnboardingGate from '@/components/onboarding/staff-onboarding-gate';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const logout = useLogout();
  const router = useRouter();
  const pathname = usePathname();
  const { fullName, isLoading, isFetching, email, userId, user } = useUser();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = fullName
    ? fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  const isHomeActive = pathname === ROUTES.DASHBOARD.ROOT;
  const isPatientsActive = pathname?.startsWith(ROUTES.DASHBOARD.PATIENT.ROOT);
  const isSettingsActive = pathname?.startsWith(ROUTES.DASHBOARD.SETTINGS.ROOT);

  const navItemClass = (isActive: boolean) =>
    cn(
      'flex items-center gap-2 px-1 py-0 hover:opacity-70 transition-opacity',
      isActive ? 'text-brand-blue' : 'text-(--text-primary)'
    );

  return (
    <div className="min-h-screen w-full">
      <StaffOnboardingGate
        role="doctor"
        userId={userId}
        isLoading={isLoading}
        completed={user?.onboardingCompleted}
      />
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#EBEBEB] bg-white px-6">
        <Link
          href={ROUTES.DASHBOARD.ROOT}
          className="flex items-center hover:opacity-90 transition-opacity"
        >
          <Image
            src="/images/carelio-logo.png"
            alt="Carelio"
            width={160}
            height={49}
            className="object-contain w-36 md:w-40 h-auto"
            priority
          />
        </Link>
        <div className="flex items-center gap-5">
          <div className="hidden md:flex gap-5 items-center">
            <Link
              href={ROUTES.DASHBOARD.ROOT}
              className={navItemClass(isHomeActive)}
            >
              <HomeSvg className="w-5 h-5" />
              <span className="text-[14px] leading-[1.2] font-normal">
                Home
              </span>
            </Link>

            <div className="bg-(--border-stroke) h-[44px] w-px" />

            <Link
              href={ROUTES.DASHBOARD.PATIENT.ROOT}
              className={navItemClass(!!isPatientsActive)}
            >
              <Users className="w-5 h-5" />
              <span className="text-[14px] leading-[1.2] font-normal">
                Patients
              </span>
            </Link>

            <div className="bg-(--border-stroke) h-[44px] w-px" />

            <Link
              href={ROUTES.DASHBOARD.SETTINGS.ROOT}
              className={navItemClass(!!isSettingsActive)}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[14px] leading-[1.2] font-normal">
                Settings
              </span>
            </Link>

            <div className="bg-(--border-stroke) h-[44px] w-px" />
          </div>

          {isLoading || isFetching ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="hidden md:block space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 pl-1 outline-none hover:opacity-80 transition-opacity cursor-pointer text-left">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-(--border-stroke)">
                      <AvatarImage
                        src={user?.avatarUrl || ''}
                        alt={fullName || 'User'}
                      />
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
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px] mt-2">
                <div className="px-2 py-1.5 md:hidden">
                  <p className="text-sm font-semibold">{fullName || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{email}</p>
                </div>
                <DropdownMenuSeparator className="md:hidden" />
                <DropdownMenuItem asChild className="md:hidden">
                  <Link href={ROUTES.DASHBOARD.ROOT}>Home</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="md:hidden">
                  <Link href={ROUTES.DASHBOARD.PATIENT.ROOT}>Patients</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="md:hidden">
                  <Link href={ROUTES.DASHBOARD.SETTINGS.ROOT}>Settings</Link>
                </DropdownMenuItem>
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
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
