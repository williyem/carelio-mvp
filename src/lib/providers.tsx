'use client';
import PostConsultationSummary from '@/components/video-call/post-consulation-summary';
import VideoCallOverlayComponent from '@/components/video-call/video-call-overlay';
import { Toaster } from '@/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import NextTopLoader from 'nextjs-toploader';
import { ReactNode, useState, useEffect } from 'react';

const Providers = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient();
  const [position, setPosition] = useState<'top-center' | 'bottom-right'>(
    'bottom-right'
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setPosition('top-center');
      } else {
        setPosition('bottom-right');
      }
    };

    // Set initial
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster richColors position={position} />
        <NextTopLoader
          height={2}
          showSpinner={false}
          easing="ease"
          speed={500}
          shadow="0 0 10px #4da2ff, 0 0 5px #4da2ff"
          color="#4da2ff"
        />
        {children}
        <VideoCallOverlayComponent />
        <PostConsultationSummary />
      </QueryClientProvider>
    </>
  );
};

export default Providers;
