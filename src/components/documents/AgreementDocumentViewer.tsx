/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import { useDebouncedSignatureGeneration } from '@/lib/signatureGenerator';
import { toLocalISOString } from '@/lib/datetime';
import { useAgreementDocument } from '@/hooks/useAgreementDocument';
import { Skeleton } from '@/components/ui/skeleton';
import { usePatientInviteStore } from '@/stores/patient-invite-store';

import {
  injectFormFields,
  FormFieldConfig,
  CheckboxGroupField,
} from '@/lib/document-field-injection';
import { generateWordDocPdf } from '@/lib/word-to-pdf';
import usePatientInvite from '@/hooks/page-hooks/patient-invite/usePatientInvite';
import { ReviewDocumentSvg } from '@/assets/icons/review-document-svg';
import { Spinner } from '../ui/spinner';

type SignatureFormFields = {
  signature?: string;
  name: string;
  date: string;
  agreement: boolean;
  [key: string]: unknown;
};

const signatureSchema = z.object({
  signature: z.string().optional(),
  name: z.string().min(2, 'Printed name is required'),
  date: z.string().min(1, 'Date is required'),
  agreement: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the electronic signature consent',
  }),
});

interface AgreementDocumentViewerProps {
  title: string;
  documentName: string;
  version?: string;
  requiresSignature?: boolean;
  fieldPrefix: string;
  formFields?: FormFieldConfig[];
  onFinish?: () => Promise<void>;
  finishButtonText?: string;
  isSubmitting?: boolean;
}

