# 🏀 Sports Yeti — Development Tasks (Actionable Plan vNext)

This plan aligns with the current scope and design standards: NFRs/SLOs, API standards (RFC7807, idempotency, cursor pagination, rate limiting), SSE for real-time, distributed tracing, multi-tenancy, payments robustness with reconciliation, and audit logging.

## Assumptions and Constraints
- Backend: Laravel 11, Postgres, Redis, Horizon, S3, Stripe. Observability with OpenTelemetry, structured logs, RED/USE metrics. Realtime via SSE for MVP.
- Frontend: React Native Web (admin) and Expo RN (mobile). Push via Expo.
- Constraint: 21-week MVP; team of 3–5 engineers spanning API/Web/Mobile/DevOps.
- Security/Privacy: OWASP ASVS L2 baseline; GDPR/CCPA-aligned data handling and DSR flows.

## Task Key
- Effort: S (≤1 day), M (2–3 days), L (4–6 days)
- Owner/Role: API, Web, Mobile, DevOps, QA, Sec, PM, Tech Lead

## Phase 0 — Discovery & Planning (Week 0)
| ID | Task | Description | Deliverables | Dependencies | Effort | Owner | Success Criteria |
|---|---|---|---|---|---|---|---|
| P0-1 | Confirm MVP cut-lines | Validate scope vs. NFRs; finalize “in vs out” | Signed MVP scope note | None | S | PM, Tech Lead | Approved scope with risks noted |
| P0-2 | Architecture review | Validate API standards, SSE, tracing, multi-tenancy, payments | Updated diagrams/notes | P0-1 | S | Tech Lead | Sign-off by API/Web/Mobile leads |
| P0-3 | Delivery plan | Sprint plan, milestones, error budget policy | Roadmap & OKRs | P0-1 | S | PM | Published roadmap with owners |

## Phase 1 — Foundation & Observability (Weeks 1–2)
| ID | Task | Description | Deliverables | Dependencies | Effort | Owner | Success Criteria |
|---|---|---|---|---|---|---|---|
| F1-1 | CI/CD setup | Trunk-based, protected branches, preview envs | CI pipeline, preview env | P0-3 | M | DevOps | Green CI; auto previews |
| F1-2 | Env & secrets | Secrets in KMS/SM; env segregation | Secret store, rotation policy | F1-1 | S | DevOps | No secrets in repo; rotation tested |
| F1-3 | Observability baseline | OTel tracing, JSON logs, RED metrics, dashboards | APM traces, dashboards | F1-1 | M | DevOps | Traces/metrics visible; SLO charts |
| F1-4 | SLOs & alerts | Define SLIs/SLOs; alerting & runbooks | SLO doc, alert rules, runbooks | F1-3 | S | DevOps | Alerts fire in tests; runbooks ready |
| F1-5 | API scaffolding | v1 namespace, RFC7807 error model | Base Laravel project + middleware | F1-1 | M | API | Lints/tests pass; healthcheck green |

## Phase 2 — Core Domain & Security (Weeks 2–4)
| ID | Task | Description | Deliverables | Dependencies | Effort | Owner | Success Criteria |
|---|---|---|---|---|---|---|---|
| D2-1 | Auth (JWT + refresh) | Short-lived JWT, rotating refresh | Auth endpoints + tests | F1-5 | M | API | p95 <300ms; tests green |
| D2-2 | RBAC/ABAC | Roles/permissions middleware & policies | Policy layer + unit tests | D2-1 | S | API | Deny-by-default enforced |
| D2-3 | Multi-tenancy guard | league_id scoping and query guards | Tenant filter utilities | D2-2 | S | API | All tenant entities require league_id |
| D2-4 | Audit logging | Immutable audit events | Append-only audit sink | D2-2 | M | API | Admin actions logged with trace_id |
| D2-5 | Rate limiting & WAF | Per-IP and per-user tiers + 429s | Rate limit configs + tests | F1-5 | S | API | Load shows graceful 429s |

## Phase 3 — League, Teams, Players (Weeks 4–6)
| ID | Task | Description | Deliverables | Dependencies | Effort | Owner | Success Criteria |
|---|---|---|---|---|---|---|---|
| L3-1 | League CRUD | Admin leagues with stats baseline | Endpoints + repo tests | D2-3 | M | API | CRUD + pagination + Problem+JSON |
| L3-2 | Team mgmt | Create/assign captain, roster mgmt | Endpoints + factories | L3-1 | M | API | Invite/attach/detach covered |
| L3-3 | Player profile | Profiles, privacy toggle, discovery | Endpoints + filters | D2-3 | M | API | Search by name/level/status |
| L3-4 | Web admin UI | League/team/player management UI | RN Web screens | L3-1..3 | L | Web | Admin flows pass E2E |

## Phase 4 — Facility & Booking (Weeks 6–8)
| ID | Task | Description | Deliverables | Dependencies | Effort | Owner | Success Criteria |
|---|---|---|---|---|---|---|---|
| B4-1 | Facility & spaces | Facility registration, spaces | Endpoints + schema | L3-1 | M | API | CRUD + validation done |
| B4-2 | Availability & conflict | Time-window checks + indices | Conflict detection service | B4-1 | M | API | Double-booking unit tests |
| B4-3 | Booking API (idempotent) | POST book with Idempotency-Key | Endpoint + tests | B4-2, P5-1 | L | API | Safe retries return same result |
| B4-4 | QR generation & verify | Booking QR codes + check-in | QR service + endpoints | B4-3 | S | API | Scan success <1s; audited |
| B4-5 | Admin booking UI | Calendar view, create/modify | Web screens + E2E | B4-2 | L | Web | Reschedule & conflict guards |

## Phase 5 — Payments & Reconciliation (Weeks 6–9)
| ID | Task | Description | Deliverables | Dependencies | Effort | Owner | Success Criteria |
|---|---|---|---|---|---|---|---|
| P5-1 | Stripe integration | SDK, envs, error handling | Service + sandbox config | F1-2, F1-5 | M | API | Test charges succeed |
| P5-2 | Webhooks (HMAC + replay) | Signed, timestamped, replay-safe | Webhook handler + tests | P5-1 | M | API | Invalid sig rejected; retries OK |
| P5-3 | Idempotent charges | Idempotency-Key and dedupe | Payments API + storage | P5-1 | S | API | Duplicate POST returns original |
| P5-4 | Refunds & receipts | Refund endpoint + docs | Refund API + emails | P5-1 | S | API | Refund path tested E2E |
| P5-5 | Reconciliation job | Nightly compare charges/payouts | Job + mismatch report | P5-2 | M | API, DevOps | Alert on mismatches; dashboard |

## Phase 6 — Games & Chat (Weeks 9–11)
| ID | Task | Description | Deliverables | Dependencies | Effort | Owner | Success Criteria |
|---|---|---|---|---|---|---|---|
| G6-1 | Game schedule | Create/assign, basic status | Endpoints + repo | L3-2, B4-1 | M | API | Conflict checks enforced |
| G6-2 | Chat (SSE MVP) | Game/team chat via SSE | Stream endpoints + heartbeats | F1-3 | L | API | Reconnect works; no buffering |
| G6-3 | Polls in chat | Attendance polls | Poll API + UI | G6-2 | M | API, Web | Vote path works; audit logs |
| G6-4 | Notifications | Reminders, chat notifications | Expo + email delivery | D2-1 | M | API | Delivery tracked, opt-outs |

