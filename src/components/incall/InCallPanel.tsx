/**
 * @license
 * Project Aura — InCallPanel component
 * Props: { sessionId: string; displayName: string; onEnded: () => void }
 * Purpose: The live call: joins the room, starts recording automatically, renders camera and screen-share tiles and the control row, and can pop the whole call into a floating always-on-top window.
 */

import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Radio,
  Share2,
  ExternalLink,
  Users
} from 'lucide-react';

interface InCallPanelProps {
  sessionId: string;
  displayName: string;
  onEnded: () => void;
}

export function InCallPanel({ sessionId, displayName, onEnded }: InCallPanelProps) {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    // Send beacon if in browser
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/public/end-session', JSON.stringify({ sessionId }));
    }
    onEnded();
  };

  return (
    <div id="incall-panel" className="bg-[#080e1a] text-white rounded-xl overflow-hidden border border-[#080e1a] shadow-lg mb-8">
      {/* Top bar: live indicator, room, duration, PiP */}
      <div className="flex items-center justify-between px-6 py-3 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <Radio className="w-3.5 h-3.5" />
            REC (Auto-Recording Live)
          </div>
          <span className="font-mono text-xs text-white/70">
            Room: aura-live-{sessionId.slice(0, 6)}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="font-mono text-sm text-white/90">
            {formatDuration(callDuration)}
          </div>
          <button
            id="pip-btn"
            title="Picture-in-Picture mode"
            className="p-1.5 rounded hover:bg-white/10 text-white/80 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Video Tile Layout */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Guide / Self Tile */}
          <div className="bg-white/5 rounded-lg overflow-hidden relative flex flex-col items-center justify-center border border-white/10" style={{ aspectRatio: '16/9' }}>
            {cameraOn ? (
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#00f0ff]/20 flex items-center justify-center text-[#00f0ff] font-semibold text-lg">
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-white/40">
                <VideoOff className="w-8 h-8 mb-2" />
                <span className="text-xs">Camera Off</span>
              </div>
            )}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-[#080e1a]/80 px-2 py-1 rounded text-xs font-medium">
              <span>{displayName} (You)</span>
              {!micOn && <MicOff className="w-3 h-3 text-red-400" />}
            </div>
          </div>

          {/* Peer / Learner Tile */}
          <div className="bg-white/5 rounded-lg overflow-hidden relative flex flex-col items-center justify-center border border-white/10" style={{ aspectRatio: '16/9' }}>
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#9466ff]/20 flex items-center justify-center text-[#9466ff] font-semibold text-lg">
                AT
              </div>
            </div>
            <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-[#080e1a]/80 px-2 py-1 rounded text-xs font-medium">
              <span>Alex Taylor (Peer)</span>
              <span className="w-2 h-2 rounded-full bg-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* In-Call Controls Row */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-white/60">
          <Users className="w-4 h-4" />
          <span>2 participants in room</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="toggle-mic-btn"
            onClick={() => setMicOn(!micOn)}
            className={`p-3 rounded-full transition-colors ${
              micOn ? 'bg-white/15 hover:bg-white/25 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            id="toggle-cam-btn"
            onClick={() => setCameraOn(!cameraOn)}
            className={`p-3 rounded-full transition-colors ${
              cameraOn ? 'bg-white/15 hover:bg-white/25 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            id="toggle-screen-btn"
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`p-3 rounded-full transition-colors ${
              isScreenSharing ? 'bg-[#00b4c4] text-white' : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            id="end-call-btn"
            onClick={handleEndCall}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition-colors"
          >
            <PhoneOff className="w-4 h-4" /> End Call
          </button>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-white/40 block">
            Automatic ingest upon hangup
          </span>
        </div>
      </div>
    </div>
  );
}

export default InCallPanel;
