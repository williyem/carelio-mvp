import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AddPatientForm } from '@/components/dashboard/add-patient-form';

export default function AddPatientPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium text-(--text-muted) hover:text-(--text-primary) transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
          Add New Patient
        </h1>
      </div>

      <AddPatientForm />
    </div>
  );
}
