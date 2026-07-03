import { useMemo } from 'react';
import { create } from 'zustand';
import {
  openSubRequests,
  subRequestsForTeam,
  type SubRequest,
} from '@sports-yeti/mocks';

/**
 * Session-level sub requests layered over the seeded `@sports-yeti/mocks`
 * fixtures. Posting a request in <SubRequestCreateScreen> makes it appear
 * on CaptainHome and in the team's inbox; confirming an applicant marks
 * the request filled everywhere. Resets on app restart (mock data only).
 */
interface SubRequestsState {
  createdRequests: SubRequest[];
  /** requestId → confirmed playerId (captain picked a sub this session). */
  confirmedByRequest: Record<string, string>;
  addRequest: (request: SubRequest) => void;
  confirmApplicant: (requestId: string, playerId: string) => void;
}

export const useSubRequestsStore = create<SubRequestsState>((set) => ({
  createdRequests: [],
  confirmedByRequest: {},
  addRequest: (request) =>
    set((s) => ({ createdRequests: [request, ...s.createdRequests] })),
  confirmApplicant: (requestId, playerId) =>
    set((s) => ({
      confirmedByRequest: { ...s.confirmedByRequest, [requestId]: playerId },
    })),
}));

function applyConfirmations(
  requests: SubRequest[],
  confirmedByRequest: Record<string, string>,
): SubRequest[] {
  return requests.map((r) => {
    const confirmed = confirmedByRequest[r.id];
    if (!confirmed) return r;
    return { ...r, status: 'filled', filledPlayerId: confirmed };
  });
}

/** Seeded + session requests for one team, confirmations applied. */
export function useSubRequestsForTeam(teamId: string | undefined): SubRequest[] {
  const createdRequests = useSubRequestsStore((s) => s.createdRequests);
  const confirmedByRequest = useSubRequestsStore((s) => s.confirmedByRequest);
  return useMemo(() => {
    if (!teamId) return [];
    const merged = [
      ...createdRequests.filter((r) => r.teamId === teamId),
      ...subRequestsForTeam(teamId),
    ];
    return applyConfirmations(merged, confirmedByRequest);
  }, [teamId, createdRequests, confirmedByRequest]);
}

/** All open requests (seeded + session) for the captain home surface. */
export function useOpenSubRequests(): SubRequest[] {
  const createdRequests = useSubRequestsStore((s) => s.createdRequests);
  const confirmedByRequest = useSubRequestsStore((s) => s.confirmedByRequest);
  return useMemo(() => {
    const merged = applyConfirmations(
      [...createdRequests, ...openSubRequests()],
      confirmedByRequest,
    );
    return merged.filter(
      (r) => r.status === 'open' || r.status === 'pending_captain_confirm',
    );
  }, [createdRequests, confirmedByRequest]);
}
