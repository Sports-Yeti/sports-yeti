# Sports Yeti MVP - Remaining Tasks Plan

## Overview

This document outlines the remaining tasks to complete the Sports Yeti MVP, organized for parallel agent execution. Tasks are grouped by domain with clear dependencies.

---

## Current Completion Status

### ✅ Completed (API Backend)
| Phase | Task ID | Description |
|-------|---------|-------------|
| 1 | F1-5 | API scaffolding with RFC7807 errors |
| 2 | D2-1 | Auth (JWT + refresh tokens) |
| 2 | D2-2 | RBAC/ABAC policies and middleware |
| 2 | D2-5 | Rate limiting (auth, payments, api, webhooks) |
| 3 | L3-1 | League CRUD endpoints |
| 3 | L3-2 | Team management endpoints |
| 3 | L3-3 | Player profile endpoints |
| 4 | B4-1 | Facility & spaces endpoints |
| 4 | B4-2 | Availability & conflict detection |
| 4 | B4-3 | Booking API with idempotency |
| 4 | B4-4 | QR code generation & check-in |
| 5 | P5-1 | Stripe integration |
| 5 | P5-2 | Webhook handling (HMAC verified) |
| 5 | P5-3 | Idempotent payment charges |
| 5 | P5-4 | Refunds & receipts |
| 5 | P5-5 | Reconciliation job |
| 6 | G6-1 | Game scheduling endpoints |
| 6 | G6-2 | Chat with SSE real-time |
| 6 | G6-3 | Polls in chat |
| 6 | G6-4 | Notification system |

### ✅ Completed (Mobile App)
| Phase | Task ID | Description |
|-------|---------|-------------|
| 7 | M7-1 | App scaffolding with Expo |
| 7 | M7-2 | Auth flows (login/register) |
| 7 | M7-3 | Facilities, booking, QR scanner |

### ✅ Completed (Testing)
- Feature tests for Auth, Booking, Payment, Game controllers
- Model factories for all core entities

---

## Remaining Work - Parallel Agent Breakdown

### AGENT GROUP A: API Enhancements
**Focus:** Complete remaining backend API work

#### Agent A1: Multi-Tenancy & Audit
**Effort:** 2-3 days
**Dependencies:** None (can start immediately)

| Task ID | Task | Description | Deliverables |
|---------|------|-------------|--------------|
| D2-3 | Multi-tenancy guard | Add league_id scoping middleware | `TenantScope` middleware, model scopes |
| D2-4 | Audit logging API | Expose audit logs via API | `AuditController`, filtered endpoints |

**Files to create/modify:**
```
apps/sports-yeti-api/app/Http/Middleware/TenantScope.php
apps/sports-yeti-api/app/Traits/BelongsToLeague.php
apps/sports-yeti-api/app/Http/Controllers/Api/V1/AuditController.php
apps/sports-yeti-api/routes/api.php (add audit routes)
```

**Acceptance Criteria:**
- [ ] All tenant-scoped queries filter by league_id
- [ ] Audit log endpoint returns paginated activity log
- [ ] Filter by user, action, date range, entity type
- [ ] Tests for tenant isolation

---

#### Agent A2: Social & Posts API
**Effort:** 1-2 days
**Dependencies:** None (can start immediately)

| Task ID | Task | Description | Deliverables |
|---------|------|-------------|--------------|
| NEW | Social Posts API | Complete posts/comments/likes | `PostController`, `CommentController` |
| NEW | News API | League news endpoints | `LeagueNewsController` |

**Files to create/modify:**
```
apps/sports-yeti-api/app/Http/Controllers/Api/V1/PostController.php
apps/sports-yeti-api/app/Http/Controllers/Api/V1/CommentController.php
apps/sports-yeti-api/app/Http/Controllers/Api/V1/LeagueNewsController.php
apps/sports-yeti-api/routes/api.php (add social routes)
```

**Acceptance Criteria:**
- [ ] Create/read/delete posts
- [ ] Comment threading
- [ ] Like/unlike functionality
- [ ] League news CRUD

---

### AGENT GROUP B: Admin Web Dashboard
**Focus:** Build React Native Web admin interface

#### Agent B1: Admin Shell & Auth
**Effort:** 2-3 days
**Dependencies:** None (can start immediately)

