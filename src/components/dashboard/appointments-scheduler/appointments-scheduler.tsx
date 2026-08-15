'use client';

import * as React from 'react';
import { Loader2, Calendar as CalendarIcon, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useGetDoctorAppointments } from '@/integration/appointments';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { WeekView } from './week-view';
import { MonthView } from './month-view';
import { DayView } from './day-view';
import { ViewType } from './types';
import { cn } from '@/lib/utils';
import { CancelAppointmentDialog } from './cancel-appointment-dialog';
import { RescheduleAppointmentDialog } from './reschedule-appointment-dialog';
import type { Appointment } from '@/integration/appointments/types';

export function AppointmentsScheduler() {
  const [view, setView] = React.useState<ViewType>('Week');
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [selectedApt, setSelectedApt] = React.useState<Appointment | null>(
    null
  );
  const [activeDialog, setActiveDialog] = React.useState<
    'cancel' | 'reschedule' | null
  >(null);

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const getDateLabel = () => {
    if (view === 'Day') {
      return format(selectedDate, 'MMMM d, yyyy');
    }
    if (view === 'Week') {
      const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
      const end = endOfWeek(selectedDate, { weekStartsOn: 0 });
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }
    if (view === 'Month') {
      return format(selectedDate, 'MMMM yyyy');
    }
    return '';
  };

  // Derive the date range for the current view
  const dateRange = React.useMemo(() => {
    if (view === 'Day') {
      return {
        startDate: startOfDay(selectedDate).toISOString(),
        endDate: endOfDay(selectedDate).toISOString(),
      };
    }
    if (view === 'Week') {
      return {
        startDate: startOfWeek(selectedDate, { weekStartsOn: 0 }).toISOString(),
        endDate: endOfWeek(selectedDate, { weekStartsOn: 0 }).toISOString(),
      };
    }
    // Month view
    return {
      startDate: startOfMonth(selectedDate).toISOString(),
      endDate: endOfMonth(selectedDate).toISOString(),
    };
  }, [view, selectedDate]);

  // Fetch appointments from the backend
  const { data, isLoading, error } = useGetDoctorAppointments({
    limit: 1000,
    page: 1,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });
  const appointments = data?.docs || [];

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-base font-semibold text-(--text-primary)">
            Appointments
          </h2>
          <p className="text-xs text-(--text-muted) mt-1">
            All times are displayed in GMT
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Condensed Navigation Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-9 px-3 gap-2 rounded-[8px] border-(--border-stroke) hover:bg-(--bg-primary) text-(--text-gray) font-semibold text-sm transition-all '
                )}
              >
                <CalendarIcon className="h-4 w-4 text-(--text-muted)" />
                <span>{getDateLabel()}</span>
                <MoreVertical className="h-4 w-4 text-(--text-muted) ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="end">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 border-b pb-2 mb-2">
                  <span className="text-xs font-bold text-(--text-muted) uppercase tracking-wider">
                    Quick Navigation
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px] font-bold hover:underline hover:text-primary/70 hover:bg-transparent cursor-pointer text-primary"
                    onClick={() => {
                      handleToday();
                    }}
                  >
                    Go to Today
                  </Button>
                </div>

                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) setSelectedDate(date);
                  }}
                  className=""
                />
              </div>
            </PopoverContent>
          </Popover>

          <div className="bg-(--bg-light-gray) p-1 rounded-[8px] inline-flex ">
            {(['Day', 'Week', 'Month'] as ViewType[]).map((item) => (
              <Button
                key={item}
                variant="ghost"
                size="sm"
                onClick={() => setView(item)}
                className={`h-8 px-4 font-semibold cursor-pointer text-xs shadow-none transition-all rounded-[6px] ${
                  view === item
                    ? 'bg-(--bg-white)  text-primary hover:text-primary/80 hover:bg-(--bg-white)'
                    : 'text-(--text-muted) hover:text-(--text-primary)'
                }`}
              >
                {item}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-(--bg-primary) overflow-y-auto h-[600px]">
        {isLoading ? (
          <div className="h-[600px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
          </div>
        ) : error ? (
          <div className="h-[600px] flex items-center justify-center text-(--text-muted)">
            Failed to load appointments
          </div>
        ) : (
          <>
            {view === 'Week' && (
              <WeekView
                appointments={appointments}
                selectedDate={selectedDate}
                onReschedule={(apt) => {
                  setSelectedApt(apt);
                  setActiveDialog('reschedule');
                }}
                onCancel={(apt) => {
                  setSelectedApt(apt);
                  setActiveDialog('cancel');
                }}
              />
            )}
            {view === 'Month' && (
              <MonthView
                appointments={appointments}
                selectedDate={selectedDate}
                onReschedule={(apt) => {
                  setSelectedApt(apt);
                  setActiveDialog('reschedule');
                }}
                onCancel={(apt) => {
                  setSelectedApt(apt);
                  setActiveDialog('cancel');
                }}
              />
            )}
            {view === 'Day' && (
              <DayView
                appointments={appointments}
                selectedDate={selectedDate}
                onReschedule={(apt) => {
                  setSelectedApt(apt);
                  setActiveDialog('reschedule');
                }}
                onCancel={(apt) => {
                  setSelectedApt(apt);
                  setActiveDialog('cancel');
                }}
              />
            )}
          </>
        )}
      </div>

      {selectedApt && (
        <>
          <CancelAppointmentDialog
            appointment={selectedApt}
            open={activeDialog === 'cancel'}
            onOpenChange={(open) => !open && setActiveDialog(null)}
          />
          <RescheduleAppointmentDialog
            appointment={selectedApt}
            open={activeDialog === 'reschedule'}
            onOpenChange={(open) => !open && setActiveDialog(null)}
          />
        </>
      )}
    </div>
  );
}
