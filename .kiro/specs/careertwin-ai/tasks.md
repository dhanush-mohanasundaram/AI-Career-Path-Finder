# Implementation Plan: CareerTwin AI

## Overview

Full-stack implementation of the CareerTwin AI platform following the 36-hour hackathon build order. The backend (Node.js + Express + TypeScript + MongoDB Atlas) is built first, then the AI orchestration layer, followed by the React/Vite frontend. Property-based tests with `fast-check` validate the six correctness properties from the design.

---

## Tasks

- [x] 1. Repo setup, project scaffolding, and infrastructure wiring
  - [x] 1.1 Initialise monorepo structure, install all dependencies, configure TypeScript for both `backend/` and `frontend/`
    - Create `backend/` with `package.json`, `tsconfig.json`, `jest.config.ts`, `src/index.ts`, `src/config/env.ts`
    - Create `frontend/` with Vite + React + TypeScript template, install Tailwind, configure design tokens in `tailwind.config.ts`
    - Install all backend deps: `express`, `mongoose`, `openai`, `zod`, `jsonwebtoken`, `bcryptjs`, `express-rate-limit`, `cors`, `dotenv`
    - Install all backend dev deps: `typescript`, `ts-node`, `jest`, `ts-jest`, `supertest`, `mongodb-memory-server`, `fast-check`
    - Install all frontend deps: `react-router-dom`, `framer-motion`, `recharts`, `zod`, `@tanstack/react-query`
    - Install all frontend dev deps: `vitest`, `fast-check`
    - _Requirements: 11.1_

  - [x] 1.2 Implement `src/config/db.ts` — MongoDB Atlas connection with `mongoose.connect` and 503 error handling
    - Export `connectDB()` that reads `MONGODB_URI` from env and calls `mongoose.connect`
    - On connection error, log the error; top-level error handler will return 503
    - _Requirements: 11.6_

  - [x] 1.3 Implement Express app skeleton in `src/index.ts` with CORS, JSON body parsing, rate-limit middleware, and `/health` route
    - Import and mount `cors` configured from `FRONTEND_ORIGIN` env var (wildcard in development)
    - Mount `express.json({ limit: '1mb' })`
    - Register `GET /health` → `{ ok: true }` (no auth)
    - Wire global error handler `src/middleware/errorHandler.ts`
    - _Requirements: 11.1, 11.2, 11.3_

- [x] 2. Backend authentication module
  - [x] 2.1 Implement `src/models/User.ts` Mongoose schema with bcrypt pre-save hook
    - Fields: `name`, `email` (unique, lowercase), `passwordHash`, `createdAt`, `updatedAt`
    - Pre-save hook: `bcrypt.hash(password, 12)` before first save; never store plain text
    - Export `UserModel` with TypeScript interface `IUser`
    - _Requirements: 1.1, 1.8_

  - [x] 2.2 Implement `src/middleware/auth.ts` — JWT `authenticate` middleware
    - Extract Bearer token from `Authorization` header
    - Call `jwt.verify(token, JWT_SECRET)` with HS256; attach decoded payload to `req.user`
    - Return 401 with `{ error: 'Token expired' }` on `TokenExpiredError`
    - Return 401 on missing, malformed, or tampered tokens
    - _Requirements: 1.10, 1.11, 1.12_

  - [x] 2.3 Implement `src/controllers/auth.controller.ts` and `src/routes/auth.routes.ts`
    - `POST /api/auth/register`: validate name/email/password (min 8 chars, RFC 5322 email), hash password, insert User, return 201 + JWT
    - `POST /api/auth/login`: lookup user by email, `bcrypt.compare`, return 200 + JWT on success; 401 on wrong email or password; 409 on duplicate email at register
    - Sign JWT with `HS256`, `expiresIn: '7d'`, `JWT_SECRET`
    - Apply `express-rate-limit` (10 req / 15 min per IP) to auth routes
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.9, 1.13_

  - [ ]* 2.4 Write property test — password validation always rejects short passwords (Property 12)
    - **Property 12: Password Validation Rejects Invalid Passwords**
    - **Validates: Requirements 1.3**
    - Use `fast-check`: generate arbitrary strings of length 0–7; assert `POST /api/auth/register` returns HTTP 400 for every such password

  - [ ]* 2.5 Write property test — auth round-trip succeeds for valid credentials (Property 9)
    - **Property 9: Authentication Round-Trip**
    - **Validates: Requirements 1.1, 1.5**
    - Use `fast-check`: generate valid (name, email, password ≥ 8 chars) triples; assert register → login round-trip returns HTTP 200 + JWT

  - [ ]* 2.6 Write unit tests for auth middleware (`verifyToken` throws on expired and tampered tokens)
    - Test cases: valid token → decodes payload; expired token → throws `TokenExpiredError`; tampered token → throws; missing header → 401
    - _Requirements: 1.10, 1.11, 1.12_

