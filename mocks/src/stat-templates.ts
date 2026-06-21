/**
 * Per-sport stat templates.
 *
 * Drives stat-entry forms (admin) and stat-display tiles (mobile profile).
 * Each template is an ordered list of fields. Field types are kept simple —
 * the admin form layer maps `type` to a `<NumberInput>` / `<Toggle>` /
 * `<Input>` from @sports-yeti/ui.
 *
 * Add a new sport here and the stat surfaces light up automatically.
 */

import type { SportKey } from './types';

export type StatFieldType = 'integer' | 'decimal' | 'boolean' | 'text';

export interface StatField {
  /** Storage key — what the field maps to inside the player's stats blob. */
  key: string;
  /** Short label for table headers (e.g. "PTS"). */
  short: string;
  /** Long label for forms (e.g. "Points"). */
  label: string;
  type: StatFieldType;
  /** Help text rendered under the input. */
  description?: string;
  /** Whether to surface this field on the player profile summary. */
  isHero?: boolean;
}

export interface StatTemplate {
  sport: SportKey;
  /** Per-game fields entered after each game. */
  game: StatField[];
  /** Aggregated fields shown on the player profile (computed, not entered). */
  career: StatField[];
}

const SOCCER: StatTemplate = {
  sport: 'soccer',
  game: [
    { key: 'goals', short: 'G', label: 'Goals', type: 'integer', isHero: true },
    { key: 'assists', short: 'A', label: 'Assists', type: 'integer', isHero: true },
    { key: 'shots', short: 'SH', label: 'Shots', type: 'integer' },
    { key: 'shotsOnTarget', short: 'SOT', label: 'Shots on target', type: 'integer' },
    { key: 'yellowCards', short: 'YC', label: 'Yellow cards', type: 'integer' },
    { key: 'redCards', short: 'RC', label: 'Red cards', type: 'integer' },
    { key: 'minutes', short: 'MIN', label: 'Minutes played', type: 'integer' },
  ],
  career: [
    { key: 'gamesPlayed', short: 'GP', label: 'Games played', type: 'integer', isHero: true },
    { key: 'goals', short: 'G', label: 'Goals', type: 'integer', isHero: true },
    { key: 'assists', short: 'A', label: 'Assists', type: 'integer', isHero: true },
    { key: 'cleanSheets', short: 'CS', label: 'Clean sheets', type: 'integer' },
  ],
};

const BASKETBALL: StatTemplate = {
  sport: 'basketball',
  game: [
    { key: 'points', short: 'PTS', label: 'Points', type: 'integer', isHero: true },
    { key: 'rebounds', short: 'REB', label: 'Rebounds', type: 'integer', isHero: true },
    { key: 'assists', short: 'AST', label: 'Assists', type: 'integer', isHero: true },
    { key: 'steals', short: 'STL', label: 'Steals', type: 'integer' },
    { key: 'blocks', short: 'BLK', label: 'Blocks', type: 'integer' },
    { key: 'turnovers', short: 'TO', label: 'Turnovers', type: 'integer' },
    { key: 'fouls', short: 'F', label: 'Personal fouls', type: 'integer' },
    { key: 'minutes', short: 'MIN', label: 'Minutes played', type: 'integer' },
  ],
  career: [
    { key: 'gamesPlayed', short: 'GP', label: 'Games played', type: 'integer', isHero: true },
    { key: 'points', short: 'PTS/G', label: 'Points per game', type: 'decimal', isHero: true },
    { key: 'rebounds', short: 'RPG', label: 'Rebounds per game', type: 'decimal', isHero: true },
    { key: 'assists', short: 'APG', label: 'Assists per game', type: 'decimal' },
  ],
};

const VOLLEYBALL: StatTemplate = {
  sport: 'volleyball',
  game: [
    { key: 'kills', short: 'K', label: 'Kills', type: 'integer', isHero: true },
    { key: 'digs', short: 'D', label: 'Digs', type: 'integer', isHero: true },
    { key: 'blocks', short: 'B', label: 'Blocks', type: 'integer' },
    { key: 'aces', short: 'AC', label: 'Aces', type: 'integer' },
    { key: 'serviceErrors', short: 'SE', label: 'Service errors', type: 'integer' },
    { key: 'sets', short: 'SETS', label: 'Sets played', type: 'integer' },
  ],
  career: [
    { key: 'gamesPlayed', short: 'GP', label: 'Games played', type: 'integer', isHero: true },
    { key: 'kills', short: 'K', label: 'Total kills', type: 'integer', isHero: true },
    { key: 'digs', short: 'D', label: 'Total digs', type: 'integer' },
  ],
};

const TENNIS: StatTemplate = {
  sport: 'tennis',
  game: [
    { key: 'aces', short: 'AC', label: 'Aces', type: 'integer' },
    { key: 'doubleFaults', short: 'DF', label: 'Double faults', type: 'integer' },
    { key: 'firstServePct', short: '1S%', label: 'First serve %', type: 'decimal' },
    { key: 'breakPointsWon', short: 'BPW', label: 'Break points won', type: 'integer' },
    { key: 'setsWon', short: 'SETS', label: 'Sets won', type: 'integer', isHero: true },
  ],
  career: [
    { key: 'matchesPlayed', short: 'MP', label: 'Matches played', type: 'integer', isHero: true },
    { key: 'matchesWon', short: 'MW', label: 'Matches won', type: 'integer', isHero: true },
    { key: 'aces', short: 'AC', label: 'Total aces', type: 'integer' },
  ],
};

