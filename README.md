<div align="center">

# ⚡ AgentForge
<img width="1920" height="949" alt="image" src="https://github.com/user-attachments/assets/76ebd0d1-8cff-4772-8897-1c0a9f32abce" />


### Autonomous AI Agent Platform

**Plan → Execute → Verify.** AgentForge orchestrates specialized AI agents to plan, execute, and deliver on complex goals — with real-time transparency, human approval controls, persistent memory, and zero-cost AI via free OpenRouter models.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-black?style=flat&logo=socket.io&badgeColor=010101)](https://socket.io/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-Free_Models-6366F1?style=flat)](https://openrouter.ai/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Free AI Models Used](#-free-ai-models-used)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database & Seeding](#-database--seeding)
- [API Reference](#-api-reference)
- [Architecture — How Agents Work](#-architecture--how-agents-work)
- [Deployment](#️-deployment)
- [Security](#-security)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🧠 Overview

AgentForge is a **production-grade multi-agent operating system** — not a chatbot wrapper. It takes a plain-English goal, breaks it into an executable plan, assigns specialized AI agents to each step, calls real tools (web search, calculators, file readers), verifies its own output, and generates downloadable artifacts — all streamed live to the browser via WebSockets.

Every model call runs through OpenRouter's **free-tier models only** — no API costs, no credit card, no per-token billing. If a model becomes unavailable, AgentForge automatically discovers replacements from OpenRouter's live catalog without requiring a code deploy.

---

## ✨ Features

### Core Agent Engine
- 🤖 **Multi-agent orchestration** — Planner, Researcher, Analyst, Coder, Security, Document, Reviewer, and Orchestrator agents collaborate on a single goal
- 🧩 **Dynamic planning engine** — breaks any goal into 3–8 dependency-aware steps with automatic agent assignment
- 🔁 **Automatic retry + fallback** — failed steps retry up to 3x; failed models fall back through the entire live-discovered free model pool
- 🔍 **9 built-in tools** — web search, calculator, text analyzer, JSON processor, CSV analyzer, PDF reader, file reader, browser fetcher, code executor
- ✅ **Self-verification pass** — every completed task is graded for confidence and completeness before being marked done
- ⏱️ **Configurable task timeout** — user-adjustable 1–30 minute execution ceiling per task

### Intelligence & Memory
- 🌐 **Dynamic model discovery** — live-fetches OpenRouter's model catalog every 10 minutes; automatically drops models that go paid/unavailable and picks up new free ones — zero hardcoded model IDs
- 📊 **Model health dashboard** — per-model uptime %, latency sparklines, success rate, fallback counts
- 💾 **Persistent memory** — short-term, long-term, semantic, and project-scoped memory that agents recall across sessions
- 📎 **File upload + RAG** — attach `.txt/.md/.csv/.json/.pdf` files to any task; content is chunked, embedded, and retrieved via cosine similarity to ground agent responses in your documents
- 💰 **Token/cost tracking** — every task tracks prompt/completion/total tokens consumed

### Collaboration
- 👥 **Team workspaces** — invite-code based teams with Owner/Editor/Viewer roles
- 📝 **Shared project workspace** — a live, permission-aware notes editor per project that team members can co-edit
- 💬 **Task comments** — leave notes/annotations on any task for future reference
- 🔗 **Public share links** — generate a read-only, optionally time-limited link to any artifact — no login required to view

### Human Oversight
- 🛡️ **Human-in-the-loop approvals** — high-risk tool calls pause for explicit user approval before executing
- 📋 **90-day audit log** — every user/agent/system action is immutably logged with actor, resource, and outcome
- 🚦 **Per-user daily quotas** — configurable task limits per user (admin-adjustable), with automatic 24h reset

### Automation
- 📅 **Scheduled agents** — cron-based recurring tasks ("every Monday, summarize my GitHub activity")
- 🔔 **Real-time notifications** — dedicated notifications page with filters, mark-as-read, and mark-all-read
- 📤 **Export task history** — download your full task history as CSV or JSON

### Experience
- ⚡ **Live execution streaming** — Socket.IO powered step-by-step feed: planning, tool calls, agent switches, verification — all in real time
- 🎙️ **Voice input** — speak your task goal using the browser's native Speech Recognition API
- 🎨 **Premium landing page** — Framer Motion animations, animated agent showcase, testimonials, security section
- 📱 **Fully responsive** — mobile-first design across every page including the admin panel
- 🗂️ **Built-in code workspace** — multi-file scratchpad editor per workspace, independent of the project notes editor

### Admin Panel
- 📈 **Platform dashboard** — total users, tasks, success rate, model fallback counts
- 👤 **User management** — activate/deactivate accounts, adjust individual daily task quotas
- 🧾 **Full audit trail viewer** with filters by action/status/date range
- 🎛️ **Model management** — enable/disable individual models from the live-discovered pool

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **TypeScript** | Type safety across the entire backend |
| **MongoDB + Mongoose** | Primary datastore — 14 collections |
| **Socket.IO** | Real-time bidirectional agent execution streaming |
| **JWT (access + refresh)** | Stateless authentication with rotation |
| **node-cron** | Scheduled agent task runner |
| **Multer** | File upload handling for RAG documents |
| **bcryptjs** | Password hashing |
| **express-validator** | Request validation |
| **express-rate-limit** | Abuse protection on auth + task creation |
| **Helmet + CORS** | Security headers, multi-origin CORS (prod + Vercel previews) |
| **Winston** | Structured logging |
| **Axios** | OpenRouter API client |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI library |
| **TypeScript** | Type safety across the entire frontend |
| **Vite** | Build tool + dev server |
| **Tailwind CSS** | Utility-first styling with custom design tokens |
| **Framer Motion** | Page transitions, hero animations, micro-interactions |
| **Zustand** | Lightweight auth state management (persisted) |
| **TanStack Query** | Server state, caching, polling |
| **Socket.IO Client** | Live task execution feed |
| **React Router v6** | Client-side routing |
| **React Hot Toast** | Notification toasts |
| **Lucide React** | Icon system |
| **date-fns** | Date formatting |

### AI Layer
| Component | Details |
|---|---|
| **OpenRouter** | Free-tier LLM gateway — zero cost, zero API key exposure to frontend |
| **Dynamic model discovery** | Live catalog fetch every 10 min via `GET /api/v1/models`, filtered by `pricing.prompt === 0 && pricing.completion === 0` |
| **Custom RAG pipeline** | Chunking (800 chars/100 overlap) + cosine similarity retrieval, with deterministic hash-embedding fallback if the embedding endpoint is unreachable |

---

## 🤖 Free AI Models Used

AgentForge doesn't hardcode a fixed model list — it **dynamically discovers** every free model OpenRouter currently offers and auto-categorizes it (`CODING`, `REASONING`, `FAST`, `LONG_CONTEXT`, `GENERAL`). The pool below represents the typical free-tier lineup it discovers and rotates through:

| # | Model | Provider | Category | Context Window |
|---|---|---|---|---|
| 1 | Llama 3.3 70B Instruct | Meta | General | 131K |
| 2 | DeepSeek R1 | DeepSeek | Reasoning | 65K |
| 3 | DeepSeek Chat (V3) | DeepSeek | General | 65K |
| 4 | Qwen 2.5 Coder 32B Instruct | Qwen | Coding | 32K |
| 5 | Gemma 3 27B IT | Google | General | 131K |
| 6 | Mistral 7B Instruct | Mistral AI | Fast | 32K |
| 7 | Phi-3 Medium 128K Instruct | Microsoft | Long Context | 128K |
| 8 | Llama 3.2 3B Instruct | Meta | Fast | 131K |
| 9 | Qwen 2.5 72B Instruct | Qwen | General | 32K |
| 10 | Gemma 2 9B IT | Google | Fast | 8K |
| 11 | Mistral Nemo | Mistral AI | General | 128K |
| 12 | Zephyr 7B Beta | HuggingFace | Fast | 32K |

> **Zero hardcoding:** if OpenRouter adds or removes a free model, AgentForge picks up the change automatically within 10 minutes — no code edits, no redeploy.

---

## 📁 Project Structure

```
agentforge/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts                # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── admin.controller.ts        # Platform dashboard, user mgmt, quotas
│   │   │   ├── approvals.controller.ts    # Human-in-the-loop approval responses
│   │   │   ├── artifacts.controller.ts    # Artifact CRUD, download, share links
│   │   │   ├── auth.controller.ts         # Register, login, refresh, logout
│   │   │   ├── comments.controller.ts     # Task comments/annotations
│   │   │   ├── documents.controller.ts    # File upload + RAG document handling
│   │   │   ├── export.controller.ts       # CSV/JSON task history export
│   │   │   ├── memory.controller.ts       # Agent memory CRUD
│   │   │   ├── models.controller.ts       # Model list + health endpoint
│   │   │   ├── notifications.controller.ts
│   │   │   ├── projects.controller.ts     # Projects + shared workspace editor
│   │   │   ├── schedules.controller.ts    # Cron-based recurring agents
│   │   │   ├── tasks.controller.ts        # Task CRUD, dashboard stats
│   │   │   └── teams.controller.ts        # Team creation, invites, roles
│   │   ├── middleware/
│   │   │   ├── auth.ts                    # JWT auth + admin guard
│   │   │   ├── errorHandler.ts
│   │   │   └── quota.ts                   # Daily task quota enforcement
│   │   ├── models/                        # Mongoose schemas
│   │   │   ├── Approval.ts
│   │   │   ├── Artifact.ts                # + share link fields
│   │   │   ├── AuditLog.ts
│   │   │   ├── Comment.ts
│   │   │   ├── Document.ts                # RAG document + chunks + embeddings
│   │   │   ├── Memory.ts
│   │   │   ├── ModelConfiguration.ts      # + health/latency tracking fields
│   │   │   ├── Notification.ts
│   │   │   ├── Project.ts                 # + teamId + workspaceContent
│   │   │   ├── Schedule.ts
│   │   │   ├── Task.ts                    # + token tracking + maxDurationMs
│   │   │   ├── Team.ts
│   │   │   ├── User.ts                    # + quota fields
│   │   │   └── Workspace.ts               # standalone code scratchpad
│   │   ├── routes/
│   │   │   ├── admin.routes.ts
│   │   │   ├── approvals.routes.ts
│   │   │   ├── artifacts.routes.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── comments.routes.ts
│   │   │   ├── documents.routes.ts
│   │   │   ├── export.routes.ts
│   │   │   ├── index.ts                   # Central router mount
│   │   │   ├── memory.routes.ts
│   │   │   ├── models.routes.ts
│   │   │   ├── notifications.routes.ts
│   │   │   ├── projects.routes.ts
│   │   │   ├── schedules.routes.ts
│   │   │   ├── tasks.routes.ts
│   │   │   ├── teams.routes.ts
│   │   │   ├── tools.routes.ts
│   │   │   └── workspaces.routes.ts
│   │   ├── services/
│   │   │   ├── agent/
│   │   │   │   ├── executor.ts            # Step execution + RAG injection
│   │   │   │   ├── modelDiscovery.ts      # Live OpenRouter catalog sync
│   │   │   │   ├── modelRouter.ts         # Model selection + fallback chain
│   │   │   │   ├── orchestrator.ts        # Main plan→execute→verify loop
│   │   │   │   └── planner.ts             # Goal → step decomposition
│   │   │   ├── rag/
│   │   │   │   ├── documentProcessor.ts   # Chunking + retrieval
│   │   │   │   ├── embeddings.ts          # OpenRouter embeddings + fallback
│   │   │   │   └── textExtractor.ts       # txt/md/csv/json/pdf extraction
│   │   │   ├── scheduler/
│   │   │   │   └── scheduler.ts           # node-cron job runner
│   │   │   └── tools/
│   │   │       └── toolRegistry.ts        # 9-tool implementation registry
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   ├── logger.ts                  # Winston config
│   │   │   ├── seed.ts                    # Admin/demo user + model seeding
│   │   │   └── socket.ts                  # Socket.IO singleton accessor
│   │   └── server.ts                      # App entry point
│   ├── uploads/                           # RAG file storage (gitignored)
│   ├── .env                               # Local environment (gitignored)
│   ├── .env.example
│   ├── render.yaml                        # Render Blueprint config
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── AdminLayout.tsx
│   │   │       └── AppLayout.tsx          # Sidebar shell + notifications badge
│   │   ├── hooks/
│   │   │   └── useVoiceInput.ts           # Web Speech API wrapper
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminAuditLogs.tsx
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── AdminModels.tsx
│   │   │   │   ├── AdminTasks.tsx
│   │   │   │   └── AdminUsers.tsx         # + quota adjustment modal
│   │   │   ├── artifacts/
│   │   │   │   └── ArtifactsPage.tsx      # + share link modal
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardPage.tsx      # + quota bar
│   │   │   ├── landing/
│   │   │   │   └── LandingPage.tsx        # Public marketing homepage
│   │   │   ├── memory/
│   │   │   │   └── MemoryPage.tsx
│   │   │   ├── models/
│   │   │   │   └── ModelsPage.tsx         # Model health dashboard
│   │   │   ├── notifications/
│   │   │   │   └── NotificationsPage.tsx
│   │   │   ├── projects/
│   │   │   │   ├── ProjectDetailPage.tsx  # Shared workspace notes editor
│   │   │   │   └── ProjectsPage.tsx
│   │   │   ├── schedules/
│   │   │   │   └── SchedulesPage.tsx
│   │   │   ├── shared/
│   │   │   │   └── SharedArtifactPage.tsx # Public, no-auth artifact viewer
│   │   │   ├── tasks/
│   │   │   │   ├── NewTaskPage.tsx        # + file upload + voice input
│   │   │   │   ├── TaskDetailPage.tsx     # + comments + attached docs
│   │   │   │   └── TasksPage.tsx          # + CSV/JSON export
│   │   │   ├── teams/
│   │   │   │   └── TeamsPage.tsx
│   │   │   └── workspaces/
│   │   │       └── WorkspacePage.tsx      # Standalone multi-file code editor
│   │   ├── services/
│   │   │   ├── api.ts                     # Axios instance + token refresh
│   │   │   └── socket.ts                  # Socket.IO client
│   │   ├── stores/
│   │   │   └── authStore.ts               # Zustand auth state
│   │   ├── App.tsx                        # Route definitions
│   │   ├── index.css                      # Tailwind + design tokens
│   │   ├── main.tsx                       # React entry point
│   │   └── vite-env.d.ts
│   ├── .env                               # Local dev (gitignored)
│   ├── .env.production                    # Production API URLs
│   ├── vercel.json                        # SPA rewrite rules
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **MongoDB** — local instance or free [MongoDB Atlas](https://cloud.mongodb.com) M0 cluster
- **OpenRouter account** — free at [openrouter.ai](https://openrouter.ai)

### Clone the repository

```bash
git clone https://github.com/zobbygit/AgentForge-Agentic-AI.git
cd agentforge
```

### Backend setup

```bash
cd backend
cp .env.example .env
# → open .env and fill in MONGODB_URI + OPENROUTER_API_KEY (see below)
npm install
npm run seed        # creates admin + demo user + seeds model pool
npm run dev          # starts on http://localhost:5000
```

### Frontend setup

```bash
cd frontend
cp .env.example .env
# → defaults already point to localhost:5000, no changes needed for local dev
npm install
npm run dev          # starts on http://localhost:5173
```

Visit **http://localhost:5173** — you're live.

---

## 🔐 Environment Variables

### Backend — `backend/.env`

```bash
# ─── MongoDB ────────────────────────────────────────────────
# Local:  mongodb://localhost:27017/agentforge
# Atlas:  mongodb+srv://<user>:<password>@<cluster>.mongodb.net/agentforge?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/agentforge?retryWrites=true&w=majority

# ─── JWT ────────────────────────────────────────────────────
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_SECRET=<generate a second, different string the same way>

# ─── OpenRouter (Free AI Models) ───────────────────────────
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxx
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# ─── App ────────────────────────────────────────────────────
CLIENT_URL=http://localhost:5173        # comma-separate multiple origins in production
PORT=5000
NODE_ENV=development

# ─── Seed credentials (used by: npm run seed) ──────────────
ADMIN_EMAIL=admin@agentforge.ai
ADMIN_PASSWORD=Admin@123456
DEMO_EMAIL=demo@agentforge.ai
DEMO_PASSWORD=Demo@123456
```

### Frontend — `frontend/.env`

```bash
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=AgentForge
```

### Frontend — `frontend/.env.production`

```bash
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
VITE_APP_NAME=AgentForge
```

### 🔑 Getting your OpenRouter API key (free, no credit card)

1. Go to **[openrouter.ai](https://openrouter.ai)** → Sign up (Google or email)
2. Navigate to **[openrouter.ai/keys](https://openrouter.ai/keys)**
3. Click **Create Key** → name it `AgentForge` → copy the key (`sk-or-v1-...`)
4. Paste into `OPENROUTER_API_KEY` in your `.env`

All models AgentForge uses carry `pricing.prompt = 0` and `pricing.completion = 0` — genuinely free, no billing surprises, ever.

---

## 🗄 Database & Seeding

AgentForge uses **MongoDB** with **14 collections**, managed via Mongoose:

| Collection | Purpose |
|---|---|
| `users` | Accounts, roles, quota tracking |
| `tasks` | Agent tasks + steps + token usage |
| `projects` | Project grouping + shared workspace notes |
| `teams` | Team membership + roles |
| `memories` | Agent long/short-term memory |
| `artifacts` | Generated files + share links |
| `documents` | Uploaded files + RAG chunks/embeddings |
| `comments` | Task annotations |
| `schedules` | Cron-based recurring tasks |
| `approvals` | Human-in-the-loop approval requests |
| `notifications` | In-app notification feed |
| `auditlogs` | 90-day immutable action log |
| `modelconfigurations` | Live-discovered OpenRouter model pool + health stats |
| `workspaces` | Standalone multi-file code scratchpads |

### Seeding

```bash
cd backend
npm run seed
```

This creates:
- **1 admin account** (`ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`)
- **1 demo account** (`DEMO_EMAIL` / `DEMO_PASSWORD` from `.env`)
- **Initial model pool** — triggers first OpenRouter catalog discovery

> Seeding is **idempotent** — safe to re-run; it uses `findOneAndUpdate` with `upsert` and won't duplicate accounts or models.

### Default credentials (change immediately in production)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@agentforge.ai` | `Admin@123456` |
| Demo | `demo@agentforge.ai` | `Demo@123456` |

---

## 📡 API Reference

Base URL: `http://localhost:5000/api` (dev) or `https://your-backend.onrender.com/api` (prod)

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Create account | Public |
| `POST` | `/auth/login` | Login | Public |
| `POST` | `/auth/refresh` | Refresh access token | Public (refresh token) |
| `POST` | `/auth/logout` | Logout | Required |
| `GET` | `/auth/me` | Current user profile | Required |

### Tasks
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/tasks` | List tasks (paginated, filterable) | Required |
| `POST` | `/tasks` | Create task + start agent | Required + quota |
| `GET` | `/tasks/:id` | Task detail | Required |
| `POST` | `/tasks/:id/cancel` | Cancel running task | Required |
| `POST` | `/tasks/:id/retry` | Retry failed/cancelled task | Required + quota |
| `DELETE` | `/tasks/:id` | Delete task | Required |
| `GET` | `/tasks/stats/dashboard` | Dashboard stats + quota info | Required |

### Projects
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/projects` | List own + team-shared projects | Required |
| `POST` | `/projects` | Create project | Required |
| `GET` | `/projects/:id` | Project detail | Required |
| `PUT` | `/projects/:id` | Update project | Owner/Editor |
| `PUT` | `/projects/:id/workspace` | Save shared workspace notes | Owner/Editor |
| `DELETE` | `/projects/:id` | Delete project | Owner only |

### Teams
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/teams` | List my teams | Required |
| `POST` | `/teams` | Create team | Required |
| `POST` | `/teams/join` | Join via invite code | Required |
| `GET` | `/teams/:id` | Team detail | Member |
| `PUT` | `/teams/:id/members` | Change member role | Owner only |
| `DELETE` | `/teams/:id/members/:memberId` | Remove member | Owner only |
| `DELETE` | `/teams/:id` | Delete team | Owner only |

### Memory
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/memory` | List memories (search, filter) | Required |
| `POST` | `/memory` | Create memory | Required |
| `PUT` | `/memory/:id` | Update memory | Required |
| `DELETE` | `/memory/:id` | Delete memory | Required |
| `DELETE` | `/memory/clear` | Clear all/by-type memories | Required |

### Artifacts
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/artifacts` | List artifacts | Required |
| `GET` | `/artifacts/:id` | Artifact detail | Required |
| `GET` | `/artifacts/:id/download` | Download file | Token (header or query) |
| `POST` | `/artifacts/:id/share` | Create public share link | Required |
| `DELETE` | `/artifacts/:id/share` | Revoke share link | Required |
| `GET` | `/artifacts/shared/:token` | View shared artifact | Public |
| `DELETE` | `/artifacts/:id` | Delete artifact | Required |

### Documents (RAG)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/documents/upload` | Upload file for RAG indexing | Required |
| `GET` | `/documents` | List documents | Required |
| `GET` | `/documents/:id` | Document detail | Required |
| `DELETE` | `/documents/:id` | Delete document | Required |

### Comments
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/comments/task/:taskId` | List task comments | Required |
| `POST` | `/comments/task/:taskId` | Add comment | Required |
| `DELETE` | `/comments/:id` | Delete comment | Required |

### Schedules
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/schedules` | List schedules | Required |
| `POST` | `/schedules` | Create scheduled agent | Required |
| `PUT` | `/schedules/:id` | Update schedule | Required |
| `POST` | `/schedules/:id/toggle` | Pause/activate | Required |
| `DELETE` | `/schedules/:id` | Delete schedule | Required |

### Approvals
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/approvals` | List approvals | Required |
| `POST` | `/approvals/:id/respond` | Approve/reject/modify | Required |

### Models
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/models` | List enabled models | Required |
| `GET` | `/models/health` | Full health dashboard data | Required |
| `PUT` | `/models/:id` | Update model config | Required |

### Notifications
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/notifications` | List notifications | Required |
| `POST` | `/notifications/read` | Mark read (one/all) | Required |
| `DELETE` | `/notifications/:id` | Delete notification | Required |

### Export
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/export/tasks/csv` | Export task history as CSV | Token (header or query) |
| `GET` | `/export/tasks/json` | Export task history as JSON | Token (header or query) |

### Workspaces (standalone code editor)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/workspaces` | List workspaces | Required |
| `POST` | `/workspaces` | Create workspace | Required |
| `GET` | `/workspaces/:id` | Workspace detail | Required |
| `PUT` | `/workspaces/:id` | Update files | Required |
| `DELETE` | `/workspaces/:id` | Delete workspace | Required |

### Tools
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/tools` | List available agent tools | Required |

### Admin *(requires ADMIN role)*
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/dashboard` | Platform-wide stats |
| `GET` | `/admin/users` | List all users |
| `POST` | `/admin/users/:id/toggle` | Activate/deactivate user |
| `PUT` | `/admin/users/:id/quota` | Adjust user's daily task limit |
| `GET` | `/admin/tasks` | All tasks across all users |
| `GET` | `/admin/models` | All models (enabled + disabled) |
| `PUT` | `/admin/models/:id` | Enable/disable a model |
| `GET` | `/admin/audit-logs` | Full audit trail with filters |
| `GET` | `/admin/system` | Server uptime, memory, node version |

### Health Check
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server liveness probe |

---

## 🏗 Architecture — How Agents Work

```
┌─────────────────────────────────────────────────────────────────┐
│  1. USER SUBMITS GOAL                                            │
│     "Research competitor pricing and generate a report"          │
└──────────────────────────┬────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. PLANNER AGENT                                                 │
│     • Selects a REASONING-category model (live-discovered)       │
│     • Decomposes goal into 3–8 steps with dependencies            │
│     • Assigns each step to a specialized agent + tool            │
└──────────────────────────┬────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. ORCHESTRATOR — EXECUTION LOOP                                 │
│     For each step (respecting dependencies):                     │
│       • Check for RAG context from uploaded documents            │
│       • Execute tool if required (web_search, calculator, etc.)  │
│       • Call model with context + tool result                    │
│       • Retry up to 3x on failure                                 │
│       • Pause for human approval if step is high-risk             │
│       • Stream every event live via Socket.IO                     │
│       • Auto-generate artifact if output is substantial           │
└──────────────────────────┬────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. VERIFICATION PASS                                             │
│     • Second model call grades completion confidence (0–100%)    │
│     • Checks are itemized and shown to the user                  │
└──────────────────────────┬────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. DELIVERY                                                      │
│     • Final Markdown report artifact generated                    │
│     • Memory entry stored for future context                      │
│     • Notification sent                                           │
│     • Token usage + duration recorded on the task                 │
└─────────────────────────────────────────────────────────────────┘
```

### Dynamic Model Discovery Flow

```
Server boot / every 10 min
        │
        ▼
GET https://openrouter.ai/api/v1/models
        │
        ▼
Filter: pricing.prompt === 0 AND pricing.completion === 0
        │
        ▼
Exclude non-chat models (moderation, embedding, TTS, etc.)
        │
        ▼
Auto-categorize by keyword (coder→CODING, r1→REASONING, 7b→FAST...)
        │
        ▼
Upsert into ModelConfiguration collection
        │
        ▼
Agents query DB for best available model per task type
        │
        ▼
On 404 (model removed) → instantly disabled + cache reset → re-discover
```

---

## ☁️ Deployment

### Backend → Render

1. Push to GitHub
2. Render → **New Web Service** → connect repo → set **Root Directory:** `backend`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add all environment variables from the [Environment Variables](#-environment-variables) section
6. Deploy → copy your live URL (`https://your-backend.onrender.com`)
7. Run `npm run seed` once via Render's Shell tab

### Frontend → Vercel

1. Update `frontend/.env.production` with your real Render backend URL
2. Vercel → **Add New Project** → connect repo → set **Root Directory:** `frontend`
3. Framework preset: Vite (auto-detected)
4. Add environment variables `VITE_API_URL` / `VITE_SOCKET_URL`
5. Deploy → copy your live URL (`https://your-app.vercel.app`)
6. Back in Render, update `CLIENT_URL` to your Vercel URL and redeploy

### Required deployment files

- `frontend/vercel.json` — SPA rewrite rules (prevents 404 on direct route refresh)
- `backend/render.yaml` — optional Infrastructure-as-Code for Render Blueprints

> **Note on file storage:** Render's disk is ephemeral. Uploaded RAG documents are stored in `/tmp/uploads` in production and will not survive a service restart/redeploy. For persistent file storage at scale, integrate an S3-compatible bucket (e.g. Cloudflare R2 free tier).

---

## 🔒 Security

- **JWT access + refresh token rotation** — 15-minute access tokens, 7-day refresh tokens
- **bcrypt password hashing** (12 rounds)
- **Rate limiting** — 10 req/15min on auth endpoints, 10 req/min on task creation, 300 req/15min globally
- **Per-user daily task quotas** — prevents runaway usage, admin-configurable
- **Role-based access control** — `USER` / `ADMIN` at the platform level, `OWNER` / `EDITOR` / `VIEWER` at the team level
- **Helmet.js** security headers
- **Multi-origin CORS** — explicit allowlist + automatic `*.vercel.app` preview support
- **90-day immutable audit log** — every sensitive action logged with actor, IP, and outcome
- **OpenRouter API key never exposed to frontend** — all model calls proxy through the backend
- **Human-in-the-loop approval gate** — high-risk tool executions require explicit user sign-off
- **Input validation** via `express-validator` on all auth routes

---

## 🗺 Roadmap

- [ ] S3/R2-backed persistent file storage for RAG documents
- [ ] Real vector database integration (pgvector / Pinecone) for larger-scale RAG
- [ ] Agent self-critique double-pass before finalizing results
- [ ] Slack/Discord webhook notifications
- [ ] Command palette (Cmd+K) for power-user navigation
- [ ] Public API keys for programmatic task creation

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<div align="center">

**Built with ⚡ by Zohaib** · Powered by [OpenRouter](https://openrouter.ai) Free Models

</div>