- [x] 3. Profile module
  - [x] 3.1 Implement `src/models/Profile.ts` Mongoose schema
    - Fields from design: `userId` (ref User, unique index), `resumeText` (max 20 000 chars), `githubUsername`, `currentSkills`, `targetRole`, `dreamCompany`, `experienceLevel` enum, timestamps
    - _Requirements: 2.7_

  - [x] 3.2 Implement `src/controllers/profile.controller.ts` and `src/routes/profile.routes.ts`
    - `POST /api/profile`: Zod-validate payload (resumeText ≤ 20 000, githubUsername regex, experienceLevel enum); upsert via `findOneAndUpdate({ userId }, dto, { upsert: true, new: true })`; return 200 + persisted doc
    - `GET /api/profile/me`: find by `userId`; return 200 or 404
    - Mount both routes behind `authenticate` middleware
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 3.3 Write property test — input validation rejects invalid profiles (Property 11)
    - **Property 11: Input Validation Rejects Invalid Profiles**
    - **Validates: Requirements 2.2, 2.3, 2.4**
    - Use `fast-check`: generate resumeText strings of length 20 001+; assert HTTP 400
    - Use `fast-check`: generate arbitrary strings not matching GitHub handle regex; assert HTTP 400
    - Use `fast-check`: generate arbitrary strings not in experienceLevel enum; assert HTTP 400

  - [ ]* 3.4 Write property test — profile upsert round-trip consistency (Property 10)
    - **Property 10: Profile Upsert Round-Trip**
    - **Validates: Requirements 2.1, 2.5**
    - Use `fast-check`: generate valid profile payloads; POST then GET and assert all fields match

- [x] 4. GitHub data fetching service
  - [x] 4.1 Implement `src/services/github.service.ts`
    - Validate username against `^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$` before calling GitHub API
    - Fetch up to 100 most-recently-pushed repos via GitHub REST API v3; include `GITHUB_TOKEN` header when env var is present
    - Throw `GitHubFetchError` with status code on 404 and 403 responses
    - Implement in-memory TTL cache (10-minute expiry) keyed by username
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ]* 4.2 Write unit tests for `fetchGitHubData`
    - Mock `fetch`: 200 → returns repos; 404 → throws `GitHubFetchError(404)`; 403 → throws `GitHubFetchError(403)`
    - Assert TTL cache returns cached data on second call within 10 min
    - _Requirements: 10.2, 10.3, 10.6_

