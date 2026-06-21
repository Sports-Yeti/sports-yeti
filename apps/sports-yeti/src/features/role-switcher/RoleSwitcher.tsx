import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, ChevronRight } from 'lucide-react-native';
import { BottomSheet, RoleBadge } from '@sports-yeti/ui';
import { Text } from '../../ui';
import { colors, spacing } from '../../theme';
import { useRoleStack } from '../role-stack';

export interface RoleSwitcherProps {
  visible: boolean;
  onRequestClose: () => void;
  /** Optional onSwitch called after the active role updates. */
  onSwitch?: () => void;
}

/**
 * BottomSheet picker for the active role. Tap a role row → activates it →
 * navigators downstream re-render with the role's tab bar + surfaces.
 *
 * Hidden entirely for single-role users (caller should `if (roles.length <= 1) return null`).
 */
export function RoleSwitcher({
  visible,
  onRequestClose,
  onSwitch,
}: RoleSwitcherProps) {
  const { roles, activeRole, setActiveRoleByIndex, descriptions } =
    useRoleStack();

  function pick(index: number) {
    Haptics.selectionAsync().catch(() => undefined);
    setActiveRoleByIndex(index);
    onRequestClose();
    onSwitch?.();
  }

  return (
    <BottomSheet
      visible={visible}
      onRequestClose={onRequestClose}
      title="Switch role"
      snapPoints={['65%']}
    >
      <View style={[styles.list, { gap: spacing.xs }]}>
        {roles.map((r, idx) => {
          const selected =
            r.role === activeRole.role && r.scopeId === activeRole.scopeId;
          return (
            <Pressable
              key={`${r.role}-${r.scopeId ?? 'global'}`}
              accessibilityRole="radio"
              accessibilityLabel={`Switch to ${r.role}${r.scopeLabel ? ` for ${r.scopeLabel}` : ''}`}
              accessibilityState={{ selected }}
              onPress={() => pick(idx)}
              style={({ pressed }) => [
                styles.row,
                {
                  borderColor: selected ? colors.brand.primary : colors.border.soft,
                  backgroundColor: selected
                    ? colors.brand.soft
                    : colors.surface.card,
                  opacity: pressed ? 0.85 : 1,
                  gap: spacing.md,
                },
              ]}
            >
              <RoleBadge role={r.role} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="body" color={colors.text.primary} style={styles.bold}>
                  {r.scopeLabel ?? labelFor(r.role)}
                </Text>
                <Text variant="caption" color={colors.text.muted}>
                  {descriptions[r.role]}
                </Text>
              </View>
              {selected ? (
                <Check size={20} color={colors.brand.primary} strokeWidth={2.4} />
              ) : (
                <ChevronRight size={18} color={colors.text.muted} />
              )}
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

function labelFor(role: string): string {
  switch (role) {
    case 'player':
      return 'Player';
    case 'team_captain':
      return 'Team Captain';
    case 'referee':
      return 'Referee';
    case 'facility_manager':
      return 'Facility Manager';
    case 'league_admin':
      return 'League Admin';
    case 'org_admin':
      return 'Org Admin';
    default:
      return role;
  }
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 16,
  },
  bold: {
    fontWeight: '600',
  },
});
