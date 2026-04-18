import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import { Mountain, Snowflake, Trees, Trophy, Waves } from 'lucide-react-native';
import { PLAYER_AVATARS, SARAH_AVATAR } from './avatars';

export type TeamLevel = 'INTERMEDIATE' | 'ADVANCED' | 'RECREATIONAL';

export interface SquadNeed {
  label: string;
  urgent?: boolean;
}

export interface Squad {
  id: string;
  name: string;
  level: TeamLevel;
  location: string;
  sport: string;
  Icon: ComponentType<LucideProps>;
  needs: SquadNeed[];
  helper?: string;
  sportKey: 'soccer' | 'basketball' | 'volleyball' | 'tennis' | 'baseball' | 'hockey';
}

export const SQUADS: Squad[] = [
  {
    id: 'avalanche-fc',
    name: 'Avalanche FC',
    level: 'INTERMEDIATE',
    location: 'Denver, CO',
    sport: "Men's Soccer",
    sportKey: 'soccer',
    Icon: Mountain,
    needs: [
      { label: 'Goalie', urgent: true },
      { label: 'Center Back' },
    ],
  },
  {
    id: 'glacier-knights',
    name: 'Glacier Knights',
    level: 'ADVANCED',
    location: 'Anchorage, AK',
    sport: 'Ice Hockey - D2',
    sportKey: 'hockey',
    Icon: Snowflake,
    needs: [{ label: 'Defensemen' }, { label: 'Right Wing' }],
  },
  {
    id: 'summit-hoops',
    name: 'Summit Hoops',
    level: 'RECREATIONAL',
    location: 'Boulder, CO',
    sport: 'Co-ed Basketball',
    sportKey: 'basketball',
    Icon: Trees,
    needs: [{ label: 'Point Guard' }],
    helper: 'Looking for subs weekly.',
  },
  {
    id: 'coastal-cruisers',
    name: 'Coastal Cruisers',
    level: 'RECREATIONAL',
    location: 'San Diego, CA',
    sport: 'Beach Volleyball',
    sportKey: 'volleyball',
    Icon: Waves,
    needs: [{ label: 'Setter' }, { label: 'Hitter' }],
    helper: 'Sunday morning sessions.',
  },
];

export type TeamMemberRole = 'captain' | 'coach' | 'member';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';

export interface RosterMember {
  id: string;
  playerId: string;
  name: string;
  handle: string;
  avatar: string;
  position: string;
  role: TeamMemberRole;
  experience: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  paymentStatus: PaymentStatus;
  isYou?: boolean;
}

export interface TeamStats {
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  streak: string;
}

export interface TeamSchedule {
  id: string;
  date: string; // friendly
  opponent: string;
  opponentAbbreviation: string;
  location: string;
  result?: { home: number; away: number; outcome: 'W' | 'L' | 'T' };
  upcoming?: boolean;
}

export interface TeamDetail {
  id: string;
  name: string;
  abbreviation: string;
  sport: string;
  sportKey: Squad['sportKey'];
  location: string;
  level: TeamLevel;
  league?: { id: string; name: string };
  description: string;
  stats: TeamStats;
  roster: RosterMember[];
  rosterMax: number;
  schedule: TeamSchedule[];
  Icon: ComponentType<LucideProps>;
  isCaptain: boolean;
  hasUnpaidShare: boolean;
  feeTotalCents: number;
  perPlayerCents: number;
  currency: 'USD';
}