| Task ID | Task | Description | Deliverables |
|---------|------|-------------|--------------|
| W8-0 | Admin app scaffolding | Set up RN Web admin app | App shell, navigation, auth |

**Files to create:**
```
apps/sports-yeti-admin/
├── package.json
├── App.tsx
├── src/
│   ├── navigation/
│   │   ├── AdminNavigator.tsx
│   │   └── AuthNavigator.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   └── LoginScreen.tsx
│   │   └── dashboard/
│   │       └── DashboardScreen.tsx
│   ├── services/
│   │   └── api.ts
│   ├── stores/
│   │   └── authStore.ts
│   └── components/
│       ├── Sidebar.tsx
│       └── Header.tsx
```

**Acceptance Criteria:**
- [ ] Admin app builds for web
- [ ] Admin login with JWT auth
- [ ] Sidebar navigation layout
- [ ] Protected route handling

---

#### Agent B2: League Dashboard
**Effort:** 2-3 days
**Dependencies:** Agent B1 (admin shell)

| Task ID | Task | Description | Deliverables |
|---------|------|-------------|--------------|
| W8-1 | League dashboard | Stats, activity, quick actions | Dashboard screens |
| L3-4 | League/Team/Player mgmt | Management screens | CRUD screens |

**Files to create:**
```
apps/sports-yeti-admin/src/screens/
├── leagues/
│   ├── LeagueListScreen.tsx
│   ├── LeagueDetailScreen.tsx
│   └── LeagueFormScreen.tsx
├── teams/
│   ├── TeamListScreen.tsx
│   └── TeamDetailScreen.tsx
├── players/
│   ├── PlayerListScreen.tsx
│   └── PlayerDetailScreen.tsx
```

**Acceptance Criteria:**
- [ ] League overview with stats (teams, players, games, revenue)
- [ ] Team list with search/filter
- [ ] Player list with search/filter
- [ ] Quick actions (approve team, send notification)

---

#### Agent B3: Booking Calendar
**Effort:** 3-4 days
**Dependencies:** Agent B1 (admin shell)

| Task ID | Task | Description | Deliverables |
|---------|------|-------------|--------------|
| B4-5 | Admin booking UI | Calendar view, create/modify | Calendar screens |
| W8-2 | Booking calendar | Drag/reschedule with conflicts | Interactive calendar |

**Files to create:**
```
apps/sports-yeti-admin/src/screens/
├── bookings/
│   ├── BookingCalendarScreen.tsx
│   ├── BookingDetailModal.tsx
│   └── CreateBookingModal.tsx
├── facilities/
│   ├── FacilityListScreen.tsx
│   └── FacilityDetailScreen.tsx
```

**Acceptance Criteria:**
- [ ] Calendar view with day/week/month modes
- [ ] Color-coded booking status
- [ ] Create booking from calendar click
- [ ] Conflict detection on create/move
- [ ] Booking details modal

---

#### Agent B4: Payments & Audit
**Effort:** 2-3 days
**Dependencies:** Agent B1 (admin shell), Agent A1 (audit API)

| Task ID | Task | Description | Deliverables |
|---------|------|-------------|--------------|
| W8-3 | Payments management | History, refunds, reports | Payment screens |
| W8-4 | Audit log views | Filter/search, trace copy | Audit screens |

**Files to create:**
```
apps/sports-yeti-admin/src/screens/
├── payments/
│   ├── PaymentListScreen.tsx
│   ├── PaymentDetailScreen.tsx
│   └── RefundModal.tsx
├── audit/
│   ├── AuditLogScreen.tsx
│   └── AuditDetailModal.tsx
```

**Acceptance Criteria:**
- [ ] Payment history with filters (date, status, type)
- [ ] Initiate refunds from admin
- [ ] Export payment reports (CSV)
- [ ] Audit log viewer with filters
- [ ] Copy trace ID to clipboard

---

### AGENT GROUP C: Mobile App Completion
**Focus:** Complete remaining mobile features

#### Agent C1: Mobile Chat & SSE
**Effort:** 2-3 days
**Dependencies:** None (SSE endpoint exists)

| Task ID | Task | Description | Deliverables |
|---------|------|-------------|--------------|
| M7-4 | Game schedule & chat | Schedule list, chat SSE | Screens + SSE client |

