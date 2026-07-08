import type { Tournament } from './types';
import { DEMO_ORG_ID } from './organizations';

const FRONT_RANGE_ORG_ID = 'org-front-range-sports';

/**
 * One-off tournaments hosted by the seeded leagues. Mirrors the season
 * fixtures: keyed by league, spanning draft → registration_open → in_progress
 * → completed so the admin list has every status represented.
 */
export const TOURNAMENTS: Tournament[] = [
  {
    id: 'tournament-yeti-soccer-summer-cup-2026',
    organizationId: DEMO_ORG_ID,
    leagueId: 'league-yeti-soccer',
    name: 'Yeti Summer Cup',
    format: 'single_elim',
    startIso: '2026-06-13',
    endIso: '2026-06-14',
    registrationClosesIso: '2026-06-01',
    maxTeams: 16,
    registeredTeams: 11,
    feeCents: 25000,
    status: 'registration_open',
    venue: 'Yeti Center Fields',
    city: 'Denver, CO',
    description:
      'A two-day 16-team single-elimination cup capping the spring season. Group stage Saturday, knockout bracket Sunday.',
  },
  {
    id: 'tournament-yeti-hoops-3v3-shootout-2026',
    organizationId: DEMO_ORG_ID,
    leagueId: 'league-yeti-hoops',
    name: 'Summit 3v3 Shootout',
    format: 'double_elim',
    startIso: '2026-05-09',
    endIso: '2026-05-09',
    registrationClosesIso: '2026-05-02',
    maxTeams: 24,
    registeredTeams: 24,
    feeCents: 12000,
    status: 'in_progress',
    venue: 'Summit Rec Center',
    city: 'Denver, CO',
    description:
      'Fast-paced 3v3 double-elimination shootout. Every team is guaranteed at least two games.',
  },
  {
    id: 'tournament-frp-fall-classic-2025',
    organizationId: FRONT_RANGE_ORG_ID,
    leagueId: 'league-front-range-pickleball',
    name: 'Front Range Fall Classic',
    format: 'round_robin_playoff',
    startIso: '2025-11-08',
    endIso: '2025-11-09',
    registrationClosesIso: '2025-10-25',
    maxTeams: 32,
    registeredTeams: 28,
    feeCents: 8000,
    status: 'completed',
    venue: 'Boulder Indoor Courts',
    city: 'Boulder, CO',
    description:
      'Doubles round-robin pools feeding into a championship playoff bracket. Medals for the top three.',
  },
  {
    id: 'tournament-yeti-soccer-winter-indoor-2026',
    organizationId: DEMO_ORG_ID,
    leagueId: 'league-yeti-soccer',
    name: 'Yeti Winter Indoor Invitational',
    format: 'single_elim',
    startIso: '2026-12-05',
    endIso: '2026-12-06',
    registrationClosesIso: '2026-11-20',
    maxTeams: 12,
    registeredTeams: 0,
    feeCents: 30000,
    status: 'draft',
    venue: 'Yeti Center Dome',
    city: 'Denver, CO',
    description:
      'Indoor 5v5 invitational to close out the year. Bracket seeding by fall-season standings.',
  },
  {
    id: 'tournament-yeti-hoops-holiday-classic-2026',
    organizationId: DEMO_ORG_ID,
    leagueId: 'league-yeti-hoops',
    name: 'Mile High Holiday Classic',
    format: 'single_elim',
    startIso: '2026-12-19',
    endIso: '2026-12-20',
    registrationClosesIso: '2026-12-05',
    maxTeams: 16,
    registeredTeams: 6,
    feeCents: 18000,
    status: 'registration_open',
    venue: 'Summit Rec Center',
    city: 'Denver, CO',
    description:
      'Holiday 5v5 single-elimination classic. Ugly-sweater warmups encouraged.',
  },
];

export function tournamentById(id: string): Tournament | undefined {
  return TOURNAMENTS.find((t) => t.id === id);
}

export function tournamentsByLeague(leagueId: string): Tournament[] {
  return TOURNAMENTS.filter((t) => t.leagueId === leagueId);
}
