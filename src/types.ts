/**
 * @license
 * Project Aura — Domain Data Contracts
 * Source: Live MCP data_contracts endpoint
 */

export type SessionStatus =
  | 'scheduled'
  | 'active'
  | 'recording_pending'
  | 'processing'
  | 'complete'
  | 'error';

export type StageKey =
  | 'scheduled'
  | 'recording'
  | 'awaiting_recording'
  | 'copying'
  | 'reading'
  | 'stills'
  | 'ready'
  | 'ready_for_review'
  | 'reviewed'
  | 'attention'
  | 'failed';

export type StageTone = 'neutral' | 'live' | 'busy' | 'done' | 'bad';

export interface DerivedStage {
  key: StageKey;
  label: string;
  step: number;
  total: number;
  tone: StageTone;
  reason?: string | null;
  stalled?: boolean;
}

export interface Session {
  id: string;
  title: string | null;
  status: SessionStatus;
  started_at: string | null;
  ended_at: string | null;
  duration_sec: number | null;
  recording_url?: string | null;
  provider_recording_id?: string | null;
  upload_error?: string | null;
  staging_attempts?: number;
  last_stage_at?: string | null;
  frames_captured_at?: string | null;
  participants?: string[];
  derived_stage?: DerivedStage;
  item_counts?: {
    decisions: number;
    commitments: number;
    open_questions: number;
    context: number;
  };
}

export type ExtractionRunStatus = 'running' | 'done' | 'partial' | 'failed';

export interface ExtractionRun {
  id: string;
  session_id: string;
  status: ExtractionRunStatus;
  model: string;
  prompt_version: string;
  window_count: number;
  item_count: number;
  tokens_in?: number | null;
  tokens_out?: number | null;
  first_byte_ms?: number | null;
  latency_ms?: number | null;
  error?: string | null;
  started_at: string;
}

export type ExtractedItemKind =
  | 'decision'
  | 'commitment'
  | 'open_question'
  | 'context';

export type AssertionType = 'stated_fact' | 'hearsay' | 'suggestion' | null;

export type ReviewState = 'proposed' | 'confirmed' | 'edited' | 'discarded';

export interface ExtractedItem {
  id: string;
  session_id: string;
  run_id: string;
  kind: ExtractedItemKind;
  body: string;
  quote: string;
  timecode: string; // 'mm:ss'
  subject_label?: string | null;
  speaker_label?: string | null;
  owner_label?: string | null;
  assertion_type?: AssertionType;
  due_hint?: string | null;
  review_state: ReviewState;
}

export interface Frame {
  id?: string;
  session_id: string;
  kind: 'strip' | 'cited';
  at_ms: number;
  path: string;
  url?: string;
}
