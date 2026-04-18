# SportsYeti — Designer Handoff

> Read this first before opening Figma. It explains where you are in the design system rebuild, what's already in code (and ready to screenshot or pull into Figma), and what's still needed in the Figma file.

**Companion docs**:
- [`design-system.md`](./design-system.md) — token map, audit, component contracts (Steps 1, 2, 3, 7)
- [`figma-build-plan.md`](./figma-build-plan.md) — page structure, screen list, prototype wiring, re-discovery script (Phase B execution plan)

**Figma file**: [Sports-Yeti — Mobile](https://www.figma.com/design/cLr5m5NtQU6QnFi66fhkG3/Sports-Yeti---Mobile)

---

## State of the design system

### ✅ Complete (in code, ready for Figma)

| Tokens | Source | Notes |
|---|---|---|
| Colors | `apps/sports-yeti/src/theme/colors.ts` | brand, surface, text, status, gradient. `text.muted` was darkened to `#6B7785` for AA compliance |
| Spacing | `theme/spacing.ts` | 8 tokens, `xs:4 → huge:48` |
| Radii | `theme/radii.ts` | 7 tokens, `sm:8 → pill:9999` |
| Shadows | `theme/shadows.ts` | `card / soft / nav` |
| Typography | `theme/typography.ts` | 11 variants × Plus Jakarta Sans (display) + Be Vietnam Pro (body) |

| Primitives (17) | File | Status |
|---|---|---|
| `Text` | `ui/Text.tsx` | ✅ existed |
| `Card` | `ui/Card.tsx` | ✅ existed |
| `Chip` | `ui/Chip.tsx` | ✅ existed (a11y patched) |
| `Button` | `ui/Button.tsx` | ✅ existed (a11y patched) |
| `Avatar` / `AvatarStack` | `ui/Avatar.tsx` | ✅ existed (a11y patched) |
| `IconBadge` | `ui/IconBadge.tsx` | ✅ existed (a11y patched) |
| `SearchBar` | `ui/SearchBar.tsx` | ✅ existed (a11y patched) |
| `SectionHeader` | `ui/SectionHeader.tsx` | ✅ existed |
| `ScreenHeader` | `ui/ScreenHeader.tsx` | ✅ existed (a11y patched) |
| `Input` | `ui/Input.tsx` | 🆕 new — label/help/error, password show-hide, multiline |
| `ToastProvider` + `useToast` | `ui/Toast.tsx` | 🆕 new — 4 tones, auto-dismiss, mounted at app root |
| `Modal` | `ui/Modal.tsx` | 🆕 new — info/destructive/success |
| `BottomSheet` | `ui/BottomSheet.tsx` | 🆕 new — sliding, snap points, drag handle |
| `Tabs` | `ui/Tabs.tsx` | 🆕 new — underline / segmented / pill |
| `Tag` | `ui/Tag.tsx` | 🆕 new — 6 tones, optional leading dot |
| `ProgressBar` | `ui/ProgressBar.tsx` | 🆕 new — determinate + indeterminate |
| `Skeleton` | `ui/Skeleton.tsx` | 🆕 new — box / circle / text, respects reduceMotion |
| `EmptyState` | `ui/EmptyState.tsx` | 🆕 new — icon + title + description + actions |

### ✅ Auth flow (in code, ready to screenshot)

| Screen | File | Replaces / Adds |
|---|---|---|
| Welcome / Splash | `screens/auth/WelcomeScreen.tsx` | NEW — gradient brand splash |
| Onboarding (3 slides) | `screens/auth/OnboardingScreen.tsx` | NEW — paged carousel with dots |
| Sign In | `screens/auth/LoginScreen.tsx` | REWRITTEN — `Input` + `Toast` + `Forgot password?` |
| Sign Up (3 steps) | `screens/auth/RegisterScreen.tsx` | REWRITTEN — `ProgressBar` stepper, `Chip` role picker, validates per step |
| Forgot Password | `screens/auth/ForgotPasswordScreen.tsx` | NEW — request → success `EmptyState` |

### ✅ Component Showcase (in code, **most useful screen for Figma handoff**)

| Screen | File | Purpose |
|---|---|---|
| Component Showcase | `screens/dev/ComponentShowcaseScreen.tsx` | **One screen that renders every primitive in every variant**, plus token swatches and typography ramp. Designed to be screenshotted section-by-section. |

Routed in `MainNavigator` as `ComponentShowcase`. Reach it temporarily by adding a navigation hook from any signed-in screen, e.g. in `ProfileTabScreen.tsx`:

```ts
navigation.navigate('ComponentShowcase')
```

…or hardcode it as the initial route in `MainNavigator.tsx` while you screenshot.

---

## What still needs to be added to the Figma file

The Figma file currently has 5 frames covering the 5 main tab screens. The **22 screens** in the build plan need to land in Figma. They break down into:

| Group | Count | Source of truth |
|---|---|---|
| Auth flow (Welcome, Onboarding, Sign In, Sign Up ×3 visual states, Forgot, Forgot Sent) | 8 | **In code now** — screenshot from running app |
| Detail screens (Game, Team, Facility, Camp, Booking, Highlight, Player, League) | 8 | Spec in [`figma-build-plan.md` §3.2](./figma-build-plan.md) — implement from existing legacy screens, mapped to primitives |
| Forms (Create Game ×3 steps, Highlight Upload, Waiver) | 5 | Spec in [`figma-build-plan.md` §3.3](./figma-build-plan.md) |
| Money (Team Payment, Camp Pay, Booking Checkout, Referee Earnings) | 4 | Spec in [`figma-build-plan.md` §3.4](./figma-build-plan.md) |
| Messaging (Messages list, Chat with poll, Marketplace tabs) | 3 | Spec in [`figma-build-plan.md` §3.5](./figma-build-plan.md) |
| Camera (Scanner) | 1 | Spec in [`figma-build-plan.md` §3.6](./figma-build-plan.md) |
| Modals & Sheets (Filter, Sort, Action, Confirm, Success, Permission) | 6 | Spec in [`figma-build-plan.md` §3.7](./figma-build-plan.md) |
| Empty / Error / Loading states | ~10 | Spec in [`figma-build-plan.md` §3.8](./figma-build-plan.md) |

---

## Handoff workflow (recommended)

### A — Use the running app as your source of truth

1. Start the dev server: `npx nx start sports-yeti` (already running in your terminal).
2. Open the app on iOS Simulator (or Android emulator / Expo Go).
3. **The Auth flow appears immediately on first launch** — Welcome → Onboarding → Sign In → Sign Up steps → Forgot Password. Screenshot each state.
4. **For the Component Showcase**: temporarily change `AuthNavigator.tsx` `initialRouteName` to bypass auth, or sign in and navigate to `ComponentShowcase` from any screen. Screenshot each section.
5. Screenshots become reference for translating into Figma component instances.

### B — Build the Figma library

In each section of [`figma-build-plan.md`](./figma-build-plan.md) you'll find:
- Exact target page name in Figma
- Component variants needed
- Tokens (colors, spacing, radii) referenced

Build the Figma library to mirror these. The MCP-driven version of this doc has a **§6 re-discovery script** that an automation agent can run when the Figma MCP is unblocked, but it's also fully buildable by hand.

### C — Build screens from the spec

Each screen in §3 of the build plan lists:
- Source code file (so you can read the working implementation)
- Section-by-section composition (which primitives, what content)
- Token references (which colors, what spacing)
- A11y notes

If a section has working code (e.g. Auth screens, anything that uses the new primitives), open the file and read the JSX top-to-bottom — the structure of the markup is the same as the structure of the Figma frame.

### D — Validate against tokens

Anywhere you'd be tempted to type a hex value or pixel number in Figma: check `theme/colors.ts`, `theme/spacing.ts`, `theme/radii.ts` first. If the value isn't in the theme, **don't use it** — either propose a new token (and we'll add it) or pick the closest existing token.

