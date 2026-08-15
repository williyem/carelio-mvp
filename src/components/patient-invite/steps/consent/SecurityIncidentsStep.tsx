import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { ConsentFormWrapper } from './ConsentFormWrapper';
import { usePatientInviteStore } from '@/stores/patient-invite-store';

interface ConsentForm {
  patientInitials: string;
  agreeToSign: boolean;
  date: string;
}

export default function SecurityIncidentsStep() {
  const { updateFormData, formData, nextStep } = usePatientInviteStore();

  const { handleSubmit, control, watch } = useForm<ConsentForm>({
    defaultValues: {
      patientInitials: formData.patientInitials || '',
      agreeToSign: false,
      date: new Date().toLocaleDateString('en-CA'),
    },
  });

  const patientInitials = watch('patientInitials');

  React.useEffect(() => {
    if (patientInitials && patientInitials !== formData.patientInitials) {
      updateFormData({ patientInitials });
    }
  }, [patientInitials, formData.patientInitials, updateFormData]);

  const onSubmit = (data: ConsentForm) => {
    updateFormData({
      patientInitials: data.patientInitials,
      date: new Date().toLocaleDateString('en-CA'),
    });
    nextStep();
  };

  return (
    <ConsentFormWrapper
      title="5. Security Incidents"
      onNext={handleSubmit(onSubmit)}
      nextDisabled={!patientInitials}
    >
      <div className="space-y-6 text-left">
        <div className="space-y-4 text-[14px] leading-relaxed text-text-strong-950">
          <p>
            If any breach, unauthorized access, or device issue occurs during
            telehealth, the provider will pause the visit, secure the system,
            and notify you if your information is affected. Care may continue by
            phone, in-person, or be rescheduled.
          </p>
        </div>

        <div className="pt-4 space-y-4 border-t border-(--border-stroke)">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <Label htmlFor="patientInitials">Patient Initials</Label>

              <Controller
                name="patientInitials"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Initials"
                    className="border-0 border-b-2 border-dotted border-(--border-gray) w-full max-w-[300px] outline-none bg-transparent text-base mb-2"
                  />
                )}
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="date">Date</Label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    readOnly={true}
                    className="border-0 border-b-2 border-dotted border-(--border-gray) w-full max-w-[300px] outline-none bg-transparent text-base mb-2"
                  />
                )}
              />{' '}
            </div>
          </div>

          {/* <div className="flex items-start gap-3">
            <Checkbox
              id="treat-agreement"
              className="mt-1"
              checked={agreeToSign}
              onCheckedChange={(val: boolean) => setValue('agreeToSign', val)}
            />
            <SignatureLabel fieldPrefix="treat" />
          </div> */}
        </div>
      </div>
    </ConsentFormWrapper>
  );
}