**Files to create/modify:**
```
apps/sports-yeti/src/
├── services/
│   └── sseClient.ts
├── screens/
│   ├── games/
│   │   ├── GameDetailScreen.tsx
│   │   └── GameChatScreen.tsx
│   └── chat/
│       └── ChatScreen.tsx (enhance with SSE)
├── hooks/
│   └── useChatSSE.ts
```

**Acceptance Criteria:**
- [ ] SSE client connects to /chats/{id}/stream
- [ ] Real-time message updates
- [ ] Reconnection on disconnect
- [ ] Poll vote updates in real-time
- [ ] Heartbeat handling

---

#### Agent C2: Mobile Observability
**Effort:** 1 day
**Dependencies:** None (can start immediately)

| Task ID | Task | Description | Deliverables |
|---------|------|-------------|--------------|
| M7-5 | Mobile observability | traceparent, crash reporting | Instrumentation |

**Files to create/modify:**
```
apps/sports-yeti/src/
├── services/
│   └── api.ts (add trace headers)
├── utils/
│   └── tracing.ts
└── App.tsx (add error boundary)
```

**Acceptance Criteria:**
- [ ] All API requests include traceparent header
- [ ] Crash reporting configured (Sentry or similar)
- [ ] Error boundary catches React errors
- [ ] Traces visible in backend APM

---

#### Agent C3: Mobile Detail Screens
**Effort:** 2 days
**Dependencies:** None (can start immediately)

| Task ID | Task | Description | Deliverables |
|---------|------|-------------|--------------|
| NEW | Detail screens | Game, Facility, Camp, Team details | Detail screens |

**Files to create:**
```
apps/sports-yeti/src/screens/
├── games/
│   └── GameDetailScreen.tsx
├── facilities/
│   └── FacilityDetailScreen.tsx
├── camps/
│   └── CampDetailScreen.tsx
├── teams/
│   └── TeamDetailScreen.tsx
└── bookings/
    └── BookingDetailScreen.tsx
```

**Acceptance Criteria:**
- [ ] Game detail with teams, time, location, chat button
- [ ] Facility detail with spaces, availability
- [ ] Camp detail with sessions, register button
- [ ] Team detail with roster, stats
- [ ] Booking detail with QR code display

---

### AGENT GROUP D: DevOps & Infrastructure
**Focus:** CI/CD, observability, deployment

#### Agent D1: Observability Setup
**Effort:** 2-3 days
**Dependencies:** None (can start immediately)

| Task ID | Task | Description | Deliverables |
|---------|------|-------------|--------------|
| F1-3 | Observability baseline | OTel tracing, JSON logs, metrics | APM setup, dashboards |
| F1-4 | SLOs & alerts | Define SLIs/SLOs, alerting | Alert rules, runbooks |

**Files to create/modify:**
```
apps/sports-yeti-api/
├── config/
│   └── opentelemetry.php
├── docker/
│   ├── docker-compose.yml (add observability stack)
│   └── prometheus/
│       └── prometheus.yml
└── docs/
    ├── slo-definitions.md
    └── runbooks/
        ├── high-error-rate.md
        └── payment-failures.md
```

**Acceptance Criteria:**
- [ ] Traces visible in Jaeger/Datadog
- [ ] RED metrics (Rate, Errors, Duration) exposed
- [ ] Dashboard for key endpoints
- [ ] Alerts configured for SLO breaches

---

#### Agent D2: CI/CD Enhancement
**Effort:** 1-2 days
**Dependencies:** None (can start immediately)

| Task ID | Task | Description | Deliverables |
|---------|------|-------------|--------------|
| F1-1 | CI/CD enhancement | Add API tests, build steps | Enhanced pipeline |
| F1-2 | Secrets & env | Configure for deployment | Secrets management |

**Files to create/modify:**
```
.github/workflows/
├── ci.yml (enhance)
├── deploy-staging.yml
└── deploy-production.yml
apps/sports-yeti-api/
└── .env.example (update)
```

**Acceptance Criteria:**
- [ ] API tests run in CI
- [ ] Mobile app builds in CI
- [ ] Staging deployment automated
- [ ] Secrets via GitHub Secrets

---

### AGENT GROUP E: Hardening & Launch
**Focus:** Security, performance, launch prep

#### Agent E1: Security Review
**Effort:** 2-3 days
**Dependencies:** Groups A, B, C substantially complete

| Task ID | Task | Description | Deliverables |
|---------|------|-------------|--------------|
| H9-4 | Security review | OWASP/ASVS audit | Findings + fixes |

