# Requirements Document

## Introduction

CareerTwin AI is an AI-powered digital career twin platform for software engineering students. Given a student's resume text, GitHub username, and career goals, the system fans out to six specialized LLM agents (powered by NVIDIA NIM / GLM-5.1) that analyze the student's current profile and project their future trajectory. Results stream in real-time over SSE and are rendered as an interactive bento-grid dashboard. The platform encompasses JWT authentication, user profile management, two-phase AI orchestration, SSE streaming, roadmap progress tracking, analysis history, and a composite Twin Orb readiness score.

---

## Glossary

- **System**: The CareerTwin AI backend API and frontend SPA collectively.
- **API**: The Express/TypeScript backend server.
- **Frontend**: The React/Vite/TypeScript single-page application.
- **Orchestrator**: The AnalysisOrchestrator module that coordinates the two-phase agent pipeline.
- **Agent**: One of the six specialized LLM-backed analyzers (Resume, GitHub, Career, SkillGap, Roadmap, FutureTwin).
- **Phase 1 Agents**: Resume Analyzer and GitHub Intelligence, which run in parallel.
- **Phase 2 Agents**: Career Advisor, Skill Gap, Roadmap, and Future Career Twin, which run sequentially using accumulated context.
- **AnalysisSnapshot**: An immutable, versioned MongoDB document capturing the full output of one complete analysis run.
- **RoadmapDoc**: A mutable MongoDB document that tracks a user's roadmap milestone completion.
- **TwinOrb**: The animated SVG gauge that displays the composite career readiness score.
- **SSEEmitter**: The server-side object that writes `text/event-stream` events to the HTTP response.
- **JWT**: JSON Web Token used for stateless authentication.
- **NIM**: NVIDIA NIM API, the LLM provider used by all six agents.
- **robustParse**: The three-layer JSON extraction and validation function applied to every LLM response.
- **composeTwinScore**: The function that computes the weighted composite readiness score from agent results.
- **progressPercent**: The computed field on RoadmapDoc representing the percentage of completed roadmap tasks.
- **BentoGrid**: The CSS Grid dashboard layout component.
- **ScoreRing**: A circular progress indicator UI component for displaying an individual agent score.

---

## Requirements

### Requirement 1: Authentication

**User Story:** As a software engineering student, I want to register and log in securely, so that my career profile and analysis history are protected and accessible only to me.

#### Acceptance Criteria

1. WHEN a user submits a registration request with a valid name, email, and password, THE API SHALL create a new user account and return a signed JWT and the user object with HTTP 201.
2. WHEN a user submits a registration request with an email that is already registered, THE API SHALL reject the request and return HTTP 409 with a descriptive error message.
3. WHEN a user submits a registration request with a password shorter than 8 characters, THE API SHALL reject the request and return HTTP 400 with a validation error.
4. WHEN a user submits a registration request with an email that does not conform to RFC 5322 format, THE API SHALL reject the request and return HTTP 400 with a validation error.
5. WHEN a user submits a login request with valid credentials, THE API SHALL return a signed JWT and the user object with HTTP 200.
6. WHEN a user submits a login request with an unregistered email, THE API SHALL return HTTP 401 with an error message.
7. WHEN a user submits a login request with an incorrect password, THE API SHALL return HTTP 401 with an error message.
8. THE API SHALL store all user passwords as bcrypt hashes with a cost factor of 12; plain-text passwords SHALL never be persisted or logged.
9. THE API SHALL sign all JWTs with HS256 using the `JWT_SECRET` environment variable and set an expiry of 7 days.
10. WHEN a request is made to any route under `/api/profile`, `/api/analysis`, or `/api/roadmap` without a JWT in the Authorization header, THE API SHALL return HTTP 401 Unauthorized before any route handler executes. *(Validates: Property 7)*
11. WHEN a request is made to any protected route with an expired JWT, THE API SHALL return HTTP 401 with the message "Token expired". *(Validates: Property 7)*
12. WHEN a request is made to any protected route with a tampered or malformed JWT, THE API SHALL return HTTP 401 Unauthorized. *(Validates: Property 7)*
13. WHEN the auth rate-limit has not been exceeded, THE API SHALL respond normally to authentication requests; WHERE the auth rate-limit feature is active and a client exceeds 10 authentication requests from the same IP within any 15-minute window, THE API SHALL reject further requests with HTTP 429.

