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
          : 'border-(--border-stroke) hover:border-(--border-gray) bg-(--bg-white)'
      )}
    >
      <div
        onClick={() => handlePatientSelect(patient)}
        className={cn('flex items-center w-full gap-4 ')}
      >
        <Avatar className="h-10 w-10 bg-(--bg-light-gray)">
          <AvatarFallback className="text-(--text-muted)">
            <UserSvg />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-(--text-primary)">
            {patient.fullName || patient.patientId}
          </h3>
          <p className="text-sm text-(--text-muted)">
            {patient.email || patient.phoneNumber}
          </p>
          {patient?.isRegistrationComplete ? null : (
            <p className="text-xs text-red-500">Registration Incomplete</p>
          )}
        </div>
      </div>

      {/* <ChevronRight className="h-5 w-5 text-(--text-muted) group-hover:text-(--text-secondary) group-hover:translate-x-0.5 transition-all" /> */}
    </div>
  );
};

export default RecentConsultationRow;
