import { create } from 'zustand';

/**
 * Waiver ids signed this session. `computeWaiverGate` reads the immutable
 * `WAIVER_SIGNATURES` fixture, so signing in <WaiverSignScreen> records
 * here and `useWaiverGate` subtracts these from the blocking list — the
 * sign → unblock loop actually completes. Resets on app restart.
 */
interface WaiverSignaturesState {
  signedWaiverIds: Record<string, true>;
  sign: (waiverId: string) => void;
}

export const useWaiverSignatures = create<WaiverSignaturesState>((set) => ({
  signedWaiverIds: {},
  sign: (waiverId) =>
    set((s) => ({
      signedWaiverIds: { ...s.signedWaiverIds, [waiverId]: true },
    })),
}));
