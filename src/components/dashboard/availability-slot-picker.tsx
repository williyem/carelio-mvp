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
import { Spinner } from '@/components/ui/spinner';
import {
  formatTimezoneCaption,
  type HourSlot,
} from '@/stores/availability-store';
import Image from 'next/image';
import { CalendarIcon } from 'lucide-react';

interface AvailabilitySlotPickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  dateOpen: boolean;
  onDateOpenChange: (open: boolean) => void;
  selectedStart?: string;
  selectedEnd?: string;
  onSelectSlot: (slot: HourSlot) => void;
  slots?: HourSlot[];
  slotsLoading?: boolean;
  timezone?: string;
  doctorSelected: boolean;
  disabled?: boolean;
  dateError?: string;
  slotError?: string;
  minDate?: Date;
  disabledDate?: (date: Date) => boolean;
}

export default function AvailabilitySlotPicker({
  date,
  onDateChange,
  dateOpen,
  onDateOpenChange,
  selectedStart,
  selectedEnd,
  onSelectSlot,
  slots,
  slotsLoading,
  timezone,
  doctorSelected,
  disabled,
  dateError,
  slotError,
  minDate,
  disabledDate,
}: AvailabilitySlotPickerProps) {
  const hourSlots = slots ?? [];

  return (
    <div className="flex flex-col gap-2 items-start w-full">
      <Label className="font-medium leading-[20px] text-(--text-label) text-[14px]">
        Select Availability Date
      </Label>
      <div
        className={cn(
          'bg-(--bg-white) border border-(--border-stroke) flex flex-col gap-[28px] items-start overflow-hidden px-5 py-[22px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] w-full',
          (!doctorSelected || disabled) && 'opacity-60'
        )}
      >
        <div className="flex items-start justify-between gap-4 w-full">
          <div className="flex flex-col gap-[6px] items-start min-w-0">
            <p className="font-semibold text-(--text-primary) text-[16px] leading-[20px]">
              {date ? format(date, 'EEE, MMM d') : 'Select a date'}
            </p>
            <p className="font-medium text-(--text-muted) text-[12px] leading-[20px]">
              {formatTimezoneCaption(timezone)}
            </p>
          </div>
          <Popover modal open={dateOpen} onOpenChange={onDateOpenChange}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={!doctorSelected || disabled}
                className="bg-(--bg-white) border border-(--border-light) cursor-pointer flex gap-2 items-center justify-center px-4 py-[10px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] shrink-0 disabled:cursor-not-allowed"
              >
                <CalendarIcon className="size-4 text-(--text-muted)" />

                <span className=" text-(--text-muted) text-[14px] leading-[20px] whitespace-nowrap">
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
                disabled={(day: Date) => {
                  if (minDate && day < minDate) return true;
                  return disabledDate?.(day) ?? false;
                }}
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
        ) : slotsLoading ? (
          <div className="flex justify-center w-full py-4">
            <Spinner />
          </div>
        ) : hourSlots.length === 0 ? (
          <p className="text-sm text-(--text-secondary)">
            This doctor is not available on the selected date.
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
                      ? 'bg-brand-blue text-white'
                      : 'bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/15'
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
