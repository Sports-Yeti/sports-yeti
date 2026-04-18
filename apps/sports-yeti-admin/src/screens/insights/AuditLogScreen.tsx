import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollText } from 'lucide-react-native';
import {
  DataTable,
  PageHeader,
  PageScroll,
  type DataTableColumn,
} from '../../admin';
import { Avatar, Input, Select, Tag, Text } from '../../ui';
import { colors, spacing } from '../../theme';
import { AUDIT_LOG, type AuditEvent, type AuditEventKind, type AuditSubjectKind } from '../../mocks/insights';
import { formatDateTime, formatRelative } from '../../lib/format';

const KIND_TONE: Record<AuditEventKind, 'success' | 'warning' | 'live' | 'info' | 'brand' | 'neutral'> = {
  created: 'brand',
  updated: 'info',
  deleted: 'live',
  approved: 'success',
  rejected: 'live',
  refunded: 'warning',
  invited: 'brand',
};

const SUBJECT_OPTIONS: { value: AuditSubjectKind | 'all'; label: string }[] = [
  { value: 'all', label: 'All subjects' },
  { value: 'league', label: 'League' },
  { value: 'team', label: 'Team' },
  { value: 'player', label: 'Player' },
  { value: 'facility', label: 'Facility' },
  { value: 'booking', label: 'Booking' },
  { value: 'payment', label: 'Payment' },
  { value: 'waiver', label: 'Waiver' },
  { value: 'camp', label: 'Camp' },
  { value: 'referee', label: 'Referee' },
  { value: 'settings', label: 'Settings' },
];

export function AuditLogScreen() {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState<AuditSubjectKind | 'all'>('all');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return AUDIT_LOG.filter((e) => {
      if (subject !== 'all' && e.subjectKind !== subject) return false;
      if (q && !`${e.description} ${e.subjectLabel} ${e.causerName}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, subject]);

  const columns: DataTableColumn<AuditEvent>[] = [
    {
      id: 'when',
      header: 'When',
      width: 160,
      accessor: (e) => (
        <View>
          <Text variant="bodySm" color={colors.text.primary}>
            {formatRelative(e.occurredAtIso)}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            {formatDateTime(e.occurredAtIso)}
          </Text>
        </View>
      ),
    },
    {
      id: 'event',
      header: 'Event',
      width: 360,
      accessor: (e) => (
        <View style={styles.cellRow}>
          <Tag size="sm" tone={KIND_TONE[e.kind]} label={e.kind} />
          <Text variant="bodySm" color={colors.text.primary} numberOfLines={2}>
            {e.description}
          </Text>
        </View>
      ),
    },
    {
      id: 'subject',
      header: 'Subject',
      width: 180,
      accessor: (e) => (
        <View>
          <Text variant="bodySm" color={colors.text.primary}>
            {e.subjectLabel}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            {e.subjectKind}
          </Text>
        </View>
      ),
    },
    {
      id: 'by',
      header: 'By',
      width: 200,
      accessor: (e) => (
        <View style={styles.cellRow}>
          <Avatar uri={e.causerAvatar} initials={e.causerName.charAt(0)} size={24} />
          <Text variant="bodySm" color={colors.text.primary}>
            {e.causerName}
          </Text>
        </View>
      ),
    },
  ];

  return (
    <PageScroll>
      <PageHeader
        title="Audit log"
        subtitle="Every change made by you and your teammates"
        meta={`${AUDIT_LOG.length} events · last 7 days`}
      />

      <View style={styles.toolbar}>
        <Input
          variant="search"
          value={search}
          onChangeText={setSearch}
          placeholder="Search description, subject, or admin…"
          containerStyle={styles.searchField}
        />
        <Select
          options={SUBJECT_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
          value={subject}
          onChange={(v) => setSubject(v as AuditSubjectKind | 'all')}
          width={200}
        />
      </View>

      <DataTable
        columns={columns}
        rows={visible}
        rowKey={(e) => e.id}
        emptyTitle="No events match"
        emptyIcon={<ScrollText size={20} color={colors.brand.primary} strokeWidth={2.25} />}
      />
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  searchField: {
    flex: 1,
    minWidth: 240,
  },
  cellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
