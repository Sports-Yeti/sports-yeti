import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ShieldAlert, ShieldCheck } from 'lucide-react-native';
import { Tag } from '@sports-yeti/ui';
import { Text } from '../../ui';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  useWaiverGate,
  type WaiverScopeRef,
} from './useWaiverGate';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export interface WaiverProgressCardProps {
  scopes: WaiverScopeRef[];
  /** What the user is trying to do — surfaced in the gate copy if blocked. */
  action: string;
}

/**
 * Inline card for the player's profile + role-home screens that surfaces
 * waiver progress against the user's relevant scopes. Tapping when
 * blocked routes to <WaiverGateScreen>.
 */
export function WaiverProgressCard({ scopes, action }: WaiverProgressCardProps) {
  const navigation = useNavigation<Navigation>();
  const { gate, canProceed } = useWaiverGate(scopes);

  if (gate.required.length === 0) return null;

  const signedCount = gate.signed.filter((s) =>
    gate.required.some((r) => r.id === s.waiverId),
  ).length;
  const total = gate.required.length;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        canProceed
          ? 'All waivers signed'
          : `${gate.blocking.length} waiver${gate.blocking.length === 1 ? '' : 's'} required`
      }
      onPress={() => {
        if (canProceed) return;
        navigation.navigate('WaiverGate', { action, scopes });
      }}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: canProceed ? colors.surface.card : colors.brand.soft,
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      <View style={styles.iconWrap}>
        {canProceed ? (
          <ShieldCheck size={28} color={colors.status.success} strokeWidth={2.25} />
        ) : (
          <ShieldAlert size={28} color={colors.status.warning} strokeWidth={2.25} />
        )}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyLg" style={styles.bold}>
          Waivers · {signedCount} of {total} signed
        </Text>
        <Text variant="caption" color={colors.text.secondary}>
          {canProceed
            ? "You're cleared. Play on."
            : `Sign ${gate.blocking.length} more to ${action}.`}
        </Text>
      </View>
      <Tag
        size="sm"
        tone={canProceed ? 'success' : 'warning'}
        label={canProceed ? 'Cleared' : 'Action needed'}
        leadingDot
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.lg,
    borderRadius: radii.card,
    ...shadows.soft,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bold: {
    fontWeight: '600',
  },
});
