'use client';

import { Label } from '@/components/ui/label';

const FIELD_CLASS =
  'border-0 border-b-2 border-dotted border-gray-400 w-full outline-none bg-transparent text-base h-11';

export function ConsentSignRow({
  initialsId = 'patientInitials',
  initialsValue,
  onInitialsChange,
  dateValue,
  printedNameId,
  printedNameValue,
  onPrintedNameChange,
  mode = 'initials',
}: {
  initialsId?: string;
  initialsValue?: string;
  onInitialsChange?: (value: string) => void;
  dateValue: string;
  printedNameId?: string;
  printedNameValue?: string;
  onPrintedNameChange?: (value: string) => void;
  mode?: 'initials' | 'printedName';
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
      <div className="flex flex-col gap-2 items-start w-full">
        {mode === 'printedName' ? (
          <>
            <Label htmlFor={printedNameId || 'printedName'} className="block">
              Printed name
            </Label>
            <input
              id={printedNameId || 'printedName'}
              value={printedNameValue || ''}
              onChange={(e) => onPrintedNameChange?.(e.target.value)}
              placeholder="Enter your full name"
              className={FIELD_CLASS}
            />
          </>
        ) : (
          <>
            <Label htmlFor={initialsId} className="block">
              Patient initials
            </Label>
            <input
              id={initialsId}
              value={initialsValue || ''}
              onChange={(e) => onInitialsChange?.(e.target.value)}
              placeholder="Initials"
              className={FIELD_CLASS}
            />
          </>
        )}
      </div>
      <div className="flex flex-col gap-2 items-start w-full">
        <Label htmlFor="consent-date" className="block">
          Date
        </Label>
        <input
          id="consent-date"
          value={dateValue}
          readOnly
          className={`${FIELD_CLASS} text-text-sub-600`}
        />
      </div>
    </div>
  );
}