## Phase 7 — Mobile App (Weeks 11–14)
| ID | Task | Description | Deliverables | Dependencies | Effort | Owner | Success Criteria |
|---|---|---|---|---|---|---|---|
| M7-1 | App scaffolding | Expo app, nav, theming | App shell + nav | F1-1 | M | Mobile | Builds on iOS/Android |
| M7-2 | Auth flows | Login/registration, token storage | Screens + API client | D2-1 | M | Mobile | E2E login passes |
| M7-3 | Facilities & booking | Browse, book, QR scanner | Screens + flows | B4-3, B4-4 | L | Mobile | Booking E2E passes |
| M7-4 | Game schedule & chat | Schedule list, chat SSE | Screens + SSE client | G6-1, G6-2 | L | Mobile | Live updates reliable |
| M7-5 | Mobile observability | traceparent, crash reporting | Instrumentation | F1-3 | S | Mobile | Traces link to backend |

## Phase 8 — Admin Web (Weeks 14–17)
| ID | Task | Description | Deliverables | Dependencies | Effort | Owner | Success Criteria |
|---|---|---|---|---|---|---|---|
| W8-1 | League dashboard | Stats, activity, quick actions | Dashboard screens | L3-1..3 | M | Web | Charts and filters work |
| W8-2 | Booking calendar | Calendar with drag/reschedule | Calendar screens | B4-5 | L | Web | Conflict checks on drag |
| W8-3 | Payments mgmt | History, refunds, reports | Payments screens | P5-4, P5-5 | M | Web | Refunds initiated; exports |
| W8-4 | Audit log views | Filter/search, details, trace copy | Audit UI | D2-4 | M | Web | Entries visible and scoped |

## Phase 9 — Hardening, Testing, Launch (Weeks 17–21)
| ID | Task | Description | Deliverables | Dependencies | Effort | Owner | Success Criteria |
|---|---|---|---|---|---|---|---|
| H9-1 | Performance & load | k6/Gatling tests for top flows | Reports + fixes | All core APIs | M | QA, API | Meets SLOs at target RPS |
| H9-2 | Chaos/fault tests | Inject failures (Stripe/DB) | Test results + remediations | F1-4 | M | DevOps | Retries/backoff verified |
| H9-3 | Backup/restore drill | Validate RPO/RTO | Runbook + proof | DevOps env | S | DevOps | RPO ≤15m, RTO ≤2h met |
| H9-4 | Security review | OWASP/ASVS, secrets, RBAC | Findings + fixes | All | M | Sec, API | Highs resolved |
| H9-5 | Operational readiness | Runbooks, on-call, dashboards | OR checklist | F1-4 | S | DevOps | Gate signed |
| H9-6 | Pilot launch | Enable pilot league | Release notes | All | S | PM | Green metrics post-launch |

## Dependency Mapping (selected)
- F1-3 → F1-4 → SSE/Tracing tasks (G6-2, M7-5)
- D2-1 → D2-2 → D2-3 → D2-4
- L3-1 → L3-2 → G6-1; L3-3 → W8-1
- B4-1 → B4-2 → B4-3 → B4-4 → M7-3/W8-2
- P5-1 → P5-2 → P5-5; P5-1 → P5-3 → P5-4 → W8-3
- G6-2 → G6-3 → G6-4 → M7-4

## Suggested Execution Order (by sprint)
- Sprint 1–2: F1-1..F1-5, D2-1..D2-3
- Sprint 3–4: L3-1..L3-3, B4-1..B4-2, P5-1..P5-2
- Sprint 5–6: B4-3..B4-4, P5-3..P5-5, G6-1..G6-2
- Sprint 7–8: G6-3..G6-4, M7-1..M7-3, W8-1
- Sprint 9–10: M7-4..M7-5, W8-2..W8-4
- Sprint 11: H9-1..H9-6

## Risks, Blockers, Optimizations
- Risks: Payment/webhook reliability, double-booking edge cases, SSE proxy buffering, mobile store delays.
- Mitigations: Idempotency + reconciliation; indices + conflict queries; heartbeat + no-buffering headers; early TestFlight builds.
- Optimizations: Parallelize Web/Mobile UIs after API contracts; use feature flags for dark launches; start reconciliation early.

## Validation Checklist
- [x] SLOs defined and alerting live (F1-4) — `slo-definitions.md` + Prometheus config
- [x] Idempotency enforced for bookings and payments (B4-3, P5-3) — Implemented in controllers
- [x] Webhooks signed and replay-protected (P5-2) — `WebhookController` with HMAC verification
- [x] Reconciliation jobs and dashboards in place (P5-5) — `ReconcilePaymentsJob`
- [x] SSE heartbeats and reconnect strategy verified (G6-2) — `ChatController::stream()` with heartbeats
- [x] Tracing spans across HTTP, DB, Stripe, queues (F1-3) — OpenTelemetry + TraceRequest middleware
- [x] Audit logs exposed in admin (D2-4, W8-4) — `AuditController` + `AuditLogScreen`
- [x] Runbooks documented (H9-5) — 4 runbooks in `docs/runbooks/`
- [ ] Backup/restore drill completed (H9-3) — Requires production environment
- [ ] Load/chaos tests passed within SLOs (H9-1, H9-2) — Requires runtime environment
- [ ] Pilot launch criteria met and monitored (H9-6) — Pending launch

## Current Status (Updated Feb 2026)

### Completed Phases
- ✅ Phase 0: Discovery & Planning
- ✅ Phase 1: Foundation & Observability (CI/CD, OTel, Prometheus, SLOs)
- ✅ Phase 2: Core Domain & Security (Auth, RBAC, Multi-tenancy, Audit)
- ✅ Phase 3: League, Teams, Players (API + Admin UI)
- ✅ Phase 4: Facility & Booking (API + Admin UI)
- ✅ Phase 5: Payments & Reconciliation (API + Admin UI)
- ✅ Phase 6: Games & Chat (API with SSE)
- ✅ Phase 7: Mobile App (All screens, SSE chat, QR scanner, Sentry)
- ✅ Phase 8: Admin Web (Dashboard, leagues, teams, players, facilities, bookings, payments, audit)

### In Progress
- 🔄 Phase 9: Hardening & Launch
  - ✅ API test coverage expanded (17 feature test files)
  - ✅ CI config fixed (PostgreSQL)
  - ✅ Production deployment workflow
  - ✅ Operational runbooks
  - ⬜ Performance/load testing (requires runtime)
  - ⬜ Chaos/fault testing (requires runtime)
  - ⬜ Security review (requires runtime)
  - ⬜ Backup/restore drill (requires production env)
  - ⬜ Pilot launch

# 🏀 Sports Yeti - Development Tasks
## Spec-Driven Development Task Breakdown

---

## ✅ Actionable Project Plan (vNext)

This section supersedes prior task breakdowns. It aligns with the latest `scope.md` and `design.md` (NFRs/SLOs, API standards, SSE real-time, tracing, multi-tenancy, payments robustness, audit logging).

### Assumptions and Constraints
- Backend: Laravel 11, Postgres, Redis, S3, Stripe; Observability: OTel, structured logs, metrics; Realtime: SSE for MVP.
- Frontend: RN Web (admin) and Expo RN (mobile); push via Expo.
- Constraint: 21-week MVP window; small team (API, Web, Mobile, DevOps shared across 3–5 engineers).
- Compliance: OWASP ASVS L2 baseline; GDPR/CCPA-aligned privacy flows.

