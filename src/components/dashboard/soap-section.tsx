'use client';

import { cn } from '@/lib/utils';
import {
  SOAP_SECTION_COPY,
  hasSoapContent,
  type SoapSectionType,
} from '@/lib/soap-note';

interface SOAPSectionProps {
  type: SoapSectionType;
  title?: string;
  description?: string;
  content?: string | string[] | null;
  className?: string;
}

const SOAPSection = ({
  type,
  title,
  description,
  content,
  className,
}: SOAPSectionProps) => {
  const copy = SOAP_SECTION_COPY[type];
  const heading = title ?? copy.title;
  const subtitle = description ?? copy.description;

  const getIconStyles = () => {
    switch (type) {
      case 'subjective':
        return 'bg-(--bg-info) text-(--brand-blue-text)';
      case 'objective':
        return 'bg-(--bg-success) text-(--text-green)';
      case 'assessment':
        return 'bg-(--bg-light-gray) text-(--text-video-border)';
      case 'plan':
        return 'bg-(--bg-warning) text-(--text-warning)';
      default:
        return 'bg-(--bg-light-gray) text-(--text-video-border)';
    }
  };

  const getIconLetter = () => {
    switch (type) {
      case 'subjective':
        return 'S';
      case 'objective':
        return 'O';
      case 'assessment':
        return 'A';
      case 'plan':
        return 'P';
      default:
        return '';
    }
  };

  const renderContent = () => {
    if (Array.isArray(content)) {
      if (!hasSoapContent(content)) {
        return (
          <p className="flex-[1_0_0] font-normal leading-[1.2] text-(--text-secondary) text-[12px] sm:text-[14px]">
            No {type} notes recorded
          </p>
        );
      }
      return (
        <div className="flex-[1_0_0] font-normal leading-[1.2] text-(--text-primary) text-[12px] sm:text-[14px] whitespace-pre-wrap">
          {content.map((item, index) => (
            <p key={index} className="mb-1">
              {item}
            </p>
          ))}
        </div>
      );
    }

    if (!hasSoapContent(content)) {
      return (
        <p className="flex-[1_0_0] font-normal leading-[1.2] text-(--text-secondary) text-[12px] sm:text-[14px]">
          No {type} notes recorded
        </p>
      );
    }

    return (
      <div
        className="flex-[1_0_0] font-normal leading-[1.2] text-(--text-primary) text-[12px] sm:text-[14px] w-full [&_p]:mb-1"
        dangerouslySetInnerHTML={{ __html: content || '' }}
      />
    );
  };

  return (
    <div
      className={cn(
        'border border-(--border-stroke) flex flex-col gap-3 sm:gap-4 items-start px-4 sm:px-5 py-3 sm:py-[15px] rounded-[10px] w-full',
        className
      )}
    >
      <div className="flex gap-3 sm:gap-4 items-center w-full">
        <div
          className={cn(
            'relative rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0',
            getIconStyles()
          )}
        >
          <p className="font-normal leading-[1.2] text-[16px] sm:text-[18px]">
            {getIconLetter()}
          </p>
        </div>
        <p className="font-bold leading-[1.2] text-(--text-primary) text-[14px] sm:text-[16px]">
          {heading}
        </p>
      </div>
      <p className="flex-1 font-normal leading-[1.2] text-(--text-secondary) text-[12px] sm:text-[14px] w-full">
        {subtitle}
      </p>
      <div className="bg-(--bg-primary) border border-(--border-stroke) space-y-1 flex flex-1 items-center justify-center p-2 sm:p-[10px] rounded-[12px] w-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default SOAPSection;
