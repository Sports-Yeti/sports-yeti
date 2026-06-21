# Sports Yeti — Marketplace Brief (active scope)

> Replaces the outdated [project/prompts/mvp-scope.md](../../../project/prompts/mvp-scope.md) as the active product reference. This brief is the source of truth for the multi-sided marketplace UX plan.

## Locked product decisions

1. **`mvp-scope.md` is outdated** — this brief replaces it.
2. **Org → League → Season → Division** hierarchy with Spring/Summer + Fall/Winter cycles.
3. **Org-owned facilities** — spaces have `rentalMode: internal | external | both`.
4. **Stackable roles** — one user can be Player + Captain + Referee + FM + LeagueAdmin + OrgAdmin simultaneously.
5. **Sport-agnostic** — sport is a per-league/division attribute; stat templates plug in per sport.
6. **Referee mobile module** rebuilt on the modern design system.
7. **News & promotions** can cross-post to X / Facebook / Instagram / LinkedIn.
8. **Waiver gates** block facility check-in, game join, team approval, and any play surface.

## Five roles, six surfaces

| Role | Where they work | Primary jobs |
|---|---|---|
| **Org Admin** | admin web | Run an organization across many leagues. Money, people, facilities, branding, news. |
| **League Admin** | admin web | Run a league: divisions, schedules, approvals. |
| **Facility Manager** | admin web (mobile-light) | Manage spaces + bookings; approve external rentals; analytics. |
| **Team Captain** | mobile (admin-light) | Build a roster, apply to a division, pay fees, run open games. |
| **Player** | mobile | Discover games, profile, sign waivers, pay, check in. |
| **Referee** | mobile (admin-light) | Onboard, bid on marketplace games, accept assignments, submit reports. |

Roles are **stackable** — the demo user `alex@yeti.test` carries all six and switches via the Role Switcher. Single-role users see no switcher.

## Demo data anchor

| Anchor | Value |
|---|---|
| Demo user | `alex@yeti.test` |
| User ID | `user-alex-yeti` |
| Org | `Yeti Collective` (`org-yeti-collective`) |
| League (active) | `Yeti Soccer` (`league-yeti-soccer`) |
| Division (apply target) | `Recreational D2` (`div-yeti-soccer-rec-spring-2026`) |
| Captain team | `Aurora FC` (`team-yeti-aurora`) — forming, 4/22 |
| Player team | `Summit Hoops` (`team-summit-hoops`) — playing in Yeti Hoops |
| Referee assignments | 1 invited, 1 accepted, 1 ready-for-report |
| FM facility | `Yeti Center` |
| Pending external rentals | 3 (FM Approvals queue) |
| Unsigned waiver | `Yeti Center — Facility Use Waiver` (blocks check-in until signed) |

## Journey index

The journeys come from the canonical 5-role spec (see chat history). Per-journey acceptance criteria live in the per-phase sections of the plan file (`.cursor/plans/sports_yeti_*v2*.plan.md`).

| Role | Journey | Plan phase |
|---|---|---|
| Org Admin | Multi-league org workspace | 8 |
| League Admin | J1 Create League & Divisions | 1 |
| League Admin | J2 Register Facilities & Time Slots | 2 |
| League Admin | J3 Approve Teams | 1 + 10 |
| League Admin | J4 CSV upload / manual schedule | 1 |
| League Admin | J5 Assign Referee / open marketplace | 6 |
| League Admin | J6 Stats entry | 5 (registry) + later phase |
| League Admin | J7 Waiver enforcement | 10 |
| Captain | J1 Create team | 4 |
| Captain | J2 Invite players | 4 |
| Captain | J3 Apply to division + per-player fee | 4 + 10 |
| Captain | J4 Open game (paid + ref-required) | 4 |
| Captain | J5 Sub request | 4 |
| Player | J1 Profile (LFG + sub + privacy + certs) | 5 |
| Player | J2 Join team | 5 |
| Player | J3 Discover open game (sport/date/distance) | 5 |
| Player | J4 Stats + highlights on profile | 5 |
| Player | J5 Game-day push | 5 + 11 |
| Referee | J1 Profile (cert + rate + radius + availability) | 6 |
| Referee | J2 Accept fixed assignment | 6 |
| Referee | J3 Bid on marketplace game | 6 |
| Referee | J4 Submit game report | 6 |
| Facility Manager | J1 Onboard facility + spaces | 2 |
| Facility Manager | J2 Approve booking request | 7 |
| Facility Manager | J3 Utilization analytics | 7 |

## Out of scope (per the plan)

- Backend wiring — done after UI is approved.
- Real Stripe Connect, real Expo push, real OAuth — all mocked.
- Tournaments, equipment rental, point gamification.
- AI highlight generation — existing implementation untouched.
- Mobile-app deep ops UI for Org/League Admin beyond the lightweight shells.

## Conventions

- All entity types live in [@sports-yeti/mocks](../../../mocks/src/types.ts) and are the API contract for screens.
- All forms use `<Form>` + `<FormField>` from [@sports-yeti/ui](../../../ui/src/forms) with zod schemas from [@sports-yeti/mocks/schemas](../../../mocks/src/schemas).
- All cross-app primitives live in `@sports-yeti/ui`. Per-app feature compositions (RoleSwitcher, WaiverGate banner, FmDashboard tiles) stay in their app.
- All money is integer cents (`*Cents` suffix). All datetimes are ISO 8601 strings (`*Iso` suffix).
- All sport mentions go through the registry — no basketball-only literals in shared screens.

## Replacing this brief

Update this doc whenever a confirmed product decision changes. Keep `tasks.md` and the canonical plan (`.cursor/plans/sports_yeti_*v2*.plan.md`) aligned.
