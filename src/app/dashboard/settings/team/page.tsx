'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useUser from '@/hooks/useUser';
import { Spinner } from '@/components/ui/spinner';
import TeamSettings from '@/components/settings/team-settings';
import { ROUTES } from '@/lib/routes';

export default function DoctorTeamSettingsPage() {
  const { user, userId, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user?.isAdmin) {
      router.replace(ROUTES.DASHBOARD.SETTINGS.ROOT);
    }
  }, [isLoading, user?.isAdmin, router]);

  if (isLoading || !userId || !user?.isAdmin) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return <TeamSettings currentUserId={userId} />;
}
