'use client';

import { useState } from 'react';
import { PanelRightOpen } from 'lucide-react';
import VideoCallTopbar from './video-call-topbar';
import VideoCallMainArea from './video-call-main-area';
import VideoCallLiveVitals from './video-call-live-vitals';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@uidotdev/usehooks';

const FullscreenCall = ({
  leaveSession,
}: {
  leaveSession: () => Promise<void>;
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const isSmallDevice = useMediaQuery('only screen and (max-width : 635px)');

  return (
    <div className="bg-(--bg-video-darker) fixed inset-0 z-50 overflow-hidden">
      <VideoCallTopbar />

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] sm:h-[calc(100vh-84px)]">
        <VideoCallMainArea leaveSession={leaveSession} />

        {/* Live Vitals - Hidden on lg and smaller, visible on xl+ */}
        <div className="hidden lg:block">
          <VideoCallLiveVitals />
        </div>

        {/* Sheet for lg and smaller screens */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden hover:text-white fixed bottom-6 right-6 z-50 sm:h-12 sm:w-12 h-10 w-10 rounded-full bg-brand-blue hover:bg-brand-blue/90 text-white border-none shadow-lg hover:shadow-xl transition-all"
            >
              <PanelRightOpen className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side={isSmallDevice ? 'bottom' : 'right'}
            className="w-full sm:w-[540px] p-0 bg-(--bg-white)"
          >
            <VideoCallLiveVitals />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default FullscreenCall;
