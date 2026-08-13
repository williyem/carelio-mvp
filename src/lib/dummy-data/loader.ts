import type { PaginatedResponse } from '@/integration/appointments/types';
import type { Appointment } from '@/integration/appointments/types';
import type { AppointmentNote } from '@/integration/appointments/types';
import type { Patient } from '@/integration/patient/type';
import type { DoctorUser } from '@/integration/auth/doctor/types';
import type { Vital } from '@/types/vitals.types';

import authData from '../../../dummy-data/auth.json';
import doctorData from '../../../dummy-data/doctor.json';
import patientsData from '../../../dummy-data/patients.json';
import appointmentsData from '../../../dummy-data/appointments.json';
import consultationNotesData from '../../../dummy-data/consultation-notes.json';
import vitalsData from '../../../dummy-data/vitals.json';
import statsData from '../../../dummy-data/stats.json';
import healthAssistantsData from '../../../dummy-data/health-assistants.json';
import devicesData from '../../../dummy-data/devices.json';

const doctor = doctorData as DoctorUser;

const withDoctor = (appointment: Appointment): Appointment => ({
  ...appointment,
  doctor: {
    id: doctor.id,
    email: doctor.email,
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    phoneNumber: doctor.phoneNumber,
    twoFactorEnabled: doctor.twoFactorEnabled,
    isActive: doctor.isActive,
  },
});

const appointments = (appointmentsData as Appointment[]).map(withDoctor);
const patients = patientsData as Patient[];
const notes = consultationNotesData as AppointmentNote[];
const vitals = vitalsData as Vital[];

export const paginate = <T>(
  items: T[],
  page = 1,
  limit = 10
): PaginatedResponse<T> => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const start = (safePage - 1) * safeLimit;
  const docs = items.slice(start, start + safeLimit);
  const totalDocs = items.length;
  const totalPages = Math.max(1, Math.ceil(totalDocs / safeLimit));

  return {
    docs,
    totalDocs,
    limit: safeLimit,
    totalPages,
    page: safePage,
    pagingCounter: start + 1,
    hasPrevPage: safePage > 1,
    hasNextPage: safePage < totalPages,
    prevPage: safePage > 1 ? safePage - 1 : null,
    nextPage: safePage < totalPages ? safePage + 1 : null,
  };
};

export const dummyData = {
  auth: authData,
  doctor,
  patients,
  appointments,
  notes,
  vitals,
  stats: statsData,
  healthAssistants: healthAssistantsData,
  devices: devicesData,
};

export const getDoctor = () => dummyData.doctor;

export const getDoctorProfile = () => dummyData.doctor;

export const getStats = () => dummyData.stats;

export const getPatientById = (id: string): Patient | undefined =>
  dummyData.patients.find((p) => p.id === id);

export const searchPatients = (
  search = '',
  page = 1,
  limit = 10
): PaginatedResponse<Patient> => {
  const query = search.trim().toLowerCase();
  const filtered = query
    ? dummyData.patients.filter(
        (p) =>
          p.fullName.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query) ||
          p.patientId.toLowerCase().includes(query) ||
          p.phoneNumber?.includes(query)
      )
    : dummyData.patients;

  return paginate(filtered, page, limit);
};

export const getDoctorAppointments = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}): PaginatedResponse<Appointment> => {
  let filtered = [...dummyData.appointments];

  if (params?.status) {
    filtered = filtered.filter((a) => a.status === params.status);
  }

  if (params?.startDate && params?.endDate) {
    const start = new Date(params.startDate).getTime();
    const end = new Date(params.endDate).getTime();
    filtered = filtered.filter((a) => {
      if (!a.startTime) return false;
      const t = new Date(a.startTime).getTime();
      return t >= start && t <= end;
    });
  }

  filtered.sort(
    (a, b) =>
      new Date(b.startTime ?? 0).getTime() -
      new Date(a.startTime ?? 0).getTime()
  );

  return paginate(filtered, params?.page ?? 1, params?.limit ?? 50);
};

export const getRecentAppointments = (): PaginatedResponse<Appointment> => {
  const completed = dummyData.appointments
    .filter((a) => a.status === 'COMPLETED')
    .sort(
      (a, b) =>
        new Date(b.startTime ?? 0).getTime() -
        new Date(a.startTime ?? 0).getTime()
    );

  return paginate(completed, 1, 10);
};

export const getPatientAppointments = (
  patientId: string,
  params?: { page?: number; limit?: number; status?: string }
): PaginatedResponse<Appointment> => {
  let filtered = dummyData.appointments.filter(
    (a) => a.patientId === patientId
  );

  if (params?.status) {
    filtered = filtered.filter((a) => a.status === params.status);
  }

  filtered.sort(
    (a, b) =>
      new Date(b.startTime ?? 0).getTime() -
      new Date(a.startTime ?? 0).getTime()
  );

  return paginate(filtered, params?.page ?? 1, params?.limit ?? 10);
};

export const getAppointmentById = (id: string): Appointment | undefined =>
  dummyData.appointments.find((a) => a.id === id);

export const getPatientHealthRecords = (
  patientId: string,
  params?: { page?: number; limit?: number; search?: string }
): PaginatedResponse<AppointmentNote> => {
  const patientAptIds = dummyData.appointments
    .filter((a) => a.patientId === patientId)
    .map((a) => a.id);

  let filtered = dummyData.notes.filter((n) =>
    patientAptIds.includes(n.appointmentId)
  );

  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (n) =>
        n.summary?.toLowerCase().includes(q) ||
        n.soapNote?.assessment?.toLowerCase().includes(q)
    );
  }

  return paginate(filtered, params?.page ?? 1, params?.limit ?? 10);
};

export const getConsultationNoteByAppointment = (
  appointmentId: string
): AppointmentNote | null =>
  dummyData.notes.find((n) => n.appointmentId === appointmentId) ?? null;

export const getVitalsByAppointment = (appointmentId: string): Vital[] =>
  dummyData.vitals.filter((v) => v.appointmentId === appointmentId);

export const getConsultationToken = (appointmentId: string) => {
  const apt = getAppointmentById(appointmentId);
  return {
    token: apt?.telehealth?.doctorToken ?? 'dummy-consultation-token',
    code: apt?.code ?? 'CRL-000',
    url: '',
  };
};

export const validateLogin = (email: string, password: string): boolean =>
  email === dummyData.auth.credentials.email &&
  password === dummyData.auth.credentials.password;

export const getLoginResponse = () => ({
  tokenData: {
    access: {
      token: dummyData.auth.tokens.access,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    refresh: {
      token: dummyData.auth.tokens.refresh,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  user: dummyData.doctor,
  authenticated: true,
});

export const getSessionResponse = () => ({
  user: dummyData.doctor,
});

export const getDevices = () => dummyData.devices;
