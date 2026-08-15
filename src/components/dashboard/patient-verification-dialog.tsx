'use client';

import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
import { VerificationStepData } from '@/types/verification.types';
import { useMultiStep } from '@/hooks/use-multi-step';
import VerificationDialogHeader from './verification/verification-dialog-header';
import VerificationDialogCloseButton from './verification/verification-dialog-close-button';
import VerificationSteps from './verification/verification-steps';
import { usePatientVerificationStore } from '@/stores/patient-verifcation-store';
import {
  staffVerifyPatientCode,
  staffVerifyPatientEmail,
  type StaffPortal,
} from '@/integration/patient/api-function';

interface PatientVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portal?: StaffPortal;
  onLinked?: () => void;
}

const PatientVerificationDialog = ({
  open,
  onOpenChange,
  portal = 'health-assistant',
  onLinked,
}: PatientVerificationDialogProps) => {
  const { currentStep, stepData, next, goToStep, updateStepData, reset } =
    useMultiStep<VerificationStepData>({
      initialStep: 0,
      totalSteps: 2,
      initialData: {
        method: 'email',
        contactValue: '',
      },
    });

  const queryClient = useQueryClient();
  const { selectedPatient: patient } = usePatientVerificationStore();

  const sendCodeMutation = useMutation({
    mutationFn: (patientId: string) =>
      staffVerifyPatientEmail(patientId, portal),
  });
  const verifyCodeMutation = useMutation({
    mutationFn: ({ patientId, code }: { patientId: string; code: string }) =>
      staffVerifyPatientCode(patientId, code, portal),
  });

  const handleEmailSendCode = async () => {
    if (!patient) return;
    sendCodeMutation.mutate(patient.id, {
      onSuccess: () => {
        toast.success('Verification code sent successfully');
        updateStepData({
          method: 'email',
          contactValue: patient.email || 'the email on file',
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
    verifyCodeMutation.mutate(
      { patientId: patient.id, code },
      {
        onSuccess: () => {
          toast.success('Access granted for 24 hours');
          updateStepData({ verificationCode: code });
          queryClient.invalidateQueries();
          onOpenChange(false);
          reset();
          onLinked?.();
        },
        onError: () => {
          toast.error('Failed to verify code');
        },
      }
    );
  };

  const isSubmitting =
    sendCodeMutation.isPending || verifyCodeMutation.isPending;

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  if (!patient) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-(--bg-white) rounded-[30px] p-6 max-w-[443px] w-full">
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
            onUseDifferentMethod={() => goToStep(0)}
            isSubmitting={isSubmitting}
          />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default PatientVerificationDialog;
