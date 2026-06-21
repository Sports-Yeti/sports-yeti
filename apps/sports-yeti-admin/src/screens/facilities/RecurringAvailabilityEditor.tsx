import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import {
  availabilityForSpace,
  facilityById,
  spacesByFacility,
  type RecurringAvailabilitySlot,
  type Space,
  type Weekday,
} from '@sports-yeti/mocks';
import {
  PageHeader,
  PageScroll,
  type AdminRouteName,
} from '../../admin';
import { Button, Card, Tabs, Tag, Text, useToast } from '../../ui';
import { colors, spacing } from '../../theme';
import { formatCurrency } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

const WEEKDAYS: { key: Weekday; label: string }[] = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

export function RecurringAvailabilityEditor() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const toast = useToast();
  const facility = useMemo(
    () => facilityById(route.params.id),
    [route.params.id],
  );
  const spaces = useMemo(
    () => (facility ? spacesByFacility(facility.id) : []),
    [facility],
  );
  const [activeSpaceId, setActiveSpaceId] = useState<string>(
    spaces[0]?.id ?? '',
  );
  const slots = useMemo(
    () => (activeSpaceId ? availabilityForSpace(activeSpaceId) : []),
    [activeSpaceId],
  );

  if (!facility) {
    return (
      <PageScroll>
        <PageHeader title="Facility not found" />
      </PageScroll>
    );
  }

  const slotsByDay: Record<Weekday, RecurringAvailabilitySlot[]> = {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: [],
  };
  slots.forEach((s) => {
    slotsByDay[s.weekday].push(s);
  });

  return (
    <PageScroll>
      <PageHeader
        title={`${facility.name} · Availability`}
        subtitle="Set the recurring weekly slots renters and league play can book against. Peak hours surface in orange."
        crumbs={[
          { label: 'Venues' },
          { label: 'Facilities', route: 'Facilities' },
          { label: facility.name, route: 'FacilityDetail' },
          { label: 'Availability' },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
      />

      <Tabs
        items={spaces.map((s: Space) => ({ key: s.id, label: s.name }))}
        value={activeSpaceId}
        onChange={setActiveSpaceId}
        scrollable
      />

      <Card padded>
        <View style={[styles.cardHead, { gap: spacing.sm }]}>
          <Text variant="h3">Weekly grid</Text>
          <Button
            size="sm"
            variant="solid"
            label="Add slot"
            onPress={() =>
              toast.show({
                variant: 'info',
                title: 'Slot editor coming soon',
                description:
                  'In the next iteration: tap-and-drag to draw slots on the grid.',
              })
            }
          />
        </View>
        <View style={[styles.grid, { gap: spacing.sm }]}>
          {WEEKDAYS.map(({ key, label }) => (
            <View key={key} style={[styles.dayCol, { gap: spacing.xs }]}>
              <Text variant="eyebrow" color={colors.text.secondary}>
                {label}
              </Text>
              {slotsByDay[key].length === 0 ? (
                <Text variant="caption" color={colors.text.muted}>
                  No slots
                </Text>
              ) : (
                slotsByDay[key].map((slot) => (
                  <View
                    key={slot.id}
                    style={[
                      styles.slotChip,
                      {
                        backgroundColor: slot.isPeak
                          ? colors.brand.alpine
                          : colors.surface.containerLow,
                        gap: 2,
                      },
                    ]}
                  >
                    <Text
                      variant="caption"
                      weight="600"
                      color={
                        slot.isPeak ? colors.text.inverse : colors.text.primary
                      }
                    >
                      {slot.startTime}–{slot.endTime}
                    </Text>
                    {slot.hourlyRateCents ? (
                      <Text
                        variant="caption"
                        color={
                          slot.isPeak
                            ? colors.text.inverse
                            : colors.text.muted
                        }
                      >
                        {formatCurrency(slot.hourlyRateCents)}/hr
                      </Text>
                    ) : null}
                  </View>
                ))
              )}
            </View>
          ))}
        </View>
        <View style={[styles.legend, { gap: spacing.sm, marginTop: 12 }]}>
          <Tag size="sm" tone="warning" label="Peak (alpine)" />
          <Tag size="sm" tone="neutral" label="Off-peak" />
        </View>
      </Card>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    width: '100%',
    flexWrap: 'wrap',
  },
  dayCol: {
    flex: 1,
    minWidth: 100,
  },
  slotChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
