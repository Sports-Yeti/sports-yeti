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
- [ ] SLOs defined and alerting live (F1-4)
- [ ] Idempotency enforced for bookings and payments (B4-3, P5-3)
- [ ] Webhooks signed and replay-protected (P5-2)
- [ ] Reconciliation jobs and dashboards in place (P5-5)
- [ ] SSE heartbeats and reconnect strategy verified (G6-2)
- [ ] Tracing spans across HTTP, DB, Stripe, queues (F1-3)
- [ ] Audit logs exposed in admin (D2-4, W8-4)
- [ ] Backup/restore drill completed (H9-3)
- [ ] Load/chaos tests passed within SLOs (H9-1, H9-2)
- [ ] Pilot launch criteria met and monitored (H9-6)

---