import { TEAMS, type Team } from './teams';
import { FACILITIES } from './facilities';

export type GameStatus = 'scheduled' | 'live' | 'completed' | 'cancelled' | 'postponed';

export interface Game {
  id: string;
  leagueId: string;
  leagueName: string;
  sport: Team['sport'];
  homeTeamId: string;
  homeTeamName: string;
  homeAbbreviation: string;
  awayTeamId: string;
  awayTeamName: string;
  awayAbbreviation: string;
  facilityId: string;
  facilityName: string;
  spaceName: string;
  startsAtIso: string;
  endsAtIso: string;
  status: GameStatus;
  homeScore?: number;
  awayScore?: number;
  refereeAssignmentId?: string;
}

function game(
  id: string,
  homeId: string,
  awayId: string,
  facilityId: string,
  spaceName: string,
  startsAtIso: string,
  durationMin: number,
  status: GameStatus,
  scores?: { home: number; away: number },
): Game {
  const home = TEAMS.find((t) => t.id === homeId)!;
  const away = TEAMS.find((t) => t.id === awayId)!;
  const facility = FACILITIES.find((f) => f.id === facilityId)!;
  const start = new Date(startsAtIso);
  const end = new Date(start.getTime() + durationMin * 60_000);
  return {
    id,
    leagueId: home.leagueId,
    leagueName: home.leagueName,
    sport: home.sport,
    homeTeamId: home.id,
    homeTeamName: home.name,
    homeAbbreviation: home.abbreviation,
    awayTeamId: away.id,
    awayTeamName: away.name,
    awayAbbreviation: away.abbreviation,
    facilityId,
    facilityName: facility.name,
    spaceName,
    startsAtIso: start.toISOString(),
    endsAtIso: end.toISOString(),
    status,
    homeScore: scores?.home,
    awayScore: scores?.away,
  };
}

export const GAMES: Game[] = [
  game('g-1', 'team-avalanche-fc', 'team-frosty-flames', 'facility-yeti-center', 'Field A (Full)', '2026-04-19T19:00:00-06:00', 90, 'scheduled'),
  game('g-2', 'team-summit-hoops', 'team-mountain-lions', 'facility-summit-rec', 'Court 1', '2026-04-19T20:30:00-06:00', 60, 'scheduled'),
  game('g-3', 'team-glacier-knights', 'team-coastal-cruisers', 'facility-aurora-ice', 'Rink A', '2026-04-20T20:00:00-08:00', 90, 'scheduled'),
  game('g-4', 'team-coastal-cruisers', 'team-summit-hoops', 'facility-mission-beach', 'Court 1 (north)', '2026-04-21T10:00:00-07:00', 90, 'scheduled'),
  game('g-5', 'team-avalanche-fc', 'team-mountain-lions', 'facility-yeti-center', 'Field B (Half)', '2026-04-22T18:30:00-06:00', 90, 'scheduled'),
  game('g-6', 'team-summit-hoops', 'team-frosty-flames', 'facility-summit-rec', 'Court 2', '2026-04-23T19:00:00-06:00', 60, 'live', { home: 22, away: 18 }),
  game('g-7', 'team-glacier-knights', 'team-mountain-lions', 'facility-aurora-ice', 'Rink B', '2026-04-23T20:00:00-08:00', 90, 'live', { home: 1, away: 1 }),
  game('g-8', 'team-coastal-cruisers', 'team-frosty-flames', 'facility-mission-beach', 'Court 2 (south)', '2026-04-12T10:00:00-07:00', 90, 'completed', { home: 21, away: 16 }),
  game('g-9', 'team-avalanche-fc', 'team-glacier-knights', 'facility-yeti-center', 'Field A (Full)', '2026-04-12T18:00:00-06:00', 90, 'completed', { home: 3, away: 1 }),
  game('g-10', 'team-summit-hoops', 'team-coastal-cruisers', 'facility-summit-rec', 'Court 1', '2026-04-26T19:00:00-06:00', 60, 'scheduled'),
  game('g-11', 'team-frosty-flames', 'team-mountain-lions', 'facility-yeti-center', 'Field B (Half)', '2026-04-27T19:00:00-06:00', 90, 'cancelled'),
];

export function gamesForDay(dayIso: string): Game[] {
  const day = new Date(dayIso);
  const ymd = day.toISOString().slice(0, 10);
  return GAMES.filter((g) => g.startsAtIso.slice(0, 10) === ymd);
}

export function liveGames(): Game[] {
  return GAMES.filter((g) => g.status === 'live');
}

export function upcomingGames(limit = 10): Game[] {
  return GAMES.filter((g) => g.status === 'scheduled')
    .sort((a, b) => a.startsAtIso.localeCompare(b.startsAtIso))
    .slice(0, limit);
}

export const STATUS_LABEL: Record<GameStatus, string> = {
  scheduled: 'Scheduled',
  live: 'Live',
  completed: 'Final',
  cancelled: 'Cancelled',
  postponed: 'Postponed',
};
