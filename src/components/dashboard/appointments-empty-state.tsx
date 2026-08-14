import CalendarSvg from '@/assets/icons/calendar-svg';
import { EmptyState } from '@/components/ui/empty-state';

interface AppointmentsEmptyStateProps {
  title: string;
  description?: string;
  className?: string;
}

/** Calendar-flavored empty state for appointment/visit lists. */
export default function AppointmentsEmptyState({
  title,
  description,
  className,
}: AppointmentsEmptyStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={<CalendarSvg />}
      className={className}
    />
  );
}
