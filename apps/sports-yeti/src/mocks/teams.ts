import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import {
  Flame,
  Mountain,
  Snowflake,
  Sparkles,
  Sun,
  Trees,
  Trophy,
  Waves,
  Wind,
  Zap,
} from 'lucide-react-native';
import { PLAYER_AVATARS, SARAH_AVATAR } from './avatars';
import type { GeoPoint } from './facilities';

// Approximate city coordinates so Find a Team can filter teams by radius,
// mirroring the Discover map picker. Keyed by the team's display location.
export const CITY_COORDS: Record<string, GeoPoint> = {
  'Denver, CO': { latitude: 39.7392, longitude: -104.9903 },
  'Boulder, CO': { latitude: 40.018, longitude: -105.2766 },
  'San Diego, CA': { latitude: 32.7693, longitude: -117.2519 },
  'Anchorage, AK': { latitude: 61.2181, longitude: -149.9003 },
  'Salt Lake City, UT': { latitude: 40.7608, longitude: -111.891 },
};

// Placeholder city list for the casual-squad create flow. The city field will
// eventually hydrate from a places API; this limited set keeps the typeahead
// functional in the meantime. Keyed list mirrors `CITY_COORDS` plus a few
// nearby metros so search returns something for common queries.
export const MOCK_CITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'Denver, CO', label: 'Denver, CO' },
  { value: 'Boulder, CO', label: 'Boulder, CO' },
  { value: 'Colorado Springs, CO', label: 'Colorado Springs, CO' },
  { value: 'Fort Collins, CO', label: 'Fort Collins, CO' },
  { value: 'San Diego, CA', label: 'San Diego, CA' },
  { value: 'Los Angeles, CA', label: 'Los Angeles, CA' },
  { value: 'Anchorage, AK', label: 'Anchorage, AK' },
  { value: 'Salt Lake City, UT', label: 'Salt Lake City, UT' },
  { value: 'Seattle, WA', label: 'Seattle, WA' },
  { value: 'Portland, OR', label: 'Portland, OR' },
];

export type TeamLevel = 'INTERMEDIATE' | 'ADVANCED' | 'RECREATIONAL';
export type SportKey =
  | 'soccer'
  | 'basketball'
  | 'volleyball'
  | 'tennis'
  | 'baseball'
  | 'hockey';
export type CostMode = 'free' | 'paid';
export type Membership = 'captain' | 'member' | 'pending' | 'none';

// Sport → canonical roster positions used for the position filter on Discover
// and as the captain's roster gap selector.
export const POSITIONS_BY_SPORT: Record<SportKey, string[]> = {
  soccer: [
    'Goalkeeper',
    'Center Back',
    'Right Back',
    'Left Back',
    'Center Mid',
    'Right Mid',
    'Left Mid',
    'Right Wing',
    'Left Wing',
    'Striker',
  ],
  basketball: [
    'Point Guard',
    'Shooting Guard',
    'Small Forward',
    'Power Forward',
    'Center',
  ],
  volleyball: ['Setter', 'Outside Hitter', 'Opposite', 'Middle Blocker', 'Libero'],
  tennis: ['Singles', 'Doubles'],
  baseball: ['Pitcher', 'Catcher', 'Infield', 'Outfield', 'Utility'],
  hockey: ['Goalie', 'Defenseman', 'Center', 'Left Wing', 'Right Wing'],
};

export interface SquadNeed {
  // Position label — matches the canonical list above when applicable.
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
  sportKey: SportKey;
  costMode: CostMode;
  /** Per-player share of the season fee in cents (0 when free). */
  perPlayerCents: number;
  rosterCount: number;
  rosterMax: number;
  /** Current user's relationship to the team. */
  membership: Membership;
  /** Approximate coordinates (from the team's city) for radius filtering. */
  coords: GeoPoint;
}

// ----------------------------------------------------------------------------
// Recruiting roster used by Find a Team. Hydrated from TEAM_DETAILS so the
// "needs", roster fill, and membership states stay in sync everywhere.
// ----------------------------------------------------------------------------

export type TeamMemberRole = 'captain' | 'coach' | 'member';
export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'not_required';

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

export interface PendingApplication {
  id: string;
  playerId: string;
  name: string;
  handle: string;
  avatar: string;
  position: string;
  experience: RosterMember['experience'];
  appliedAt: string;
  message?: string;
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
  date: string;
  opponent: string;
  opponentAbbreviation: string;
  location: string;
  result?: { home: number; away: number; outcome: 'W' | 'L' | 'T' };
  upcoming?: boolean;
}

export type LeagueRegistrationStatus =
  | 'draft'
  | 'pending_admin'
  | 'approved'
  | 'rejected';

export interface LeagueRegistration {
  leagueId: string;
  leagueName: string;
  status: LeagueRegistrationStatus;
  submittedAt: string;
  notesFromAdmin?: string;
}

export type CommitVote = 'in' | 'out' | 'maybe';

export interface CommitPoll {
  id: string;
  /** Set for league-commitment polls; omitted for game polls. */
  leagueId?: string;
  leagueName?: string;
  question: string;
  createdBy: string;
  createdAt: string;
  responses: Record<string, CommitVote>;
  closesAt?: string;
}

