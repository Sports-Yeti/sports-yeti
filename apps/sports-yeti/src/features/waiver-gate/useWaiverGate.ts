import { useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  computeWaiverGate,
  DEMO_USER_ID,
  type WaiverGateState,
  type WaiverScopeKind,
} from '@sports-yeti/mocks';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export interface WaiverScopeRef {
  kind: WaiverScopeKind;
  scopeId: string;
}

export interface UseWaiverGateResult {
  /** Computed gate state for the current user against the requested scopes. */
  gate: WaiverGateState;
  /** Whether the gated action can proceed (no blocking waivers). */
  canProceed: boolean;
  /**
   * If blocked, navigates to <WaiverGateScreen> with the action label
   * + scopes. If unblocked, calls `onProceed` directly.
   */
  guard: (action: string, onProceed: () => void) => void;
}

/**
 * Compute the waiver gate state for a given set of scopes (e.g. the
 * facility + org for a check-in flow). Returns a `guard()` helper that
 * a CTA's `onPress` can wrap any action with.
 *
 * Phase 10 enforcement points use this hook everywhere a player tries to
 * do something gated by waivers.
 */
export function useWaiverGate(
  scopes: WaiverScopeRef[],
  userId: string = DEMO_USER_ID,
): UseWaiverGateResult {
  const navigation = useNavigation<Navigation>();
  const gate = useMemo(
    () => computeWaiverGate(userId, scopes),
    [userId, scopes],
  );
  const canProceed = gate.blocking.length === 0;

  const guard = useCallback(
    (action: string, onProceed: () => void) => {
      if (canProceed) {
        onProceed();
        return;
      }
      navigation.navigate('WaiverGate', { action, scopes });
    },
    [canProceed, navigation, scopes],
  );

  return { gate, canProceed, guard };
}
