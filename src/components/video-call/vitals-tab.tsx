import { useVideoCallStore } from '@/stores/video-call-store';
import { useGetVitalsByAppointmentQuery } from '@/integration/vitals';
import { formatVitals } from '@/lib/easy';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { Search } from 'lucide-react';

const VitalsTab = ({
  appointmentId,
  hideTitle = false,
}: {
  appointmentId?: string;
  hideTitle?: boolean;
}) => {
  const { postConsultationAppointmentId } = useVideoCallStore();

  const activeId = appointmentId || postConsultationAppointmentId;

  const { data: vitalsData } = useGetVitalsByAppointmentQuery(activeId || '');

  const formattedVitals = formatVitals(vitalsData || []);

  const hasAnyVitals =
    formattedVitals.heartRate ||
    formattedVitals.bloodPressure ||
    formattedVitals.temperature ||
    formattedVitals.oxygenSaturation ||
    formattedVitals.weight ||
    formattedVitals.glucose;

  const vitalsList = [
    { label: 'Heart Rate', value: formattedVitals.heartRate },
    { label: 'Blood Pressure', value: formattedVitals.bloodPressure },
    { label: 'Temperature', value: formattedVitals.temperature },
    { label: 'O₂ Saturation', value: formattedVitals.oxygenSaturation },
    { label: 'Weight', value: formattedVitals.weight },
    { label: 'Blood Glucose', value: formattedVitals.glucose },
  ];
  return (
    <div className="space-y-6">
      <div
        className={cn(
          'overflow-hidden space-y-6',
          hideTitle
            ? 'pt-0'
            : 'px-4 py-[15px] border border-(--border-stroke) rounded-[10px]'
        )}
      >
        {!hideTitle && (
          <h3 className="font-bold text-(--text-primary)">Vitals Summary</h3>
        )}

        {hasAnyVitals ? (
          <div className="space-y-5">
            {vitalsList.map((vital, i) => (
              <div key={i} className="flex justify-between items-center group">
                <span className="font-normal text-(--text-secondary)">
                  {vital.label}
                </span>
                <span
                  className={`font-bold ${vital.value ? 'text-(--text-primary)' : 'text-(--text-muted)'}`}
                >
                  {vital.value || 'N/A'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Search className="h-6 w-6 text-(--text-muted)" />}
            title="No vitals recorded"
            description="Vitals recorded during the session will appear here."
          />
        )}

        {formattedVitals.lastUpdated && (
          <div className="pt-4 border-t border-(--border-stroke) flex justify-center">
            <p className="text-sm font-normal text-(--text-secondary)">
              Last updated: {formattedVitals.lastUpdated}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VitalsTab;
