# Project Aura — Architecture & Single Source of Truth

> **Source of Truth**: Live Lovable MCP Endpoint (`https://nitiedu.lovable.app/mcp/public`)
> **Generated**: 2026-09-17

## 1. System Overview & Core Principles

**Aura** turns recorded conversations into reviewed organizational memory. Sessions are recorded through Daily, copied to Google Cloud Storage by a Cloud Run worker, read in place by Vertex AI, and split into decisions, commitments, open questions, and context. Every item passes a human gate before it counts.

### Core Principles:
- **Trust over extraction: nothing is published or acted on without a person accepting it.**
- **No automated adverse action; every consequential decision has a named human.**
- **Guardians never see raw telemetry, video, or evaluation detail — only curated reports.**
- **Roles live in a separate user_roles table with a has_role() security definer function.**

## 2. Agent Handbook & Boundary Rules

{
  "meta": {
    "title": "Aura — Reference Handbook for Connected Agents",
    "audience": "Google AI Studio Build, Lens, and any other externally connected agent",
    "lastUpdated": "2026-09-16",
    "connection": "/mcp (OAuth 2.1, read-only tools, acts as the signed-in user); /mcp/public (no sign-in, static reference only: agent_handbook, design_system, data_contracts, workflow_spec, prompt_library, app_atlas, list_diagrams, get_diagram)"
  },
  "sectionIds": [
    "read-this-first",
    "what-is-reusable",
    "boundary-and-honesty",
    "what-you-can-reach",
    "what-you-can-never-reach",
    "hard-constraints",
    "how-to-ask-well",
    "output-contract",
    "known-issues",
    "audit-types",
    "freshness"
  ],
  "sections": [
    {
      "id": "read-this-first",
      "title": "Read this first",
      "body": "Aura turns recorded conversations into reviewed organizational memory. Sessions are recorded through Daily.co, copied to Google Cloud Storage by a Cloud Run worker, read in place by Vertex AI, and split into four item kinds — decision, commitment, open_question, context. Every item passes a human gate before it counts.\n\n**Aura is a reference implementation, not the app you are building.** Your product lives in a separate codebase with a separate backend, separate hosting and separate data. Nothing here is a component you import; it is a working system you can read, learn from, and deliberately diverge from. Aura is developed and led in Lovable; this connection is one-way and read-only, with no write path, no sync and no code export.\n\nFour rules govern how you work here:\n\n1. **Take the contract, not the implementation.** `design_system`, `data_contracts`, `workflow_spec` and `prompt_library` are the reusable material — visual language, domain shapes, lifecycle rules, prompt text. They are stated deliberately free of our framework, database and vendors so you can satisfy them your own way.\n2. **The Atlas is the declared architecture, not the source tree.** Call `app_atlas` before reading files. It names every component, page, background job, table and setting, with the files that implement each one.\n3. **You are read-only on the live plane.** Every connection tool acts as the signed-in user under the same row level security as the app. Nothing you call can write, delete, or escalate.\n4. **A contradiction between the code and the Atlas is worth reporting.** Say what you saw on both sides. Do not silently trust either one.\n\n`ATLAS_META.lastReviewed` tells you when the map was last confirmed against the build. If it is stale relative to the newest `build_notes` entry, treat structural claims as provisional."
    },
    {
      "id": "what-is-reusable",
      "title": "What is reusable, what is Aura-specific",
      "body": "**Reusable — take it.**\n\n- The **item taxonomy** (decision, commitment, open_question, context) and the evidence rule: every item carries a verbatim quote and a timecode. This is the load-bearing idea.\n- The **human gate**: model output is an amendable suggestion until a person confirms it; re-runs never destroy a human decision.\n- The **windowed reading pass** with overlap and deduplication, and the duplicate-run guard. See `prompt_library` and `workflow_spec`.\n- The **derived stage** pattern: the card's visible state is computed on read from the record plus its latest run, never stored, so it cannot go stale.\n- The **retrieval rhythm**: ask the moment the call ends, short cooldown while fresh, background sweeper as the safety net, attempt cap, then an honest stalled state with a manual control.\n- The **design language** in `design_system`, including its exclusions.\n\n**Aura-specific — do not copy without thinking.**\n\n- Vendor choices: Daily.co, Cloud Run, Google Cloud Storage, Vertex AI. `workflow_spec` is written so none of them are load-bearing.\n- Our data layer: Lovable Cloud, our table DDL, our RLS policies, our storage paths. `data_contracts` gives you the shapes without them.\n- Our privacy posture (no automated adverse action, audience-scoped reports, retention rules) reflects who Aura serves. If your product evaluates people, that is a different posture and a different prompt — `prompt_library` flags exactly where.\n- Our route layout, framework and generated files.\n\n**Do not propose changing Aura's platform, stack, vendors or architecture.** If you would do it differently in your own build, do it differently in your own build."
    },
    {
      "id": "boundary-and-honesty",
      "title": "The boundary, and shipped vs planned",
      "body": "**The bridge is one-way and read-only.** Nothing you do reaches this project: there is no write tool, no sync, no code export, no way to change a file, a table, a class or a component here. Aura's backend — recording, copy to cloud storage, the Vertex reading pass, stills, the watchdog and the retry rules — is already built and running end to end. Treat it as running infrastructure to read, not as work to be wired up.\n\n**The visual layer is locked.** `design_system` now carries an explicit `directive`: do not restyle, re-theme or substitute components, do not touch utility classes or layout, and reach colour only through semantic tokens. Data is injected through the declared props in `app_atlas.uiComponents`, never through markup.\n\n**Shipped is marked, planned is marked.** Every entry in `app_atlas.uiComponents` carries `existsToday`. Only `/sessions` and its review screen exist as product surfaces. A **Productivity** page, an **Organization** page, a kanban board, and separate `TaskItem` / `Commitment` / `OrganizationPulse` types are design directions with `existsToday: false` — they are not routes, not components and not tables. The only item type is the extracted item with a `kind` of decision, commitment, open_question or context. If you need a surface that is marked planned, say so and request it; never assume it exists.\n\n**API shapes.** `workflow_spec` carries an `endpoints` section: method, path, auth requirement, request body and response shape for the public HTTP routes and for every typed server function the browser calls. Use it instead of guessing a route."
    },
    {
      "id": "what-you-can-reach",
      "title": "What you can reach — three planes",
      "body": "**Reference plane (static, no data).** `design_system`, `data_contracts`, `workflow_spec`, `prompt_library`, `agent_handbook`, `app_atlas`, `list_diagrams`, `get_diagram`. This is the portable material — start here.\n\n**Repo plane (GitHub).** Full source: `src/routes` (pages, API routes), `src/lib` (server functions, extraction, providers), `services/daily-ingest` (Cloud Run worker), `supabase/migrations`, `docs/`. This is how it is actually written.\n\n**Live plane (the connection at /mcp).** Twenty read-only tools in total. This is what is true right now, and it is your evidence that the approach survives production.\n\n**Connecting.** Two endpoints:\n\n- `POST /mcp` — the full server. Requires OAuth 2.1 sign-in (dynamic client registration against the auth issuer; see the `external` diagram). Every tool acts as the signed-in user.\n- `POST /mcp/public` — no sign-in. The eight static reference tools listed above. Everything you need to build your own product is here; OAuth is only for live state.\n\nBoth endpoints allow browser cross-origin calls (CORS `Access-Control-Allow-Origin: *`, preflight handled). If you render diagrams, `get_diagram` also returns a `nodes` map — Mermaid node id (or sequence participant letter) → atlas component id — so clicking a box can call `describe_component`.\n\nQuestion → tool index:\n\n| You want to know | Call |\n| --- | --- |\n| What does it look like, and what should it never look like? | `design_system` |\n| What shapes must my backend supply? | `data_contracts` (optional `id`) |\n| What are the lifecycle and retry rules? | `workflow_spec` |\n| What exactly is sent to the model? | `prompt_library` |\n| How is this app put together? | `app_atlas` (optional `area`) |\n| Which diagrams exist and when do I read them? | `list_diagrams` |\n| Render one architecture diagram | `get_diagram { id }` |\n| Everything about one component | `describe_component { id }` |\n| The runtime stage graph of the pipeline | `pipeline_architecture` |\n| Is the pipeline healthy right now? | `pipeline_overview` |\n| Which sessions exist, in what state? | `list_sessions` |\n| Why is this one session like that? | `session_detail { id }` |\n| What is stalled and needs attention? | `list_stuck_sessions` |\n| Throughput, failures, model, windows per run | `extraction_runs` |\n| What happened, in order, across the pipeline? | `ops_timeline` |\n| Chart-ready counts bucketed by hour or day | `metrics_series` |\n| Does the live database match the repo? | `applied_migrations` |\n| Did a build change inference behavior? | `prompt_registry` (SHA-256 hashes) |\n| What did recent builds mean? | `build_notes` |\n| The rules you are reading now | `agent_handbook` (optional `section`) |\n\nPrefer the reference plane for \"how should I build mine\". Prefer the live plane for \"does this actually hold up\". Prefer the repo for \"why is the code like this\"."
    },
    {
      "id": "what-you-can-never-reach",
      "title": "What you can never reach",
      "body": "Stated as a guarantee so you stop proposing work that assumes access:\n\n- **Recordings and recording URLs.** No tool returns a media URL, signed or otherwise.\n- **Transcript text and extracted item content beyond counts and structure** on the observability tools.\n- **Secrets.** No API keys, service-account JSON, webhook secrets, or the Supabase service-role key. They are not retrievable from code or from the connection, and no placeholder stands in for them.\n- **Rows outside the signed-in user's scope.** Every query runs under RLS as that person. An empty result is usually access scope, not a bug — check `access.mmd` before reporting it as data loss.\n- **Anything on the guardian-facing side beyond the curated report.** Guardians never see raw telemetry, video, or instructor evaluation detail; neither do you."
    },
    {
      "id": "hard-constraints",
      "title": "Hard constraints — do not propose changing these",
      "body": "Findings that violate these are rejected without review:\n\n1. **Platform is fixed.** Lovable + TanStack Start + React 19 + Supabase (via Lovable Cloud). No framework migration, no router replacement, no react-router-dom, no self-host proposals.\n2. **Provider rule.** Once recordings live in Cloud Storage, `AI_PROVIDER` must be `vertex`. The Gemini public API cannot read `gs://` URIs. Never propose `AI_PROVIDER=gemini` for a bridged session.\n3. **Gateway model.** `src/lib/gateway.server.ts` uses the enforced Lovable AI Gateway model. Do not propose substituting another model there.\n4. **Generated files are read-only.** `src/routeTree.gen.ts`, `src/integrations/supabase/*`, `src/routes/mcp.ts`, `.env`, `supabase/config.toml`.\n5. **Auth and roles.** Roles live only in `user_roles` with the `has_role()` security definer function — never a role column on profiles. RLS is mandatory on every public table, with explicit GRANTs in the same migration that creates the table.\n6. **Server runtime is an edge worker.** No child_process, no native binaries, no long-lived connections, no filesystem assumptions. Heavy or long work belongs in the Cloud Run worker.\n7. **Privacy posture.** No automated adverse action against instructors; every consequential decision has a named human. Audience-scoped report access. Retention rules stand.\n8. **No schema rewrites** without an explicit migration plan. Never touch the `auth`, `storage`, `realtime`, `supabase_functions` or `vault` schemas."
    },
    {
      "id": "how-to-ask-well",
      "title": "How to ask well — recipes that pair the planes",
      "body": "**Drift check (deployed code vs live database).** `applied_migrations` → compare with the filenames in `supabase/migrations/`. A migration in the repo but not applied means the code is ahead of the database; the reverse means a rollback happened. Report the exact version strings.\n\n**Prompt-change check.** `prompt_registry` returns SHA-256 hashes of the live prompt text plus `promptVersion`. Store the hash per build. When it moves, diff `src/lib/extraction.server.ts` in the repo and flag every build in that range as inference-affecting.\n\n**Regression check around a commit range.** `build_notes` for intent and known risks → `ops_timeline` for what the pipeline did in that window → `metrics_series` for the failure-rate curve before and after. A rate change that starts at a build timestamp is evidence; a coincidence in time alone is not.\n\n**Stuck-pipeline triage.** `list_stuck_sessions` → `session_detail { id }` for status history → `extraction_runs` for the run rows (model, windows, failures). Then, and only then, read the code path in `src/lib/extraction.server.ts` or `src/routes/api/public/cron-staging-watchdog.ts`.\n\n**Architecture question.** `app_atlas { area }` → `describe_component { id }` for callers/callees and the files involved → `get_diagram { id }` if you need to render it. Reading the source tree first wastes calls and produces inferred, not verified, findings."
    },
    {
      "id": "output-contract",
      "title": "How to report back",
      "body": "Most of the time you are building your own product and owe no report at all — read what you need and go. This section applies only when you are deliberately reporting something about Aura back to its human.\n\nWhen you do, carry these:\n\n1. **Evidence** — `file:line`, or the tool call and the field that shows it. No claim without a reference.\n2. **Verified or inferred** — say explicitly whether you traced the full path or are reasoning from a partial read.\n3. **Severity** — blocker / high / medium / low, ranked against the priorities below.\n4. **Review flag** — anything touching secrets, auth, RLS, payments or migrations is marked \"do not apply without human review\".\n\n**Current priorities (pilot stage), in order:** (1) reliability of the session pipeline — nothing may block, race, retry-storm, or lose a recording; (2) data trust — extraction output accurate, deduplicated, cited, human-reviewable; (3) security and privacy — RLS gaps, GRANTs, secret handling, data egress.\n\n**Rejected categories — do not propose these for Aura:** bundle size, cosmetic refactors, dependency upgrades without a stated need, textbook rewrites, framework or platform migration, moving the backend, alternative gateway models, edits to generated files. Aura's platform and stack are settled; divergent choices belong in your own build, not in a proposal here."
    },
    {
      "id": "known-issues",
      "title": "Known issues — verify, do not rediscover",
      "body": "These are already known. Confirm whether each still holds and say so; do not report them as new.\n\n- The Cloud Run worker acknowledges Daily immediately and processes in the background; earlier versions responded only after the full GCS stream and Aura callback. Verify the acknowledgement is still first.\n- `src/routes/api/public/ingest-complete.ts` records the `gs://` URI and returns `processing_started` without awaiting extraction. Verify nothing re-introduced a blocking await.\n- `src/routes/api/public/cron-staging-watchdog.ts` excludes `gs://` rows from the legacy stage/pipe path and acts as a one-session-per-tick extraction backstop. Verify the exclusion, and check for races with the ingest callback.\n- A duplicate-run guard exists on extraction. Verify it covers both the watchdog claim and a manual rerun.\n- Vertex model selection defaults to `gemini-2.5-flash`, overridable via `VERTEX_MODEL`. Verify no invalid preview model ID can be reached when the setting is unset.\n- `ops_events` only contains events written from the 2026-09-05 build onward; earlier history lives in `extraction_runs`."
    },
    {
      "id": "audit-types",
      "title": "Occasional review work",
      "body": "Secondary to building your own product, Aura's human sometimes asks for one of these:\n\n1. **Pipeline review** — trace conferencing webhook → worker → object store → ingest callback → windowed extraction → human review. Question: where can this block, retry, race, or lose data?\n2. **Security and privacy review (before any new data stream)** — RLS coverage, GRANTs, secret handling, what leaves the platform, audience-scoped access.\n3. **Regression review (after any significant change)** — given a diff, what does it break elsewhere?\n\n**Out of scope:** module rewrites, dependency churn, UI/UX review without screenshots (you have no rendering context), bundle-size work during pilot, and anything that proposes changing Aura's stack."
    },
    {
      "id": "freshness",
      "title": "Freshness",
      "body": "Two currency signals, both on the connection:\n\n- `app_atlas` → `meta.lastReviewed`: when the declared map was last confirmed against the build.\n- `build_notes`: newest entry first, with areas touched and known risks. If the newest note is later than `lastReviewed`, the map may lag the code — treat structural claims as provisional and say so.\n\nThis handbook is generated from `src/lib/atlas/handbook.ts`. Read it in the repo at `docs/ops/studio-build-handbook.md`, or call `agent_handbook` on the connection. Both are the same text.\n\nKey ops docs in the repo: `docs/ops/daily-co-setup.md` (full Daily.co configuration: rooms, webhook, ingest worker, fallback, secrets), `services/daily-ingest/README.md` (Cloud Run deploy runbook with per-step checks), `docs/ops/aura-rebuild-spec.md` (full platform spec)."
    }
  ]
}

