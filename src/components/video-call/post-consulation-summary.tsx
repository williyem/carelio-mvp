'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useVideoCallStore } from '@/stores/video-call-store';
import { useGetConsultationNoteByAppointment } from '@/integration/appointments/queries/useGetConsultationNoteByAppointment';
import { useGetAppointmentById } from '@/integration/appointments';
import PostConsultationDetails, {
  soapFieldsFromNote,
} from './post-consultation-details';
import ConsultationNoteActions from './consultation-note-actions';
import VitalsTab from './vitals-tab';
import AppointmentSummaryHeader from './appointment-summary-header';
import { Spinner } from '../ui/spinner';
import ErrorWarningFill from '@/assets/icons/error-warning-fill';
import { useCallParticipantRole } from '@/hooks/page-hooks/video-call/use-call-participant-role';
import { isClinicianCallRole } from '@/lib/call-join';
import { useSoapDraftStore } from '@/stores/soap-draft-store';
import { cn } from '@/lib/utils';
import type { SoapNote } from '@/integration/appointments/types';
import useUser from '@/hooks/useUser';

type TabType = 'SOAP notes' | 'Vitals';

const PostConsultationSummary = () => {
  const {
    postConsultationAppointmentId,
    setPostConsultationAppointmentId,
    selectedPatient,
    selectedAppointment,
    endCall,
  } = useVideoCallStore();
  const { role } = useCallParticipantRole();
  const { userId } = useUser();
  const isDoctor = isClinicianCallRole(role);
  const [activeTab, setActiveTab] = React.useState<TabType>('SOAP notes');

  const [isOpen, setIsOpen] = React.useState(
    !!postConsultationAppointmentId && isDoctor
  );

  React.useEffect(() => {
    if (postConsultationAppointmentId && isDoctor) {
      setIsOpen(true);
      setActiveTab('SOAP notes');
    }
  }, [postConsultationAppointmentId, isDoctor]);

  const { data: currentNote, isLoading } = useGetConsultationNoteByAppointment(
    postConsultationAppointmentId || '',
    !!postConsultationAppointmentId && isDoctor
  );
  const { data: fetchedAppointment } = useGetAppointmentById(
    postConsultationAppointmentId || '',
    !!postConsultationAppointmentId && isDoctor
  );

  const draft = useSoapDraftStore((s) =>
    postConsultationAppointmentId
      ? s.byAppointmentId[postConsultationAppointmentId]
      : undefined
  );

  const [soapFields, setSoapFields] = React.useState<Required<SoapNote>>(
    soapFieldsFromNote(currentNote, draft)
  );

  React.useEffect(() => {
    setSoapFields(soapFieldsFromNote(currentNote, draft));
  }, [currentNote, draft]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      endCall();
      setPostConsultationAppointmentId(null);
    }, 300);
  };

  if (!isDoctor) {
    return null;
  }

  const appointment = fetchedAppointment || selectedAppointment;
  const appointmentDoctorId =
    appointment?.doctorId || appointment?.doctor?.id || '';
  const canManageNote = Boolean(
    userId && appointmentDoctorId && userId === appointmentDoctorId
  );
  const isDraft = currentNote?.status !== 'FINAL';
  const canEdit = canManageNote && isDraft;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="max-w-[90%] sm:max-w-[90%] w-[805px] bg-white p-0 overflow-hidden gap-0 border-none">
        <DialogHeader className="p-5">
          <div className=" w-full flex  items-center justify-center">
            <div className="bg-(--bg-info) size-10 w-[40px] flex items-center justify-center rounded-[10px]">
              <ErrorWarningFill />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold">
            Post-Consultation Summary
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-1 overflow-y-auto max-h-[70vh] space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <>
              <AppointmentSummaryHeader
                appointment={appointment}
                patientName={
                  selectedPatient?.fullName ||
                  selectedPatient?.name ||
                  appointment?.patient?.fullName
                }
              />

              <div className="bg-[#F9F9F9] p-1 rounded-full flex overflow-x-auto no-scrollbar">
                {(['SOAP notes', 'Vitals'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'flex-1 py-3 px-6 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
                      activeTab === tab
                        ? 'bg-white border-(--border-stroke) border text-gray-900'
                        : 'text-gray-900 hover:text-gray-700'
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'SOAP notes' && (
                <div className="space-y-6">
                  <PostConsultationDetails
                    note={currentNote ?? null}
                    appointmentId={postConsultationAppointmentId || undefined}
                    hideVitals
                    editable={canEdit}
                    soapFields={soapFields}
                    onSoapChange={(key, value) =>
                      setSoapFields((prev) => ({ ...prev, [key]: value }))
                    }
                  />
                  {canManageNote && postConsultationAppointmentId ? (
                    <ConsultationNoteActions
                      appointmentId={postConsultationAppointmentId}
                      note={currentNote ?? null}
                      soapFields={soapFields}
                    />
                  ) : null}
                </div>
              )}

              {activeTab === 'Vitals' && postConsultationAppointmentId && (
                <VitalsTab
                  appointmentId={postConsultationAppointmentId}
                  hideTitle
                />
              )}
            </>
          )}
        </div>

        <DialogFooter className="p-6 border-t border-dashed ">
          <Button
            onClick={handleClose}
            variant="outline"
            className="w-full text-brand-blue hover:text-brand-blue rounded-full hover:bg-brand-blue/10 border-brand-blue font-bold h-12"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PostConsultationSummary;
