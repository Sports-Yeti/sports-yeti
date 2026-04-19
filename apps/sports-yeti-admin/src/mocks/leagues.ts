export type LeagueStatus = 'draft' | 'published' | 'archived';
export type SportKey = 'soccer' | 'basketball' | 'volleyball' | 'tennis' | 'baseball' | 'hockey';
export type LeagueLevel = 'recreational' | 'intermediate' | 'competitive';
export type LeagueFormat =
  | 'round_robin'
  | 'single_elim'
  | 'round_robin_playoff'
  | 'self_scheduled';
export type LeagueCadence = 'weekly' | 'biweekly' | 'mixed';

export const LEAGUE_FORMAT_LABEL: Record<LeagueFormat, string> = {
  round_robin: 'Round-robin',
  single_elim: 'Single elimination',
  round_robin_playoff: 'Round-robin · Playoff',
  self_scheduled: 'Self-scheduled',
};

export const LEAGUE_FORMAT_DESCRIPTION: Record<LeagueFormat, string> = {
  round_robin:
    'Every team plays every other team once. No bracket — standings decide the season.',
  single_elim:
    'Bracketed tournament. One loss eliminates a team. Best for one-day events.',
  round_robin_playoff:
    'Round-robin regular season followed by a single- or double-elimination playoff.',
  self_scheduled:
    'Teams pick their own match dates inside the season window. Best for clubs and ladders.',
};

export const LEAGUE_LEVEL_LABEL: Record<LeagueLevel, string> = {
  recreational: 'Recreational',
  intermediate: 'Intermediate',
  competitive: 'Competitive',
};

export const LEAGUE_CADENCE_LABEL: Record<LeagueCadence, string> = {
  weekly: 'Once a week',
  biweekly: 'Every other week',
  mixed: 'Mixed cadence',
};

export interface League {
  id: string;
  name: string;
  sport: SportKey;
  sportLabel: string;
  city: string;
  status: LeagueStatus;
  seasonName: string;
  seasonStartIso: string;
  seasonEndIso: string;
  registrationOpenIso: string;
  registrationCloseIso: string;
  feeCents: number;
  maxTeams: number;
  registeredTeams: number;
  registeredPlayers: number;
  description: string;
  /** Pre-computed for legacy display surfaces. */
  formatLabel: string;
  /** Structured format used by the wizard's "Format" step. */
  format: LeagueFormat;
  /** Number of divisions inside the league (1 = no divisions). */
  divisionCount: number;
  /** Skill / commitment level. */
  level: LeagueLevel;
  /** "Sun · 9 AM-12 PM" — the canonical recurring slot. */
  weeklySlotLabel: string;
  cadence: LeagueCadence;
  rulesUrl?: string;
  createdAtIso: string;
}

