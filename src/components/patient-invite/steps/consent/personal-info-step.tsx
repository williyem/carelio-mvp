/* eslint-disable @typescript-eslint/no-explicit-any */
import PatientOnboardingFormContent from '../../patient-onboarding-form-content';
import { usePatientInviteStore } from '@/stores/patient-invite-store';

const PersonalInfoStep = ({
  invitationData,
  handlePersonalInfo,
  isSubmitting,
}: {
  invitationData: any;
  handlePersonalInfo: (data: any) => void;
  isSubmitting: boolean;
  disabledFields?: {
    email?: boolean;
    phoneNumber?: boolean;
  };
}) => {
  const disabledFieldsState = {
    fullName: !!invitationData?.fullName,
    email: !!invitationData?.email,
    phoneNumber: !!invitationData?.phoneNumber,
    dateOfBirth: !!invitationData?.dob,
    address: !!invitationData?.address,
    emergencyContact: !!invitationData?.emergencyContact,
    emergencyContactPhone: !!invitationData?.emergencyContactPhone,
  };
  const { formData } = usePatientInviteStore();
  const hasDisabledFields = Object.values(disabledFieldsState).some(Boolean);

  return (
    <>
      <div
        className="w-[900px] mx-auto mt-8 max-w-[90%] rounded-[16px] x-small-shadow border border-(--border-stroke) p-5"
        key="patient-registration"
      >
        <div className="space-y-3 mb-6">
          <h2 className="text-[24px] font-bold ">Patient Details</h2>
          <p className="font-normal text-text-secondary">
            Provide your details below. This helps to create your profile.
          </p>
          {hasDisabledFields && (
            <div className="bg-brand-blue/10 text-brand-blue border border-brand-blue/20 px-4 py-3 rounded-md text-sm">
              Some fields have been pre-filled based on your invitation. Please
              contact your health assistant if you need to make changes to
              locked fields.
            </div>
          )}
        </div>
        <PatientOnboardingFormContent
          submitButtonText="Continue"
          hideEmail={false}
          defaultValues={{
            email: formData.email || invitationData?.email || '',
            phoneNumber:
              formData.phoneNumber ||
              formData.phone ||
              invitationData?.phoneNumber ||
              '',
            fullName: formData.fullName || invitationData?.fullName || '',
            firstName:
              formData.fullName?.split(' ')[0] ||
              invitationData?.fullName?.split(' ')[0] ||
              '',
            lastName:
              formData.fullName?.split(' ').slice(1).join(' ') ||
              invitationData?.fullName?.split(' ').slice(1).join(' ') ||
              '',
            dateOfBirth: formData.dob
              ? new Date(formData.dob)
              : invitationData?.dob
                ? new Date(invitationData.dob)
                : undefined,
            gender: formData.gender || invitationData?.gender || '',
            address: formData.address || invitationData?.address || '',
            emergencyContact:
              formData.emergencyContact ||
              invitationData?.emergencyContact ||
              '',
            emergencyContactPhone:
              formData.emergencyContactPhone ||
              invitationData?.emergencyContactPhone ||
              '',
          }}
          disabledFields={disabledFieldsState}
          onSubmit={handlePersonalInfo}
          isPending={isSubmitting}
        />
      </div>
    </>
  );
};

export default PersonalInfoStep;
