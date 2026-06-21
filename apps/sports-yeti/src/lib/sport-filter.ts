import { sportCatalogEntry } from '../mocks/games';
import type { SportKey } from '../mocks/teams';

/**
 * Shared sport-filter resolution for the team-domain discovery surfaces
 * (Find a Team, Browse Leagues, Player Directory). All three present the
 * same searchable multi-select (`SportCombobox`, backed by the games
 * `SPORT_CATALOG`) but match against the team `SportKey` set, which — unlike
 * the games catalog buckets — includes `hockey`. These helpers bridge the
 * two so picking "Ice Hockey" (or any hockey-family entry) still filters
 * hockey teams, leagues, and players correctly.
 */

// Catalogue entries bucket back to the concrete sport keys used by Discover,
// which don't include hockey. Map the hockey-family entries explicitly so
// hockey content still matches the shared sport filter.
export const TEAM_SPORT_BY_CATALOG_KEY: Record<string, SportKey> = {
  'ice-hockey': 'hockey',
  'roller-hockey': 'hockey',
  'field-hockey': 'hockey',
};

/** Resolve a single `SPORT_CATALOG` key to its team `SportKey`, or null. */
export function catalogKeyToTeamSport(key: string): SportKey | null {
  const mapped = TEAM_SPORT_BY_CATALOG_KEY[key];
  if (mapped) return mapped;
  const bucket = sportCatalogEntry(key)?.bucket;
  return (bucket as SportKey | null) ?? null;
}

/**
 * Resolve the selected catalogue entries down to the concrete team sport
 * keys we can match against. Returns `null` when nothing is selected, meaning
 * "any sport" — callers should skip sport filtering in that case.
 */
export function resolveAllowedTeamSports(
  sports: ReadonlySet<string>,
): Set<SportKey> | null {
  if (sports.size === 0) return null;
  const set = new Set<SportKey>();
  for (const key of sports) {
    const teamSport = catalogKeyToTeamSport(key);
    if (teamSport) set.add(teamSport);
  }
  return set;
}
