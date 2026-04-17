import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { RefereeAssignment } from '../../types';

const STATUS_FILTERS = ['all', 'pending', 'accepted', 'completed', 'rejected'];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: COLORS.warning,
    accepted: COLORS.success,
    rejected: COLORS.error,
    completed: COLORS.primary,
  };
  const color = colors[status] ?? COLORS.textSecondary;

  return (
    <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.statusText, { color }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
}

interface ReportModalProps {
  visible: boolean;
  assignment: RefereeAssignment | null;
  onClose: () => void;
  onSubmit: (report: string) => void;
}

function ReportModal({ visible, onClose, onSubmit }: ReportModalProps) {
  const [report, setReport] = useState('');

  const handleSubmit = () => {
    if (report.trim()) {
      onSubmit(report.trim());
      setReport('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={reportStyles.overlay}>
        <View style={reportStyles.container}>
          <Text style={reportStyles.title}>Submit Game Report</Text>
          <TextInput
            style={reportStyles.input}
            value={report}
            onChangeText={setReport}
            placeholder="Describe the game, any incidents, scores..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <View style={reportStyles.actions}>
            <TouchableOpacity style={reportStyles.cancelButton} onPress={onClose}>
              <Text style={reportStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[reportStyles.submitButton, !report.trim() && { opacity: 0.5 }]}
              onPress={handleSubmit}
              disabled={!report.trim()}
            >
              <Text style={reportStyles.submitText}>Submit Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function MyAssignmentsScreen() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [reportAssignment, setReportAssignment] = useState<RefereeAssignment | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-referee-assignments', statusFilter],
    queryFn: () => {
      const params: Record<string, unknown> = { per_page: 20 };
      if (statusFilter !== 'all') params.status = statusFilter;
      return api.getMyRefereeAssignments(params);
    },
  });

  const assignments = data?.data ?? [];

  const reportMutation = useMutation({
    mutationFn: ({ id, report }: { id: string; report: string }) =>
      api.submitRefereeReport(id, { report }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-referee-assignments'] });
      setReportAssignment(null);
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => api.acceptRefereeAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-referee-assignments'] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: (id: string) => api.declineRefereeAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-referee-assignments'] });
    },
  });

  const respondingId =
    acceptMutation.isPending && acceptMutation.variables
      ? acceptMutation.variables
      : declineMutation.isPending && declineMutation.variables
        ? declineMutation.variables
        : null;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderAssignment = ({ item }: { item: RefereeAssignment }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.teams}>
            {item.game?.team1?.name ?? 'Team 1'} vs {item.game?.team2?.name ?? 'Team 2'}
          </Text>
          <Text style={styles.dateText}>
            {item.game?.scheduled_at
              ? `${new Date(item.game.scheduled_at).toLocaleDateString()} at ${new Date(item.game.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'TBD'}
          </Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      {item.game?.facility && (
        <Text style={styles.venueText}>📍 {item.game.facility.name}</Text>
      )}

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Pay</Text>
          <Text style={styles.detailValue}>${Number(item.assigned_rate).toFixed(2)}</Text>
        </View>
        {item.bid_amount !== null && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Your Bid</Text>
            <Text style={styles.detailValue}>${Number(item.bid_amount).toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Type</Text>
          <Text style={styles.detailValue}>{item.is_bidding ? 'Bid' : 'Fixed'}</Text>
        </View>
      </View>

      {item.status === 'pending' && (
        <View style={styles.responseRow}>
          <TouchableOpacity
            style={[
              styles.acceptButton,
              respondingId === item.id && styles.responseButtonDisabled,
            ]}
            onPress={() => acceptMutation.mutate(item.id)}
            disabled={respondingId === item.id}
          >
            {respondingId === item.id && acceptMutation.isPending ? (
              <ActivityIndicator size="small" color={COLORS.textLight} />
            ) : (
              <Text style={styles.responseButtonText}>Accept</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.declineButton,
              respondingId === item.id && styles.responseButtonDisabled,
            ]}
            onPress={() => declineMutation.mutate(item.id)}
            disabled={respondingId === item.id}
          >
            {respondingId === item.id && declineMutation.isPending ? (
              <ActivityIndicator size="small" color={COLORS.textLight} />
            ) : (
              <Text style={styles.responseButtonText}>Decline</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'completed' && !item.report && (
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => setReportAssignment(item)}
        >
          <Text style={styles.reportButtonText}>Submit Report</Text>
        </TouchableOpacity>
      )}

      {item.report && (
        <View style={styles.reportPreview}>
          <Text style={styles.reportLabel}>Report submitted</Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {STATUS_FILTERS.map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
            onPress={() => setStatusFilter(status)}
          >
            <Text style={[styles.filterChipText, statusFilter === status && styles.filterChipTextActive]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={assignments}
        renderItem={renderAssignment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No assignments</Text>
            <Text style={styles.emptyText}>
              {statusFilter !== 'all'
                ? 'No assignments with this status'
                : 'Accept games to see your assignments here'}
            </Text>
          </View>
        }
      />

      <ReportModal
        visible={!!reportAssignment}
        assignment={reportAssignment}
        onClose={() => setReportAssignment(null)}
        onSubmit={(report) => {
          if (reportAssignment) reportMutation.mutate({ id: reportAssignment.id, report });
        }}
      />
    </View>
  );
}

const reportStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    minHeight: 120,
    marginBottom: SPACING.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

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
  filterScroll: {
    flexGrow: 0,
    paddingVertical: SPACING.sm,
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: COLORS.textLight,
  },
  listContent: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  teams: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  dateText: {
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
  },
  venueText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  responseRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  declineButton: {
    flex: 1,
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  responseButtonDisabled: {
    opacity: 0.6,
  },
  responseButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  reportButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  reportButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  reportPreview: {
    backgroundColor: COLORS.background,
    borderRadius: 6,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
  },
  reportLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: '500',
  },
  emptyContainer: {
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
  },
});
