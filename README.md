# ScamShield — Suspicious Message & URL Detector

ScamShield is a full-stack cybersecurity awareness and threat-detection web application built to help users identify potentially fraudulent SMS messages, WhatsApp messages, emails, and suspicious links—and understand *why* a communication is risky before taking action.

---

## Key Features

### 1. Explainable Threat Detection Engine
- **Message Scanner**: Analyses SMS, WhatsApp, email, and social messages with channel-aware context (including India DLT SMS header verification guidance and WhatsApp coercion detection).
- **URL & Link Inspector**: Evaluates standalone links and embedded URLs extracted from messages without ever fetching or opening them—checking IP-based hosts, URL shorteners, lookalike/typosquatted domains, punycode/IDN tricks, suspicious TLDs, excessive subdomains, and dangerous schemes (`javascript:`, `data:`, `.apk` payloads).
- **Forensic Message X-Ray**: Highlights triggered risk phrases directly inside the analyzed text and explains each matched signal with severity badges and rule breakdowns.
- **Visual URL Root-Domain Anatomy**: Breaks down protocol, subdomain, root domain, path/query, and official brand domain comparisons side by side so users can spot deceptive lookalikes at a glance.
- **4-Tier Risk Classification**: Scores inputs from `0–100` across `LOW`, `MEDIUM`, `HIGH`, and `CRITICAL` tiers with false-positive safeguards for legitimate bank alerts, OTPs, and delivery updates.

### 2. Cybersecurity Analytics Dashboard
- **SOC-Inspired Security Overview**: Six interactive metric cards (`Total Scans`, `High Risk`, `Medium Risk`, `Low Risk`, `Suspicious URLs`, and `Threat Detection Rate`).
- **Instant Quick Verify Bar**: Paste or test a suspicious message or URL straight from the dashboard.
- **Interactive Analytics Charts**: 7-day / 14-day / 30-day scan trend charts (keyboard-accessible) and risk distribution breakdowns, plus one-click sample demos.

### 3. Scam Library & Cybersecurity Awareness Centre
- **20 Curated Real-World Scam Examples**: Organized across `Banking`, `UPI`, `Government`, `Delivery`, `Job`, `Financial`, and `Phishing` categories with search, category/risk filters, red-flag breakdowns, and **"Try in Analyzer"** simulation.
- **10-Question Awareness Quiz**: Practice distinguishing real alerts from scams with instant explanations, progress tracking, and ranks (`Beginner` → `Scam Detective`).
- **Red Flag Knowledge Centre**: Guides covering urgency traps, brand impersonation, UPI PIN inversion, digital arrest coercion, and official-domain verification.

### 4. Cyber Safety Center
- **Verified Official Indian Reporting Resources**:
  - **1930** — National Cyber Crime Helpline (financial cyber fraud)
  - **https://cybercrime.gov.in** — National Cyber Crime Reporting Portal
  - **112** — Emergency Police Helpline
  - **CERT-In** (`https://www.cert-in.org.in` / `1800-11-4949`) — Technical cybersecurity incident response
- **Post-Incident Action Steps**, everyday digital hygiene checklists, and common scam playbooks.

### 5. Session-Isolated Scan History & Dark Mode
- **Per-Session SQLite History**: Search, filter by risk level or mode, inspect full saved reports, delete entries, or opt out of saving individual scans.
- **Theme Support**: Persistent Light and Dark themes (`Settings` or header toggle) respecting system preference.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Motion
- **Backend**: Node.js, Express 4 (`server.ts`)
- **Database**: Node built-in SQLite (`node:sqlite` `DatabaseSync` in WAL mode)
- **Testing**: Node.js built-in test runner (`node --test`)

---

## Project Structure

