'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';

interface SoapNoteEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  type: 'subjective' | 'objective' | 'assessment' | 'plan';
}

const SOAP_CONFIG = {
  subjective: {
    bg: '#E8F4FC',
    text: '#1485D0',
    label: "Patient's description of the problem",
  },
  objective: {
    bg: '#E7F7E9',
    text: '#0B7E17',
    label: 'Clinical findings and measurements',
  },
  assessment: {
    bg: '#F6F6F6',
    text: '#444545',
    label:
      'The clinician analyzes the subjective and objective data to determine what’s going on.',
  },
  plan: {
    bg: '#FDFAE7',
    text: '#A8900D',
    label: 'Treatment plan and follow-up',
  },
};

const SoapNoteEditor = ({
  value,
  onChange,
  placeholder,
  className,
  type,
}: SoapNoteEditorProps) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const config = SOAP_CONFIG[type];

  // Sync internal content with value prop when value changes externally
  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Support Bold (Ctrl/Cmd + B)
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      document.execCommand('bold', false);
    }
    // Support Italics (Ctrl/Cmd + I)
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      document.execCommand('italic', false);
    }
    // Support Underline (Ctrl/Cmd + U)
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      document.execCommand('underline', false);
    }
  };

  return (
    <div className={cn('relative w-full space-y-3', className)}>
      <div className="flex items-center gap-3">
        <div
          style={{ backgroundColor: config.bg, color: config.text }}
          className="size-10 flex items-center justify-center font-bold text-lg rounded-full shrink-0"
        >
          {type?.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <p className="capitalize font-bold text-(--text-primary) leading-none mb-1">
            {type}
          </p>
        </div>
      </div>
      <Label className="text-sm inline-block text-(--text-secondary) font-normal">
        {config.label}
      </Label>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full h-64 bg-(--bg-input) border border-(--border-input) rounded-[8px] p-4 text-(--text-gray) text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 overflow-y-auto font-normal leading-relaxed min-h-[16rem]',
          'empty:before:content-[attr(data-placeholder)] empty:before:text-(--text-muted) empty:before:pointer-events-none'
        )}
        data-placeholder={placeholder}
      />
    </div>
  );
};

export default SoapNoteEditor;