export interface CustomPollOption {
  id: string;
  label: string;
}

/**
 * Free-form poll authored in a team chat. Unlike a {@link CommitPoll} (fixed
 * I'm in / Maybe / Can't), the captain sets the options themselves and can
 * allow voters to pick more than one (WhatsApp-style multi-select).
 */
export interface CustomPoll {
  id: string;
  question: string;
  options: CustomPollOption[];
  allowMultiple: boolean;
  createdBy: string;
  createdAt: string;
  closesAt?: string;
  /** voterId -> selected option ids (always an array, even for single-select). */
  responses: Record<string, string[]>;
}

export interface TeamDetail {
  id: string;
  name: string;
  abbreviation: string;
  sport: string;
  sportKey: SportKey;
  location: string;
  level: TeamLevel;
  league?: { id: string; name: string };
  description: string;
  stats: TeamStats;
  roster: RosterMember[];
  rosterMax: number;
  pendingApplications: PendingApplication[];
  schedule: TeamSchedule[];
  Icon: ComponentType<LucideProps>;
  /** True when current user (Sarah) is the captain. */
  isCaptain: boolean;
  /** Current user's membership state. */
  membership: Membership;
  /** True if the user must pay before they can use chat. */
  hasUnpaidShare: boolean;
  costMode: CostMode;
  feeTotalCents: number;
  perPlayerCents: number;
  currency: 'USD';
  /** Captain-side: what the team is currently registered for. */
  leagueRegistration?: LeagueRegistration;
  /** Discoverable open positions used as needs on the squad card. */
  needs: SquadNeed[];
}

/**
 * A team counts as a "league team" once it's accepted into an organized league —
 * either it already has a `league` reference or its registration was approved.
 * League teams collect entry fees directly through the platform (payments route
 * to the league). Everything else is a "custom" squad whose captain settles any
 * league fee externally and marks players paid manually.
 */
export function isLeagueTeam(
  team: Pick<TeamDetail, 'league' | 'leagueRegistration'>,
): boolean {
  return Boolean(team.league) || team.leagueRegistration?.status === 'approved';
}

// ----------------------------------------------------------------------------
// Open leagues — used by both player browse and captain registration flow.
// ----------------------------------------------------------------------------

export interface OpenLeague {
  id: string;
  name: string;
  sportKey: SportKey;
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
  level: TeamLevel;
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
    description:
      'Eight-week summer season with playoffs. Sunday mornings at Yeti Center fields.',
    spotsTone: 'brand',
    level: 'INTERMEDIATE',
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
    description:
      'Twelve-game regular season + best-of-3 playoffs. Officials and locker rooms included.',
    spotsTone: 'warning',
    level: 'ADVANCED',
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
    description:
      'Six Sundays. Bring sunscreen. We provide nets, balls, and shade tents.',
    spotsTone: 'brand',
    level: 'RECREATIONAL',
  },
  {
    id: 'rocky-rec-hoops',
    name: 'Rocky Rec Hoops',
    sportKey: 'basketball',
    sport: 'Co-ed Basketball 5v5',
    city: 'Boulder, CO',
    startDate: 'Starts Jul 8',
    registrationCloses: 'Closes Jun 20',
    registeredTeams: 6,
    maxTeams: 10,
    feeCents: 84000,
    Icon: Trees,
    description:
      'Ten-week rec season at Summit Rec Center. Tuesdays and Thursdays at 7pm.',
    spotsTone: 'brand',
    level: 'RECREATIONAL',
  },
];

// ----------------------------------------------------------------------------
// League details — general org/league info + historical season standings.
// Surfaced when a league card is opened (e.g. tapped from a chat share).
// ----------------------------------------------------------------------------

export interface LeagueOrganization {
  name: string;
  tagline: string;
  foundedYear: number;
  city: string;
  /** Leagues run by a verified organization get a trust badge. */
  verified?: boolean;
  seasonsRun: number;
}

export interface LeagueSeasonStanding {
  /** Final placement, 1-based. */
  rank: number;
  teamName: string;
  abbreviation: string;
  wins: number;
  losses: number;
  ties: number;
  points: number;
  isChampion?: boolean;
}

export interface LeagueSeason {
  id: string;
  /** Display name, e.g. "Summer 2025". */
  name: string;
  year: number;
  teamCount: number;
  champion: string;
  standings: LeagueSeasonStanding[];
}

export interface LeagueDetail {
  id: string;
  name: string;
  sport: string;
  sportKey: SportKey;
  city: string;
  level: TeamLevel;
  /** Play format, e.g. "Co-ed 7v7". */
  format: string;
  description: string;
  Icon: ComponentType<LucideProps>;
  organization: LeagueOrganization;
  /** When matches are played, e.g. "Sunday mornings". */
  cadence: string;
  /** Season structure summary, e.g. "8-week season + playoffs". */
  seasonLengthLabel: string;
  feeCents: number;
  pastSeasons: LeagueSeason[];
}

/** Compact standings builder — points default to 3·W + 1·T (league standard). */
function buildStanding(
  rank: number,
  teamName: string,
  abbreviation: string,
  wins: number,
  losses: number,
  ties = 0,
): LeagueSeasonStanding {
  return {
    rank,
    teamName,
    abbreviation,
    wins,
    losses,
    ties,
    points: wins * 3 + ties,
    isChampion: rank === 1,
  };
}

