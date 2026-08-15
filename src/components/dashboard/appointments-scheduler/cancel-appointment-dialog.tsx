'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useCancelAppointment } from '@/integration/appointments';
import type { Appointment } from '@/integration/appointments/types';

interface CancelAppointmentDialogProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelAppointmentDialog({
  appointment,
  open,
  onOpenChange,
}: CancelAppointmentDialogProps) {
  const [cancelReason, setCancelReason] = React.useState('');
  const cancelMutation = useCancelAppointment();

  const onCancel = async () => {
    if (!cancelReason) return;
    try {
      await cancelMutation.mutateAsync({
        id: appointment.id,
        data: { cancellationReason: cancelReason },
      });
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-(--text-muted)">
            Please provide a reason for cancellation.
          </p>
          <textarea
            className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-blue focus:outline-none min-h-[100px]"
            placeholder="Reason for cancellation..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 rounded-full!"
            onClick={() => onOpenChange(false)}
          >
            Back
          </Button>
          <Button
            variant="destructive"
            className="flex-1 text-white! rounded-full!"
            onClick={onCancel}
            disabled={cancelMutation.isPending || !cancelReason}
          >
            {cancelMutation.isPending ? <Spinner /> : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