**Tasks:**
- [ ] Input validation audit
- [ ] SQL injection checks
- [ ] XSS prevention verification
- [ ] Authentication flow review
- [ ] Rate limiting verification
- [ ] RBAC policy audit
- [ ] Secrets management review

---

#### Agent E2: Performance Testing
**Effort:** 2-3 days
**Dependencies:** API complete

| Task ID | Task | Description | Deliverables |
|---------|------|-------------|--------------|
| H9-1 | Performance & load | k6/Gatling tests | Reports + fixes |
| H9-2 | Chaos/fault tests | Inject failures | Test results |

**Files to create:**
```
tests/
├── load/
│   ├── k6-auth.js
│   ├── k6-booking.js
│   └── k6-payment.js
└── chaos/
    └── chaos-scenarios.md
```

**Acceptance Criteria:**
- [ ] Auth endpoints handle 100 RPS
- [ ] Booking endpoints handle 50 RPS
- [ ] P95 latency < 500ms
- [ ] Graceful degradation under load

---

#### Agent E3: Launch Preparation
**Effort:** 1-2 days
**Dependencies:** All other groups complete

| Task ID | Task | Description | Deliverables |
|---------|------|-------------|--------------|
| H9-3 | Backup/restore drill | Validate RPO/RTO | Runbook + proof |
| H9-5 | Operational readiness | Runbooks, on-call | OR checklist |
| H9-6 | Pilot launch | Enable pilot league | Release notes |

**Deliverables:**
- [ ] Backup/restore tested
- [ ] Runbooks documented
- [ ] On-call rotation defined
- [ ] Release notes prepared
- [ ] Pilot league configured

---

## Parallel Execution Strategy

### Wave 1 (Start Immediately - No Dependencies)
Run these agents in parallel:

| Agent | Focus | Effort |
|-------|-------|--------|
| A1 | Multi-tenancy & Audit API | 2-3 days |
| A2 | Social & Posts API | 1-2 days |
| B1 | Admin Shell & Auth | 2-3 days |
| C2 | Mobile Observability | 1 day |
| C3 | Mobile Detail Screens | 2 days |
| D1 | Observability Setup | 2-3 days |
| D2 | CI/CD Enhancement | 1-2 days |

### Wave 2 (After Wave 1 Dependencies)
Run after respective Wave 1 dependencies complete:

| Agent | Focus | Depends On | Effort |
|-------|-------|------------|--------|
| B2 | League Dashboard | B1 | 2-3 days |
| B3 | Booking Calendar | B1 | 3-4 days |
| B4 | Payments & Audit | B1, A1 | 2-3 days |
| C1 | Mobile Chat & SSE | - | 2-3 days |

### Wave 3 (Final Integration & Hardening)
Run after Waves 1 & 2 substantially complete:

| Agent | Focus | Depends On | Effort |
|-------|-------|------------|--------|
| E1 | Security Review | A, B, C | 2-3 days |
| E2 | Performance Testing | API complete | 2-3 days |
| E3 | Launch Preparation | All | 1-2 days |

---

## Summary

| Category | Agents | Total Effort |
|----------|--------|--------------|
| API Enhancements (A) | 2 | 3-5 days |
| Admin Web Dashboard (B) | 4 | 9-13 days |
| Mobile Completion (C) | 3 | 5-6 days |
| DevOps & Infrastructure (D) | 2 | 3-5 days |
| Hardening & Launch (E) | 3 | 5-8 days |

**With parallel execution (3-5 agents):** ~2-3 weeks to complete

---

## Agent Instructions Template

When starting an agent, provide this context:

```
You are working on the Sports Yeti MVP.

Workspace: /workspace
Branch: cursor/mvp-plan-execution-9089

Your assigned task group: [AGENT ID]
Your specific tasks: [TASK LIST]

Key directories:
- API: /workspace/apps/sports-yeti-api
- Mobile: /workspace/apps/sports-yeti
- Admin (new): /workspace/apps/sports-yeti-admin

Existing patterns to follow:
- API controllers: apps/sports-yeti-api/app/Http/Controllers/Api/V1/
- Mobile screens: apps/sports-yeti/src/screens/
- API services: apps/sports-yeti-api/app/Services/

Commit frequently with descriptive messages.
Push to the branch after each logical unit of work.
```
