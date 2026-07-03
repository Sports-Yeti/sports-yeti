import { useMemo } from 'react';
import { create } from 'zustand';
import {
  assignmentsForReferee,
  DEMO_REFEREE_ID,
  type RefereeAssignment,
} from '@sports-yeti/mocks';

/**
 * Session-level referee assignment state on top of the seeded
 * `@sports-yeti/mocks` fixtures. Accepting/declining invites, bidding on
 * marketplace games, and submitting game reports all record here so the
 * referee home tabs actually move work between Pending → Accepted →
 * Completed. Resets on app restart (mock data only).
 */
type AssignmentStatus = RefereeAssignment['status'];

interface RefereeState {
  /** invited → accepted / declined / completed transitions this session. */
  statusOverrides: Record<string, AssignmentStatus | 'declined'>;
  /** Assignment ids whose game report was submitted this session. */
  reportSubmittedIds: Record<string, true>;
  /** Marketplace game ids the referee has bid on this session. */
  bidGameIds: Record<string, true>;
  accept: (assignmentId: string) => void;
  decline: (assignmentId: string) => void;
  submitReport: (assignmentId: string) => void;
  placeBid: (gameId: string) => void;
}

export const useRefereeStore = create<RefereeState>((set) => ({
  statusOverrides: {},
  reportSubmittedIds: {},
  bidGameIds: {},
  accept: (assignmentId) =>
    set((s) => ({
      statusOverrides: { ...s.statusOverrides, [assignmentId]: 'accepted' },
    })),
  decline: (assignmentId) =>
    set((s) => ({
      statusOverrides: { ...s.statusOverrides, [assignmentId]: 'declined' },
    })),
  submitReport: (assignmentId) =>
    set((s) => ({
      statusOverrides: { ...s.statusOverrides, [assignmentId]: 'completed' },
      reportSubmittedIds: { ...s.reportSubmittedIds, [assignmentId]: true },
    })),
  placeBid: (gameId) =>
    set((s) => ({ bidGameIds: { ...s.bidGameIds, [gameId]: true } })),
}));

/** Seeded assignments with session status/report overrides applied. */
export function useRefereeAssignments(): RefereeAssignment[] {
  const statusOverrides = useRefereeStore((s) => s.statusOverrides);
  const reportSubmittedIds = useRefereeStore((s) => s.reportSubmittedIds);
  return useMemo(() => {
    return assignmentsForReferee(DEMO_REFEREE_ID)
      .map((a) => {
        const override = statusOverrides[a.id];
        if (!override && !reportSubmittedIds[a.id]) return a;
        if (override === 'declined') return null;
        return {
          ...a,
          status: override ?? a.status,
          reportSubmitted: a.reportSubmitted || !!reportSubmittedIds[a.id],
        };
      })
      .filter((a): a is RefereeAssignment => a !== null);
  }, [statusOverrides, reportSubmittedIds]);
}