---

### Requirement 2: Profile Management

**User Story:** As a student, I want to save and update my resume, GitHub username, and career goals, so that the AI agents have accurate, up-to-date context for each analysis run.

#### Acceptance Criteria

1. WHEN a registered user submits a profile upsert request with valid fields, THE API SHALL create or update the user's profile document and return the persisted profile with HTTP 200.
2. WHEN a user submits a profile with a `resumeText` field exceeding 20,000 characters, THE API SHALL reject the request and return HTTP 400 with a validation error.
3. WHEN a user submits a profile with a `githubUsername` that does not match the GitHub handle format (`^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$`), THE API SHALL reject the request and return HTTP 400 with a validation error.
4. WHEN a user submits a profile with an `experienceLevel` value not in `['student', 'junior', 'mid', 'senior']`, THE API SHALL reject the request and return HTTP 400 with a validation error.
5. WHEN an authenticated user requests their profile via `GET /api/profile/me`, THE API SHALL return the stored profile document for that user with HTTP 200.
6. WHEN an authenticated user who has no profile yet requests `GET /api/profile/me`, THE API SHALL return HTTP 404 with a descriptive error message.
7. THE API SHALL enforce a unique index on `Profile.userId` so that each user has at most one profile document.

---

### Requirement 3: AI Agent Orchestration

**User Story:** As a student, I want the six AI agents to analyze my profile thoroughly and cohesively, so that each agent's output builds on the previous agents' findings to produce an accurate career analysis.

#### Acceptance Criteria

1. WHEN an authenticated user triggers an analysis, THE Orchestrator SHALL execute the Resume Analyzer and GitHub Intelligence agents concurrently in Phase 1 before starting any Phase 2 agent. *(Validates: Property 3)*
2. WHEN Phase 1 completes, THE Orchestrator SHALL execute the Career Advisor, Skill Gap, Roadmap, and Future Career Twin agents strictly in that sequential order in Phase 2, passing accumulated context from all preceding agents to each subsequent prompt. *(Validates: Property 3)*
3. THE Orchestrator SHALL not start the Career Advisor until both `resumeResult` and `githubResult` are available in the accumulated context. *(Validates: Property 3)*
4. THE Orchestrator SHALL not start the Skill Gap agent until `careerResult` is available in the accumulated context. *(Validates: Property 3)*
5. THE Orchestrator SHALL not start the Roadmap agent until `skillGapResult` is available in the accumulated context. *(Validates: Property 3)*
6. THE Orchestrator SHALL not start the Future Career Twin agent until `roadmapResult` is available in the accumulated context. *(Validates: Property 3)*
7. WHEN any agent call returns a result, THE Orchestrator SHALL validate the result against the agent's Zod schema before adding it to the accumulated context. *(Validates: Property 2)*
8. WHEN the LLM response for an agent fails all three robustness layers of `robustParse`, THE Orchestrator SHALL mark that agent slot as failed in the AnalysisSnapshot, emit an `agent_error` SSE event, and continue execution with remaining agents where possible.
9. WHEN a Phase 1 GitHub fetch fails with a 404 or 403 from the GitHub API, THE Orchestrator SHALL emit an `agent_error` SSE event for the GitHub agent and continue Phase 1 and Phase 2 with an empty GitHub context.
10. WHEN all six agents have fully stopped running and their results are all available, THE Orchestrator SHALL set the AnalysisSnapshot `status` to `'complete'`, record `completedAt`, and persist the snapshot to MongoDB.
11. WHEN a fatal orchestration error occurs, THE Orchestrator SHALL set the AnalysisSnapshot `status` to `'failed'`, record `errorMessage`, persist the snapshot, and emit an `analysis_error` SSE event.

---

### Requirement 4: LLM Output Robustness

**User Story:** As a developer, I want the system to reliably extract structured data from LLM responses even when the model returns imperfectly formatted output, so that agent failures due to parsing issues are minimized.

