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
import {
  useGetPatientNotes,
  useUpdateConsultationNote,
} from '@/integration/appointments';
import PostConsultationDetails from './post-consultation-details';
import { Spinner } from '../ui/spinner';
import ErrorWarningFill from '@/assets/icons/error-warning-fill';
import { toast } from 'sonner';

const PostConsultationSummary = () => {
  const {
    postConsultationAppointmentId,
    setPostConsultationAppointmentId,
    selectedPatient,
    endCall,
  } = useVideoCallStore();

  const [isOpen, setIsOpen] = React.useState(!!postConsultationAppointmentId);

  React.useEffect(() => {
    if (postConsultationAppointmentId) {
      setIsOpen(true);
    }
  }, [postConsultationAppointmentId]);

  const { data: notesData, isLoading } = useGetPatientNotes(
    selectedPatient?.id || '',
    {},
    !!postConsultationAppointmentId && !!selectedPatient?.id
  );

  const currentNote = notesData?.docs.find(
    (note) => note.appointmentId === postConsultationAppointmentId
  );
  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      endCall();
      setPostConsultationAppointmentId(null);
    }, 300);
  };

  const updateNoteMutation = useUpdateConsultationNote();

  const handleUpdateNote = () => {
    updateNoteMutation.mutate(
      {
        noteId: currentNote?.id || '',
        data: {
          subjective: currentNote?.soapNote?.subjective || '',
          objective: currentNote?.soapNote?.objective || '',
          assessment: currentNote?.soapNote?.assessment || '',
          plan: currentNote?.soapNote?.plan || '',
          // action: status || 'save',
        },
      },
      {
        onSuccess: () => {
          toast.success('Consultation note updated successfully');
          handleClose();
        },
        onError: () => {
          toast.error('Failed to update consultation note');
        },
      }
    );
  };

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

        <div className="px-6 pb-1 overflow-y-auto max-h-[70vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : currentNote ? (
            <PostConsultationDetails note={currentNote} />
          ) : (
            <div className="py-12 text-center text-gray-500">
              No session summary available.
            </div>
          )}
        </div>

        <DialogFooter className="p-6 border-t border-dashed ">
          {currentNote ? (
            <>
              <Button
                onClick={() => handleUpdateNote()}
                className="w-full bg-brand-blue rounded-full hover:bg-brand-blue/90 text-white font-bold h-12"
              >
                {updateNoteMutation.isPending ? (
                  <Spinner />
                ) : (
                  'Approve & Send to Patient'
                )}
              </Button>
              <Button
                onClick={handleClose}
                variant={'outline'}
                className="w-full text-brand-blue hover:text-brand-blue rounded-full hover:bg-brand-blue/10 border-brand-blue font-bold h-12"
              >
                Save for Later
              </Button>
            </>
          ) : (
            <Button
              onClick={handleClose}
              className="w-full bg-brand-blue rounded-full hover:bg-brand-blue/90 text-white font-bold h-12"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PostConsultationSummary;