- [x] 5. LLM client and robustParse
  - [x] 5.1 Implement `src/services/nim.service.ts` — NVIDIA NIM OpenAI-compatible streaming client
    - Instantiate `OpenAI` with `NVIDIA_NIM_BASE_URL` and `NVIDIA_NIM_API_KEY` from env
    - Export `chatStream(messages, schema)`: create streaming chat completion, accumulate `rawText`, then call `robustParse(rawText, schema, repairFn)`
    - Implement `robustParse<T>(rawText, schema, repairFn)` — three-layer waterfall:
      - Layer 1: extract JSON from ` ```json ``` ` fence or first `{` … last `}` substring
      - Layer 2: `schema.safeParse(JSON.parse(candidate))` — return on success
      - Layer 3: call `repairFn(rawText, zodErrors)` exactly once; `safeParse` repaired output — return on success or throw `ParseError`
    - `ParseError` must include `original`, `repaired`, and `zodErrors` fields
    - Never call `repairFn` more than once per `robustParse` invocation
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ]* 5.2 Write property test — robustParse terminates with at most 1 repair call (Property 8)
    - **Property 8: Repair Termination**
    - **Validates: Requirements 4.7, 4.3, 4.4**
    - Use `fast-check`: generate arbitrary string inputs for `rawText`; instrument `repairFn` with a call counter; assert counter ≤ 1 after every `robustParse` call and function always terminates (returns or throws)

  - [ ]* 5.3 Write unit tests for `robustParse`
    - Clean JSON in fence → returns data, repairFn never called
    - Valid JSON without fence → returns data
    - Malformed JSON → repairFn called once; repaired valid JSON → returns data
    - Malformed JSON → repairFn called once; repaired still invalid → throws `ParseError`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 6. Checkpoint — backend foundation complete
  - Ensure `GET /health`, auth, profile, GitHub service, and NIM client all pass their tests. Ask the user if questions arise before proceeding to the AI agent layer.

- [ ] 7. AI agent definitions with Zod schemas
  - [~] 7.1 Implement `src/agents/baseAgent.ts` — generic `runAgent<T>` function
    - Accept `agentId`, `messages: ChatMessage[]`, and `schema: z.ZodSchema<T>`
    - Call `nim.service.chatStream(messages, schema)` and return schema-validated result
    - Export `AgentId` union type: `'resume' | 'github' | 'career' | 'skillgap' | 'roadmap' | 'futuretwin'`
    - _Requirements: 3.7, 4.8_

  - [~] 7.2 Implement all six agent files with Zod schemas and prompt builders
    - `src/agents/resumeAnalyzer.agent.ts`: `ResumeResultSchema` (atsScore, missingKeywords, improvements, overallAssessment) + `buildResumePrompt(profile)`
    - `src/agents/githubIntel.agent.ts`: `GitHubResultSchema` (healthScore, projectQualityScore, repoInsights, standoutRepo, languageDistribution, totalRepos, totalStars) + `buildGitHubPrompt(profile, githubRaw)`
    - `src/agents/careerAdvisor.agent.ts`: `CareerResultSchema` (readinessScore, recommendedPath, strengths, summary) + `buildCareerPrompt(ctx)`
    - `src/agents/skillGap.agent.ts`: `SkillGapResultSchema` (coverageScore, matchedSkills, missingSkills with priority enum) + `buildSkillGapPrompt(ctx)`
    - `src/agents/roadmap.agent.ts`: `RoadmapResultSchema` (plan30, plan90 as WeeklyPlan[], projectRecommendations, interviewPrep) + `buildRoadmapPrompt(ctx)`
    - `src/agents/futureTwin.agent.ts`: `FutureTwinResultSchema` (readinessTimeline, projectedRole, projections array with months/role/readiness/keyMilestone, narrativeSummary) + `buildFutureTwinPrompt(ctx)`
    - Each prompt builder embeds profile + accumulated context; system message instructs LLM to return strictly valid JSON matching the schema
    - _Requirements: 3.1, 3.2, 3.7_

  - [ ]* 7.3 Write unit tests for all six prompt builders
    - Assert each builder returns `ChatMessage[]` with `system` + `user` roles
    - Assert `buildResumePrompt` embeds `resumeText` and `targetRole` verbatim
    - Assert `buildGitHubPrompt` includes serialized repo metadata but no extra PII
    - _Requirements: 3.7_

