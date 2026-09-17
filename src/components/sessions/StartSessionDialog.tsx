/**
 * @license
 * Project Aura — StartSessionDialog component
 * Props: { open: boolean; onOpenChange: (open: boolean) => void; onStarted: (sessionId: string, displayName: string) => void; onScheduled?: () => void }
 * Purpose: Creates a session: organization, title, guide and learner seats, observers, start now or schedule.
 */

import React, { useState } from 'react';
import { X, Video, Calendar, User, Users, Shield } from 'lucide-react';

interface StartSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStarted: (sessionId: string, displayName: string) => void;
  onScheduled?: () => void;
}

export function StartSessionDialog({
  open,
  onOpenChange,
  onStarted,
  onScheduled,
}: StartSessionDialogProps) {
  const [title, setTitle] = useState('');
  const [guideName, setGuideName] = useState('Alice Mehta');
  const [learnerName, setLearnerName] = useState('Alex Taylor');
  const [observers, setObservers] = useState('David K.');
  const [mode, setMode] = useState<'now' | 'schedule'>('now');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const sessionId = `session-${Date.now()}`;
    setTimeout(() => {
      setIsSubmitting(false);
      onOpenChange(false);
      if (mode === 'now') {
        onStarted(sessionId, guideName);
      } else {
        if (onScheduled) onScheduled();
      }
    }, 400);
  };

  return (
    <div 
      id="start-session-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#080e1a]/70 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div 
        id="start-session-modal"
        className="relative max-w-lg w-full bg-white rounded-xl shadow-xl border border-[#e2e8f0] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-5">
          <div>
            <h2 className="text-lg font-semibold text-[#191c1e]">Start or Schedule Session</h2>
            <p className="text-xs text-[#45474c] mt-0.5">
              Daily.co room with automated Cloud Storage ingestion & Vertex AI extraction
            </p>
          </div>
          <button
            id="close-start-dialog-btn"
            onClick={() => onOpenChange(false)}
            className="p-1 rounded-md text-[#45474c] hover:bg-[#e6e8ea] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#f7f9fb] rounded-lg border border-[#e2e8f0]">
            <button
              type="button"
              id="mode-now-btn"
              onClick={() => setMode('now')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-colors ${
                mode === 'now'
                  ? 'bg-white text-[#191c1e] shadow-sm'
                  : 'text-[#45474c] hover:text-[#191c1e]'
              }`}
            >
              <Video className="w-3.5 h-3.5" /> Start Now
            </button>
            <button
              type="button"
              id="mode-schedule-btn"
              onClick={() => setMode('schedule')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-colors ${
                mode === 'schedule'
                  ? 'bg-white text-[#191c1e] shadow-sm'
                  : 'text-[#45474c] hover:text-[#191c1e]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Schedule Later
            </button>
          </div>

          {/* Session Title */}
          <div>
            <label className="block text-xs font-medium text-[#191c1e] mb-1">
              Session Title
            </label>
            <input
              id="session-title-input"
              type="text"
              required
              placeholder="e.g. Platform Architecture Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-[#e2e8f0] bg-white text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#080e1a]"
            />
          </div>

          {/* Seats / Participants */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-[#191c1e] mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#00b4c4]" /> Guide Seat (Primary Speaker)
              </label>
              <input
                id="guide-name-input"
                type="text"
                required
                value={guideName}
                onChange={(e) => setGuideName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-[#e2e8f0] bg-white text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#080e1a]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#191c1e] mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#9466ff]" /> Learner Seat (Peer Participant)
              </label>
              <input
                id="learner-name-input"
                type="text"
                required
                value={learnerName}
                onChange={(e) => setLearnerName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-[#e2e8f0] bg-white text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#080e1a]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#191c1e] mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#45474c]" /> Observers (Optional)
              </label>
              <input
                id="observers-input"
                type="text"
                placeholder="Comma separated names"
                value={observers}
                onChange={(e) => setObservers(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-[#e2e8f0] bg-white text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#080e1a]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[#e2e8f0] mt-5">
            <div className="flex items-center gap-1.5 text-[11px] text-[#45474c]">
              <Shield className="w-3.5 h-3.5 text-[#00b4c4]" />
              <span>Recording automatically starts on join</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="cancel-dialog-btn"
                onClick={() => onOpenChange(false)}
                className="px-3 py-2 text-xs font-medium text-[#45474c] hover:bg-[#e6e8ea] rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="submit-session-btn"
                disabled={isSubmitting || !title.trim()}
                className="px-4 py-2 text-xs font-medium bg-[#080e1a] text-white hover:bg-[#191c1e] rounded-md transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Initializing...' : mode === 'now' ? 'Join Call & Record' : 'Schedule Session'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StartSessionDialog;
