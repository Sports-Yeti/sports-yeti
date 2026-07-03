import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronLeft } from 'lucide-react-native';
import { SkillLevelPill, Tag } from '@sports-yeti/ui';
import {
  playerById,
  teamById,
  type SubRequest,
} from '@sports-yeti/mocks';
import { EmptyState, Text, useToast } from '../../ui';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  useSubRequestsForTeam,
  useSubRequestsStore,
} from '../../features/sub-requests-store';

export function SubRequestInboxScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<{ params: { teamId: string } }, 'params'>>();
  const toast = useToast();
  const team = useMemo(
    () => teamById(route.params.teamId),
    [route.params.teamId],
  );
  // Seeded + session requests with confirmations applied — shared with
  // CaptainHome so both surfaces agree on what's open vs filled.
  const requests = useSubRequestsForTeam(team?.id);
  const confirmInStore = useSubRequestsStore((s) => s.confirmApplicant);

  function confirmApplicant(req: SubRequest, playerId: string) {
    confirmInStore(req.id, playerId);
    toast.show({
      variant: 'success',
      title: 'Sub confirmed',
      description: `${playerById(playerId)?.name ?? 'Player'} is locked in.`,
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
          Sub requests
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 120 },
        ]}
      >
        {requests.length === 0 ? (
          <EmptyState
            title="No sub requests"
            description={`Nothing posted for ${team?.name ?? 'this team'} yet. Post one and matching players apply.`}
            primaryAction={{ label: 'Back', onPress: () => navigation.goBack() }}
          />
        ) : (
          requests.map((req) => {
            const filled = req.status === 'filled' || !!req.filledPlayerId;
            return (
              <View key={req.id} style={styles.card}>
                <View style={[styles.headerRow, { gap: spacing.xs }]}>
                  <Text variant="bodyLg" style={styles.bold}>
                    {req.position ?? 'Any position'}
                  </Text>
                  {req.skillLevel ? (
                    <SkillLevelPill level={req.skillLevel} />
                  ) : null}
                  <Tag
                    size="sm"
                    tone={
                      filled
                        ? 'success'
                        : req.status === 'pending_captain_confirm'
                        ? 'warning'
                        : 'info'
                    }
                    label={
                      filled
                        ? 'Filled'
                        : req.status === 'pending_captain_confirm'
                        ? 'Pending confirm'
                        : 'Open'
                    }
                    leadingDot
                  />
                </View>
                {req.message ? (
                  <Text variant="bodySm" color={colors.text.secondary}>
                    “{req.message}”
                  </Text>
                ) : null}

                {req.applicantPlayerIds.length === 0 ? (
                  <Text variant="caption" color={colors.text.muted}>
                    No applicants yet.
                  </Text>
                ) : (
                  <View style={[styles.applicantList, { gap: spacing.xs }]}>
                    {req.applicantPlayerIds.map((pid) => {
                      const p = playerById(pid);
                      const isFilled = req.filledPlayerId === pid;
                      return (
                        <View
                          key={pid}
                          style={[styles.applicantRow, { gap: spacing.sm }]}
                        >
                          <View style={{ flex: 1, gap: 2 }}>
                            <Text variant="body" style={styles.bold}>
                              {p?.name ?? 'Unknown'}
                            </Text>
                            <Text
                              variant="caption"
                              color={colors.text.muted}
                            >
                              {p?.position ?? '—'} · {p?.skillLevel ?? '—'}
                            </Text>
                          </View>
                          {isFilled ? (
                            <Tag
                              size="sm"
                              tone="success"
                              label="Confirmed"
                              icon={
                                <Check
                                  size={12}
                                  color={colors.status.success}
                                  strokeWidth={2.4}
                                />
                              }
                            />
                          ) : filled ? (
                            <Tag size="sm" tone="neutral" label="Skipped" />
                          ) : (
                            <Pressable
                              accessibilityRole="button"
                              accessibilityLabel={`Confirm ${p?.name ?? 'player'}`}
                              onPress={() => confirmApplicant(req, pid)}
                              style={({ pressed }) => [
                                styles.confirmBtn,
                                { opacity: pressed ? 0.85 : 1 },
                              ]}
                            >
                              <Text
                                variant="bodySm"
                                color={colors.text.inverse}
                                style={styles.bold}
                              >
                                Confirm
                              </Text>
                            </Pressable>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
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
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  applicantList: {
    marginTop: spacing.sm,
  },
  applicantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  confirmBtn: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  bold: {
    fontWeight: '600',
  },
});