- [ ] 8. `composeTwinScore` utility
  - [~] 8.1 Implement `src/lib/composeTwinScore.ts`
    - Weights: career 0.35, resume 0.20, github 0.20, skillGap 0.15, roadmap 0.05, futureTwin 0.05
    - Accumulate `weightedSum` and `totalWeight` only for present agent slots
    - Extract per-agent score using the correct field per design (`readinessScore`, `atsScore`, `healthScore`, `coverageScore`, roadmap completion %, `projections[0].readiness ?? 0`)
    - Return `Math.round(weightedSum / totalWeight)`, clamp to `[0, 100]`; return 0 if `totalWeight === 0`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 8.2 Write property test — composeTwinScore always returns ∈ [0, 100] (Property 1)
    - **Property 1: Score Boundedness**
    - **Validates: Requirements 6.5, 6.2, 6.3, 6.4**
    - Use `fast-check`: generate arbitrary partial agent maps (all 2^6 = 64 subsets), with agent scores sampled from valid ranges; assert `composeTwinScore(agents)` returns an integer in `[0, 100]` for every generated input

  - [ ]* 8.3 Write unit tests for `composeTwinScore`
    - No agents present → 0
    - All 6 agents present with scores → weighted average rounded
    - Partial agents (3 of 6) → normalizes by sum of present weights only
    - `futureTwin.projections` empty → uses 0 for futureTwin contribution
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ] 9. Analysis orchestrator, SSE emitter, and data models
  - [~] 9.1 Implement `src/models/Analysis.ts` and `src/models/Roadmap.ts` Mongoose schemas
    - `Analysis`: fields from design spec including `userId`, `version` (auto-incremented per user), `status` enum, `startedAt`, `completedAt`, `agents` subdocument, `errorMessage`; compound index `{ userId: 1, version: -1 }`
    - `Roadmap`: fields from design spec including `userId` (unique index), `analysisId`, `plan30` and `plan90` with `completed` boolean per task, `progressPercent`, `updatedAt`
    - _Requirements: 9.1, 9.6, 8.8_

  - [~] 9.2 Implement `src/lib/sse.ts` — `createSSEEmitter(res)` factory
    - Set `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`, `X-Accel-Buffering: no` headers
    - Implement `emit(event, data)`: write `event:` + `data:` lines, call `res.flush()`
    - Implement `close()`: write `event: close\ndata: {}\n\n` then `res.end()`
    - _Requirements: 5.1, 5.9_

  - [~] 9.3 Implement `src/agents/orchestrator.ts` — two-phase agent pipeline
    - Phase 1: `await fetchGitHubData(profile.githubUsername)` then `Promise.all([runAgent('resume', ...), runAgent('github', ...)])`
    - Emit `agent_complete` SSE events for `resume` and `github` after Phase 1
    - Phase 2 sequential chain: career → skillgap → roadmap → futuretwin, each awaited individually with accumulated context; emit `agent_complete` after each
    - After all six agents: set `status: 'complete'`, set `completedAt`, persist snapshot, call `upsertRoadmapDoc`
    - Emit `analysis_complete` SSE event; call `sseEmitter.close()`
    - On fatal error: set `status: 'failed'`, persist, emit `analysis_error`, close SSE
    - GitHub fetch 404/403: emit `agent_error` for github, continue with empty GitHub context
    - Per-agent parse failure: mark agent slot null/failed, emit `agent_error`, continue
    - Increment `version` by fetching `max(version)` for user and adding 1
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.8, 3.9, 3.10, 3.11, 5.2, 5.3, 5.4, 5.5, 5.7, 5.8, 9.1, 9.2_

  - [ ]* 9.4 Write property test — Phase 2 agents never run before Phase 1 results are available (Property 3)
    - **Property 3: Phase Ordering**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
    - Use `fast-check`: generate arbitrary valid profile inputs with mocked agent executors that record invocation order and timestamps; assert `careerResult`, `skillGapResult`, `roadmapResult`, and `futureTwinResult` are never produced before both `resumeResult` and `githubResult` are present in context

  - [ ]* 9.5 Write property test — all 6 agent_complete SSE events emitted before analysis_complete (Property 4)
    - **Property 4: SSE Event Completeness**
    - **Validates: Requirements 5.4, 5.5**
    - Use `fast-check`: generate arbitrary valid profiles with mocked LLM client; capture SSE event sequence; assert all six `agent_complete` events appear before `analysis_complete` in every run

  - [ ]* 9.6 Write property test — completed snapshots are never mutated (Property 5)
    - **Property 5: Snapshot Immutability**
    - **Validates: Requirements 9.1, 9.2, 9.7**
    - Use `fast-check`: generate sequences of N analyses (N ∈ [1, 5]) for the same user; after each run assert existing `status: 'complete'` snapshots are not modified and new snapshot `version` equals previous max + 1

  - [ ]* 9.7 Write unit tests for orchestrator internals
    - Mock all agents and assert correct context accumulation across phases
    - Mock SSE emitter and assert event sequence and payload shapes
    - Assert `upsertRoadmapDoc` called with `completed: false` on all tasks (validates Property 14 / Req 8.1)
    - _Requirements: 3.1, 3.2, 3.3, 3.9, 3.10, 3.11, 8.1_

