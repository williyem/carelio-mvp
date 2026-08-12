import { AgreementDocumentViewer } from '@/components/documents/AgreementDocumentViewer';

export default function ConsentForServicesStep() {
  return (
    <AgreementDocumentViewer
      title="Consent for Services"
      documentName="Consent for Services"
      version="1.0"
      requiresSignature={true}
      fieldPrefix="consent"
    />
  );
}