---

## Critical notes for the designer

### Brand color is `#006495`, NOT `#1E88E5`

There are still 32 legacy screens in code that use the wrong blue (`#1E88E5` from `apps/sports-yeti/src/constants/index.ts`). Those screens are **on the migration backlog** — do not use them as design references. The only screens currently using the correct brand are:
- All 5 tab screens (Discover, Highlights, Squads, Schedule, Profile) — `screens/discover/`, `screens/highlights/HighlightsFeedScreen.tsx`, `screens/teams/SquadsScreen.tsx`, `screens/schedule/`, `screens/profile/ProfileTabScreen.tsx`
- All 5 new auth screens (Welcome, Onboarding, Sign In, Sign Up, Forgot)
- The Component Showcase

### Token contrast was patched

`text.muted` was previously `#94A3B8` (failed AA at 2.71:1). It's now `#6B7785` (passes AA at 4.6:1). Use the new value everywhere — and only ever pair `text.muted` with bg `surface.bg #F6FAFE` or `surface.card #FFFFFF`. See contrast matrix in [`design-system.md` §7.3](./design-system.md).

### Toasts replace alerts

41 `Alert.alert()` calls live in the legacy screens; the design language going forward is **`Toast`** for non-blocking feedback (success / info / warning / error) and **`Modal`** for blocking confirmations. There should be **no alert dialogs** in any new design.

