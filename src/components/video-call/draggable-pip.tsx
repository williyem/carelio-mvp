'use client';

import { useVideoCallStore } from '@/stores/video-call-store';
import { motion } from 'motion/react';
import { useRef } from 'react';
import PipCall from './pip-call';

const DraggablePip = ({
  handleEndCall,
}: {
  handleEndCall: () => Promise<void>;
}) => {
  const { pipPosition, setPipPosition } = useVideoCallStore();
  const pipRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={pipRef}
      drag
      dragMomentum={false}
      initial={{ x: pipPosition.x, y: pipPosition.y }}
      onDragEnd={(event, info) => {
        setPipPosition(info.point.x, info.point.y);
      }}
      className="fixed z-9999 cursor-move"
      style={{ left: 0, top: 0 }}
    >
      <PipCall handleEndCall={handleEndCall} />
    </motion.div>
  );
};

export default DraggablePip;