#### Acceptance Criteria

1. WHEN an LLM response contains a JSON code fence, THE `robustParse` function SHALL extract the JSON from within the fence in Layer 1.
2. WHEN an LLM response contains no code fence but includes a JSON object, THE `robustParse` function SHALL extract the substring from the first `{` to the last `}` as the JSON candidate in Layer 1.
3. WHEN the Layer 1 JSON candidate passes Zod schema validation, THE `robustParse` function SHALL return the validated data without making any LLM repair call. *(Validates: Property 8)*
4. WHEN the Layer 1 JSON candidate fails Zod validation, THE `robustParse` function SHALL make exactly one self-repair LLM call (Layer 3) with the original text and Zod error summary. *(Validates: Property 8)*
5. WHEN the self-repair LLM response passes Zod validation, THE `robustParse` function SHALL return the repaired and validated data.
6. WHEN the self-repair LLM response also fails Zod validation, THE `robustParse` function SHALL throw a `ParseError` containing the original text, repaired text, and Zod errors.
7. THE `robustParse` function SHALL make at most 1 self-repair call per invocation and SHALL always terminate — it SHALL never retry more than once or enter an infinite loop. IF the single self-repair call also fails Zod validation, THE `robustParse` function SHALL throw `ParseError` immediately without further attempts. *(Validates: Property 8)*
8. WHEN `runAgent` is called with a valid prompt and schema, THE Agent SHALL return data that satisfies `schema.parse()` without throwing, across all valid inputs and LLM responses. *(Validates: Property 2)*

---

### Requirement 5: SSE Streaming

**User Story:** As a student, I want to see each agent's status update in real time while my analysis is running, so that I know the system is working and can watch results arrive progressively.

#### Acceptance Criteria

1. WHEN a client connects to `GET /api/analysis/stream`, THE API SHALL respond with `Content-Type: text/event-stream` headers and keep the connection open for the duration of the analysis.
2. WHEN Phase 1 agents complete, THE SSEEmitter SHALL emit an `agent_complete` event for `resume` and an `agent_complete` event for `github`, each containing the agent's result data.
3. WHEN each Phase 2 agent individually completes, THE SSEEmitter SHALL immediately emit an `agent_complete` event for that specific agent containing its result data, without waiting for all remaining Phase 2 agents to finish.
4. WHEN all six agents have completed successfully, THE SSEEmitter SHALL emit an `analysis_complete` event before closing the SSE connection. *(Validates: Property 4)*
5. THE SSEEmitter SHALL emit all six `agent_complete` events before emitting the `analysis_complete` event. *(Validates: Property 4)*
6. WHEN the client disconnects during streaming, THE API SHALL detect the connection close via `req.on('close')` and stop emitting SSE events, while THE Orchestrator SHALL continue computing and persisting the AnalysisSnapshot.
7. WHEN an agent error occurs during streaming, THE SSEEmitter SHALL emit an `agent_error` event for that specific agent containing a descriptive error message.
8. WHEN a fatal analysis error occurs, THE SSEEmitter SHALL emit an `analysis_error` event and then close the SSE connection.
9. THE SSEEmitter SHALL flush each event to the client immediately upon writing, without buffering.
10. WHERE the analysis rate-limit feature is active, THE API SHALL reject more than 5 analysis requests from the same user within any 1-hour window with HTTP 429.

---

### Requirement 6: Twin Orb Score Composition

**User Story:** As a student, I want a single composite readiness score that reflects input from all six agents, so that I can see a holistic snapshot of my career readiness at a glance.

#### Acceptance Criteria