const MILE_HIGH_ORG: LeagueOrganization = {
  name: 'Mile High Sports Collective',
  tagline: 'Community-run adult leagues across the Front Range since 2014.',
  foundedYear: 2014,
  city: 'Denver, CO',
  verified: true,
  seasonsRun: 22,
};

export const LEAGUE_DETAILS: Record<string, LeagueDetail> = {
  'mile-high-summer': {
    id: 'mile-high-summer',
    name: 'Mile High Summer League',
    sport: 'Soccer',
    sportKey: 'soccer',
    city: 'Denver, CO',
    level: 'INTERMEDIATE',
    format: 'Co-ed 7v7',
    description:
      'Our flagship summer season. Eight weeks of Sunday-morning matches at the Yeti Center fields, capped by a single-elimination playoff weekend. Certified referees, league-provided match balls, and a guaranteed minimum of nine games per team.',
    Icon: Trophy,
    organization: MILE_HIGH_ORG,
    cadence: 'Sunday mornings · 8am–1pm',
    seasonLengthLabel: '8-week season + playoffs',
    feeCents: 192000,
    pastSeasons: [
      {
        id: 'mhs-2025',
        name: 'Summer 2025',
        year: 2025,
        teamCount: 12,
        champion: 'Glacier Knights',
        standings: [
          buildStanding(1, 'Glacier Knights', 'GLA', 9, 1, 0),
          buildStanding(2, 'Avalanche FC', 'AVA', 7, 2, 1),
          buildStanding(3, 'Cherry Creek United', 'CCU', 6, 3, 1),
          buildStanding(4, 'Highland Strikers', 'HLS', 5, 4, 1),
          buildStanding(5, 'Wash Park Wanderers', 'WPW', 3, 6, 1),
          buildStanding(6, 'Sloan Lake SC', 'SLS', 1, 8, 1),
        ],
      },
      {
        id: 'mhs-2024',
        name: 'Summer 2024',
        year: 2024,
        teamCount: 10,
        champion: 'Avalanche FC',
        standings: [
          buildStanding(1, 'Avalanche FC', 'AVA', 8, 1, 1),
          buildStanding(2, 'Glacier Knights', 'GLA', 8, 2, 0),
          buildStanding(3, 'Highland Strikers', 'HLS', 5, 4, 1),
          buildStanding(4, 'Cherry Creek United', 'CCU', 4, 5, 1),
          buildStanding(5, 'Sloan Lake SC', 'SLS', 2, 7, 1),
        ],
      },
    ],
  },
  'mile-high-spring': {
    id: 'mile-high-spring',
    name: 'Mile High Spring League',
    sport: 'Soccer',
    sportKey: 'soccer',
    city: 'Denver, CO',
    level: 'INTERMEDIATE',
    format: "Men's 11v11",
    description:
      'The competitive spring 11-a-side season. Full-field matches on Sunday mornings with promotion and relegation between divisions across the season.',
    Icon: Trophy,
    organization: MILE_HIGH_ORG,
    cadence: 'Sunday mornings',
    seasonLengthLabel: '10-week season + cup',
    feeCents: 180000,
    pastSeasons: [
      {
        id: 'mhsp-2025',
        name: 'Spring 2025',
        year: 2025,
        teamCount: 8,
        champion: 'Riverside United',
        standings: [
          buildStanding(1, 'Riverside United', 'RSU', 8, 1, 1),
          buildStanding(2, 'Avalanche FC', 'AVA', 6, 2, 2),
          buildStanding(3, 'Front Range FC', 'FRF', 5, 4, 1),
          buildStanding(4, 'Capitol Hill SC', 'CAP', 3, 5, 2),
          buildStanding(5, 'Berkeley Lake', 'BRK', 1, 7, 2),
        ],
      },
    ],
  },
  'aurora-fall': {
    id: 'aurora-fall',
    name: 'Aurora Fall Hockey D2',
    sport: 'Ice Hockey',
    sportKey: 'hockey',
    city: 'Anchorage, AK',
    level: 'ADVANCED',
    format: '5v5',
    description:
      'Division 2 fall hockey with a twelve-game regular season and a best-of-three playoff. Officials, scorekeeping, and locker rooms are included in the team fee.',
    Icon: Snowflake,
    organization: {
      name: 'Aurora Ice Association',
      tagline: 'Anchorage’s home for competitive adult hockey.',
      foundedYear: 2009,
      city: 'Anchorage, AK',
      verified: true,
      seasonsRun: 31,
    },
    cadence: 'Weeknights · 7–10pm',
    seasonLengthLabel: '12-game season + best-of-3 playoffs',
    feeCents: 360000,
    pastSeasons: [
      {
        id: 'auf-2024',
        name: 'Fall 2024',
        year: 2024,
        teamCount: 12,
        champion: 'Tundra Wolves',
        standings: [
          buildStanding(1, 'Tundra Wolves', 'TUN', 11, 1, 0),
          buildStanding(2, 'Glacier Bay Bears', 'GBB', 9, 3, 0),
          buildStanding(3, 'Chugach Chargers', 'CHG', 7, 5, 0),
          buildStanding(4, 'Inlet Ice', 'INL', 5, 7, 0),
          buildStanding(5, 'Denali Drifters', 'DEN', 2, 10, 0),
        ],
      },
    ],
  },
  'coastal-volley': {
    id: 'coastal-volley',
    name: 'Coastal Volley Open',
    sport: 'Beach Volleyball',
    sportKey: 'volleyball',
    city: 'San Diego, CA',
    level: 'RECREATIONAL',
    format: '4v4',
    description:
      'Six Sundays of beach volleyball on the sand at Mission Bay. Nets, balls, and shade tents provided — just bring sunscreen. Open to all skill levels.',
    Icon: Waves,
    organization: {
      name: 'Coastal Volley Club',
      tagline: 'Sand, sun, and serves all summer long.',
      foundedYear: 2017,
      city: 'San Diego, CA',
      seasonsRun: 14,
    },
    cadence: 'Sunday afternoons',
    seasonLengthLabel: '6-week season',
    feeCents: 96000,
    pastSeasons: [
      {
        id: 'cvo-2024',
        name: 'Summer 2024',
        year: 2024,
        teamCount: 16,
        champion: 'Pacific Crest',
        standings: [
          buildStanding(1, 'Pacific Crest', 'PAC', 6, 0, 0),
          buildStanding(2, 'La Jolla Locals', 'LJL', 5, 1, 0),
          buildStanding(3, 'Bay Bumpers', 'BAY', 4, 2, 0),
          buildStanding(4, 'Sunset Spikers', 'SUN', 2, 4, 0),
          buildStanding(5, 'Mission Misfits', 'MIS', 1, 5, 0),
        ],
      },
    ],
  },
  'rocky-rec-hoops': {
    id: 'rocky-rec-hoops',
    name: 'Rocky Rec Hoops',
    sport: 'Basketball',
    sportKey: 'basketball',
    city: 'Boulder, CO',
    level: 'RECREATIONAL',
    format: 'Co-ed 5v5',
    description:
      'A ten-week recreational basketball season at Summit Rec Center. Tuesday and Thursday tip-offs at 7pm with a relaxed, all-levels-welcome vibe and a short playoff.',
    Icon: Trees,
    organization: {
      name: 'Rocky Mountain Rec League',
      tagline: 'Low-pressure rec sports for Boulder County.',
      foundedYear: 2012,
      city: 'Boulder, CO',
      seasonsRun: 26,
    },
    cadence: 'Tue & Thu · 7pm',
    seasonLengthLabel: '10-week season + playoffs',
    feeCents: 84000,
    pastSeasons: [
      {
        id: 'rrh-2025',
        name: 'Spring 2025',
        year: 2025,
        teamCount: 10,
        champion: 'Flatiron Ballers',
        standings: [
          buildStanding(1, 'Flatiron Ballers', 'FLB', 9, 1, 0),
          buildStanding(2, 'Pearl Street Pros', 'PSP', 7, 3, 0),
          buildStanding(3, 'Chautauqua Crew', 'CHA', 6, 4, 0),
          buildStanding(4, 'Hill Hoopers', 'HIL', 4, 6, 0),
          buildStanding(5, 'Valmont Vipers', 'VAL', 2, 8, 0),
        ],
      },
    ],
  },
};