## 3. Data Contracts (Domain Model)

*Note: Domain contract only — not table DDL, migrations, RLS or storage layout. A separate backend may implement these shapes however it likes.*

### Contract: `session` — Session
**Purpose**: One recorded conversation. Everything else hangs off it. The UI derives the visible stage from this record plus the latest run.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `uuid` | Yes | Stable identifier used in every other contract. |
| `title` | `string | null` | No | User-supplied; null renders as 'Untitled session'. |
| `status` | `'scheduled' | 'active' | 'recording_pending' | 'processing' | 'complete' | 'error'` | Yes | Coarse lifecycle. The card label comes from the derived stage, not this field alone. |
| `started_at` | `timestamptz | null` | No | When the call began. |
| `ended_at` | `timestamptz | null` | No | Drives the retry rhythm and the stall threshold. |
| `duration_sec` | `integer | null` | No | Falls back to 900 when unknown, for window planning. |
| `recording_url` | `string | null` | Yes | Object-store URI of the finished media. Presence of this field is what moves the session from 'waiting' to 'reading'. Never exposed to external agents. |
| `provider_recording_id` | `string | null` | No | The conferencing provider's recording id. Presence means 'copy in flight'. |
| `upload_error` | `string | null` | No | Human-readable failure from the copy step; non-null forces the attention state. |
| `staging_attempts` | `integer` | Yes | How many times the pickup has asked the provider. Caps at 5. |
| `last_stage_at` | `timestamptz | null` | No | Last pickup attempt; combined with ended_at to compute the cooldown. |
| `frames_captured_at` | `timestamptz | null` | No | Set when stills finish; the last gate before 'ready'. |
| `participants` | `string[]` | No | Display names, passed into the prompt so speaker labels can be resolved. |

