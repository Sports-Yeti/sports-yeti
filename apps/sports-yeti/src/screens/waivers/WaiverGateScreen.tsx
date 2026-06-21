import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ShieldAlert } from 'lucide-react-native';
import { Tag } from '@sports-yeti/ui';
import {
  computeWaiverGate,
  DEMO_USER_ID,
  organizationById,
  facilityById,
  type Waiver,
  type WaiverScopeKind,
} from '@sports-yeti/mocks';
import { Text } from '../../ui';
import { colors, radii, shadows, spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

interface RouteParams {
  /** Action identifier — used in the announcement and toast. */
  action: string;
  /** Required scopes to gate against. JSON-encoded array. */
  scopes: { kind: WaiverScopeKind; scopeId: string }[];
}

export function WaiverGateScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const action = route.params?.action ?? 'continue';
  const scopes = route.params?.scopes ?? [];

  const gate = useMemo(
    () => computeWaiverGate(DEMO_USER_ID, scopes),
    [scopes],
  );

  function scopeLabel(w: Waiver): string {
    if (w.scopeKind === 'organization') {
      return organizationById(w.scopeId)?.name ?? 'Organization';
    }
    if (w.scopeKind === 'facility') {
      return facilityById(w.scopeId)?.name ?? 'Facility';
    }
    return w.scopeKind;
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
          Waivers required
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 120 },
        ]}
        // a11y: announce the block as soon as we land
        accessible
        accessibilityLabel={`Action blocked. ${gate.blocking.length} waiver${gate.blocking.length === 1 ? '' : 's'} required to ${action}.`}
      >
        <View style={[styles.heroCard, { gap: spacing.md }]}>
          <View style={styles.heroIcon}>
            <ShieldAlert
              size={28}
              color={colors.status.error}
              strokeWidth={2.25}
            />
          </View>
          <Text variant="display" color={colors.text.primary} style={styles.title}>
            Almost there
          </Text>
          <Text variant="body" color={colors.text.secondary}>
            You can't {action} until you sign the required waivers below. They
            protect you and the league. Most take under a minute.
          </Text>
          <View style={[styles.metaRow, { gap: spacing.xs }]}>
            <Tag
              size="sm"
              tone="success"
              label={`${gate.signed.length} already signed`}
            />
            <Tag
              size="sm"
              tone="warning"
              label={`${gate.blocking.length} blocking`}
              leadingDot
            />
          </View>
        </View>

        {gate.blocking.length === 0 ? (
          <View style={styles.allClearCard}>
            <Text variant="body" color={colors.status.success} style={styles.bold}>
              You're cleared. All required waivers are signed.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue"
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                styles.continueBtn,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text variant="body" color={colors.text.inverse} style={styles.bold}>
                Continue
              </Text>
            </Pressable>
          </View>
        ) : (
          gate.blocking.map((w) => (
            <View key={w.id} style={styles.waiverCard}>
              <View style={[styles.waiverHead, { gap: spacing.xs }]}>
                <Text variant="bodyLg" style={styles.bold}>
                  {w.title}
                </Text>
                <View style={[styles.metaRow, { gap: spacing.xs }]}>
                  <Tag size="sm" tone="info" label={scopeLabel(w)} />
                  <Tag size="sm" tone="neutral" label={`v${w.version}`} />
                </View>
              </View>
              <Text variant="bodySm" color={colors.text.secondary}>
                {w.body.slice(0, 160)}…
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Sign ${w.title}`}
                onPress={() =>
                  navigation.navigate('WaiverSign', { waiverId: w.id })
                }
                style={({ pressed }) => [
                  styles.signBtn,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text variant="body" color={colors.text.inverse} style={styles.bold}>
                  Sign now
                </Text>
              </Pressable>
            </View>
          ))
        )}
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
    gap: spacing.md,
  },
  heroCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: spacing.xl,
    alignItems: 'flex-start',
    ...shadows.card,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.soft,
  },
  title: {
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  allClearCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.soft,
  },
  continueBtn: {
    backgroundColor: colors.status.success,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radii.pill,
  },
  waiverCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  waiverHead: {
    gap: 4,
  },
  signBtn: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  bold: {
    fontWeight: '600',
  },
});
