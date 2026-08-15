import Image from 'next/image';
import { Mic, PhoneOff, Video } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full md:grid md:grid-cols-2 bg-background font-sans antialiased">
      {/* Left Sidebar (Video Call Pane) */}
      <div className="hidden md:flex relative h-full w-full overflow-hidden flex-col items-end justify-center py-12 pr-0 pl-12 bg-state-info-lighter">
        {/* The Device Frame Container */}
        {/* Background #101726, large border radius to look like a frame */}
        {/* Translated slightly to the right to bleed into the next column if desired, or just huge enough */}
        <div className="relative w-full max-w-[95%] h-[95%] rounded-l-[50px] border-[20px] border-r-0 border-[#101726] bg-[#101726] shadow-2xl overflow-hidden mr-[-2px]">
          {/* Inner Screen Area */}
          <div className="relative w-full h-full bg-slate-800 rounded-l-[32px] overflow-hidden">
            {/* Doctor Image - High Quality from public/images/doctor.png */}
            <Image
              src="/images/doctor.jpg"
              alt="Doctor"
              fill
              className="object-cover md:object-[38%_center] lg:object-center"
              priority
            />
            <div className="absolute inset-0 bg-black/20" />

            {/* Live Consultation Badge - Top Left */}
            <div className="absolute top-6 left-6 z-10">
              <div className="bg-black/60 backdrop-blur-md text-white/90 px-4 py-1.5 rounded-full inline-flex items-center gap-2 text-xs font-medium tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live Consultation
              </div>
            </div>

            {/* Call Controls - Bottom Center */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-6">
              {/* Mic Button */}
              <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer border border-white/10">
                <Mic className="h-5 w-5 text-white" />
              </div>

              {/* End Call Button */}
              <div className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center cursor-pointer shadow-lg shadow-red-500/20">
                <PhoneOff className="h-8 w-8 text-white fill-current" />
              </div>

              {/* Video Button */}
              <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer border border-white/10">
                <Video className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/60 z-30 pointer-events-none" />
      </div>

      {/* Right Content Area */}
      <div className="flex min-h-screen w-full flex-col items-center justify-center  p-4 sm:p-6 bg-(--bg-white) dark:bg-background relative z-10">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        {children}
      </div>
    </div>
  );
}
