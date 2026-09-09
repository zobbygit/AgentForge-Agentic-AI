# AgentForge — Autonomous AI Agent Platform

A full-stack production-grade multi-agent AI platform built with:

- **Backend:** Node.js + Express + TypeScript + MongoDB + Socket.IO
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion
- **AI:** OpenRouter free models with intelligent routing + fallback chain
- **Agents:** Planner → Executor → Verifier orchestration loop

## Quick Start

### 1. Clone & Setup

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env — add your MONGODB_URI and OPENROUTER_API_KEY
npm install
npm run seed       # seeds admin + demo user + AI models
npm run dev        # starts on port 5000

# Frontend (new terminal)
cd frontend
cp .env.example .env
# Edit .env if needed (default points to localhost:5000)
npm install
npm run dev        # starts on port 5173
```

### 2. Environment Variables

**Backend `.env`:**
```
MONGODB_URI=mongodb://localhost:27017/agentforge
JWT_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
OPENROUTER_API_KEY=sk-or-xxxx          # from openrouter.ai (free account)
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
ADMIN_EMAIL=admin@agentforge.ai
ADMIN_PASSWORD=Admin@123456
DEMO_EMAIL=demo@agentforge.ai
DEMO_PASSWORD=Demo@123456
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Default Credentials

After running `npm run seed` in the backend:

| Role  | Email                  | Password      |
|-------|------------------------|---------------|
| Admin | admin@agentforge.ai    | Admin@123456  |
| Demo  | demo@agentforge.ai     | Demo@123456   |

## Architecture

```
agentforge/
├── backend/
│   └── src/
│       ├── models/          # Mongoose models (User, Task, Memory, etc.)
│       ├── controllers/     # REST API handlers
│       ├── routes/          # Express routers
│       ├── middleware/      # Auth, error handling
│       ├── services/
│       │   ├── agent/       # Planner, Executor, Orchestrator
│       │   ├── tools/       # Tool registry (9 tools)
│       │   └── scheduler/   # Cron-based agent scheduler
│       └── utils/           # JWT, logger, socket, seed
└── frontend/
    └── src/
        ├── pages/           # All page components
        ├── components/      # Layout, shared UI
        ├── stores/          # Zustand auth store
        ├── services/        # Axios API + Socket.IO client
        └── index.css        # Tailwind + custom design tokens
```

## Features

- 🤖 **Multi-agent orchestration** — Planner, Researcher, Analyst, Coder, Security, Document, Reviewer agents
- 🧠 **Intelligent model routing** — Automatically selects best free model per task type
- 🔄 **Automatic fallback** — If a model fails, seamlessly falls back through chain
- 🔍 **9 built-in tools** — Web search, PDF reader, CSV analyzer, calculator, browser, JSON processor, text analyzer
- ✅ **Human approval gates** — High-risk actions pause for your review
- 📅 **Scheduled agents** — Cron-based recurring agent tasks
- 💾 **Persistent memory** — Short-term, long-term and project-scoped memory
- 📄 **Artifact generation** — Reports, code files, JSON, CSV, Markdown
- ⚡ **Real-time streaming** — Socket.IO live execution feed
- 🛡️ **Security first** — JWT auth, rate limiting, audit logs, RBAC
- 🎨 **Premium landing page** — Framer Motion animations, responsive design

## Free AI Models Used

| Model | Category | Context |
|-------|----------|---------|
| Llama 3.3 70B | General | 131K |
| DeepSeek R1 | Reasoning | 65K |
| DeepSeek Chat | General | 65K |
| Qwen 2.5 Coder 32B | Coding | 32K |
| Gemma 3 27B | General | 131K |
| Mistral 7B | Fast | 8K |
| Phi-3 Medium 128K | Long Context | 128K |

## Production Deployment

**Backend (Render):**
- Set all env vars in Render dashboard
- Build command: `npm install && npm run build`
- Start command: `npm start`

**Frontend (Vercel):**
- Set `VITE_API_URL` and `VITE_SOCKET_URL` to your Render backend URL
- Build command: `npm run build`
- Output dir: `dist`

## API Endpoints

| Route | Description |
|-------|-------------|
| `POST /api/auth/register` | Register new user |
| `POST /api/auth/login` | Login |
| `GET  /api/tasks` | List user tasks |
| `POST /api/tasks` | Create & start agent task |
| `GET  /api/tasks/:id` | Get task detail |
| `GET  /api/memory` | List memories |
| `GET  /api/artifacts` | List artifacts |
| `GET  /api/schedules` | List schedules |
| `GET  /api/models` | List AI models |
| `GET  /api/tools` | List available tools |
| `GET  /api/admin/dashboard` | Admin dashboard stats |
