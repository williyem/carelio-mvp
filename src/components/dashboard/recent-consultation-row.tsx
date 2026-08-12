import UserSvg from '@/assets/icons/user-svg';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Patient } from '@/types/patient.types';

const RecentConsultationRow = ({
  patient,
  selectedPatient,
  handlePatientSelect,
}: {
  patient: Patient;
  selectedPatient: Patient | null;
  handlePatientSelect: (patient: Patient) => void;
}) => {
  return (
    <div
      key={patient.id}
      className={cn(
        'flex  items-center justify-between w-full p-4 rounded-xl border cursor-pointer transition-all',
        selectedPatient?.id === patient.id
          ? 'border-brand-blue bg-blue-50/50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      )}
    >
      <div
        onClick={() => handlePatientSelect(patient)}
        className={cn('flex items-center w-full gap-4 ')}
      >
        <Avatar className="h-10 w-10 bg-gray-100">
          <AvatarFallback className="text-gray-500">
            <UserSvg />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-gray-900">
            {patient.fullName || patient.patientId}
          </h3>
          <p className="text-sm text-gray-500">
            {patient.email || patient.phoneNumber}
          </p>
          {patient?.isRegistrationComplete ? null : (
            <p className="text-xs text-red-500">Registration Incomplete</p>
          )}
        </div>
      </div>

      {/* <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" /> */}
    </div>
  );
};

export default RecentConsultationRow;
