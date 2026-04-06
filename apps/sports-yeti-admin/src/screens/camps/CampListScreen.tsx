import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { Camp, PaginationMeta, MainStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const CAMP_STATUSES = ['draft', 'open', 'closed', 'completed', 'cancelled'] as const;

const STATUS_COLORS: Record<string, string> = {
  draft: COLORS.textMuted,
  open: COLORS.success,
  closed: COLORS.warning,
  completed: COLORS.primary,
  cancelled: COLORS.error,
};

interface CampCardProps {
  camp: Camp;
  onPress: () => void;
  onDelete: () => void;
}

function CampCard({ camp, onPress, onDelete }: CampCardProps) {
  const statusColor = STATUS_COLORS[camp.status] || COLORS.textMuted;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleSection}>
          <Text style={styles.cardTitle}>{camp.name}</Text>
          <Text style={styles.leagueName}>{camp.league?.name ?? 'No League'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{camp.status}</Text>
        </View>
      </View>

      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {new Date(camp.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
          <Text style={styles.statLabel}>Start</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {new Date(camp.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
          <Text style={styles.statLabel}>End</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${Number(camp.registration_fee).toFixed(0)}</Text>
          <Text style={styles.statLabel}>Fee</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{camp.registrations_count ?? 0}/{camp.max_participants}</Text>
          <Text style={styles.statLabel}>Enrolled</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={(e) => { e.stopPropagation(); onPress(); }}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export function CampListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['camps', { search: searchQuery, status: statusFilter, page }],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, per_page: 15 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      return api.getCamps(params);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteCamp(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['camps'] }),
  });

  const camps = data?.data ?? [];
  const meta: PaginationMeta | undefined = data?.meta;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleSearch = (text: string) => { setSearchQuery(text); setPage(1); };

  const handleDeleteCamp = async (camp: Camp) => {
    if (confirm(`Are you sure you want to delete "${camp.name}"?`)) {
      await deleteMutation.mutateAsync(camp.id);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Camps</Text>
          <Text style={styles.subtitle}>Manage camps and registrations</Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CampForm', {})}
        >
          <Text style={styles.createButtonText}>+ Create Camp</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search camps..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, !statusFilter && styles.filterChipActive]}
            onPress={() => { setStatusFilter(''); setPage(1); }}
          >
            <Text style={[styles.filterChipText, !statusFilter && styles.filterChipTextActive]}>All</Text>
          </TouchableOpacity>
          {CAMP_STATUSES.map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
              onPress={() => { setStatusFilter(statusFilter === status ? '' : status); setPage(1); }}
            >
              <Text style={[styles.filterChipText, statusFilter === status && styles.filterChipTextActive]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load camps</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {camps.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>⛺</Text>
              <Text style={styles.emptyTitle}>No camps found</Text>
              <Text style={styles.emptyText}>
                {searchQuery || statusFilter ? 'Try adjusting your filters' : 'Create your first camp to get started'}
              </Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {camps.map((camp) => (
                <CampCard
                  key={camp.id}
                  camp={camp}
                  onPress={() => navigation.navigate('CampDetail', { id: camp.id })}
                  onDelete={() => handleDeleteCamp(camp)}
                />
              ))}
            </View>
          )}

          {meta && meta.last_page > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
                onPress={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <Text style={styles.pageButtonText}>Previous</Text>
              </TouchableOpacity>
              <Text style={styles.pageInfo}>Page {meta.current_page} of {meta.last_page}</Text>
              <TouchableOpacity
                style={[styles.pageButton, page === meta.last_page && styles.pageButtonDisabled]}
                onPress={() => setPage(Math.min(meta.last_page, page + 1))}
                disabled={page === meta.last_page}
              >
                <Text style={styles.pageButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: SPACING.lg, paddingBottom: SPACING.md,
  },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  createButton: { backgroundColor: COLORS.primary, paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.lg, borderRadius: 8 },
  createButtonText: { color: COLORS.textLight, fontSize: FONT_SIZES.md, fontWeight: '600' },
  filtersContainer: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 8, paddingHorizontal: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchIcon: { fontSize: 16, marginRight: SPACING.sm },
  searchInput: { flex: 1, paddingVertical: SPACING.sm + 2, fontSize: FONT_SIZES.md, color: COLORS.text },
  clearIcon: { fontSize: 16, color: COLORS.textMuted, padding: SPACING.xs },
  filterScroll: { flexGrow: 0 },
  filterChip: {
    backgroundColor: COLORS.surface, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: 20, marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '500' },
  filterChipTextActive: { color: COLORS.textLight },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  errorText: { fontSize: FONT_SIZES.md, color: COLORS.error, marginBottom: SPACING.md },
  retryButton: { backgroundColor: COLORS.primary, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: 8 },
  retryButtonText: { color: COLORS.textLight, fontSize: FONT_SIZES.md, fontWeight: '600' },
  listContainer: { flex: 1, paddingHorizontal: SPACING.lg },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -SPACING.sm },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.lg, margin: SPACING.sm,
    minWidth: 320, maxWidth: '48%', flex: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  cardTitleSection: { flex: 1, marginRight: SPACING.sm },
  cardTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  leagueName: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  statusBadge: { paddingVertical: 4, paddingHorizontal: SPACING.sm, borderRadius: 4 },
  statusText: { fontSize: FONT_SIZES.xs, fontWeight: '600', textTransform: 'capitalize' },
  cardStats: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.md,
    borderTopWidth: 1, borderTopColor: COLORS.border, marginBottom: SPACING.md,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: SPACING.sm },
  actionButton: { flex: 1, paddingVertical: SPACING.sm, borderRadius: 6, alignItems: 'center' },
  viewButton: { backgroundColor: COLORS.primaryLight },
  viewButtonText: { color: COLORS.primary, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  deleteButton: { backgroundColor: COLORS.error + '15' },
  deleteButtonText: { color: COLORS.error, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.xxl * 2 },
  emptyIcon: { fontSize: 64, marginBottom: SPACING.lg },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center', maxWidth: 300 },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.lg },
  pageButton: {
    backgroundColor: COLORS.surface, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  pageButtonDisabled: { opacity: 0.5 },
  pageButtonText: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '500' },
  pageInfo: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
});
