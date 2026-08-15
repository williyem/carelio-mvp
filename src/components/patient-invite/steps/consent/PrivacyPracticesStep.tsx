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

export default function PrivacyPracticesStep() {
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
      title="6. Notice of Privacy Practices"
      onNext={handleSubmit(onSubmit)}
      nextDisabled={!patientInitials}
    >
      <div className="space-y-6 text-left">
        <div className="space-y-4 text-[14px] leading-relaxed text-text-strong-950">
          <p className="font-semibold">
            How Carelio protects your information.
          </p>
          <p>
            Your rights under Ghana’s Data Protection Act, 2012 (Act 843)
            include:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Requesting access to or correction of your records</li>
            <li>Requesting restrictions on how your data is shared</li>
            <li>Choosing confidential communication options where available</li>
            <li>Knowing who on your Carelio care team can access your chart</li>
            <li>Additional protections for minors where required by law</li>
          </ul>

          <p className="font-semibold pt-2">Our Responsibilities</p>
          <p>We are required to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Maintain the privacy and security of your personal and health
              information
            </li>
            <li>Provide you with this Notice upon request</li>
            <li>
              Notify you of a significant breach affecting your personal data
              where required by law
            </li>
            <li>Follow the terms of this Notice</li>
          </ul>

          <p className="font-semibold pt-2">
            How We May Use and Disclose Your Information
          </p>
          <p>We may use or disclose your information for:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Treatment, payment, and healthcare operations</li>
            <li>NHIS or private health-scheme claims and care coordination</li>
            <li>
              When required by Ghanaian law (public health, court orders, etc.)
            </li>
          </ul>
        </div>

        <div className="pt-4 space-y-4 border-t border-gray-100">
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
                    className="border-0 border-b-2 border-dotted border-gray-400 w-full max-w-[300px] outline-none bg-transparent text-base mb-2"
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
                    className="border-0 border-b-2 border-dotted border-gray-400 w-full max-w-[300px] outline-none bg-transparent text-base mb-2"
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