### Contract: `extraction_run` — Extraction run
**Purpose**: One AI read of one session. Re-runs append; they never overwrite history.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `uuid` | Yes |  |
| `session_id` | `uuid` | Yes |  |
| `status` | `'running' | 'done' | 'partial' | 'failed'` | Yes | 'partial' means some windows failed but usable items came back. Treat 'done' and 'partial' as terminal — treating only 'done' as terminal causes an infinite re-read loop. |
| `model` | `string` | Yes | Exact model identifier that answered, recorded per run. |
| `prompt_version` | `string` | Yes | Bumped whenever prompt text changes inference behaviour. |
| `window_count` | `integer` | Yes | Number of time windows the recording was split into. |
| `item_count` | `integer` | Yes | Items surviving deduplication. |
| `tokens_in / tokens_out` | `integer | null` | No | Cost accounting. |
| `first_byte_ms / latency_ms` | `integer | null` | No | Streaming responsiveness and total wall time. |
| `error` | `string | null` | No |  |
| `started_at` | `timestamptz` | Yes | There is no created_at; order by started_at. |

### Contract: `extracted_item` — Extracted item
**Purpose**: One thing that was communicated, anchored to evidence. The unit a human confirms. Four kinds only.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `uuid` | Yes |  |
| `session_id / run_id` | `uuid` | Yes |  |
| `kind` | `'decision' | 'commitment' | 'open_question' | 'context'` | Yes | Closed set. Do not add kinds without changing the prompt and the taxonomy together. |
| `body` | `string` | Yes | One plain neutral sentence. No adjectives about people. |
| `quote` | `string` | Yes | Verbatim span copied from the conversation — the evidence. Never paraphrased. |
| `timecode` | `string (mm:ss)` | Yes | Where the quote occurs; the UI turns it into a seek control. |
| `subject_label` | `string | null` | No | Canonical name of what the item is about, reused across items. |
| `speaker_label / owner_label` | `string | null` | No | Only when identifiable. Never guessed. |
| `assertion_type` | `'stated_fact' | 'hearsay' | 'suggestion' | null` | No | For context and decision items. |
| `due_hint` | `string | null` | No | Only when a deadline was said aloud; copied as spoken. |
| `review_state` | `'proposed' | 'confirmed' | 'edited' | 'discarded'` | Yes | Only untouched 'proposed' rows are replaced on a re-run. Human decisions survive. |

