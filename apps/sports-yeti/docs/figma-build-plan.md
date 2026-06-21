# SportsYeti — Figma Build Plan (Phase B)

> Companion to `design-system.md`. Drives the Figma work in steps 4–6 of the original 7-step plan. This document is **deterministic and execution-ready**: when MCP access is restored, the agent can run through it section by section without re-discovery.

**Target file**: [Sports-Yeti — Mobile](https://www.figma.com/design/cLr5m5NtQU6QnFi66fhkG3/Sports-Yeti---Mobile) (`fileKey: cLr5m5NtQU6QnFi66fhkG3`)

**Existing in file (confirmed via MCP)**: 5 frames on Page 1, all 390pt wide:

| Frame ID | x | Width × Height | Maps to (likely) |
|---|---|---|---|
| `3:1604` | 0 | 390 × 1371 | Discover (`screens/discover/DiscoverScreen.tsx`) — confirmed by hero text "Find your next game." |
| `3:1802` | 577 | 390 × 884 | TBD (likely Highlights — short height suggests full-bleed reels) |
| `3:1896` | 1154 | 390 × 1859 | TBD (likely Profile — tallest screen) |
| `4:2405` | 1731 | 390 × 1512 | TBD (likely Schedule) |
| `4:2567` | 2308 | 390 × 1827 | TBD (likely Squads) |

Will be confirmed in Step B0 (re-discovery) when MCP access is restored.

---

## Phase B execution order

1. **B0 — Re-discover** — confirm screen identities, list components, variables, styles in use.
2. **B1 — Page reorganization** — split into named pages: `Foundations`, `Components`, `Tabs (existing)`, `Auth`, `Detail screens`, `Forms`, `Money flows`, `Modals & Sheets`, `Empty states`.
3. **B2 — Component library audit** — confirm or fill gaps for the 17 primitives (8 existing + 9 new from this PR).
4. **B3 — Build missing screens** — 22 frames covering the missing user journeys (see §3 below).
5. **B4 — Build modal/sheet flows** — 6 overlay states.
6. **B5 — Wire prototype connections** for the 6 critical user journeys (see §4).
7. **B6 — Validate** — full-page screenshots, side-by-side compare with code (Step 6 of original 7-step plan).

---

## §1 — File structure (target end state)

```
Sports-Yeti — Mobile (file)
├── Page: Foundations
│   ├── Color tokens (swatches mirroring theme/colors.ts)
│   ├── Spacing tokens (xs–huge bars)
│   ├── Radii tokens (sm–pill cards)
│   ├── Shadows (card / soft / nav samples)
│   └── Typography ramp (display → eyebrow, both font families)
│
├── Page: Components (variants per primitive)
│   ├── Existing: Text, Card, Chip, Button, Avatar, AvatarStack, IconBadge,
│   │             SearchBar, SectionHeader, ScreenHeader
│   └── New (from this PR): Input, Toast, Modal, BottomSheet, Tabs, Tag,
│             ProgressBar, Skeleton, EmptyState
│
├── Page: Tabs (existing — refine in place)
│   ├── Discover  (existing 3:1604)
│   ├── Highlights (existing 3:1802)
│   ├── Profile    (existing 3:1896)
│   ├── Schedule   (existing 4:2405)
│   └── Squads     (existing 4:2567)
│
├── Page: Auth (NEW)
│   ├── Welcome / Splash
│   ├── Sign In
│   ├── Sign Up — Step 1 (Account)
│   ├── Sign Up — Step 2 (Profile)
│   ├── Sign Up — Step 3 (Sports & skill)
│   ├── Forgot password
│   └── Onboarding carousel (3 slides)
│
├── Page: Detail screens (NEW)
│   ├── Game Details
│   ├── Team / Squad Details
│   ├── Facility Details
│   ├── Camp Details
│   ├── Booking Details
│   ├── Highlight Detail
│   ├── Player Profile (other user)
│   └── League Browse / League Detail
│
├── Page: Forms (NEW)
│   ├── Create Game (3-step stepper)
│   ├── Highlight Upload
│   └── Waiver acceptance
│
├── Page: Money flows (NEW)
│   ├── Team Payment
│   ├── Camp Registration & Pay
│   ├── Booking Checkout
│   └── Referee Earnings dashboard
│
├── Page: Messaging & realtime (NEW)
│   ├── Messages (conversation list)
│   ├── Chat (with poll)
│   └── Marketplace (Open Games / Slots / Sub Requests with Tabs)
│
├── Page: Camera & QR (NEW)
│   └── Scanner (with success modal overlay)
│
├── Page: Modals & Sheets (NEW)
│   ├── Filter sheet (sport, distance, time, skill)
│   ├── Sort sheet
│   ├── Action sheet (share / report / save)
│   ├── Confirm dialog (destructive — leave team)
│   ├── Success dialog (joined game)
│   └── Permission denied (camera)
│
└── Page: Empty / Error / Loading states (NEW)
    ├── Empty: No games, No bookings, No messages, No friends
    ├── Error: Network, Server, Forbidden
    └── Skeleton variants (DiscoverSkeleton, MarketplaceSkeleton, ProfileSkeleton)
```

---

## §2 — User journey map (drives screen priority)

These are the journeys the design must support end-to-end. Each screen below is justified by appearing on at least one path. Numbers in parentheses are the journey's screen sequence.

### J1 — First-time user signs up and joins their first pickup game
`Welcome (1) → Sign Up Step 1 (2) → Step 2 Profile (3) → Step 3 Sports (4) → Onboarding carousel (5) → Discover (6) → Filter sheet (7) → Game Details (8) → Confirm dialog (9) → Toast success (10) → Schedule (11)`

### J2 — Existing user finds and joins a team
`Sign In (1) → Discover (2) → Squads (3) → Sport filter sheet (4) → Team Details (5) → Apply CTA → Toast (6) → Profile (7)`

### J3 — User books a facility
`Discover (1) → Filter (2) → Facility Details (3) → Booking Checkout (4) → Pay (5) → Booking Details receipt (6) → Schedule (7) → Scanner check-in on day-of (8) → Success modal (9)`

### J4 — User registers for a training camp
`Discover (1) → Camp Details (2) → Camp Registration & Pay (3) → Waiver acceptance (4) → Receipt (5) → Schedule with reminder (6)`

### J5 — Player creates a scrimmage
`Schedule "Need a Match?" CTA (1) → Create Game Step 1 type (2) → Step 2 sport & teams (3) → Step 3 venue & schedule (4) → Review (5) → Toast success (6) → Game Details (7) → Share sheet to invite (8)`

### J6 — Player uploads a highlight
`Profile (1) → Highlights tab on profile (2) → Upload sheet (3) → Highlight Upload form (4) → Toast (5) → Highlights Feed (6)`

### J7 — Referee accepts a game and earns money
`Sign In (referee) → Referee Available Games (1) → Game Details (2) → Accept (3) → Toast (4) → My Assignments (5) → Scanner check-in (6) → Earnings dashboard (7)`

### J8 — User chats with team about an upcoming game
`Messages (1) → Chat with poll (2) → Vote on poll (3) → Game Details (4)`

### J9 — User updates profile and finds friends
`Profile (1) → Edit profile sheet (2) → Find friends (Player Directory) (3) → Send invite (4) → Toast (5)`

### J10 — Brand safety / trust journey
`Any error → Toast (recoverable) → Modal destructive (irrecoverable) → Empty state with CTA (no data) → Skeleton (loading)`

---

## §3 — New screens to build (frame-by-frame)

Each entry includes: target page, frame name, source code reference, primitive checklist, key tokens, and accessibility notes.

### 3.1 — Auth page

#### Welcome / Splash
- **Source**: new — derives brand
- **Layout**: full-bleed gradient background (`gradient.cta` 151°), centered logo wordmark (`display 56pt` `text.inverse`), tagline (`bodyLg text.inverse @ 0.9 opacity`), two `Button` actions stacked (`gradient` "Get Started", `ghost` on dark "Sign In")
- **Tokens**: `gradient.cta`, `radii.cardLg`, `spacing.xxxl` between blocks
- **A11y**: header role on logo, button hints

#### Sign In
- **Source**: `screens/auth/LoginScreen.tsx` (will be migrated in code per audit A-1)
- **Layout**: `ScreenHeader variant="solid"` with no avatar/title, then in card: 2x `Input` (email then password with eye toggle), `Forgot password?` ghost link aligned right, gradient `Button` "Sign In", divider, "Continue with Apple" + "Continue with Google" `solid` buttons, footer link to Sign Up
- **Components**: `Input` (variant=email + variant=password), `Button` (gradient + solid + ghost), `Text`, `Card`
- **A11y**: focus ring visible on `Input`, `accessibilityLiveRegion="polite"` on inline error

#### Sign Up — Step 1 (Account)
- **Source**: `screens/auth/RegisterScreen.tsx`
- **Layout**: `ScreenHeader` with back, `ProgressBar` showing 33%, `Text variant="h1"` "Create your account", 3x `Input` (name, email, password with strength meter), Continue button
- **New token usage**: `ProgressBar tone="brand" variant="determinate"` value=0.33
- **A11y**: progress bar `accessibilityValue={{min:0,max:1,now:0.33}}` ✓

#### Sign Up — Step 2 (Profile)
- Avatar picker (camera or upload), display name, location autocomplete, bio (multiline `Input`), `ProgressBar` 67%

#### Sign Up — Step 3 (Sports & skill)
- Multi-select `Chip` row of sports (`SPORT_FILTERS`), per-sport skill `Tabs variant="segmented"` (Beginner/Intermediate/Advanced/Pro), `ProgressBar` 100%, "Finish" gradient `Button`

#### Forgot password
- Single `Input` email, "Send reset link" gradient `Button`, success state with `EmptyState` icon=MailCheck + "Check your inbox"

#### Onboarding carousel (3 slides)
- Page-snap horizontal `ScrollView`, each slide = full-height `Card glow` with illustration placeholder, headline (`displaySm`), body (`bodyLg text.secondary`), pagination dots, "Skip" + "Next/Get Started" `Button`s

### 3.2 — Detail screens page

#### Game Details
- **Source**: `screens/games/GameDetailScreen.tsx`
- **Sections** (top to bottom):
  1. Hero `Card glow` — sport `IconBadge`, eyebrow tag (`Tag tone="live" leadingDot`), team-vs-team or pickup title, time + location row, `AvatarStack` + spots-left + price
  2. Description `Card`
  3. Roster — `AvatarStack` + grid of player chips
  4. Venue map preview `Card`
  5. Pricing breakdown `Card` (subtotal, fees, total) — uses `Tag tone="info"` for badges
  6. Sticky bottom bar — `Button gradient fullWidth` "Join Game" + secondary `IconBadge` for share
- **A11y**: roster avatars labeled with player name + position

#### Team / Squad Details
- **Source**: `screens/teams/TeamDetailScreen.tsx`
- Hero crest with team name + league `Tag`, `Tabs variant="underline"` (About · Roster · Schedule · Stats), per-tab content, sticky "Apply to Squad" `Button gradient`

#### Facility Details
- **Source**: `screens/facilities/FacilityDetailScreen.tsx`
- Image carousel hero (3 placeholder images via `expo-image`), name + address row, amenity `Tag` cluster (Indoor, Parking, Locker rooms), spaces list (each = `Card` with sport, capacity, hourly rate, "Book" `Button`)

#### Camp Details
- **Source**: `screens/camps/CampDetailScreen.tsx`
- Hero image, name + dates + price, `ProgressBar` for "12/24 spots filled", description, daily schedule `Card`, instructor bios with `Avatar`, "Register" `Button gradient` sticky bottom

#### Booking Details (post-purchase / receipt)
- **Source**: `screens/bookings/BookingDetailScreen.tsx`
- `Tag tone="success" leadingDot` "Confirmed" header, facility + space + date + time card, QR code card, "Add to Calendar" + "Get Directions" + "Cancel booking" actions

#### Highlight Detail
- **Source**: `screens/highlights/HighlightDetailScreen.tsx`
- Full-bleed media, overlay caption, comments list, comment input at bottom

#### Player Profile (other user)
- Hero avatar + name + handle + Pro `Tag`, stats `Card` row, sport skill `Chip` row, "Add Friend" gradient `Button`, "Message" `ghost` `Button`, recent activity feed

#### League Browse / League Detail
- **Source**: `screens/teams/LeagueBrowseScreen.tsx`
- Search + filter `Tabs variant="pill"` (sport), grid of league cards
- League Detail: standings table, schedule list, "View Teams" CTA

### 3.3 — Forms page

#### Create Game — 3-step stepper
- **Source**: `screens/games/CreateGameScreen.tsx` (will be split per audit F-1)
- **Step 1 (Game type)**: `ProgressBar` 33%, `Tabs variant="segmented"` (Open Play · League), conditional fields per type, Next button
- **Step 2 (Sport & teams)**: `ProgressBar` 67%, sport `Chip` row (Lucide icons replacing emojis per audit C-5), skill `Chip` row, league/team selectors (open `BottomSheet` pickers)
- **Step 3 (Venue & schedule)**: `ProgressBar` 100%, facility selector (`BottomSheet`), space selector, date/time picker (`BottomSheet`), player limit `Input number`, referee toggle, "Create Game" gradient `Button`
- **Review modal**: `Modal variant="info"` with summary before submit

#### Highlight Upload
- **Source**: `screens/highlights/HighlightUploadScreen.tsx`
- Media picker `Card` (tap to select from library or capture), `Input multiline` caption, sport + team `Chip` selectors, privacy `Tabs segmented` (Public · Friends · Private), "Upload" `Button gradient` with `ProgressBar variant="indeterminate"` overlay during upload

#### Waiver acceptance
- **Source**: `screens/waivers/WaiversScreen.tsx`
- Document `Card` with scrollable legal text, "I have read and accept" `Switch` (or custom token-styled toggle), gradient `Button` "Accept & continue", linked PDF download `ghost` `Button`

### 3.4 — Money flows page

#### Team Payment
- **Source**: `screens/teams/TeamPaymentScreen.tsx`
- Pay summary `Card` (team name, season, dues amount), payment method selector (Apple Pay · Google Pay · Card via `Tabs segmented`), pay `Button gradient` sticky bottom

#### Camp Registration & Pay
- Order summary `Card` (camp name, dates, registration fee), per-participant `Tag` chips, optional add-ons checklist, total row with `Text variant="display"`, pay `Button gradient`

#### Booking Checkout
- Time slot `Card`, line items table (court rate, equipment, taxes), total, payment method `Tabs segmented`, pay `Button gradient`

#### Referee Earnings dashboard
- **Source**: `screens/referee/RefereeEarningsScreen.tsx`
- KPI grid: total earned this month (`display` size), upcoming payouts, games officiated — each as `Card` with `IconBadge` + value + label
- Recent transactions list with `Tag tone="success"` "Paid" / `Tag tone="warning"` "Pending"
- "Withdraw" `Button gradient` sticky bottom

### 3.5 — Messaging & realtime page

#### Messages (conversation list)
- **Source**: `screens/messages/MessagesScreen.tsx`
- `ScreenHeader`, `SearchBar`, list of conversation rows (`Avatar` + name + last message + timestamp + unread `Tag tone="brand"` count badge)
- Empty state via `EmptyState` with "Find teammates" `primaryAction`

#### Chat (with poll)
- **Source**: `screens/chat/ChatScreen.tsx`
- Header with team `Avatar` + name + connection-status `Tag` (live · reconnecting · offline) per audit R-1
- Scrollback: alternating `Card` bubbles (own = brand soft bg, other = surface card bg), inline poll `Card` with vote bars (`ProgressBar`), input pinned at bottom (`Input` + send icon button)

#### Marketplace
- **Source**: `screens/marketplace/MarketplaceScreen.tsx`
- `ScreenHeader`, `SearchBar`, `Tabs variant="underline"` ("Open Games · Available Slots · Sub Requests"), per-tab list, sticky FAB "Create Listing" if user has roles

### 3.6 — Camera & QR page

#### Scanner
- **Source**: `screens/scanner/ScannerScreen.tsx`
- Full-bleed camera viewport with corner-bracket overlay (custom vector), `ScreenHeader variant="translucent"` over top, hint pill at bottom (`Tag tone="info"` "Point at QR code")
- Permission denied state: full-screen `EmptyState` icon=CameraOff + "Settings" CTA

### 3.7 — Modals & Sheets page

| Frame | Component | Notes |
|---|---|---|
| Filter — Discover | `BottomSheet` | sport `Chip` row, distance `ProgressBar` slider replacement, time-of-day `Tabs segmented`, skill `Chip` row, "Apply" `Button gradient` |
| Filter — Squads | `BottomSheet` | sport, experience, location radius |
| Sort | `BottomSheet` | radio-style list (Most Recent / Closest / Most Spots) |
| Action sheet | `BottomSheet` | Share, Save, Report, Block |
| Confirm destructive | `Modal variant="destructive"` | "Leave team?" with red `Button solid` "Leave" + ghost "Cancel" |
| Success | `Modal variant="success"` | "You're in!" with auto-dismiss after 2s |
| Permission denied | `Modal variant="info"` | for camera/notifications |

### 3.8 — Empty / Error / Loading states page

- **Empty**: 4 `EmptyState` examples — No upcoming games, No bookings yet, No messages, No friends added
- **Error**: 3 `EmptyState` variants for Network / Server / Forbidden
- **Loading**: skeleton variants `DiscoverSkeleton`, `MarketplaceSkeleton`, `ProfileSkeleton`, `ChatSkeleton` — each composed of `Skeleton` primitives mirroring final layout

---

## §4 — Prototype interactions to wire (B5)

Connect with Figma's Smart Animate where appropriate. These prove the journeys end-to-end.

| Trigger | Destination | Animation |
|---|---|---|
| Welcome → Get Started | Sign Up Step 1 | Push |
| Sign In → Forgot password? link | Forgot password | Push |
| Sign In → success | Discover (Tab) | Dissolve |
| Discover → tap event card | Game Details | Push (smart animate hero) |
| Discover → filter icon | Filter sheet (overlay) | Slide up |
| Filter sheet → Apply | Discover (back) | Slide down |
| Game Details → Join | Confirm modal | Fade |
| Confirm modal → Confirm | Toast success (overlay) | None |
| Toast success → auto | Schedule (Tab) | Dissolve after 1s |
| Schedule → Need a Match? | Create Game Step 1 | Push |
| Create Game Step 1/2/3 → Next | Next step | Push |
| Create Game Step 3 → Create | Game Details (newly created) | Push |
| Squads → tap card | Team Details | Push |
| Team Details → Apply | Toast success | None |
| Profile → Settings cog | Settings (out of scope; placeholder) | Push |
| Profile → Find more (Friends card) | Player Directory | Push |
| Marketplace → Tabs change | within-frame swap | Smart animate |
| Chat → poll vote | Chat (updated) | Smart animate `ProgressBar` |
| Scanner → success | Success modal | Fade |
| Any → Empty state CTA | originating list | Push |

---

## §5 — Component & token gaps the agent will fill in B2

Cross-reference of the design-system spec (already shipped in code) with what the Figma file likely needs:

| Code primitive | Figma component status | Action in B2 |
|---|---|---|
| `Text` | Probably present | Verify text styles match `typography` ramp; create missing ones |
| `Button` | Probably present | Verify 4 variants × 3 sizes × disabled state — 25 variants |
| `Card` | Probably present | Verify `glow` boolean variant |
| `Chip` | Probably present | Verify `selected` boolean + `size` variants |
| `Avatar`, `AvatarStack` | Probably present | Verify size + bordered |
| `IconBadge` | Probably present | Verify `tone` variant |
| `SearchBar` | Probably present | Verify with/without filter button variant |
| `SectionHeader` | Probably present | Verify with/without action label |
| `ScreenHeader` | Probably present | Verify `translucent`/`solid` variants + `hasNotifications` |
| **`Input`** | **Missing — create** | 5 variants × 3 sizes × 4 states (idle/focused/error/disabled) |
| **`Toast`** | **Missing — create** | 4 tones × with/without action |
| **`Modal`** | **Missing — create** | 3 variants × with/without secondary action |
| **`BottomSheet`** | **Missing — create** | sheet container + handle |
| **`Tabs`** | **Missing — create** | 3 variants × scrollable boolean |
| **`Tag`** | **Missing — create** | 6 tones × 2 sizes × leadingDot boolean |
| **`ProgressBar`** | **Missing — create** | determinate/indeterminate × 4 tones × 2 sizes × showLabel |
| **`Skeleton`** | **Missing — create** | box / circle / text presets |
| **`EmptyState`** | **Missing — create** | with/without icon, primary/secondary actions |

Tokens to verify/create as Figma variables:
- Color collection — mirror `theme/colors.ts` (now updated with `text.muted = #6B7785` per audit fix)
- Spacing collection — `xs:4 / sm:8 / md:12 / lg:16 / xl:20 / xxl:24 / xxxl:32 / huge:48`
- Radii collection — `sm:8 / md:12 / lg:20 / chip:32 / card:32 / cardLg:48 / pill:9999`
- Effect styles — three `shadows.card / soft / nav` definitions

---

## §6 — Re-discovery script (run first when MCP is back)

This is the exact script to run as soon as the MCP is unblocked. It identifies each existing frame, extracts component map + variable bindings, and returns the data needed to populate B2-B6.

```js
// Step B0: Re-discover
const frameIds = ['3:1604','3:1802','3:1896','4:2405','4:2567'];
const result = { frames: [], variables: [], components: [], textStyles: [], effectStyles: [] };

const varMap = new Map();
const compMap = new Map();
const textStyleMap = new Map();
const effectStyleMap = new Map();

for (const id of frameIds) {
  const node = await figma.getNodeByIdAsync(id);
  if (!node) continue;

  const sample = [];
  let pageId = null;
  let p = node.parent;
  while (p && p.type !== 'PAGE') p = p.parent;
  if (p) pageId = p.id;

  node.findAll(n => {
    if (n.type === 'TEXT' && typeof n.characters === 'string' && sample.length < 5)
      sample.push(n.characters.split('\n')[0].slice(0, 60));
    if (n.type === 'INSTANCE' && n.mainComponent) {
      const set = n.mainComponent.parent?.type === 'COMPONENT_SET' ? n.mainComponent.parent : null;
      const k = set ? set.key : n.mainComponent.key;
      if (k && !compMap.has(k)) {
        compMap.set(k, {
          name: set ? set.name : n.mainComponent.name,
          key: k,
          isSet: !!set,
          props: Object.keys(n.componentProperties || {}),
        });
      }
    }
    if (n.boundVariables) {
      for (const [, binding] of Object.entries(n.boundVariables)) {
        const arr = Array.isArray(binding) ? binding : [binding];
        for (const b of arr) if (b?.id) varMap.set(b.id, true);
      }
    }
    if ('textStyleId' in n && n.textStyleId && typeof n.textStyleId === 'string') textStyleMap.set(n.textStyleId, true);
    if ('effectStyleId' in n && n.effectStyleId) effectStyleMap.set(n.effectStyleId, true);
    return false;
  });

  result.frames.push({
    id, name: node.name, w: Math.round(node.width), h: Math.round(node.height),
    pageId, sampleText: sample,
  });
}

for (const id of varMap.keys()) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (v) result.variables.push({ id, name: v.name, key: v.key, type: v.resolvedType, remote: v.remote });
}
for (const id of textStyleMap.keys()) {
  const s = figma.getStyleById(id);
  if (s) result.textStyles.push({ id, name: s.name, key: s.key });
}
for (const id of effectStyleMap.keys()) {
  const s = figma.getStyleById(id);
  if (s) result.effectStyles.push({ id, name: s.name, key: s.key });
}
result.components = [...compMap.values()];

return result;
```

---

## §7 — Fallback plan if MCP remains blocked

If the Figma MCP rate limit can't be resolved (Starter plan limit, no upgrade planned), the same plan above can be executed by a designer manually — every screen, component, and interaction is fully specified. Hand them this doc + `design-system.md` + the screens listed in `apps/sports-yeti/src/screens/`. They have everything needed.

Alternatively: I can produce static HTML/RN-Web previews of each missing screen (using the new primitives that just landed) so you can take Figma-style screenshots from a running app. This works without any Figma access and would be useful as a Figma reference handoff.

---

## §8 — When MCP access returns

Run, in this order:

1. **§6 re-discovery script** — confirm screen identities, component keys, variable keys.
2. **B1 page reorganization** — create `Foundations`, `Components`, `Auth`, `Detail screens`, `Forms`, `Money flows`, `Messaging & realtime`, `Camera & QR`, `Modals & Sheets`, `Empty / Error / Loading states` pages.
3. **B2 component library** — create the 9 missing primitive component sets with variants per §5.
4. **B3 build screens** — execute §3 frame-by-frame, one section per `use_figma` call per the `figma-generate-design` skill.
5. **B5 wire prototype** — apply §4 interaction map.
6. **B6 validate** — `get_screenshot` per page; compare to code; fix discrepancies in targeted calls.
