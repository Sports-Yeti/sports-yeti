import type { Role, RoleAssignment, RoleStack } from './types';
import { DEMO_ORG_ID } from './organizations';
import { DEMO_USER_ID } from './users';
import { DEMO_TEAM_ID } from './teams';

/**
 * Demo user `alex@yeti.test` has all six roles activated, with explicit
 * scopes. The Player and Referee roles are scope-less (cross-org),
 * everything else is scoped to a specific org / league / facility / team.
 *
 * The `isPrimary` role drives which tab navigator the mobile app boots
 * into when the user first opens the app.
 */

export const DEMO_ROLE_STACK: RoleStack = {
  userId: DEMO_USER_ID,
  roles: [
    {
      role: 'player',
      isPrimary: true,
      activatedAtIso: '2024-09-12T16:00:00Z',
    },
    {
      role: 'team_captain',
      scopeId: DEMO_TEAM_ID,
      scopeLabel: 'Aurora FC',
      activatedAtIso: '2026-03-22T10:30:00Z',
    },
    {
      role: 'referee',
      activatedAtIso: '2024-12-01T09:00:00Z',
    },
    {
      role: 'facility_manager',
      scopeId: 'facility-yeti-center',
      scopeLabel: 'Yeti Center',
      activatedAtIso: '2024-09-20T16:30:00Z',
    },
    {
      role: 'league_admin',
      scopeId: 'league-yeti-soccer',
      scopeLabel: 'Yeti Soccer',
      activatedAtIso: '2024-10-04T16:00:00Z',
    },
    {
      role: 'org_admin',
      scopeId: DEMO_ORG_ID,
      scopeLabel: 'Yeti Collective',
      activatedAtIso: '2024-09-12T16:00:00Z',
    },
  ],
};

/**
 * Other users keep narrower role stacks so we have realistic
 * single-role and dual-role users in the directory.
 */
export const ROLE_STACKS: RoleStack[] = [
  DEMO_ROLE_STACK,
  {
    userId: 'user-jordan-rivera',
    roles: [
      {
        role: 'player',
        isPrimary: true,
        activatedAtIso: '2024-10-04T16:00:00Z',
      },
      {
        role: 'team_captain',
        scopeId: 'team-glacier-knights',
        scopeLabel: 'Glacier Knights',
        activatedAtIso: '2025-07-04T09:00:00Z',
      },
      {
        role: 'referee',
        activatedAtIso: '2025-02-12T11:00:00Z',
      },
    ],
  },
  {
    userId: 'user-sam-okafor',
    roles: [
      {
        role: 'player',
        isPrimary: true,
        activatedAtIso: '2024-09-12T16:00:00Z',
      },
      {
        role: 'team_captain',
        scopeId: 'team-tundra-united',
        scopeLabel: 'Tundra United',
        activatedAtIso: '2025-07-08T14:00:00Z',
      },
      {
        role: 'referee',
        activatedAtIso: '2023-09-04T12:00:00Z',
      },
    ],
  },
  {
    userId: 'user-priya-mehta',
    roles: [
      {
        role: 'org_admin',
        scopeId: 'org-front-range-sports',
        scopeLabel: 'Front Range Sports',
        isPrimary: true,
        activatedAtIso: '2025-01-08T10:30:00Z',
      },
      {
        role: 'facility_manager',
        scopeId: 'facility-frp-courts',
        scopeLabel: 'Front Range Pickleball Park',
        activatedAtIso: '2025-01-20T16:00:00Z',
      },
      {
        role: 'player',
        activatedAtIso: '2024-08-01T16:00:00Z',
      },
    ],
  },
  {
    userId: 'user-mateo-luna',
    roles: [
      {
        role: 'player',
        isPrimary: true,
        activatedAtIso: '2026-02-04T16:00:00Z',
      },
    ],
  },
  {
    userId: 'user-zara-kim',
    roles: [
      {
        role: 'player',
        isPrimary: true,
        activatedAtIso: '2024-11-12T16:00:00Z',
      },
      {
        role: 'team_captain',
        scopeId: 'team-summit-hoops',
        scopeLabel: 'Summit Hoops',
        activatedAtIso: '2026-02-22T19:00:00Z',
      },
    ],
  },
];

export function roleStackForUser(userId: string): RoleStack | undefined {
  return ROLE_STACKS.find((s) => s.userId === userId);
}

/**
 * Returns the user's primary role (the one the app boots into) — falls back
 * to the first role in the stack if no `isPrimary` is set.
 */
export function primaryRole(stack: RoleStack): RoleAssignment {
  return stack.roles.find((r) => r.isPrimary) ?? stack.roles[0];
}

export function hasRole(
  stack: RoleStack,
  role: Role,
  scopeId?: string,
): boolean {
  return stack.roles.some(
    (r) => r.role === role && (!scopeId || r.scopeId === scopeId),
  );
}

/** Sort key so the role switcher always shows player → captain → ref → FM → LA → OA. */
export const ROLE_SORT_ORDER: Record<Role, number> = {
  player: 0,
  team_captain: 1,
  referee: 2,
  facility_manager: 3,
  league_admin: 4,
  org_admin: 5,
};

export function sortedRoles(stack: RoleStack): RoleAssignment[] {
  return [...stack.roles].sort(
    (a, b) => ROLE_SORT_ORDER[a.role] - ROLE_SORT_ORDER[b.role],
  );
}

export const ROLE_LABEL: Record<Role, string> = {
  player: 'Player',
  team_captain: 'Captain',
  referee: 'Referee',
  facility_manager: 'Facility Manager',
  league_admin: 'League Admin',
  org_admin: 'Org Admin',
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  player: 'Discover games, manage your profile, sign up for open play.',
  team_captain: 'Build a roster, apply to divisions, run open games.',
  referee: 'Officiate league games and bid on marketplace gigs.',
  facility_manager: 'Approve bookings, manage spaces, watch utilization.',
  league_admin: 'Run a league: divisions, schedules, approvals.',
  org_admin: 'Run an organization: leagues, facilities, money, news.',
};
