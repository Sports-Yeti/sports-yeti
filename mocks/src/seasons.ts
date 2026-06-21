import type { Season } from './types';
import { DEMO_ORG_ID } from './organizations';

/**
 * Each league runs through Fall/Winter and Spring/Summer cycles.
 * The demo org currently has:
 *  - Yeti Soccer    : Fall/Winter 2025 (in_progress) + Spring/Summer 2026 (registration_open)
 *  - Yeti Hoops     : Fall/Winter 2025 (completed)   + Spring/Summer 2026 (registration_open)
 *  - Front Range PB : Fall/Winter 2025 (in_progress) only
 */
export const SEASONS: Season[] = [
  {
    id: 'season-yeti-soccer-fall-2025',
    organizationId: DEMO_ORG_ID,
    leagueId: 'league-yeti-soccer',
    label: 'Fall/Winter 2025',
    cycle: 'fall_winter',
    year: 2025,
    startIso: '2025-09-07',
    endIso: '2025-12-21',
    status: 'in_progress',
    weeklySlotLabel: 'Sun · 9 AM – 1 PM',
    format: 'round_robin_playoff',
    regularWeeks: 12,
    playoffWeeks: 3,
  },
  {
    id: 'season-yeti-soccer-spring-2026',
    organizationId: DEMO_ORG_ID,
    leagueId: 'league-yeti-soccer',
    label: 'Spring/Summer 2026',
    cycle: 'spring_summer',
    year: 2026,
    startIso: '2026-04-12',
    endIso: '2026-07-19',
    status: 'registration_open',
    weeklySlotLabel: 'Sun · 9 AM – 1 PM',
    format: 'round_robin_playoff',
    regularWeeks: 12,
    playoffWeeks: 3,
  },
  {
    id: 'season-yeti-hoops-fall-2025',
    organizationId: DEMO_ORG_ID,
    leagueId: 'league-yeti-hoops',
    label: 'Fall/Winter 2025',
    cycle: 'fall_winter',
    year: 2025,
    startIso: '2025-10-15',
    endIso: '2026-02-28',
    status: 'completed',
    weeklySlotLabel: 'Tue + Thu · 7 PM – 10 PM',
    format: 'round_robin_playoff',
    regularWeeks: 14,
    playoffWeeks: 2,
  },
  {
    id: 'season-yeti-hoops-spring-2026',
    organizationId: DEMO_ORG_ID,
    leagueId: 'league-yeti-hoops',
    label: 'Spring/Summer 2026',
    cycle: 'spring_summer',
    year: 2026,
    startIso: '2026-04-08',
    endIso: '2026-08-13',
    status: 'registration_open',
    weeklySlotLabel: 'Tue + Thu · 7 PM – 10 PM',
    format: 'round_robin_playoff',
    regularWeeks: 14,
    playoffWeeks: 2,
  },
  {
    id: 'season-frp-fall-2025',
    organizationId: 'org-front-range-sports',
    leagueId: 'league-front-range-pickleball',
    label: 'Fall/Winter 2025',
    cycle: 'fall_winter',
    year: 2025,
    startIso: '2025-09-15',
    endIso: '2025-12-15',
    status: 'in_progress',
    weeklySlotLabel: 'Self-scheduled · Anytime',
    format: 'self_scheduled',
    regularWeeks: 12,
    playoffWeeks: 0,
  },
];

export function seasonById(id: string): Season | undefined {
  return SEASONS.find((s) => s.id === id);
}

export function seasonsByLeague(leagueId: string): Season[] {
  return SEASONS.filter((s) => s.leagueId === leagueId);
}

export function activeSeasonsForOrg(orgId: string): Season[] {
  return SEASONS.filter(
    (s) =>
      s.organizationId === orgId &&
      (s.status === 'registration_open' || s.status === 'in_progress'),
  );
}
