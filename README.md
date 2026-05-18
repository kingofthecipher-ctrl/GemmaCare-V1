# GemmaCare — AI-Powered Clinical Triage Assistant

> **Version 1.0** · First Public Release · May 2026

GemmaCare is an open-source, multimodal clinical triage tool designed for healthcare workers in remote and resource-limited settings. A health worker can record patient audio in any language, optionally photograph a medication label or wound, and receive a structured clinical assessment — including urgency scoring, medication cross-verification, and bilingual patient instructions — in seconds, powered entirely by a locally-run Gemma 4 model.

---

## Table of Contents

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Quick Start](#quick-start)
4. [Detailed Installation](#detailed-installation)
5. [Configuration](#configuration)
6. [Running the App](#running-the-app)
7. [Features](#features)
8. [Architecture](#architecture)
9. [Urgency Scoring Rubric](#urgency-scoring-rubric)
10. [Troubleshooting](#troubleshooting)
11. [Developer Credits](#developer-credits)
12. [Technology Credits](#technology-credits)
13. [License](#license)
14. [Medical Disclaimer](#medical-disclaimer)

---

## Overview

GemmaCare processes patient information through a six-step AI pipeline:

1. **Audio Transcription** — Gemma 4 transcribes and detects language from patient audio
2. **Image Analysis** — Gemma 4 vision describes medication labels, wounds, or other clinical photos
3. **Synthesis** — When both audio and image are present, inputs are reconciled into a unified clinical picture
4. **Clinical Extraction** — Structured triage data is extracted: chief complaint, symptom list, urgency level (1–5), recommended action, confidence score
5. **Medication Safety** — Four parallel safety checks compare audio-mentioned vs. image-visible medications
6. **Bilingual Instructions** — Patient-friendly care instructions generated in both patient and clinician languages

---

## System Requirements

### Minimum Hardware

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 8-core x86-64 (e.g. Intel i5-12th gen) | 16-core or Apple Silicon M2+ |
| RAM | 16 GB | 32 GB |
| GPU | None required (CPU inference) | NVIDIA RTX 3080+ / Apple Silicon unified memory |
| Disk | 20 GB free (model + app) | 40 GB SSD |
| Network | Required for initial model download | Offline after first setup |

> **Apple Silicon Note:** GemmaCare runs well on M1/M2/M3 MacBooks via Ollama's Metal backend. Inference is significantly faster than CPU-only x86.

> **GPU Note:** An NVIDIA GPU with 10+ GB VRAM will dramatically accelerate inference. Ollama automatically uses CUDA if available.

### Software Prerequisites

| Software | Version | Notes |
|----------|---------|-------|
| Node.js | 22.x LTS or higher | Required |
| pnpm | 10.x | Installed automatically if missing |
| Ollama | Latest | Required — runs Gemma 4 locally |
| Docker | 24+ (optional) | For containerised deployment |
| Git | Any recent | For cloning the repo |

### Operating Systems

- ✅ macOS 13 Ventura or later
- ✅ Ubuntu 22.04 LTS / Debian 12+
- ✅ Windows 11 with WSL2 (Ubuntu 22.04 recommended)
- ⚠️ Windows (native, without WSL) — not officially tested

---

## Quick Start

### 1. Install Ollama

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows — download installer from https://ollama.com/download
```

### 2. Pull the Gemma 4 model

```bash
ollama pull gemma4:e4b
```

> **Note:** The `gemma4:e4b` model is approximately 9 GB. Ensure you have sufficient disk space and a stable internet connection for the first pull.

### 3. Clone and install GemmaCare

```bash
git clone <repository-url>
cd GemmaCare-V1

# Install Node dependencies
npm install -g pnpm   # if pnpm is not already installed
pnpm install

# Initialise the database (SQLite, zero configuration)
pnpm db:push
```

### 4. Start the app

```bash
./START.sh
# OR
pnpm dev
```

Open your browser at **http://localhost:8080**

---

## Detailed Installation

### Step 1 — Install Ollama

Ollama manages local AI model inference. GemmaCare uses it to run Gemma 4.

**macOS / Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows (WSL2):**
```bash
# Inside your WSL2 Ubuntu shell:
curl -fsSL https://ollama.com/install.sh | sh
```

Verify Ollama is running:
```bash
ollama list
# Should return an empty table (no models yet)
```

### Step 2 — Pull Gemma 4 E4B

```bash
ollama pull gemma4:e4b
```

This downloads ~9 GB. To verify the model is ready:
```bash
ollama list
# Should show: gemma4:e4b
```

Optionally test the model:
```bash
ollama run gemma4:e4b "Say hello in 5 languages"
```

### Step 3 — Clone the repository

```bash
git clone <repository-url>
cd GemmaCare-V1
```

### Step 4 — Install Node dependencies

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install project dependencies
pnpm install
```

### Step 5 — Configure environment

The `.env` file is pre-configured for local development with sensible defaults. For most users, no changes are needed:

```bash
# View current config
cat .env
```

Key variables:
```env
DATABASE_URL=          # Empty = SQLite (auto-created at gemmacare.db)
PORT=8080
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:e4b
JWT_SECRET=gemmacare-v1-local-secret-change-in-prod
```

> **Production:** Change `JWT_SECRET` to a strong random string before deploying publicly.

### Step 6 — Initialise the database

GemmaCare uses SQLite by default — no database server required.

```bash
pnpm db:push
```

This creates `gemmacare.db` in the project root with all required tables.

**Optional — MySQL instead of SQLite:**
```env
DATABASE_URL=mysql://user:password@localhost:3306/gemmacare
```

### Step 7 — Start the app

```bash
pnpm dev
```

The app will be available at **http://localhost:8080**

---

## Configuration

### `.env` Reference

```env
# ─── Database ──────────────────────────────────────────────────────────────────
# Leave empty for SQLite (auto-created, zero setup, fully offline)
# For MySQL: mysql://user:password@host:port/dbname
DATABASE_URL=

# ─── App ───────────────────────────────────────────────────────────────────────
NODE_ENV=development
PORT=8080

# ─── Security ──────────────────────────────────────────────────────────────────
# Change this to a long random string in production
JWT_SECRET=gemmacare-v1-local-secret-change-in-prod

# ─── Auth ──────────────────────────────────────────────────────────────────────
VITE_APP_ID=local-dev
OAUTH_SERVER_URL=http://localhost:8080
VITE_OAUTH_PORTAL_URL=http://localhost:8080
OWNER_OPEN_ID=local-owner-id
OWNER_NAME=Local Owner
LOCAL_DEV_BYPASS_AUTH=true   # Set to false to require login

# ─── Ollama / Gemma 4 E4B ──────────────────────────────────────────────────────
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:e4b

# ─── Branding ──────────────────────────────────────────────────────────────────
VITE_APP_TITLE=GemmaCare V1
```

---

## Running the App

### Development mode (with hot reload)
```bash
pnpm dev
```

### Production build
```bash
pnpm build
pnpm start
```

### Docker (optional)
```bash
docker-compose up --build
```

### Run tests
```bash
pnpm test
```

### Check TypeScript
```bash
pnpm check
```

---

## Features

### Multimodal Triage Input
- **Audio** — Record patient audio directly in-browser or upload `.wav` / `.mp3`
- **Image** — Upload medication labels, wound photos, or any clinically relevant image (`.jpg`, `.png`)
- **Text** — Type or paste a patient description directly

### AI-Powered Analysis (Gemma 4)
- Automatic audio transcription with language detection (40+ languages)
- Vision analysis of medication labels and clinical photos
- Dual-source synthesis when both audio and image are present
- Structured clinical extraction: chief complaint, symptoms, urgency (1–5), confidence

### Medication Cross-Verification (4-Layer)
1. **Name mismatch** — Are audio-mentioned and image-visible drugs the same?
2. **Category check** — Is the drug class appropriate for the complaint?
3. **Route check** — Does the delivery form make sense (oral vs. topical, etc.)?
4. **Semantic check** — Any dose concerns, contraindications, or interactions?

Critical mismatches halt the triage flow and require explicit clinician acknowledgment.

### Bilingual Patient Instructions
When the patient and clinician speak different languages, two sections are generated:
- **Section 1 (For the Clinician)** — Professional medical language in the clinician's language
- **Section 2 (For the Patient)** — Simple, warm language in the patient's language

### Safety Guardrails
- Persistent AI disclaimer on all triage views
- Confidence score with colour-coded warnings
- Mandatory safety notes for sepsis/meningitis antibiotic sequencing
- Cord prolapse and antepartum haemorrhage protocol enforcement
- Crisis line injection for psychiatric emergencies (urgency 5 + suicide/self-harm)
- 20+ code-level hard-locks for life-threatening presentations (TIA, anaphylaxis, etc.)

### Demo Mode
Three pre-loaded demonstration scenarios:
- **Hindi** — Fever + Paracetamol label (multimodal, expected: Urgency 3/5)
- **Spanish** — Chest/wound presentation (multimodal, expected: Urgency 4/5)
- **Swahili** — Audio-only headache assessment (expected: Urgency 3/5)

### Session History
- All triage records saved locally
- Filter and sort by date, urgency, language
- Re-display any past record in full

### Language Translation
On-demand re-translation of clinical record fields and patient instructions to any of 60+ supported languages.

---

## Architecture

```
GemmaCare-V1/
├── client/                  # React 19 frontend
│   ├── src/
│   │   ├── pages/           # Triage, History, Demo, About, Home
│   │   ├── components/      # TriageFlow, TriageInput, TriageOutput, etc.
│   │   └── index.css        # Dark theme (navy/teal/green/purple)
│   └── public/
│       └── demos/           # Demo audio/image assets
│
├── server/                  # Express + tRPC backend
│   ├── _core/
│   │   ├── llm.ts           # Gemma 4 invocation (audio, vision, text)
│   │   ├── trpc.ts          # tRPC router setup
│   │   ├── crisisLines.ts   # Psychiatric emergency resource injection
│   │   └── triageProgress.ts # SSE progress events
│   └── routers/
│       └── triage.ts        # Full 6-call triage pipeline + 20+ safety hard-locks
│
├── drizzle/                 # Database schema & migrations
│   └── schema.ts
│
├── shared/                  # Shared types and constants
│   └── types.ts
│
├── .env                     # Local configuration (SQLite, Ollama, auth)
├── docker-compose.yml       # Optional containerised deployment
└── README.md                # This file
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui components |
| API layer | tRPC 11 (end-to-end type safety) |
| State | TanStack Query v5 |
| Backend | Node.js + Express 4 |
| Database | SQLite (default) via Drizzle ORM, MySQL optional |
| AI inference | Ollama + Gemma 4 E4B (multimodal: audio, vision, text) |
| Build | Vite 7 (frontend) + esbuild (backend) |
| Testing | Vitest |

---

## Urgency Scoring Rubric

GemmaCare uses a 1–5 urgency scale, calibrated against standard triage frameworks:

| Level | Label | Response Time | Examples |
|-------|-------|--------------|---------|
| 1 | Non-urgent | Routine | Paper cut, mild cold, medication refill |
| 2 | Low | Within 24h | Mild UTI, low-grade fever in healthy adult |
| 3 | Moderate | Within a few hours | Fever + headache (no red flags), wound infection |
| 4 | Urgent | Within 30–60 min | Chest pain + cardiac risk, severe asthma, high fever + rigors |
| 5 | Emergency | Immediately | Stroke signs, anaphylaxis with airway, active seizure, meningism |

**Key calibration rules:**
- Fever + headache **alone** = **3**, regardless of whether the patient calls it "severe"
- "Severe" as a pain intensity word is NOT itself a red flag — a second specific neurological sign (photophobia, neck stiffness, confusion) is required to reach Level 4
- 20+ code-level hard-locks prevent under-triaging of life-threatening presentations

---

## Troubleshooting

### Ollama not found / model not available

```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it
ollama serve
```

### Model not downloaded

```bash
ollama pull gemma4:e4b
# Wait for full download (~9 GB)
```

### Port already in use

Change `PORT=8080` in `.env` to another port, then restart.

### Database errors

```bash
# Re-initialise the database
rm -f gemmacare.db
pnpm db:push
```

### Inference is very slow

- CPU inference on Gemma 4 E4B typically takes 30–90 seconds per call on a modern laptop
- A GPU or Apple Silicon Mac will be 5–10x faster
- Each triage run makes 4–6 LLM calls; total time is 3–8 minutes on CPU, 30–60 seconds with GPU/Apple Silicon

### Audio transcription fails

- Ensure your audio is `.wav` or `.mp3`
- File must be under 25 MB
- Check Ollama logs: `ollama serve` (run in a separate terminal)

### Tests failing

```bash
pnpm install          # ensure dependencies are fresh
pnpm test             # run the test suite
```

---

## Developer Credits

GemmaCare was designed and built by:

**Aislinn Phelan** — Clinical AI design, triage rubric architecture, patient safety logic, bilingual instruction system, demo scenario design

Contributions and feedback welcome via the project issue tracker.

---

## Technology Credits

GemmaCare is built on the shoulders of these excellent open-source projects and services:

### AI & Inference
- **[Gemma 4](https://ai.google.dev/gemma)** by Google DeepMind — multimodal language model powering all audio transcription, vision analysis, and clinical reasoning
- **[Ollama](https://ollama.com)** — local model runtime enabling private, offline-capable inference

### Frontend
- **[React](https://react.dev)** (v19) — UI framework
- **[TypeScript](https://www.typescriptlang.org)** — type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com)** (v4) — utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com)** — accessible, composable UI components built on Radix UI
- **[Radix UI](https://www.radix-ui.com)** — unstyled accessible component primitives
- **[Lucide React](https://lucide.dev)** — icon library
- **[Framer Motion](https://www.framer.com/motion/)** — animation library
- **[TanStack Query](https://tanstack.com/query)** (v5) — data fetching and caching
- **[Wouter](https://github.com/molefrog/wouter)** — lightweight React router
- **[Recharts](https://recharts.org)** — composable charting library
- **[Sonner](https://sonner.emilkowal.ski)** — toast notifications
- **[Vaul](https://vaul.emilkowal.ski)** — drawer component
- **[React Hook Form](https://react-hook-form.com)** — form state management
- **[Zod](https://zod.dev)** — schema validation

### Backend
- **[Node.js](https://nodejs.org)** — JavaScript runtime
- **[Express](https://expressjs.com)** (v4) — HTTP server framework
- **[tRPC](https://trpc.io)** (v11) — end-to-end type-safe API layer
- **[Drizzle ORM](https://orm.drizzle.team)** — TypeScript-native database ORM
- **[better-sqlite3](https://github.com/WiseLibs/better-sqlite3)** — fast SQLite bindings
- **[mysql2](https://github.com/sidorares/node-mysql2)** — MySQL client for optional MySQL/TiDB deployment
- **[Jose](https://github.com/panva/jose)** — JWT authentication
- **[nanoid](https://github.com/ai/nanoid)** — unique ID generation
- **[dotenv](https://github.com/motdotla/dotenv)** — environment variable management

### Build Tooling
- **[Vite](https://vitejs.dev)** (v7) — frontend build tool
- **[esbuild](https://esbuild.github.io)** — server bundler
- **[pnpm](https://pnpm.io)** — fast, disk-efficient package manager
- **[Vitest](https://vitest.dev)** — unit and integration testing framework
- **[Prettier](https://prettier.io)** — code formatter
- **[Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)** — database migration tooling

---

## License

GemmaCare is released under the **MIT License**.

```
MIT License

Copyright (c) 2026 Aislinn Phelan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Medical Disclaimer

> ⚠️ **GemmaCare is a clinical decision SUPPORT tool. It is NOT a substitute for professional medical judgment, clinical examination, or diagnosis.**
>
> All outputs are generated by an AI model (Gemma 4) and must be verified by a qualified healthcare professional before any clinical decision is made. GemmaCare is designed to assist — not replace — the clinician.
>
> - Always verify AI outputs with physical examination, patient history, and appropriate investigations
> - Urgency scores are algorithmic estimates, not diagnoses
> - Medication safety checks are advisory and do not replace pharmacist review
> - In any life-threatening emergency, call emergency services immediately
>
> The developers of GemmaCare accept no liability for clinical decisions made on the basis of AI-generated outputs.

---

*GemmaCare v1.0 · May 2026*
