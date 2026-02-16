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
import { useQuery } from '@tanstack/react-query';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import { AuditDetailModal } from '../../components/AuditDetailModal';
import type { AuditLog, PaginationMeta } from '../../types';

const AUDIT_EVENTS = [
  { value: '', label: 'All Events' },
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
  { value: 'deleted', label: 'Deleted' },
];

function getEventColor(event: string): { bg: string; text: string } {
  switch (event) {
    case 'created':
      return { bg: COLORS.success + '20', text: COLORS.success };
    case 'updated':
      return { bg: COLORS.warning + '20', text: COLORS.warning };
    case 'deleted':
      return { bg: COLORS.error + '20', text: COLORS.error };
    default:
      return { bg: COLORS.textMuted + '20', text: COLORS.textMuted };
  }
}

function formatSubjectType(subjectType: string | null): string {
  if (!subjectType) return 'System';
  // Extract class name from full namespace
  const parts = subjectType.split('\\');
  return parts[parts.length - 1];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

interface AuditRowProps {
  log: AuditLog;
  onPress: () => void;
}

function AuditRow({ log, onPress }: AuditRowProps) {
  const eventColors = getEventColor(log.event);

  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.rowLeft}>
        <View style={[styles.eventBadge, { backgroundColor: eventColors.bg }]}>
          <Text style={[styles.eventText, { color: eventColors.text }]}>
            {log.event}
          </Text>
        </View>
        <View style={styles.rowDetails}>
          <Text style={styles.description} numberOfLines={1}>
            {log.description}
          </Text>
          <View style={styles.rowMeta}>
            <Text style={styles.subjectType}>
              {formatSubjectType(log.subject_type)}
            </Text>
            {log.subject_id && (
              <Text style={styles.subjectId}>{log.subject_id.slice(0, 8)}...</Text>
            )}
          </View>
        </View>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.causer}>
          {log.causer?.name || 'System'}
        </Text>
        <Text style={styles.timeAgo}>{formatTimeAgo(log.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function AuditLogScreen() {
  const [eventFilter, setEventFilter] = useState('');
  const [subjectTypeFilter, setSubjectTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'auditLogs',
      { event: eventFilter, subject_type: subjectTypeFilter, search: searchQuery, dateFrom, dateTo, page },
    ],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        page,
        per_page: 25,
      };
      if (eventFilter) params.event = eventFilter;
      if (subjectTypeFilter) params.subject_type = subjectTypeFilter;
      if (searchQuery) params.search = searchQuery;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      return api.getAuditLogs(params);
    },
  });

  // Fetch available subject types for filter
  const { data: subjectTypesData } = useQuery({
    queryKey: ['auditSubjectTypes'],
    queryFn: async () => {
      // This would call a subject types endpoint if available
      // For now, return common types
      return [
        { value: '', label: 'All Types' },
        { value: 'user', label: 'User' },
        { value: 'player', label: 'Player' },
        { value: 'team', label: 'Team' },
        { value: 'league', label: 'League' },
        { value: 'game', label: 'Game' },
        { value: 'booking', label: 'Booking' },
        { value: 'payment', label: 'Payment' },
        { value: 'facility', label: 'Facility' },
        { value: 'camp', label: 'Camp' },
      ];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const logs = data?.data ?? [];
  const meta: PaginationMeta | undefined = data?.meta;
  const subjectTypes = subjectTypesData ?? [{ value: '', label: 'All Types' }];

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setPage(1);
  };

  const clearFilters = () => {
    setEventFilter('');
    setSubjectTypeFilter('');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const hasFilters = eventFilter || subjectTypeFilter || searchQuery || dateFrom || dateTo;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Audit Logs</Text>
          <Text style={styles.subtitle}>
            Track all system activities and changes
          </Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search audit logs..."
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

        <View style={styles.filtersRow}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Event</Text>
            <View style={styles.selectWrapper}>
              <select
                style={styles.selectInput as never}
                value={eventFilter}
                onChange={(e) => {
                  setEventFilter((e.target as HTMLSelectElement).value);
                  setPage(1);
                }}
              >
                {AUDIT_EVENTS.map((event) => (
                  <option key={event.value} value={event.value}>
                    {event.label}
                  </option>
                ))}
              </select>
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Entity Type</Text>
            <View style={styles.selectWrapper}>
              <select
                style={styles.selectInput as never}
                value={subjectTypeFilter}
                onChange={(e) => {
                  setSubjectTypeFilter((e.target as HTMLSelectElement).value);
                  setPage(1);
                }}
              >
                {subjectTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>From Date</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.textMuted}
              value={dateFrom}
              onChangeText={(text) => {
                setDateFrom(text);
                setPage(1);
              }}
            />
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>To Date</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.textMuted}
              value={dateTo}
              onChangeText={(text) => {
                setDateTo(text);
                setPage(1);
              }}
            />
          </View>

          {hasFilters && (
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats Summary */}
      {meta && (
        <View style={styles.statsBar}>
          <Text style={styles.statsText}>
            Showing {logs.length} of {meta.total} audit logs
          </Text>
        </View>
      )}

      {/* Content */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load audit logs</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {logs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No audit logs found</Text>
              <Text style={styles.emptyText}>
                {hasFilters
                  ? 'Try adjusting your search or filters'
                  : 'Audit logs will appear here as activities occur'}
              </Text>
            </View>
          ) : (
            logs.map((log) => (
              <AuditRow
                key={log.id}
                log={log}
                onPress={() => setSelectedLog(log)}
              />
            ))
          )}

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
                onPress={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <Text style={styles.pageButtonText}>Previous</Text>
              </TouchableOpacity>
              <Text style={styles.pageInfo}>
                Page {meta.current_page} of {meta.last_page}
              </Text>
              <TouchableOpacity
                style={[
                  styles.pageButton,
                  page === meta.last_page && styles.pageButtonDisabled,
                ]}
                onPress={() => setPage(Math.min(meta.last_page, page + 1))}
                disabled={page === meta.last_page}
              >
                <Text style={styles.pageButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Audit Detail Modal */}
      <AuditDetailModal
        visible={selectedLog !== null}
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  filtersContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  clearIcon: {
    fontSize: 16,
    color: COLORS.textMuted,
    padding: SPACING.xs,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  filterGroup: {
    minWidth: 140,
  },
  filterLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  selectWrapper: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectInput: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    minWidth: 140,
    cursor: 'pointer',
  },
  dateInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    minWidth: 130,
  },
  clearButton: {
    backgroundColor: COLORS.error + '15',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
  },
  clearButtonText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  statsBar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  statsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.lg,
  },
  eventBadge: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
    marginRight: SPACING.md,
    minWidth: 70,
    alignItems: 'center',
  },
  eventText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  rowDetails: {
    flex: 1,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  subjectType: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
  },
  subjectId: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
  rowRight: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  causer: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  timeAgo: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.lg,
  },
  pageButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  pageInfo: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
