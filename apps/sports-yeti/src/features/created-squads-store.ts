import { useMemo } from 'react';
import { create } from 'zustand';
import {
  CITY_COORDS,
  SQUADS,
  TEAM_DETAILS,
  type Squad,
  type TeamDetail,
} from '../mocks/teams';
import { DEFAULT_MAP_CENTER } from '../mocks/facilities';

/**
 * Squads created through the "Start a squad" wizard this session. The
 * wizard writes a full `TeamDetail` here so the new team opens in
 * TeamDetail, lists under "My Teams", and has a working chat — the create
 * journey lands somewhere real. Resets on app restart (mock data only).
 */
interface CreatedSquadsState {
  createdTeams: TeamDetail[];
  addTeam: (team: TeamDetail) => void;
}

export const useCreatedSquadsStore = create<CreatedSquadsState>((set) => ({
  createdTeams: [],
  addTeam: (team) =>
    set((s) => ({ createdTeams: [team, ...s.createdTeams] })),
}));

function squadFromTeamDetail(team: TeamDetail): Squad {
  return {
    id: team.id,
    name: team.name,
    level: team.level,
    location: team.location,
    sport: team.sport,
    Icon: team.Icon,
    needs: team.needs,
    helper: 'You captain this squad.',
    sportKey: team.sportKey,
    costMode: team.costMode,
    perPlayerCents: team.perPlayerCents,
    rosterCount: team.roster.length,
    rosterMax: team.rosterMax,
    membership: team.membership,
    coords: CITY_COORDS[team.location] ?? DEFAULT_MAP_CENTER,
  };
}

/** Seeded + session squads for list surfaces (session creations first). */
export function useAllSquads(): Squad[] {
  const createdTeams = useCreatedSquadsStore((s) => s.createdTeams);
  return useMemo(
    () => [...createdTeams.map(squadFromTeamDetail), ...SQUADS],
    [createdTeams],
  );
}

/** TeamDetail lookup across session-created and seeded teams. */
export function useTeamDetailById(id: string): TeamDetail | undefined {
  const createdTeams = useCreatedSquadsStore((s) => s.createdTeams);
  return useMemo(
    () => createdTeams.find((t) => t.id === id) ?? TEAM_DETAILS[id],
    [createdTeams, id],
  );
}
