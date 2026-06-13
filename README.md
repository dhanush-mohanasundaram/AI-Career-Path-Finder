# CareerTwin AI 🧬
> Your AI-Powered Digital Career Twin for Software Engineering Success

Six specialized AI agents analyze your resume, GitHub, and goals to generate a career readiness score, skill gap analysis, 30/90-day roadmap, and a projection of your future self.

## Stack
React · Vite · TypeScript · Tailwind · Framer Motion · Node · Express · MongoDB Atlas · GLM-5.1 via NVIDIA NIM · Vercel · Render

## Agents
Career Advisor · Resume Analyzer · GitHub Intelligence · Skill Gap · Roadmap · Future Career Twin

## Run locally
1. `cd server && cp .env.example .env` (fill in Atlas URI + NIM key) `&& npm i && npm run dev`
2. `cd client && cp .env.example .env && npm i && npm run dev`
3. Open http://localhost:5173

## Architecture
Onboarding → Orchestrator (SSE) → [Resume ∥ GitHub] → Career → Skill Gap → Roadmap → Future Twin → MongoDB → Bento dashboard