1. THE `composeTwinScore` function SHALL compute the composite score as a weighted average using the weights: career 35%, resume 20%, github 20%, skillGap 15%, roadmap 5%, futureTwin 5%.
2. WHEN all six agent results are present, THE `composeTwinScore` function SHALL return `Math.round(weightedSum / 1.0)` where `weightedSum` is the sum of each agent's score multiplied by its weight.
3. WHEN only a subset of agents have results, THE `composeTwinScore` function SHALL normalize the weighted sum by dividing by the sum of weights of present agents only, so that missing agents do not drag the score toward zero.
4. WHEN no agent results are present, THE `composeTwinScore` function SHALL return 0.
5. THE `composeTwinScore` function SHALL always return an integer value in the range [0, 100] for any valid combination of agent results; IF the computed weighted average exceeds 100 due to floating-point arithmetic, THE function SHALL clamp the result to 100. *(Validates: Property 1)*
6. THE `composeTwinScore` function SHALL extract the score for each agent using the correct field: `career.readinessScore`, `resume.atsScore`, `github.healthScore`, `skillGap.coverageScore`, the computed roadmap completion percentage, and `futureTwin.projections[0].readiness`.
7. WHEN the `futureTwin.projections` array is empty, THE `composeTwinScore` function SHALL use 0 as the futureTwin score contribution.

---

### Requirement 7: Dashboard and Visualization

**User Story:** As a student, I want an interactive dashboard that presents all six agent outputs and my composite readiness score visually, so that I can quickly understand my career position and the areas I need to improve.

#### Acceptance Criteria

1. WHEN an analysis completes, THE Frontend SHALL render a BentoGrid dashboard displaying ScoreRing components for all six agent scores.
2. THE TwinOrb component SHALL render two concentric SVG arcs representing the current composite readiness score and the projected readiness score.
3. WHEN the `score` prop changes, THE TwinOrb component SHALL animate the score arc using a Framer Motion spring transition.
4. WHEN an analysis is running, THE TwinOrb component SHALL display a pulse glow visual to indicate active processing.
5. THE ScoreRing component SHALL render a circular progress indicator scaled to the agent's score in [0, 100].
6. THE AgentPipeline component SHALL display the real-time status (`pending`, `running`, `complete`, or `error`) for each of the six agents during SSE streaming.
7. WHEN an `agent_complete` SSE event is received, THE Frontend SHALL update the corresponding AgentPipeline entry to `complete` status and render the agent's result data in the dashboard; WHEN the backend sends data for an agent beyond the expected six, THE Frontend SHALL ignore the extra event and continue normal processing.
8. THE SkillRadar component SHALL render a radar chart overlaying the student's current skills against target skill coverage.
9. THE ProjectionTimeline component SHALL render a horizontal timeline showing the 3-month, 6-month, and 12-month projected role milestones from the FutureTwin agent result.
10. THE Frontend SHALL lazy-load each dashboard page route so that the initial bundle size remains under 200 KB.

---

### Requirement 8: Roadmap Progress Tracking

**User Story:** As a student, I want to mark individual roadmap milestones as complete, so that I can track my progress through the 30-day and 90-day plans generated by the AI.

#### Acceptance Criteria

1. WHEN an analysis completes, THE Orchestrator SHALL upsert a RoadmapDoc for the user populated with the `plan30` and `plan90` tasks from the RoadmapResult, with all tasks initially set to `completed: false`.
2. WHEN an authenticated user sends `PATCH /api/roadmap/progress` with a valid `taskId` and `completed` boolean, THE API SHALL update the targeted task's `completed` field and recompute `progressPercent` from scratch; WHEN the roadmap has zero total tasks, THE API SHALL still accept the PATCH request and set `progressPercent` to 0. *(Validates: Property 6)*
3. THE `progressPercent` field SHALL equal `Math.round((completedTasks / totalTasks) × 100)` after every `updateProgress` call, where `totalTasks` is the count of all tasks across `plan30` and `plan90`. *(Validates: Property 6)*
4. WHEN `totalTasks` is 0, THE API SHALL set `progressPercent` to 0 rather than performing a division. *(Validates: Property 6)*
5. THE `progressPercent` field SHALL always be an integer in the range [0, 100] after any `updateProgress` call. *(Validates: Property 6)*
6. WHEN an authenticated user sends `PATCH /api/roadmap/progress` with a `taskId` that does not exist in the user's RoadmapDoc, THE API SHALL return HTTP 404.
7. WHEN an authenticated user sends `GET /api/roadmap/latest`, THE API SHALL return the user's current RoadmapDoc including the current `progressPercent`.
8. THE API SHALL enforce that each user has at most one RoadmapDoc via a unique index on `RoadmapDoc.userId`; each new analysis SHALL overwrite the previous RoadmapDoc via upsert.
9. WHEN an authenticated user has no RoadmapDoc and requests `GET /api/roadmap/latest`, THE API SHALL return HTTP 404.

