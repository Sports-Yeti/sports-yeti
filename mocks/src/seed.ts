/**
 * Seed composer.
 *
 * Every screen reads from the named exports in the per-entity files
 * (or this `seed` aggregate). `resetSeed()` flips an internal mutation
 * counter that the per-app stores listen to — used by the debug menu
 * (mobile) and the `?seed=fresh` URL flag (admin) to re-render with
 * the canonical fixture state.
 */

import { BOOKINGS } from './bookings';
import { DIVISIONS } from './divisions';
import { FACILITIES, FACILITY_OWNERSHIPS } from './facilities';
import { GAMES } from './games';
import { LEAGUES } from './leagues';
import { NEWS_ARTICLES, SOCIAL_POST_DRAFTS } from './news';
import { ORGANIZATIONS, DEMO_ORG_ID } from './organizations';
import { PLAYERS, DEMO_PLAYER_ID } from './players';
import { REFEREES, REFEREE_ASSIGNMENTS } from './referees';
import {
  DEMO_ROLE_STACK,
  ROLE_STACKS,
} from './role-stacks';
import { SEASONS } from './seasons';
import {
  RECURRING_AVAILABILITY,
  SPACES,
  SPACE_RENTAL_CONFIGS,
} from './spaces';
import { SUB_REQUESTS } from './sub-requests';
import { ROSTER_MEMBERS, TEAMS, DEMO_TEAM_ID } from './teams';
import { USERS, DEMO_USER_ID } from './users';
import { WAIVERS, WAIVER_SIGNATURES } from './waivers';

export const SEED = {
  users: USERS,
  organizations: ORGANIZATIONS,
  leagues: LEAGUES,
  seasons: SEASONS,
  divisions: DIVISIONS,
  facilities: FACILITIES,
  facilityOwnerships: FACILITY_OWNERSHIPS,
  spaces: SPACES,
  spaceRentalConfigs: SPACE_RENTAL_CONFIGS,
  recurringAvailability: RECURRING_AVAILABILITY,
  teams: TEAMS,
  rosterMembers: ROSTER_MEMBERS,
  players: PLAYERS,
  referees: REFEREES,
  refereeAssignments: REFEREE_ASSIGNMENTS,
  games: GAMES,
  bookings: BOOKINGS,
  waivers: WAIVERS,
  waiverSignatures: WAIVER_SIGNATURES,
  subRequests: SUB_REQUESTS,
  newsArticles: NEWS_ARTICLES,
  socialPostDrafts: SOCIAL_POST_DRAFTS,
  roleStacks: ROLE_STACKS,
  demoRoleStack: DEMO_ROLE_STACK,
  demoUserId: DEMO_USER_ID,
  demoOrgId: DEMO_ORG_ID,
  demoPlayerId: DEMO_PLAYER_ID,
  demoTeamId: DEMO_TEAM_ID,
} as const;

/**
 * Bumped every time `resetSeed()` is called. Per-app stores subscribe
 * to this value; bumping it triggers a re-render with the canonical
 * fixture data restored.
 *
 * The fixtures themselves are *not* mutated by screens — local edits
 * happen in the per-app store layer. `resetSeed()` simply tells the
 * store to discard local edits and refall back to the source arrays.
 */
let seedRevision = 0;
const subscribers = new Set<() => void>();

export function getSeedRevision(): number {
  return seedRevision;
}

export function resetSeed(): void {
  seedRevision += 1;
  subscribers.forEach((fn) => {
    try {
      fn();
    } catch {
      // Swallow — a misbehaving subscriber shouldn't abort reset.
    }
  });
}

export function subscribeSeed(fn: () => void): () => void {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}
