import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Goal, MailPlus } from 'lucide-react-native';
import {
  BulkActionBar,
  DataTable,
  PageHeader,
  PageScroll,
  type AdminRouteName,
  type DataTableColumn,
} from '../../admin';
import { Avatar, Button, Input, Select, Tabs, Tag, Text, useToast } from '../../ui';
import { colors, spacing } from '../../theme';
import {
  EXPERIENCE_LABEL,
  KIND_LABEL,
  PEOPLE,
  type Person,
  type PersonKind,
} from '../../mocks/people';
import { formatRelative } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const TABS = [
  { key: 'all', label: 'All people' },
  { key: 'player', label: 'Players' },
  { key: 'referee', label: 'Referees' },
  { key: 'coach', label: 'Coaches' },
  { key: 'parent', label: 'Parents' },
];

const WAIVER_TONE = {
  signed: 'success' as const,
  expired: 'live' as const,
  unsigned: 'warning' as const,
};

interface PeopleListProps {
  defaultKind?: PersonKind | 'all';
  routeName: AdminRouteName;
}

function PeopleList({ defaultKind = 'all', routeName }: PeopleListProps) {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const toast = useToast();
  const inviteSeed: string =
    defaultKind === 'all' ? 'player' : (defaultKind as string);
  const [kind, setKind] = useState<PersonKind | 'all'>(defaultKind);
  const [search, setSearch] = useState('');
  const [experience, setExperience] = useState<string>('all');
  const [waiver, setWaiver] = useState<string>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PEOPLE.filter((p) => {
      if (kind !== 'all' && p.kind !== kind) return false;
      if (experience !== 'all' && p.experience !== experience) return false;
      if (waiver !== 'all' && p.waiverStatus !== waiver) return false;
      if (q && !`${p.name} ${p.handle} ${p.position ?? ''} ${p.city}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [kind, experience, waiver, search]);

  const columns: DataTableColumn<Person>[] = [
    {
      id: 'person',
      header: 'Person',
      width: 280,
      sortable: true,
      accessor: (p) => (
        <View style={styles.cellRow}>
          <Avatar uri={p.avatar} initials={p.name.charAt(0)} size={28} />
          <View style={styles.cellBody}>
            <Text variant="bodySm" color={colors.text.primary} weight="600">
              {p.name}
            </Text>
            <Text variant="caption" color={colors.text.muted}>
              {p.handle}
            </Text>
          </View>
        </View>
      ),
    },
    {
      id: 'kind',
      header: 'Type',
      width: 110,
      accessor: (p) => <Tag size="sm" tone="brand" label={KIND_LABEL[p.kind]} />,
    },
    {
      id: 'context',
      header: 'Context',
      width: 200,
      accessor: (p) => (
        <View>
          <Text variant="bodySm" color={colors.text.primary}>
            {p.position ?? '—'}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            {p.city}
          </Text>
        </View>
      ),
    },
    {
      id: 'experience',
      header: 'Experience',
      width: 140,
      accessor: (p) => (
        <Text variant="bodySm" color={colors.text.secondary}>
          {EXPERIENCE_LABEL[p.experience]}
        </Text>
      ),
    },
    {
      id: 'waiver',
      header: 'Waiver',
      width: 120,
      accessor: (p) => (
        <Tag size="sm" tone={WAIVER_TONE[p.waiverStatus]} leadingDot label={p.waiverStatus} />
      ),
    },
    {
      id: 'joined',
      header: 'Joined',
      width: 130,
      sortable: true,
      accessor: (p) => (
        <Text variant="bodySm" color={colors.text.muted}>
          {formatRelative(p.joinedIso)}
        </Text>
      ),
    },
  ];

  const toggleAll = () =>
    setSelected((prev) =>
      prev.size === visible.length ? new Set() : new Set(visible.map((p) => p.id)),
    );

  return (
    <PageScroll>
      <PageHeader
        title={routeName === 'Referees' ? 'Referees' : routeName === 'Players' ? 'Players' : 'People'}
        subtitle={routeName === 'Referees' ? 'Officials, ratings, and assignments' : 'Players, referees, coaches, and parents in your org'}
        meta={`${visible.length} of ${PEOPLE.filter((p) => kind === 'all' || p.kind === kind).length} shown`}
        trailing={
          <Button
            label="Invite people"
            variant="solid"
            size="sm"
            leadingIcon={<MailPlus size={14} color={colors.text.inverse} strokeWidth={2.5} />}
            onPress={() => navigation.navigate('InvitePeople', { id: inviteSeed })}
          />
        }
      />

      {defaultKind === 'all' ? (
        <Tabs items={TABS} value={kind} onChange={(k) => setKind(k as PersonKind | 'all')} variant="segmented" />
      ) : null}

      <View style={styles.toolbar}>
        <Input
          variant="search"
          value={search}
          onChangeText={setSearch}
          placeholder="Search name, handle, position…"
          containerStyle={styles.searchField}
        />
        <Select
          options={[
            { value: 'all', label: 'All experience' },
            ...(['beginner', 'intermediate', 'advanced', 'pro'] as const).map((e) => ({
              value: e,
              label: EXPERIENCE_LABEL[e],
            })),
          ]}
          value={experience}
          onChange={setExperience}
          width={180}
        />
        <Select
          options={[
            { value: 'all', label: 'All waivers' },
            { value: 'signed', label: 'Signed' },
            { value: 'unsigned', label: 'Unsigned' },
            { value: 'expired', label: 'Expired' },
          ]}
          value={waiver}
          onChange={setWaiver}
          width={180}
        />
      </View>

      <DataTable
        columns={columns}
        rows={visible}
        rowKey={(p) => p.id}
        selectable
        selectedIds={selected}
        onToggleSelect={(id) =>
          setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          })
        }
        onToggleSelectAll={toggleAll}
        emptyTitle="No people match"
        emptyDescription="Try widening filters or invite new people."
        emptyIcon={<Goal size={20} color={colors.brand.primary} strokeWidth={2.25} />}
      />

      <BulkActionBar
        selectedCount={selected.size}
        onClear={() => setSelected(new Set())}
        actions={[
          {
            label: 'Send waiver reminder',
            onPress: () => {
              toast.show({
                variant: 'success',
                title: `Reminded ${selected.size} ${selected.size === 1 ? 'person' : 'people'}`,
              });
              setSelected(new Set());
            },
          },
          {
            label: 'Export CSV',
            onPress: () => {
              toast.show({
                variant: 'info',
                title: `Exported ${selected.size} rows`,
              });
              setSelected(new Set());
            },
          },
        ]}
      />
    </PageScroll>
  );
}

export function PlayerListScreen() {
  return <PeopleList defaultKind="player" routeName="Players" />;
}

export function RefereeListScreen() {
  return <PeopleList defaultKind="referee" routeName="Referees" />;
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
  cellBody: {
    flex: 1,
    gap: 2,
  },
});
