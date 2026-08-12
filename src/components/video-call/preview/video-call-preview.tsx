'use client';

import { motion, AnimatePresence } from 'framer-motion';
import PreviewPage from './preview-page';

const VideoCallPreview = ({
  joinSession,
}: {
  joinSession: () => Promise<boolean>;
}) => {
  return (
    <>
      <AnimatePresence>
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-white h-screen overflow-y-auto"
          >
            {/* Content */}
            <div>
              <PreviewPage joinSession={joinSession} />
            </div>
          </motion.div>
        </>
      </AnimatePresence>
    </>
  );
};

export default VideoCallPreview;
