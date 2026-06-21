import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Star, Users } from 'lucide-react-native';
import { RoleBadge, SkillLevelPill, Tabs, Tag } from '@sports-yeti/ui';
import {
  facilitiesByOrg,
  organizationById,
  PLAYERS,
  REFEREES,
  ROLE_STACKS,
  type Player,
  type Referee,
  type RoleStack,
} from '@sports-yeti/mocks';
import {
  DataTable,
  PageHeader,
  PageScroll,
  type AdminRouteName,
  type DataTableColumn,
} from '../../admin';
import { Button, Input, Text } from '../../ui';
import { OrgBrandingProvider } from '../../features/org-branding';
import { colors, spacing } from '../../theme';
import { DEMO_ORG_ID } from '@sports-yeti/mocks';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'player', label: 'Players' },
  { key: 'team_captain', label: 'Captains' },
  { key: 'referee', label: 'Referees' },
  { key: 'facility_manager', label: 'FMs' },
];

interface PersonRow {
  id: string;
  name: string;
  city: string;
  roles: string[];
  skill?: Player['skillLevel'];
  rating?: number;
  totalGames?: number;
}

export function OrgPeopleScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const org = useMemo(() => organizationById(DEMO_ORG_ID), []);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  const fmUserIds = useMemo(() => {
    return new Set(
      facilitiesByOrg(DEMO_ORG_ID).flatMap((f) =>
        ROLE_STACKS.filter((rs: RoleStack) =>
          rs.roles.some(
            (r) => r.role === 'facility_manager' && r.scopeId === f.id,
          ),
        ).map((rs) => rs.userId),
      ),
    );
  }, []);

  const rows = useMemo<PersonRow[]>(() => {
    const playerRows: PersonRow[] = PLAYERS.map((p: Player) => {
      const stack = ROLE_STACKS.find((rs: RoleStack) => rs.userId === p.userId);
      const roles = stack?.roles.map((r) => r.role) ?? ['player'];
      return {
        id: p.id,
        name: p.name,
        city: p.city,
        roles,
        skill: p.skillLevel,
      };
    });
    const refRows: PersonRow[] = REFEREES.map((r: Referee) => {
      const stack = ROLE_STACKS.find((rs: RoleStack) => rs.userId === r.userId);
      const roles = stack?.roles.map((rr) => rr.role) ?? ['referee'];
      return {
        id: r.id,
        name: r.name,
        city: r.city,
        roles,
        rating: r.rating,
        totalGames: r.totalGames,
      };
    });
    // Merge unique by name (since the demo user appears as both player + referee).
    const merged = new Map<string, PersonRow>();
    [...playerRows, ...refRows].forEach((row) => {
      const existing = merged.get(row.name);
      if (existing) {
        existing.roles = Array.from(new Set([...existing.roles, ...row.roles]));
        existing.rating = row.rating ?? existing.rating;
        existing.totalGames = row.totalGames ?? existing.totalGames;
        existing.skill = row.skill ?? existing.skill;
      } else {
        // Mark FMs by checking the user-id set
        const stack = ROLE_STACKS.find((rs: RoleStack) =>
          rs.roles.some((rr) => rr.role === 'player' && rs.userId === row.id),
        );
        const userId = stack?.userId;
        const isFm = userId ? fmUserIds.has(userId) : false;
        if (isFm) row.roles = Array.from(new Set([...row.roles, 'facility_manager']));
        merged.set(row.name, row);
      }
    });
    return Array.from(merged.values());
  }, [fmUserIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (tab !== 'all' && !r.roles.includes(tab)) return false;
      if (!q) return true;
      return `${r.name} ${r.city}`.toLowerCase().includes(q);
    });
  }, [rows, search, tab]);

  const columns: DataTableColumn<PersonRow>[] = [
    {
      id: 'name',
      header: 'Name',
      width: 240,
      sortable: true,
      accessor: (p) => (
        <View style={{ gap: 4 }}>
          <Text variant="bodySm" weight="600">
            {p.name}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            {p.city}
          </Text>
        </View>
      ),
    },
    {
      id: 'roles',
      header: 'Roles',
      width: 320,
      accessor: (p) => (
        <View style={[styles.metaRow, { gap: 4 }]}>
          {p.roles.map((r) => (
            <RoleBadge key={r} role={r} />
          ))}
        </View>
      ),
    },
    {
      id: 'skill',
      header: 'Skill',
      width: 160,
      accessor: (p) =>
        p.skill ? <SkillLevelPill level={p.skill} /> : <Text variant="caption" color={colors.text.muted}>—</Text>,
    },
    {
      id: 'rating',
      header: 'Rating',
      width: 100,
      align: 'right',
      accessor: (p) =>
        typeof p.rating === 'number' ? (
          <Tag
            size="sm"
            tone="warning"
            icon={
              <Star
                size={11}
                color={colors.status.warning}
                fill={colors.status.warning}
                strokeWidth={2.25}
              />
            }
            label={p.rating.toFixed(1)}
          />
        ) : (
          <Text variant="caption" color={colors.text.muted}>—</Text>
        ),
    },
  ];

  if (!org) return null;

  return (
    <OrgBrandingProvider org={org}>
      <PageScroll>
        <PageHeader
          variant="flatHero"
          eyebrow="ORG ADMIN · PEOPLE"
          title="People"
          subtitle="Unified directory across players, captains, referees, and facility managers."
          crumbs={[
            { label: 'Organization' },
            { label: org.name, route: 'OrganizationDetail' },
            { label: 'People' },
          ]}
          onNavigate={(r) => navigation.navigate(r)}
          trailing={
            <Button
              size="sm"
              variant="solid"
              label="Invite"
              onPress={() => navigation.navigate('InvitePeople')}
            />
          }
        />

        <Tabs
          items={TABS.map((t) => ({
            ...t,
            badge:
              t.key === 'all'
                ? String(rows.length)
                : String(rows.filter((r) => r.roles.includes(t.key)).length),
          }))}
          value={tab}
          onChange={setTab}
          variant="pill"
          scrollable
        />

        <View style={[styles.toolbar, { gap: spacing.sm }]}>
          <Input
            variant="search"
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or city…"
            size="sm"
          />
        </View>

        <DataTable<PersonRow>
          columns={columns}
          rows={filtered}
          rowKey={(p) => p.id}
          emptyTitle="No people match"
          emptyDescription="Try a different filter or invite someone new."
          emptyIcon={<Users size={32} color={colors.text.muted} />}
        />
      </PageScroll>
    </OrgBrandingProvider>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
});