export const TEAM_DETAILS: Record<string, TeamDetail> = {
  'avalanche-fc': {
    id: 'avalanche-fc',
    name: 'Avalanche FC',
    abbreviation: 'AVA',
    sport: "Men's Soccer 11v11",
    sportKey: 'soccer',
    location: 'Denver, CO',
    level: 'INTERMEDIATE',
    league: { id: 'mile-high-spring', name: 'Mile High Spring League' },
    description:
      "We're a competitive but friendly squad in the Mile High Spring League. Practice Wednesdays, matches Sunday mornings.",
    stats: {
      wins: 6,
      losses: 2,
      ties: 1,
      pointsFor: 22,
      pointsAgainst: 11,
      streak: 'W3',
    },
    roster: [
      {
        id: 'm-1',
        playerId: 'p-marcus',
        name: 'Marcus L.',
        handle: '@marcus_strikes',
        avatar: PLAYER_AVATARS[0]!,
        position: 'Captain · ST',
        role: 'captain',
        experience: 'advanced',
        paymentStatus: 'paid',
      },
      {
        id: 'm-2',
        playerId: 'p-sarah',
        name: 'Sarah Jenkins',
        handle: '@jenkins_yeti',
        avatar: SARAH_AVATAR,
        position: 'CM',
        role: 'member',
        experience: 'intermediate',
        paymentStatus: 'pending',
        isYou: true,
      },
      {
        id: 'm-3',
        playerId: 'p-rio',
        name: 'Rio T.',
        handle: '@rio_t',
        avatar: PLAYER_AVATARS[2]!,
        position: 'CB',
        role: 'member',
        experience: 'intermediate',
        paymentStatus: 'paid',
      },
      {
        id: 'm-4',
        playerId: 'p-ash',
        name: 'Ash D.',
        handle: '@ash_d',
        avatar: PLAYER_AVATARS[3]!,
        position: 'GK',
        role: 'member',
        experience: 'pro',
        paymentStatus: 'overdue',
      },
      {
        id: 'm-5',
        playerId: 'p-leo',
        name: 'Leo P.',
        handle: '@leo_p',
        avatar: PLAYER_AVATARS[4]!,
        position: 'LW',
        role: 'member',
        experience: 'intermediate',
        paymentStatus: 'pending',
      },
      {
        id: 'm-6',
        playerId: 'p-kim',
        name: 'Kim H.',
        handle: '@kim_h',
        avatar: PLAYER_AVATARS[5]!,
        position: 'RB',
        role: 'coach',
        experience: 'pro',
        paymentStatus: 'paid',
      },
    ],
    rosterMax: 16,
    schedule: [
      {
        id: 's-1',
        date: 'Sun · Apr 14',
        opponent: 'Glacier Knights',
        opponentAbbreviation: 'GLA',
        location: 'Field A · Yeti Center',
        result: { home: 3, away: 1, outcome: 'W' },
      },
      {
        id: 's-2',
        date: 'Sun · Apr 21',
        opponent: 'Riverside United',
        opponentAbbreviation: 'RSU',
        location: 'Riverside Pitch 2',
        upcoming: true,
      },
      {
        id: 's-3',
        date: 'Sun · Apr 28',
        opponent: 'Front Range FC',
        opponentAbbreviation: 'FRG',
        location: 'Field B · Yeti Center',
        upcoming: true,
      },
    ],
    Icon: Mountain,
    isCaptain: false,
    hasUnpaidShare: true,
    feeTotalCents: 192000,
    perPlayerCents: 12000,
    currency: 'USD',
  },
  'glacier-knights': {
    id: 'glacier-knights',
    name: 'Glacier Knights',
    abbreviation: 'GLA',
    sport: 'Ice Hockey D2',
    sportKey: 'hockey',
    location: 'Anchorage, AK',
    level: 'ADVANCED',
    league: { id: 'aurora-hockey', name: 'Aurora Hockey League' },
    description:
      'Long-time D2 squad with a couple of recently retired pros. Practice every Tuesday, games Saturday nights.',
    stats: {
      wins: 8,
      losses: 4,
      ties: 0,
      pointsFor: 41,
      pointsAgainst: 28,
      streak: 'L1',
    },
    roster: [
      {
        id: 'g-1',
        playerId: 'p-bjorn',
        name: 'Björn K.',
        handle: '@bjorn_k',
        avatar: PLAYER_AVATARS[1]!,
        position: 'Captain · C',
        role: 'captain',
        experience: 'pro',
        paymentStatus: 'paid',
      },
      {
        id: 'g-2',
        playerId: 'p-eli',
        name: 'Eli M.',
        handle: '@eli_m',
        avatar: PLAYER_AVATARS[6]!,
        position: 'D',
        role: 'member',
        experience: 'advanced',
        paymentStatus: 'paid',
      },
      {
        id: 'g-3',
        playerId: 'p-tara',
        name: 'Tara V.',
        handle: '@tara_v',
        avatar: PLAYER_AVATARS[7]!,
        position: 'RW',
        role: 'member',
        experience: 'advanced',
        paymentStatus: 'pending',
      },
    ],
    rosterMax: 18,
    schedule: [
      {
        id: 'gs-1',
        date: 'Sat · Apr 12',
        opponent: 'Tundra Wolves',
        opponentAbbreviation: 'TUN',
        location: 'Aurora Ice',
        result: { home: 2, away: 4, outcome: 'L' },
      },
      {
        id: 'gs-2',
        date: 'Sat · Apr 19',
        opponent: 'Kodiak FC',
        opponentAbbreviation: 'KOD',
        location: 'Aurora Ice',
        upcoming: true,
      },
    ],
    Icon: Snowflake,
    isCaptain: false,
    hasUnpaidShare: false,
    feeTotalCents: 360000,
    perPlayerCents: 20000,
    currency: 'USD',
  },
  'summit-hoops': {
    id: 'summit-hoops',
    name: 'Summit Hoops',
    abbreviation: 'SUM',
    sport: 'Co-ed Basketball 5v5',
    sportKey: 'basketball',
    location: 'Boulder, CO',
    level: 'RECREATIONAL',
    league: undefined,
    description:
      'Casual after-work hoops, all levels welcome. We use the gym at Summit Rec on Tuesdays and Thursdays.',
    stats: {
      wins: 4,
      losses: 5,
      ties: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      streak: 'W1',
    },
    roster: [
      {
        id: 'sh-1',
        playerId: 'p-jamie',
        name: 'Jamie R.',
        handle: '@jamie_r',
        avatar: PLAYER_AVATARS[2]!,
        position: 'Captain · PG',
        role: 'captain',
        experience: 'intermediate',
        paymentStatus: 'paid',
      },
      {
        id: 'sh-2',
        playerId: 'p-sarah',
        name: 'Sarah Jenkins',
        handle: '@jenkins_yeti',
        avatar: SARAH_AVATAR,
        position: 'SF',
        role: 'member',
        experience: 'intermediate',
        paymentStatus: 'paid',
        isYou: true,
      },
    ],
    rosterMax: 10,
    schedule: [
      {
        id: 'sh-s-1',
        date: 'Thu · Apr 17',
        opponent: 'Open Gym (Casual)',
        opponentAbbreviation: 'OG',
        location: 'Summit Rec Court 2',
        upcoming: true,
      },
    ],
    Icon: Trees,
    isCaptain: false,
    hasUnpaidShare: false,
    feeTotalCents: 0,
    perPlayerCents: 0,
    currency: 'USD',
  },
  'coastal-cruisers': {
    id: 'coastal-cruisers',
    name: 'Coastal Cruisers',
    abbreviation: 'CRU',
    sport: 'Beach Volleyball 4v4',
    sportKey: 'volleyball',
    location: 'San Diego, CA',
    level: 'RECREATIONAL',
    description:
      'Sunday morning beach volleyball at Mission Beach. We rotate every match. Coffee + bagels after.',
    stats: { wins: 3, losses: 1, ties: 0, pointsFor: 0, pointsAgainst: 0, streak: 'W2' },
    roster: [
      {
        id: 'cc-1',
        playerId: 'p-coast',
        name: 'Coast Squad',
        handle: '@coast_squad',
        avatar: PLAYER_AVATARS[3]!,
        position: 'Captain · Setter',
        role: 'captain',
        experience: 'advanced',
        paymentStatus: 'paid',
      },
    ],
    rosterMax: 12,
    schedule: [
      {
        id: 'cc-s-1',
        date: 'Sun · Apr 19',
        opponent: 'Mission Aces',
        opponentAbbreviation: 'MSN',
        location: 'Mission Beach Court 4',
        upcoming: true,
      },
    ],
    Icon: Waves,
    isCaptain: false,
    hasUnpaidShare: false,
    feeTotalCents: 0,
    perPlayerCents: 0,
    currency: 'USD',
  },
};

