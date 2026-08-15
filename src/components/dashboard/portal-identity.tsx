import { cn } from '@/lib/utils';

export function PortalChip({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-(--border-stroke) bg-(--bg-primary) px-3 py-1 text-xs font-semibold text-(--text-secondary)',
        className
      )}
    >
      {label}
    </span>
  );
}

export function doctorRoleLabel(isAdmin?: boolean) {
  return isAdmin ? 'Super admin' : 'Doctor';
}
