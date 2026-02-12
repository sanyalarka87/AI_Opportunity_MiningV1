# AI Opportunity Mining Platform

Enterprise-grade AI-powered platform for US healthcare payer executives to identify, analyze, and operationalize margin improvement opportunities.

## Phase 1: Executive Dashboard MVP (Complete)

Phase 1 delivers the executive dashboard with metrics, filters, charts, prompt library, AI chat overlay, export, and baseline RBAC/audit.

### Run locally

**Option A – Two terminals (recommended on Windows)**

1. **Backend** (port 3001):
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend** (port 3000, proxies /api to backend):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open **http://localhost:3000** in your browser.

**Option B – From repo root (Unix-style shell)**

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

### Build for production

```bash
npm run build
```

Serves frontend from `frontend/dist`. Run the backend separately (e.g. `cd backend && npm start`).

### Phase 1 features

- **Dashboard:** Organizational, opportunity, cost/utilization, and trend metrics (stub data).
- **Filters:** Line of Business, time period, geography, population segment.
- **Charts:** Rolling 12‑month MLR/PMPM (Recharts); predictive forecast.
- **Drill-down:** Click KPIs (e.g. members, revenue, MLR) for detail.
- **Prompt library:** Financial & Revenue, Opportunity Discovery, Provider & Population, Executive Summary; run prompts and see results in the execution panel.
- **AI chat overlay:** Same stub agent as prompt execution.
- **Export:** PDF and PPT from the UI; backend records export for audit.
- **RBAC:** `X-User-Id` and `X-User-Role` headers (default: demo-user, executive).
- **Audit:** Prompt execution and export logged; `GET /api/audit` to read.

### Docs

- [BRD](BRD.md) – Product requirements  
- [docs/](docs/) – Software specification, implementation plan, to-do activities  

## Tech stack

- **Frontend:** React 18, TypeScript, Vite, Redux Toolkit, React Query, Recharts, jspdf, pptxgenjs  
- **Backend:** Node.js, Express, CORS  
- **Deployment:** Cloud-ready (HIPAA considerations in later phases)