- [ ] 10. Roadmap and analysis REST routes
  - [~] 10.1 Implement `src/controllers/roadmap.controller.ts` and `src/routes/roadmap.routes.ts`
    - `GET /api/roadmap/latest`: find by `userId`, return 200 or 404
    - `PATCH /api/roadmap/progress`: Zod-validate `{ taskId, completed: boolean }`; call `updateProgress`; recompute `progressPercent = totalTasks > 0 ? Math.round(completedCount / totalCount * 100) : 0`; return updated doc; 404 on missing taskId; unique RoadmapDoc per user
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_

  - [ ]* 10.2 Write property test — progressPercent always ∈ [0, 100] and equals round(completed/total × 100) (Property 6)
    - **Property 6: Progress Consistency**
    - **Validates: Requirements 8.2, 8.3, 8.4, 8.5**
    - Use `fast-check`: generate arbitrary RoadmapDoc state (N tasks, arbitrary subset completed); call `updateProgress` with random taskId + completed boolean; assert `progressPercent === Math.round(completedCount / totalCount * 100)` and value is integer in `[0, 100]`

  - [ ]* 10.3 Write unit tests for `updateProgress`
    - Toggle task to true → recomputed percent increases
    - Toggle task to false → recomputed percent decreases
    - totalTasks = 0 → progressPercent = 0
    - Unknown taskId → throws NotFoundError
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.6_

  - [~] 10.4 Implement `src/controllers/analysis.controller.ts` and `src/routes/analysis.routes.ts`
    - `GET /api/analysis/stream`: set SSE headers, create `sseEmitter`, load profile, invoke `orchestrator.runAnalysis(profile, sseEmitter)`; listen on `req.on('close')` to stop emitting
    - `GET /api/analysis/latest`: find snapshot with max version for user; return 200 or 404
    - `GET /api/analysis/history`: return all snapshots for user sorted by `version` desc
    - Apply analysis rate-limit (5 req / hour per user)
    - _Requirements: 5.1, 5.6, 5.10, 9.3, 9.4, 9.5, 9.7_

- [~] 11. Checkpoint — backend complete
  - Ensure all backend unit tests, property tests, and route smoke tests pass. Run `jest --runInBand` against the full test suite. Ask the user if questions arise before moving to frontend.

