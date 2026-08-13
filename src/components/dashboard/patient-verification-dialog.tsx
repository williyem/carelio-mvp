'use client';

import { toast } from 'sonner';
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
import { VerificationStepData } from '@/types/verification.types';
import { useMultiStep } from '@/hooks/use-multi-step';
import VerificationDialogHeader from './verification/verification-dialog-header';
import VerificationDialogCloseButton from './verification/verification-dialog-close-button';
import VerificationSteps from './verification/verification-steps';
import useHealthAssistantMutations from '@/integration/health-assistant/mutations';
import { usePatientVerificationStore } from '@/stores/patient-verifcation-store';

interface PatientVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PatientVerificationDialog = ({
  open,
  onOpenChange,
}: PatientVerificationDialogProps) => {
  const { currentStep, stepData, next, goToStep, updateStepData, reset } =
    useMultiStep<VerificationStepData>({
      initialStep: 0,
      totalSteps: 3,
      initialData: {
        method: 'email',
        contactValue: '',
      },
    });

  const { selectedPatient: patient } = usePatientVerificationStore();

  const {
    verifyPatientEmailMutation,
    verifyPatientCodeMutation,
    assignHealthAssistantMutation,
  } = useHealthAssistantMutations();

  const handleEmailSendCode = async () => {
    if (!patient) return;
    if (patient.emailVerified) {
      toast.error('Patient already verified');
      return;
    }
    verifyPatientEmailMutation.mutate(patient.id, {
      onSuccess: () => {
        toast.success('Verification code sent successfully');
        updateStepData({
          method: 'email',
          contactValue: patient?.email,
        });
        next();
      },
      onError: () => {
        toast.error('Failed to send verification code');
      },
    });
  };

  const handleVerifyCode = async (code: string) => {
    if (!patient) return;
    if (patient.emailVerified) {
      toast.error('Patient already verified');
      return;
    }
    verifyPatientCodeMutation.mutate(
      { patientId: patient.id, code, type: 'email' },
      {
        onSuccess: () => {
          toast.success('Verification code verified successfully');
          updateStepData({ verificationCode: code });
          next();
        },
        onError: () => {
          toast.error('Failed to verify code');
        },
      }
    );
  };

  const handleAssignClinician = async (clinicianId: string) => {
    if (!patient) return;

    assignHealthAssistantMutation.mutate(
      { patientId: patient.id, assistantId: clinicianId },
      {
        onSuccess: () => {
          toast.success('Medical assistant assigned successfully');
          onOpenChange(false);
          reset();
        },
        onError: () => {
          toast.error('Failed to assign medical assistant', {
            description:
              'Please try again or contact support if the issue persists.',
          });
        },
      }
    );
  };

  const isSubmitting =
    verifyPatientEmailMutation.isPending ||
    verifyPatientCodeMutation.isPending ||
    assignHealthAssistantMutation.isPending;

  const handleUseDifferentMethod = () => {
    goToStep(0);
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  if (!patient) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white rounded-[30px] p-6 max-w-[443px] w-full">
        <VerificationDialogCloseButton onClose={handleClose} />

        <div className="flex flex-col gap-[36px] items-start w-full">
          {currentStep === 0 && (
            <div className="flex flex-col gap-[30px] items-start w-full">
              <VerificationDialogHeader patientName={patient.fullName} />
            </div>
          )}

          <VerificationSteps
            step={currentStep}
            stepData={stepData}
            onEmailSendCode={handleEmailSendCode}
            onVerifyCode={handleVerifyCode}
            onAssignClinician={handleAssignClinician}
            onUseDifferentMethod={handleUseDifferentMethod}
            isSubmitting={isSubmitting}
          />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default PatientVerificationDialog;
