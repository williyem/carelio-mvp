'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import SettingsPageHeader from './settings-page-header';
import { useAccessGrantStore } from '@/stores/access-grant-store';
import { useDoctors } from '@/hooks/page-hooks/useDoctors';

export default function PatientAccessSettings() {
  const { clinicians } = useDoctors();
  const people = useAccessGrantStore((s) => s.people);
  const grantedIds = useAccessGrantStore((s) => s.grantedIds);
  const seedPeople = useAccessGrantStore((s) => s.seedPeople);
  const grant = useAccessGrantStore((s) => s.grant);
  const revoke = useAccessGrantStore((s) => s.revoke);

  useEffect(() => {
    if (clinicians.length === 0) return;
    seedPeople(
      clinicians.map((c) => ({
        id: c.id,
        name: c.name || `${c.firstName} ${c.lastName}`.trim(),
        email: c.email,
        role: 'doctor' as const,
      }))
    );
  }, [clinicians, seedPeople]);

  return (
    <div>
      <SettingsPageHeader
        title="Doctors & assistants"
        description="Grant or revoke who can view your chart and schedule visits with you."
      />
      <div className="space-y-3">
        {people.length === 0 && (
          <p className="text-sm text-(--text-secondary)">
            No clinicians available yet.
          </p>
        )}
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
                onClick={() => {
                  if (granted) {
                    revoke(person.id);
                    toast.success(`Revoked access for ${person.name}`);
                  } else {
                    grant(person.id);
                    toast.success(`Granted access to ${person.name}`);
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