- [ ] 12. Frontend foundation: types, store, API/SSE clients, AppShell
  - [~] 12.1 Create `frontend/src/types/index.ts` — shared TypeScript interfaces mirroring backend data models
    - Export: `User`, `Profile`, `AnalysisSnapshot`, `ResumeResult`, `GitHubResult`, `CareerResult`, `SkillGapResult`, `RoadmapResult`, `FutureTwinResult`, `RoadmapDoc`, `AgentId`, `AgentStatus`
    - _Requirements: 7.1_

  - [~] 12.2 Implement `frontend/src/lib/api.ts` — typed REST client functions
    - `register`, `login`, `upsertProfile`, `getProfile`, `getLatestAnalysis`, `getAnalysisHistory`, `getLatestRoadmap`, `patchRoadmapProgress`
    - Each function reads `VITE_API_URL` base URL, attaches Bearer token from localStorage
    - _Requirements: 7.1_

  - [~] 12.3 Implement `frontend/src/lib/sse.ts` — `useAnalysisStream` hook
    - Open `EventSource` to `/api/analysis/stream`
    - On `agent_complete`: update `AgentStatusMap` state
    - On `analysis_complete`: fetch full snapshot and store in state
    - On `analysis_error`: set error state and close EventSource
    - On component unmount: close EventSource
    - _Requirements: 5.1, 5.2, 5.3, 7.6, 7.7_

  - [~] 12.4 Implement `frontend/src/store/useTwinStore.ts` — Zustand global store
    - State: `user`, `profile`, `latestAnalysis`, `roadmap`, `agentStatuses`, `isAnalysisRunning`
    - Actions: `setUser`, `setProfile`, `setAnalysis`, `setRoadmap`, `updateAgentStatus`
    - _Requirements: 7.1_

  - [~] 12.5 Implement `frontend/src/components/layout/AppShell.tsx`, `Sidebar.tsx`, `Topbar.tsx`
    - `AppShell`: renders `<Sidebar>` + `<Topbar>` + `<Outlet>` with Tailwind layout grid
    - `Sidebar`: nav links to Dashboard, ResumeAnalyzer, GitHubAnalyzer, SkillGap, Roadmap, CareerTwin pages
    - `Topbar`: displays user name and logout button
    - _Requirements: 7.1_

- [ ] 13. Shared UI components
  - [~] 13.1 Implement `GlassCard`, `StatPill`, `Skeleton`, `Button` in `frontend/src/components/ui/`
    - `GlassCard`: Tailwind `backdrop-blur` + `bg-white/10` glass morphism container
    - `StatPill`: small badge with label + value
    - `Skeleton`: animated loading placeholder using Tailwind `animate-pulse`
    - `Button`: accessible, keyboard-navigable with aria labels and focus rings
    - _Requirements: 7.1_

  - [~] 13.2 Implement `ScoreRing` in `frontend/src/components/ui/ScoreRing.tsx`
    - SVG circular progress indicator scaled to `score ∈ [0, 100]`
    - Accept `score`, `label`, `color`, `size` props per design interface
    - _Requirements: 7.5_

  - [~] 13.3 Implement `AgentChip` and `AgentPipeline` in `frontend/src/components/agents/`
    - `AgentChip`: displays agent name + status badge (pending/running/complete/error) with colour-coded Tailwind classes
    - `AgentPipeline`: renders a row of 6 `AgentChip` components driven by `agents` prop
    - _Requirements: 7.6_

- [ ] 14. TwinOrb and ProjectionTimeline visual components
  - [~] 14.1 Implement `TwinOrb` in `frontend/src/components/twin/TwinOrb.tsx`
    - Two concentric SVG arcs: current score (cyan) and projected score (indigo overlay ring)
    - Framer Motion spring animation on `score` prop change (`animate={{ strokeDashoffset }}`)
    - Pulse glow ring via Tailwind `ring` utilities when `animateOnMount` is true / analysis running
    - Implements `TwinOrbProps` interface exactly per design
    - _Requirements: 7.2, 7.3, 7.4_

  - [~] 14.2 Implement `ProjectionTimeline` in `frontend/src/components/twin/ProjectionTimeline.tsx`
    - Horizontal timeline with three nodes at 3-month, 6-month, 12-month intervals
    - Each node shows projected `role`, `readiness` score, and `keyMilestone`
    - Framer Motion `whileInView` entrance animation for each node
    - _Requirements: 7.9_

- [ ] 15. Chart components
  - [~] 15.1 Implement `SkillRadar` in `frontend/src/components/charts/SkillRadar.tsx`
    - Use `recharts` `RadarChart` to overlay current vs target skill coverage
    - Accept `current`, `target` (Record<string, number>), and `labels` props per design interface
    - _Requirements: 7.8_

  - [~] 15.2 Implement `LanguageBar` in `frontend/src/components/charts/LanguageBar.tsx`
    - Horizontal stacked bar chart from `recharts` showing `languageDistribution` percentages
    - _Requirements: 7.1_

