import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { Player, WaiverSignature, MainStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export function WaiverDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, 'WaiverDetail'>>();
  const { id } = route.params;

  const { data: waiver, isLoading, error, refetch } = useQuery({
    queryKey: ['waiver', id],
    queryFn: () => api.getWaiver(id),
  });

  const { data: signaturesData } = useQuery({
    queryKey: ['waiver-signatures', id],
    queryFn: () => api.getWaiverSignatures(id),
    enabled: !!waiver,
  });

  const { data: leaguePlayersData, isLoading: isLoadingPlayers } = useQuery({
    queryKey: ['waiver-league-players', waiver?.league_id],
    queryFn: () => api.getPlayers({ league_id: waiver?.league_id, per_page: 500 }),
    enabled: !!waiver?.league_id,
  });

  const signatures: WaiverSignature[] = useMemo(
    () => signaturesData?.data ?? [],
    [signaturesData]
  );
  const leaguePlayers: Player[] = useMemo(
    () => leaguePlayersData?.data ?? [],
    [leaguePlayersData]
  );

  const signedPlayerIds = useMemo(
    () => new Set(signatures.map((s) => s.player_id)),
    [signatures]
  );

  const unsignedPlayers = useMemo(
    () => leaguePlayers.filter((p) => !signedPlayerIds.has(p.id)),
    [leaguePlayers, signedPlayerIds]
  );

  const totalExpected = leaguePlayers.length;
  const signedCount = signatures.length;
  const unsignedCount = unsignedPlayers.length;
  const completionPct = totalExpected > 0
    ? Math.round((signedCount / totalExpected) * 100)
    : 0;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !waiver) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load waiver</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('WaiverForm', { id: waiver.id })}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>{waiver.title}</Text>
        <View style={styles.metaRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: waiver.is_required ? COLORS.error + '20' : COLORS.success + '20' },
            ]}
          >
            <Text style={[styles.badgeText, { color: waiver.is_required ? COLORS.error : COLORS.success }]}>
              {waiver.is_required ? 'Required' : 'Optional'}
            </Text>
          </View>
          <Text style={styles.metaText}>{waiver.league?.name ?? 'All Leagues'}</Text>
          <Text style={styles.metaText}>Created {new Date(waiver.created_at).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{signedCount}</Text>
          <Text style={styles.summaryLabel}>Signed</Text>
        </View>
        <View style={[styles.summaryCard, unsignedCount > 0 && styles.summaryCardAlert]}>
          <Text style={[styles.summaryValue, unsignedCount > 0 && styles.summaryValueAlert]}>
            {unsignedCount}
          </Text>
          <Text style={[styles.summaryLabel, unsignedCount > 0 && styles.summaryLabelAlert]}>
            Unsigned
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{completionPct}%</Text>
          <Text style={styles.summaryLabel}>Complete</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content</Text>
        <View style={styles.contentCard}>
          <Text style={styles.contentText}>{waiver.content}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Completion Progress</Text>
          <Text style={styles.completionText}>{completionPct}% signed</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${completionPct}%` }]} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Unsigned Players</Text>
          {unsignedCount > 0 && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>{unsignedCount} unsigned</Text>
            </View>
          )}
        </View>

        {isLoadingPlayers ? (
          <View style={styles.loadingInline}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : unsignedPlayers.length === 0 ? (
          <View style={styles.emptyAllSigned}>
            <Text style={styles.emptyAllSignedText}>✓ All players have signed</Text>
          </View>
        ) : (
          unsignedPlayers.map((player) => (
            <View key={player.id} style={styles.unsignedRow}>
              <View style={styles.unsignedAvatar}>
                <Text style={styles.unsignedAvatarText}>
                  {player.user?.name?.charAt(0) ?? '?'}
                </Text>
              </View>
              <View style={styles.unsignedInfo}>
                <Text style={styles.unsignedName}>{player.user?.name ?? 'Unknown Player'}</Text>
                <Text style={styles.unsignedSub}>
                  {player.user?.email ?? 'No email'}
                  {player.teams && player.teams.length > 0
                    ? ` · ${player.teams.map((t) => t.name).join(', ')}`
                    : ''}
                </Text>
              </View>
              <View style={styles.unsignedBadge}>
                <Text style={styles.unsignedBadgeText}>Unsigned</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Signatures ({signedCount})</Text>

        {signatures.length === 0 ? (
          <Text style={styles.emptyText}>No signatures yet</Text>
        ) : (
          signatures.map((sig: WaiverSignature) => (
            <View key={sig.id} style={styles.signatureRow}>
              <View style={styles.signatureAvatar}>
                <Text style={styles.signatureAvatarText}>
                  {sig.player?.user?.name?.charAt(0) ?? '?'}
                </Text>
              </View>
              <View style={styles.signatureInfo}>
                <Text style={styles.signatureName}>{sig.player?.user?.name ?? 'Unknown Player'}</Text>
                <Text style={styles.signatureDate}>
                  Signed {new Date(sig.signed_at).toLocaleDateString()} at{' '}
                  {new Date(sig.signed_at).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingInline: { paddingVertical: SPACING.lg, alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  errorText: { fontSize: FONT_SIZES.md, color: COLORS.error, marginBottom: SPACING.md },
  retryButton: { backgroundColor: COLORS.primary, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: 8 },
  retryButtonText: { color: COLORS.textLight, fontSize: FONT_SIZES.md, fontWeight: '600' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.lg, paddingBottom: SPACING.sm,
  },
  backButton: { fontSize: FONT_SIZES.md, color: COLORS.primary, fontWeight: '600' },
  editButton: { backgroundColor: COLORS.primaryLight, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: 8 },
  editButtonText: { color: COLORS.primary, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  titleSection: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flexWrap: 'wrap' },
  badge: { paddingVertical: 4, paddingHorizontal: SPACING.sm, borderRadius: 4 },
  badgeText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  metaText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },

  summaryRow: {
    flexDirection: 'row', gap: SPACING.md,
    paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg,
  },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12,
    padding: SPACING.lg, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  summaryCardAlert: {
    backgroundColor: COLORS.error + '10',
    borderColor: COLORS.error + '40',
  },
  summaryValue: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.text },
  summaryValueAlert: { color: COLORS.error },
  summaryLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 4 },
  summaryLabelAlert: { color: COLORS.error, fontWeight: '600' },

  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  completionText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.primary },
  contentCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  contentText: { fontSize: FONT_SIZES.md, color: COLORS.text, lineHeight: 24 },
  progressTrack: {
    height: 8, backgroundColor: COLORS.border, borderRadius: 4,
    overflow: 'hidden', marginBottom: SPACING.lg,
  },
  progressFill: { height: '100%', backgroundColor: COLORS.success, borderRadius: 4 },

  alertBadge: {
    backgroundColor: COLORS.error,
    paddingVertical: 4, paddingHorizontal: SPACING.md,
    borderRadius: 12,
  },
  alertBadgeText: { color: COLORS.textLight, fontSize: FONT_SIZES.xs, fontWeight: '700' },

  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center', paddingVertical: SPACING.xl },
  emptyAllSigned: {
    backgroundColor: COLORS.success + '15',
    padding: SPACING.lg, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.success + '30',
  },
  emptyAllSignedText: {
    color: COLORS.success, fontSize: FONT_SIZES.md, fontWeight: '600', textAlign: 'center',
  },

  unsignedRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    padding: SPACING.md, borderRadius: 8, marginBottom: SPACING.sm,
    borderWidth: 1, borderLeftWidth: 4, borderColor: COLORS.border, borderLeftColor: COLORS.error,
  },
  unsignedAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.error + '20',
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
  },
  unsignedAvatarText: { color: COLORS.error, fontWeight: '700', fontSize: FONT_SIZES.md },
  unsignedInfo: { flex: 1 },
  unsignedName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  unsignedSub: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  unsignedBadge: {
    backgroundColor: COLORS.error + '15',
    paddingVertical: 4, paddingHorizontal: SPACING.sm,
    borderRadius: 4,
  },
  unsignedBadgeText: { fontSize: FONT_SIZES.xs, color: COLORS.error, fontWeight: '600' },

  signatureRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    padding: SPACING.md, borderRadius: 8, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  signatureAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
  },
  signatureAvatarText: { color: COLORS.textLight, fontWeight: '600', fontSize: FONT_SIZES.md },
  signatureInfo: { flex: 1 },
  signatureName: { fontSize: FONT_SIZES.md, fontWeight: '500', color: COLORS.text },
  signatureDate: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
});
