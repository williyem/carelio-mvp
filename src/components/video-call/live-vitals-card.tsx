'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useVideoCallStore } from '@/stores/video-call-store';
import { useLiveVitals } from '@/hooks/use-live-vitals';

const LiveVitalsCard = () => {
  const { selectedAppointment } = useVideoCallStore();
  const { formattedVitals, isConnected } = useLiveVitals({
    appointmentId: selectedAppointment?.id,
  });

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
    <Card className="border-[#EBEBEB] shadow-none rounded-[14px] overflow-hidden bg-white h-fit">
      <CardContent className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-brand-blue">Live Vitals</h3>
          {hasAnyVitals ? (
            <div className="flex items-center gap-2 bg-[#E7F7E9] justify-between h-[34px] px-2.5 rounded-full">
              <div className="w-[10px] h-[10px] rounded-full bg-[#0B7E17] animate-pulse" />
              <span className="text-[#096112] text-xs font-normal">
                Live Readings
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-gray-100 justify-between h-[34px] px-2.5 rounded-full">
              <div
                className={`w-[10px] h-[10px] rounded-full ${isConnected ? 'bg-yellow-500' : 'bg-gray-400'}`}
              />
              <span className="text-gray-500 text-xs font-normal">
                {isConnected ? 'Waiting...' : 'Connecting...'}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {vitalsList.map((vital, i) => (
            <div key={i} className="flex justify-between items-center group">
              <span className="font-normal text-(--text-secondary)">
                {vital.label}
              </span>
              <span
                className={`font-bold ${vital.value ? 'text-gray-900' : 'text-gray-400'}`}
              >
                {vital.value || 'N/A'}
              </span>
            </div>
          ))}
        </div>

        {formattedVitals.lastUpdated && (
          <div className="pt-4 border-t border-gray-100 flex justify-center">
            <p className="text-sm font-normal text-(--text-secondary)">
              Last updated: {formattedVitals.lastUpdated}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveVitalsCard;
