'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Video,
  Mic,
  MicOff,
  Phone,
  Timer,
  Minimize2,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import VideoCallLiveVitals from '@/components/video-call/video-call-live-vitals';
import { useVideoCallStore } from '@/stores/video-call-store';

export default function LiveConsultationPage() {
  const { selectedPatient } = useVideoCallStore();
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoPaused, setIsVideoPaused] = React.useState(false);
  const [currentTime] = React.useState('-01:45:56');

  return (
    <div className="h-screen w-screen bg-[#101726] font-sans overflow-hidden flex flex-col">
      {/* Full-width Header */}
      <div className="p-4 md:p-6 flex items-center justify-between z-10 bg-[#101726] shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-white font-bold text-lg hidden sm:block">
            {selectedPatient?.fullName ||
              selectedPatient?.name ||
              selectedPatient?.patientId ||
              'Patient'}
          </span>
          <div className="flex items-center gap-3 bg-[#E7F7E9] px-6 py-2.5 rounded-full">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0B7E17]" />
            <span className="text-[#0B7E17] text-[15px] font-bold tracking-tight">
              Live Consultation
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#1F2B3C] px-6 py-2.5 rounded-full">
          <Timer className="w-5 h-5 text-white" />
          <span className="text-white text-[15px] font-bold tracking-tight">
            {currentTime}
          </span>
        </div>

        <Link href="/dashboard">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/5 transition-all rounded-full px-4 h-11 gap-3 font-bold flex items-center group"
          >
            <Minimize2 className="w-5 h-5 opacity-80 group-hover:opacity-100" />
            <span className="text-lg">Exit</span>
          </Button>
        </Link>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden no-scrollbar">
        {/* Main Content Area (Video) */}
        <div className="flex-1 flex flex-col min-h-[600px] md:min-h-[800px] lg:min-h-0">
          <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 lg:pt-0 relative">
            <div className="w-full h-full bg-[#1F2B3C] rounded-[32px] relative overflow-hidden flex items-center justify-center border border-white/5 shadow-inner min-h-[500px] md:min-h-[700px]">
              {/* Patient Placeholder */}
              <div className="flex flex-col items-center gap-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-full bg-[#3C4C60] flex items-center justify-center shadow-2xl">
                  <Video
                    className="w-10 h-10 text-white opacity-80"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-white text-xl font-bold tracking-tight">
                    Video Call Active
                  </h3>
                  <p className="text-white/40 text-sm font-medium">
                    Waiting for patient to join
                  </p>
                </div>
              </div>

              {/* Clinician PIP */}
              <div className="absolute bottom-6 right-6 w-40 h-28 bg-[#101726]/80 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl group cursor-pointer transition-all hover:scale-105 active:scale-95">
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 transition-opacity group-hover:opacity-40">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 text-center w-full">
                    <span className="text-white text-xs font-bold tracking-wider">
                      You
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar - Pill style */}
          <div className="pb-8 md:pb-12 flex justify-center z-10">
            <div className="bg-[#1F2B3C] rounded-[48px] px-8 md:px-14 py-4 md:py-5 flex items-center gap-8 md:gap-16 shadow-2xl border border-white/5">
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  className={cn(
                    'w-12 h-12 md:w-16 md:h-16 rounded-full transition-all flex items-center justify-center',
                    isMuted
                      ? 'bg-[#FF3B30]/20 text-[#FF3B30]'
                      : 'bg-[#3C4C60] text-white hover:bg-[#4E5E72]'
                  )}
                >
                  {isMuted ? (
                    <MicOff className="w-6 h-6 md:w-8 md:h-8" />
                  ) : (
                    <Mic
                      className="w-6 h-6 md:w-8 md:h-8"
                      fill="currentColor"
                    />
                  )}
                </Button>
                <span className="text-white text-xs md:text-[17px] font-semibold tracking-tight">
                  Mute
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsVideoPaused(!isVideoPaused)}
                  className={cn(
                    'w-12 h-12 md:w-16 md:h-16 rounded-full transition-all flex items-center justify-center',
                    isVideoPaused
                      ? 'bg-[#FF3B30]/20 text-[#FF3B30]'
                      : 'bg-[#3C4C60] text-white hover:bg-[#4E5E72]'
                  )}
                >
                  <Video
                    className="w-6 h-6 md:w-8 md:h-8"
                    fill="currentColor"
                  />
                </Button>
                <span className="text-white text-xs md:text-[17px] font-semibold tracking-tight">
                  Pause Video
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <Link href="/dashboard/consultation/1">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#FF3B30] hover:bg-[#FF3B30]/90 shadow-lg shadow-red-500/20 flex items-center justify-center border-none"
                  >
                    <Phone
                      className="w-6 h-6 md:w-8 md:h-8 rotate-[135deg]"
                      fill="currentColor"
                    />
                  </Button>
                </Link>
                <span className="text-white text-xs md:text-[17px] font-semibold tracking-tight">
                  End
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Sidebar / Action Tray */}
        <div className="w-full lg:w-[480px] bg-white p-6 md:p-8 rounded-t-[40px] lg:rounded-tr-none lg:rounded-tl-[40px] flex flex-col gap-6 overflow-y-auto no-scrollbar shadow-[-10px_0_40px_rgba(0,0,0,0.1)] relative shrink-0">
          <VideoCallLiveVitals />
        </div>
      </div>
    </div>
  );
}
