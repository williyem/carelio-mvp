'use client';

import PostConsultationDetails, {
  type ConsultationSummaryVariant,
} from './post-consultation-details';
import { AppointmentNote, SoapNote } from '@/integration/appointments/types';

interface PostConsultationPageDetailsProps {
  note: AppointmentNote | null;
  hideVitals?: boolean;
  variant?: ConsultationSummaryVariant;
  editable?: boolean;
  soapFields?: SoapNote;
  onSoapChange?: (
    key: 'subjective' | 'objective' | 'assessment' | 'plan',
    value: string
  ) => void;
}

const PostConsultationPageDetails = ({
  note,
  hideVitals = false,
  variant = 'doctor',
  editable = false,
  soapFields,
  onSoapChange,
}: PostConsultationPageDetailsProps) => {
  return (
    <PostConsultationDetails
      note={note}
      hideVitals={hideVitals}
      variant={variant}
      editable={editable}
      soapFields={soapFields}
      onSoapChange={onSoapChange}
    />
  );
};

export default PostConsultationPageDetails;
