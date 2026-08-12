import { AgreementDocumentViewer } from '@/components/documents/AgreementDocumentViewer';

export default function ClientRightsStep() {
  return (
    <AgreementDocumentViewer
      title="Client's Rights"
      documentName="Client's-Rights"
      version="1.0"
      requiresSignature={false}
      fieldPrefix="clients_rights"
    />
  );
}