export const LEAGUES: League[] = [
  {
    id: 'league-mile-high-spring',
    name: 'Mile High Spring League',
    sport: 'soccer',
    sportLabel: 'Co-ed 7v7 Soccer',
    city: 'Denver, CO',
    status: 'published',
    seasonName: 'Spring 2026',
    seasonStartIso: '2026-04-15',
    seasonEndIso: '2026-06-30',
    registrationOpenIso: '2026-02-15',
    registrationCloseIso: '2026-04-08',
    feeCents: 192000,
    maxTeams: 12,
    registeredTeams: 9,
    registeredPlayers: 142,
    description:
      '8-week regular season + single-elim playoff. Sunday matches at Yeti Center.',
    formatLabel: 'Round-robin · Playoff',
    format: 'round_robin_playoff',
    divisionCount: 2,
    level: 'intermediate',
    weeklySlotLabel: 'Sun · 9 AM – 1 PM',
    cadence: 'weekly',
    createdAtIso: '2026-02-04T16:00:00Z',
  },
  {
    id: 'league-aurora-fall-hockey',
    name: 'Aurora Fall Hockey D2',
    sport: 'hockey',
    sportLabel: 'Ice Hockey 5v5',
    city: 'Anchorage, AK',
    status: 'published',
    seasonName: 'Fall 2026',
    seasonStartIso: '2026-09-04',
    seasonEndIso: '2026-12-15',
    registrationOpenIso: '2026-06-01',
    registrationCloseIso: '2026-08-01',
    feeCents: 360000,
    maxTeams: 12,
    registeredTeams: 11,
    registeredPlayers: 198,
    description: '12-game season + best-of-3 playoffs. Officials and rinks included.',
    formatLabel: 'Round-robin · Best-of-3',
    format: 'round_robin_playoff',
    divisionCount: 1,
    level: 'competitive',
    weeklySlotLabel: 'Sat · 7 PM – 11 PM',
    cadence: 'weekly',
    createdAtIso: '2026-03-20T14:00:00Z',
  },
  {
    id: 'league-coastal-volley',
    name: 'Coastal Volley Open',
    sport: 'volleyball',
    sportLabel: 'Beach Volleyball 4v4',
    city: 'San Diego, CA',
    status: 'published',
    seasonName: 'Summer 2026',
    seasonStartIso: '2026-06-01',
    seasonEndIso: '2026-08-15',
    registrationOpenIso: '2026-04-15',
    registrationCloseIso: '2026-05-15',
    feeCents: 96000,
    maxTeams: 16,
    registeredTeams: 4,
    registeredPlayers: 26,
    description: '6 Sundays. Bring sunscreen. We provide nets and shade.',
    formatLabel: 'Round-robin',
    format: 'round_robin',
    divisionCount: 1,
    level: 'recreational',
    weeklySlotLabel: 'Sun · 10 AM – 1 PM',
    cadence: 'weekly',
    createdAtIso: '2026-04-01T12:00:00Z',
  },
  {
    id: 'league-summit-hoops',
    name: 'Summit Hoops Co-ed',
    sport: 'basketball',
    sportLabel: 'Co-ed Basketball 5v5',
    city: 'Boulder, CO',
    status: 'published',
    seasonName: 'Spring 2026',
    seasonStartIso: '2026-04-12',
    seasonEndIso: '2026-06-21',
    registrationOpenIso: '2026-02-12',
    registrationCloseIso: '2026-04-05',
    feeCents: 144000,
    maxTeams: 10,
    registeredTeams: 7,
    registeredPlayers: 84,
    description: 'Weeknight pickup at Summit Rec Center. Refs included.',
    formatLabel: 'Round-robin',
    format: 'round_robin',
    divisionCount: 1,
    level: 'recreational',
    weeklySlotLabel: 'Tue + Thu · 7 PM – 10 PM',
    cadence: 'mixed',
    createdAtIso: '2026-02-12T10:00:00Z',
  },
  {
    id: 'league-front-range-tennis',
    name: 'Front Range Tennis Doubles',
    sport: 'tennis',
    sportLabel: 'Tennis Doubles',
    city: 'Denver, CO',
    status: 'draft',
    seasonName: 'Summer 2026',
    seasonStartIso: '2026-06-15',
    seasonEndIso: '2026-08-31',
    registrationOpenIso: '2026-04-10',
    registrationCloseIso: '2026-06-01',
    feeCents: 12000,
    maxTeams: 32,
    registeredTeams: 0,
    registeredPlayers: 0,
    description:
      'Round-robin doubles at Highland Tennis Club. Self-scheduled matches.',
    formatLabel: 'Self-scheduled',
    format: 'self_scheduled',
    divisionCount: 2,
    level: 'intermediate',
    weeklySlotLabel: 'Self-scheduled · Anytime',
    cadence: 'mixed',
    createdAtIso: '2026-04-10T09:00:00Z',
  },
  {
    id: 'league-riverside-softball',
    name: 'Riverside Softball Sundays',
    sport: 'baseball',
    sportLabel: 'Slow-pitch Softball',
    city: 'Denver, CO',
    status: 'archived',
    seasonName: 'Fall 2025',
    seasonStartIso: '2025-09-08',
    seasonEndIso: '2025-11-17',
    registrationOpenIso: '2025-07-15',
    registrationCloseIso: '2025-08-25',
    feeCents: 84000,
    maxTeams: 8,
    registeredTeams: 8,
    registeredPlayers: 96,
    description: 'Sunday morning slow-pitch with grilled-out finals.',
    formatLabel: 'Round-robin · Final',
    format: 'round_robin_playoff',
    divisionCount: 1,
    level: 'recreational',
    weeklySlotLabel: 'Sun · 9 AM – 1 PM',
    cadence: 'weekly',
    createdAtIso: '2025-07-12T17:00:00Z',
  },
];

export function leagueById(id: string): League | undefined {
  return LEAGUES.find((l) => l.id === id);
}

export const SPORT_OPTIONS: { value: SportKey; label: string }[] = [
  { value: 'soccer', label: 'Soccer' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'volleyball', label: 'Volleyball' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'baseball', label: 'Baseball / Softball' },
  { value: 'hockey', label: 'Hockey' },
];

export const FORMAT_OPTIONS: { value: LeagueFormat; label: string }[] = [
  { value: 'round_robin', label: LEAGUE_FORMAT_LABEL.round_robin },
  { value: 'single_elim', label: LEAGUE_FORMAT_LABEL.single_elim },
  {
    value: 'round_robin_playoff',
    label: LEAGUE_FORMAT_LABEL.round_robin_playoff,
  },
  { value: 'self_scheduled', label: LEAGUE_FORMAT_LABEL.self_scheduled },
];

export const LEVEL_OPTIONS: { value: LeagueLevel; label: string }[] = [
  { value: 'recreational', label: LEAGUE_LEVEL_LABEL.recreational },
  { value: 'intermediate', label: LEAGUE_LEVEL_LABEL.intermediate },
  { value: 'competitive', label: LEAGUE_LEVEL_LABEL.competitive },
];

export const CADENCE_OPTIONS: { value: LeagueCadence; label: string }[] = [
  { value: 'weekly', label: LEAGUE_CADENCE_LABEL.weekly },
  { value: 'biweekly', label: LEAGUE_CADENCE_LABEL.biweekly },
  { value: 'mixed', label: LEAGUE_CADENCE_LABEL.mixed },
];
