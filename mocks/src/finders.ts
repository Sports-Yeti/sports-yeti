/**
 * Cross-entity helpers — joins that need more than one fixture file.
 *
 * Per-entity finders live alongside their fixture files
 * (e.g., `divisionsForSeason`). Anything that needs to walk across
 * entities goes here.
 */

import { divisionsForSeason } from './divisions';
import { facilitiesByOrg, facilitiesManagedBy } from './facilities';
import { GAMES } from './games';
import { leaguesByOrg } from './leagues';
import { ORGANIZATIONS } from './organizations';
import { ROSTER_MEMBERS } from './teams';
import { seasonsByLeague } from './seasons';
import { spacesByFacility } from './spaces';
import type {
  Division,
  Facility,
  Game,
  League,
  Organization,
  RosterMember,
  Season,
  Space,
} from './types';

/** Org ▸ League ▸ Season ▸ Division tree for a single org. */
export interface OrgTree {
  org: Organization;
  leagues: Array<{
    league: League;
    seasons: Array<{
      season: Season;
      divisions: Division[];
    }>;
  }>;
}

export function buildOrgTree(orgId: string): OrgTree | undefined {
  const org = ORGANIZATIONS.find((o) => o.id === orgId);
  if (!org) return undefined;
  const leagues = leaguesByOrg(orgId).map((league) => ({
    league,
    seasons: seasonsByLeague(league.id).map((season) => ({
      season,
      divisions: divisionsForSeason(season.id),
    })),
  }));
  return { org, leagues };
}

/** All facilities + spaces visible to a single org. */
export interface OrgFacilityTree {
  org: Organization;
  facilities: Array<{ facility: Facility; spaces: Space[] }>;
}

export function buildOrgFacilityTree(orgId: string): OrgFacilityTree | undefined {
  const org = ORGANIZATIONS.find((o) => o.id === orgId);
  if (!org) return undefined;
  const facilities = facilitiesByOrg(orgId).map((facility) => ({
    facility,
    spaces: spacesByFacility(facility.id),
  }));
  return { org, facilities };
}

/** Facilities the user can manage as a Facility Manager. */
export function facilitiesForFmUser(userId: string): Facility[] {
  return facilitiesManagedBy(userId);
}

/** All games scheduled in a given facility (across spaces). */
export function gamesForFacility(facilityId: string): Game[] {
  const spaceIds = new Set(spacesByFacility(facilityId).map((s) => s.id));
  return GAMES.filter((g) => spaceIds.has(g.spaceId));
}

/** Roster lookup by player. */
export function rosterEntriesForPlayer(playerId: string): RosterMember[] {
  return ROSTER_MEMBERS.filter((r) => r.playerId === playerId);
}