export function AgreementDocumentViewer({
  title,
  documentName,
  version = '1.0',
  requiresSignature = true,
  fieldPrefix,
  formFields = [],
  onFinish,
  finishButtonText,
  isSubmitting,
}: AgreementDocumentViewerProps) {
  const { nextStep } = usePatientInvite();
  const { setAgreement } = usePatientInviteStore();
  const [isLoading, setIsLoading] = useState(false);
  const { html, loading, error } = useAgreementDocument(documentName, version);

  const processedHtml = useMemo(() => {
    return injectFormFields(html || '', formFields, false);
  }, [html, formFields]);

  const {
    control,
    getValues,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<SignatureFormFields>({
    resolver: zodResolver(signatureSchema),
    mode: 'onChange',
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      agreement: false,
      name: '',
      signature: '',
    },
  });

  const watchedName = watch('name');
  const watchedAgreement = watch('agreement');

  useDebouncedSignatureGeneration(
    watchedName,
    watchedAgreement,
    setValue,
    'signature'
  );

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      const signedAt = toLocalISOString(new Date());

      // Get form data for signed agreements
      const formData = requiresSignature ? getValues() : undefined;

      const pdfBlob = await generateWordDocPdf({
        documentName,
        title,
        signedBy: requiresSignature ? formData?.name : undefined,
        signedAt: requiresSignature ? signedAt : undefined,
        signatureUrl: requiresSignature ? formData?.signature : undefined,
        returnBlob: true,
      });

      setAgreement(fieldPrefix, {
        pdf: pdfBlob as Blob,
        original: html || '',
      });

      if (onFinish) {
        await onFinish();
      } else {
        nextStep();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[900px] mx-auto mt-8 max-w-[90%] rounded-[16px]  x-small-shadow border border-(--border-stroke) p-5 ">
      <CardHeader className="flex flex-col items-start gap-4">
        <ReviewDocumentSvg />
        <h5 className="typography-h5">{title}</h5>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2 text-left">
        {loading && <DocumentLoadingSkeleton />}

        {error && (
          <div className="w-full bg-state-error-lighter border border-red-200 rounded-8 p-4 text-red-800">
            <strong>Error loading document:</strong> {error}
          </div>
        )}

        {!loading && !error && processedHtml && (
          <div className="typography-paragraph-medium font-normal w-full">
            <DocumentContent
              html={processedHtml}
              formFields={formFields}
              control={control}
            />
          </div>
        )}

        {!loading && !error && (
          <>
            {requiresSignature && (
              <div className="space-y-4 mt-6 w-full">
                <div>
                  <div className="typography-paragraph-medium font-normal mb-1">
                    Printed Name:
                  </div>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="Printed Name"
                        className="border-0 border-b-2 border-dotted border-(--border-gray) w-full max-w-[300px] outline-none bg-transparent text-base mb-2"
                      />
                    )}
                  />
                  {errors.name && (
                    <div className="text-red-600 text-xs">
                      {errors.name.message}
                    </div>
                  )}
                </div>

                <div>
                  <Controller
                    name="agreement"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id={`${fieldPrefix}-agreement`}
                          checked={value}
                          onCheckedChange={onChange}
                          className="size-4 mt-0.5"
                        />
                        <label
                          htmlFor={`${fieldPrefix}-agreement`}
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

                <div>
                  <div className="typography-paragraph-medium font-normal mb-1">
                    Signature:
                  </div>
                  <div
                    className="border-b-2 border-dotted border-(--border-gray) w-full max-w-[300px] h-[60px] relative mb-2 min-w-[200px] flex items-center"
                    data-ph-mask="signature-area"
                  >
                    <Controller
                      name="signature"
                      control={control}
                      render={({ field: { value } }) => (
                        <div
                          className="w-full h-full relative"
                          data-ph-mask="signature-container"
                        >
                          {value && value.startsWith('data:image') ? (
                            <Image
                              src={value}
                              alt="Generated signature"
                              width={300}
                              height={80}
                              className="w-full h-[60px] object-contain absolute left-0 top-0 rounded-[4px]"
                              data-ph-mask="signature-display"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-(--text-muted) text-sm">
                              Signature will appear here
                            </div>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>

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
                        disabled={true}
                        className="border-0 border-b-2 border-dotted border-(--border-gray) w-full max-w-[300px] outline-none bg-transparent text-base mb-2"
                      />
                    )}
                  />
                  {errors.date && (
                    <div className="text-red-600 text-xs">
                      {errors.date.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              variant="brand"
              className="w-full h-[46px] mt-2 text-sm"
              onClick={() => onSubmit()}
              disabled={isLoading || (requiresSignature && !isValid)}
            >
              {isLoading || (isSubmitting && <Spinner className="mr-2" />)}
              {onFinish ? finishButtonText || 'Submit' : 'Agree and Continue'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function DocumentLoadingSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

interface DocumentContentProps {
  html: string;
  formFields: FormFieldConfig[];
  control: any;
}

function DocumentContent({ html, formFields, control }: DocumentContentProps) {
  if (formFields.length === 0) {
    return (
      <div
        className="wrap-break-word"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  const parts: React.ReactNode[] = [];
  let remainingHtml = html;
  const checkboxGroups: React.ReactNode[] = [];
  let foundCheckboxes = false;

  formFields.forEach((field, index) => {
    if (field.type === 'checkbox-group') {
      const marker = `[CHECKBOX_GROUP:${field.fieldName}]`;
      const markerIndex = remainingHtml.indexOf(marker);

      if (markerIndex !== -1) {
        const beforeMarker = remainingHtml.substring(0, markerIndex);

        if (beforeMarker && !foundCheckboxes) {
          foundCheckboxes = true;
          parts.push(
            <div
              key={`html-before`}
              className="wrap-break-word"
              dangerouslySetInnerHTML={{ __html: beforeMarker }}
            />
          );
        }

        checkboxGroups.push(
          <CheckboxGroup
            key={`checkbox-${index}`}
            field={field}
            control={control}
          />
        );

        remainingHtml = remainingHtml.substring(markerIndex + marker.length);

        const isLastCheckboxGroup = index === formFields.length - 1;
        if (isLastCheckboxGroup && checkboxGroups.length > 0) {
          parts.push(
            <div key="checkbox-container">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {checkboxGroups}
              </div>
            </div>
          );
        }
      }
    }
  });

  if (remainingHtml) {
    parts.push(
      <div
        key="html-after"
        className="wrap-break-word"
        dangerouslySetInnerHTML={{ __html: remainingHtml }}
      />
    );
  }

  return <>{parts}</>;
}

interface CheckboxGroupProps {
  field: CheckboxGroupField;
  control: any;
}

function CheckboxGroup({ field, control }: CheckboxGroupProps) {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        {field.title && <h4 className="font-semibold mb-4">{field.title}</h4>}
        <Controller
          name={field.fieldName as any}
          control={control}
          defaultValue={field.options.map((opt) => opt.value) as any}
          render={() => (
            <div className="flex flex-col gap-2">
              {field.options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-default"
                >
                  <Checkbox
                    checked={option.defaultChecked ?? true}
                    disabled={option.disabled ?? true}
                    className="size-4"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}
