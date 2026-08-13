'use client';

import SettingsPageHeader from './settings-page-header';
import { useBillingStore } from '@/stores/billing-store';

export default function PatientBillingSettings({
  patientId,
}: {
  patientId: string;
}) {
  const billing = useBillingStore((s) => s.getPatientBilling(patientId));

  return (
    <div>
      <SettingsPageHeader
        title="Billing"
        description="A summary of consultation charges. This is demo data only."
      />
      <div className="rounded-[20px] border border-(--border-stroke) p-6 mb-4">
        <p className="text-sm text-(--text-secondary)">Current balance</p>
        <p className="text-3xl font-bold mt-1">{billing.balance}</p>
      </div>
      <div className="rounded-[20px] border border-(--border-stroke) overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-(--bg-lighter-gray) text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {billing.invoices.map((row) => (
              <tr key={row.id} className="border-t border-(--border-stroke)">
                <td className="px-4 py-3">{row.description}</td>
                <td className="px-4 py-3">{row.amount}</td>
                <td className="px-4 py-3">{row.date}</td>
                <td className="px-4 py-3">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