### Task Key
- Effort: S (≤1d), M (2–3d), L (4–6d)
- Owner/Role: API, Web, Mobile, DevOps, QA

### Task Table by Phase

#### Phase 0 – Discovery & Planning (Week 0)
| ID | Task | Description | Deliverables | Dependencies | Effort | Owner | Success Criteria |
|---|---|---|---|---|---|---|---|
| P0-1 | Confirm MVP cut-lines | Validate scope vs. NFRs; finalize “in vs out” | Signed MVP scope note | None | S | PM, Tech Lead | Approved scope with risks noted |
| P0-2 | Architecture review | Validate API standards, SSE, tracing, multi-tenancy, payments | Updated design diagrams | P0-1 | S | Tech Lead | Sign-off by API/Web/Mobile leads |
| P0-3 | Delivery plan | Sprint plan, milestones, error budget policy | Roadmap & OKRs | P0-1 | S | PM | Published roadmap with owners |

#### Phase 1 – Foundation & Observability (Weeks 1–2)
| ID | Task | Description | Deliverables | Dependencies | Effort | Owner | Success Criteria |
|---|---|---|---|---|---|---|---|
| F1-1 | CI/CD setup | Trunk-based, protected branches, preview envs | CI pipeline, preview env | P0-3 | M | DevOps | Green CI; auto previews |
| F1-2 | Env & secrets | Secrets in KMS/SM; env segregation | Secret store, rotation policy | F1-1 | S | DevOps | No secrets in repo; rotation tested |
| F1-3 | Observability baseline | OTel tracing, JSON logs, RED metrics, dashboards | APM traces, Grafana/Datadog dashboards | F1-1 | M | DevOps | Traces and metrics visible; SLOs set |
| F1-4 | SLOs & alerts | Define SLIs/SLOs; alerting & runbooks | SLO doc, alert rules, runbooks | F1-3 | S | DevOps | Alerts tested; burn-rate alerts fire |
| F1-5 | API scaffolding | v1 namespace, error model (RFC7807) | Base Laravel project + middleware | F1-1 | M | API | Lints/tests pass; healthcheck green |

#### Phase 2 – Core Domain & Security (Weeks 2–4)
| ID | Task | Description | Deliverables | Dependencies | Effort | Owner | Success Criteria |
|---|---|---|---|---|---|---|---|
| D2-1 | Auth (JWT + refresh) | Short-lived JWT, rotating refresh | Auth endpoints + tests | F1-5 | M | API | p95 <300ms; tests green |
| D2-2 | RBAC/ABAC | Roles/permissions middleware & policies | Policy layer + unit tests | D2-1 | S | API | Deny-by-default enforced |
| D2-3 | Multi-tenancy guard | league_id scoping and query guards | Tenant filter utilities | D2-2 | S | API | All tenant entities require league_id |
| D2-4 | Audit logging | Immutable audit events | Append-only audit sink | D2-2 | M | API | Admin actions logged with trace_id |
| D2-5 | Rate limiting & WAF rules | Per-IP and per-user tiers + 429s | Rate limit configs, tests | F1-5 | S | API | Load test shows graceful 429 |

#### Phase 3 – League, Teams, Players (Weeks 4–6)
| ID | Task | Description | Deliverables | Dependencies | Effort | Owner | Success Criteria |
|---|---|---|---|---|---|---|---|
| L3-1 | League CRUD | Admin leagues with stats baseline | Endpoints + repo tests | D2-3 | M | API | CRUD + pagination + Problem+JSON |
| L3-2 | Team mgmt | Create/assign captain, roster mgmt | Endpoints + factories | L3-1 | M | API | Invite/attach/detach covered |
| L3-3 | Player profile | Profiles, privacy toggle, discovery | Endpoints + filters | D2-3 | M | API | Search by name/level/status |
| L3-4 | Web admin UI | League/team/player management UI | RN Web screens | L3-1..3 | L | Web | Admin flows pass E2E |

#### Phase 4 – Facility & Booking (Weeks 6–8)
| ID | Task | Description | Deliverables | Dependencies | Effort | Owner | Success Criteria |
|---|---|---|---|---|---|---|---|
| B4-1 | Facility & spaces | Facility registration, spaces | Endpoints + schema | L3-1 | M | API | CRUD + validation done |
| B4-2 | Availability & conflict | Time window checks + indices | Conflict detection service | B4-1 | M | API | Double-booking unit tests |
| B4-3 | Booking API (idempotent) | POST book with Idempotency-Key | Endpoint + tests | B4-2, P5-1 | L | API | Safe retries return same result |
| B4-4 | QR generation & verify | Booking QR codes + check-in | QR service + endpoints | B4-3 | S | API | Scan success <1s; logged |
| B4-5 | Admin booking UI | Calendar view, create/modify | Web screens + E2E | B4-2 | L | Web | Reschedule & conflict guards |

#### Phase 5 – Payments & Reconciliation (Weeks 6–9)
| ID | Task | Description | Deliverables | Dependencies | Effort | Owner | Success Criteria |
|---|---|---|---|---|---|---|---|
| P5-1 | Stripe integration | SDK, envs, error handling | Service + sandbox config | F1-2, F1-5 | M | API | Test charges succeed |
| P5-2 | Webhooks (HMAC + replay) | Signed, timestamped, replay-safe | Webhook handler + tests | P5-1 | M | API | Invalid sig rejected; retries OK |
| P5-3 | Idempotent charges | Idempotency-Key and dedupe | Payments API + storage | P5-1 | S | API | Duplicate POST returns original |
| P5-4 | Refunds & receipts | Refund endpoint + docs | Refund API + emails | P5-1 | S | API | Refund path tested E2E |
| P5-5 | Reconciliation job | Nightly compare charges/payouts | Job + mismatch report | P5-2 | M | API, DevOps | Alert on mismatches; dashboard |

#### Phase 6 – Games & Chat (Weeks 9–11)
| ID | Task | Description | Deliverables | Dependencies | Effort | Owner | Success Criteria |
|---|---|---|---|---|---|---|---|
| G6-1 | Game schedule | Create/assign, basic status | Endpoints + repo | L3-2, B4-1 | M | API | Conflict checks enforced |
| G6-2 | Chat (SSE MVP) | Game/team chat via SSE | Endpoints + stream | F1-3 | L | API | Heartbeats, reconnect support |
| G6-3 | Polls in chat | Attendance polls | Poll API + UI | G6-2 | M | API, Web | Vote path works; audit logs |
| G6-4 | Notifications | Reminders, chat notifications | Expo + email delivery | D2-1 | M | API | Delivery tracked, opt-outs |

#### Phase 7 – Mobile App (Weeks 11–14)
| ID | Task | Description | Deliverables | Dependencies | Effort | Owner | Success Criteria |
|---|---|---|---|---|---|---|---|
| M7-1 | App scaffolding | Expo app, nav, theming | App shell + nav | F1-1 | M | Mobile | Builds on iOS/Android |
| M7-2 | Auth flows | Login/registration, token storage | Screens + API client | D2-1 | M | Mobile | E2E login passes |
| M7-3 | Facilities & booking | Browse, book, QR scanner | Screens + flows | B4-3, B4-4 | L | Mobile | Booking E2E passes |
| M7-4 | Game schedule & chat | Schedule list, chat SSE | Screens + SSE client | G6-1, G6-2 | L | Mobile | Live updates reliable |
| M7-5 | Mobile observability | traceparent, crash reporting | Instrumentation | F1-3 | S | Mobile | Traces link to backend |