// Player directory (used for invite flow)
export interface DirectoryPlayer {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  position: string;
  experience: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  availability: 'available' | 'looking_for_team' | 'busy';
  city: string;
  sportKey: Squad['sportKey'];
  invited?: boolean;
}

export const DIRECTORY_PLAYERS: DirectoryPlayer[] = [
  {
    id: 'd-marcus',
    name: 'Marcus L.',
    handle: '@marcus_strikes',
    avatar: PLAYER_AVATARS[0]!,
    position: 'Striker',
    experience: 'advanced',
    availability: 'looking_for_team',
    city: 'Denver, CO',
    sportKey: 'soccer',
  },
  {
    id: 'd-rio',
    name: 'Rio T.',
    handle: '@rio_t',
    avatar: PLAYER_AVATARS[2]!,
    position: 'Center Back',
    experience: 'intermediate',
    availability: 'available',
    city: 'Denver, CO',
    sportKey: 'soccer',
  },
  {
    id: 'd-priya',
    name: 'Priya S.',
    handle: '@priya_serves',
    avatar: PLAYER_AVATARS[5]!,
    position: 'Setter',
    experience: 'pro',
    availability: 'looking_for_team',
    city: 'Boulder, CO',
    sportKey: 'volleyball',
  },
  {
    id: 'd-kim',
    name: 'Kim H.',
    handle: '@kim_h',
    avatar: PLAYER_AVATARS[5]!,
    position: 'Right Back',
    experience: 'pro',
    availability: 'busy',
    city: 'Boulder, CO',
    sportKey: 'soccer',
  },
  {
    id: 'd-ash',
    name: 'Ash D.',
    handle: '@ash_d',
    avatar: PLAYER_AVATARS[3]!,
    position: 'Goalkeeper',
    experience: 'pro',
    availability: 'available',
    city: 'Denver, CO',
    sportKey: 'soccer',
  },
  {
    id: 'd-tara',
    name: 'Tara V.',
    handle: '@tara_v',
    avatar: PLAYER_AVATARS[7]!,
    position: 'Right Wing',
    experience: 'advanced',
    availability: 'looking_for_team',
    city: 'Anchorage, AK',
    sportKey: 'hockey',
  },
  {
    id: 'd-leo',
    name: 'Leo P.',
    handle: '@leo_p',
    avatar: PLAYER_AVATARS[4]!,
    position: 'Left Wing',
    experience: 'intermediate',
    availability: 'available',
    city: 'Denver, CO',
    sportKey: 'soccer',
  },
  {
    id: 'd-jamie',
    name: 'Jamie R.',
    handle: '@jamie_r',
    avatar: PLAYER_AVATARS[2]!,
    position: 'Point Guard',
    experience: 'intermediate',
    availability: 'looking_for_team',
    city: 'Boulder, CO',
    sportKey: 'basketball',
  },
];

