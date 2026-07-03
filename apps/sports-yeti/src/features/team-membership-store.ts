import { create } from 'zustand';
import { TEAM_DETAILS, type Membership } from '../mocks/teams';

/**
 * Session-level team membership on top of the seeded `TEAM_DETAILS`
 * fixtures. The join flow (TeamDetail), the chat gate (ChatScreen), and the
 * squad cards (SquadsScreen) all read membership through this store so an
 * "Offer to join" made on one screen is reflected everywhere immediately.
 * Resets on app restart — mock data only, by design.
 */
interface TeamMembershipState {
  overrides: Record<string, Membership>;
  /** none → pending (player offered to join, waiting on captain). */
  requestJoin: (teamId: string) => void;
  /** member → none (player left the team). */
  leave: (teamId: string) => void;
  /** Direct set — used when creating a squad (captain from day one). */
  setMembership: (teamId: string, membership: Membership) => void;
}

export const useTeamMembershipStore = create<TeamMembershipState>((set) => ({
  overrides: {},
  requestJoin: (teamId) =>
    set((s) => ({ overrides: { ...s.overrides, [teamId]: 'pending' } })),
  leave: (teamId) =>
    set((s) => ({ overrides: { ...s.overrides, [teamId]: 'none' } })),
  setMembership: (teamId, membership) =>
    set((s) => ({ overrides: { ...s.overrides, [teamId]: membership } })),
}));

export function membershipForTeam(
  teamId: string,
  overrides: Record<string, Membership>,
): Membership {
  return overrides[teamId] ?? TEAM_DETAILS[teamId]?.membership ?? 'none';
}

/** Live membership for one team (seeded value + session overrides). */
export function useTeamMembership(teamId: string | undefined): Membership {
  return useTeamMembershipStore((s) =>
    teamId ? membershipForTeam(teamId, s.overrides) : 'none',
  );
}
