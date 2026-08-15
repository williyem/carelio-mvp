'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVideoCallStore } from '@/stores/video-call-store';
import {
  useGetConsultationNoteByAppointmentMutation,
  useSubmitSoapNotes,
  useUpdateConsultationNote,
} from '@/integration/appointments';
import { toast } from 'sonner';
import { useSoapDraftStore } from '@/stores/soap-draft-store';
import { useCallParticipantRole } from '@/hooks/page-hooks/video-call/use-call-participant-role';
import { cn } from '@/lib/utils';

import PatientInfoCard from './patient-info-card';
import MeasurementRequestPanel from './measurement-request-panel';
import PatientMeasurementPanel from './patient-measurement-panel';
import SoapNoteEditor from './soap-note-editor';
import HealthRecordsList from './health-records-list';
import VisitReadingsList from './visit-readings-list';
import { Spinner } from '../ui/spinner';

type DoctorView = 'records' | 'devices' | 'notes';

const DOCTOR_LINKS: { id: DoctorView; label: string }[] = [
  { id: 'records', label: 'Patient info' },
  { id: 'devices', label: 'Devices & measurements' },
  { id: 'notes', label: 'Add notes' },
];

const VideoCallLiveVitals = () => {
  const { selectedAppointment, selectedPatient } = useVideoCallStore();
  const appointmentId = selectedAppointment?.id;
  const { role, isLoading: isRoleLoading } = useCallParticipantRole();
  const isDoctor = role === 'doctor';
  const callPatient = {
    ...(selectedPatient || {}),
    ...(selectedAppointment?.patient || {}),
    fullName:
      selectedAppointment?.patient?.fullName ||
      selectedPatient?.fullName ||
      selectedPatient?.name,
  };

  const [doctorView, setDoctorView] = useState<DoctorView>('records');

  const [soapNotes, setSoapNotes] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });

  const submitSoapMutation = useSubmitSoapNotes();
  const getConsultationNoteByAppointmentMutation =
    useGetConsultationNoteByAppointmentMutation();
  const updateConsultationNoteMutation = useUpdateConsultationNote();
  const getDraft = useSoapDraftStore((s) => s.getDraft);
  const saveDraft = useSoapDraftStore((s) => s.saveDraft);

  const persistLocal = () => {
    if (!appointmentId) return;
    saveDraft(appointmentId, { ...soapNotes, status: 'DRAFT' });
  };

  useEffect(() => {
    if (!appointmentId) return;

    const local = getDraft(appointmentId);
    if (local) {
      setSoapNotes({
        subjective: local.subjective,
        objective: local.objective,
        assessment: local.assessment,
        plan: local.plan,
      });
    }

    getConsultationNoteByAppointmentMutation.mutate(appointmentId, {
      onSuccess: (data) => {
        const soap = data?.soapNote || data;
        if (!soap) return;
        setSoapNotes({
          subjective: soap.subjective || local?.subjective || '',
          objective: soap.objective || local?.objective || '',
          assessment: soap.assessment || local?.assessment || '',
          plan: soap.plan || local?.plan || '',
        });
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  const isLoading =
    submitSoapMutation.isPending ||
    updateConsultationNoteMutation.isPending ||
    getConsultationNoteByAppointmentMutation.isPending;

  const handleSaveNotes = async () => {
    if (!appointmentId) {
      toast.error('No active appointment found');
      return;
    }

    persistLocal();

    const payload = { ...soapNotes, action: 'save' as const };

    try {
      const existing = await new Promise<{ id?: string } | null | undefined>(
        (resolve) => {
          getConsultationNoteByAppointmentMutation.mutate(appointmentId, {
            onSuccess: (data) => resolve(data),
            onError: () => resolve(undefined),
          });
        }
      );

      if (existing?.id) {
        await updateConsultationNoteMutation.mutateAsync({
          noteId: existing.id,
          data: payload,
        });
      } else {
        await submitSoapMutation.mutateAsync({
          appointmentId,
          data: payload,
        });
      }
      toast.success('Draft saved');
      setDoctorView('records');
    } catch {
      toast.success('Draft saved locally');
      setDoctorView('records');
    }
  };
  const handleNoteChange = (key: keyof typeof soapNotes, value: string) => {
    setSoapNotes((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (isRoleLoading) {
    return (
      <div className="bg-(--bg-white) py-6 w-full xl:w-[450px] 2xl:w-[559px] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isDoctor) {
    return (
      <div className="bg-(--bg-white) py-6 w-full xl:w-[450px] 2xl:w-[559px] relative flex flex-col h-full overflow-hidden xl:border-l xl:border-(--border-video)">
        <div className="flex-1 min-h-0 px-4 sm:px-8">
          <ScrollArea className="h-full">
            <div className="pb-8">
              <PatientMeasurementPanel appointmentId={appointmentId} />
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-(--bg-white) py-6 w-full xl:w-[450px] 2xl:w-[559px] relative flex flex-col h-full overflow-hidden xl:border-l xl:border-(--border-video)">
      <div className="flex-1 min-h-0 px-4 sm:px-8 flex flex-col">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-4">
          {DOCTOR_LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => setDoctorView(link.id)}
              className={cn(
                'text-sm cursor-pointer underline-offset-4',
                doctorView === link.id
                  ? 'text-brand-blue font-semibold underline'
                  : 'text-gray-500 hover:text-gray-900 underline'
              )}
            >
              {link.label}
            </button>
          ))}
        </div>

        {doctorView === 'notes' ? (
          <div className="flex flex-col h-full min-h-0">
            <div className="mb-4">
              <h3 className="font-bold text-gray-900">Clinical notes</h3>
              <p className="text-sm text-(--text-secondary) mt-1">
                Record SOAP notes for this visit. Save a draft anytime, or
                finalize when the consultation is complete.
              </p>
            </div>
            <Tabs
              defaultValue="subjective"
              className="w-full flex-1 min-h-0 flex flex-col"
            >
              <TabsList className="bg-[#F9F9F9] p-1 rounded-full flex gap-1 w-full h-auto">
                {(
                  ['subjective', 'objective', 'assessment', 'plan'] as const
                ).map((key) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="flex-1 py-3 px-3 rounded-full text-xs md:text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-500 hover:text-gray-700 capitalize"
                  >
                    {key}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="flex-1 min-h-0 mt-4">
                {(
                  ['subjective', 'objective', 'assessment', 'plan'] as const
                ).map((key) => (
                  <TabsContent key={key} value={key} className="h-full mt-0">
                    <SoapNoteEditor
                      placeholder={`Enter ${key} notes...`}
                      value={soapNotes[key]}
                      onChange={(val) => handleNoteChange(key, val)}
                      type={key}
                    />
                  </TabsContent>
                ))}
              </div>
            </Tabs>
            <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 bg-[#2E90FA] hover:bg-[#2E90FA]/90 text-white rounded-full h-12 font-bold cursor-pointer"
                onClick={handleSaveNotes}
                disabled={isLoading}
              >
                {isLoading ? <Spinner /> : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 min-h-0">
            <div className="grid grid-cols-1 gap-6 pb-8">
              {doctorView === 'records' && (
                <>
                  <div>
                    <h3 className="font-bold text-gray-900">Patient info</h3>
                    <p className="text-sm text-(--text-secondary) mt-1">
                      Profile details for the patient on this call.
                    </p>
                  </div>
                  <PatientInfoCard patient={callPatient} />
                  <HealthRecordsList
                    patientId={
                      selectedPatient?.id ||
                      selectedAppointment?.patient?.id ||
                      selectedAppointment?.patientId ||
                      ''
                    }
                  />
                </>
              )}
              {doctorView === 'devices' && (
                <>
                  <MeasurementRequestPanel appointmentId={appointmentId} />
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-gray-900">This visit</h3>
                      <p className="text-sm text-(--text-secondary) mt-1">
                        Readings come in confirmed. Reject any that look wrong.
                      </p>
                    </div>
                    <VisitReadingsList
                      appointmentId={appointmentId}
                      canReject
                    />
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default VideoCallLiveVitals;
