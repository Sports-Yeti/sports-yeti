import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Building2 } from 'lucide-react-native';
import { OrgAvatar } from '@sports-yeti/ui';
import {
  ORGANIZATIONS,
  leaguesByOrg,
  facilitiesByOrg,
  activeSeasonsForOrg,
  type Organization,
} from '@sports-yeti/mocks';
import {
  DataTable,
  PageHeader,
  PageScroll,
  type AdminRouteName,
  type DataTableColumn,
} from '../../admin';
import { Button, Input, Tag, Text } from '../../ui';
import { colors, spacing } from '../../theme';
import { formatDate } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

export function OrganizationListScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ORGANIZATIONS;
    return ORGANIZATIONS.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.slug.toLowerCase().includes(q),
    );
  }, [search]);

  const columns: DataTableColumn<Organization>[] = [
    {
      id: 'name',
      header: 'Organization',
      width: 320,
      sortable: true,
      accessor: (o) => (
        <View style={styles.nameCell}>
          <OrgAvatar
            name={o.name}
            logoUrl={o.logoUrl}
            brandColor={o.brandColor}
            size="md"
          />
          <View>
            <Text variant="bodySm" weight="600" color={colors.text.primary}>
              {o.name}
            </Text>
            <Text variant="caption" color={colors.text.muted}>
              {o.city}, {o.state} · {o.slug}
            </Text>
          </View>
        </View>
      ),
    },
    {
      id: 'leagues',
      header: 'Leagues',
      width: 100,
      align: 'right',
      accessor: (o) => (
        <Text variant="bodySm" color={colors.text.primary}>
          {leaguesByOrg(o.id).length}
        </Text>
      ),
    },
    {
      id: 'facilities',
      header: 'Facilities',
      width: 110,
      align: 'right',
      accessor: (o) => (
        <Text variant="bodySm" color={colors.text.primary}>
          {facilitiesByOrg(o.id).length}
        </Text>
      ),
    },
    {
      id: 'active',
      header: 'Active seasons',
      width: 140,
      align: 'right',
      accessor: (o) => (
        <Tag
          tone="success"
          size="sm"
          label={`${activeSeasonsForOrg(o.id).length} active`}
        />
      ),
    },
    {
      id: 'created',
      header: 'Created',
      width: 140,
      accessor: (o) => (
        <Text variant="bodySm" color={colors.text.secondary}>
          {formatDate(o.createdAtIso)}
        </Text>
      ),
    },
  ];

  return (
    <PageScroll>
      <PageHeader
        title="Organizations"
        subtitle="Every Sports Yeti organization, with leagues + facilities + active seasons at a glance."
        crumbs={[{ label: 'Organization' }, { label: 'Organizations' }]}
        onNavigate={(r) => navigation.navigate(r)}
        trailing={
          <Button
            variant="solid"
            size="sm"
            label="New organization"
            onPress={() => undefined}
          />
        }
      />
      <View style={[styles.toolbar, { gap: spacing.sm }]}>
        <Input
          value={search}
          onChangeText={setSearch}
          placeholder="Search organizations…"
          size="sm"
        />
      </View>
      <DataTable<Organization>
        columns={columns}
        rows={visible}
        rowKey={(o) => o.id}
        onRowPress={(o) =>
          navigation.navigate('OrganizationDetail', { id: o.id })
        }
        emptyTitle="No organizations match your search"
        emptyDescription="Try a different search or clear filters."
        emptyIcon={<Building2 size={32} color={colors.text.muted} />}
      />
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  nameCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
