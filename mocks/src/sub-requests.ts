import type { SubRequest } from './types';
import { DEMO_TEAM_ID } from './teams';

/**
 * Sub requests demo the two-step flow:
 * applicant pool builds → captain confirms one → status flips to filled.
 */

export const SUB_REQUESTS: SubRequest[] = [
  {
    id: 'sub-aurora-w12',
    gameId: 'game-yeti-soccer-w12-comp-1',
    teamId: DEMO_TEAM_ID,
    position: 'Defender',
    skillLevel: 'intermediate',
    message: 'Need a 4th defender for week 12. Please be reliable.',
    status: 'pending_captain_confirm',
    applicantPlayerIds: ['player-sam', 'player-mateo'],
    createdAtIso: '2026-04-15T10:00:00Z',
  },
  {
    id: 'sub-summit-w14',
    gameId: 'game-yeti-hoops-w14-coed-1',
    teamId: 'team-summit-hoops',
    position: 'Forward',
    skillLevel: 'competitive',
    message: 'Lost a player to a wedding. 6\'1"+ preferred.',
    status: 'open',
    applicantPlayerIds: [],
    createdAtIso: '2026-04-17T08:30:00Z',
  },
  {
    id: 'sub-glacier-completed',
    gameId: 'game-yeti-soccer-w11-rec-1',
    teamId: 'team-glacier-knights',
    position: 'Goalkeeper',
    status: 'filled',
    applicantPlayerIds: ['player-sam'],
    filledPlayerId: 'player-sam',
    createdAtIso: '2026-04-08T18:00:00Z',
  },
];

export function subRequestById(id: string): SubRequest | undefined {
  return SUB_REQUESTS.find((s) => s.id === id);
}

export function openSubRequests(): SubRequest[] {
  return SUB_REQUESTS.filter(
    (s) => s.status === 'open' || s.status === 'pending_captain_confirm',
  );
}

export function subRequestsForTeam(teamId: string): SubRequest[] {
  return SUB_REQUESTS.filter((s) => s.teamId === teamId);
}