#### Phase 8 – Admin Web (Weeks 14–17)
| ID | Task | Description | Deliverables | Dependencies | Effort | Owner | Success Criteria |
|---|---|---|---|---|---|---|---|
| W8-1 | League dashboard | Stats, activity, quick actions | Dashboard screens | L3-1..3 | M | Web | Charts and filters work |
| W8-2 | Booking calendar | Calendar with drag/reschedule | Calendar screens | B4-5 | L | Web | Conflict checks on drag |
| W8-3 | Payments mgmt | History, refunds, reports | Payments screens | P5-4, P5-5 | M | Web | Refunds initiated; exports |
| W8-4 | Audit log views | Filter/search, details, trace copy | Audit UI | D2-4 | M | Web | Entries visible and scoped |

#### Phase 9 – Hardening, Testing, Launch (Weeks 17–21)
| ID | Task | Description | Deliverables | Dependencies | Effort | Owner | Success Criteria |
|---|---|---|---|---|---|---|---|
| H9-1 | Performance & load | k6/Gatling tests for top flows | Reports + fixes | All core APIs | M | QA, API | Meets SLOs at target RPS |
| H9-2 | Chaos/fault tests | Inject failures (Stripe/DB) | Test results + remediations | F1-4 | M | DevOps | Retries/backoff verified |
| H9-3 | Backup/restore drill | Validate RPO/RTO | Runbook + proof | DevOps env | S | DevOps | RPO ≤15m, RTO ≤2h met |
| H9-4 | Security review | OWASP/ASVS, secrets, RBAC | Findings + fixes | All | M | Sec, API | Highs resolved |
| H9-5 | Operational readiness | Runbooks, on-call, dashboards | OR checklist | F1-4 | S | DevOps | Gate signed |
| H9-6 | Pilot launch | Enable pilot league | Release notes | All | S | PM | Green metrics post-launch |

### Dependency Mapping (selected)
- F1-3 → F1-4 → SSE/Tracing tasks (G6-2, M7-5)
- D2-1 → D2-2 → D2-3 → D2-4
- L3-1 → L3-2 → G6-1; L3-3 → W8-1
- B4-1 → B4-2 → B4-3 → B4-4 → M7-3/W8-2
- P5-1 → P5-2 → P5-5; P5-1 → P5-3 → P5-4 → W8-3
- G6-2 → G6-3 → G6-4 → M7-4

### Suggested Execution Order (by sprint)
- Sprint 1–2: F1-1..F1-5, D2-1..D2-3
- Sprint 3–4: L3-1..L3-3, B4-1..B4-2, P5-1..P5-2
- Sprint 5–6: B4-3..B4-4, P5-3..P5-5, G6-1..G6-2
- Sprint 7–8: G6-3..G6-4, M7-1..M7-3, W8-1
- Sprint 9–10: M7-4..M7-5, W8-2..W8-4
- Sprint 11: H9-1..H9-6

### Risks, Blockers, Optimizations
- Risks: Payment/webhook reliability, double-booking edge cases, SSE proxy buffering, mobile store delays.
- Mitigations: Idempotency + reconciliation; indices + conflict queries; heartbeat + no-buffering headers; early TestFlight builds.
- Optimizations: Parallelize Web/Mobile UIs after API contracts; use feature flags for dark launches; start reconciliation early.

### Validation Checklist
- [x] SLOs defined and alerting live (F1-4) — `slo-definitions.md` + Prometheus config
- [x] Idempotency enforced for bookings and payments (B4-3, P5-3) — Implemented
- [x] Webhooks signed and replay-protected (P5-2) — HMAC verification in WebhookController
- [x] Reconciliation jobs and dashboards in place (P5-5) — ReconcilePaymentsJob
- [x] SSE heartbeats and reconnect strategy verified (G6-2) — ChatController::stream()
- [x] Tracing spans across HTTP, DB, Stripe, queues (F1-3) — OpenTelemetry configured
- [x] Audit logs exposed in admin (D2-4, W8-4) — AuditController + AuditLogScreen
- [ ] Backup/restore drill completed (H9-3) — Requires production environment
- [ ] Load/chaos tests passed within SLOs (H9-1, H9-2) — Requires runtime environment
- [ ] Pilot launch criteria met and monitored (H9-6) — Pending launch


## 📋 Task Management Philosophy

This document follows **spec-driven development** principles, breaking down the Sports Yeti platform into actionable development tasks. Each task includes:

- **Clear Acceptance Criteria**: Specific requirements for completion
- **Dependencies**: Tasks that must be completed first
- **Time Estimates**: Realistic development timeframes
- **Testing Requirements**: What needs to be tested
- **Definition of Done**: Clear completion criteria

**Task Organization:**
- **Epics**: Major feature areas
- **Stories**: User-focused functionality
- **Tasks**: Technical implementation details
- **Sub-tasks**: Granular development work

---

## 🎯 MVP Development Tasks (21 Weeks)

### **Epic 1: Foundation & Authentication (Weeks 1-4)**

#### **Story 1.1: Project Setup & Infrastructure**
**Priority**: Critical  
**Estimate**: 1 week  
**Dependencies**: None

**Tasks:**
- [ ] **1.1.1**: Initialize Laravel 11 project with PostgreSQL
  - **Acceptance Criteria**: 
    - Laravel 11 project created with proper configuration
    - PostgreSQL database configured and connected
    - Basic environment setup (.env, .env.example)
    - Git repository initialized with proper .gitignore
  - **Time**: 1 day
  - **Testing**: Database connection test, basic Laravel installation test

- [ ] **1.1.2**: Set up development environment and tooling
  - **Acceptance Criteria**:
    - PHP 8.2+ installed and configured
    - Composer dependencies installed
    - Code quality tools configured (PHPStan, PHP CS Fixer)
    - IDE configuration files added
  - **Time**: 1 day
  - **Testing**: Code quality checks pass, development environment functional

- [ ] **1.1.3**: Configure testing environment
  - **Acceptance Criteria**:
    - PHPUnit configured with test database
    - Factory classes created for all models
    - Test helpers and utilities set up
    - CI/CD pipeline configuration started
  - **Time**: 2 days
  - **Testing**: All tests run successfully, test coverage reporting works

- [ ] **1.1.4**: Set up deployment infrastructure
  - **Acceptance Criteria**:
    - AWS/DigitalOcean account configured
    - Docker configuration for local development
    - Basic deployment scripts created
    - Environment-specific configurations
  - **Time**: 1 day
  - **Testing**: Local Docker environment works, deployment scripts functional

- [ ] **1.1.5**: Observability baseline and SLOs
  - **Acceptance Criteria**:
    - Structured JSON logging with `trace_id` and `league_id`
    - OpenTelemetry tracing for HTTP and queue workers
    - Prometheus metrics (RED) for top endpoints
    - Dashboards for latency, error rates, throughput; SLOs documented
  - **Time**: 2 days
  - **Testing**: Traces visible in APM; metrics scraped; synthetic checks alerting

#### **Story 1.2: User Authentication System**
**Priority**: Critical  
**Estimate**: 1 week  
**Dependencies**: 1.1