export function getLeagueDetail(leagueId: string): LeagueDetail | undefined {
  return LEAGUE_DETAILS[leagueId];
}

// ----------------------------------------------------------------------------
// Team details — every state needed to demo the Teams overhaul lives here.
// ----------------------------------------------------------------------------

export const TEAM_DETAILS: Record<string, TeamDetail> = {
  // Paid + member, Sarah hasn't paid yet → chat is locked, payment CTA visible.
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
        position: 'Striker',
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
        position: 'Center Mid',
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
        position: 'Center Back',
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
        position: 'Goalkeeper',
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
        position: 'Left Wing',
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
        position: 'Right Back',
        role: 'coach',
        experience: 'pro',
        paymentStatus: 'paid',
      },
    ],
    rosterMax: 16,
    pendingApplications: [],
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
    membership: 'member',
    hasUnpaidShare: true,
    costMode: 'paid',
    feeTotalCents: 192000,
    perPlayerCents: 12000,
    currency: 'USD',
    needs: [{ label: 'Goalkeeper', urgent: true }, { label: 'Center Back' }],
  },

  // Paid + member, fully paid → chat unlocked. Demo of "good standing" state.
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
        position: 'Center',
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
        position: 'Defenseman',
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
        position: 'Right Wing',
        role: 'member',
        experience: 'advanced',
        paymentStatus: 'pending',
      },
    ],
    rosterMax: 18,
    pendingApplications: [],
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
    membership: 'none',
    hasUnpaidShare: false,
    costMode: 'paid',
    feeTotalCents: 360000,
    perPlayerCents: 20000,
    currency: 'USD',
    needs: [{ label: 'Defenseman' }, { label: 'Right Wing' }],
  },

  // Free + member → no payment gate, chat always open.
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
        position: 'Point Guard',
        role: 'captain',
        experience: 'intermediate',
        paymentStatus: 'not_required',
      },
      {
        id: 'sh-2',
        playerId: 'p-sarah',
        name: 'Sarah Jenkins',
        handle: '@jenkins_yeti',
        avatar: SARAH_AVATAR,
        position: 'Small Forward',
        role: 'member',
        experience: 'intermediate',
        paymentStatus: 'not_required',
        isYou: true,
      },
    ],
    rosterMax: 10,
    pendingApplications: [],
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
    membership: 'member',
    hasUnpaidShare: false,
    costMode: 'free',
    feeTotalCents: 0,
    perPlayerCents: 0,
    currency: 'USD',
    needs: [{ label: 'Point Guard' }],
  },

  // Free + Sarah is captain → captain controls visible, no league registration yet.
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
        playerId: 'p-sarah',
        name: 'Sarah Jenkins',
        handle: '@jenkins_yeti',
        avatar: SARAH_AVATAR,
        position: 'Setter',
        role: 'captain',
        experience: 'advanced',
        paymentStatus: 'not_required',
        isYou: true,
      },
      {
        id: 'cc-2',
        playerId: 'p-coast',
        name: 'Coast Squad',
        handle: '@coast_squad',
        avatar: PLAYER_AVATARS[3]!,
        position: 'Outside Hitter',
        role: 'member',
        experience: 'advanced',
        paymentStatus: 'not_required',
      },
      {
        id: 'cc-3',
        playerId: 'p-priya',
        name: 'Priya S.',
        handle: '@priya_serves',
        avatar: PLAYER_AVATARS[5]!,
        position: 'Opposite',
        role: 'member',
        experience: 'pro',
        paymentStatus: 'not_required',
      },
    ],
    rosterMax: 12,
    pendingApplications: [
      {
        id: 'cc-app-1',
        playerId: 'p-zane',
        name: 'Zane O.',
        handle: '@zane_o',
        avatar: PLAYER_AVATARS[4]!,
        position: 'Middle Blocker',
        experience: 'intermediate',
        appliedAt: '2d ago',
        message: 'Played D1 a few summers ago — would love to sub on Sundays.',
      },
    ],
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
    isCaptain: true,
    membership: 'captain',
    hasUnpaidShare: false,
    costMode: 'free',
    feeTotalCents: 0,
    perPlayerCents: 0,
    currency: 'USD',
    needs: [{ label: 'Middle Blocker' }, { label: 'Libero' }],
  },

  // Paid + Sarah is captain, registered for a league pending admin approval.
  // Demonstrates the captain → league registration → per-player payment flow.
  'mile-high-warriors': {
    id: 'mile-high-warriors',
    name: 'Mile High Warriors',
    abbreviation: 'MHW',
    sport: "Co-ed Soccer 7v7",
    sportKey: 'soccer',
    location: 'Denver, CO',
    level: 'INTERMEDIATE',
    league: undefined,
    description:
      "Founded last fall by a few Bronco alums. We're chasing the Mile High Summer title this year.",
    stats: {
      wins: 5,
      losses: 1,
      ties: 1,
      pointsFor: 19,
      pointsAgainst: 8,
      streak: 'W2',
    },
    roster: [
      {
        id: 'mhw-1',
        playerId: 'p-sarah',
        name: 'Sarah Jenkins',
        handle: '@jenkins_yeti',
        avatar: SARAH_AVATAR,
        position: 'Center Mid',
        role: 'captain',
        experience: 'intermediate',
        paymentStatus: 'paid',
        isYou: true,
      },
      {
        id: 'mhw-2',
        playerId: 'p-marcus',
        name: 'Marcus L.',
        handle: '@marcus_strikes',
        avatar: PLAYER_AVATARS[0]!,
        position: 'Striker',
        role: 'member',
        experience: 'advanced',
        paymentStatus: 'paid',
      },
      {
        id: 'mhw-3',
        playerId: 'p-priya',
        name: 'Priya S.',
        handle: '@priya_serves',
        avatar: PLAYER_AVATARS[5]!,
        position: 'Right Mid',
        role: 'member',
        experience: 'pro',
        paymentStatus: 'pending',
      },
      {
        id: 'mhw-4',
        playerId: 'p-leo',
        name: 'Leo P.',
        handle: '@leo_p',
        avatar: PLAYER_AVATARS[4]!,
        position: 'Left Wing',
        role: 'member',
        experience: 'intermediate',
        paymentStatus: 'pending',
      },
      {
        id: 'mhw-5',
        playerId: 'p-tara',
        name: 'Tara V.',
        handle: '@tara_v',
        avatar: PLAYER_AVATARS[7]!,
        position: 'Center Back',
        role: 'member',
        experience: 'advanced',
        paymentStatus: 'overdue',
      },
      {
        id: 'mhw-6',
        playerId: 'p-eli',
        name: 'Eli M.',
        handle: '@eli_m',
        avatar: PLAYER_AVATARS[6]!,
        position: 'Goalkeeper',
        role: 'member',
        experience: 'advanced',
        paymentStatus: 'paid',
      },
    ],
    rosterMax: 12,
    pendingApplications: [
      {
        id: 'mhw-app-1',
        playerId: 'p-rio',
        name: 'Rio T.',
        handle: '@rio_t',
        avatar: PLAYER_AVATARS[2]!,
        position: 'Right Back',
        experience: 'intermediate',
        appliedAt: '6h ago',
        message: 'Saw your post in the Mile High group — happy to sub or start.',
      },
    ],
    schedule: [
      {
        id: 'mhw-s-1',
        date: 'Sun · May 18',
        opponent: 'Avalanche FC',
        opponentAbbreviation: 'AVA',
        location: 'Yeti Center · Field 3',
        upcoming: true,
      },
    ],
    Icon: Flame,
    isCaptain: true,
    membership: 'captain',
    hasUnpaidShare: false,
    costMode: 'paid',
    feeTotalCents: 192000,
    perPlayerCents: 16000,
    currency: 'USD',
    leagueRegistration: {
      leagueId: 'mile-high-summer',
      leagueName: 'Mile High Summer League',
      status: 'approved',
      submittedAt: '3d ago',
      notesFromAdmin: "Approved — collect each player's $160 share before May 1.",
    },
    needs: [],
  },

  // Paid + Sarah is captain, but a CUSTOM squad (no platform league). The captain
  // pays the outside league fee herself and collects each player's share in
  // person, then marks them paid here. Demonstrates the custom-league join +
  // captain-confirmed payment flow.
  'summit-ballers': {
    id: 'summit-ballers',
    name: 'Summit Ballers',
    abbreviation: 'SMB',
    sport: 'Co-ed Basketball 5v5',
    sportKey: 'basketball',
    location: 'Boulder, CO',
    level: 'INTERMEDIATE',
    league: undefined,
    description:
      "Independent run we organize ourselves at the Boulder Rec Center. I front the gym rental and collect everyone's share before the first night.",
    stats: { wins: 4, losses: 2, ties: 0, pointsFor: 0, pointsAgainst: 0, streak: 'W1' },
    roster: [
      {
        id: 'smb-1',
        playerId: 'p-sarah',
        name: 'Sarah Jenkins',
        handle: '@jenkins_yeti',
        avatar: SARAH_AVATAR,
        position: 'Point Guard',
        role: 'captain',
        experience: 'advanced',
        paymentStatus: 'paid',
        isYou: true,
      },
      {
        id: 'smb-2',
        playerId: 'p-priya',
        name: 'Priya S.',
        handle: '@priya_serves',
        avatar: PLAYER_AVATARS[5]!,
        position: 'Shooting Guard',
        role: 'member',
        experience: 'pro',
        paymentStatus: 'paid',
      },
      {
        id: 'smb-3',
        playerId: 'p-ash',
        name: 'Ash D.',
        handle: '@ash_d',
        avatar: PLAYER_AVATARS[3]!,
        position: 'Center',
        role: 'member',
        experience: 'intermediate',
        paymentStatus: 'pending',
      },
    ],
    rosterMax: 10,
    pendingApplications: [
      {
        id: 'smb-app-1',
        playerId: 'p-leo',
        name: 'Leo P.',
        handle: '@leo_p',
        avatar: PLAYER_AVATARS[4]!,
        position: 'Small Forward',
        experience: 'intermediate',
        appliedAt: '1d ago',
        message: "I can run the wing and I'm good for my share up front. When do you tip off?",
      },
    ],
    schedule: [
      {
        id: 'smb-s-1',
        date: 'Wed · May 21',
        opponent: 'Flatiron Fast Break',
        opponentAbbreviation: 'FFB',
        location: 'Boulder Rec Center · Court 2',
        upcoming: true,
      },
    ],
    Icon: Zap,
    isCaptain: true,
    membership: 'captain',
    hasUnpaidShare: false,
    costMode: 'paid',
    feeTotalCents: 60000,
    perPlayerCents: 6000,
    currency: 'USD',
    needs: [{ label: 'Small Forward' }, { label: 'Power Forward' }],
  },

  // Paid + Sarah is a MEMBER of a custom squad and hasn't paid yet. The captain
  // collects in person, so Sarah can't self-pay — her chat stays locked until
  // the captain marks her paid. Player side of the custom-league payment flow.
  'riverside-rovers': {
    id: 'riverside-rovers',
    name: 'Riverside Rovers',
    abbreviation: 'RIV',
    sport: "Men's Soccer 11v11",
    sportKey: 'soccer',
    location: 'Fort Collins, CO',
    level: 'RECREATIONAL',
    league: undefined,
    description:
      "Pickup-turned-real-team that rents the turf at Rolland Moore on Thursdays. Cap fronts the field cost and we square up at the first session.",
    stats: { wins: 2, losses: 2, ties: 1, pointsFor: 0, pointsAgainst: 0, streak: 'T1' },
    roster: [
      {
        id: 'riv-1',
        playerId: 'p-leo',
        name: 'Leo P.',
        handle: '@leo_p',
        avatar: PLAYER_AVATARS[4]!,
        position: 'Left Wing',
        role: 'captain',
        experience: 'advanced',
        paymentStatus: 'paid',
      },
      {
        id: 'riv-2',
        playerId: 'p-sarah',
        name: 'Sarah Jenkins',
        handle: '@jenkins_yeti',
        avatar: SARAH_AVATAR,
        position: 'Center Mid',
        role: 'member',
        experience: 'intermediate',
        paymentStatus: 'pending',
        isYou: true,
      },
      {
        id: 'riv-3',
        playerId: 'p-marcus',
        name: 'Marcus L.',
        handle: '@marcus_strikes',
        avatar: PLAYER_AVATARS[0]!,
        position: 'Striker',
        role: 'member',
        experience: 'advanced',
        paymentStatus: 'paid',
      },
    ],
    rosterMax: 14,
    pendingApplications: [],
    schedule: [
      {
        id: 'riv-s-1',
        date: 'Thu · May 22',
        opponent: 'Old Town United',
        opponentAbbreviation: 'OTU',
        location: 'Rolland Moore · Turf 1',
        upcoming: true,
      },
    ],
    Icon: Wind,
    isCaptain: false,
    membership: 'member',
    hasUnpaidShare: true,
    costMode: 'paid',
    feeTotalCents: 84000,
    perPlayerCents: 6000,
    currency: 'USD',
    needs: [],
  },

  // Pending application by Sarah → "Application pending" state.
  'boulder-blitz': {
    id: 'boulder-blitz',
    name: 'Boulder Blitz',
    abbreviation: 'BLZ',
    sport: 'Co-ed Basketball 5v5',
    sportKey: 'basketball',
    location: 'Boulder, CO',
    level: 'INTERMEDIATE',
    description:
      'Run-and-gun rec league team. Tuesday nights at Recreation Center. Looking for a smart shooter.',
    stats: {
      wins: 3,
      losses: 2,
      ties: 0,
      pointsFor: 320,
      pointsAgainst: 290,
      streak: 'W1',
    },
    roster: [
      {
        id: 'blz-1',
        playerId: 'p-jordan',
        name: 'Jordan W.',
        handle: '@jordan_w',
        avatar: PLAYER_AVATARS[6]!,
        position: 'Point Guard',
        role: 'captain',
        experience: 'advanced',
        paymentStatus: 'paid',
      },
      {
        id: 'blz-2',
        playerId: 'p-emma',
        name: 'Emma R.',
        handle: '@emma_r',
        avatar: PLAYER_AVATARS[7]!,
        position: 'Shooting Guard',
        role: 'member',
        experience: 'intermediate',
        paymentStatus: 'paid',
      },
      {
        id: 'blz-3',
        playerId: 'p-alex',
        name: 'Alex K.',
        handle: '@alex_k',
        avatar: PLAYER_AVATARS[1]!,
        position: 'Center',
        role: 'member',
        experience: 'pro',
        paymentStatus: 'paid',
      },
      {
        id: 'blz-4',
        playerId: 'p-noah',
        name: 'Noah F.',
        handle: '@noah_f',
        avatar: PLAYER_AVATARS[2]!,
        position: 'Power Forward',
        role: 'member',
        experience: 'intermediate',
        paymentStatus: 'paid',
      },
    ],
    rosterMax: 8,
    pendingApplications: [],
    schedule: [
      {
        id: 'blz-s-1',
        date: 'Tue · Apr 22',
        opponent: 'CU Alumni',
        opponentAbbreviation: 'CUA',
        location: 'Boulder Rec Court 1',
        upcoming: true,
      },
    ],
    Icon: Zap,
    isCaptain: false,
    membership: 'pending',
    hasUnpaidShare: false,
    costMode: 'paid',
    feeTotalCents: 64000,
    perPlayerCents: 8000,
    currency: 'USD',
    needs: [{ label: 'Small Forward', urgent: true }],
  },

  // Roster full → must NOT appear in Find a Team. Used to verify the filter.
  'sunset-strikers': {
    id: 'sunset-strikers',
    name: 'Sunset Strikers',
    abbreviation: 'SUN',
    sport: 'Co-ed Soccer 7v7',
    sportKey: 'soccer',
    location: 'San Diego, CA',
    level: 'INTERMEDIATE',
    description:
      'Sundown soccer at La Jolla Shores. Roster is full this season — join the waitlist for fall.',
    stats: { wins: 7, losses: 0, ties: 1, pointsFor: 30, pointsAgainst: 9, streak: 'W7' },
    roster: Array.from({ length: 12 }, (_, i) => ({
      id: `sun-${i + 1}`,
      playerId: `p-sun-${i + 1}`,
      name: `Striker ${i + 1}`,
      handle: `@striker_${i + 1}`,
      avatar: PLAYER_AVATARS[i % PLAYER_AVATARS.length]!,
      position:
        i === 0
          ? 'Striker'
          : POSITIONS_BY_SPORT.soccer[i % POSITIONS_BY_SPORT.soccer.length]!,
      role: i === 0 ? ('captain' as const) : ('member' as const),
      experience: 'intermediate' as const,
      paymentStatus: 'paid' as const,
    })),
    rosterMax: 12,
    pendingApplications: [],
    schedule: [],
    Icon: Sun,
    isCaptain: false,
    membership: 'none',
    hasUnpaidShare: false,
    costMode: 'paid',
    feeTotalCents: 144000,
    perPlayerCents: 12000,
    currency: 'USD',
    needs: [],
  },

  // Free pickup, recruiting many positions → great for the position-search demo.
  'wind-river-warriors': {
    id: 'wind-river-warriors',
    name: 'Wind River Warriors',
    abbreviation: 'WRW',
    sport: 'Co-ed Volleyball 6v6',
    sportKey: 'volleyball',
    location: 'Salt Lake City, UT',
    level: 'INTERMEDIATE',
    description:
      'Indoor volleyball every Wednesday. Free open gym while we look for committed players.',
    stats: { wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0, streak: '—' },
    roster: [
      {
        id: 'wrw-1',
        playerId: 'p-naya',
        name: 'Naya R.',
        handle: '@naya_r',
        avatar: PLAYER_AVATARS[5]!,
        position: 'Setter',
        role: 'captain',
        experience: 'advanced',
        paymentStatus: 'not_required',
      },
      {
        id: 'wrw-2',
        playerId: 'p-tomas',
        name: 'Tomás G.',
        handle: '@tomas_g',
        avatar: PLAYER_AVATARS[1]!,
        position: 'Outside Hitter',
        role: 'member',
        experience: 'intermediate',
        paymentStatus: 'not_required',
      },
    ],
    rosterMax: 12,
    pendingApplications: [],
    schedule: [],
    Icon: Wind,
    isCaptain: false,
    membership: 'none',
    hasUnpaidShare: false,
    costMode: 'free',
    feeTotalCents: 0,
    perPlayerCents: 0,
    currency: 'USD',
    needs: [
      { label: 'Libero', urgent: true },
      { label: 'Middle Blocker' },
      { label: 'Opposite' },
    ],
  },

  // Premier paid travel team — used to demo "advanced" filter.
  'tundra-wolves': {
    id: 'tundra-wolves',
    name: 'Tundra Wolves',
    abbreviation: 'TUN',
    sport: 'Ice Hockey 5v5',
    sportKey: 'hockey',
    location: 'Anchorage, AK',
    level: 'ADVANCED',
    description:
      'Travel hockey squad. Two practices a week, away weekends each month. Strong commitment expected.',
    stats: { wins: 11, losses: 3, ties: 1, pointsFor: 58, pointsAgainst: 31, streak: 'W4' },
    roster: [
      {
        id: 'tun-1',
        playerId: 'p-soren',
        name: 'Søren H.',
        handle: '@soren_h',
        avatar: PLAYER_AVATARS[6]!,
        position: 'Center',
        role: 'captain',
        experience: 'pro',
        paymentStatus: 'paid',
      },
      {
        id: 'tun-2',
        playerId: 'p-kira',
        name: 'Kira N.',
        handle: '@kira_n',
        avatar: PLAYER_AVATARS[7]!,
        position: 'Defenseman',
        role: 'member',
        experience: 'pro',
        paymentStatus: 'paid',
      },
    ],
    rosterMax: 18,
    pendingApplications: [],
    schedule: [],
    Icon: Sparkles,
    isCaptain: false,
    membership: 'none',
    hasUnpaidShare: false,
    costMode: 'paid',
    feeTotalCents: 540000,
    perPlayerCents: 30000,
    currency: 'USD',
    needs: [{ label: 'Goalie', urgent: true }, { label: 'Right Wing' }],
  },
};

