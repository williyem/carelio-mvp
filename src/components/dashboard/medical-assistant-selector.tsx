'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Clinician } from '@/types/clinician.types';
import useGetHealthAssistantsQuery from '@/integration/health-assistant/queries/useGetHealthAssistantsQuery';

interface MedicalAssistantSelectorProps {
  selectedAssistant?: Clinician | null;
  onSelect: (assistant: Clinician | null) => void;
}

const MedicalAssistantSelector = ({
  selectedAssistant,
  onSelect,
}: MedicalAssistantSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: clinicians = [], isLoading } = useGetHealthAssistantsQuery();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="bg-(--bg-white) border border-(--border-stroke) flex items-center justify-between overflow-clip p-2 rounded-[8px] shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] w-full lg:w-[293px] hover:bg-(--bg-primary) transition-colors"
        >
          <div className="flex items-center justify-center px-1 py-0">
            <div className="flex flex-col font-normal justify-center leading-0 text-(--text-primary) text-[14px] tracking-[-0.084px] whitespace-nowrap">
              <p className="leading-[20px]">
                {selectedAssistant?.name ? (
                  selectedAssistant.name
                ) : (
                  <span className="text-(--text-gray-placeholder)!">
                    Select Medical Assistant
                  </span>
                )}
              </p>
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-(--text-gray-dark) shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) max-w-[293px] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search medical assistant..." />
          <CommandList className="max-h-none overflow-visible">
            <ScrollArea
              className="h-[200px]"
              onWheel={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {isLoading ? (
                <CommandEmpty>Loading...</CommandEmpty>
              ) : clinicians.length === 0 ? (
                <CommandEmpty>No medical assistants found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {/* <CommandItem
                    onSelect={() => {
                      onSelect(null);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Check
                      className={cn(
                        'w-4 h-4',
                        !selectedAssistant ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span>All Medical Assistants</span>
                  </CommandItem> */}
                  {clinicians.map((clinician) => {
                    const searchValue = [
                      clinician.firstName,
                      clinician.lastName,
                      clinician.name,
                      clinician.email,
                      clinician.phoneNumber,
                    ]
                      .filter(Boolean)
                      .join(' ');

                    return (
                      <CommandItem
                        key={clinician.id}
                        value={searchValue}
                        onSelect={() => {
                          onSelect(clinician);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Check
                          className={cn(
                            'w-4 h-4',
                            selectedAssistant?.id === clinician.id
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-normal">
                            {clinician.name}
                          </span>
                          {clinician.specialization && (
                            <span className="text-xs text-(--text-muted)">
                              {clinician.specialization}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MedicalAssistantSelector;
