'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SettingsPageHeader from './settings-page-header';
import { Spinner } from '@/components/ui/spinner';
import type { InsurancePolicy } from '@/stores/patient-insurance-store';
import {
  addPatientInsurance,
  getPatientInsurance,
  removePatientInsurance,
} from '@/integration/settings/api';
import { useUploadFile } from '@/integration/files/mutations';
import { getErrorMessage } from '@/integration';

export default function PatientInsuranceSettings({
  patientId: _patientId,
}: {
  patientId: string;
}) {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cardImageUrl, setCardImageUrl] = useState('');
  const upload = useUploadFile();
  const { register, handleSubmit, reset } = useForm<
    Omit<InsurancePolicy, 'id' | 'isDefault' | 'cardImageUrl'>
  >({
    defaultValues: {
      provider: '',
      memberId: '',
      groupId: '',
      holderName: '',
      effectiveDate: '',
      expirationDate: '',
    },
  });

  useEffect(() => {
    getPatientInsurance()
      .then(setPolicies)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

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
        title="Insurance"
        description="Keep your coverage details on file for billing and eligibility."
      />

      <div className="flex justify-end mb-4">
        <Button
          variant="brand"
          className="rounded-full"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Close' : 'Add insurance'}
        </Button>
      </div>

      {open && (
        <form
          className="rounded-[20px] border border-(--border-stroke) p-6 grid gap-3 sm:grid-cols-2 mb-6"
          onSubmit={handleSubmit(async (data) => {
            try {
              const next = await addPatientInsurance({
                ...data,
                isDefault: policies.length === 0,
                cardImageUrl,
              });
              setPolicies(next);
              toast.success('Insurance added');
              reset();
              setCardImageUrl('');
              setOpen(false);
            } catch (error) {
              toast.error(getErrorMessage(error, 'Could not add insurance'));
            }
          })}
        >
          <div className="space-y-1.5">
            <Label>Provider</Label>
            <Input
              className="h-11"
              {...register('provider', { required: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Member ID</Label>
            <Input
              className="h-11"
              {...register('memberId', { required: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Group ID</Label>
            <Input className="h-11" {...register('groupId')} />
          </div>
          <div className="space-y-1.5">
            <Label>Cardholder name</Label>
            <Input className="h-11" {...register('holderName')} />
          </div>
          <div className="space-y-1.5">
            <Label>Effective date</Label>
            <Input
              type="date"
              className="h-11"
              {...register('effectiveDate')}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Expiration date</Label>
            <Input
              type="date"
              className="h-11"
              {...register('expirationDate')}
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Insurance card image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  const uploaded = await upload.mutateAsync(file);
                  setCardImageUrl(uploaded.url);
                  toast.success('Card image uploaded');
                } catch (error) {
                  toast.error(getErrorMessage(error, 'Upload failed'));
                }
              }}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="brand" className="rounded-full">
              Save policy
            </Button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {policies.length === 0 && (
          <p className="text-sm text-(--text-secondary)">
            No insurance on file yet.
          </p>
        )}
        {policies.map((policy) => (
          <div
            key={policy.id}
            className="rounded-[20px] border border-(--border-stroke) p-5 flex items-start justify-between gap-4"
          >
            <div>
              <p className="font-semibold">{policy.provider}</p>
              <p className="text-sm text-(--text-secondary)">
                Member {policy.memberId}
                {policy.groupId ? ` · Group ${policy.groupId}` : ''}
              </p>
              {policy.isDefault && (
                <span className="mt-2 inline-block text-xs text-brand-blue">
                  Default
                </span>
              )}
            </div>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={async () => {
                try {
                  const next = await removePatientInsurance(policy.id);
                  setPolicies(next);
                  toast.success('Insurance removed');
                } catch (error) {
                  toast.error(getErrorMessage(error, 'Could not remove'));
                }
              }}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
