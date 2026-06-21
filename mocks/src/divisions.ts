import type { Division } from './types';
import { DEMO_ORG_ID } from './organizations';

/**
 * Divisions are children of Season — they hold skill level, max teams,
 * registration window, and registration fee. A Season may host multiple
 * divisions (e.g., Comp + Rec + Open).
 */
export const DIVISIONS: Division[] = [
  // Yeti Soccer · Spring/Summer 2026
  {
    id: 'div-yeti-soccer-comp-spring-2026',
    organizationId: DEMO_ORG_ID,
    leagueId: 'league-yeti-soccer',
    seasonId: 'season-yeti-soccer-spring-2026',
    name: 'Competitive D1',
    skillLevel: 'competitive',
    ageBand: '18+',
    maxTeams: 8,
    registeredTeams: 5,
    registrationFeeCents: 192000,
    registrationOpensIso: '2026-02-15',
    registrationClosesIso: '2026-04-05',
    status: 'open',
  },
  {
    id: 'div-yeti-soccer-rec-spring-2026',
    organizationId: DEMO_ORG_ID,
    leagueId: 'league-yeti-soccer',
    seasonId: 'season-yeti-soccer-spring-2026',
    name: 'Recreational D2',
    skillLevel: 'recreational',
    ageBand: '18+',
    maxTeams: 12,
    registeredTeams: 9,
    registrationFeeCents: 144000,
    registrationOpensIso: '2026-02-15',
    registrationClosesIso: '2026-04-05',
    status: 'open',
  },
  // Yeti Soccer · Fall/Winter 2025 (in progress)
  {
    id: 'div-yeti-soccer-comp-fall-2025',
    organizationId: DEMO_ORG_ID,
    leagueId: 'league-yeti-soccer',
    seasonId: 'season-yeti-soccer-fall-2025',
    name: 'Competitive D1',
    skillLevel: 'competitive',
    ageBand: '18+',
    maxTeams: 8,
    registeredTeams: 8,
    registrationFeeCents: 192000,
    registrationOpensIso: '2025-07-01',
    registrationClosesIso: '2025-08-25',
    status: 'in_progress',
  },
  {
    id: 'div-yeti-soccer-rec-fall-2025',
    organizationId: DEMO_ORG_ID,
    leagueId: 'league-yeti-soccer',
    seasonId: 'season-yeti-soccer-fall-2025',
    name: 'Recreational D2',
    skillLevel: 'recreational',
    ageBand: '18+',
    maxTeams: 12,
    registeredTeams: 12,
    registrationFeeCents: 144000,
    registrationOpensIso: '2025-07-01',
    registrationClosesIso: '2025-08-25',
    status: 'in_progress',
  },
  // Yeti Hoops · Spring/Summer 2026
  {
    id: 'div-yeti-hoops-coed-spring-2026',
    organizationId: DEMO_ORG_ID,
    leagueId: 'league-yeti-hoops',
    seasonId: 'season-yeti-hoops-spring-2026',
    name: 'Co-ed Open',
    skillLevel: 'intermediate',
    ageBand: '18+',
    maxTeams: 10,
    registeredTeams: 7,
    registrationFeeCents: 144000,
    registrationOpensIso: '2026-02-12',
    registrationClosesIso: '2026-04-01',
    status: 'open',
  },
  {
    id: 'div-yeti-hoops-mens-spring-2026',
    organizationId: DEMO_ORG_ID,
    leagueId: 'league-yeti-hoops',
    seasonId: 'season-yeti-hoops-spring-2026',
    name: "Men's D1",
    skillLevel: 'competitive',
    ageBand: '21+',
    maxTeams: 8,
    registeredTeams: 6,
    registrationFeeCents: 168000,
    registrationOpensIso: '2026-02-12',
    registrationClosesIso: '2026-04-01',
    status: 'open',
  },
  // Front Range Pickleball · Fall 2025
  {
    id: 'div-frp-doubles-fall-2025',
    organizationId: 'org-front-range-sports',
    leagueId: 'league-front-range-pickleball',
    seasonId: 'season-frp-fall-2025',
    name: 'Doubles Ladder',
    skillLevel: 'intermediate',
    maxTeams: 32,
    registeredTeams: 18,
    registrationFeeCents: 12000,
    registrationOpensIso: '2025-08-01',
    registrationClosesIso: '2025-09-12',
    status: 'in_progress',
  },
];

export function divisionById(id: string): Division | undefined {
  return DIVISIONS.find((d) => d.id === id);
}

export function divisionsForSeason(seasonId: string): Division[] {
  return DIVISIONS.filter((d) => d.seasonId === seasonId);
}

export function divisionsForLeague(leagueId: string): Division[] {
  return DIVISIONS.filter((d) => d.leagueId === leagueId);
}

export function openDivisionsForOrg(orgId: string): Division[] {
  return DIVISIONS.filter(
    (d) => d.organizationId === orgId && d.status === 'open',
  );
}
