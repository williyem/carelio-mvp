/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVideoCallStore } from '@/stores/video-call-store';
import {
  updateConsultationNote,
  useGetConsultationNoteByAppointmentMutation,
  useSubmitSoapNotes,
  useUpdateConsultationNote,
} from '@/integration/appointments';
import { toast } from 'sonner';

// Modular components
import PatientInfoCard from './patient-info-card';
import LiveVitalsCard from './live-vitals-card';
import SoapNoteEditor from './soap-note-editor';
import HealthRecordsList from './health-records-list';
import { Spinner } from '../ui/spinner';

const VideoCallLiveVitals = () => {
  const { selectedAppointment, selectedPatient } = useVideoCallStore();

  const [showDevices, setShowDevices] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [showHealthRecords, setShowHealthRecords] = useState(false);

  const [soapNotes, setSoapNotes] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });

  const submitSoapMutation = useSubmitSoapNotes();
  const getConsultationNoteByAppointmentMutation =
    useGetConsultationNoteByAppointmentMutation();
  const updateConsultationNoteMutation = useUpdateConsultationNote();

  const isLoading =
    submitSoapMutation.isPending ||
    updateConsultationNoteMutation.isPending ||
    getConsultationNoteByAppointmentMutation.isPending;
  const handleSaveNotes = async () => {
    if (!selectedAppointment?.id) {
      toast.error('No active appointment found');
      return;
    }

    getConsultationNoteByAppointmentMutation.mutate(selectedAppointment.id, {
      onSuccess: async (data) => {
        if (data?.id) {
          await updateConsultationNoteMutation.mutateAsync({
            noteId: data?.id,
            data: { ...soapNotes },
          });
        } else {
          await submitSoapMutation.mutateAsync({
            appointmentId: selectedAppointment.id,
            data: { ...soapNotes, action: 'save' },
          });
        }

        toast.success('SOAP notes saved successfully');
        setShowNotes(false);
      },
      onError: async (error) => {
        await submitSoapMutation.mutateAsync({
          appointmentId: selectedAppointment.id,
          data: { ...soapNotes, action: 'save' },
        });
        toast.success('SOAP notes saved successfully');
        setShowNotes(false);
      },
    });
    try {
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save SOAP notes');
    }
  };

  const handleNoteChange = (key: keyof typeof soapNotes, value: string) => {
    setSoapNotes((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!showDevices) {
    return (
      <div className="w-full xl:w-[450px] 2xl:w-[559px] relative min-h-[200px] xl:min-h-0 p-4 sm:p-8 xl:border-l xl:border-(--border-video)">
        <p className="text-gray-900 text-left text-base sm:text-[18px] font-bold leading-[1.2] mb-2 sm:mb-0">
          Live Vitals
        </p>

        <div className="flex flex-col gap-3 sm:gap-[12px] h-full flex-1 items-center justify-center">
          <p className="text-gray-600 text-sm sm:text-[18px] font-normal leading-[1.2] text-center">
            No devices connected
          </p>
          <button
            onClick={() => setShowDevices(true)}
            className="bg-brand-blue border border-brand-blue flex items-center justify-center h-[40px] sm:h-[44px] px-4 sm:px-[20px] py-2 sm:py-[8px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] hover:bg-brand-blue/90 transition-colors w-full sm:w-auto cursor-pointer"
          >
            <p className="text-white text-sm sm:text-[16px] font-bold leading-[1.2] whitespace-nowrap">
              Configure Devices
            </p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-(--bg-white) py-6 w-full xl:w-[450px] 2xl:w-[559px] relative flex flex-col h-full overflow-hidden xl:border-l xl:border-(--border-video)">
      <div className="flex-1 min-h-0 px-4 space-y-5 sm:px-8">
        {showHealthRecords ? (
          <HealthRecordsList
            patientId={selectedPatient?.id || ''}
            onBack={() => setShowHealthRecords(false)}
          />
        ) : showNotes ? (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col gap-6 h-full">
              <button
                onClick={() => setShowNotes(false)}
                className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 transition-colors w-fit cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>

              <h2 className="text-xl font-bold text-gray-900">
                Clinical Notes (SOAP)
              </h2>

              <Tabs
                defaultValue="subjective"
                className="w-full h-full flex flex-col"
              >
                <TabsList className="bg-[#F9F9F9] p-1 rounded-full flex gap-1 w-full h-auto">
                  <TabsTrigger
                    value="subjective"
                    className="flex-1 py-3 px-3 rounded-full text-xs md:text-sm font-medium data-[state=active]:bg-white  data-[state=active]:text-gray-900 text-gray-500 hover:text-gray-700"
                  >
                    Subjective
                  </TabsTrigger>
                  <TabsTrigger
                    value="objective"
                    className="flex-1 py-3 px-3 rounded-full text-xs md:text-sm font-medium data-[state=active]:bg-white  data-[state=active]:text-gray-900 text-gray-500 hover:text-gray-700"
                  >
                    Objective
                  </TabsTrigger>
                  <TabsTrigger
                    value="assessment"
                    className="flex-1 py-3 px-3 rounded-full text-xs md:text-sm font-medium data-[state=active]:bg-white  data-[state=active]:text-gray-900 text-gray-500 hover:text-gray-700"
                  >
                    Assessment
                  </TabsTrigger>
                  <TabsTrigger
                    value="plan"
                    className="flex-1 py-3 px-3 rounded-full text-xs md:text-sm font-medium data-[state=active]:bg-white  data-[state=active]:text-gray-900 text-gray-500 hover:text-gray-700"
                  >
                    Plan
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 min-h-0 mt-4">
                  {(
                    ['subjective', 'objective', 'assessment', 'plan'] as const
                  ).map((key) => {
                    return (
                      <TabsContent
                        key={key}
                        value={key}
                        className="h-full mt-0"
                      >
                        <SoapNoteEditor
                          placeholder={`Enter ${key} notes...`}
                          value={soapNotes[key]}
                          onChange={(val) => handleNoteChange(key, val)}
                          type={key}
                        />
                      </TabsContent>
                    );
                  })}
                </div>
              </Tabs>

              <div className="mt-auto pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4 underline-offset-4">
                <Button
                  className="flex-1 bg-[#2E90FA] hover:bg-[#2E90FA]/90 text-white rounded-full h-14 font-bold text-base  cursor-pointer"
                  onClick={handleSaveNotes}
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner /> : 'Save Note'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-[#EBEBEB] text-gray-700 rounded-full h-14 font-bold text-base cursor-pointer"
                  onClick={() => setShowNotes(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex  max-lg:mt-4  items-center justify-between gap-4">
              <button
                onClick={() => setShowHealthRecords(true)}
                className="text-brand-blue  max-sm:text-sm cursor-pointer hover:text-brand-blue/90 font-normal text-base underline underline-offset-4"
              >
                View previous health records
              </button>
              <Button
                onClick={() => setShowNotes(true)}
                variant="outline"
                className="rounded-full border-[#939596] text-xs font-normal h-[38px] px-4 gap-2 hover:bg-gray-50 bg-white cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Notes
              </Button>
            </div>
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1  gap-6 pb-8">
                <PatientInfoCard patient={selectedPatient} />
                <LiveVitalsCard />
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoCallLiveVitals;
