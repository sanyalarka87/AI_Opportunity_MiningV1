# To Do Activities
## Agentic AI Opportunity Mining Platform — Product Development

**Source:** [BRD.md](../BRD.md), [Implementation-Plan.md](Implementation-Plan.md)  
**Convention:** Phase, Priority (P0/P1/P2), Dependency

---

## Phase 1: Executive Dashboard MVP

### Project setup

| # | Title | Description | Priority | Dependency |
|---|--------|--------------|----------|------------|
| 1.1 | Repository and app scaffold | Create repo; initialize React + TypeScript app; configure build and lint | P0 | — |
| 1.2 | State and charting stack | Set up Redux and/or React Query; add D3 and/or Recharts | P0 | 1.1 |
| 1.3 | Backend service skeleton | Create Node.js or Python microservice(s) for dashboard; health check and API gateway wiring | P0 | 1.1 |

### Dashboard backend

| # | Title | Description | Priority | Dependency |
|---|--------|--------------|----------|------------|
| 1.4 | Dashboard metrics API | Implement API for org, opportunity, cost/utilization, trend metrics; support filters (LOB, time, geography, segment) | P0 | 1.3 |
| 1.5 | Stub or real metrics data | Provide stub or real data for total members, revenue, medical cost, MLR, PMPM, opportunity counts, utilization, rolling trends | P0 | 1.4 |

### Dashboard UI

| # | Title | Description | Priority | Dependency |
|---|--------|--------------|----------|------------|
| 1.6 | Dashboard layout | Implement executive dashboard layout (KPI cards, chart areas, filter bar) | P0 | 1.2 |
| 1.7 | Filters (LOB, time, geography, segment) | Implement filter UI and wire to metrics API | P0 | 1.4, 1.6 |
| 1.8 | Dynamic charts | Render org, opportunity, cost/utilization, and trend charts with D3/Recharts; apply filters | P0 | 1.6, 1.7 |
| 1.9 | Drill-down | Add interactive drill-down from summary to detail where specified in BRD | P1 | 1.8 |

### Prompt library and AI

| # | Title | Description | Priority | Dependency |
|---|--------|--------------|----------|------------|
| 1.10 | Pre-packaged prompt library UI | Implement prompt list by category (Financial & Revenue, Opportunity Discovery, Provider & Population, Executive Summary); execution panel | P0 | 1.6 |
| 1.11 | Wire prompts to Executive/Insight agent | Connect prompt execution to Executive Insight Agent or stub; display result in panel or chat | P0 | 1.10, backend agent stub |
| 1.12 | AI chat overlay | Implement chat overlay on dashboard; same agent/stub as prompt execution | P0 | 1.11 |
| 1.13 | Prompt execution panel | Ensure prompt execution panel shows request and response; loading and error states | P0 | 1.10 |

### Export and NFR

| # | Title | Description | Priority | Dependency |
|---|--------|--------------|----------|------------|
| 1.14 | Export to PPT/PDF | Add export action; integrate client library and backend support for PPT and PDF generation | P1 | 1.8 |
| 1.15 | Dashboard load &lt; 3s | Optimize API and frontend so dashboard load meets &lt; 3 seconds | P0 | 1.4, 1.8 |
| 1.16 | RBAC baseline | Implement role-based access control for dashboard and prompt execution | P0 | 1.3 |
| 1.17 | Audit logging baseline | Log sensitive actions (e.g., prompt execution, export) to audit log | P0 | 1.3 |

---

## Phase 2: Opportunity Management

### Data and API

| # | Title | Description | Priority | Dependency |
|---|--------|--------------|----------|------------|
| 2.1 | Opportunity data model and API | Define and implement Opportunity entity (confidence, savings, complexity, status); CRUD API | P0 | Phase 1 backend |
| 2.2 | Opportunity list and filters | API and UI: list opportunities with filters and search | P0 | 2.1 |

### UI and review

| # | Title | Description | Priority | Dependency |
|---|--------|--------------|----------|------------|
| 2.3 | Opportunity dashboard (table/cards) | Display list with confidence score, estimated savings, implementation complexity, status | P0 | 2.2 |
| 2.4 | Opportunity review and explainability | Explainability view, supporting analytics, AI-generated rationale per opportunity | P0 | 2.1, Agent/analytics |
| 2.5 | What-if scenario analysis | Interactive prompt-driven simulations; financial projections via simulation API | P0 | 2.1, Scenario/analytics |

### Agents and workflow

| # | Title | Description | Priority | Dependency |
|---|--------|--------------|----------|------------|
| 2.6 | QnA Agent in opportunity context | Users can ask clarifications about assumptions, ROI, risks, dependencies for selected opportunity | P0 | 2.1, QnA Agent |
| 2.7 | Approval workflow | Approve/decline actions; status transitions; audit log for each change | P0 | 2.1 |
| 2.8 | Opportunity modification | Text-based AI editing of opportunity fields; option to re-run opportunity mining | P1 | 2.1, Opportunity Miner Agent |
| 2.9 | Opportunity creation via Planner | Planner Agent chat interface; guided opportunity generation; persist new opportunity | P0 | 2.1, Planner Agent |

