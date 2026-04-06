import React from 'react';
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
import type { RefereeAssignment, MainStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type DetailRouteProp = RouteProp<MainStackParamList, 'RefereeDetail'>;

function StarRating({ rating, size = 18 }: { rating: number; size?: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Text key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? '#F59E0B' : COLORS.disabled }}>
        ★
      </Text>
    );
  }
  return <View style={{ flexDirection: 'row', gap: 2 }}>{stars}</View>;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: COLORS.warning,
    accepted: COLORS.success,
    rejected: COLORS.error,
    completed: COLORS.primary,
  };
  const color = colors[status] ?? COLORS.textMuted;

  return (
    <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.statusText, { color }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
}

export function RefereeDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DetailRouteProp>();
  const { id } = route.params;

  const { data: referee, isLoading, error } = useQuery({
    queryKey: ['referee', id],
    queryFn: () => api.getReferee(id),
  });

  const { data: assignmentsData } = useQuery({
    queryKey: ['referee-assignments', id],
    queryFn: () => api.getRefereeAssignments({ referee_id: id, per_page: 10 }),
    enabled: !!referee,
  });

  const assignments = assignmentsData?.data ?? [];
  const completedGames = assignments.filter((a) => a.status === 'completed');
  const totalEarned = completedGames.reduce((sum, a) => sum + a.assigned_rate, 0);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !referee) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load referee details</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Back to Referees</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(referee.user?.name ?? 'R').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{referee.user?.name ?? 'Unknown'}</Text>
            <Text style={styles.profileEmail}>{referee.user?.email}</Text>
            <View style={styles.ratingRow}>
              <StarRating rating={referee.rating} />
              <Text style={styles.ratingValue}>{Number(referee.rating).toFixed(1)}</Text>
            </View>
          </View>
          <View
            style={[
              styles.availBadge,
              { backgroundColor: (referee.is_available ? COLORS.success : COLORS.textMuted) + '20' },
            ]}
          >
            <Text style={{ color: referee.is_available ? COLORS.success : COLORS.textMuted, fontWeight: '600', fontSize: FONT_SIZES.sm }}>
              {referee.is_available ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>

        {referee.bio && <Text style={styles.bio}>{referee.bio}</Text>}

        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Sport Types</Text>
            <View style={styles.sportTags}>
              {referee.sport_types.map((sport) => (
                <View key={sport} style={styles.sportTag}>
                  <Text style={styles.sportTagText}>{sport}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Experience</Text>
            <Text style={styles.detailValue}>{referee.experience_level}</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Certification</Text>
            <Text style={styles.detailValue}>{referee.certification ?? 'None'}</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Hourly Rate</Text>
            <Text style={styles.detailValue}>${referee.hourly_rate}/hr</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Earnings Summary</Text>
        <View style={styles.earningsRow}>
          <View style={styles.earningsCard}>
            <Text style={styles.earningsAmount}>${Number(totalEarned).toFixed(2)}</Text>
            <Text style={styles.earningsLabel}>Total Earned</Text>
          </View>
          <View style={styles.earningsCard}>
            <Text style={styles.earningsAmount}>{referee.total_games}</Text>
            <Text style={styles.earningsLabel}>Total Games</Text>
          </View>
          <View style={styles.earningsCard}>
            <Text style={styles.earningsAmount}>{completedGames.length}</Text>
            <Text style={styles.earningsLabel}>Completed</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Assignments</Text>
        {assignments.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>No assignments yet</Text>
          </View>
        ) : (
          assignments.map((assignment: RefereeAssignment) => (
            <View key={assignment.id} style={styles.assignmentCard}>
              <View style={styles.assignmentHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.assignmentTeams}>
                    {assignment.game?.team1?.name ?? 'Team 1'} vs {assignment.game?.team2?.name ?? 'Team 2'}
                  </Text>
                  <Text style={styles.assignmentDate}>
                    {assignment.game?.scheduled_at
                      ? new Date(assignment.game.scheduled_at).toLocaleDateString()
                      : 'TBD'}
                  </Text>
                </View>
                <StatusBadge status={assignment.status} />
              </View>
              <View style={styles.assignmentDetails}>
                <Text style={styles.assignmentRate}>${assignment.assigned_rate}</Text>
                {assignment.rating_given && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <StarRating rating={assignment.rating_given} size={12} />
                    <Text style={styles.assignmentRating}>{Number(assignment.rating_given).toFixed(1)}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  backLink: {
    alignSelf: 'flex-start',
  },
  backLinkText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  profileSection: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  ratingValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  availBadge: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: 6,
  },
  bio: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  detailCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.md,
    minWidth: '45%',
    flex: 1,
  },
  detailLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sportTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  sportTag: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  sportTagText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  section: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  earningsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  earningsCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  earningsAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  earningsLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  emptySection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  assignmentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  assignmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  assignmentTeams: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  assignmentDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  assignmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignmentRate: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.success,
  },
  assignmentRating: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
});