---

### Requirement 9: Analysis History and Snapshots

**User Story:** As a student, I want to view my past analyses and access the latest results at any time, so that I can track my career progress over time and compare different analysis runs.

#### Acceptance Criteria

1. WHEN an analysis completes with `status: 'complete'`, THE Orchestrator SHALL persist the AnalysisSnapshot as an immutable versioned document in MongoDB with an auto-incremented `version` number per user. *(Validates: Property 5)*
2. WHEN a new analysis is triggered, THE Orchestrator SHALL create a new AnalysisSnapshot document with `version` equal to the user's previous highest version plus one, and SHALL never modify any existing snapshot. *(Validates: Property 5)*
3. WHEN an authenticated user requests `GET /api/analysis/latest`, THE API SHALL return the most recent AnalysisSnapshot for that user (highest `version`) with HTTP 200.
4. WHEN an authenticated user has no analyses and requests `GET /api/analysis/latest`, THE API SHALL return HTTP 404.
5. WHEN an authenticated user requests `GET /api/analysis/history`, THE API SHALL return an array of all AnalysisSnapshot documents for that user, ordered by `version` descending.
6. THE API SHALL use a compound MongoDB index on `{ userId: 1, version: -1 }` to support efficient `analysis/latest` and `analysis/history` queries.
7. WHEN an AnalysisSnapshot has `status: 'complete'`, THE API SHALL not expose any mutation endpoint for that document; all write operations on completed snapshots SHALL be rejected. *(Validates: Property 5)*

---

### Requirement 10: GitHub Data Fetching

**User Story:** As a student, I want the system to automatically fetch my public GitHub repository data, so that the GitHub Intelligence agent can analyze my coding activity without me needing to manually export anything.

#### Acceptance Criteria

1. WHEN `fetchGitHubData` is called with a valid GitHub username, THE API SHALL fetch the user's most recently pushed repositories (up to 100) from the GitHub REST API v3.
2. WHEN the GitHub API returns a 404 for the provided username, THE Orchestrator SHALL throw a `GitHubFetchError` with the 404 status code.
3. WHEN the GitHub API returns a 403 (rate limit exceeded), THE Orchestrator SHALL throw a `GitHubFetchError` with the 403 status code.
4. THE API SHALL validate the GitHub username against the pattern `^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$` before calling the GitHub API.
5. WHERE a GitHub API token is configured in the environment, THE API SHALL include it in GitHub API requests to raise the rate limit from 60 to 5,000 requests per hour.
6. THE API SHALL cache raw GitHub data per username for 10 minutes using an in-memory TTL map to reduce redundant API calls.

---

### Requirement 11: Health and Infrastructure

**User Story:** As an operator, I want the system to expose a health endpoint and enforce correct security headers, so that I can monitor liveness and ensure the deployment is secure.

#### Acceptance Criteria

1. WHEN a client sends `GET /health`, THE API SHALL return HTTP 200 with the body `{ "ok": true }` without requiring authentication.
2. THE API SHALL enforce CORS to allow requests only from the configured Vercel frontend origin in production environments.
3. WHERE `NODE_ENV` is set to `development`, THE API SHALL allow CORS from all origins.
4. THE API SHALL enforce HTTPS in all environments by accepting connections only over TLS-terminated proxies; the `Strict-Transport-Security` header SHALL be set in production environments only.
5. THE API SHALL apply `express-rate-limit` middleware to auth routes (10 requests per 15 minutes per IP) and to the analysis stream route (5 requests per hour per user).
6. WHEN a MongoDB write operation fails due to an unreachable Atlas cluster, THE API SHALL return HTTP 503 with the body `{ "error": "Database unavailable" }`.
7. THE API SHALL never expose the `NVIDIA_NIM_API_KEY` or `JWT_SECRET` environment variables in any API response or log output.
