import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { ConsentFormWrapper } from './ConsentFormWrapper';
import { usePatientInviteStore } from '@/stores/patient-invite-store';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebouncedSignatureGeneration } from '@/lib/signatureGenerator';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';

const finalAcknowledgmentSchema = z.object({
  printedName: z.string().min(2, 'Printed name is required'),
  agreement: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the electronic signature consent',
  }),
  date: z.string().min(1, 'Date is required'),
  patientSignature: z.string().optional(),

  // Parent fields (optional in schema, validated dynamically)
  parentGuardianPrintedName: z.string().optional(),
  parentGuardianAgreement: z.boolean().optional(),
  parentGuardianSignature: z.string().optional(),
});

type FinalAcknowledgmentForm = z.infer<typeof finalAcknowledgmentSchema>;

interface FinalAcknowledgmentStepProps {
  onFinish: () => void | Promise<void>;
  isSubmitting?: boolean;
}

export default function FinalAcknowledgmentStep({
  onFinish,
  isSubmitting,
}: FinalAcknowledgmentStepProps) {
  const { updateFormData, formData } = usePatientInviteStore();
  const isMinor = !!formData.parentGuardianName;

  const schema = finalAcknowledgmentSchema.superRefine((data, ctx) => {
    if (isMinor) {
      if (
        !data.parentGuardianPrintedName ||
        data.parentGuardianPrintedName.length < 2
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Parent/Guardian printed name is required',
          path: ['parentGuardianPrintedName'],
        });
      }
      if (data.parentGuardianAgreement !== true) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Parent/Guardian must agree to electronic signature',
          path: ['parentGuardianAgreement'],
        });
      }
    }
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm<FinalAcknowledgmentForm>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      printedName: formData.fullName || '',
      agreement: false,
      date: new Date().toLocaleDateString('en-CA'),
      patientSignature: '',
      parentGuardianPrintedName: formData.parentGuardianName || '',
      parentGuardianAgreement: false,
      parentGuardianSignature: '',
    },
  });

  const watchedPrintedName = watch('printedName');
  const watchedAgreement = watch('agreement');

  React.useEffect(() => {
    if (watchedPrintedName && watchedPrintedName !== formData.fullName) {
      updateFormData({
        fullName: watchedPrintedName,
        printedName: watchedPrintedName,
      });
    }
  }, [watchedPrintedName, formData.fullName, updateFormData]);

  const watchedParentName = watch('parentGuardianPrintedName');
  const watchedParentAgreement = watch('parentGuardianAgreement');

  // Generate signature for Patient
  useDebouncedSignatureGeneration(
    watchedPrintedName,
    watchedAgreement,
    setValue,
    'patientSignature'
  );

  // Generate signature for Parent (if minor)
  useDebouncedSignatureGeneration(
    watchedParentName || '',
    !!watchedParentAgreement,
    setValue,
    'parentGuardianSignature'
  );

  const onSubmit = (data: FinalAcknowledgmentForm) => {
    updateFormData({
      printedName: data.printedName,
      finalSignatureName: data.printedName, // Used for the PDF signature text
      date: data.date,
      ...(isMinor && {
        parentGuardianSignatureName: data.parentGuardianPrintedName, // Used for PDF signature text
      }),
    });
    onFinish();
  };

  return (
    <ConsentFormWrapper
      title="11. Final Acknowledgment & Signature"
      onNext={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      nextDisabled={!isValid}
    >
      <div className="space-y-6 text-left">
        <div className="space-y-4 text-[14px] leading-relaxed text-text-strong-950">
          <p>
            I acknowledge that I have read and agree to Carelio’s privacy
            practices, telehealth consent, and related terms for care delivered
            in Ghana, and that care may be delivered by Carelio-affiliated
            providers.
          </p>
        </div>

        <div className="pt-4 space-y-6 border-t border-gray-100">
          {/* --- Patient Section --- */}
          <div className="space-y-4">
            {/* 1. Printed Name */}
            <div className="space-y-2">
              <Label htmlFor="printedName">Printed Name:</Label>
              <input
                id="printedName"
                {...register('printedName')}
                className="border-0 border-b-2 border-dotted border-gray-400 w-full max-w-[300px] outline-none bg-transparent text-base mb-2"
                placeholder="Enter your full name"
              />
              {errors.printedName && (
                <p className="text-red-600 text-xs">
                  {errors.printedName.message}
                </p>
              )}
            </div>

            {/* 2. Agreement Checkbox */}
            <div className="space-y-2">
              <Controller
                name="agreement"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="patient-agreement"
                      checked={value}
                      onCheckedChange={onChange}
                      className="size-4 mt-0.5"
                    />
                    <label
                      htmlFor="patient-agreement"
                      className="typography-paragraph-small text-text-strong-950 leading-normal cursor-pointer"
                    >
                      I agree to electronically sign this document using my
                      printed name above
                    </label>
                  </div>
                )}
              />
              {errors.agreement && (
                <div className="text-red-600 text-xs">
                  {errors.agreement.message}
                </div>
              )}
            </div>

            {/* 3. Patient Signature Display */}
            <div>
              <div className="typography-paragraph-medium font-normal mb-1">
                Patient Signature:
              </div>
              <div className="border-b-2 border-dotted border-gray-400 w-full max-w-[300px] h-[60px] relative mb-2 min-w-[200px] flex items-center">
                <Controller
                  name="patientSignature"
                  control={control}
                  render={({ field: { value } }) => (
                    <div className="w-full h-full relative">
                      {value && value.startsWith('data:image') ? (
                        <Image
                          src={value}
                          alt="Generated signature"
                          width={300}
                          height={80}
                          className="w-full h-[60px] object-contain absolute left-0 top-0 rounded-[4px]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-start text-gray-400 text-sm italic">
                          Signature will appear here
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* 4. Date */}
            <div>
              <div className="typography-paragraph-medium font-normal mb-1">
                Date:
              </div>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    readOnly={true}
                    className="border-0 border-b-2 border-dotted border-gray-400 w-full max-w-[300px] outline-none bg-transparent text-base mb-2 font-medium"
                  />
                )}
              />
            </div>
          </div>

          {/* --- Parent/Guardian Section (if minor) --- */}
          {isMinor && (
            <div className="space-y-4 pt-6 border-t border-gray-100/50">
              <h3 className="font-semibold text-sm text-text-strong-950">
                Parent/Guardian Acknowledgment
              </h3>

              {/* 1. Parent Printed Name */}
              <div className="space-y-2">
                <Label htmlFor="parentGuardianPrintedName">
                  Parent/Guardian Printed Name:
                </Label>
                <input
                  id="parentGuardianPrintedName"
                  {...register('parentGuardianPrintedName')}
                  placeholder="Parent/Guardian full name"
                  className="border-0 border-b-2 border-dotted border-gray-400 w-full max-w-[300px] outline-none bg-transparent text-base mb-2"
                />
                {errors.parentGuardianPrintedName && (
                  <p className="text-red-600 text-xs">
                    {errors.parentGuardianPrintedName.message}
                  </p>
                )}
              </div>

              {/* 2. Parent Agreement */}
              <div className="space-y-2">
                <Controller
                  name="parentGuardianAgreement"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="parent-agreement"
                        checked={value}
                        onCheckedChange={onChange}
                        className="size-4 mt-0.5"
                      />
                      <label
                        htmlFor="parent-agreement"
                        className="typography-paragraph-small text-text-strong-950 leading-normal cursor-pointer"
                      >
                        I agree to electronically sign this document using my
                        printed name above
                      </label>
                    </div>
                  )}
                />
                {errors.parentGuardianAgreement && (
                  <div className="text-red-600 text-xs">
                    {errors.parentGuardianAgreement.message}
                  </div>
                )}
              </div>

              {/* 3. Parent Signature Display */}
              <div>
                <div className="typography-paragraph-medium font-normal mb-1">
                  Parent/Guardian Signature:
                </div>
                <div className="border-b-2 border-dotted border-gray-400 w-full max-w-[300px] h-[60px] relative mb-2 min-w-[200px] flex items-center">
                  <Controller
                    name="parentGuardianSignature"
                    control={control}
                    render={({ field: { value } }) => (
                      <div className="w-full h-full relative">
                        {value && value.startsWith('data:image') ? (
                          <Image
                            src={value}
                            alt="Parent Generated signature"
                            width={300}
                            height={80}
                            className="w-full h-[60px] object-contain absolute left-0 top-0 rounded-[4px]"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-start text-gray-400 text-sm italic">
                            Signature will appear here
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ConsentFormWrapper>
  );
}
