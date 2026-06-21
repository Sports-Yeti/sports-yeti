import type { Game } from './types';
import { DEMO_ORG_ID } from './organizations';

/**
 * A small representative slice of games for the marketplace demo:
 *  - 3 league games this week (mix of upcoming + completed)
 *  - 2 marketplace-open referee games for the Referee inbox
 *  - 2 open-play games (paid + free) for the Player Discover screen
 */

export const GAMES: Game[] = [
  // Yeti Soccer Comp Fall 2025 — week 11 (completed, demo referee did this one)
  {
    id: 'game-yeti-soccer-w11-rec-1',
    kind: 'league',
    divisionId: 'div-yeti-soccer-comp-fall-2025',
    seasonId: 'season-yeti-soccer-fall-2025',
    organizationId: DEMO_ORG_ID,
    sport: 'soccer',
    homeTeamId: 'team-glacier-knights',
    awayTeamId: 'team-tundra-united',
    facilityId: 'facility-yeti-center',
    spaceId: 'space-yeti-turf',
    startIso: '2026-04-12T10:00:00Z',
    endIso: '2026-04-12T11:30:00Z',
    status: 'completed',
    homeScore: 2,
    awayScore: 1,
    refereeRequired: true,
    refereeMarketStatus: 'assigned',
  },
  // Yeti Soccer Comp Fall 2025 — week 12 (upcoming, demo referee invited)
  {
    id: 'game-yeti-soccer-w12-comp-1',
    kind: 'league',
    divisionId: 'div-yeti-soccer-comp-fall-2025',
    seasonId: 'season-yeti-soccer-fall-2025',
    organizationId: DEMO_ORG_ID,
    sport: 'soccer',
    homeTeamId: 'team-tundra-united',
    awayTeamId: 'team-glacier-knights',
    facilityId: 'facility-yeti-center',
    spaceId: 'space-yeti-turf',
    startIso: '2026-04-19T10:00:00Z',
    endIso: '2026-04-19T11:30:00Z',
    status: 'scheduled',
    refereeRequired: true,
    refereeBaseRateCents: 7500,
    refereeMarketStatus: 'open_to_bid',
  },
  // Yeti Hoops Co-ed Open S/S 2026 — week 14 (upcoming, demo referee accepted)
  {
    id: 'game-yeti-hoops-w14-coed-1',
    kind: 'league',
    divisionId: 'div-yeti-hoops-coed-spring-2026',
    seasonId: 'season-yeti-hoops-spring-2026',
    organizationId: DEMO_ORG_ID,
    sport: 'basketball',
    homeTeamId: 'team-summit-hoops',
    awayTeamId: 'team-glacier-knights',
    facilityId: 'facility-summit-rec',
    spaceId: 'space-summit-court-1',
    startIso: '2026-04-21T01:00:00Z',
    endIso: '2026-04-21T02:30:00Z',
    status: 'scheduled',
    refereeRequired: true,
    refereeMarketStatus: 'assigned',
  },
  // Marketplace bid game (open to any nearby ref)
  {
    id: 'game-yeti-soccer-marketplace-1',
    kind: 'league',
    divisionId: 'div-yeti-soccer-rec-spring-2026',
    seasonId: 'season-yeti-soccer-spring-2026',
    organizationId: DEMO_ORG_ID,
    sport: 'soccer',
    homeTeamId: 'team-bison-soccer',
    awayTeamId: 'team-arctic-arrows',
    facilityId: 'facility-yeti-center',
    spaceId: 'space-yeti-outdoor-1',
    startIso: '2026-04-26T18:00:00Z',
    endIso: '2026-04-26T19:30:00Z',
    status: 'scheduled',
    refereeRequired: true,
    refereeBaseRateCents: 7000,
    refereeMarketStatus: 'open_to_bid',
  },
  // Open-play paid game (Discover screen)
  {
    id: 'game-open-saturday-soccer',
    kind: 'open_play',
    organizationId: DEMO_ORG_ID,
    sport: 'soccer',
    facilityId: 'facility-yeti-center',
    spaceId: 'space-yeti-turf',
    startIso: '2026-04-26T15:00:00Z',
    endIso: '2026-04-26T16:30:00Z',
    status: 'scheduled',
    rosterPlayerIds: ['player-mateo', 'player-sam'],
    perPlayerFeeCents: 1200,
    refereeRequired: false,
  },
  // Open-play free pickup
  {
    id: 'game-open-thursday-pickup',
    kind: 'open_play',
    organizationId: DEMO_ORG_ID,
    sport: 'basketball',
    facilityId: 'facility-summit-rec',
    spaceId: 'space-summit-court-2',
    startIso: '2026-04-23T01:30:00Z',
    endIso: '2026-04-23T02:30:00Z',
    status: 'scheduled',
    rosterPlayerIds: ['player-jordan', 'player-zara'],
    perPlayerFeeCents: 0,
    refereeRequired: false,
  },
];

export function gameById(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}

export function gamesForDivision(divisionId: string): Game[] {
  return GAMES.filter((g) => g.divisionId === divisionId);
}

export function gamesForTeam(teamId: string): Game[] {
  return GAMES.filter((g) => g.homeTeamId === teamId || g.awayTeamId === teamId);
}

export function openPlayGames(): Game[] {
  return GAMES.filter((g) => g.kind === 'open_play');
}

export function marketplaceGamesForReferee(): Game[] {
  return GAMES.filter(
    (g) => g.refereeRequired && g.refereeMarketStatus === 'open_to_bid',
  );
}
