# SkillForge AI 🔥

> **Forge the Skills. Build the Future.**

Enter any technology role and get a complete AI-powered breakdown of required skills, learning roadmaps, recommended projects, tools, and career guidance.

## What It Does

Enter any software engineering role and instantly get:
- **Complete Skill Matrix** — every technical skill, tool, framework, and soft skill required
- **Phase-by-Phase Learning Roadmap** — structured plan with free learning resources for each topic
- **Portfolio Projects** — hands-on project ideas with tech stacks that impress recruiters
- **Download as PDF** — save your full learning guide

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React · Vite · TypeScript |
| Backend | Node.js · Express · TypeScript |
| AI | NVIDIA NIM · GLM-5.1 (3 specialized agents) |
| Database | MongoDB Atlas |

## AI Agents

| Agent | Purpose |
|-------|---------|
| Skill Intelligence Agent | Maps all required skills, tools & concepts |
| Learning Roadmap Agent | Builds structured learning plan with free resources |
| Project Recommendation Agent | Recommends portfolio projects with tech stacks |

## Roles Supported

AI Engineer · Machine Learning Engineer · Generative AI Engineer · MLOps Engineer · Full Stack Developer · Backend Engineer · Frontend Engineer · DevOps Engineer · Cloud Engineer · Data Engineer · Cybersecurity Engineer · Mobile App Developer · and 12 more

## Run Locally

```bash
# 1. Backend
cd server
cp .env.example .env      # fill in MONGODB_URI and NVIDIA_NIM_API_KEY
npm install
npm run dev               # http://localhost:5000

# 2. Frontend
cd client
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

## Environment Variables

**server/.env**
```
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
NVIDIA_NIM_API_KEY=your_nvapi_key
NIM_MODEL=zai-org/glm-5.1
```

---

*SkillForge AI · Forge the Skills. Build the Future. · Powered by NVIDIA NIM*