### Empty states have CTAs

Old empty states are dead-end paragraphs. New `EmptyState` always has a `primaryAction` (and usually `secondaryAction`) so the user has somewhere to go. See `EmptyState.tsx` for the contract.

### Filter chips that don't filter are bugs, not designs

Two chip rows in the existing tab screens (Discover sport filter, Squads sport/experience filters) are wired to `onPress={() => undefined}`. The Figma designs should treat filtering as **functional** — sketch the filter `BottomSheet` overlay and connect the chip-bar to it.

---

## When the Figma MCP rate limit resets

The build plan can be executed by an automation agent (or you, manually). Run [`figma-build-plan.md` §6](./figma-build-plan.md) re-discovery script first to confirm the existing 5 frames + extract component/variable/style keys, then proceed through the staged plan.

---

## Glossary of where things live

```
apps/sports-yeti/
├── docs/
│   ├── design-system.md         ← audit + spec (the "what & why")
│   ├── figma-build-plan.md      ← screen-by-screen Figma plan ("the how")
│   └── design-handoff.md        ← THIS FILE
├── src/
│   ├── theme/                   ← TOKENS — source of truth for Figma variables
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── radii.ts
│   │   ├── shadows.ts
│   │   └── typography.ts
│   ├── ui/                      ← PRIMITIVES — source of truth for Figma components
│   │   ├── Text.tsx, Card.tsx, Chip.tsx, Button.tsx, Avatar.tsx,
│   │   ├── IconBadge.tsx, SearchBar.tsx, SectionHeader.tsx, ScreenHeader.tsx,
│   │   ├── Input.tsx ★, Toast.tsx ★, Modal.tsx ★, BottomSheet.tsx ★,
│   │   ├── Tabs.tsx ★, Tag.tsx ★, ProgressBar.tsx ★, Skeleton.tsx ★, EmptyState.tsx ★
│   │   └── index.ts
│   ├── screens/
│   │   ├── auth/                ← READY-TO-SCREENSHOT auth flow
│   │   │   ├── WelcomeScreen.tsx ★
│   │   │   ├── OnboardingScreen.tsx ★
│   │   │   ├── LoginScreen.tsx (rebuilt)
│   │   │   ├── RegisterScreen.tsx (rebuilt, 3-step)
│   │   │   └── ForgotPasswordScreen.tsx ★
│   │   ├── dev/
│   │   │   └── ComponentShowcaseScreen.tsx ★ ← screenshot this for Figma library
│   │   └── (5 modern tab screens) + (32 legacy screens — don't use as references)
│   └── navigation/
│       └── AuthNavigator.tsx (now includes Welcome, Onboarding, Forgot)
```

★ = added in this handoff.
