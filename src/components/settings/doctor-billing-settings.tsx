'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SettingsPageHeader from './settings-page-header';
import { Spinner } from '@/components/ui/spinner';
import {
  defaultDoctorBilling,
  type DoctorBilling,
} from '@/stores/billing-store';
import {
  getDoctorBilling,
  saveDoctorBilling,
} from '@/integration/settings/api';
import { getErrorMessage } from '@/integration';

export default function DoctorBillingSettings({
  doctorId: _doctorId,
}: {
  doctorId: string;
}) {
  const [billing, setBilling] = useState<DoctorBilling>(defaultDoctorBilling());
  const [tab, setTab] = useState<'billing' | 'payouts'>('billing');
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset } = useForm<DoctorBilling>({
    values: billing,
  });

  useEffect(() => {
    getDoctorBilling()
      .then((data) => {
        setBilling(data);
        reset(data);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [reset]);

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
        title="Billing & payouts"
        description="Add a billing address and see amounts you are entitled to. This demo does not process payments."
      />

      <div className="flex gap-2 mb-6">
        {(['billing', 'payouts'] as const).map((value) => (
          <Button
            key={value}
            type="button"
            variant={tab === value ? 'brand' : 'outline'}
            className="rounded-full capitalize"
            onClick={() => setTab(value)}
          >
            {value}
          </Button>
        ))}
      </div>

      {tab === 'billing' ? (
        <form
          className="space-y-6 max-w-xl"
          onSubmit={handleSubmit(async (data) => {
            try {
              const saved = await saveDoctorBilling({
                ...billing,
                ...data,
                payouts: billing.payouts,
              });
              setBilling(saved);
              toast.success('Billing details saved');
            } catch (error) {
              toast.error(getErrorMessage(error, 'Could not save billing'));
            }
          })}
        >
          <div className="rounded-[20px] border border-(--border-stroke) p-6 space-y-4">
            <h2 className="font-semibold">Billing address</h2>
            <div className="grid gap-3">
              <div className="space-y-1.5">
                <Label>Address line 1</Label>
                <Input className="h-11" {...register('address.line1')} />
              </div>
              <div className="space-y-1.5">
                <Label>Address line 2</Label>
                <Input className="h-11" {...register('address.line2')} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5 col-span-1">
                  <Label>City</Label>
                  <Input className="h-11" {...register('address.city')} />
                </div>
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <Input className="h-11" {...register('address.state')} />
                </div>
                <div className="space-y-1.5">
                  <Label>ZIP</Label>
                  <Input className="h-11" {...register('address.zip')} />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[20px] border border-(--border-stroke) p-6 space-y-4">
            <h2 className="font-semibold">Card on file</h2>
            <p className="text-sm text-(--text-secondary)">
              {billing.card.brand} ending in {billing.card.last4}, exp{' '}
              {billing.card.expMonth}/{billing.card.expYear}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Name on card</Label>
                <Input className="h-11" {...register('card.nameOnCard')} />
              </div>
              <div className="space-y-1.5">
                <Label>Last 4</Label>
                <Input className="h-11" {...register('card.last4')} />
              </div>
            </div>
          </div>

          <Button type="submit" variant="brand" className="rounded-full px-6">
            Save billing
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-[20px] border border-(--border-stroke) p-6">
            <p className="text-sm text-(--text-secondary)">Amount entitled</p>
            <p className="text-3xl font-bold text-brand-blue mt-1">
              {billing.entitledAmount}
            </p>
          </div>
          <div className="rounded-[20px] border border-(--border-stroke) overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-(--bg-lighter-gray) text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Invoice</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {billing.payouts.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-(--border-stroke)"
                  >
                    <td className="px-4 py-3">{row.invoice}</td>
                    <td className="px-4 py-3">{row.amount}</td>
                    <td className="px-4 py-3">{row.date}</td>
                    <td className="px-4 py-3">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
