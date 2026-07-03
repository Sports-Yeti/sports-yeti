import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronLeft } from 'lucide-react-native';
import { Tag } from '@sports-yeti/ui';
import { waiverById } from '@sports-yeti/mocks';
import { EmptyState, Text, useToast } from '../../ui';
import { colors, radii, shadows, spacing } from '../../theme';
import { useWaiverSignatures } from '../../features/waiver-gate/waiver-signatures-store';

export function WaiverSignScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<{ params: { waiverId: string } }, 'params'>>();
  const toast = useToast();
  const waiver = useMemo(
    () => waiverById(route.params.waiverId),
    [route.params.waiverId],
  );
  const [agreed, setAgreed] = useState(false);
  // Session store, not local state — the gate that sent the player here
  // re-computes on return and actually unblocks.
  const recordSignature = useWaiverSignatures((s) => s.sign);
  const signed = useWaiverSignatures(
    (s) => !!s.signedWaiverIds[route.params.waiverId],
  );

  if (!waiver) {
    return (
      <View style={styles.root}>
        <EmptyState
          title="Waiver not found"
          description="It may have been retired or you opened a stale link."
          primaryAction={{ label: 'Back', onPress: () => navigation.goBack() }}
        />
      </View>
    );
  }

  function sign() {
    recordSignature(route.params.waiverId);
    toast.show({
      variant: 'success',
      title: 'Waiver signed',
      description: `${waiver?.title ?? 'Waiver'} accepted.`,
    });
    setTimeout(() => navigation.goBack(), 600);
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
          Sign waiver
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 120 },
        ]}
      >
        <View style={styles.headCard}>
          <Text variant="display" color={colors.text.primary} style={styles.title}>
            {waiver.title}
          </Text>
          <View style={[styles.metaRow, { gap: spacing.xs }]}>
            <Tag size="sm" tone="info" label={`v${waiver.version}`} />
            <Tag
              size="sm"
              tone="warning"
              label={waiver.isRequired ? 'Required' : 'Optional'}
              leadingDot
            />
          </View>
        </View>

        <View style={styles.bodyCard}>
          <Text variant="body" color={colors.text.primary}>
            {waiver.body}
          </Text>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}
          accessibilityLabel="I have read and agree to the waiver"
          onPress={() => setAgreed((v) => !v)}
          style={({ pressed }) => [
            styles.agreeRow,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: agreed ? colors.brand.primary : 'transparent',
                borderColor: agreed ? colors.brand.primary : colors.border.strong,
              },
            ]}
          >
            {agreed ? (
              <Check size={14} color={colors.text.inverse} strokeWidth={3} />
            ) : null}
          </View>
          <Text variant="body" color={colors.text.primary}>
            I have read and agree to this waiver.
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign waiver"
          accessibilityState={{ disabled: !agreed || signed }}
          disabled={!agreed || signed}
          onPress={sign}
          style={({ pressed }) => [
            styles.signBtn,
            {
              backgroundColor:
                !agreed || signed
                  ? colors.surface.chipMuted
                  : colors.brand.primary,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text
            variant="body"
            color={
              !agreed || signed ? colors.text.muted : colors.text.inverse
            }
            style={styles.bold}
          >
            {signed ? 'Signed ✓' : 'Sign with my name on file'}
          </Text>
        </Pressable>
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
  headCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  bodyCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: spacing.lg,
    ...shadows.soft,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface.card,
    borderRadius: radii.lg,
    ...shadows.soft,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  signBtn: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  bold: {
    fontWeight: '600',
  },
});
