import { cn } from '@/lib/utils';
import { Column } from '@tanstack/react-table';
import SortArrowsSvg from '@/assets/icons/sort-arrows-svg';

interface SortableColumnHeaderProps<TData extends object> {
  column: Column<TData>;
  label: string;
  upperCase?: boolean;
  lowerCase?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SortableColumnHeader: React.FC<SortableColumnHeaderProps<any>> = ({
  column,
  label,
  upperCase,
  lowerCase,
}) => (
  <button
    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    className={cn(
      upperCase ? 'uppercase' : lowerCase ? '' : 'capitalize',
      'flex group items-center gap-x-1 relative cursor-pointer'
    )}
  >
    {label} <SortArrowsSvg />
  </button>
);

export default SortableColumnHeader;
