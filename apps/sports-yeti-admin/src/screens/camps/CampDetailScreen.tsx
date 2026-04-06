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
import type { MainStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const STATUS_COLORS: Record<string, string> = {
  draft: COLORS.textMuted,
  open: COLORS.success,
  closed: COLORS.warning,
  completed: COLORS.primary,
  cancelled: COLORS.error,
};

export function CampDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, 'CampDetail'>>();
  const { id } = route.params;

  const { data: camp, isLoading, error, refetch } = useQuery({
    queryKey: ['camp', id],
    queryFn: () => api.getCamp(id),
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !camp) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load camp</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[camp.status] || COLORS.textMuted;
  const enrollmentPct = camp.max_participants > 0
    ? Math.round(((camp.registrations_count ?? 0) / camp.max_participants) * 100)
    : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('CampForm', { id: camp.id })}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>{camp.name}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{camp.status}</Text>
          </View>
          <Text style={styles.metaText}>{camp.league?.name ?? 'No League'}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>
            {new Date(camp.start_date).toLocaleDateString()}
          </Text>
          <Text style={styles.statCardLabel}>Start Date</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>
            {new Date(camp.end_date).toLocaleDateString()}
          </Text>
          <Text style={styles.statCardLabel}>End Date</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>${Number(camp.registration_fee).toFixed(2)}</Text>
          <Text style={styles.statCardLabel}>Fee</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>{camp.skill_level}</Text>
          <Text style={styles.statCardLabel}>Skill Level</Text>
        </View>
      </View>

      {camp.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <View style={styles.contentCard}>
            <Text style={styles.contentText}>{camp.description}</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Registrations</Text>
          <Text style={styles.completionText}>{enrollmentPct}% full</Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${enrollmentPct}%`,
                backgroundColor: enrollmentPct >= 90 ? COLORS.error : enrollmentPct >= 50 ? COLORS.warning : COLORS.success,
              },
            ]}
          />
        </View>
        <Text style={styles.registrationCount}>
          {camp.registrations_count ?? 0} of {camp.max_participants} spots filled
        </Text>
      </View>

      {camp.age_group && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Age Group</Text>
          <View style={styles.contentCard}>
            <Text style={styles.contentText}>{camp.age_group}</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attendance Tracking</Text>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderIcon}>📋</Text>
          <Text style={styles.placeholderText}>Attendance tracking will be available here</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  badge: { paddingVertical: 4, paddingHorizontal: SPACING.sm, borderRadius: 4 },
  badgeText: { fontSize: FONT_SIZES.xs, fontWeight: '600', textTransform: 'capitalize' },
  metaText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg, gap: SPACING.sm,
  },
  statCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.md,
    flex: 1, minWidth: 140, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  statCardValue: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  statCardLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
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
    overflow: 'hidden', marginBottom: SPACING.sm,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  registrationCount: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  placeholderCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.xl,
    borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  placeholderIcon: { fontSize: 48, marginBottom: SPACING.md },
  placeholderText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
});
