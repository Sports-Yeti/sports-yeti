import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { X } from 'lucide-react-native';
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
import {
  Button,
  Card,
  Input,
  Modal,
  Select,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import { colors, radii, spacing } from '../../theme';
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

const WEEKDAY_OPTIONS = WEEKDAYS.map((d) => ({
  value: d.key,
  label: { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }[d.key],
}));

const PEAK_TABS = [
  { key: 'off', label: 'Off-peak' },
  { key: 'peak', label: 'Peak' },
];

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

interface DraftSlot {
  weekday: Weekday;
  startTime: string;
  endTime: string;
  rateDollars: string;
  isPeak: boolean;
}

const EMPTY_DRAFT: DraftSlot = {
  weekday: 'mon',
  startTime: '18:00',
  endTime: '19:30',
  rateDollars: '',
  isPeak: false,
};

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

  // Seed all this facility's slots into local state so the admin can
  // add/remove them in-session (mock — no persistence yet).
  const [slots, setSlots] = useState<RecurringAvailabilitySlot[]>(() =>
    spaces.flatMap((s) => availabilityForSpace(s.id)),
  );

  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState<DraftSlot>(EMPTY_DRAFT);
  const [draftSubmitted, setDraftSubmitted] = useState(false);
  const [removeTarget, setRemoveTarget] =
    useState<RecurringAvailabilitySlot | null>(null);

  if (!facility) {
    return (
      <PageScroll>
        <PageHeader title="Facility not found" />
      </PageScroll>
    );
  }

  const activeSlots = slots.filter((s) => s.spaceId === activeSpaceId);
  const slotsByDay: Record<Weekday, RecurringAvailabilitySlot[]> = {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: [],
  };
  activeSlots.forEach((s) => {
    slotsByDay[s.weekday].push(s);
  });

  const draftErrors = {
    startTime: !TIME_RE.test(draft.startTime) ? 'Use HH:MM (24h)' : undefined,
    endTime: !TIME_RE.test(draft.endTime)
      ? 'Use HH:MM (24h)'
      : draft.endTime <= draft.startTime
      ? 'Must be after start'
      : undefined,
    rateDollars:
      draft.rateDollars && Number.isNaN(Number(draft.rateDollars))
        ? 'Numbers only'
        : undefined,
  } as const;
  const draftValid = Object.values(draftErrors).every((e) => !e);

  const openAdd = () => {
    setDraft(EMPTY_DRAFT);
    setDraftSubmitted(false);
    setAddOpen(true);
  };

  const handleAddSlot = () => {
    setDraftSubmitted(true);
    if (!draftValid) return;
    const rateCents = draft.rateDollars
      ? Math.round(Number(draft.rateDollars) * 100)
      : undefined;
    const newSlot: RecurringAvailabilitySlot = {
      id: `slot-${activeSpaceId}-${draft.weekday}-${draft.startTime.replace(':', '')}-${Date.now()}`,
      spaceId: activeSpaceId,
      weekday: draft.weekday,
      startTime: draft.startTime,
      endTime: draft.endTime,
      hourlyRateCents: rateCents,
      isPeak: draft.isPeak,
    };
    setSlots((prev) => [...prev, newSlot]);
    setAddOpen(false);
    toast.show({
      variant: 'success',
      title: 'Slot added',
      description: `${WEEKDAYS.find((d) => d.key === draft.weekday)?.label} ${draft.startTime}–${draft.endTime} (mock)`,
    });
  };

  const handleRemove = () => {
    if (!removeTarget) return;
    setSlots((prev) => prev.filter((s) => s.id !== removeTarget.id));
    setRemoveTarget(null);
    toast.show({ variant: 'info', title: 'Slot removed (mock)' });
  };

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
            onPress={openAdd}
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
                  <Pressable
                    key={slot.id}
                    onPress={() => setRemoveTarget(slot)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${label} ${slot.startTime} to ${slot.endTime} slot`}
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
                    <View style={styles.slotChipHead}>
                      <Text
                        variant="caption"
                        weight="600"
                        color={
                          slot.isPeak ? colors.text.inverse : colors.text.primary
                        }
                      >
                        {slot.startTime}–{slot.endTime}
                      </Text>
                      <X
                        size={11}
                        color={slot.isPeak ? colors.text.inverse : colors.text.muted}
                        strokeWidth={2.5}
                      />
                    </View>
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
                  </Pressable>
                ))
              )}
            </View>
          ))}
        </View>
        <View style={[styles.legend, { gap: spacing.sm, marginTop: 12 }]}>
          <Tag size="sm" tone="warning" label="Peak (alpine)" />
          <Tag size="sm" tone="neutral" label="Off-peak" />
          <Text variant="caption" color={colors.text.muted}>
            Tap a slot to remove it.
          </Text>
        </View>
      </Card>

      <Modal
        visible={addOpen}
        onRequestClose={() => setAddOpen(false)}
        title="Add availability slot"
        description="Recurring weekly slot for the selected space (mock)."
        primaryAction={{ label: 'Add slot', onPress: handleAddSlot }}
        secondaryAction={{ label: 'Cancel', onPress: () => setAddOpen(false) }}
      >
        <Select
          label="Day"
          value={draft.weekday}
          options={WEEKDAY_OPTIONS}
          onChange={(v) => setDraft((p) => ({ ...p, weekday: v as Weekday }))}
        />
        <View style={styles.row}>
          <Input
            label="Start (HH:MM)"
            value={draft.startTime}
            onChangeText={(v) => setDraft((p) => ({ ...p, startTime: v }))}
            error={draftSubmitted ? draftErrors.startTime : undefined}
            placeholder="18:00"
            containerStyle={styles.flex}
          />
          <Input
            label="End (HH:MM)"
            value={draft.endTime}
            onChangeText={(v) => setDraft((p) => ({ ...p, endTime: v }))}
            error={draftSubmitted ? draftErrors.endTime : undefined}
            placeholder="19:30"
            containerStyle={styles.flex}
          />
        </View>
        <Input
          label="Hourly rate (USD)"
          variant="number"
          value={draft.rateDollars}
          onChangeText={(v) => setDraft((p) => ({ ...p, rateDollars: v }))}
          error={draftSubmitted ? draftErrors.rateDollars : undefined}
          placeholder="85"
          helpText="Leave blank for league-only (non-rentable) slots."
        />
        <View>
          <Text variant="caption" color={colors.text.secondary} style={styles.label}>
            Pricing tier
          </Text>
          <Tabs
            items={PEAK_TABS}
            value={draft.isPeak ? 'peak' : 'off'}
            onChange={(v) => setDraft((p) => ({ ...p, isPeak: v === 'peak' }))}
            variant="segmented"
          />
        </View>
      </Modal>

      <Modal
        visible={removeTarget !== null}
        onRequestClose={() => setRemoveTarget(null)}
        variant="destructive"
        title="Remove this slot?"
        description={
          removeTarget
            ? `${WEEKDAYS.find((d) => d.key === removeTarget.weekday)?.label} ${removeTarget.startTime}–${removeTarget.endTime} will no longer be bookable.`
            : undefined
        }
        primaryAction={{ label: 'Remove slot', onPress: handleRemove }}
        secondaryAction={{ label: 'Keep', onPress: () => setRemoveTarget(null) }}
      />
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
    borderRadius: radii.sm,
  },
  slotChipHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  flex: {
    flex: 1,
    minWidth: 120,
  },
  label: {
    marginBottom: spacing.xs,
  },
});
