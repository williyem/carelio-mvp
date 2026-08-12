'use client';

import {
  FieldValues,
  useController,
  UseControllerProps,
} from 'react-hook-form';
import { format, parse, isToday, parseISO } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  TimeSelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface TimePickerProps<
  TFieldValues extends FieldValues = FieldValues,
> extends UseControllerProps<TFieldValues> {
  placeholder?: string;
  selectedDate?: Date | string;
  ignorePastTimes?: boolean;
  disabled?: boolean;
}

const generateTimeSlots = () => {
  const times: string[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i < 96; i++) {
    const slot = new Date(start.getTime() + i * 15 * 60 * 1000);
    times.push(format(slot, 'HH:mm'));
  }

  return times;
};

const TIME_SLOTS = generateTimeSlots();

const formatTimeDisplay = (time: string | undefined) => {
  if (!time) return '';
  const parsed = parse(time, 'HH:mm', new Date());
  return format(parsed, 'h:mm a');
};

const TimePicker = <TFieldValues extends FieldValues = FieldValues>({
  placeholder = 'Select time',
  selectedDate,
  disabled,
  ignorePastTimes = false,
  ...props
}: TimePickerProps<TFieldValues>) => {
  const {
    field: { value, onChange },
  } = useController(props);

  const now = new Date();

  const parsedSelectedDate = selectedDate
    ? typeof selectedDate === 'string'
      ? parseISO(selectedDate)
      : selectedDate
    : null;

  const isSlotDisabled = (slotTime: string) => {
    if (!ignorePastTimes || !parsedSelectedDate) return false;

    const slot = parse(slotTime, 'HH:mm', new Date());

    if (isToday(parsedSelectedDate)) {
      const nowHour = now.getHours();
      const nowMinutes = now.getMinutes();
      const currentTime = nowHour * 60 + nowMinutes;
      const slotMinutes = slot.getHours() * 60 + slot.getMinutes();

      if (slotMinutes <= currentTime) {
        return true;
      }
    }

    return false;
  };

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <TimeSelectTrigger
        className={cn(
          'h-[44px] focus-visible:border-ring focus-visible:outline-none flex items-center w-full font-normal bg-(--bg-white) border border-(--border-light) rounded-[8px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] px-[14px] py-[10px]',
          !value && 'text-(--text-placeholder)'
        )}
      >
        <SelectValue placeholder={placeholder}>
          {value ? formatTimeDisplay(value) : placeholder}
        </SelectValue>
      </TimeSelectTrigger>

      <SelectContent className="max-h-[250px] overflow-y-auto">
        {TIME_SLOTS.map((time) => (
          <SelectItem
            key={time}
            value={time}
            disabled={disabled || isSlotDisabled(time)}
            className="max-md:text-sm"
          >
            {formatTimeDisplay(time)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TimePicker;
