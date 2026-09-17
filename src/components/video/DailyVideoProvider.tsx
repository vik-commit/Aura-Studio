/**
 * @license
 * Project Aura — DailyVideoProvider / SessionVideoProvider
 * Props: { sessionId: string; requiredTimecodes: number[]; mode?: "view" | "capture"; children: React.ReactNode }
 */

import React, { createContext, useContext, useState } from 'react';

interface VideoContextValue {
  sessionId: string;
  activeTimecode: number | null;
  seekTo: (timeSec: number) => void;
  playbackUrl: string | null;
  isPlaying: boolean;
  togglePlay: () => void;
}

const VideoContext = createContext<VideoContextValue | null>(null);

export function useSessionVideo() {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useSessionVideo must be used within SessionVideoProvider');
  }
  return context;
}

interface SessionVideoProviderProps {
  sessionId: string;
  requiredTimecodes: number[];
  mode?: 'view' | 'capture';
  children: React.ReactNode;
}

export function DailyVideoProvider({
  sessionId,
  mode = 'view',
  children,
}: SessionVideoProviderProps) {
  const [activeTimecode, setActiveTimecode] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const seekTo = (timeSec: number) => {
    setActiveTimecode(timeSec);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const value: VideoContextValue = {
    sessionId,
    activeTimecode,
    seekTo,
    playbackUrl: `https://storage.googleapis.com/aura-recordings/sessions/${sessionId}.mp4`,
    isPlaying,
    togglePlay,
  };

  return (
    <VideoContext.Provider value={value}>
      <div data-mode={mode} className="w-full">
        {children}
      </div>
    </VideoContext.Provider>
  );
}

export const SessionVideoProvider = DailyVideoProvider;
export default DailyVideoProvider;