export interface OpenLeague {
  id: string;
  name: string;
  sportKey: Squad['sportKey'];
  sport: string;
  city: string;
  startDate: string;
  registrationCloses: string;
  registeredTeams: number;
  maxTeams: number;
  feeCents: number;
  Icon: ComponentType<LucideProps>;
  description: string;
  spotsTone: 'brand' | 'warning';
}

export const OPEN_LEAGUES: OpenLeague[] = [
  {
    id: 'mile-high-summer',
    name: 'Mile High Summer League',
    sportKey: 'soccer',
    sport: 'Co-ed 7v7 Soccer',
    city: 'Denver, CO',
    startDate: 'Starts May 15',
    registrationCloses: 'Closes Apr 30',
    registeredTeams: 8,
    maxTeams: 12,
    feeCents: 192000,
    Icon: Trophy,
    description: 'Eight-week summer season with playoffs. Sunday mornings at Yeti Center fields.',
    spotsTone: 'brand',
  },
  {
    id: 'aurora-fall',
    name: 'Aurora Fall Hockey D2',
    sportKey: 'hockey',
    sport: 'Ice Hockey 5v5',
    city: 'Anchorage, AK',
    startDate: 'Starts Sep 4',
    registrationCloses: 'Closes Aug 1',
    registeredTeams: 11,
    maxTeams: 12,
    feeCents: 360000,
    Icon: Snowflake,
    description: 'Twelve-game regular season + best-of-3 playoffs. Officials and locker rooms included.',
    spotsTone: 'warning',
  },
  {
    id: 'coastal-volley',
    name: 'Coastal Volley Open',
    sportKey: 'volleyball',
    sport: 'Beach Volleyball 4v4',
    city: 'San Diego, CA',
    startDate: 'Starts Jun 1',
    registrationCloses: 'Closes May 15',
    registeredTeams: 4,
    maxTeams: 16,
    feeCents: 96000,
    Icon: Waves,
    description: 'Six Sundays. Bring sunscreen. We provide nets, balls, and shade tents.',
    spotsTone: 'brand',
  },
];
