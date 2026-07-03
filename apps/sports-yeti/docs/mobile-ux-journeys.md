# Sports Yeti Mobile — UX Journey Map & Completion Report

_Audit + fixes of `apps/sports-yeti` as of 2026-07-02. Companion to
`mobile-status-report.md` (which described the state before this pass)._

## TL;DR

Every user journey in the mobile app was mapped screen-by-screen, and every
broken, dead-ended, or self-contradicting flow was fixed. The unifying change:
**actions now persist for the whole session through small Zustand stores**, so
joining a game changes your Schedule, signing a waiver clears the gate that
blocked you, and creating a squad produces a squad you can open, staff, and
chat in. The app is a complete, coherent front end on mock data — ready for
you to move to the admin app. `tsc` is clean, lint has 0 errors, and the boot
smoke test passes (it was failing before).

---

## 1. Journey map (as it stands now)

### Player — the default role

| Journey | Path | Status |
|---|---|---|
| Discover → join a game | Discover tab → GameDetail → Commit/Pay → appears in Schedule → Locker-room chat | ✅ Completes, persists |
| Discover → register a camp | Discover (Camps) → CampDetail → Register → all sessions land in Schedule | ✅ Completes, persists |
| Host a game | FAB on Discover/Schedule → 3-step wizard → pay/create → lands on the live listing; listed in Discover + your Schedule | ✅ Completes, persists |
| Cancel a commitment | Schedule → EventDetail → Cancel (policy-gated) → removed from Schedule, Undo in toast; GameDetail offers re-join | ✅ Completes, persists |
| Find a team → join | Teams tab → Find a Team → TeamDetail → "Offer to join" (+ message) → pending everywhere (card, chat gate) | ✅ Completes, persists |
| Start a squad | Teams FAB → 3-step wizard → lands on your new TeamDetail as captain; in My Teams; chat works | ✅ Completes, persists |
| Leave a team | TeamDetail → Schedule tab → Leave team → removed from My Teams | ✅ Completes, persists |
| League browse/register | Teams → League browse → LeagueDetail → register (captain) → pending → league office approves in chat | ✅ (pre-existing, verified) |
| Highlights feed | Highlights tab → like, comment, share, bookmark; avatar/follow → PlayerProfile / follow store | ✅ Follow + profile links added |
| AI highlight wizard | Profile → Studio → New → video → model → **Direct** → chat brief → pay → generate → project appears in Studio as processing | ✅ Unblocked (was impossible to finish) |
| Saved reels | Studio/Bookmarks → tap a reel → feed opens **on that reel** | ✅ Deep-link added |
| Facilities → book | Profile → More → Facilities → FacilityDetail → space + slot → pay → booking listed in Bookings; cancel flips it to Past | ✅ Completes, persists |
| Waivers | Any gated action → WaiverGate → WaiverSign → return → gate cleared, action proceeds | ✅ Completes, persists |
| Messages | Profile → More → Messages; fresh DMs and new locker rooms now appear in the inbox | ✅ Session chats listed |
| Profile / roles | Header avatar → Profile → More → **Your Roles** → switch or activate roles (activation adds to the switcher) | ✅ Was unreachable |

### Captain

| Journey | Path | Status |
|---|---|---|
| Captain home | Role switcher → Captain → Home | ✅ |
| Create team | Home → Create team → wizard → lands on new TeamDetail | ✅ Completes |
| Roster & fees | Home → team card → Roster: payment/waiver tags + inline fee-collection progress | ✅ Fixed broken cross-mock link |
| Division apply | Home → Apply to division (waiver-gated) | ✅ |
| Sub requests | Home → post request → shows on Home + team inbox; confirm applicant → marked Filled | ✅ Completes, persists |
| League tools | TeamDetail (captain) → **Share a league / Commit poll** → posts card into team chat | ✅ Was built but unreachable |

### Referee

| Journey | Path | Status |
|---|---|---|
| Invitations | Home (Pending) → Accept/Decline → moves to Accepted / disappears | ✅ Were hard no-ops |
| Marketplace bid | Home (Marketplace) → GameDetail → set bid + message (real input) → submit (waiver-gated) → "Bid placed" persists | ✅ Completes, persists |
| Game report | Home (Accepted) → Report → scores (stepper), notes (real input), rating → submit → moves to Completed | ✅ Completes, persists |

### Facility manager / Org admin / League admin

Placeholder role homes ("Soon" tiles) by design — these journeys live in the
**admin web app**, which is your next milestone. The role switcher works for
all six roles.

---

## 2. What was broken and what changed

### P0 — blocked or broken journeys