```text
.
├── server.ts                       # Express app factory, security middleware, API routes, Vite/static serving
├── server/
│   ├── db.ts                       # SQLite schema, transactions, history & awareness persistence
│   └── detection/
│       ├── engine.ts               # Unified message/URL pipeline & PII masking
│       ├── messageAnalyzer.ts      # Pre-compiled pattern matching, X-Ray spans, channel guidance
│       ├── urlAnalyzer.ts          # URL anatomy parser & phishing/typosquat heuristics
│       ├── riskScoring.ts          # Weighted risk calculation & tier mapping
│       ├── recommendations.ts      # Actionable safety advice generator
│       └── samples.ts              # Built-in demo samples (scam & legitimate)
├── src/
│   ├── App.tsx                     # Root state, view navigation, accessibility skip-link
│   ├── main.tsx                    # Entry point wrapped in ErrorBoundary
│   ├── api/scamshield.ts           # Typed API client with session token & safe JSON parsing
│   ├── components/                 # Dashboard, Analyzer, ResultsPanel, ScamLibrary, SafetyCenter, History, Settings
│   ├── data/                       # Scam Library (20 items), Quiz (10 items), Red Flag Guide, Safety Center
│   ├── types/scamshield.ts         # Shared TypeScript interfaces
│   └── utils/                      # Analytics helpers, theme storage, shared risk badge styles
├── tests/
│   └── scamshield.test.ts          # End-to-end API, detection, security, and data integrity tests
├── index.html
├── metadata.json
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites
- **Node.js 22.13+** (required for built-in `node:sqlite` and native TypeScript stripping in tests)
- **npm**

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` if running locally and adjust optional variables as needed:

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | HTTP port for Express + Vite (defaults to `3000`). |
| `SESSION_SECRET` | No | Secret for HMAC-SHA256 session cookie signing (min 16 chars; auto-generated per boot if omitted). |
| `FORCE_SECURE_COOKIE` | No | Set to `true` behind TLS proxies that terminate HTTPS before Express. |
| `APP_URL` | No | Public application URL when deployed. |
| `GEMINI_API_KEY` | No | Optional runtime key defined in `.env.example`. |

### Running Locally

- **Development mode** (Express API + Vite middleware on port `3000`):
  ```bash
  npm run dev
  ```
- **Production build & start**:
  ```bash
  npm run build
  NODE_ENV=production npm start
  ```

---

## Verification & Testing

Run the TypeScript compiler check, production bundle build, and automated test suite:

```bash
# Type check
npm run lint

# Production build
npm run build

# Automated test suite (11 test suites)
NODE_ENV=production node --test --test-force-exit tests/scamshield.test.ts
```

---

## API Overview

All mutating endpoints (`POST`, `DELETE`) enforce same-origin checks, require `X-Requested-With: ScamShield`, and are protected by a sliding-window rate limiter (`60` requests/minute by default).

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check (`{ status: "ok" }`). |
| `GET` | `/api/samples` | Returns built-in demo messages. |
| `POST` | `/api/analyze/message` | Analyses `{ message, channel, saveToHistory }`. |
| `POST` | `/api/analyze/url` | Analyses `{ url, saveToHistory }`. |
| `GET` | `/api/history` | Lists redacted scan history for the current session. |
| `DELETE` | `/api/history/:id` | Deletes a single history entry owned by the session. |
| `DELETE` | `/api/history` | Clears all history entries for the session. |
| `GET` | `/api/awareness` | Retrieves explored Scam Library examples and quiz scores. |
| `POST` | `/api/awareness/example` | Records an explored Scam Library example (`{ exampleId, category }`). |
| `POST` | `/api/awareness/quiz` | Records a quiz score (`0–100`). |

---

## Security & Privacy Design

- **PII Redaction Before Storage**: Sensitive digits—including card numbers, Aadhaar numbers, PAN numbers, and phone numbers—are masked (`maskSensitiveDigits`) before scan previews or history records are written to SQLite.
- **Session Isolation**: Each browser session receives an HMAC-SHA256 signed `HttpOnly` cookie (`scamshield_sid`) and bearer token fallback; history and quiz progress are strictly scoped per session (capped at 250 history records per session).
- **Hardened HTTP Responses**: Sets `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy`, and `X-Permitted-Cross-Domain-Policies: none`, disables `X-Powered-By`, limits JSON payloads to `32kb`, and returns structured JSON `400`/`403`/`404`/`429` responses.
