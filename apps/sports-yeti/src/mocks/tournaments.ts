import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import { Snowflake, Swords, Trophy, Waves, Zap } from 'lucide-react-native';
import type { GameOpenStatus } from './games';
import { CITY_COORDS, type SportKey } from './teams';
import type { GeoPoint } from './facilities';

/**
 * A discoverable, registerable one-off tournament hosted by a league. Single
 * rich shape used by both the browse card and the detail screen (mirrors
 * `DiscoverCamp`). Teams register via the shared league-registration flow.
 */
export interface DiscoverTournament {
  id: string;
  name: string;
  sportKey: SportKey;
  /** Play-format subtitle, e.g. "Co-ed 7v7 Soccer". */
  sport: string;
  Icon: ComponentType<LucideProps>;
  city: string;
  venueName: string;
  /** ISO start/end so the date-range filter can compare real dates. */
  startsAt: string;
  endsAt: string;
  /** Human label, e.g. "Jun 13–14". */
  dateLabel: string;
  /** Human label, e.g. "Closes Jun 1". */
  registrationCloses: string;
  /** Bracket format + size, e.g. "Single elimination · 16 teams". */
  formatLabel: string;
  registeredTeams: number;
  maxTeams: number;
  /** Per-team entry fee in cents. */
  feeCents: number;
  spotsTone: 'brand' | 'warning';
  status: GameOpenStatus;
  /** Links back to the hosting league's detail screen. */
  hostLeagueId: string;
  hostLeagueName: string;
  description: string;
  /** Optional prize / stakes line, e.g. "Champion banner + $500 pot". */
  prizeLabel?: string;
}

export const DISCOVER_TOURNAMENTS: DiscoverTournament[] = [
  {
    id: 'yeti-summer-cup',
    name: 'Yeti Summer Cup',
    sportKey: 'soccer',
    sport: 'Co-ed 7v7 Soccer',
    Icon: Trophy,
    city: 'Denver, CO',
    venueName: 'Yeti Center Fields',
    startsAt: '2026-06-13T09:00:00',
    endsAt: '2026-06-14T18:00:00',
    dateLabel: 'Jun 13–14',
    registrationCloses: 'Closes Jun 1',
    formatLabel: 'Single elimination · 16 teams',
    registeredTeams: 11,
    maxTeams: 16,
    feeCents: 25000,
    spotsTone: 'brand',
    status: 'open',
    hostLeagueId: 'mile-high-summer',
    hostLeagueName: 'Mile High Summer League',
    description:
      'A two-day 16-team single-elimination cup capping the spring season. Group stage Saturday, knockout bracket Sunday. Certified refs and league match balls provided.',
    prizeLabel: 'Champion banner + $500 pot',
  },
  {
    id: 'summit-3v3-shootout',
    name: 'Summit 3v3 Shootout',
    sportKey: 'basketball',
    sport: 'Co-ed 3v3 Basketball',
    Icon: Zap,
    city: 'Boulder, CO',
    venueName: 'Summit Rec Center',
    startsAt: '2026-05-09T10:00:00',
    endsAt: '2026-05-09T20:00:00',
    dateLabel: 'May 9',
    registrationCloses: 'Closes May 2',
    formatLabel: 'Double elimination · 24 teams',
    registeredTeams: 20,
    maxTeams: 24,
    feeCents: 12000,
    spotsTone: 'warning',
    status: 'open',
    hostLeagueId: 'rocky-rec-hoops',
    hostLeagueName: 'Rocky Rec Hoops',
    description:
      'Fast-paced 3v3 double-elimination shootout. Every team is guaranteed at least two games. Bring your own warmups.',
    prizeLabel: 'Winner-take-all prize pool',
  },
  {
    id: 'coastal-beach-classic',
    name: 'Coastal Beach Classic',
    sportKey: 'volleyball',
    sport: 'Beach Volleyball 4v4',
    Icon: Waves,
    city: 'San Diego, CA',
    venueName: 'Mission Bay Courts',
    startsAt: '2026-07-18T08:00:00',
    endsAt: '2026-07-19T17:00:00',
    dateLabel: 'Jul 18–19',
    registrationCloses: 'Closes Jul 3',
    formatLabel: 'Round-robin + playoff · 32 teams',
    registeredTeams: 12,
    maxTeams: 32,
    feeCents: 8000,
    spotsTone: 'brand',
    status: 'open',
    hostLeagueId: 'coastal-volley',
    hostLeagueName: 'Coastal Volley Open',
    description:
      'Doubles pools feeding a championship playoff bracket on the sand. Nets, balls, and shade tents provided. Medals for the top three.',
  },
  {
    id: 'aurora-ice-invitational',
    name: 'Aurora Ice Invitational',
    sportKey: 'hockey',
    sport: 'Ice Hockey 5v5',
    Icon: Snowflake,
    city: 'Anchorage, AK',
    venueName: 'Aurora Ice Arena',
    startsAt: '2026-09-26T07:00:00',
    endsAt: '2026-09-27T19:00:00',
    dateLabel: 'Sep 26–27',
    registrationCloses: 'Closes Sep 5',
    formatLabel: 'Single elimination · 12 teams',
    registeredTeams: 12,
    maxTeams: 12,
    feeCents: 40000,
    spotsTone: 'warning',
    status: 'closed',
    hostLeagueId: 'aurora-fall',
    hostLeagueName: 'Aurora Fall Hockey D2',
    description:
      'Weekend knockout invitational to open the fall season. Officials and locker rooms included. Seeding from last season standings.',
    prizeLabel: 'Traveling championship cup',
  },
  {
    id: 'mile-high-winter-indoor',
    name: 'Mile High Winter Indoor',
    sportKey: 'soccer',
    sport: 'Indoor 5v5 Soccer',
    Icon: Swords,
    city: 'Denver, CO',
    venueName: 'Yeti Center Dome',
    startsAt: '2026-12-05T09:00:00',
    endsAt: '2026-12-06T18:00:00',
    dateLabel: 'Dec 5–6',
    registrationCloses: 'Closes Nov 20',
    formatLabel: 'Single elimination · 12 teams',
    registeredTeams: 3,
    maxTeams: 12,
    feeCents: 30000,
    spotsTone: 'brand',
    status: 'open',
    hostLeagueId: 'mile-high-summer',
    hostLeagueName: 'Mile High Summer League',
    description:
      'Indoor 5v5 invitational to close out the year. Fast turf, boarded walls, and a bracket seeded by fall-season form.',
  },
];

export function tournamentById(id: string): DiscoverTournament | undefined {
  return DISCOVER_TOURNAMENTS.find((t) => t.id === id);
}

/** City coordinates for the radius filter, mirroring games/camps. */
export function tournamentCoords(t: DiscoverTournament): GeoPoint | null {
  return CITY_COORDS[t.city] ?? null;
}