### Contract: `frame` — Frame (still)
**Purpose**: A JPEG cut from the recording, used for the filmstrip and key-moment thumbnails.

| Field | Type | Required | Notes |
|---|---|---|---|
| `session_id` | `uuid` | Yes |  |
| `kind` | `'strip' | 'cited'` | Yes | 'strip' = evenly spaced filmstrip; 'cited' = one per item timecode. |
| `at_ms` | `integer` | Yes | Offset into the recording. |
| `path` | `string` | Yes | Object-store path. Served to signed-in users only. |

### Contract: `derived_stage` — Derived stage (computed, not stored)
**Purpose**: What the card shows. Computed from the session plus its latest run on every read, so it is never stale.

| Field | Type | Required | Notes |
|---|---|---|---|
| `key` | `'scheduled' | 'recording' | 'awaiting_recording' | 'copying' | 'reading' | 'stills' | 'ready' | 'attention'` | Yes | See the workflow_spec tool for the transition rules. |
| `label` | `string` | Yes | Short human phrase shown in the pill. |
| `step / total` | `integer` | Yes | Position on the 4-segment post-call progress track; 0 when off-track. |
| `tone` | `'neutral' | 'live' | 'busy' | 'done' | 'bad'` | Yes | Maps to the status tones in the design_system tool. |
| `reason` | `string | null` | No | One plain-language line under the pill explaining the wait or the failure. |
| `stalled` | `boolean` | No | True when the recording is overdue; the card then offers a manual pull. |

