import { AgreementDocumentViewer } from '@/components/documents/AgreementDocumentViewer';

export default function GrievancePolicyStep() {
  return (
    <AgreementDocumentViewer
      title="Grievance Policy"
      documentName="Grievance-Notice"
      version="1.0"
      requiresSignature={false}
      fieldPrefix="grievance_policy"
    />
  );
}
