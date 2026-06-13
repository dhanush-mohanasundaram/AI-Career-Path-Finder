# AI Career Path Finder 🚀

> Discover the exact skills, tools, and learning roadmap required for any software engineering role — powered by NVIDIA NIM & GLM-5.1.

## What It Does

Enter any software engineering role and instantly get:
- **Complete Skill Matrix** — every technical skill, tool, framework, and soft skill required
- **Phase-by-Phase Learning Roadmap** — structured plan with free learning resources for each topic
- **Portfolio Projects** — hands-on project ideas with tech stacks that impress recruiters

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React · Vite · TypeScript |
| Backend | Node.js · Express · TypeScript |
| AI | NVIDIA NIM · GLM-5.1 (5 specialized agents) |
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

## Architecture

```
User enters role
      ↓
3 AI Agents run in sequence (via SSE streaming)
      ↓
Skill Matrix → Learning Roadmap → Project Recommendations
      ↓
Results dashboard with full analysis
```

## License

MIT
