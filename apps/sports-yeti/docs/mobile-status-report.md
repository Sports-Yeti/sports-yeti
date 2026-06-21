# Sports Yeti — Mobile App Status Report

_Snapshot of `apps/sports-yeti` as of 2026-06-21. Reflects the actual code state, which in places diverges from the older checklists in `tasks.md` / `project/prompts/remaining-mvp-tasks.md`._

## TL;DR

The mobile app is a **feature-complete, high-fidelity UX** — 55 screens across 6 user
roles, a full custom design system, real auth, Stripe, and Sentry wired in. The single
biggest gap: **almost every feature screen renders from local mock fixtures, not the live
API.** A complete `ApiService` (~820 lines, every endpoint) exists but is currently used
only by auth. Functionally it is a **production-grade prototype sitting on a real auth
shell**, with the "swap mocks → API" work still ahead.

> **Caveat about the docs:** `tasks.md` and `remaining-mvp-tasks.md` mark "Phase 7 Mobile
> App ✅ complete" and imply API wiring is done. The **code disagrees** — the app was
> re-architected around a newer "marketplace" scope (`docs/marketplace-brief.md`) built
> against mocks, and `docs/backend-wiring-plan.md` (a 10-sprint A0–A12 plan) is the real
> remaining roadmap. Trust the code state below over the older checklists.

## Architecture snapshot

Monorepo with three apps:

- **`apps/sports-yeti`** — Expo/React Native mobile app (this report's focus)
- **`apps/sports-yeti-admin`** — React Native Web admin dashboard
- **`apps/sports-yeti-api`** — Laravel/Postgres/Redis/Stripe backend (tests, runbooks, SLOs, k6 load scripts)

## ✅ What's complete in the mobile app

**Foundation & infra**

- App shell with Sentry (crash + tracing), React Query, Stripe provider, fonts, splash, error boundary — `src/app/App.tsx`
- Real auth: JWT login/register, token refresh interceptor, secure storage, `/auth/me` (confirmed live against the dev API) — `src/services/api.ts`, `src/stores/authStore`
- Distributed tracing headers (`traceparent`) on every request — `src/utils/tracing.ts`

**Design system** (`src/ui/`, `src/theme/`)

- ~25 polished primitives: `Button`, `Card`, `Input`, `BottomSheet`, `Modal`, `Tabs`, `Tag`, `ProgressBar`, `Toast`, `SportCombobox`, `RadiusMapPicker`, date/time/money fields, skeletons, etc.
- Tokenized colors, typography (custom fonts), spacing, radii, shadows. Accessibility roles throughout.

**Role-based navigation** — `src/navigation/MainNavigator.tsx`

- 6 stackable roles with distinct tab sets: `player`, `team_captain`, `referee`, `facility_manager`, `org_admin`, `league_admin` (via `RoleStackProvider` + role switcher)

**Feature surfaces (55 screens), all UI-complete:**

- **Discover / News** — content-switcher discovery, news feed, article detail + community comments
- **Teams** — squads, team detail, multi-step team creation, league browse, player directory, join-flow with approval-gated chat, team payment
- **Games / Schedule** — discovery, game detail, create game, schedule, join-game payment sheet
- **Chat** — team chat with polls, share-backs (Zustand store)
- **Facilities / Bookings** — list, detail, booking detail
- **Captain journeys** — roster, division apply, sub-request create/inbox
- **Referee module** — home, marketplace game detail, game report
- **Waivers** — waiver gate + sign flow
- **Highlights** — TikTok-style vertical feed, My Highlights studio, detail/clip selection, and the AI-directed generation wizard (model picker + conversational director)
- **Profile** — profile/edit, settings, notifications, roles, bookmarks

## 🔲 What's left

**1. Wire screens to the live API (the big one)** — `backend-wiring-plan.md` Phase A11

- ~30 feature screens import from `src/mocks/` and never call `api.*`. The fetchers exist; they need to replace fixtures (the plan proposes a `@sports-yeti/api-client` react-query layer so the swap is mechanical and screen JSX doesn't change).

**2. Real-time & device features**

- **Chat SSE client** — backend streams via SSE; mobile chat still reads a mock store. No `sseClient.ts` / `useChatSSE` yet.
- **Push notifications** — `updatePushToken` endpoint exists; Expo push token lifecycle (register on launch, clear on logout) not wired.
- **Offline caching / sync** — listed in the original plan, not implemented.

**3. Highlights — connect prototype to real pipeline**

- The API already has `uploadVideo`, `createHighlightPaymentIntent`, `generateHighlights`, `getHighlights`, clip download, share-to-feed. The AI wizard (model selection + conversational brief) is a **mock prototype** on the mock `useCheckout`. To productionize: upload the real file, map the brief/model to generation params, poll real job status, and render returned clips. The model catalog + director brief are net-new concepts not yet in the API contract.

**4. Geo / discovery** — distance filters are mock inputs; real `within_miles` geo queries pending (Phase A9).

**5. Social cross-post & marketplace depth** — referee bid lifecycle, dual facility rental, news→social OAuth are UX-only against mocks (Phases A7/A8).

**6. Testing** — only one mobile test exists (`App.spec.tsx`). No component/integration/E2E (Detox) coverage for the 55 screens.

**7. Launch items** — pilot launch is the last open box; backup/restore + staging load tests are flagged "needs runtime environment."

## 🩹 Cleanup / risks

- **Pre-existing `tsc` errors** (unrelated to highlights): `ProfileEditScreen.tsx` references non-exported `PositionPickerSheet` / `SportPickerSheet` from `../../ui`; `TeamPaymentScreen.tsx` has a `PaymentStatus` index type error; `mocks/index.ts` has a duplicate `SportKey` export.
- **Stray Vim swap file**: `src/screens/highlights/.HighlightsFeedScreen.tsx.swp` is in the tree — worth removing.
- **Doc drift**: the "✅ complete" claims in `tasks.md` overstate mobile↔API integration. Reconcile the docs to reflect the mock-backed reality.

## Suggested next moves (highest leverage first)

1. Stand up `@sports-yeti/api-client` + swap **one** screen (e.g. Teams or Discover) end-to-end as the reference pattern.
2. Wire **chat SSE** and **push tokens** — they unlock the real-time core of the product.
3. Fix the 3 pre-existing `tsc` errors so the app typechecks clean.
4. Add a smoke E2E (Detox) for login → core tab walk-through.
