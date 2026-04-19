import type { Game } from '../mocks/games';
import { TEAMS } from '../mocks/teams';
import { FACILITIES } from '../mocks/facilities';

/**
 * Fixture generation. Mock-only — produces a list of `Game` objects
 * that the schedule store can absorb. Algorithms are deterministic so
 * the wizard preview matches what gets generated on confirm.
 */

export type FixtureFormat =
  | 'round_robin_single'
  | 'round_robin_double'
  | 'single_elimination'
  | 'round_robin_playoff';

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sun = 0

export interface FixtureInput {
  leagueId: string;
  format: FixtureFormat;
  startDateYmd: string; // YYYY-MM-DD
  weekdays: Weekday[]; // play days each week (≥1)
  timeSlots: string[]; // 'HH:MM' clock times, ≥1
  durationMinutes: number;
  facilityId: string; // facility used for all games (rotates spaces)
  spaceNames: string[]; // ordered space rotation
  startGameNumber?: number; // for id namespacing
}

export interface FixturePreview {
  rounds: { roundLabel: string; games: Game[] }[];
  totalGames: number;
  weekendsUsed: number;
}

/* ------------------------------------------------------------------ *
 *  Round robin (Berger / circle method)                              *
 * ------------------------------------------------------------------ */

interface PairingRound {
  roundIndex: number;
  pairs: { home: string; away: string }[]; // team ids
}

function roundRobinPairings(
  teamIds: string[],
  doubleRound: boolean,
): PairingRound[] {
  if (teamIds.length < 2) return [];
  // Pad to even with a sentinel "BYE" so the algorithm is uniform.
  const ids = [...teamIds];
  if (ids.length % 2 === 1) ids.push('__BYE__');
  const n = ids.length;
  const half = n / 2;

  const rounds: PairingRound[] = [];
  // Fix the first team; rotate the remaining clockwise each round.
  let rotating = ids.slice(1);

  for (let r = 0; r < n - 1; r++) {
    const positions = [ids[0]!, ...rotating];
    const pairs: { home: string; away: string }[] = [];
    for (let m = 0; m < half; m++) {
      const a = positions[m]!;
      const b = positions[n - 1 - m]!;
      if (a === '__BYE__' || b === '__BYE__') continue;
      // Alternate home/away each round to keep balance.
      const homeFirst = (r + m) % 2 === 0;
      pairs.push({
        home: homeFirst ? a : b,
        away: homeFirst ? b : a,
      });
    }
    rounds.push({ roundIndex: r, pairs });
    // Rotate `rotating` clockwise: last → first.
    rotating = [rotating[rotating.length - 1]!, ...rotating.slice(0, -1)];
  }

  if (!doubleRound) return rounds;

  // Second leg: swap home/away.
  const secondLeg = rounds.map((rd, i) => ({
    roundIndex: rounds.length + i,
    pairs: rd.pairs.map((p) => ({ home: p.away, away: p.home })),
  }));
  return [...rounds, ...secondLeg];
}

/* ------------------------------------------------------------------ *
 *  Single elimination (round 1 only — we don't know the winners yet) *
 * ------------------------------------------------------------------ */

function singleEliminationRound1(teamIds: string[]): PairingRound[] {
  if (teamIds.length < 2) return [];
  // Pad to next power of 2 with "byes" assigned to top seeds.
  const bracketSize = 2 ** Math.ceil(Math.log2(teamIds.length));
  const padded = [...teamIds];
  while (padded.length < bracketSize) padded.push('__BYE__');

  // Standard seeding: 1 v N, 4 v N-3, 2 v N-1, 3 v N-2 …
  // For mock simplicity we pair 1↔N, 2↔N-1, etc.
  const pairs: { home: string; away: string }[] = [];
  for (let i = 0; i < padded.length / 2; i++) {
    const a = padded[i]!;
    const b = padded[padded.length - 1 - i]!;
    if (a === '__BYE__' || b === '__BYE__') continue;
    pairs.push({ home: a, away: b });
  }
  return [{ roundIndex: 0, pairs }];
}

/* ------------------------------------------------------------------ *
 *  Date math                                                         *
 * ------------------------------------------------------------------ */

function ymdToDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map((n) => Number(n));
  return new Date(Date.UTC(y!, m! - 1, d!));
}

function dateToYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function nextMatchingDay(start: Date, weekdays: Weekday[]): Date {
  const d = new Date(start);
  for (let i = 0; i < 14; i++) {
    if (weekdays.includes(d.getUTCDay() as Weekday)) return d;
    d.setUTCDate(d.getUTCDate() + 1);
  }
  // Fallback: just return the start if no matching weekday in 2 weeks
  // (shouldn't happen with at least 1 weekday).
  return start;
}

function combineDateAndTime(ymd: string, time: string): string {
  // time = 'HH:MM'
  return `${ymd}T${time}:00.000Z`;
}

