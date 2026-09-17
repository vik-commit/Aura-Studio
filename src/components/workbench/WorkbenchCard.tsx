/**
 * @license
 * Project Aura — WorkbenchCard / SessionWorkbench
 * Purpose: Playback plus the extracted items for one session: player, filmstrip, timecode chips that seek, item list grouped by kind, re-run and regenerate controls.
 * Props Signature: { sessionId: string }
 */

import React, { useState } from 'react';
import {
  Check,
  X,
  Play,
  Pause,
  RotateCw,
  Clock,
  User,
  Quote,
  HelpCircle,
  CheckCircle2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { ExtractedItem, ExtractedItemKind, ReviewState, Session } from '../../types';
import { TimestampStill } from '../media/TimestampStill';

interface WorkbenchCardProps {
  sessionId: string;
  session?: Session;
  onClose?: () => void;
}

// Initial extracted items complying with data_contracts for session workbench
const INITIAL_ITEMS: ExtractedItem[] = [
  {
    id: 'item-1',
    session_id: 'sess-1',
    run_id: 'run-1',
    kind: 'decision',
    body: 'The team agreed to transition recording pipelines to server-authoritative ingestion.',
    quote: 'Let us standardize on the Cloud Run worker copy path so client tabs never do heavy video work.',
    timecode: '04:12',
    speaker_label: 'Alice',
    assertion_type: 'stated_fact',
    review_state: 'confirmed',
  },
  {
    id: 'item-2',
    session_id: 'sess-1',
    run_id: 'run-1',
    kind: 'commitment',
    body: 'Bob will deploy the new ffmpeg still extraction service by Friday afternoon.',
    quote: 'I will handle the still extraction deployment and test the cited timecodes by end of week.',
    timecode: '08:45',
    speaker_label: 'Bob',
    owner_label: 'Bob',
    due_hint: 'by Friday afternoon',
    review_state: 'proposed',
  },
  {
    id: 'item-3',
    session_id: 'sess-1',
    run_id: 'run-1',
    kind: 'open_question',
    body: 'Whether to store high-resolution stills in GCS cold storage or multi-region bucket.',
    quote: 'Do we need multi-region replication for intermediate still frames, or is regional sufficient?',
    timecode: '12:30',
    speaker_label: 'Carol',
    review_state: 'proposed',
  },
  {
    id: 'item-4',
    session_id: 'sess-1',
    run_id: 'run-1',
    kind: 'context',
    body: 'The Daily.co webhook timeout is configured to 5000 milliseconds for initial acknowledge.',
    quote: 'Daily expects a 200 OK within five seconds or it enters a backoff retry loop.',
    timecode: '15:10',
    speaker_label: 'Alice',
    assertion_type: 'stated_fact',
    review_state: 'confirmed',
  },
];

export function WorkbenchCard({ sessionId, session, onClose }: WorkbenchCardProps) {
  const [items, setItems] = useState<ExtractedItem[]>(INITIAL_ITEMS);
  const [activeTimecode, setActiveTimecode] = useState<string>('04:12');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isReRunning, setIsReRunning] = useState<boolean>(false);
  const [filterKind, setFilterKind] = useState<ExtractedItemKind | 'all'>('all');

  const handleReviewState = (itemId: string, state: ReviewState) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, review_state: state } : it))
    );
  };

  const handleReRun = () => {
    setIsReRunning(true);
    setTimeout(() => {
      setIsReRunning(false);
    }, 1500);
  };

  const filteredItems = filterKind === 'all' 
    ? items 
    : items.filter((it) => it.kind === filterKind);

  const getKindBadge = (kind: ExtractedItemKind) => {
    switch (kind) {
      case 'decision':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#080e1a] text-white">
            <CheckCircle2 className="w-3 h-3 text-[#00f0ff]" /> Decision
          </span>
        );
      case 'commitment':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#e0f9fb] text-[#007682] border border-[#b7edf2]">
            <Clock className="w-3 h-3" /> Commitment
          </span>
        );
      case 'open_question':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#fff0f0] text-[#a82020] border border-[#fed7d7]">
            <HelpCircle className="w-3 h-3" /> Open Question
          </span>
        );
      case 'context':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#f7f9fb] text-[#45474c] border border-[#e2e8f0]">
            <FileText className="w-3 h-3" /> Context
          </span>
        );
    }
  };

  return (
    <div id={`workbench-${sessionId}`} className="bg-white border border-[#e2e8f0] rounded-xl p-6 mt-4 shadow-sm">
      {/* Workbench Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e2e8f0] mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-[#191c1e]">
              {session?.title || 'Session Workbench'}
            </h3>
            <span className="font-mono text-xs text-[#45474c] bg-[#f7f9fb] px-2 py-0.5 rounded border border-[#e2e8f0]">
              ID: {sessionId.slice(0, 8)}
            </span>
          </div>
          <p className="text-xs text-[#45474c] mt-0.5">
            Vertex AI windowed extraction with human gate review.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="rerun-extraction-btn"
            onClick={handleReRun}
            disabled={isReRunning}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-[#e2e8f0] bg-white text-[#191c1e] hover:bg-[#f7f9fb] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isReRunning ? 'animate-spin text-[#00b4c4]' : ''}`} />
            {isReRunning ? 'Running Extraction...' : 'Re-run extraction'}
          </button>
          {onClose && (
            <button
              id="close-workbench-btn"
              onClick={onClose}
              className="p-1.5 text-[#45474c] hover:text-[#191c1e] hover:bg-[#f7f9fb] rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Player / Filmstrip + Extracted Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Player & Filmstrip */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#080e1a] rounded-lg overflow-hidden relative" style={{ aspectRatio: '16/9' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <button
                id="toggle-playback-btn"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-transform hover:scale-105"
              >
                {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-0.5" />}
              </button>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono text-white/80">
                <span>{activeTimecode}</span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded">
                  Cloud Storage / Vertex AI Stream
                </span>
                <span>18:40</span>
              </div>
            </div>
          </div>

          {/* Filmstrip Timeline */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#45474c]">Key Cited Moments</span>
              <span className="text-[11px] font-mono text-[#45474c]">4 frames indexed</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['04:12', '08:45', '12:30', '15:10'].map((tc) => (
                <div
                  key={tc}
                  id={`filmstrip-frame-${tc.replace(':', '-')}`}
                  onClick={() => setActiveTimecode(tc)}
                  className={`cursor-pointer rounded border p-1 transition-all ${
                    activeTimecode === tc
                      ? 'border-[#080e1a] bg-[#080e1a]/5'
                      : 'border-[#e2e8f0] hover:border-[#45474c]'
                  }`}
                >
                  <TimestampStill timecode={tc} className="w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Extracted Memory Items with Human Gate */}
        <div className="lg:col-span-7 space-y-3">
          {/* Filter Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
            <div className="flex items-center gap-1">
              {(['all', 'decision', 'commitment', 'open_question', 'context'] as const).map((k) => (
                <button
                  key={k}
                  id={`filter-kind-${k}`}
                  onClick={() => setFilterKind(k)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    filterKind === k
                      ? 'bg-[#080e1a] text-white'
                      : 'text-[#45474c] hover:bg-[#e6e8ea]'
                  }`}
                >
                  {k === 'all' ? 'All Items' : k.replace('_', ' ')}
                </button>
              ))}
            </div>
            <span className="font-mono text-xs text-[#45474c]">
              {filteredItems.length} items
            </span>
          </div>

          {/* Items List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                id={`extracted-item-${item.id}`}
                className={`p-3.5 rounded-lg border transition-all ${
                  item.review_state === 'confirmed'
                    ? 'border-[#e2e8f0] bg-white'
                    : item.review_state === 'discarded'
                    ? 'border-[#e2e8f0] bg-[#f7f9fb] opacity-60'
                    : 'border-[#b7edf2] bg-[#f7feff]'
                }`}
              >
                {/* Header: Kind & Timecode & Status */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getKindBadge(item.kind)}
                    <button
                      onClick={() => setActiveTimecode(item.timecode)}
                      className="inline-flex items-center gap-1 font-mono text-xs text-[#45474c] hover:text-[#191c1e] bg-[#f7f9fb] px-1.5 py-0.5 rounded border border-[#e2e8f0] cursor-pointer"
                    >
                      <Clock className="w-3 h-3" />
                      {item.timecode}
                    </button>
                    {item.speaker_label && (
                      <span className="inline-flex items-center gap-1 text-xs text-[#45474c]">
                        <User className="w-3 h-3" />
                        {item.speaker_label}
                      </span>
                    )}
                  </div>

                  {/* Human Gate Actions */}
                  <div className="flex items-center gap-1">
                    {item.review_state === 'proposed' && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#007682] bg-[#e0f9fb] px-1.5 py-0.5 rounded mr-1">
                        Proposed
                      </span>
                    )}
                    {item.review_state === 'confirmed' && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#191c1e] bg-[#e6e8ea] px-1.5 py-0.5 rounded mr-1">
                        Confirmed
                      </span>
                    )}
                    {item.review_state === 'discarded' && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#45474c] bg-[#e6e8ea] px-1.5 py-0.5 rounded mr-1">
                        Discarded
                      </span>
                    )}
                    <button
                      id={`accept-item-${item.id}`}
                      onClick={() => handleReviewState(item.id, 'confirmed')}
                      title="Accept Item"
                      className={`p-1 rounded hover:bg-[#e6e8ea] transition-colors ${
                        item.review_state === 'confirmed' ? 'text-[#191c1e] bg-[#e6e8ea]' : 'text-[#45474c]'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`discard-item-${item.id}`}
                      onClick={() => handleReviewState(item.id, 'discarded')}
                      title="Discard Item"
                      className={`p-1 rounded hover:bg-[#e6e8ea] transition-colors ${
                        item.review_state === 'discarded' ? 'text-[#a82020] bg-[#fff0f0]' : 'text-[#45474c]'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Body: One plain neutral sentence */}
                <p className="text-sm font-medium text-[#191c1e] mb-2 leading-relaxed">
                  {item.body}
                </p>

                {/* Verbatim Quote Evidence */}
                <div className="flex items-start gap-2 bg-[#f7f9fb] rounded-md p-2 border border-[#e2e8f0]">
                  <Quote className="w-3.5 h-3.5 text-[#45474c] shrink-0 mt-0.5" />
                  <p className="text-xs italic text-[#45474c]">
                    "{item.quote}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const SessionWorkbench = WorkbenchCard;
export default WorkbenchCard;