**Tasks:**
- [ ] **1.2.1**: Create User model and migration
  - **Acceptance Criteria**:
    - Users table with all required fields
    - User model with proper relationships
    - Factory for testing
    - Migration runs successfully
  - **Time**: 1 day
  - **Testing**: Migration test, model relationship tests, factory tests

- [ ] **1.2.2**: Implement JWT authentication
  - **Acceptance Criteria**:
    - JWT package installed and configured
    - Login endpoint returns valid JWT token
    - Token validation middleware works
    - Refresh token functionality
  - **Time**: 2 days
  - **Testing**: Authentication flow tests, token validation tests

- [ ] **1.2.3**: Create registration and login endpoints
  - **Acceptance Criteria**:
    - POST /api/v1/auth/register endpoint
    - POST /api/v1/auth/login endpoint
    - Email validation
    - Password hashing with bcrypt
  - **Time**: 1 day
  - **Testing**: Registration tests, login tests, validation tests

- [ ] **1.2.4**: Implement role-based authorization
  - **Acceptance Criteria**:
    - User roles enum defined
    - Permission system implemented
    - Authorization middleware created
    - Role assignment functionality
  - **Time**: 1 day
  - **Testing**: Authorization tests, role assignment tests

#### **Story 1.3: Player Profile System**
**Priority**: High  
**Estimate**: 1 week  
**Dependencies**: 1.2

**Tasks:**
- [ ] **1.3.1**: Create Player model and migration
  - **Acceptance Criteria**:
    - Players table with all required fields
    - Player model with user relationship
    - Factory for testing
    - Migration runs successfully
  - **Time**: 1 day
  - **Testing**: Migration test, model relationship tests

- [ ] **1.3.2**: Implement player profile endpoints
  - **Acceptance Criteria**:
    - GET /api/v1/players/{id} endpoint
    - PUT /api/v1/players/{id} endpoint
    - Profile privacy toggle functionality
    - Avatar upload capability
  - **Time**: 2 days
  - **Testing**: Profile CRUD tests, privacy tests, file upload tests

- [ ] **1.3.3**: Create player discovery features
  - **Acceptance Criteria**:
    - GET /api/v1/players endpoint with filtering
    - Search by name, experience level, availability
    - Privacy-aware player listing
    - Pagination support
  - **Time**: 1 day
  - **Testing**: Search tests, filtering tests, privacy tests

- [ ] **1.3.4**: Implement availability status system
  - **Acceptance Criteria**:
    - Availability status enum
    - Status update functionality
    - Status-based filtering
    - Status change notifications
  - **Time**: 1 day
  - **Testing**: Status update tests, notification tests

#### **Story 1.4: League Management Foundation**
**Priority**: High  
**Estimate**: 1 week  
**Dependencies**: 1.2

**Tasks:**
- [ ] **1.4.1**: Create League model and migration
  - **Acceptance Criteria**:
    - Leagues table with all required fields
    - League model with admin relationship
    - Factory for testing
    - Migration runs successfully
  - **Time**: 1 day
  - **Testing**: Migration test, model relationship tests

- [ ] **1.4.2**: Implement league CRUD operations
  - **Acceptance Criteria**:
    - GET /api/v1/leagues endpoint
    - POST /api/v1/leagues endpoint
    - PUT /api/v1/leagues/{id} endpoint
    - DELETE /api/v1/leagues/{id} endpoint
  - **Time**: 1 day
  - **Testing**: League CRUD tests, authorization tests

- [ ] **1.4.3**: Create league admin management
  - **Acceptance Criteria**:
    - League admin assignment
    - Admin permission system
    - Admin dashboard access
    - Admin role validation
  - **Time**: 1 day
  - **Testing**: Admin assignment tests, permission tests

- [ ] **1.4.4**: Implement league statistics
  - **Acceptance Criteria**:
    - League stats calculation
    - Stats endpoint
    - Real-time stats updates
    - Stats caching
  - **Time**: 1 day
  - **Testing**: Stats calculation tests, caching tests

---

### **Epic 2: Team & Social Features (Weeks 5-8)**

#### **Story 2.1: Team Management System**
**Priority**: High  
**Estimate**: 1 week  
**Dependencies**: 1.3, 1.4

**Tasks:**
- [ ] **2.1.1**: Create Team model and migration
  - **Acceptance Criteria**:
    - Teams table with all required fields
    - Team model with captain and league relationships
    - Factory for testing
    - Migration runs successfully
  - **Time**: 1 day
  - **Testing**: Migration test, model relationship tests

- [ ] **2.1.2**: Implement team creation and management
  - **Acceptance Criteria**:
    - POST /api/v1/teams endpoint
    - PUT /api/v1/teams/{id} endpoint
    - Team captain assignment
    - Team name validation
  - **Time**: 1 day
  - **Testing**: Team CRUD tests, captain assignment tests

- [ ] **2.1.3**: Create team member management
  - **Acceptance Criteria**:
    - Add/remove team members
    - Member role assignment
    - Team size limits
    - Member invitation system
  - **Time**: 2 days
  - **Testing**: Member management tests, invitation tests

- [ ] **2.1.4**: Implement team discovery
  - **Acceptance Criteria**:
    - GET /api/v1/teams endpoint with filtering
    - Search by name, league, availability
    - Team roster visibility
    - Team statistics
  - **Time**: 1 day
  - **Testing**: Team search tests, visibility tests

#### **Story 2.2: Camp Management System**
**Priority**: High  
**Estimate**: 1 week  
**Dependencies**: 1.4

**Tasks:**
- [ ] **2.2.1**: Create Camp and CampSession models
  - **Acceptance Criteria**:
    - Camps and camp_sessions tables
    - Models with proper relationships
    - Factories for testing
    - Migrations run successfully
  - **Time**: 1 day
  - **Testing**: Migration tests, model relationship tests

- [ ] **2.2.2**: Implement camp creation and management
  - **Acceptance Criteria**:
    - POST /api/v1/camps endpoint
    - PUT /api/v1/camps/{id} endpoint
    - Camp session scheduling
    - Capacity management
  - **Time**: 2 days
  - **Testing**: Camp CRUD tests, session management tests

- [ ] **2.2.3**: Create camp registration system
  - **Acceptance Criteria**:
    - POST /api/v1/camps/{id}/register endpoint
    - Registration validation
    - Capacity checking
    - Registration confirmation
  - **Time**: 1 day
  - **Testing**: Registration tests, capacity tests

- [ ] **2.2.4**: Implement camp communication
  - **Acceptance Criteria**:
    - Camp announcements
    - Participant notifications
    - Attendance tracking
    - Camp updates
  - **Time**: 1 day
  - **Testing**: Communication tests, notification tests

#### **Story 2.3: Basic Social Features**
**Priority**: Medium  
**Estimate**: 1 week  
**Dependencies**: 1.3, 2.1

**Tasks:**
- [ ] **2.3.1**: Create Post and Comment models
  - **Acceptance Criteria**:
    - Posts and comments tables
    - Models with user relationships
    - Factories for testing
    - Migrations run successfully
  - **Time**: 1 day
  - **Testing**: Migration tests, model relationship tests

- [ ] **2.3.2**: Implement social feed
  - **Acceptance Criteria**:
    - GET /api/v1/posts endpoint
    - POST /api/v1/posts endpoint
    - Feed filtering by league/team
    - Pagination support
  - **Time**: 2 days
  - **Testing**: Feed tests, filtering tests

