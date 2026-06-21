# Sports Yeti — Admin Portal Status Report

_Snapshot of `apps/sports-yeti-admin` as of 2026-06-21. Written to mirror
`apps/sports-yeti/docs/mobile-status-report.md`. Reflects the actual code state
after the "complete the admin portal on the mobile design, mock-only" pass._

## TL;DR

The admin portal is a **feature-complete, high-fidelity React Native Web dashboard** —
**60 screens across ~60 routes and 8 sidebar groups**, built entirely on a shared
design system that matches the mobile app's brand (Glacier ethos: brand `#006495`,
Plus Jakarta + Be Vietnam Pro type, tonal surface ladder, alpine-orange tertiary).
**Every feature screen renders from local mock fixtures** (`src/mocks/*`) and the
shared `@sports-yeti/mocks` library — no screen calls the live API. A complete real
`ApiService` (`src/services/api.ts`) exists and is wired only to the auth shell.

Functionally it is a **production-grade prototype on a real auth shell**: the entire
league-operator journey (sign-in → pick org → run the day → run competition → run
venues → manage people → move money → prove it) is clickable end-to-end against mocks.
The single biggest remaining gap is the same as mobile: **swap mocks → live API.**

> This pass deliberately stops **before any backend wiring** so the front end can be
> reviewed first. The remaining roadmap is "wire screens to the live API", mirroring
> the mobile app's `backend-wiring-plan.md`.

## Architecture snapshot

Monorepo with three apps; this report covers the admin:

- **`apps/sports-yeti`** — Expo/React Native mobile app (design + UX source of truth)
- **`apps/sports-yeti-admin`** — Expo / React Native **Web** admin dashboard (this report)
- **`apps/sports-yeti-api`** — Laravel/Postgres/Redis/Stripe backend

Admin internals:

- **Shell** (`src/admin/`, 15 components) — `AppShell`, `Sidebar`, `TopBar`, `PageHeader`
  (standard / hero / flatHero variants), `PageScroll`, `DataTable`, `CommandPalette`
  (⌘K), `Breadcrumbs`, `StatCard`, `BulkActionBar`, `SectionHeader`, `StickyActionBar`,
  `NotificationsPanel`, `OrgSwitcher`, `FacilityPortfolioCard`, plus `nav.ts` (IA).
- **UI primitives** (`src/ui/`, 15) — `Text`, `Card`, `Button`, `Input`, `Select`, `Tag`,
  `Avatar`, `Badge`, `Modal`, `Drawer`, `Toast`, `Skeleton`, `Tabs`, `EmptyState`,
  `IconBadge` — plus the shared `@sports-yeti/ui` form library (`Form`, `FormField`, …).
- **Theme** (`src/theme/`) — tokenized colors/typography/spacing/radii/shadows, a
  desktop-tuned superset of the mobile tokens.
- **Mock data** — 14 local mock modules (`src/mocks/*`) + the shared `@sports-yeti/mocks`
  workspace; 5 Zustand stores (`authStore`, `inviteStore`, `newsStore`, `scheduleStore`).
- **Navigation** — `RootNavigator` (auth gate) → `MainNavigator` (native-stack, ~60
  routes) rendered inside `AppShell`.

## ✅ What's complete

**Foundation & infra**

- App shell with React Query, `UIThemeProvider`, `ToastProvider`, `RoleStackProvider`,
  error-free Expo Web bundle (2,542 modules) — `src/app/App.tsx`.
- Real auth service + token refresh interceptor exists (`src/services/api.ts`,
  `stores/authStore`); the login screen drives it. Everything past login is mock-driven.

**Design system (matches mobile)**

- 15 polished primitives + 15 shell components; tokenized colors/type/spacing/radii/shadows.
- Accessibility baked in: `accessibilityRole`/`Label` on interactives, WCAG-AA text
  contrast (`text.muted #6B7785`), focus/hover states via `Pressable`.
- No `Alert.alert`, no `confirm()`, no full-screen spinners, no legacy palette, **no
  emoji/glyph icons in chrome** — all replaced with `lucide-react-native`.

**Information architecture** — `src/admin/nav.ts`

- 8 grouped, collapsible sidebar sections: **Overview** (Dashboard · Operations ·
  Approvals), **Organization**, **Competition**, **People**, **Venues**, **Money**,
  **Insights**, **System**. ⌘K command palette indexes every route automatically.

**Feature surfaces (60 screens), all UI-complete & mock-driven:**

- **Overview** — Dashboard (hero, alerts, quick actions, recent audit activity),
  Operations morning-queue hub, Approvals inbox (bulk approve/reject).
- **Organization** — Organizations list/detail, Org pulse / money / people /
  integrations / branding.
- **Competition** — Leagues (list/detail + 5-step creation wizard), Seasons,
  Divisions, **Teams** (bento cards + table, approvals, bulk actions, **create/edit
  form**), Schedule (week/list, drag-to-reschedule, fixture generator, game form).
- **People** — Players directory, Referee marketplace (bids, pending registrations,
  automation), Camps (list/detail/form), Waivers (list/detail/form), Invite people.
