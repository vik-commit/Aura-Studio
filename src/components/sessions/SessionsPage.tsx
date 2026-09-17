/**
 * @license
 * Project Aura — SessionsPage component
 * Route component; takes no props.
 * Purpose: The one product surface: a card grid of sessions, the start dialog, the in-page call and the in-place workbench.
 * Contracts: session & derived_stage from data_contracts
 */

import React, { useState } from 'react';
import {
  Video,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Calendar,
  AlertCircle,
  FileCheck2,
  Users,
  CheckCircle2,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { Session, DerivedStage } from '../../types';
import { StartSessionDialog } from './StartSessionDialog';
import { InCallPanel } from '../incall/InCallPanel';
import { WorkbenchCard } from '../workbench/WorkbenchCard';

// Seed sessions strictly adhering to session & derived_stage contracts
const INITIAL_SESSIONS: Session[] = [
  {
    id: 'c87f3b40-8bf1-4e12-b131-098e6c7104d1',
    title: 'Platform Architecture & Ingest Pipeline Sync',
    status: 'complete',
    started_at: '2026-09-17T14:00:00Z',
    ended_at: '2026-09-17T14:24:30Z',
    duration_sec: 1470,
    recording_url: 'gs://aura-recordings/sessions/c87f3b40-8bf1-4e12-b131-098e6c7104d1.mp4',
    provider_recording_id: 'rec_daily_9921',
    staging_attempts: 1,
    frames_captured_at: '2026-09-17T14:26:00Z',
    participants: ['Alice Mehta (Guide)', 'Bob Chen (Learner)', 'Carol D. (Observer)'],
    derived_stage: {
      key: 'ready_for_review',
      label: 'Ready for Review',
      step: 4,
      total: 4,
      tone: 'done',
      reason: 'Extraction complete and cited stills captured.',
    },
    item_counts: {
      decisions: 2,
      commitments: 3,
      open_questions: 1,
      context: 4,
    },
  },
  {
    id: 'f12a8492-33ce-4279-88fa-848e42b10a99',
    title: 'Bi-Weekly Mentorship & Safeguarding Checkpoint',
    status: 'processing',
    started_at: '2026-09-17T14:45:00Z',
    ended_at: '2026-09-17T15:15:00Z',
    duration_sec: 1800,
    recording_url: 'gs://aura-recordings/sessions/f12a8492-33ce-4279-88fa-848e42b10a99.mp4',
    provider_recording_id: 'rec_daily_9934',
    staging_attempts: 1,
    participants: ['David Kim (Guide)', 'Elena Rostova (Learner)'],
    derived_stage: {
      key: 'reading',
      label: 'Reading the session',
      step: 3,
      total: 4,
      tone: 'busy',
      reason: 'Vertex AI windowed model extraction in progress (window 2/4).',
    },
    item_counts: {
      decisions: 1,
      commitments: 1,
      open_questions: 0,
      context: 2,
    },
  },
  {
    id: 'a5518cf0-21db-4952-b6bb-f8877e8a91c2',
    title: 'Quarterly Curriculum & Learning Milestones Planning',
    status: 'scheduled',
    started_at: null,
    ended_at: null,
    duration_sec: null,
    staging_attempts: 0,
    participants: ['Sarah Jenkins (Guide)', 'Michael Tan (Learner)'],
    derived_stage: {
      key: 'scheduled',
      label: 'Scheduled',
      step: 0,
      total: 4,
      tone: 'neutral',
      reason: 'Awaiting participants to join.',
    },
  },
];

export function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    'c87f3b40-8bf1-4e12-b131-098e6c7104d1'
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeCallSession, setActiveCallSession] = useState<{
    sessionId: string;
    displayName: string;
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleStartSession = (sessionId: string, displayName: string) => {
    // Add active session to the list
    const newSession: Session = {
      id: sessionId,
      title: 'Live Session in Progress',
      status: 'active',
      started_at: new Date().toISOString(),
      ended_at: null,
      duration_sec: null,
      staging_attempts: 0,
      participants: [`${displayName} (Guide)`, 'Alex Taylor (Learner)'],
      derived_stage: {
        key: 'recording',
        label: 'Recording',
        step: 0,
        total: 4,
        tone: 'live',
        reason: 'Live call active; recording automatically started on join.',
      },
    };

    setSessions([newSession, ...sessions]);
    setActiveCallSession({ sessionId, displayName });
  };

  const handleEndCall = () => {
    if (!activeCallSession) return;
    const endedId = activeCallSession.sessionId;

    // Advance session to awaiting_recording -> reading
    setSessions((prev) =>
      prev.map((s) =>
        s.id === endedId
          ? {
              ...s,
              status: 'processing',
              ended_at: new Date().toISOString(),
              duration_sec: 450,
              derived_stage: {
                key: 'reading',
                label: 'Reading the session',
                step: 3,
                total: 4,
                tone: 'busy',
                reason: 'Copied to Cloud Storage; Vertex AI reading session.',
              },
            }
          : s
      )
    );

    setActiveCallSession(null);
  };

  const toggleExpand = (sessionId: string) => {
    setExpandedSessionId((prev) => (prev === sessionId ? null : sessionId));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const formatDuration = (sec: number | null) => {
    if (!sec) return '—';
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins}m ${remainingSec}s`;
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return 'Scheduled';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStagePill = (stage?: DerivedStage) => {
    if (!stage) return null;
    const toneClass = `tone-${stage.tone}`;

    return (
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${toneClass}`}
        >
          {stage.tone === 'live' && (
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse mr-0.5" />
          )}
          {stage.tone === 'busy' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#007682] animate-ping mr-0.5" />
          )}
          {stage.label}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased">
      {/* Top Application Header */}
      <header className="bg-white border-b border-[#e2e8f0] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-[#080e1a] text-white flex items-center justify-center font-bold text-xs tracking-tight">
              A
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#191c1e] flex items-center gap-2">
                Aura
                <span className="text-xs font-mono font-normal text-[#45474c] bg-[#f7f9fb] px-2 py-0.5 rounded border border-[#e2e8f0]">
                  Hub
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="refresh-sessions-btn"
              onClick={handleRefresh}
              title="Refresh Sessions"
              className="p-2 text-[#45474c] hover:text-[#191c1e] hover:bg-[#f7f9fb] rounded-md border border-[#e2e8f0] transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#00b4c4]' : ''}`}
              />
            </button>

            <button
              id="start-session-trigger-btn"
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#080e1a] text-white hover:bg-[#191c1e] rounded-md transition-colors shadow-sm cursor-pointer"
            >
              <Video className="w-4 h-4 text-[#00f0ff]" />
              Start Session
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Active Call Live Panel (if currently in-call) */}
        {activeCallSession && (
          <InCallPanel
            sessionId={activeCallSession.sessionId}
            displayName={activeCallSession.displayName}
            onEnded={handleEndCall}
          />
        )}

        {/* Section Heading */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#191c1e]">
              Sessions
            </h2>
            <p className="text-sm text-[#45474c] mt-0.5">
              Turn recorded peer conversations into reviewed organizational memory.
            </p>
          </div>
          <div className="font-mono text-xs text-[#45474c]">
            {sessions.length} Recorded Sessions
          </div>
        </div>

        {/* Card Grid: 1 column under 768px, 2 up to 1280px, 3 above */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sessions.map((session) => {
            const isExpanded = expandedSessionId === session.id;
            const stage = session.derived_stage;

            return (
              <div
                key={session.id}
                id={`session-card-${session.id}`}
                className={`col-span-1 ${
                  isExpanded ? 'md:col-span-2 xl:col-span-3' : ''
                } transition-all duration-200`}
              >
                {/* Session Card Container */}
                <div
                  className={`bg-white rounded-xl border p-5 transition-shadow ${
                    isExpanded
                      ? 'border-[#080e1a] ring-1 ring-[#080e1a]/10 shadow-md'
                      : 'border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-sm'
                  }`}
                >
                  {/* Card Header: Stage Pill + Date/Time */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]/80 mb-3.5">
                    {getStagePill(stage)}
                    <div className="flex items-center gap-1.5 text-xs text-[#45474c] font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(session.started_at)}</span>
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-[#191c1e] line-clamp-2 leading-snug">
                      {session.title || 'Untitled Session'}
                    </h3>

                    {/* Progress Track (if processing / 4-step pipeline) */}
                    {stage && stage.step > 0 && (
                      <div className="mt-3 bg-[#f7f9fb] p-2.5 rounded-lg border border-[#e2e8f0]">
                        <div className="flex items-center justify-between text-[11px] font-medium text-[#45474c] mb-1.5">
                          <span>Pipeline Progress</span>
                          <span className="font-mono">
                            Step {stage.step} of {stage.total}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 h-1.5">
                          {[1, 2, 3, 4].map((stepNum) => (
                            <div
                              key={stepNum}
                              className={`rounded-full h-full ${
                                stepNum <= stage.step
                                  ? stage.tone === 'done'
                                    ? 'bg-[#080e1a]'
                                    : 'bg-[#00b4c4]'
                                  : 'bg-[#e2e8f0]'
                              }`}
                            />
                          ))}
                        </div>
                        {stage.reason && (
                          <p className="text-[11px] text-[#45474c] mt-1.5 font-normal">
                            {stage.reason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Participants & Duration */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-[#45474c] pt-2 border-t border-[#e2e8f0] mb-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-mono">
                        {formatDuration(session.duration_sec)}
                      </span>
                    </div>

                    {session.item_counts && (
                      <div className="flex items-center gap-2 text-[11px] font-mono">
                        <span className="inline-flex items-center gap-0.5 text-[#191c1e]">
                          <CheckCircle2 className="w-3 h-3 text-[#00b4c4]" />
                          {session.item_counts.decisions}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[#45474c]">
                          <Clock className="w-3 h-3" />
                          {session.item_counts.commitments}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[#45474c]">
                          <HelpCircle className="w-3 h-3 text-[#a82020]" />
                          {session.item_counts.open_questions}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Participants Row */}
                  {session.participants && session.participants.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-[#45474c] mb-4">
                      <Users className="w-3.5 h-3.5 shrink-0 text-[#45474c]" />
                      <span className="truncate">
                        {session.participants.join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Card Expansion Toggle Button */}
                  <button
                    id={`expand-session-btn-${session.id}`}
                    onClick={() => toggleExpand(session.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md border border-[#e2e8f0] bg-[#f7f9fb] hover:bg-[#e6e8ea] text-[#191c1e] transition-colors cursor-pointer"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" /> Collapse Workbench
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" /> Open In-Place Workbench
                      </>
                    )}
                  </button>

                  {/* In-Place Workbench Expansion */}
                  {isExpanded && (
                    <WorkbenchCard
                      sessionId={session.id}
                      session={session}
                      onClose={() => setExpandedSessionId(null)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Start Session Modal Dialog */}
      <StartSessionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onStarted={handleStartSession}
      />
    </div>
  );
}

export default SessionsPage;
