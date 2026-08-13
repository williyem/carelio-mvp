'use client';

import { useMemo } from 'react';
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
  allowedRanges?: { start: string; end: string }[] | null;
}

const TIME_SLOTS = (() => {
  const times: { value: string; label: string }[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i < 96; i++) {
    const slot = new Date(start.getTime() + i * 15 * 60 * 1000);
    const value = format(slot, 'HH:mm');
    times.push({ value, label: format(slot, 'h:mm a') });
  }

  return times;
})();

const TimePicker = <TFieldValues extends FieldValues = FieldValues>({
  placeholder = 'Select time',
  selectedDate,
  disabled,
  ignorePastTimes = false,
  allowedRanges = null,
  ...props
}: TimePickerProps<TFieldValues>) => {
  const {
    field: { value, onChange },
  } = useController(props);

  const parsedSelectedDate = selectedDate
    ? typeof selectedDate === 'string'
      ? parseISO(selectedDate)
      : selectedDate
    : null;

  const slots = useMemo(() => {
    let next = TIME_SLOTS;

    if (allowedRanges) {
      next = next.filter((slot) => {
        const [hours, minutes] = slot.value.split(':').map(Number);
        const value = hours * 60 + minutes;
        return allowedRanges.some((range) => {
          const [startH, startM] = range.start.split(':').map(Number);
          const [endH, endM] = range.end.split(':').map(Number);
          return value >= startH * 60 + startM && value < endH * 60 + endM;
        });
      });
    }

    if (
      !ignorePastTimes ||
      !parsedSelectedDate ||
      !isToday(parsedSelectedDate)
    ) {
      return next;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return next.filter((slot) => {
      const parsed = parse(slot.value, 'HH:mm', now);
      return parsed.getHours() * 60 + parsed.getMinutes() > currentMinutes;
    });
  }, [allowedRanges, ignorePastTimes, parsedSelectedDate]);

  const selectedLabel =
    TIME_SLOTS.find((slot) => slot.value === value)?.label ?? value;

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <TimeSelectTrigger
        className={cn(
          'h-[44px] focus-visible:border-ring focus-visible:outline-none flex items-center w-full font-normal bg-(--bg-white) border border-(--border-light) rounded-[8px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] px-[14px] py-[10px]',
          !value && 'text-(--text-placeholder)'
        )}
      >
        <SelectValue placeholder={placeholder}>
          {value ? selectedLabel : placeholder}
        </SelectValue>
      </TimeSelectTrigger>

      <SelectContent
        position="popper"
        className="max-h-[250px] overflow-y-auto"
      >
        {slots.map((slot) => (
          <SelectItem
            key={slot.value}
            value={slot.value}
            className="max-md:text-sm"
          >
            {slot.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TimePicker;
