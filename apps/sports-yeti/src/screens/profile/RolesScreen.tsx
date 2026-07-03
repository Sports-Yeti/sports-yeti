import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Sparkles } from 'lucide-react-native';
import { RoleBadge, Tag } from '@sports-yeti/ui';
import {
  ROLE_LABEL,
  ROLE_SORT_ORDER,
  type Role,
} from '@sports-yeti/mocks';
import { Text, useToast } from '../../ui';
import { colors, radii, shadows, spacing } from '../../theme';
import { useRoleStack } from '../../features/role-stack';

const ALL_ROLES: Role[] = (
  Object.keys(ROLE_SORT_ORDER) as Role[]
).sort((a, b) => ROLE_SORT_ORDER[a] - ROLE_SORT_ORDER[b]);

export function RolesScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const {
    roles,
    activeRole,
    descriptions,
    setActiveRole,
    addRole,
    hasRole,
  } = useRoleStack();
  const [activatingRole, setActivatingRole] = useState<Role | null>(null);

  function activateRole(role: Role) {
    // Session activation — the role joins the stack and the switcher,
    // and can be switched to immediately.
    setActivatingRole(role);
    addRole(role);
    toast.show({
      variant: 'success',
      title: `${ROLE_LABEL[role]} activated`,
      description: 'It’s in your role list now — switch any time.',
      action: { label: 'Switch now', onPress: () => switchToRole(role) },
      // Longer window for assistive tech; the role list itself now offers
      // Switch as a persistent fallback.
      duration: 8000,
    });
    setTimeout(() => setActivatingRole(null), 800);
  }

  function switchToRole(role: Role) {
    setActiveRole(role);
    toast.show({
      variant: 'info',
      title: `Switched to ${ROLE_LABEL[role]}`,
      description: 'Tab bar updating now.',
    });
  }

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
        </Pressable>
        <Text variant="h2" color={colors.text.primary}>
          Your roles
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 120 },
        ]}
      >
        <Text variant="body" color={colors.text.secondary}>
          Roles are stackable. The active role drives the bottom tab bar and
          which surfaces are visible.
        </Text>

        <View style={[styles.section, { gap: spacing.sm }]}>
          <Text variant="h3" color={colors.text.primary}>
            Active
          </Text>
          {roles.map((r) => {
            const isActive =
              r.role === activeRole.role && r.scopeId === activeRole.scopeId;
            return (
              <View
                key={`${r.role}-${r.scopeId ?? 'global'}`}
                style={[
                  styles.row,
                  {
                    borderColor: isActive
                      ? colors.brand.primary
                      : colors.border.soft,
                    backgroundColor: isActive
                      ? colors.brand.soft
                      : colors.surface.card,
                    gap: spacing.md,
                  },
                ]}
              >
                <RoleBadge role={r.role} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="body" style={styles.bold}>
                    {r.scopeLabel ?? ROLE_LABEL[r.role]}
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    {descriptions[r.role]}
                  </Text>
                </View>
                {isActive ? (
                  <Tag size="sm" tone="success" label="In use" />
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Switch to ${r.role}`}
                    onPress={() => switchToRole(r.role)}
                  >
                    <Text variant="bodySm" color={colors.brand.primary} style={styles.bold}>
                      Switch
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>

        <View style={[styles.section, { gap: spacing.sm }]}>
          <Text variant="h3" color={colors.text.primary}>
            Add another role
          </Text>
          {ALL_ROLES.filter((r) => !hasRole(r)).length === 0 ? (
            <Text variant="body" color={colors.text.secondary}>
              You already have every role activated. Heavy hitter.
            </Text>
          ) : (
            ALL_ROLES.filter((r) => !hasRole(r)).map((r) => (
              <View
                key={r}
                style={[
                  styles.row,
                  {
                    borderColor: colors.border.soft,
                    backgroundColor: colors.surface.card,
                    gap: spacing.md,
                  },
                ]}
              >
                <RoleBadge role={r} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="body" style={styles.bold}>
                    {ROLE_LABEL[r]}
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    {descriptions[r]}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Activate ${ROLE_LABEL[r]}`}
                  onPress={() => activateRole(r)}
                  style={({ pressed }) => [
                    styles.activate,
                    {
                      backgroundColor:
                        activatingRole === r
                          ? colors.brand.primary
                          : colors.brand.tint,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Sparkles
                    size={14}
                    color={colors.text.inverse}
                    strokeWidth={2.4}
                  />
                  <Text variant="bodySm" color={colors.text.inverse} style={styles.bold}>
                    {activatingRole === r ? 'Activated' : 'Activate'}
                  </Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  section: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: radii.lg,
    ...shadows.soft,
  },
  activate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  bold: {
    fontWeight: '600',
  },
});