- [ ] **2.3.3**: Create commenting system
  - **Acceptance Criteria**:
    - POST /api/v1/posts/{id}/comments endpoint
    - Comment threading
    - Comment moderation
    - Comment notifications
  - **Time**: 1 day
  - **Testing**: Comment tests, moderation tests

- [ ] **2.3.4**: Implement basic messaging
  - **Acceptance Criteria**:
    - Direct message functionality
    - Message threading
    - Message notifications
    - Message privacy
  - **Time**: 1 day
  - **Testing**: Messaging tests, notification tests

#### **Story 2.4: Facility Booking System**
**Priority**: High  
**Estimate**: 1 week  
**Dependencies**: 1.4

**Tasks:**
- [ ] **2.4.1**: Create Facility and Space models
  - **Acceptance Criteria**:
    - Facilities and spaces tables
    - Models with proper relationships
    - Factories for testing
    - Migrations run successfully
  - **Time**: 1 day
  - **Testing**: Migration tests, model relationship tests

- [ ] **2.4.2**: Implement facility registration
  - **Acceptance Criteria**:
    - POST /api/v1/facilities endpoint
    - Facility space management
    - Operating hours configuration
    - Facility validation
  - **Time**: 1 day
  - **Testing**: Facility registration tests, validation tests

- [ ] **2.4.3**: Create booking system
  - **Acceptance Criteria**:
    - POST /api/v1/facilities/{id}/book endpoint
    - Availability checking
    - Conflict detection
    - Booking confirmation
  - **Time**: 2 days
  - **Testing**: Booking tests, conflict tests

- [ ] **2.4.4**: Implement QR code system
  - **Acceptance Criteria**:
    - QR code generation for bookings
    - QR code validation
    - Check-in functionality
    - QR code security
  - **Time**: 1 day
  - **Testing**: QR code tests, check-in tests

- [ ] **2.4.5**: API standards and rate limiting
  - **Acceptance Criteria**:
    - Problem+JSON error schema across endpoints
    - Cursor-based pagination for list endpoints
    - Per-IP and per-user rate limits with friendly 429s
  - **Time**: 1 day
  - **Testing**: Contract tests for errors; load tests verify limits

---

### **Epic 3: Payment & Game Management (Weeks 9-12)**

#### **Story 3.1: Payment Processing System**
**Priority**: Critical  
**Estimate**: 1 week  
**Dependencies**: 2.4

**Tasks:**
- [ ] **3.1.1**: Set up Stripe integration
  - **Acceptance Criteria**:
    - Stripe SDK installed and configured
    - Test environment setup
    - Webhook handling with signature verification and replay protection
    - Error handling
  - **Time**: 1 day
  - **Testing**: Stripe integration tests, webhook tests

- [ ] **3.1.2**: Create Payment model and migration
  - **Acceptance Criteria**:
    - Payments table with all required fields
    - Payment model with relationships
    - Factory for testing
    - Migration runs successfully
  - **Time**: 1 day
  - **Testing**: Migration test, model relationship tests

- [ ] **3.1.3**: Implement payment processing
  - **Acceptance Criteria**:
    - POST /api/v1/payments/create endpoint
    - Payment method validation
    - Automatic charging functionality
    - Payment confirmation
    - Idempotency-Key support with 24h dedupe window
    - Exponential backoff retries for transient failures
  - **Time**: 2 days
  - **Testing**: Payment processing tests, automatic charging tests

- [ ] **3.1.4**: Create payment management
  - **Acceptance Criteria**:
    - Payment history endpoint
    - Refund processing
    - Payment status tracking
    - Receipt generation
  - **Time**: 1 day
  - **Testing**: Payment management tests, refund tests

- [ ] **3.1.5**: Reconciliation jobs and dashboards
  - **Acceptance Criteria**:
    - Nightly reconciliation job compares internal payments to Stripe payouts/charges
    - Mismatch report and alerting
    - Dashboard for payment_success_rate and refund_rate
  - **Time**: 1 day
  - **Testing**: Simulated mismatches trigger alerts and reports

#### **Story 3.2: Game Management System**
**Priority**: High  
**Estimate**: 1 week  
**Dependencies**: 2.1, 2.4

**Tasks:**
- [ ] **3.2.1**: Create Game model and migration
  - **Acceptance Criteria**:
    - Games table with all required fields
    - Game model with team and facility relationships
    - Factory for testing
    - Migration runs successfully
  - **Time**: 1 day
  - **Testing**: Migration test, model relationship tests

- [ ] **3.2.2**: Implement game scheduling
  - **Acceptance Criteria**:
    - POST /api/v1/games endpoint
    - Schedule conflict detection
    - Facility availability checking
    - Game confirmation
  - **Time**: 2 days
  - **Testing**: Game scheduling tests, conflict tests

- [ ] **3.2.3**: Create game participant management
  - **Acceptance Criteria**:
    - Add/remove game participants
    - Attendance tracking
    - QR code check-in for games
    - Participant validation
  - **Time**: 1 day
  - **Testing**: Participant management tests, check-in tests

- [ ] **3.2.4**: Implement game reporting
  - **Acceptance Criteria**:
    - Captain game reports
    - Absence reporting
    - Equipment damage reporting
    - Game statistics
  - **Time**: 1 day
  - **Testing**: Reporting tests, statistics tests

#### **Story 3.3: Chat System**
**Priority**: Medium  
**Estimate**: 1 week  
**Dependencies**: 3.2

**Tasks:**
- [ ] **3.3.1**: Create Chat and ChatMessage models
  - **Acceptance Criteria**:
    - Chats and chat_messages tables
    - Models with proper relationships
    - Factories for testing
    - Migrations run successfully
  - **Time**: 1 day
  - **Testing**: Migration tests, model relationship tests

- [ ] **3.3.2**: Implement basic chat functionality
  - **Acceptance Criteria**:
    - POST /api/v1/games/{id}/chat/messages endpoint
    - GET /api/v1/games/{id}/chat/messages endpoint
    - Message threading
    - Message validation
  - **Time**: 2 days
  - **Testing**: Chat functionality tests, message tests

- [ ] **3.3.3**: Create attendance polls
  - **Acceptance Criteria**:
    - Poll creation in chat
    - Poll voting functionality
    - Poll results tracking
    - Poll notifications
  - **Time**: 1 day
  - **Testing**: Poll tests, voting tests

- [ ] **3.3.4**: Implement real-time chat
  - **Acceptance Criteria**:
    - SSE for MVP; WebSockets for high-traffic rooms if needed
    - Real-time message delivery
    - Online status tracking
    - Message notifications
  - **Time**: 1 day
  - **Testing**: WebSocket tests, real-time tests

#### **Story 3.4: Notification System**
**Priority**: Medium  
**Estimate**: 1 week  
**Dependencies**: 3.1, 3.2

**Tasks:**
- [ ] **3.4.1**: Create Notification model
  - **Acceptance Criteria**:
    - Notifications table with all required fields
    - Notification model with user relationship
    - Factory for testing
    - Migration runs successfully
  - **Time**: 1 day
  - **Testing**: Migration test, model relationship tests

- [ ] **3.4.2**: Implement notification types
  - **Acceptance Criteria**:
    - Game reminder notifications
    - Payment confirmation notifications
    - Chat message notifications
    - System notifications
  - **Time**: 2 days
  - **Testing**: Notification type tests, content tests