## 4. App Atlas & Component Registry

### Shipped UI Components (`existsToday: true` vs `existsToday: false`)

#### `Sessions page` (✅ EXISTS TODAY)
- **Kind / Area**: undefined | 
- **Purpose**: The one product surface: a card grid of sessions, the start dialog, the in-page call and the in-place workbench. There is no separate session detail route — a card expands where it sits.
- **Props Signature**:
```typescript
"Route component; takes no props. Data comes from server functions (listLeanSessions) polled every 10s."
```

#### `SessionWorkbench` (✅ EXISTS TODAY)
- **Kind / Area**: undefined | 
- **Purpose**: Playback plus the extracted items for one session: player, filmstrip, timecode chips that seek, item list grouped by kind, re-run and regenerate controls.
- **Props Signature**:
```typescript
"{ sessionId: string }"
```

#### `StartSessionDialog` (✅ EXISTS TODAY)
- **Kind / Area**: undefined | 
- **Purpose**: Creates a session: organization, title, guide and learner seats, observers, start now or schedule.
- **Props Signature**:
```typescript
"{ open: boolean; onOpenChange: (open: boolean) => void; onStarted: (sessionId: string, displayName: string) => void; onScheduled?: () => void }"
```

#### `InCallPanel` (✅ EXISTS TODAY)
- **Kind / Area**: undefined | 
- **Purpose**: The live call: joins the room, starts recording automatically, renders camera and screen-share tiles and the control row, and can pop the whole call into a floating always-on-top window.
- **Props Signature**:
```typescript
"{ sessionId: string; displayName: string; onEnded: () => void }"
```

#### `SessionVideoProvider` (✅ EXISTS TODAY)
- **Kind / Area**: undefined | 
- **Purpose**: Supplies the signed recording URL and the still frame for any timecode to everything beneath it.
- **Props Signature**:
```typescript
"{ sessionId: string; requiredTimecodes: number[]; mode?: \"view\" | \"capture\"; children: React.ReactNode }"
```

#### `TimestampStill` (✅ EXISTS TODAY)
- **Kind / Area**: undefined | 
- **Purpose**: The thumbnail for one cited timecode; click enlarges it.
- **Props Signature**:
```typescript
"{ timecode: string | number | undefined | null; className?: string }"
```

#### `Productivity page` (❌ PLANNED / DOES NOT EXIST)
- **Kind / Area**: undefined | 
- **Purpose**: DESIGN DIRECTION, NOT BUILT. Intended to show commitments across sessions with real owners and parsed dates. Today commitments live only inside the session item list, the owner is a free-text label and no due date is parsed.
- **Props Signature**:
```typescript
"Not defined — the component does not exist. There is no KanbanBoard in this codebase."
```

