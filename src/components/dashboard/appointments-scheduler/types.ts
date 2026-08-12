export type ViewType = 'Day' | 'Week' | 'Month';

export interface RescheduleFormValues {
  date: Date;
  startTime: string;
  endTime: string;
  rescheduleReason: string;
}
