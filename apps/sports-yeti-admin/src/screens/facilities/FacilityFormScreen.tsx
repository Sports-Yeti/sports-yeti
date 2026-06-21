import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import {
  facilityById,
  ORGANIZATIONS,
  ownershipForFacility,
  USERS,
} from '@sports-yeti/mocks';
import { Check } from 'lucide-react-native';
import { PageHeader, PageScroll, type AdminRouteName } from '../../admin';
import { Button, Card, Input, Select, Tag, Text, useToast } from '../../ui';
import { colors, spacing } from '../../theme';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

export function FacilityFormScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<
    RouteProp<{ params: { id?: string } }, 'params'>
  >();
  const toast = useToast();
  const editingId = route.params?.id;
  const editing = useMemo(
    () => (editingId ? facilityById(editingId) : undefined),
    [editingId],
  );
  const ownership = useMemo(
    () => (editing ? ownershipForFacility(editing.id) : undefined),
    [editing],
  );

  const [name, setName] = useState(editing?.name ?? '');
  const [address, setAddress] = useState(editing?.address ?? '');
  const [city, setCity] = useState(editing?.city ?? '');
  const [state, setState] = useState(editing?.state ?? '');
  const [zip, setZip] = useState(editing?.zip ?? '');
  const [ownerOrgId, setOwnerOrgId] = useState(
    editing?.ownerOrgId ?? ORGANIZATIONS[0]?.id ?? '',
  );
  const [managerIds, setManagerIds] = useState<Set<string>>(
    new Set(ownership?.managerUserIds ?? []),
  );

  function toggleManager(uid: string) {
    setManagerIds((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }

  function onSubmit() {
    toast.show({
      variant: 'success',
      title: editing ? 'Facility updated' : 'Facility created',
      description: `${name} saved (mock).`,
    });
    navigation.goBack();
  }

  return (
    <PageScroll>
      <PageHeader
        title={editing ? `Edit ${editing.name}` : 'New facility'}
        subtitle="A facility belongs to an organization. Org admins assign one or more facility managers to operate it."
        crumbs={[
          { label: 'Venues' },
          { label: 'Facilities', route: 'Facilities' },
          { label: editing ? editing.name : 'New facility' },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
      />

      <Card padded>
        <Text variant="h3">Identity</Text>
        <View style={[styles.row, { gap: spacing.md }]}>
          <View style={{ flex: 2 }}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Name
            </Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Yeti Center"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Owner organization
            </Text>
            <Select
              value={ownerOrgId}
              onChange={setOwnerOrgId}
              options={ORGANIZATIONS.map((o) => ({
                value: o.id,
                label: o.name,
              }))}
            />
          </View>
        </View>
      </Card>

      <Card padded>
        <Text variant="h3">Address</Text>
        <View style={[styles.row, { gap: spacing.md }]}>
          <View style={{ flex: 2 }}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Street
            </Text>
            <Input
              value={address}
              onChangeText={setAddress}
              placeholder="1200 Tundra Way"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              City
            </Text>
            <Input value={city} onChangeText={setCity} placeholder="Denver" />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              State
            </Text>
            <Input value={state} onChangeText={setState} placeholder="CO" />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Zip
            </Text>
            <Input value={zip} onChangeText={setZip} placeholder="80211" />
          </View>
        </View>
      </Card>

      <Card padded>
        <Text variant="h3">Facility managers</Text>
        <Text variant="body" color={colors.text.secondary}>
          FMs can approve external bookings, edit availability, and see
          analytics for this facility.
        </Text>
        <View style={[styles.chipRow, { gap: spacing.xs }]}>
          {USERS.map((u) => {
            const selected = managerIds.has(u.id);
            return (
              <Button
                key={u.id}
                size="sm"
                variant={selected ? 'solid' : 'outline'}
                label={u.name}
                leadingIcon={
                  selected ? (
                    <Check size={14} color={colors.text.inverse} strokeWidth={2.75} />
                  ) : undefined
                }
                onPress={() => toggleManager(u.id)}
              />
            );
          })}
        </View>
        <View style={[styles.chipRow, { gap: spacing.xs, marginTop: 8 }]}>
          {Array.from(managerIds).map((id) => (
            <Tag key={id} size="sm" tone="success" label={USERS.find((u) => u.id === id)?.name ?? id} />
          ))}
        </View>
      </Card>

      <View style={[styles.actions, { gap: spacing.sm }]}>
        <Button
          size="md"
          variant="ghost"
          label="Cancel"
          onPress={() => navigation.goBack()}
        />
        <Button
          size="md"
          variant="solid"
          label={editing ? 'Save changes' : 'Create facility'}
          onPress={onSubmit}
        />
      </View>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: 12,
  },
});
