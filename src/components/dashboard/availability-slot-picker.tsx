'use client';

import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import ErrorMessage from '@/components/ui/error-message';
import {
  formatTimezoneCaption,
  splitRangesIntoHourSlots,
  type HourSlot,
  type TimeRange,
} from '@/stores/availability-store';

interface AvailabilitySlotPickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  dateOpen: boolean;
  onDateOpenChange: (open: boolean) => void;
  selectedStart?: string;
  selectedEnd?: string;
  onSelectSlot: (slot: HourSlot) => void;
  ranges: TimeRange[] | null;
  slots?: HourSlot[];
  timezone?: string;
  doctorSelected: boolean;
  disabled?: boolean;
  dateError?: string;
  slotError?: string;
  minDate?: Date;
}

const OPEN_DAY_FALLBACK: TimeRange[] = [{ start: '08:00', end: '18:00' }];

export default function AvailabilitySlotPicker({
  date,
  onDateChange,
  dateOpen,
  onDateOpenChange,
  selectedStart,
  selectedEnd,
  onSelectSlot,
  ranges,
  slots: slotsProp,
  timezone,
  doctorSelected,
  disabled,
  dateError,
  slotError,
  minDate,
}: AvailabilitySlotPickerProps) {
  const hourSlots =
    slotsProp ??
    splitRangesIntoHourSlots(ranges === null ? OPEN_DAY_FALLBACK : ranges);

  const closedDay = doctorSelected && date && ranges && ranges.length === 0;

  return (
    <div className="flex flex-col gap-2 items-start w-full">
      <Label className="font-medium leading-[20px] text-(--text-label) text-[14px]">
        Select Availability Date
      </Label>
      <div
        className={cn(
          'bg-white border border-[#f2f2f2] flex flex-col gap-[28px] items-start overflow-hidden px-5 py-[22px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] w-full',
          (!doctorSelected || disabled) && 'opacity-60'
        )}
      >
        <div className="flex items-start justify-between gap-4 w-full">
          <div className="flex flex-col gap-[6px] items-start min-w-0">
            <p className="font-bold text-[#101828] text-[20px] leading-[20px]">
              {date ? format(date, 'EEE, MMM d') : 'Select a date'}
            </p>
            <p className="font-medium text-[#717c9d] text-[12px] leading-[20px]">
              {formatTimezoneCaption(timezone)}
            </p>
          </div>
          <Popover modal open={dateOpen} onOpenChange={onDateOpenChange}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={!doctorSelected || disabled}
                className="bg-white border border-[#d0d5dd] flex gap-2 items-center justify-center px-4 py-[10px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] shrink-0 disabled:cursor-not-allowed"
              >
                <span className="relative size-5 overflow-hidden shrink-0">
                  <img
                    src="/icons/select-date-calendar.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="size-full"
                  />
                </span>
                <span className="font-semibold text-[#667085] text-[14px] leading-[20px] whitespace-nowrap">
                  Select date
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0"
              align="end"
              onOpenAutoFocus={(event) => event.preventDefault()}
            >
              <Calendar
                mode="single"
                selected={date}
                onSelect={(next) => {
                  onDateChange(next);
                  if (next) onDateOpenChange(false);
                }}
                disabled={(day: Date) => (minDate ? day < minDate : false)}
                captionLayout="dropdown"
                initialFocus={false}
              />
            </PopoverContent>
          </Popover>
        </div>

        {!doctorSelected ? (
          <p className="text-sm text-(--text-secondary)">
            Select an assigned doctor to see available times.
          </p>
        ) : !date ? (
          <p className="text-sm text-(--text-secondary)">
            Choose a date to view this doctor&apos;s available periods.
          </p>
        ) : closedDay ? (
          <p className="text-sm text-(--text-secondary)">
            This doctor is not available on the selected date.
          </p>
        ) : hourSlots.length === 0 ? (
          <p className="text-sm text-(--text-secondary)">
            No open periods remain on this date.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            {hourSlots.map((slot) => {
              const selected =
                selectedStart === slot.start && selectedEnd === slot.end;
              return (
                <button
                  key={`${slot.start}-${slot.end}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectSlot(slot)}
                  className={cn(
                    'flex items-center justify-center px-[16px] py-4 text-[12px] font-bold leading-4 transition-colors',
                    selected
                      ? 'bg-[#1792e6] text-white'
                      : 'bg-[rgba(23,146,230,0.1)] text-[#1792e6] hover:bg-[rgba(23,146,230,0.18)]'
                  )}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <ErrorMessage message={dateError} />
      <ErrorMessage message={slotError} />
    </div>
  );
}