- [ ] **3.4.3**: Create notification delivery
  - **Acceptance Criteria**:
    - Email notification delivery
    - In-app notification delivery
    - Notification preferences
    - Delivery tracking
  - **Time**: 1 day
  - **Testing**: Delivery tests, preference tests

- [ ] **3.4.4**: Implement notification management
  - **Acceptance Criteria**:
    - GET /api/v1/notifications endpoint
    - Mark as read functionality
    - Notification deletion
    - Notification history
  - **Time**: 1 day
  - **Testing**: Management tests, history tests

---

### **Epic 4: Mobile App Development (Weeks 13-16)**

#### **Story 4.1: React Native Setup**
**Priority**: Critical  
**Estimate**: 1 week  
**Dependencies**: 3.1

**Tasks:**
- [ ] **4.1.1**: Initialize React Native project with Expo
  - **Acceptance Criteria**:
    - Expo project created and configured
    - Development environment set up
    - Basic app structure created
    - Navigation framework installed
  - **Time**: 1 day
  - **Testing**: App builds successfully, development environment works

- [ ] **4.1.2**: Set up state management and API client
  - **Acceptance Criteria**:
    - Zustand configured for state management
    - API client with authentication
    - Error handling and retry logic
    - Request/response interceptors
  - **Time**: 2 days
  - **Testing**: State management tests, API client tests

- [ ] **4.1.3**: Implement authentication flow
  - **Acceptance Criteria**:
    - Login screen with form validation
    - Registration screen
    - Token storage and management
    - Authentication state persistence
  - **Time**: 1 day
  - **Testing**: Authentication flow tests, token management tests

- [ ] **4.1.4**: Create basic navigation structure
  - **Acceptance Criteria**:
    - Tab navigation setup
    - Stack navigation for screens
    - Navigation guards for authentication
    - Deep linking support
  - **Time**: 1 day
  - **Testing**: Navigation tests, deep linking tests

#### **Story 4.2: Player Experience Screens**
**Priority**: High  
**Estimate**: 1 week  
**Dependencies**: 4.1

**Tasks:**
- [ ] **4.2.1**: Create player dashboard
  - **Acceptance Criteria**:
    - Player profile display
    - Team memberships
    - Upcoming games
    - Quick actions
  - **Time**: 2 days
  - **Testing**: Dashboard tests, data loading tests

- [ ] **4.2.2**: Implement team discovery
  - **Acceptance Criteria**:
    - Team listing with search
    - Team details screen
    - Team joining functionality
    - Team filtering options
  - **Time**: 1 day
  - **Testing**: Team discovery tests, joining tests

- [ ] **4.2.3**: Create camp registration
  - **Acceptance Criteria**:
    - Camp listing screen
    - Camp details and sessions
    - Registration flow
    - Payment integration
  - **Time**: 1 day
  - **Testing**: Camp registration tests, payment tests

- [ ] **4.2.4**: Implement facility booking
  - **Acceptance Criteria**:
    - Facility listing with availability
    - Booking flow with time selection
    - QR code generation
    - Booking confirmation
  - **Time**: 1 day
  - **Testing**: Booking tests, QR code tests

#### **Story 4.3: Game & Social Features**
**Priority**: High  
**Estimate**: 1 week  
**Dependencies**: 4.2

**Tasks:**
- [ ] **4.3.1**: Create game schedule screen
  - **Acceptance Criteria**:
    - Game calendar view
    - Game details screen
    - Game reminders
    - Attendance tracking
  - **Time**: 2 days
  - **Testing**: Schedule tests, reminder tests

- [ ] **4.3.2**: Implement QR code scanner
  - **Acceptance Criteria**:
    - Camera integration for QR scanning
    - QR code validation
    - Check-in confirmation
    - Error handling
  - **Time**: 1 day
  - **Testing**: QR scanner tests, validation tests

- [ ] **4.3.5**: Mobile observability
  - **Acceptance Criteria**:
    - Network request tracing headers propagated (`traceparent`)
    - Crash reporting and session tracking enabled
  - **Time**: 0.5 day
  - **Testing**: Traces correlate backend spans; crash events visible

- [ ] **4.3.3**: Create social feed
  - **Acceptance Criteria**:
    - Post listing with infinite scroll
    - Post creation
    - Comment system
    - Like/unlike functionality
  - **Time**: 1 day
  - **Testing**: Feed tests, interaction tests

- [ ] **4.3.4**: Implement chat system
  - **Acceptance Criteria**:
    - Chat room interface
    - Message sending/receiving
    - Attendance polls
    - Real-time updates
  - **Time**: 1 day
  - **Testing**: Chat tests, real-time tests

#### **Story 4.4: Push Notifications & Polish**
**Priority**: Medium  
**Estimate**: 1 week  
**Dependencies**: 4.3

**Tasks:**
- [ ] **4.4.1**: Set up push notifications
  - **Acceptance Criteria**:
    - Expo notifications configured
    - Push token management
    - Notification handling
    - Notification preferences
  - **Time**: 2 days
  - **Testing**: Push notification tests, token tests

- [ ] **4.4.2**: Implement offline functionality
  - **Acceptance Criteria**:
    - Data caching for offline access
    - Offline queue for actions
    - Sync when online
    - Offline indicators
  - **Time**: 1 day
  - **Testing**: Offline tests, sync tests

- [ ] **4.4.3**: Add app polish and animations
  - **Acceptance Criteria**:
    - Loading states and skeletons
    - Smooth transitions
    - Error states
    - Success feedback
  - **Time**: 1 day
  - **Testing**: Animation tests, state tests

- [ ] **4.4.4**: Performance optimization
  - **Acceptance Criteria**:
    - Image optimization
    - Lazy loading
    - Memory management
    - App performance metrics
  - **Time**: 1 day
  - **Testing**: Performance tests, memory tests

---

### **Epic 5: Web App & Admin Dashboard (Weeks 17-21)**

#### **Story 5.1: React Native Web App Setup**
**Priority**: Critical  
**Estimate**: 1 week  
**Dependencies**: 3.1

**Tasks:**
- [ ] **5.1.1**: Initialize React Native Web project
  - **Acceptance Criteria**:
    - React Native Web project created
    - TypeScript configured
    - React Native Paper set up
    - Basic project structure
  - **Time**: 1 day
  - **Testing**: Project builds successfully, development server works

- [ ] **5.1.2**: Set up authentication and API client
  - **Acceptance Criteria**:
    - JWT authentication integration
    - API client with interceptors
    - Protected routes
    - Authentication state management
  - **Time**: 2 days
  - **Testing**: Authentication tests, API client tests

- [ ] **5.1.3**: Create responsive layout system
  - **Acceptance Criteria**:
    - Responsive navigation
    - Sidebar layout for admin
    - Mobile-friendly design
    - Theme system
  - **Time**: 1 day
  - **Testing**: Responsive tests, layout tests

- [ ] **5.1.4**: Implement error handling and loading states
  - **Acceptance Criteria**:
    - Global error boundary
    - Loading skeletons
    - Error pages
    - Toast notifications
  - **Time**: 1 day
  - **Testing**: Error handling tests, loading tests

- [ ] **5.1.5**: Admin audit logging views
  - **Acceptance Criteria**:
    - Read-only views for audit events (admin actions, payouts/refunds)
    - Filter by user, date, action, league
  - **Time**: 1 day
  - **Testing**: Audit entries visible; permissions enforced