#### `Organization page` (❌ PLANNED / DOES NOT EXIST)
- **Kind / Area**: undefined | 
- **Purpose**: DESIGN DIRECTION, NOT BUILT. Intended to show durable per-topic threads accumulating decisions, questions and commitments across sessions. The thread layer does not exist in the schema.
- **Props Signature**:
```typescript
"Not defined — the component does not exist."
```

### Pages & Routes

- **`undefined`** — undefined (❌ Does Not Exist Today): Public landing page.
- **`undefined`** — undefined (❌ Does Not Exist Today): Sign in and sign up.
- **`undefined`** — undefined (❌ Does Not Exist Today): Link-based student join, no account required.
- **`undefined`** — undefined (❌ Does Not Exist Today): Session list with status and last extraction result.
- **`undefined`** — undefined (❌ Does Not Exist Today): Human gate over extracted items.
- **`undefined`** — undefined (❌ Does Not Exist Today): Scrubbable replay with reviewer notes.
- **`undefined`** — undefined (❌ Does Not Exist Today): Audience-scoped session reports.
- **`undefined`** — undefined (❌ Does Not Exist Today): Curation of session evidence.
- **`undefined`** — undefined (❌ Does Not Exist Today): Flow-chart view of a session.
- **`undefined`** — undefined (❌ Does Not Exist Today): Organization-wide actions inbox from accepted commitments.
- **`undefined`** — undefined (❌ Does Not Exist Today): Organization workspace home and setup.
- **`undefined`** — undefined (❌ Does Not Exist Today): Organizations the person belongs to.
- **`undefined`** — undefined (❌ Does Not Exist Today): Organization chat.
- **`undefined`** — undefined (❌ Does Not Exist Today): AI section hub: everything model-related lives here.
- **`undefined`** — undefined (❌ Does Not Exist Today): Pipeline health and job state.
- **`undefined`** — undefined (❌ Does Not Exist Today): Platform administration: users, organizations, safeguarding.
- **`undefined`** — undefined (❌ Does Not Exist Today): Personal profile and preferences.

### System Components & Workers

- **Aura web app** (`web-app`, kind: `ui`): TanStack Start React app: sessions, review, actions, organizations, admin and operations screens.
- **Server functions** (`server-functions`, kind: `server`): Typed RPC between the browser and the database; all app-internal server logic.
- **Daily.co** (`daily`, kind: `external`): Hosts the live room and produces the cloud recording. Posts recording.ready-to-download to the Cloud Run worker.
- **Cloud Run ingest worker** (`ingest-worker`, kind: `worker`): Verifies the Daily HMAC, acknowledges immediately, then copies the recording into Cloud Storage in the background and calls Aura back.
- **Cloud Storage bucket** (`gcs`, kind: `storage`): Durable home for recordings at gs://<bucket>/sessions/<sessionId>.mp4.
- **Ingest completion callback** (`ingest-complete`, kind: `route`): Bearer-authenticated callback from the worker. Writes the gs:// URI onto the session, clears errors, sets status to processing, and starts extraction without awaiting it.
- **Lean extraction engine** (`extraction`, kind: `server`): Splits the recording into overlapping windows, runs concurrent streaming model calls, deduplicates results, and writes items plus a run record.
- **Vertex AI** (`vertex`, kind: `external`): Reads the recording directly from Cloud Storage and returns structured extraction items.
- **Lovable Cloud database** (`database`, kind: `database`): Postgres with row level security; every organization-scoped read is filtered by membership and role.
- **Human review gate** (`human-gate`, kind: `ui`): Every extracted item is accepted or rejected by a person before it reaches the Actions inbox or any profile.
- **MCP server** (`mcp`, kind: `server`): Read-only OAuth-protected surface for external tools: pipeline health, session inspection, and this Atlas. Never returns recordings or transcript text.

## 5. Workflow Specification & Lifecycle Stages

*Note: Vendor-neutral. Aura implements this with Daily.co, a Cloud Run worker, Google Cloud Storage and Vertex AI, but the rules do not depend on those choices.*

### Session Lifecycle Stages

| Step | Stage Key | Label | Entered When | Leaves When | Tone |
|---|---|---|---|---|---|
| 0 | `scheduled` | Scheduled | The session record exists and no one has joined. | Someone joins; status becomes active. | `neutral` |
| 0 | `recording` | Recording | The call is live. Recording starts automatically on join — never a manual toggle. | The call ends; ended_at is written. | `live` |
| 1 | `awaiting_recording` | Waiting for the recording | The call ended and no provider recording id is known yet. | The provider reports a finished recording and its id is stored. | `busy` |
| 2 | `copying` | Copying to cloud storage | A provider recording id exists but the media is not yet in our own object store. | The media URI is written to the session. | `busy` |
| 3 | `reading` | Reading the session | Media is stored and no terminal extraction run exists. | A run reaches status done or partial. | `busy` |
| 4 | `stills` | Almost ready — making stills | The read finished and frames have not been captured. | frames_captured_at is set. | `busy` |
| 4 | `ready` | Ready | Read finished and stills captured. | Terminal. | `done` |
| 0 | `attention` | Needs attention | A copy error is recorded, or the latest run failed. | A human retries and the retry succeeds. | `bad` |