### Lifecycle and collaboration

| # | Title | Description | Priority | Dependency |
|---|--------|--------------|----------|------------|
| 2.10 | Version history | Track and display opportunity version history | P1 | 2.1 |
| 2.11 | Tagging and categorization | Add tags and categories to opportunities; filter by them | P1 | 2.1 |
| 2.12 | Collaboration notes | Allow users to add and view collaboration notes on opportunities | P1 | 2.1 |

---

## Phase 3: AI Segmentation

### Population and segments

| # | Title | Description | Priority | Dependency |
|---|--------|--------------|----------|------------|
| 3.1 | Population metrics API and UI | Total members, risk distribution, cost distribution, utilization patterns; filters | P0 | Phase 1, Analytics Engine |
| 3.2 | Segmentation pipeline/service | AI-generated segments; segment profiles, risk characteristics, cost drivers, intervention opportunities | P0 | 3.1 |
| 3.3 | Segment visualization and cluster comparison | UI to visualize segments and compare clusters | P0 | 3.2 |

### Segment interaction

| # | Title | Description | Priority | Dependency |
|---|--------|--------------|----------|------------|
| 3.4 | Segment explainability | Why segment exists, key features, behavioral patterns (Segmentation Analyzer Agent) | P0 | 3.2 |
| 3.5 | Segment QnA Agent | Interactive queries about risk drivers, cost levers, care gaps for selected segment | P0 | 3.2 |
| 3.6 | Opportunity discovery per segment | Predefined prompt: analyze relevant opportunities for selected segment; integrate with Opportunities | P0 | 3.2, Phase 2 opportunities |

### Reporting

| # | Title | Description | Priority | Dependency |
|---|--------|--------------|----------|------------|
| 3.7 | Trend tracking | Segment and population trend over time | P1 | 3.1, 3.2 |
| 3.8 | Export reports | Export segment and population reports (e.g., PDF) | P1 | 3.3 |

---

## Phase 4: Advanced Scenario Planning

| # | Title | Description | Priority | Dependency |
|---|--------|--------------|----------|------------|
| 4.1 | Scenario Planning Agent design and integration | Design and integrate Scenario Planning Agent with tools and Analytics Engine | P0 | Phases 1–3 |
| 4.2 | Scenario simulation API and UI | API for scenario runs; UI for configuration and results; financial projections | P0 | 4.1 |
| 4.3 | Decision support flows | Link scenario planning to opportunities and segments (e.g., from dashboard and opportunity what-if) | P1 | 4.2, Phase 2, Phase 3 |

---

## Phase 5: Enterprise Integrations

| # | Title | Description | Priority | Dependency |
|---|--------|--------------|----------|------------|
| 5.1 | Claims data ingestion pipeline and APIs | Ingest claims data; normalize and expose via APIs for Analytics Engine | P0 | Phases 1–4 |
| 5.2 | EHR integration | Integrate with EHR per contract; auth and data mapping | P1 | 5.1 |
| 5.3 | Quality reporting systems integration | Connect to quality reporting systems for measures and gaps | P0 | Phase 1 metrics |
| 5.4 | External analytics integration | API contracts and security (auth, rate limits, data handling) for external analytics tools | P1 | Phase 1 |

---

## Cross-cutting

### Security and compliance

| # | Title | Description | Priority | Dependency |
|---|--------|--------------|----------|------------|
| CC.1 | HIPAA compliance | Encryption (transit and at rest), access control, BAA considerations, PHI handling | P0 | All phases |
| CC.2 | RBAC and audit logging across modules | Extend RBAC and audit to opportunities, segments, agents, exports | P0 | Phase 1 RBAC/audit baseline |

### Performance and scale

| # | Title | Description | Priority | Dependency |
|---|--------|--------------|----------|------------|
| CC.3 | AI response &lt; 5s | Optimize agent orchestration, tool use, and Analytics Engine for AI response target | P0 | Agent integration |
| CC.4 | Multi-tenant and horizontal scaling | Multi-tenant data and config; horizontal scaling of API and AI services | P1 | Backend design |

### Quality and delivery

| # | Title | Description | Priority | Dependency |
|---|--------|--------------|----------|------------|
| CC.5 | Testing (unit, integration, E2E) | Add unit tests for critical paths; integration tests for APIs and agents; E2E for main flows | P0 | Per phase |
| CC.6 | Documentation and deployment | Maintain API and runbook docs; deployment automation (CI/CD) for dev/staging/prod | P1 | Per phase |

---

*End of To Do Activities. Use this list for sprint planning and issue tracking.*