- [ ] 16. Landing and Onboarding pages
  - [~] 16.1 Implement `frontend/src/pages/Landing.tsx`
    - Hero section with TwinOrb animation, CTA buttons linking to `/register` and `/login`
    - Lazy-loaded via `React.lazy` + `Suspense`
    - _Requirements: 7.10_

  - [~] 16.2 Implement `frontend/src/pages/Onboarding.tsx` — profile setup form
    - Multi-step form: resume text area, GitHub username input, target role + dream company, experience level selector
    - Client-side Zod validation before `POST /api/profile`
    - On success: redirect to Dashboard
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.10_

- [ ] 17. Dashboard and agent feature pages
  - [~] 17.1 Implement `frontend/src/pages/Dashboard.tsx` — BentoGrid dashboard
    - `BentoGrid` component in `src/components/layout/BentoGrid.tsx` (CSS Grid wrapper, 1/2/3 responsive columns)
    - Render `ScoreRing` for all six agent scores and `TwinOrb` with `composeTwinScore` result
    - Display `AgentPipeline` during live SSE analysis; replace with static results on completion
    - Use `Skeleton` components while data loads
    - _Requirements: 7.1, 7.2, 7.6, 7.7_

  - [~] 17.2 Implement `frontend/src/pages/ResumeAnalyzer.tsx`
    - Display `ResumeResult`: ATS score ring, missing keywords list, improvements list, overall assessment
    - Lazy-loaded route
    - _Requirements: 7.1, 7.10_

  - [~] 17.3 Implement `frontend/src/pages/GitHubAnalyzer.tsx`
    - Display `GitHubResult`: health score ring, `LanguageBar` chart, repo insights, standout repo card
    - Lazy-loaded route
    - _Requirements: 7.1, 7.10_

  - [~] 17.4 Implement `frontend/src/pages/SkillGap.tsx`
    - Display `SkillGapResult`: `SkillRadar` chart with current vs target coverage, matched/missing skills list with priority badges
    - Lazy-loaded route
    - _Requirements: 7.8, 7.10_

  - [~] 17.5 Implement `frontend/src/pages/Roadmap.tsx` — interactive roadmap checklist
    - Render `plan30` and `plan90` tasks as checkboxes
    - On checkbox toggle: call `PATCH /api/roadmap/progress`; update `progressPercent` locally
    - Display overall `progressPercent` as a `ScoreRing`
    - Lazy-loaded route
    - _Requirements: 8.1, 8.2, 8.7, 7.10_

  - [~] 17.6 Implement `frontend/src/pages/CareerTwin.tsx`
    - Display `TwinOrb` with current + projected score
    - Render `ProjectionTimeline` with 3/6/12-month projections
    - Display `narrativeSummary` in a `GlassCard`
    - Lazy-loaded route
    - _Requirements: 7.2, 7.9, 7.10_

- [ ] 18. App entry point, routing, and React Query wiring
  - [~] 18.1 Implement `frontend/src/App.tsx` and `frontend/src/main.tsx`
    - Configure `react-router-dom` routes: `/` (Landing), `/register`, `/login`, `/onboarding`, `/app/*` (AppShell) with nested routes for Dashboard, ResumeAnalyzer, GitHubAnalyzer, SkillGap, Roadmap, CareerTwin
    - Wrap app in `QueryClientProvider` from `@tanstack/react-query`
    - All `/app/*` routes protected by auth guard (redirect to `/login` if no token)
    - All page routes lazy-loaded via `React.lazy`
    - _Requirements: 7.10_

  - [~] 18.2 Implement `frontend/src/index.css` — Tailwind base styles and CSS custom properties for design tokens
    - Import Tailwind layers; define CSS variables for primary colour palette used by TwinOrb and ScoreRing
    - _Requirements: 7.1_

