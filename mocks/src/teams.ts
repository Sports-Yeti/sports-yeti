import type { RosterMember, Team } from './types';
import { DEMO_ORG_ID } from './organizations';
import { DEMO_PLAYER_ID } from './players';

/**
 * Teams across the org. Includes:
 *  - approved teams currently playing in Fall/Winter 2025
 *  - pending team applications for Spring/Summer 2026 (the Approvals inbox)
 *  - one independent (forming) team owned by the demo user, used for the
 *    Captain "create + apply" journey
 */

export const DEMO_TEAM_ID = 'team-yeti-aurora';

export const TEAMS: Team[] = [
  // Demo user's team — independent, not yet applied
  {
    id: DEMO_TEAM_ID,
    organizationId: DEMO_ORG_ID,
    divisionId: undefined,
    status: 'forming',
    name: 'Aurora FC',
    sport: 'soccer',
    skillLevel: 'recreational',
    city: 'Denver, CO',
    captainPlayerId: DEMO_PLAYER_ID,
    rosterSize: 4,
    rosterMin: 11,
    rosterMax: 22,
    registrationFeeCents: 0,
    createdAtIso: '2026-03-22T10:30:00Z',
  },
  // Approved teams in Fall/Winter 2025 Soccer Comp
  {
    id: 'team-glacier-knights',
    organizationId: DEMO_ORG_ID,
    divisionId: 'div-yeti-soccer-comp-fall-2025',
    status: 'approved',
    name: 'Glacier Knights',
    sport: 'soccer',
    skillLevel: 'competitive',
    city: 'Denver, CO',
    captainPlayerId: 'player-jordan',
    rosterSize: 18,
    rosterMin: 11,
    rosterMax: 22,
    registrationFeeCents: 192000,
    createdAtIso: '2025-07-04T09:00:00Z',
  },
  {
    id: 'team-tundra-united',
    organizationId: DEMO_ORG_ID,
    divisionId: 'div-yeti-soccer-comp-fall-2025',
    status: 'approved',
    name: 'Tundra United',
    sport: 'soccer',
    skillLevel: 'competitive',
    city: 'Denver, CO',
    captainPlayerId: 'player-sam',
    rosterSize: 17,
    rosterMin: 11,
    rosterMax: 22,
    registrationFeeCents: 192000,
    createdAtIso: '2025-07-08T14:00:00Z',
  },
  // Pending applications for Spring/Summer 2026 (the inbox)
  {
    id: 'team-bison-soccer',
    organizationId: DEMO_ORG_ID,
    divisionId: 'div-yeti-soccer-rec-spring-2026',
    status: 'pending_review',
    name: 'Bison FC',
    sport: 'soccer',
    skillLevel: 'recreational',
    city: 'Denver, CO',
    captainPlayerId: 'player-mateo',
    rosterSize: 13,
    rosterMin: 11,
    rosterMax: 22,
    registrationFeeCents: 144000,
    createdAtIso: '2026-03-12T13:00:00Z',
  },
  {
    id: 'team-arctic-arrows',
    organizationId: DEMO_ORG_ID,
    divisionId: 'div-yeti-soccer-comp-spring-2026',
    status: 'pending_review',
    name: 'Arctic Arrows',
    sport: 'soccer',
    skillLevel: 'competitive',
    city: 'Denver, CO',
    captainPlayerId: 'player-zara',
    rosterSize: 16,
    rosterMin: 11,
    rosterMax: 22,
    registrationFeeCents: 192000,
    createdAtIso: '2026-03-14T11:30:00Z',
  },
  // Approved team in Yeti Hoops S/S 2026 (Co-ed Open)
  {
    id: 'team-summit-hoops',
    organizationId: DEMO_ORG_ID,
    divisionId: 'div-yeti-hoops-coed-spring-2026',
    status: 'approved',
    name: 'Summit Hoops',
    sport: 'basketball',
    skillLevel: 'intermediate',
    city: 'Denver, CO',
    captainPlayerId: 'player-zara',
    rosterSize: 9,
    rosterMin: 5,
    rosterMax: 15,
    registrationFeeCents: 144000,
    createdAtIso: '2026-02-22T19:00:00Z',
  },
];

export const ROSTER_MEMBERS: RosterMember[] = [
  // Aurora FC — demo team forming, alex is captain + 3 friends
  {
    id: 'rm-aurora-alex',
    teamId: DEMO_TEAM_ID,
    playerId: DEMO_PLAYER_ID,
    role: 'captain',
    paymentStatus: 'unpaid',
    waiversSigned: false,
    joinedAtIso: '2026-03-22T10:30:00Z',
  },
  {
    id: 'rm-aurora-mateo',
    teamId: DEMO_TEAM_ID,
    playerId: 'player-mateo',
    role: 'player',
    paymentStatus: 'unpaid',
    waiversSigned: false,
    joinedAtIso: '2026-03-23T11:00:00Z',
  },
  {
    id: 'rm-aurora-sam',
    teamId: DEMO_TEAM_ID,
    playerId: 'player-sam',
    role: 'player',
    paymentStatus: 'unpaid',
    waiversSigned: true,
    joinedAtIso: '2026-03-24T15:00:00Z',
  },
  {
    id: 'rm-aurora-zara',
    teamId: DEMO_TEAM_ID,
    playerId: 'player-zara',
    role: 'co_captain',
    paymentStatus: 'unpaid',
    waiversSigned: true,
    joinedAtIso: '2026-03-25T09:00:00Z',
  },
  // Summit Hoops — demo team Alex is also a player on
  {
    id: 'rm-summit-zara',
    teamId: 'team-summit-hoops',
    playerId: 'player-zara',
    role: 'captain',
    paymentStatus: 'paid',
    waiversSigned: true,
    joinedAtIso: '2026-02-22T19:00:00Z',
  },
  {
    id: 'rm-summit-alex',
    teamId: 'team-summit-hoops',
    playerId: DEMO_PLAYER_ID,
    role: 'player',
    paymentStatus: 'paid',
    waiversSigned: true,
    joinedAtIso: '2026-02-25T08:30:00Z',
  },
];

export function teamById(id: string): Team | undefined {
  return TEAMS.find((t) => t.id === id);
}

export function teamsByDivision(divisionId: string): Team[] {
  return TEAMS.filter((t) => t.divisionId === divisionId);
}

export function pendingTeams(): Team[] {
  return TEAMS.filter((t) => t.status === 'pending_review');
}

export function teamsCaptainedBy(playerId: string): Team[] {
  return TEAMS.filter((t) => t.captainPlayerId === playerId);
}

export function rosterForTeam(teamId: string): RosterMember[] {
  return ROSTER_MEMBERS.filter((r) => r.teamId === teamId);
}

export function teamsForPlayer(playerId: string): Team[] {
  const teamIds = new Set(
    ROSTER_MEMBERS.filter((r) => r.playerId === playerId).map((r) => r.teamId),
  );
  return TEAMS.filter((t) => teamIds.has(t.id));
}
