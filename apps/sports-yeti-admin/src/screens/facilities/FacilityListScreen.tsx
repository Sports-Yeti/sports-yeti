import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus, Warehouse } from 'lucide-react-native';
import { OrgAvatar, Tag as UITag } from '@sports-yeti/ui';
import {
  buildOrgFacilityTree,
  FACILITIES,
  ORGANIZATIONS,
  rentalConfigForSpace,
  type Facility,
  type Space,
  type SpaceRentalMode,
} from '@sports-yeti/mocks';
import {
  DataTable,
  PageHeader,
  PageScroll,
  type AdminRouteName,
  type DataTableColumn,
} from '../../admin';
import { Button, Card, Input, Tabs, Tag, Text } from '../../ui';
import { colors, spacing } from '../../theme';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const VIEW_TABS = [
  { key: 'portfolio', label: 'By organization' },
  { key: 'list', label: 'List' },
];

const RENTAL_TONE: Record<
  SpaceRentalMode,
  'success' | 'info' | 'warning'
> = {
  internal: 'info',
  external: 'success',
  both: 'warning',
};

const RENTAL_LABEL: Record<SpaceRentalMode, string> = {
  internal: 'Internal',
  external: 'External',
  both: 'Both',
};

export function FacilityListScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const [view, setView] = useState('portfolio');
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return FACILITIES;
    return FACILITIES.filter((f) =>
      `${f.name} ${f.city} ${f.address}`.toLowerCase().includes(q),
    );
  }, [search]);

  const orgTrees = useMemo(
    () =>
      ORGANIZATIONS.map((o) => buildOrgFacilityTree(o.id)).filter(
        (tree): tree is NonNullable<typeof tree> => !!tree,
      ),
    [],
  );

  function spaceMixForFacility(facilityId: string): {
    internal: number;
    external: number;
    both: number;
  } {
    const tree = orgTrees.find((t) =>
      t.facilities.some((fac) => fac.facility.id === facilityId),
    );
    if (!tree) return { internal: 0, external: 0, both: 0 };
    const facEntry = tree.facilities.find(
      (f) => f.facility.id === facilityId,
    );
    const counts = { internal: 0, external: 0, both: 0 };
    facEntry?.spaces.forEach((s: Space) => {
      const cfg = rentalConfigForSpace(s.id);
      if (!cfg) return;
      counts[cfg.rentalMode] += 1;
    });
    return counts;
  }

  const columns: DataTableColumn<Facility>[] = [
    {
      id: 'name',
      header: 'Facility',
      width: 280,
      sortable: true,
      accessor: (f) => (
        <View style={styles.cellStack}>
          <Text variant="bodySm" weight="600" color={colors.text.primary}>
            {f.name}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            {f.address} · {f.city}, {f.state}
          </Text>
        </View>
      ),
    },
    {
      id: 'mix',
      header: 'Space mix',
      width: 220,
      accessor: (f) => {
        const m = spaceMixForFacility(f.id);
        return (
          <View style={[styles.metaRow, { gap: spacing.xs }]}>
            {m.internal > 0 ? (
              <Tag size="sm" tone="info" label={`${m.internal} internal`} />
            ) : null}
            {m.external > 0 ? (
              <Tag size="sm" tone="success" label={`${m.external} external`} />
            ) : null}
            {m.both > 0 ? (
              <Tag size="sm" tone="warning" label={`${m.both} both`} />
            ) : null}
          </View>
        );
      },
    },
    {
      id: 'amenities',
      header: 'Amenities',
      width: 220,
      accessor: (f) => (
        <Text variant="caption" color={colors.text.muted}>
          {f.amenities.slice(0, 3).join(' · ')}
          {f.amenities.length > 3 ? ` · +${f.amenities.length - 3}` : ''}
        </Text>
      ),
    },
  ];

  return (
    <PageScroll>
      <PageHeader
        variant="hero"
        eyebrow="VENUES"
        title="Facilities"
        subtitle="Org-owned venues. Spaces can be reserved for league play, listed for external rental, or both."
        meta={`${visible.length} of ${FACILITIES.length} shown`}
        trailing={
          <Button
            label="Add facility"
            variant="solid"
            size="sm"
            leadingIcon={
              <Plus size={14} color={colors.text.inverse} strokeWidth={2.5} />
            }
            onPress={() => navigation.navigate('FacilityForm')}
          />
        }
      />

      <View style={[styles.toolbar, { gap: spacing.sm }]}>
        <Tabs items={VIEW_TABS} value={view} onChange={setView} />
        <View style={{ flex: 1 }}>
          <Input
            variant="search"
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or city…"
          />
        </View>
      </View>

      {view === 'portfolio' ? (
        orgTrees.map((tree) => (
          <Card key={tree.org.id} padded>
            <View style={[styles.orgHead, { gap: spacing.sm }]}>
              <OrgAvatar
                name={tree.org.name}
                logoUrl={tree.org.logoUrl}
                brandColor={tree.org.brandColor}
                size="md"
              />
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="h3">{tree.org.name}</Text>
                <Text variant="caption" color={colors.text.muted}>
                  {tree.facilities.length} facilit
                  {tree.facilities.length === 1 ? 'y' : 'ies'} ·{' '}
                  {tree.facilities.reduce(
                    (sum, fac) => sum + fac.spaces.length,
                    0,
                  )}{' '}
                  spaces
                </Text>
              </View>
            </View>
            {tree.facilities.map(({ facility, spaces }) => {
              const mix = spaceMixForFacility(facility.id);
              return (
                <View
                  key={facility.id}
                  style={[styles.facilityRow, { gap: spacing.sm }]}
                >
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text variant="bodySm" weight="600">
                      {facility.name}
                    </Text>
                    <Text variant="caption" color={colors.text.muted}>
                      {facility.address}, {facility.city}
                    </Text>
                  </View>
                  <View style={[styles.metaRow, { gap: spacing.xs }]}>
                    <UITag tone="neutral" size="sm" label={`${spaces.length} spaces`} />
                    {(['internal', 'external', 'both'] as SpaceRentalMode[]).map(
                      (mode) =>
                        mix[mode] > 0 ? (
                          <Tag
                            key={mode}
                            size="sm"
                            tone={RENTAL_TONE[mode]}
                            label={`${mix[mode]} ${RENTAL_LABEL[mode].toLowerCase()}`}
                          />
                        ) : null,
                    )}
                  </View>
                  <Button
                    size="sm"
                    variant="ghost"
                    label="Open"
                    onPress={() =>
                      navigation.navigate('FacilityDetail', {
                        id: facility.id,
                      })
                    }
                  />
                </View>
              );
            })}
          </Card>
        ))
      ) : (
        <DataTable<Facility>
          columns={columns}
          rows={visible}
          rowKey={(f) => f.id}
          onRowPress={(f) =>
            navigation.navigate('FacilityDetail', { id: f.id })
          }
          emptyTitle="No facilities match"
          emptyDescription="Try a different search or clear filters."
          emptyIcon={<Warehouse size={32} color={colors.text.muted} />}
        />
      )}
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    flexWrap: 'wrap',
  },
  cellStack: {
    flexDirection: 'column',
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  orgHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  facilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
});