// SQUADS is now derived from TEAM_DETAILS so Find a Team and TeamDetail share
// one source of truth (cost, roster fill, membership, needs).
export const SQUADS: Squad[] = Object.values(TEAM_DETAILS).map((team) => ({
  id: team.id,
  name: team.name,
  level: team.level,
  location: team.location,
  sport: team.sport,
  Icon: team.Icon,
  needs: team.needs,
  helper: undefined,
  sportKey: team.sportKey,
  costMode: team.costMode,
  perPlayerCents: team.perPlayerCents,
  rosterCount: team.roster.length,
  rosterMax: team.rosterMax,
  membership: team.membership,
  coords: CITY_COORDS[team.location] ?? { latitude: 39.7392, longitude: -104.9903 },
}));

export const CAPTAIN_OF_TEAMS = Object.values(TEAM_DETAILS).filter(
  (t) => t.isCaptain,
);

// ----------------------------------------------------------------------------
// Initial commit poll for the captain demo. Surfaced inside Mile High Warriors
// chat as a poll card — Sarah created it for the Mile High Summer League.
// ----------------------------------------------------------------------------

export const INITIAL_COMMIT_POLLS: Record<string, CommitPoll> = {
  'poll-mhw-mile-high': {
    id: 'poll-mhw-mile-high',
    leagueId: 'mile-high-summer',
    leagueName: 'Mile High Summer League',
    question: 'Can you commit to 8 Sunday matches starting May 15?',
    createdBy: 'Sarah Jenkins',
    createdAt: '2d ago',
    closesAt: 'Closes Apr 28',
    responses: {
      'p-sarah': 'in',
      'p-marcus': 'in',
      'p-priya': 'maybe',
      'p-leo': 'in',
      'p-tara': 'out',
      'p-eli': 'in',
    },
  },
};

// ----------------------------------------------------------------------------
// Player directory — used by invite flow and now by captain "share" / position
// scouting suggestions.
// ----------------------------------------------------------------------------

export interface DirectoryPlayer {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  position: string;
  experience: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  availability: 'available' | 'looking_for_team' | 'busy';
  city: string;
  sportKey: SportKey;
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
