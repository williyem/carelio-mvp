'use client';

import { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import SearchSvg from '@/assets/icons/search-svg';
import { cn } from '@/lib/utils';

interface PatientSearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  shortcut?: string;
  className?: string;
}

const PatientSearchInput = ({
  placeholder = 'Search patient...',
  value,
  onChange,
  shortcut = '⌘1',
  className,
}: PatientSearchInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+1 (Mac) or Ctrl+1 (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      className={cn('relative w-full min-w-0 overflow-hidden p-1', className)}
    >
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        icon={<SearchSvg />}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          'w-full min-w-0 border-(--border-stroke) rounded-[8px] h-[36px] min-h-[36px] shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] bg-(--bg-white) focus-visible:ring-0 focus-visible:ring-offset-0 text-[14px] text-(--text-gray-placeholder) tracking-[-0.084px] placeholder:text-(--text-gray-placeholder) overflow-hidden'
        )}
        style={shortcut ? { paddingRight: '4.5rem' } : undefined}
      />
      {shortcut && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <div className="bg-(--bg-white) border border-(--border-stroke) flex items-center overflow-clip px-1.5 py-0.5 rounded-[4px] shrink-0">
            <p className="font-medium leading-4 text-[12px] text-(--text-gray-placeholder) tracking-[0.48px] uppercase">
              {shortcut}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSearchInput;
