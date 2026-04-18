export type LeagueStatus = 'draft' | 'published' | 'archived';
export type SportKey = 'soccer' | 'basketball' | 'volleyball' | 'tennis' | 'baseball' | 'hockey';

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
  registrationCloseIso: string;
  feeCents: number;
  maxTeams: number;
  registeredTeams: number;
  registeredPlayers: number;
  description: string;
  formatLabel: string;
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
    registrationCloseIso: '2026-04-08',
    feeCents: 192000,
    maxTeams: 12,
    registeredTeams: 9,
    registeredPlayers: 142,
    description:
      '8-week regular season + single-elim playoff. Sunday matches at Yeti Center.',
    formatLabel: 'Round-robin · Playoff',
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
    registrationCloseIso: '2026-08-01',
    feeCents: 360000,
    maxTeams: 12,
    registeredTeams: 11,
    registeredPlayers: 198,
    description: '12-game season + best-of-3 playoffs. Officials and rinks included.',
    formatLabel: 'Round-robin · Best-of-3',
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
    registrationCloseIso: '2026-05-15',
    feeCents: 96000,
    maxTeams: 16,
    registeredTeams: 4,
    registeredPlayers: 26,
    description: '6 Sundays. Bring sunscreen. We provide nets and shade.',
    formatLabel: 'Round-robin',
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
    registrationCloseIso: '2026-04-05',
    feeCents: 144000,
    maxTeams: 10,
    registeredTeams: 7,
    registeredPlayers: 84,
    description: 'Weeknight pickup at Summit Rec Center. Refs included.',
    formatLabel: 'Round-robin',
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
    registrationCloseIso: '2026-06-01',
    feeCents: 12000,
    maxTeams: 32,
    registeredTeams: 0,
    registeredPlayers: 0,
    description:
      'Round-robin doubles at Highland Tennis Club. Self-scheduled matches.',
    formatLabel: 'Self-scheduled',
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
    registrationCloseIso: '2025-08-25',
    feeCents: 84000,
    maxTeams: 8,
    registeredTeams: 8,
    registeredPlayers: 96,
    description: 'Sunday morning slow-pitch with grilled-out finals.',
    formatLabel: 'Round-robin · Final',
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