- [~] 19. Checkpoint — full-stack integration
  - Verify frontend connects to backend: register → login → onboarding → trigger analysis → SSE streams to dashboard → roadmap PATCH works. Ask the user if questions arise.

- [ ] 20. Integration and end-to-end tests (Supertest + Vitest)
  - [ ]* 20.1 Write Supertest integration test — auth round-trip
    - `POST /api/auth/register` then `POST /api/auth/login` with same credentials → HTTP 200 + JWT
    - _Requirements: 1.1, 1.5_

  - [ ]* 20.2 Write Supertest integration test — profile upsert and retrieval
    - `POST /api/profile` then `GET /api/profile/me` → fields match posted data
    - _Requirements: 2.1, 2.5_

  - [ ]* 20.3 Write Supertest integration test — full SSE analysis stream
    - Mock NVIDIA NIM client to return deterministic agent results
    - Connect to `GET /api/analysis/stream`, collect all SSE events
    - Assert: 6 `agent_complete` events → `analysis_complete` event (in that order); no events after close
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 20.4 Write Supertest integration test — roadmap PATCH updates progressPercent
    - Seed a RoadmapDoc; `PATCH /api/roadmap/progress`; assert `progressPercent` recomputed correctly
    - _Requirements: 8.2, 8.3_

  - [ ]* 20.5 Write Vitest frontend unit tests for `useAnalysisStream` hook
    - Mock EventSource; assert agent status transitions and `analysis_complete` snapshot fetch
    - _Requirements: 5.1, 7.6, 7.7_

  - [ ]* 20.6 Write Vitest frontend unit tests for `TwinOrb` component
    - Assert SVG arcs render; assert Framer Motion `animate` prop updated on score change
    - _Requirements: 7.2, 7.3_

- [~] 21. Final checkpoint — all tests pass
  - Run `jest --runInBand` (backend) and `vitest --run` (frontend). Ensure all unit, property, and integration tests pass. Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP build.
- All property tests use `fast-check` (v3); backend tests use Jest + `ts-jest`; frontend tests use Vitest.
- `mongodb-memory-server` is used for all backend integration tests — no live Atlas connection required in CI.
- The NVIDIA NIM client must be mocked in unit and integration tests to avoid real API calls.
- Property tests for Properties 3, 4, and 5 (orchestrator behaviour) require careful mock design — the `runAgent` function should be injectable/mockable.
- Lazy loading every page route (step 18.1) is the primary mechanism for keeping the initial bundle under 200 KB (Requirement 7.10).
- The `composeTwinScore` function lives in `src/lib/` on the backend and can be imported by the frontend via a shared types package or duplicated — keep it pure (no I/O) so it is trivially testable.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "2.2", "3.1", "4.1"] },
    { "id": 3, "tasks": ["2.3", "3.2", "4.2", "5.1"] },
    { "id": 4, "tasks": ["2.4", "2.5", "2.6", "3.3", "3.4", "5.2", "5.3"] },
    { "id": 5, "tasks": ["7.1", "9.1", "9.2", "8.1"] },
    { "id": 6, "tasks": ["7.2", "9.3"] },
    { "id": 7, "tasks": ["7.3", "8.2", "8.3", "9.4", "9.5", "9.6", "9.7", "10.1"] },
    { "id": 8, "tasks": ["10.2", "10.3", "10.4"] },
    { "id": 9, "tasks": ["12.1"] },
    { "id": 10, "tasks": ["12.2", "12.3", "12.4"] },
    { "id": 11, "tasks": ["12.5", "13.1"] },
    { "id": 12, "tasks": ["13.2", "13.3", "14.1", "14.2", "15.1", "15.2"] },
    { "id": 13, "tasks": ["16.1", "16.2", "17.1"] },
    { "id": 14, "tasks": ["17.2", "17.3", "17.4", "17.5", "17.6"] },
    { "id": 15, "tasks": ["18.1", "18.2"] },
    { "id": 16, "tasks": ["20.1", "20.2", "20.3", "20.4", "20.5", "20.6"] }
  ]
}
```