/* ------------------------------------------------------------------ *
 *  Game synthesis                                                    *
 * ------------------------------------------------------------------ */

function makeGame(
  id: string,
  leagueId: string,
  homeTeamId: string,
  awayTeamId: string,
  startsAtIso: string,
  durationMinutes: number,
  facilityId: string,
  spaceName: string,
): Game {
  const home = TEAMS.find((t) => t.id === homeTeamId);
  const away = TEAMS.find((t) => t.id === awayTeamId);
  const facility = FACILITIES.find((f) => f.id === facilityId);
  if (!home || !away || !facility) {
    throw new Error(
      `makeGame: missing team or facility (home=${homeTeamId}, away=${awayTeamId}, facility=${facilityId})`,
    );
  }
  const start = new Date(startsAtIso);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  return {
    id,
    leagueId,
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
    status: 'scheduled',
  };
}

/* ------------------------------------------------------------------ *
 *  Public entry points                                               *
 * ------------------------------------------------------------------ */

export interface GenerationResult {
  games: Game[];
  rounds: { roundLabel: string; games: Game[] }[];
  totalGames: number;
}

export function generateFixtures(input: FixtureInput): GenerationResult {
  const teams = TEAMS.filter(
    (t) => t.leagueId === input.leagueId && t.status === 'approved',
  );
  if (teams.length < 2) {
    return { games: [], rounds: [], totalGames: 0 };
  }
  const teamIds = teams.map((t) => t.id);

  const pairingRounds: PairingRound[] = (() => {
    if (input.format === 'round_robin_single')
      return roundRobinPairings(teamIds, false);
    if (input.format === 'round_robin_double')
      return roundRobinPairings(teamIds, true);
    if (input.format === 'single_elimination')
      return singleEliminationRound1(teamIds);
    if (input.format === 'round_robin_playoff') {
      const rr = roundRobinPairings(teamIds, false);
      const playoff = singleEliminationRound1(teamIds).map((r) => ({
        roundIndex: rr.length + r.roundIndex,
        pairs: r.pairs,
      }));
      return [...rr, ...playoff];
    }
    return [];
  })();

  const startDate = ymdToDate(input.startDateYmd);
  const games: Game[] = [];
  const rounds: GenerationResult['rounds'] = [];
  const startNumber = input.startGameNumber ?? 1;
  let cursor = nextMatchingDay(startDate, input.weekdays);
  let runningId = 0;

  for (const round of pairingRounds) {
    const roundGames: Game[] = [];
    let dayCursor = new Date(cursor);
    let timeIndex = 0;
    let spaceIndex = 0;
    for (const pair of round.pairs) {
      // Cycle through time slots; advance day when we exceed slot count
      // for spaces × times.
      const time = input.timeSlots[timeIndex % input.timeSlots.length]!;
      const space = input.spaceNames[spaceIndex % input.spaceNames.length]!;

      const startsAtIso = combineDateAndTime(dateToYmd(dayCursor), time);
      const id = `gen-${input.leagueId}-${startNumber + runningId}`;
      const game = makeGame(
        id,
        input.leagueId,
        pair.home,
        pair.away,
        startsAtIso,
        input.durationMinutes,
        input.facilityId,
        space,
      );
      games.push(game);
      roundGames.push(game);
      runningId++;

      // Rotate space first; once we wrap, advance time slot.
      spaceIndex++;
      if (spaceIndex % input.spaceNames.length === 0) {
        timeIndex++;
      }
    }

    const isPlayoff =
      input.format === 'round_robin_playoff' &&
      round.roundIndex >=
        roundRobinPairings(teamIds, false).length;
    const roundLabel = isPlayoff
      ? 'Playoff round 1'
      : input.format === 'single_elimination'
      ? 'Bracket round 1'
      : `Round ${round.roundIndex + 1}`;
    rounds.push({ roundLabel, games: roundGames });

    // Advance cursor by 7 days for the next round.
    cursor = new Date(cursor);
    cursor.setUTCDate(cursor.getUTCDate() + 7);
    cursor = nextMatchingDay(cursor, input.weekdays);
  }

  return { games, rounds, totalGames: games.length };
}

export const FORMAT_LABEL: Record<FixtureFormat, string> = {
  round_robin_single: 'Round-robin (single)',
  round_robin_double: 'Round-robin (home + away)',
  single_elimination: 'Single elimination',
  round_robin_playoff: 'Round-robin + playoffs',
};

export const FORMAT_DESCRIPTION: Record<FixtureFormat, string> = {
  round_robin_single:
    'Each team plays every other team once. Best for short seasons.',
  round_robin_double:
    'Each pair plays twice (home + away). Standard league format.',
  single_elimination:
    'Single-elim bracket. Loser is out — best for one-day tournaments.',
  round_robin_playoff:
    'Round-robin season followed by a single-elim playoff bracket.',
};

export const WEEKDAY_OPTIONS: { value: Weekday; label: string; short: string }[] = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];
