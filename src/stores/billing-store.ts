'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BillingAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
}

export interface DummyCard {
  brand: string;
  last4: string;
  expMonth: string;
  expYear: string;
  nameOnCard: string;
}

export interface PayoutRow {
  id: string;
  invoice: string;
  amount: string;
  date: string;
  status: 'Paid' | 'Pending';
}

export interface DoctorBilling {
  address: BillingAddress;
  card: DummyCard;
  entitledAmount: string;
  payouts: PayoutRow[];
}

export interface PatientInvoice {
  id: string;
  description: string;
  amount: string;
  date: string;
  status: 'Paid' | 'Due';
}

export interface PatientBilling {
  balance: string;
  invoices: PatientInvoice[];
}

export const defaultDoctorBilling = (): DoctorBilling => ({
  address: {
    line1: '1200 Carelio Way',
    line2: 'Suite 400',
    city: 'Boston',
    state: 'MA',
    zip: '02108',
  },
  card: {
    brand: 'Visa',
    last4: '4242',
    expMonth: '12',
    expYear: '2027',
    nameOnCard: 'Carelio Clinic',
  },
  entitledAmount: '$2,450.00',
  payouts: [
    {
      id: 'po-1',
      invoice: 'INV-1042',
      amount: '$820.00',
      date: 'Aug 1, 2026',
      status: 'Paid',
    },
    {
      id: 'po-2',
      invoice: 'INV-1055',
      amount: '$640.00',
      date: 'Aug 8, 2026',
      status: 'Pending',
    },
  ],
});

const defaultPatientBilling = (): PatientBilling => ({
  balance: '$0.00',
  invoices: [
    {
      id: 'inv-1',
      description: 'Telehealth consultation',
      amount: '$75.00',
      date: 'Jul 28, 2026',
      status: 'Paid',
    },
  ],
});

interface BillingState {
  byDoctorId: Record<string, DoctorBilling>;
  byPatientId: Record<string, PatientBilling>;
  getDoctorBilling: (doctorId: string) => DoctorBilling;
  setDoctorBilling: (doctorId: string, value: DoctorBilling) => void;
  getPatientBilling: (patientId: string) => PatientBilling;
}

export const useBillingStore = create<BillingState>()(
  persist(
    (set, get) => ({
      byDoctorId: {},
      byPatientId: {},
      getDoctorBilling: (doctorId) =>
        get().byDoctorId[doctorId] ?? defaultDoctorBilling(),
      setDoctorBilling: (doctorId, value) =>
        set((state) => ({
          byDoctorId: { ...state.byDoctorId, [doctorId]: value },
        })),
      getPatientBilling: (patientId) =>
        get().byPatientId[patientId] ?? defaultPatientBilling(),
    }),
    { name: 'carelio.billing' }
  )
);
