import type { League } from './types';
import { DEMO_ORG_ID } from './organizations';

/**
 * Marketplace-shaped leagues. A league is the umbrella for many seasons —
 * the registration, fee, and roster fields that used to live here have
 * moved down to `Division`. A league owns identity, sport, and branding.
 */
export const LEAGUES: League[] = [
  {
    id: 'league-yeti-soccer',
    organizationId: DEMO_ORG_ID,
    name: 'Yeti Soccer',
    slug: 'yeti-soccer',
    sport: 'soccer',
    sportTagline: 'Co-ed 7v7 Outdoor',
    city: 'Denver, CO',
    description:
      'Year-round 7v7 outdoor soccer at Yeti Center fields. Spring/Summer and Fall/Winter seasons.',
    activeSeasonId: 'season-yeti-soccer-spring-2026',
    createdAtIso: '2024-10-04T16:00:00Z',
  },
  {
    id: 'league-yeti-hoops',
    organizationId: DEMO_ORG_ID,
    name: 'Yeti Hoops',
    slug: 'yeti-hoops',
    sport: 'basketball',
    sportTagline: 'Co-ed Basketball 5v5',
    city: 'Denver, CO',
    description:
      'Weeknight pickup-style league at Summit Rec Center. Refs included.',
    activeSeasonId: 'season-yeti-hoops-spring-2026',
    createdAtIso: '2024-11-12T10:00:00Z',
  },
  {
    id: 'league-front-range-pickleball',
    organizationId: 'org-front-range-sports',
    name: 'Front Range Pickleball',
    slug: 'front-range-pickleball',
    sport: 'pickleball',
    sportTagline: 'Doubles Pickleball Ladder',
    city: 'Boulder, CO',
    description:
      'Self-scheduled doubles ladder. Climb the rankings each season.',
    activeSeasonId: 'season-frp-fall-2025',
    createdAtIso: '2025-01-15T09:30:00Z',
  },
];

export function leagueById(id: string): League | undefined {
  return LEAGUES.find((l) => l.id === id);
}

export function leaguesByOrg(orgId: string): League[] {
  return LEAGUES.filter((l) => l.organizationId === orgId);
}
