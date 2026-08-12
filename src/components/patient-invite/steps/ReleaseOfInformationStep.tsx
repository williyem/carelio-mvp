import { AgreementDocumentViewer } from '@/components/documents/AgreementDocumentViewer';
import { getReleaseOfInformationFields } from '@/lib/document-field-injection';

export default function ReleaseOfInformationStep({
  onFinish,
  finishButtonText,
  isSubmitting,
}: {
  onFinish?: () => Promise<void>;
  finishButtonText?: string;
  isSubmitting?: boolean;
}) {
  return (
    <AgreementDocumentViewer
      title="Release of Information"
      documentName="Release of Information"
      version="1.0"
      requiresSignature={true}
      fieldPrefix="release_of_information"
      formFields={getReleaseOfInformationFields()}
      onFinish={onFinish}
      finishButtonText={finishButtonText}
      isSubmitting={isSubmitting}
    />
  );
}