const BASEBALL: StatTemplate = {
  sport: 'baseball',
  game: [
    { key: 'atBats', short: 'AB', label: 'At bats', type: 'integer' },
    { key: 'hits', short: 'H', label: 'Hits', type: 'integer', isHero: true },
    { key: 'runs', short: 'R', label: 'Runs', type: 'integer' },
    { key: 'rbis', short: 'RBI', label: 'RBIs', type: 'integer', isHero: true },
    { key: 'homeRuns', short: 'HR', label: 'Home runs', type: 'integer', isHero: true },
    { key: 'strikeouts', short: 'SO', label: 'Strikeouts', type: 'integer' },
    { key: 'walks', short: 'BB', label: 'Walks', type: 'integer' },
  ],
  career: [
    { key: 'gamesPlayed', short: 'GP', label: 'Games played', type: 'integer', isHero: true },
    { key: 'battingAvg', short: 'AVG', label: 'Batting average', type: 'decimal', isHero: true },
    { key: 'homeRuns', short: 'HR', label: 'Home runs', type: 'integer' },
    { key: 'rbis', short: 'RBI', label: 'RBIs', type: 'integer' },
  ],
};

const SOFTBALL: StatTemplate = { ...BASEBALL, sport: 'softball' };

const HOCKEY: StatTemplate = {
  sport: 'hockey',
  game: [
    { key: 'goals', short: 'G', label: 'Goals', type: 'integer', isHero: true },
    { key: 'assists', short: 'A', label: 'Assists', type: 'integer', isHero: true },
    { key: 'shots', short: 'SH', label: 'Shots on goal', type: 'integer' },
    { key: 'penaltyMinutes', short: 'PIM', label: 'Penalty minutes', type: 'integer' },
    { key: 'plusMinus', short: '+/-', label: 'Plus/minus', type: 'integer' },
  ],
  career: [
    { key: 'gamesPlayed', short: 'GP', label: 'Games played', type: 'integer', isHero: true },
    { key: 'goals', short: 'G', label: 'Goals', type: 'integer', isHero: true },
    { key: 'assists', short: 'A', label: 'Assists', type: 'integer', isHero: true },
    { key: 'points', short: 'PTS', label: 'Points', type: 'integer' },
  ],
};

const PICKLEBALL: StatTemplate = {
  sport: 'pickleball',
  game: [
    { key: 'pointsWon', short: 'P', label: 'Points won', type: 'integer', isHero: true },
    { key: 'aces', short: 'AC', label: 'Aces', type: 'integer' },
    { key: 'unforcedErrors', short: 'UE', label: 'Unforced errors', type: 'integer' },
    { key: 'gamesWon', short: 'GW', label: 'Games won', type: 'integer', isHero: true },
  ],
  career: [
    { key: 'matchesPlayed', short: 'MP', label: 'Matches played', type: 'integer', isHero: true },
    { key: 'matchesWon', short: 'MW', label: 'Matches won', type: 'integer', isHero: true },
  ],
};

const FLAG_FOOTBALL: StatTemplate = {
  sport: 'flag_football',
  game: [
    { key: 'touchdowns', short: 'TD', label: 'Touchdowns', type: 'integer', isHero: true },
    { key: 'passYards', short: 'PYD', label: 'Pass yards', type: 'integer' },
    { key: 'rushYards', short: 'RYD', label: 'Rush yards', type: 'integer' },
    { key: 'flagPulls', short: 'FP', label: 'Flag pulls', type: 'integer' },
    { key: 'interceptions', short: 'INT', label: 'Interceptions', type: 'integer' },
  ],
  career: [
    { key: 'gamesPlayed', short: 'GP', label: 'Games played', type: 'integer', isHero: true },
    { key: 'touchdowns', short: 'TD', label: 'Touchdowns', type: 'integer', isHero: true },
  ],
};

const LACROSSE: StatTemplate = {
  sport: 'lacrosse',
  game: [
    { key: 'goals', short: 'G', label: 'Goals', type: 'integer', isHero: true },
    { key: 'assists', short: 'A', label: 'Assists', type: 'integer', isHero: true },
    { key: 'shots', short: 'SH', label: 'Shots', type: 'integer' },
    { key: 'groundBalls', short: 'GB', label: 'Ground balls', type: 'integer' },
    { key: 'turnovers', short: 'TO', label: 'Turnovers', type: 'integer' },
  ],
  career: [
    { key: 'gamesPlayed', short: 'GP', label: 'Games played', type: 'integer', isHero: true },
    { key: 'points', short: 'PTS', label: 'Points', type: 'integer', isHero: true },
  ],
};

export const STAT_TEMPLATES: Record<SportKey, StatTemplate> = {
  soccer: SOCCER,
  basketball: BASKETBALL,
  volleyball: VOLLEYBALL,
  tennis: TENNIS,
  baseball: BASEBALL,
  softball: SOFTBALL,
  hockey: HOCKEY,
  pickleball: PICKLEBALL,
  flag_football: FLAG_FOOTBALL,
  lacrosse: LACROSSE,
};

export function statTemplate(sport: SportKey): StatTemplate {
  return STAT_TEMPLATES[sport];
}

export function heroStatFields(sport: SportKey, scope: 'game' | 'career'): StatField[] {
  return STAT_TEMPLATES[sport][scope].filter((f) => f.isHero);
}
