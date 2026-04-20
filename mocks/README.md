# @sports-yeti/mocks

Single source of truth for the marketplace UI plan's mock data.

Both `apps/sports-yeti` (mobile) and `apps/sports-yeti-admin` (web) consume
this package so the demo user, fixtures, and per-org branding stay in
lockstep across surfaces.

## Layout

```
src/
  types.ts                  // every entity interface
  sports.ts                 // sport registry (sport-agnostic plumbing)
  stat-templates.ts         // per-sport stat fields
  organizations.ts          // Organization fixtures + finders
  leagues.ts                // League fixtures (marketplace-shaped)
  seasons.ts                // Season fixtures + finders
  divisions.ts              // Division fixtures + finders
  facility-ownership.ts     // FacilityOwnership fixtures
  space-rental.ts           // SpaceRentalConfig fixtures
  role-stacks.ts            // demo user + role-stack fixtures
  social-drafts.ts          // SocialPostDraft fixtures
  waiver-gates.ts           // WaiverGateState fixtures + helpers
  finders.ts                // cross-entity helpers
  seed.ts                   // composes everything + resetSeed()
  schemas/                  // zod schemas for forms
```

## Usage

```ts
import { ORGANIZATIONS, organizationById, demoRoleStack } from '@sports-yeti/mocks';
import { divisionFormSchema } from '@sports-yeti/mocks/schemas';
```

Every fixture file exports both the array and a `*ById` helper. Cross-entity
joins (e.g. `divisionsForSeason(seasonId)`) live in `finders.ts`.

## Backend swap pattern

When real APIs land, replace the named-export array with a fetcher that
returns the same array shape (or a paginated wrapper). Screens depend on
the **types** in `@sports-yeti/mocks` — those types are the API contract,
so swapping fixtures for fetchers is mechanical.

See `MockSwap.md` for the per-screen swap recipe.