### Published Endpoints & Typed Functions

#### `POST` /api/public/ingest-complete
- **Auth Requirement**: Bearer AURA_INGEST_SECRET
- **Description**: 
- **Request**:
```json
"{ sessionId: uuid; gcsUri?: string (gs://bucket/key); bytes?: int; dailyRecordingId?: string; error?: string }"
```
- **Response**:
```json
"200 { ok: true, gcsUri, status: 'processing_started' } | 4xx { error: string }"
```

#### `POST` /api/public/frames-complete
- **Auth Requirement**: Bearer AURA_INGEST_SECRET
- **Description**: 
- **Request**:
```json
"{ sessionId: uuid; done?: boolean; error?: string; frames: Array<{ timecodeMs: int; kind: 'cited' | 'strip'; jpegBase64: string }> (max 40) }"
```
- **Response**:
```json
"200 { ok: true, stored: int, done: boolean } | 401 { error: 'unauthorized' } | 400 { error }"
```

#### `POST` /api/public/end-session
- **Auth Requirement**: None — beacon endpoint; the body carries only a session id.
- **Description**: 
- **Request**:
```json
"{ sessionId: uuid }"
```
- **Response**:
```json
"200 { ok: true } | 400 | 500"
```

#### `POST` /api/public/cron-staging-watchdog
- **Auth Requirement**: Supabase anon apikey header (not Bearer).
- **Description**: 
- **Request**:
```json
"{} (no body required)"
```
- **Response**:
```json
"200 { ok: true, legs: { ... } }"
```

#### `POST` (Cloud Run worker, NOT this app)
- **Auth Requirement**: Provider HMAC signature verified by the worker.
- **Description**: 
- **Request**:
```json
"Provider-defined event payload including the room name and recording id."
```
- **Response**:
```json
"202 acknowledged immediately; the copy runs in the background."
```

#### `POST` createSession (src/lib/session-create.functions.ts)
- **Auth Requirement**: Signed-in; must be a member of the organization or a platform admin.
- **Description**: 
- **Request**:
```json
"{ organizationId: uuid; title?: string(<=160); guideUserId: uuid; learnerUserId: uuid; observerUserIds: uuid[] (<=20); startNow: boolean; scheduledAt?: ISO datetime | null }"
```
- **Response**:
```json
"{ sessionId: string }"
```

#### `POST` joinSession (src/lib/session-join.functions.ts)
- **Auth Requirement**: Signed-in; the caller must hold a seat.
- **Description**: 
- **Request**:
```json
"{ sessionId: uuid }"
```
- **Response**:
```json
"{ role: 'guide' | 'learner' | 'observer'; roomName: string; sessionId: string }"
```

#### `POST` endSession (src/lib/session-end.functions.ts)
- **Auth Requirement**: Signed-in; the caller must hold a seat.
- **Description**: 
- **Request**:
```json
"{ sessionId: uuid }"
```
- **Response**:
```json
"{ ok: true }"
```

#### `GET` listLeanSessions (src/lib/extraction.functions.ts)
- **Auth Requirement**: Signed-in; RLS scopes the list to the caller.
- **Description**: 
- **Request**:
```json
"(none)"
```
- **Response**:
```json
"Array<{ id, title, status, started_at, ended_at, duration_sec, recording_url_present, provider_recording_id, upload_error, staging_attempts, last_stage_at, frames_captured_at, item_count, lastRun }>"
```

#### `GET` getSessionExtraction (src/lib/extraction.functions.ts)
- **Auth Requirement**: Signed-in; RLS scoped.
- **Description**: 
- **Request**:
```json
"{ sessionId: uuid }"
```
- **Response**:
```json
"{ session: { id, title, status, started_at, ended_at, created_at, hasRecording }, items: ExtractedItem[], runs: Array<{ id, status, started_at, finished_at, item_count, error, model }> }"
```

#### `POST` runSessionExtraction (src/lib/extraction.functions.ts)
- **Auth Requirement**: Signed-in; RLS scoped.
- **Description**: 
- **Request**:
```json
"{ sessionId: uuid }"
```
- **Response**:
```json
"{ runId: string; status: 'done' | 'partial' | 'failed'; itemCount: number; error?: string }"
```

#### `POST` updateExtractionItem (src/lib/extraction.functions.ts)
- **Auth Requirement**: Signed-in; RLS scoped.
- **Description**: 
- **Request**:
```json
"{ itemId: uuid; status?: 'proposed'|'confirmed'|'edited'|'discarded'; body?: string; kind?: 'decision'|'commitment'|'open_question'|'context'; ownerLabel?: string|null; ownerUserId?: uuid|null; dueDate?: string|null; completed?: boolean }"
```
- **Response**:
```json
"{ ok: true }"
```

