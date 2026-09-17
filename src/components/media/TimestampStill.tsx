/**
 * @license
 * Project Aura — TimestampStill component
 * Props: { timecode: string | number | undefined | null; className?: string }
 */

import React, { useState } from 'react';
import { Camera, Maximize2, X } from 'lucide-react';

interface TimestampStillProps {
  timecode: string | number | undefined | null;
  className?: string;
}

export function TimestampStill({ timecode, className = '' }: TimestampStillProps) {
  const [enlarged, setEnlarged] = useState(false);
  const formattedTc = typeof timecode === 'number' 
    ? `${Math.floor(timecode / 60).toString().padStart(2, '0')}:${(timecode % 60).toString().padStart(2, '0')}`
    : timecode || '00:00';

  return (
    <>
      <div 
        id={`timestamp-still-${formattedTc.replace(':', '-')}`}
        onClick={() => setEnlarged(true)}
        className={`group relative overflow-hidden rounded-md border border-[#e2e8f0] bg-[#e6e8ea] cursor-pointer transition-opacity duration-150 hover:opacity-90 ${className}`}
        style={{ aspectRatio: '16/9' }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080e1a]/5 p-2 text-center">
          <Camera className="w-4 h-4 text-[#45474c] mb-1 group-hover:scale-105 transition-transform" />
          <span className="font-mono text-[11px] font-medium text-[#191c1e] bg-white/80 px-1.5 py-0.5 rounded">
            {formattedTc}
          </span>
        </div>
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#080e1a]/60 text-white p-0.5 rounded">
          <Maximize2 className="w-3 h-3" />
        </div>
      </div>

      {enlarged && (
        <div 
          id="timestamp-still-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#080e1a]/80 p-4"
          onClick={() => setEnlarged(false)}
        >
          <div 
            className="relative max-w-3xl w-full bg-white rounded-lg p-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0] mb-3">
              <span className="font-mono text-sm font-medium text-[#191c1e]">
                Frame Capture @ {formattedTc}
              </span>
              <button
                id="close-still-modal-btn"
                onClick={() => setEnlarged(false)}
                className="p-1 rounded hover:bg-[#e6e8ea] text-[#45474c]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div 
              className="w-full bg-[#080e1a] rounded flex flex-col items-center justify-center text-white p-12 text-center"
              style={{ aspectRatio: '16/9' }}
            >
              <Camera className="w-12 h-12 text-white/40 mb-3" />
              <p className="font-mono text-xs text-white/70">
                Extracted Still Frame for verification ({formattedTc})
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TimestampStill;