1. **AI highlight wizard was un-completable.** The model step had no Continue
   button (`goToDirector()` existed but nothing called it). Added a sticky
   "Direct <model>" footer; finishing a run now also creates a `processing`
   project in the Studio (`highlight-projects-store`).
2. **`ScheduledEventDetail` → "Find another" navigated to a nonexistent route**
   (`navigate('Discover')` — Discover is a tab, not a stack screen). Fixed to
   `navigate('MainTabs', { screen: 'Discover' })`.
3. **Referee Accept/Decline buttons did nothing** (`onPress={() => undefined}`).
   Wired to `referee-store`; tabs move work between Pending → Accepted →
   Completed.
4. **Captain roster → "Open team payment" always dead-ended** ("Payment
   unavailable"): it passed org-world ids (`team-yeti-aurora`) into the
   player-world TeamPayment screen (`avalanche-fc` universe). Replaced the
   cross-universe link with an inline registration-fee progress card computed
   from the roster itself.
5. **`RolesScreen` was unreachable** (registered, never navigated to). Added
   "Your Roles" to Profile → More; "Activate" now genuinely adds the role to
   the switcher (was a toast that did nothing).
6. **`JoinGamePaymentSheet` was an orphan** — registered route, zero
   `navigate()` calls, duplicated GameDetail's inline payment. Deleted
   (route, param, export, file).

### P1 — journeys that evaporated (toast-and-forget → session persistence)

The app already had the right pattern (Zustand stores like `team-chat-store`,
`watch-store`, `saved-highlights-store`); commit-actions just weren't using
it. New stores in `src/features/`, all in-memory and reset on restart —
they're staging for the `@sports-yeti/api-client` swap described in
`backend-wiring-plan.md`:

| Store | Powers |
|---|---|
| `schedule-store` | Join game / register camp / host game → Schedule; cancel with Undo; re-join |
| `discover-store` | Wizard-created games listed in Discover + resolvable in GameDetail |
| `team-membership-store` | Join/leave/pending shared by TeamDetail ↔ ChatScreen ↔ SquadsScreen |
| `created-squads-store` | "Start a squad" produces a real TeamDetail + squad card |
| `waiver-gate/waiver-signatures-store` | Signing clears `useWaiverGate` + WaiverGate screen + progress cards |
| `sub-requests-store` | Posted requests appear on CaptainHome + inbox; confirmations mark Filled |
| `referee-store` | Invitation accept/decline, marketplace bids, report submissions |
| `bookings-store` | Facility bookings appear in Bookings; cancellations flip status |
| `highlight-projects-store` | Wizard runs appear in the Studio as processing |
| `team-chat-store` (extended) | Fresh DMs/locker rooms registered so Messages lists them |

Mapping decisions worth knowing:

- **Discover fixtures carry stale demo dates** (April) but truthful copy
  ("TOMORROW", "THIS WEEKEND"). Joining maps `timeBucket` → a real upcoming
  date so the entry lands where the player expects. Real future dates (hosted
  games) are trusted as-is.
- **Officiated pickup "games" schedule as scrimmage-shaped entries** (host +
  open roster, no fixed teams) but keep an honest kind tag: `PICKUP GAME` vs
  `SCRIMMAGE` (`scheduleKindLabel`). League fixtures remain `GAME`.
- **Past-dated camps register "starting tomorrow"** so sessions are visible;
  closed camps waitlist without touching the schedule.

### P2 — consistency and polish

- **Refund copy contradiction:** GameDetail said paid pickups are never
  refunded; ScheduledEventDetail promised a refund for any paid event. Now
  policy-aware everywhere: league games/camps refund inside their window;
  paid pickup spots don't (the court is booked).
- **Three DM id conventions** (`chat-marcus-dm`, `dm-p-marcus`, `dm-d-marcus`)
  meant the same person opened different (empty) threads from different
  screens. All entry points now route through `dmChatIdForPlayer()`; seeded
  history is reused, fresh DMs get one canonical id and show up in Messages.
- **Stranding error states:** NewsDetail ("Article not found." — no way back),
  NewsFeed (blank screen), MarketplaceGameDetail, GameReport, WaiverSign,
  TeamRoster, SubRequestInbox (plain text) → all use `EmptyState` with a Back
  action, matching the rest of the app.
- **Misleading UI:** Squads chat-lock icon implied payment gating (chat is
  approval-gated only — now shows only for pending requests); Settings
  hardcoded "You're on Pro" (now follows `PROFILE_USER.proMember`); camp
  waitlist no longer shows "View in Schedule" (nothing was scheduled).
- **Inert controls:** search filter buttons that did nothing (Messages,
  Facilities) removed; chat "Upcoming game" poll row properly disabled with
  dimmed styling when there are no fixtures; referee bid message and report
  notes are real text inputs (were tap-to-append-"!" placeholders); report
  scores got − / + steppers.
- **GameDetail now shows the Game vs Scrimmage tag** (officiated + jerseys vs
  casual) that the Discover cards already drew.
- **Feed reels' identity is tappable** — avatar/username opens PlayerProfile,
  the follow badge toggles the shared follow store (known posters only).

### Pre-existing defects fixed along the way

- `mocks/index.ts` duplicate `SportKey` export ambiguity (barrel now
  explicitly re-exports the teams union).
- `TeamPaymentScreen` `PaymentStatus` index crash for `not_required` members
  (typed maps + "No fee" tag; nudge only for pending/overdue).
- Role switching indexed by array position — session-activated roles re-sort
  the list and would have shifted the active role. Now identity-keyed.
- **App smoke test failed on `main`** (unmocked Stripe/Sentry/expo-video/
  safe-area native modules, axios fetch-adapter crash under Jest, and an
  assertion left over from the Nx template). Test setup now mocks the native
  boundary and the spec asserts real boot: Welcome renders, ErrorBoundary
  doesn't trip.

---

## 3. Patterns now consistent across screens

1. **Headers** — tab-level screens use `ScreenHeader` (avatar → Profile,
   bell → Notifications); stack detail screens use the inline back-bar
   (44 pt circular buttons). This split is intentional, not drift.
2. **Missing-content states** — every detail screen renders `EmptyState`
   with a primary Back action when its id doesn't resolve. No plain-text or
   blank-screen dead ends remain.
3. **Commit actions persist** — anything that says "you're in / paid /
   posted / signed" writes to a session store and every surface that shows
   that fact reads the same store.
4. **Destructive flows confirm** — cancel/leave/remove use the destructive
   `Modal` variant, and cancellation windows gate the CTA with the policy
   label shown.
5. **Toast + landing** — completing a creation lands you on the thing you
   created (game listing, team detail) rather than dumping you back where
   you started with only a toast.

## 4. Known limitations (deliberate, documented)

- **Session-only persistence.** Stores reset on app restart by design — the
  swap point for the real API client is a single import per store.
- **Dual mock universes remain.** Player world (`src/mocks/*`: Sarah,
  `avalanche-fc`) vs org world (`@sports-yeti/mocks`: Alex, `team-yeti-*`)
  still coexist; captain/referee/waiver flows use the org world. Cross-links
  between the worlds were removed or replaced with in-world features. Unifying
  them is API-client work, not UX work.
- **Some actions are still honest one-shot toasts** where a full loop needs
  the backend or platform APIs: share links (clipboard copy), "repost spot as
  free", photo picker, calendar export, Apple/Google sign-in.
- **Highlights pipeline is a prototype** — the wizard's model catalog +
  director brief aren't in the API contract yet (see status report §3).
- **FM / OrgAdmin / LeagueAdmin homes are placeholders** — their journeys are
  the admin web app's job.

## 5. Verification & review pass

- `tsc --noEmit` — clean (was 3 errors).
- `nx run sports-yeti:lint` — 0 errors, 131 warnings (baseline-level; the
  warnings introduced by this pass were cleaned up).
- `nx run sports-yeti:test` — 1/1 passing, stable across repeat runs (was
  failing on `main`).
- Metro dev server running against a device with no runtime errors.

Two review subagents audited the full diff; their findings were fixed in-line:

**Code review** (no Critical/High): clamped the cancellation window for
rebased camp registrations (was instantly "window closed"); TeamDetail now
resolves membership at render time instead of baking it into mount state;
`hasRole` respects `scopeId` for session-activated roles; the host was
double-counted on hosted games' schedule entries; the highlight wizard's
completion side-effects moved out of a state updater (StrictMode-safe); camp
schedule entries use a collision-proof id prefix; fresh DM rows in Messages
show the peer's avatar (not your own); dead code dropped.

**Accessibility audit**: the feed's follow badge and the saved/bookmark
remove buttons were nested inside parent pressables (invisible to screen
readers) — all hoisted to sibling focus stops; the whole-slide tap surface no
longer swallows nested controls (`accessible={false}`); duplicate avatar +
username announcements merged into one; referee Accept/Decline hit targets
brought to 44 pt; score steppers expose `accessibilityValue`; action-bearing
toasts (Undo, Switch now, View schedule) persist 8 s with persistent on-screen
fallbacks; marketplace card no longer contains a redundant inner button.

Known accepted risks: the shared gradient Button variant's contrast at its
light end (app-wide pre-existing style, not changed here) and toast-only
confirmation for non-destructive actions.