#### `GET` getSessionVideoSignedUrl (src/lib/session-video.functions.ts)
- **Auth Requirement**: Signed-in.
- **Description**: 
- **Request**:
```json
"{ sessionId: uuid }"
```
- **Response**:
```json
"{ found: true; url: string; expiresAt: string } | { found: false }"
```

#### `GET` listSessionFrames (src/lib/session-frames.functions.ts)
- **Auth Requirement**: Signed-in.
- **Description**: 
- **Request**:
```json
"{ sessionId: uuid }"
```
- **Response**:
```json
"Array<{ timecodeMs: number; kind: 'cited' | 'strip'; url: string }>"
```

#### `POST` regenerateSessionStills (src/lib/session-frames.functions.ts)
- **Auth Requirement**: Signed-in.
- **Description**: 
- **Request**:
```json
"{ sessionId: uuid }"
```
- **Response**:
```json
"{ ok: true; requested: number }"
```

## 6. Design System & Visual Contract

**Status**: `locked`

### Locked Directives:
- The visual layer is owned here. Do not restyle, re-theme, re-skin or substitute components.
- Do not alter, add or remove utility classes on existing markup, and do not change the layout of a shipped screen.
- Inject data through the declared component props in app_atlas only — never by editing the DOM, the markup or the styling.
- Colours are consumed exclusively through semantic tokens. Never write a literal colour utility or a hex value into a component; change a token if a colour must change.
- If a surface you need does not exist, say so and request it. Do not invent one and do not treat a design direction as shipped.

**Token Layer**: Tokens are defined as oklch CSS custom properties in src/styles.css and reached through semantic Tailwind v4 classes (bg-background, bg-card, text-foreground, text-muted-foreground, border-border, and the status-pill tone classes). The class strings are an implementation detail of those tokens — the tokens and the rules above are the contract, not the strings.

### Typography & Color Tokens:
```json
{
  "typography": {
    "loadedVia": "Google Fonts <link> in the root route head — Sora 500/600/700, Hanken Grotesk 400/500/600, JetBrains Mono 400/500.",
    "display": {
      "family": "Sora",
      "weights": [
        500,
        600,
        700
      ],
      "use": "Page titles, card titles, section headings. Tight tracking, never all-caps."
    },
    "body": {
      "family": "Hanken Grotesk",
      "weights": [
        400,
        500,
        600
      ],
      "use": "All running text, form labels, buttons, item bodies."
    },
    "mono": {
      "family": "JetBrains Mono",
      "weights": [
        400,
        500
      ],
      "use": "Timecodes, ids, counts, metadata chips. Small sizes only."
    }
  },
  "palette": {
    "surface": {
      "background": "#f7f9fb",
      "card": "#ffffff",
      "raised": "#e6e8ea",
      "border": "#e2e8f0"
    },
    "ink": {
      "primary": "#191c1e",
      "secondary": "#45474c"
    },
    "brand": {
      "navy": "#080e1a",
      "cyan": "#00f0ff",
      "cyanLightSafe": "#00b4c4",
      "violet": "#9466ff",
      "gold": "#ffc329"
    },
    "note": "Values are stated as hex for portability; the app itself defines them as oklch CSS custom properties in src/styles.css and consumes them only through semantic tokens, never as literal colour utilities."
  },
  "surfaces": {
    "card": "White surface, 8–16px radius, 1px #e2e8f0 border, minimal or no shadow. Depth comes from borders and spacing, not elevation.",
    "spacing": "4px base scale; 16px inside cards, 24px between cards, 32px between page sections.",
    "grid": "Session cards: 1 column under 768px, 2 up to 1280px, 3 above.",
    "motion": "Short and functional: 120–200ms ease-out on hover and expand, no bounce, no parallax. A live recording indicator is the only looping animation."
  }
}
```

## 7. Prompt Library (Vertex AI Extraction & Windowing)

- **Prompt Version**: v3
- **System Framing**:
> You are a meeting scribe. You are reading a recorded conversation between colleagues. Treat every speaker as a peer. Never assume a teacher/student, mentor/mentee, expert/novice, or senior/junior relationship, and never comment on anyone's ability, performance, engagement, or development. Your only job is to record what was communicated.

- **Four-Kind Item Taxonomy**:
  1. **decision**: something the group settled on or agreed to. Include what was decided and, if stated, why.
  2. **commitment**: someone said they would do something. Capture the action and who owns it.
  3. **open_question**: something raised and left unresolved, or explicitly deferred.
  4. **context**: a fact, constraint, number, date, name, or piece of background stated aloud that someone not in the room would need in order to follow up.

- **Windowing Parameters**:
```json
{
  "windowSeconds": 240,
  "overlapSeconds": 10,
  "concurrency": 2,
  "defaultDurationSeconds": 900,
  "thinkingBudget": 2048,
  "rationale": "Windows keep every model call short enough to answer before an edge timeout, and the overlap stops items on a boundary from being lost. Items are deduplicated across the overlap afterwards. The thinking budget is deliberately not trimmed: an A/B on one session showed 512 dropped recall to 4 items where 2048 found 11."
}
```

