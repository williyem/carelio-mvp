'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import SettingsPageHeader from './settings-page-header';
import { Spinner } from '@/components/ui/spinner';
import { useDoctors } from '@/hooks/page-hooks/useDoctors';
import {
  getAccessGrants,
  grantAccess,
  revokeAccess,
} from '@/integration/settings/api';
import { getErrorMessage } from '@/integration';
import { EmptyState } from '@/components/ui/empty-state';
import { User } from 'lucide-react';

export default function PatientAccessSettings() {
  const { clinicians } = useDoctors();
  const [grantedIds, setGrantedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccessGrants()
      .then((data) => setGrantedIds(data.grantedIds))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const people = useMemo(
    () =>
      clinicians.map((c) => ({
        id: c.id,
        name: c.name || `${c.firstName} ${c.lastName}`.trim(),
        email: c.email,
        role: 'doctor' as const,
      })),
    [clinicians]
  );

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <SettingsPageHeader
        title="Doctors & assistants"
        description="Grant or revoke who can view your chart and schedule visits with you."
      />
      <div className="space-y-3">
        {people.length === 0 ? (
          <EmptyState
            icon={<User className="h-6 w-6 text-(--text-muted)" />}
            title="No clinicians available yet"
            description="Doctors and health assistants will show here when they are on your care team."
          />
        ) : null}
        {people.map((person) => {
          const granted = grantedIds.includes(person.id);
          return (
            <div
              key={person.id}
              className="rounded-[20px] border border-(--border-stroke) p-5 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-semibold">{person.name}</p>
                <p className="text-sm text-(--text-secondary)">
                  {person.role === 'doctor' ? 'Doctor' : 'Health assistant'}
                  {person.email ? ` · ${person.email}` : ''}
                </p>
              </div>
              <Button
                variant={granted ? 'outline' : 'brand'}
                className="rounded-full"
                onClick={async () => {
                  try {
                    if (granted) {
                      await revokeAccess(person.id);
                      setGrantedIds((ids) =>
                        ids.filter((id) => id !== person.id)
                      );
                      toast.success(`Revoked access for ${person.name}`);
                    } else {
                      await grantAccess({
                        granteeId: person.id,
                        granteeRole: person.role,
                      });
                      setGrantedIds((ids) => [...ids, person.id]);
                      toast.success(`Granted access to ${person.name}`);
                    }
                  } catch (error) {
                    toast.error(
                      getErrorMessage(error, 'Could not update access')
                    );
                  }
                }}
              >
                {granted ? 'Revoke' : 'Grant access'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
