'use client';

import { useId, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type {
  AppointmentNote,
  PlanShareRecipient,
  SoapNote,
} from '@/integration/appointments/types';
import {
  hasSoapContent,
  SOAP_SECTION_COPY,
  SOAP_SECTION_KEYS,
  type SoapSectionType,
} from '@/lib/soap-note';

interface SendPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: AppointmentNote | null;
  soapFields?: SoapNote;
  isSending: boolean;
  onSend: (recipients: PlanShareRecipient[], fields: SoapSectionType[]) => void;
}

function initialFieldState(soapFields?: SoapNote) {
  return Object.fromEntries(
    SOAP_SECTION_KEYS.map((key) => [key, hasSoapContent(soapFields?.[key])])
  ) as Record<SoapSectionType, boolean>;
}

function RecipientRow({
  title,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();

  return (
    <div
      className={`flex items-start gap-3 rounded-[10px] border border-(--border-stroke) p-4 ${
        disabled ? 'opacity-60' : ''
      }`}
    >
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange?.(value === true)}
        className="mt-0.5"
      />
      <span className="flex flex-col gap-1">
        <Label htmlFor={id} className="font-semibold text-(--text-primary)">
          {title}
        </Label>
        <span className="text-sm text-(--text-secondary) font-normal">
          {description}
        </span>
      </span>
    </div>
  );
}

function SendPlanForm({
  note,
  soapFields,
  isSending,
  onOpenChange,
  onSend,
}: Omit<SendPlanDialogProps, 'open'>) {
  const [step, setStep] = useState<1 | 2>(1);
  const [fields, setFields] = useState(() => initialFieldState(soapFields));
  const [sendToPatient, setSendToPatient] = useState(true);
  const [sendToAssistant, setSendToAssistant] = useState(true);

  const selectedFields = SOAP_SECTION_KEYS.filter((key) => fields[key]);
  const recipients: PlanShareRecipient[] = [
    ...(sendToPatient ? (['patient'] as const) : []),
    ...(sendToAssistant ? (['healthAssistant'] as const) : []),
  ];
  const alreadySentToPatient = Boolean(note?.planSharedWithPatientAt);
  const alreadySentToAssistant = Boolean(note?.planSharedWithHealthAssistantAt);

  const toggleField = (key: SoapSectionType, checked: boolean) => {
    setFields((prev) => ({ ...prev, [key]: checked }));
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{step === 1 ? 'Share SOAP notes' : 'Send to'}</DialogTitle>
        <DialogDescription>
          {step === 1
            ? 'Choose which SOAP sections to share. Step 1 of 2.'
            : 'Choose who should receive the selected notes. Step 2 of 2.'}
        </DialogDescription>
      </DialogHeader>

      {step === 1 ? (
        <div className="flex flex-col gap-4 py-2">
          {SOAP_SECTION_KEYS.map((key) => {
            const hasContent = hasSoapContent(soapFields?.[key]);
            return (
              <RecipientRow
                key={key}
                title={SOAP_SECTION_COPY[key].title}
                description={
                  hasContent
                    ? SOAP_SECTION_COPY[key].description
                    : 'No notes in this section yet'
                }
                checked={fields[key]}
                disabled={!hasContent}
                onCheckedChange={(checked) => toggleField(key, checked)}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4 py-2">
          <RecipientRow
            title="Patient"
            description={
              alreadySentToPatient
                ? 'Already shared — sending again adds the selected sections'
                : 'Share in the patient’s health records'
            }
            checked={sendToPatient}
            onCheckedChange={setSendToPatient}
          />
          <RecipientRow
            title="Health assistant"
            description={
              alreadySentToAssistant
                ? 'Already shared — sending again adds the selected sections'
                : 'Share on the health assistant visit summary'
            }
            checked={sendToAssistant}
            onCheckedChange={setSendToAssistant}
          />
          <RecipientRow
            title="Assigned doctor"
            description="Coming soon — send to another assigned doctor"
            checked={false}
            disabled
          />
        </div>
      )}

      <DialogFooter className="gap-2 sm:gap-2">
        {step === 1 ? (
          <>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => onOpenChange(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full bg-brand-blue hover:bg-brand-blue/90 text-white"
              disabled={selectedFields.length === 0}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setStep(1)}
              disabled={isSending}
            >
              Back
            </Button>
            <Button
              type="button"
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={recipients.length === 0 || isSending}
              onClick={() => onSend(recipients, selectedFields)}
            >
              {isSending ? <Spinner /> : 'Send'}
            </Button>
          </>
        )}
      </DialogFooter>
    </>
  );
}

const SendPlanDialog = ({
  open,
  onOpenChange,
  note,
  soapFields,
  isSending,
  onSend,
}: SendPlanDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] bg-white">
        {open ? (
          <SendPlanForm
            note={note}
            soapFields={soapFields}
            isSending={isSending}
            onOpenChange={onOpenChange}
            onSend={onSend}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default SendPlanDialog;
