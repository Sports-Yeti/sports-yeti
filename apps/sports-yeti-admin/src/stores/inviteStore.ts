import { create } from 'zustand';

export type InviteKind =
  | 'player'
  | 'referee'
  | 'coach'
  | 'parent'
  | 'admin'
  | 'manager'
  | 'viewer';

export interface PendingInvite {
  id: string;
  email: string;
  kind: InviteKind;
  leagueId?: string;
  message?: string;
  sentAtIso: string;
}

interface InviteState {
  pending: PendingInvite[];
  addInvites: (invites: PendingInvite[]) => void;
  rescind: (id: string) => void;
  reset: () => void;
}

export const useInviteStore = create<InviteState>((set) => ({
  pending: [],
  addInvites: (invites) =>
    set((state) => ({ pending: [...invites, ...state.pending] })),
  rescind: (id) =>
    set((state) => ({ pending: state.pending.filter((i) => i.id !== id) })),
  reset: () => set({ pending: [] }),
}));
