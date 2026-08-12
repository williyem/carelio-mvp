import { useQuery } from '@tanstack/react-query';
import { getAppointmentNote } from '../api-functions';
import { APPOINTMENT_QUERY_KEYS } from '../query-keys';

export const useGetNoteById = (noteId: string, enabled = true) => {
  return useQuery({
    queryKey: [APPOINTMENT_QUERY_KEYS.APPOINTMENT_NOTE, noteId],
    queryFn: () => getAppointmentNote(noteId),
    enabled: !!noteId && enabled,
  });
};
