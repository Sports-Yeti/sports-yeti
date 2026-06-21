import { peopleByKind, type Person } from './people';
import { LEAGUES, type SportKey } from './leagues';

export type TeamStatus = 'pending' | 'approved' | 'rejected' | 'archived';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';

export interface RosterMember {
  id: string;
  playerId: string;
  name: string;
  avatar: string;
  position: string;
  role: 'captain' | 'coach' | 'member';
  paymentStatus: PaymentStatus;
}

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  leagueId: string;
  leagueName: string;
  sport: SportKey;
  status: TeamStatus;
  appliedAtIso: string;
  approvedAtIso?: string;
  captainId: string;
  rosterMax: number;
  description: string;
  feeTotalCents: number;
  feePerPlayerCents: number;
  feeCollectedCents: number;
  wins: number;
  losses: number;
  ties: number;
  streak: 'W3' | 'W2' | 'W1' | 'L1' | 'L2' | '–';
  roster: RosterMember[];
}

const players = peopleByKind('player');

function rosterFromIndex(start: number, count: number, positions: string[]): RosterMember[] {
  return Array.from({ length: count }, (_, i) => {
    const p: Person | undefined = players[(start + i) % players.length];
    if (!p) throw new Error('Mock data: no player available');
    return {
      id: `rm-${start + i}`,
      playerId: p.id,
      name: p.name,
      avatar: p.avatar,
      position: i === 0 ? `Captain · ${positions[0]!}` : positions[i % positions.length]!,
      role: i === 0 ? 'captain' : 'member',
      paymentStatus:
        i === 0 ? 'paid' : i % 5 === 0 ? 'overdue' : i % 3 === 0 ? 'pending' : 'paid',
    };
  });
}

export const TEAMS: Team[] = [
  {
    id: 'team-avalanche-fc',
    name: 'Avalanche FC',
    abbreviation: 'AVA',
    leagueId: 'league-mile-high-spring',
    leagueName: 'Mile High Spring League',
    sport: 'soccer',
    status: 'approved',
    appliedAtIso: '2026-02-12T16:00:00Z',
    approvedAtIso: '2026-02-13T11:30:00Z',
    captainId: players[0]!.id,
    rosterMax: 16,
    description: "Mile High's most consistent co-ed roster. Practice Wednesday nights.",
    feeTotalCents: 192000,
    feePerPlayerCents: 12000,
    feeCollectedCents: 132000,
    wins: 6,
    losses: 2,
    ties: 1,
    streak: 'W3',
    roster: rosterFromIndex(0, 14, ['ST', 'CM', 'CB', 'GK', 'LW', 'RB']),
  },
  {
    id: 'team-glacier-knights',
    name: 'Glacier Knights',
    abbreviation: 'GLA',
    leagueId: 'league-aurora-fall-hockey',
    leagueName: 'Aurora Fall Hockey D2',
    sport: 'hockey',
    status: 'approved',
    appliedAtIso: '2026-03-20T16:00:00Z',
    approvedAtIso: '2026-03-21T09:30:00Z',
    captainId: players[1]!.id,
    rosterMax: 18,
    description: 'D2 squad with two retired pros. Saturday night games.',
    feeTotalCents: 360000,
    feePerPlayerCents: 20000,
    feeCollectedCents: 220000,
    wins: 8,
    losses: 4,
    ties: 0,
    streak: 'L1',
    roster: rosterFromIndex(14, 12, ['C', 'D', 'RW', 'LW', 'GK']),
  },
  {
    id: 'team-summit-hoops',
    name: 'Summit Hoops',
    abbreviation: 'SUM',
    leagueId: 'league-summit-hoops',
    leagueName: 'Summit Hoops Co-ed',
    sport: 'basketball',
    status: 'approved',
    appliedAtIso: '2026-02-22T16:00:00Z',
    approvedAtIso: '2026-02-23T11:30:00Z',
    captainId: players[2]!.id,
    rosterMax: 10,
    description: 'Casual after-work hoops, all levels welcome.',
    feeTotalCents: 144000,
    feePerPlayerCents: 14400,
    feeCollectedCents: 144000,
    wins: 4,
    losses: 5,
    ties: 0,
    streak: 'W1',
    roster: rosterFromIndex(26, 8, ['PG', 'SG', 'SF', 'PF', 'C']),
  },
  {
    id: 'team-coastal-cruisers',
    name: 'Coastal Cruisers',
    abbreviation: 'CRU',
    leagueId: 'league-coastal-volley',
    leagueName: 'Coastal Volley Open',
    sport: 'volleyball',
    status: 'approved',
    appliedAtIso: '2026-04-05T16:00:00Z',
    approvedAtIso: '2026-04-06T11:30:00Z',
    captainId: players[3]!.id,
    rosterMax: 12,
    description: 'Sunday morning beach volleyball at Mission Beach.',
    feeTotalCents: 96000,
    feePerPlayerCents: 24000,
    feeCollectedCents: 48000,
    wins: 3,
    losses: 1,
    ties: 0,
    streak: 'W2',
    roster: rosterFromIndex(34, 4, ['Setter', 'Hitter', 'Libero']),
  },
  {
    id: 'team-frosty-flames',
    name: 'Frosty Flames',
    abbreviation: 'FRO',
    leagueId: 'league-mile-high-spring',
    leagueName: 'Mile High Spring League',
    sport: 'soccer',
    status: 'pending',
    appliedAtIso: '2026-04-15T16:00:00Z',
    captainId: players[4]!.id,
    rosterMax: 16,
    description: 'New squad applying for Spring 2026 — 12 confirmed players.',
    feeTotalCents: 192000,
    feePerPlayerCents: 16000,
    feeCollectedCents: 0,
    wins: 0,
    losses: 0,
    ties: 0,
    streak: '–',
    roster: rosterFromIndex(8, 12, ['ST', 'CM', 'CB', 'GK', 'LW']),
  },
  {
    id: 'team-mountain-lions',
    name: 'Mountain Lions',
    abbreviation: 'MNT',
    leagueId: 'league-mile-high-spring',
    leagueName: 'Mile High Spring League',
    sport: 'soccer',
    status: 'pending',
    appliedAtIso: '2026-04-16T16:00:00Z',
    captainId: players[5]!.id,
    rosterMax: 16,
    description: 'Returning squad, requesting D2 spot.',
    feeTotalCents: 192000,
    feePerPlayerCents: 16000,
    feeCollectedCents: 0,
    wins: 0,
    losses: 0,
    ties: 0,
    streak: '–',
    roster: rosterFromIndex(20, 14, ['ST', 'CM', 'CB', 'GK', 'LW']),
  },
];

export function teamById(id: string): Team | undefined {
  return TEAMS.find((t) => t.id === id);
}

export function teamsByLeague(leagueId: string): Team[] {
  return TEAMS.filter((t) => t.leagueId === leagueId);
}

export function pendingTeams(): Team[] {
  return TEAMS.filter((t) => t.status === 'pending');
}

export const STATUS_LABEL: Record<TeamStatus, string> = {
  pending: 'Pending',
  approved: 'Active',
  rejected: 'Rejected',
  archived: 'Archived',
};

export const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
  overdue: 'Overdue',
};
