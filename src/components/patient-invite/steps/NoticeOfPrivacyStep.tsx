import { AgreementDocumentViewer } from '@/components/documents/AgreementDocumentViewer';

export default function NoticeOfPrivacyStep() {
  return (
    <AgreementDocumentViewer
      title="Notice of Privacy Practices"
      documentName="Notice of Privacy Practices"
      version="1.0"
      requiresSignature={true}
      fieldPrefix="notice_of_privacy"
    />
  );
}
