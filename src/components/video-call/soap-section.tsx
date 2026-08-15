import React from 'react';

const SoapSection = ({
  type,
  content,
}: {
  type: 'subjective' | 'objective' | 'assessment' | 'plan';
  content?: string;
}) => {
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
        'The clinician analyzes the subjective and objective data to determine what is going on.',
    },
    plan: {
      bg: '#FDFAE7',
      text: '#A8900D',
      label: 'Treatment plan and follow-up',
    },
  };

  const config = SOAP_CONFIG[type];

  return (
    <>
      <div className="space-y-3 bg-(--bg-white) border border-(--border-stroke) rounded-[10px] p-4">
        <div className="flex items-center gap-3">
          <div
            style={{ backgroundColor: config.bg, color: config.text }}
            className="size-10 flex items-center justify-center font-normal text-lg rounded-full shrink-0"
          >
            {type.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <p className="capitalize font-bold text-(--text-primary) leading-none mb-1">
              {type}
            </p>
          </div>
        </div>
        <p className="text-sm text-(--text-secondary) font-normal">
          {config.label}
        </p>

        <div className="w-full bg-(--bg-input) border border-(--border-input) rounded-[8px] p-4 text-(--text-gray) text-[15px] font-normal leading-relaxed">
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <p className="text-(--text-muted) text-sm font-normal">
              No {type} notes recorded
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default SoapSection;