- **Venues** — Facilities (portfolio + detail + form), Spaces, **Recurring
  availability editor (add/remove slots)**, External rental listing + booking request,
  Bookings calendar, FM dashboard + analytics.
- **Money** — Payments list/detail (refund modal with net-impact), Finance dashboard.
- **Insights** — Analytics, Stats leaderboards, Audit log, Marketplace moderation,
  News list + composer.
- **System** — Settings (sectioned + sticky save bar, mock integrations), Form
  controls + UI gallery (dev).

**Verification (this pass)**

- `tsc --noEmit -p apps/sports-yeti-admin/tsconfig.app.json` → **0 errors**.
- `eslint apps/sports-yeti-admin/src` → **0 errors** (70 stylistic `no-non-null-assertion`
  warnings remain, consistent with the rest of the codebase).
- `nx test sports-yeti-admin` → **2 suites / 2 tests pass** (App smoke + TeamForm render).
- Expo Web bundles and serves (HTTP 200) with all imports resolving.

## 🔲 What's left

**1. Wire screens to the live API (the big one)**

- Every feature screen imports from `src/mocks/*` / `@sports-yeti/mocks` and never calls
  `api.*`. The real `ApiService` already covers the endpoints; the swap should follow the
  same react-query layer approach proposed for mobile (`@sports-yeti/api-client`) so screen
  JSX is largely untouched.
- Stores (`newsStore`, `scheduleStore`, `inviteStore`) hold in-memory mock state and need
  to become server-backed mutations.

**2. Real money & integrations**

- Refunds/booking charges are abstracted behind `lib/checkout.ts` (mock). Wire to real
  Stripe. CSV/PDF exports, "Stripe portal", receipt downloads are honest `(mock)` toasts.
- Slack / SSO (Google Workspace, Microsoft Entra, SAML) are mock connect/handshake shells.

**3. Cross-org & search**

- Org switcher performs a local mock switch; cross-org data binding pending.
- Command palette searches the static nav; real cross-entity search pending.

**4. Real-time & ops**

- Notifications panel + dashboard alerts are mock; no SSE/push.
- Availability slot editor edits in-session state only (no persistence).

**5. Testing**

- Two smoke tests exist (`App.spec`, `TeamFormScreen.spec`). No broad component /
  integration / E2E (Playwright) coverage across the 60 screens.

## 🩹 Cleanup / risks

- **Dual UI + mock sources (by design, documented here):** the admin uses both the local
  `src/ui` + `src/mocks` and the shared `@sports-yeti/ui` + `@sports-yeti/mocks`. Both work
  and are intentionally kept (consolidating now is high-risk, low user value); worth a
  future consolidation when the API client lands.
- **`no-non-null-assertion` warnings (70):** pervasive `arr[0]!` style in mock builders.
  Configured as warnings, not errors — left as-is for consistency.
- **Mock-labeled actions need backend:** anything tagged `(mock)` (exports, Stripe, OAuth,
  push, org switch) is a deliberate placeholder, not a finished feature.
- **`src/services/api.ts` imports axios:** its fetch adapter crashes under jest-expo's
  stream polyfill, so tests mock axios in `src/test-setup.ts`. Revisit when wiring the API.

## What changed in this pass

Starting from an already-extensive redesign (see `redesign-audit.md`, Phases 1–15), this
pass finished the long tail and verified the whole portal:

1. **Build baseline** — installed deps; fixed a `prefer-const` lint error in
   `lib/fixtures.ts`; mocked axios in tests so `App.spec` passes (was failing at import).
2. **Closed the last functional gaps** (mock UX, no backend):
   - New **`TeamFormScreen`** (create/edit) wired into nav + an Edit entry on `TeamDetail`,
     replacing the "Team creator coming soon" toast.
   - **Recurring availability editor** now adds/removes weekly slots via a Modal + local state.
   - **Settings → Slack** and the **login SSO** + **org switcher** became honest mock
     connect/handshake flows instead of "coming soon".
3. **Design-parity polish** — replaced all remaining typographic glyphs (`★ ✓ →`) with
   `lucide` icons (`Star`, `Check`, `Square`, `ChevronRight`); removed dead imports/vars
   and debug `console.log`s.
4. **IA cleanup** — folded Dashboard / Operations / Approvals into an **Overview** group,
   dropped the misleading "Operations (legacy)" label, renamed the "Workspace" group →
   **Organization** (and matching breadcrumbs).
5. **Verification** — tsc/lint/tests green; added a `TeamFormScreen` render test; confirmed
   the Expo Web bundle builds and serves.

## Suggested next moves (highest leverage first)

1. Stand up an admin `@sports-yeti/api-client` (react-query) and swap **one** screen
   end-to-end (e.g. Leagues or Teams) as the reference pattern.
2. Wire **Payments refunds** + **Bookings charges** to real Stripe via `lib/checkout.ts`.
3. Replace the mock auth/org bootstrapping with real `/auth/me` + org membership, then make
   the **Org switcher** real.
4. Add a Playwright smoke E2E: login → walk each sidebar group → open a detail → submit a form.