#### **Story 5.2: League Admin Dashboard**
**Priority**: High  
**Estimate**: 1 week  
**Dependencies**: 5.1

**Tasks:**
- [ ] **5.2.1**: Create league overview dashboard
  - **Acceptance Criteria**:
    - League statistics display
    - Recent activity feed
    - Quick action buttons
    - Data visualization
  - **Time**: 2 days
  - **Testing**: Dashboard tests, data display tests

- [ ] **5.2.2**: Implement team management interface
  - **Acceptance Criteria**:
    - Team listing with search/filter
    - Team creation form
    - Team member management
    - Team statistics
  - **Time**: 1 day
  - **Testing**: Team management tests, form tests

- [ ] **5.2.3**: Create camp management interface
  - **Acceptance Criteria**:
    - Camp creation and editing
    - Session scheduling
    - Registration management
    - Camp analytics
  - **Time**: 1 day
  - **Testing**: Camp management tests, scheduling tests

- [ ] **5.2.4**: Implement facility management
  - **Acceptance Criteria**:
    - Facility registration interface
    - Space management
    - Booking calendar
    - Revenue tracking
  - **Time**: 1 day
  - **Testing**: Facility management tests, calendar tests

#### **Story 5.3: Game & Payment Management**
**Priority**: High  
**Estimate**: 1 week  
**Dependencies**: 5.2

**Tasks:**
- [ ] **5.3.1**: Create game scheduling interface
  - **Acceptance Criteria**:
    - Game calendar view
    - Game creation form
    - Schedule conflict detection
    - Game management
  - **Time**: 2 days
  - **Testing**: Scheduling tests, conflict tests

- [ ] **5.3.2**: Implement payment management
  - **Acceptance Criteria**:
    - Payment history display
    - Payment processing interface
    - Refund management
    - Financial reporting
  - **Time**: 1 day
  - **Testing**: Payment management tests, reporting tests

- [ ] **5.3.3**: Create analytics dashboard
  - **Acceptance Criteria**:
    - League performance metrics
    - Revenue analytics
    - Player engagement stats
    - Export functionality
  - **Time**: 1 day
  - **Testing**: Analytics tests, export tests

- [ ] **5.3.4**: Implement notification management
  - **Acceptance Criteria**:
    - Notification creation interface
    - Bulk notification sending
    - Notification history
    - Template management
  - **Time**: 1 day
  - **Testing**: Notification tests, template tests

#### **Story 5.4: AI Integration & MCP Setup**
**Priority**: High  
**Estimate**: 1 week  
**Dependencies**: 5.3

**Tasks:**
- [ ] **5.4.1**: Set up OpenAI integration
  - **Acceptance Criteria**:
    - OpenAI API configured
    - GPT-4 integration working
    - Chat completion endpoints
    - Streaming responses
  - **Time**: 2 days
  - **Testing**: OpenAI API tests, chat completion tests

- [ ] **5.4.2**: Implement MCP server
  - **Acceptance Criteria**:
    - MCP server implementation
    - Tool definitions and schemas
    - Resource discovery
    - API key management
  - **Time**: 2 days
  - **Testing**: MCP server tests, tool call tests

- [ ] **5.4.3**: Create AI chat system
  - **Acceptance Criteria**:
    - Chat interface implementation
    - Conversation management
    - Context awareness
    - Suggestion system
  - **Time**: 2 days
  - **Testing**: Chat functionality tests, conversation tests

- [ ] **5.4.4**: Implement general chat assistant
  - **Acceptance Criteria**:
    - Natural language processing
    - Resource discovery queries
    - Booking assistance
    - Multi-language support
  - **Time**: 1 day
  - **Testing**: NLP tests, resource discovery tests

- [ ] **5.4.5**: Cost and quotas for AI usage
  - **Acceptance Criteria**:
    - Per-tenant quotas and usage metering for AI calls
    - Concurrency caps and budget alerts
  - **Time**: 1 day
  - **Testing**: Quotas enforced; alert fires on threshold

#### **Story 5.5: Testing & Launch Preparation**
**Priority**: Critical  
**Estimate**: 1 week  
**Dependencies**: 5.4

**Tasks:**
- [ ] **5.5.1**: Comprehensive testing
  - **Acceptance Criteria**:
    - Unit tests for all components
    - Integration tests for API
    - E2E tests for critical flows
    - Performance testing
  - **Time**: 2 days
  - **Testing**: All tests pass, coverage >80%

- [ ] **5.5.2**: Security audit and fixes
  - **Acceptance Criteria**:
    - Security vulnerability scan
    - Authentication security review
    - Data protection audit
    - Security fixes implemented
  - **Time**: 1 day
  - **Testing**: Security tests, vulnerability tests

- [ ] **5.5.3**: Performance optimization
  - **Acceptance Criteria**:
    - Database query optimization
    - Frontend performance optimization
    - Caching implementation
    - CDN configuration
  - **Time**: 1 day
  - **Testing**: Performance tests, load tests

- [ ] **5.5.4**: Launch preparation
  - **Acceptance Criteria**:
    - Production environment setup
    - Deployment automation
    - Monitoring and logging
    - Backup and recovery procedures
  - **Time**: 1 day
  - **Testing**: Deployment tests, monitoring tests

---

## 📊 Task Tracking & Metrics

### **Definition of Done**
Each task is considered complete when:
- [ ] Code is written and follows coding standards
- [ ] Unit tests are written and passing
- [ ] Integration tests are written and passing
- [ ] Code review is completed and approved
- [ ] Documentation is updated
- [ ] Feature is tested in staging environment
- [ ] Performance impact is assessed
- [ ] Security review is completed

### **Operational Readiness Gate (pre-launch)**

- [x] Runbooks for incidents (payments, webhooks, queues) — 4 runbooks in `docs/runbooks/`
- [ ] Chaos test results documented with remediations
- [ ] Backup/restore drill executed (RPO/RTO met)
- [ ] Load test results meet SLOs; error budget policy agreed

### **Progress Tracking**
- **Weekly Progress Reviews**: Track completion against timeline
- **Sprint Retrospectives**: Identify blockers and improvements
- **Quality Metrics**: Track test coverage and bug rates
- **Performance Metrics**: Monitor app performance and load times

### **Risk Mitigation**
- **Technical Risks**: Regular architecture reviews and prototyping
- **Timeline Risks**: Buffer time built into estimates
- **Resource Risks**: Clear task dependencies and parallel development
- **Quality Risks**: Comprehensive testing strategy and code reviews

---

## 🚀 Post-MVP Tasks (Future Phases)

### **Phase 2: Feature Enhancement (Months 6-9)**
- [ ] Gamification and point system
- [ ] Point wagering for mock games
- [ ] Referee services
- [ ] Tournament management
- [ ] Advanced camp features

### **Phase 3: Platform Expansion (Months 10-13)**
- [ ] Multi-sport support
- [ ] AI highlight extraction
- [ ] Equipment rental system
- [ ] Advanced mobile features
- [ ] WhatsApp chat integration

### **Phase 4: Full Platform (Months 14-17)**
- [ ] Complete all full scope features
- [ ] Multi-language support
- [ ] Regional/national scaling
- [ ] Advanced analytics
- [ ] Enterprise features

---

This tasks document provides a comprehensive breakdown of development work for the Sports Yeti MVP, following spec-driven development principles with clear acceptance criteria, dependencies, and testing requirements for each task. 