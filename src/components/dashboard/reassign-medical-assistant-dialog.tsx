'use client';
import { toast } from 'sonner';
import MedicalAssistantAssignment from '@/components/dashboard/verification/medical-assistant-assignment';
import { VerificationDialogCloseButton } from './verification';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PatientRow } from '@/integration/health-assistant/types';
import useHealthAssistantMutations from '@/integration/health-assistant/mutations';

interface ReassignMedicalAssistantDialogProps {
  patient: PatientRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReassignMedicalAssistantDialog = ({
  patient,
  open,
  onOpenChange,
}: ReassignMedicalAssistantDialogProps) => {
  const { assignHealthAssistantMutation } = useHealthAssistantMutations();

  const isSubmitting = assignHealthAssistantMutation.isPending;

  const handleReassign = async (assistantId: string) => {
    if (!patient) return;

    assignHealthAssistantMutation.mutate(
      {
        patientId: patient.id,
        assistantId,
      },
      {
        onSuccess: () => {
          const action = patient.assignedAssistantId
            ? 'reassigned'
            : 'assigned';
          toast.success(`Medical assistant ${action} successfully`, {
            description: `The patient has been ${action} to the selected medical assistant.`,
          });
          onOpenChange(false);
        },
        onError: (error) => {
          console.error('Error reassigning medical assistant:', error);
          toast.error('Failed to reassign medical assistant', {
            description:
              'Please try again or contact support if the issue persists.',
          });
        },
      }
    );
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!patient) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white rounded-[30px] p-6 max-w-[443px] w-full">
        <VerificationDialogCloseButton onClose={handleClose} />
        <AlertDialogTitle className="hidden"></AlertDialogTitle>

        <div className="flex flex-col gap-[36px] items-start w-full">
          <MedicalAssistantAssignment
            onAssign={handleReassign}
            isSubmitting={isSubmitting}
            title={
              patient.assignedAssistantId
                ? 'Reassign Medical Assistant'
                : 'Assign Medical Assistant'
            }
            subtitle={
              patient.assignedAssistantId
                ? 'Change the medical assistant for this patient.'
                : 'Assign a medical assistant to this patient.'
            }
            buttonText={
              patient.assignedAssistantId
                ? 'Confirm Reassignment'
                : 'Confirm Assignment'
            }
            currentAssistantId={patient.assignedAssistantId || undefined}
            currentAssistantName={patient.assignedAssistantName}
          />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReassignMedicalAssistantDialog;
