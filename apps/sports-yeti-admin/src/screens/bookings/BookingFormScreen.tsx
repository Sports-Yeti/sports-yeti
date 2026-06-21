import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { PageHeader, PageScroll, type AdminRouteName } from '../../admin';
import {
  Button,
  Card,
  Input,
  Select,
  Tabs,
  Text,
  useToast,
} from '../../ui';
import { colors, spacing } from '../../theme';
import {
  bookingById,
  type BookingStatus,
} from '../../mocks/bookings';
import { FACILITIES } from '../../mocks/facilities';
import { formatCurrency } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

interface FormState {
  facilityId: string;
  spaceId: string;
  hostName: string;
  hostHandle: string;
  partySize: string;
  startsAtIso: string;
  durationMinutes: string;
  status: BookingStatus;
  notes: string;
}

const STATUS_TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'cancelled', label: 'Cancelled' },
];

function buildInitial(id?: string): FormState {
  if (!id) {
    return {
      facilityId: FACILITIES[0]?.id ?? '',
      spaceId: FACILITIES[0]?.spaces[0]?.id ?? '',
      hostName: '',
      hostHandle: '',
      partySize: '',
      startsAtIso: '',
      durationMinutes: '60',
      status: 'pending',
      notes: '',
    };
  }
  const booking = bookingById(id);
  if (!booking) return buildInitial(undefined);
  const start = new Date(booking.startsAtIso).getTime();
  const end = new Date(booking.endsAtIso).getTime();
  const dur = Math.max(15, Math.round((end - start) / 60_000));
  return {
    facilityId: booking.facilityId,
    spaceId: booking.spaceId,
    hostName: booking.hostName,
    hostHandle: booking.hostHandle,
    partySize: String(booking.partySize),
    startsAtIso: booking.startsAtIso.slice(0, 16),
    durationMinutes: String(dur),
    status:
      booking.status === 'completed' ? 'confirmed' : booking.status,
    notes: booking.notes ?? '',
  };
}

export function BookingFormScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id?: string } }, 'params'>>();
  const editingId = route.params?.id;
  const toast = useToast();
  const [form, setForm] = useState<FormState>(() => buildInitial(editingId));
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => {
      // When facility changes, reset spaceId to the first space.
      if (key === 'facilityId' && value !== p.facilityId) {
        const facility = FACILITIES.find((f) => f.id === value);
        return {
          ...p,
          facilityId: value as string,
          spaceId: facility?.spaces[0]?.id ?? '',
        };
      }
      return { ...p, [key]: value };
    });

  const facility = FACILITIES.find((f) => f.id === form.facilityId);
  const spaceOptions = useMemo(
    () =>
      (facility?.spaces ?? []).map((s) => ({
        value: s.id,
        label: `${s.name} · ${formatCurrency(s.hourlyRateCents)}/hr`,
      })),
    [facility],
  );
  const space = facility?.spaces.find((s) => s.id === form.spaceId);

  const durationMin = Number(form.durationMinutes) || 0;
  const ratePerHourCents = space?.hourlyRateCents ?? 0;
  const totalCents = Math.round((ratePerHourCents * durationMin) / 60);

  const errors = {
    facilityId: !form.facilityId ? 'Pick a facility' : undefined,
    spaceId: !form.spaceId ? 'Pick a space' : undefined,
    hostName: !form.hostName.trim() ? 'Required' : undefined,
    hostHandle: !form.hostHandle.trim() ? 'Required' : undefined,
    partySize:
      !form.partySize ||
      Number.isNaN(Number(form.partySize)) ||
      Number(form.partySize) < 1
        ? '1 or more'
        : undefined,
    startsAtIso:
      !form.startsAtIso || Number.isNaN(new Date(form.startsAtIso).getTime())
        ? 'Use YYYY-MM-DDTHH:MM'
        : undefined,
    durationMinutes:
      !form.durationMinutes ||
      Number.isNaN(Number(form.durationMinutes)) ||
      Number(form.durationMinutes) < 15
        ? 'At least 15 minutes'
        : undefined,
  } as const;

  const showError = (key: keyof typeof errors) =>
    submitted ? errors[key] : undefined;
  const isValid = Object.values(errors).every((e) => !e);

  const handleSave = () => {
    setSubmitted(true);
    if (!isValid) {
      toast.show({ variant: 'warning', title: 'Fix the highlighted fields' });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.show({
        variant: 'success',
        title: editingId
          ? 'Booking updated'
          : `${formatCurrency(totalCents)} booking created`,
        description: editingId
          ? 'Host gets a push with the updated time.'
          : `${facility?.name} · ${space?.name} reserved.`,
      });
      navigation.goBack();
    }, 600);
  };

  return (
    <PageScroll>
      <PageHeader
        title={editingId ? 'Edit booking' : 'New booking'}
        subtitle={
          editingId
            ? 'Adjust time, host, party size, or status. Charges + refunds happen on the detail page.'
            : 'Reserve a space on behalf of a host. Saved bookings show on the calendar instantly.'
        }
        crumbs={[
          { label: 'Bookings', route: 'Bookings' },
          { label: editingId ? form.hostName || 'Edit' : 'New' },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
        trailing={
          <>
            <Button
              label="Cancel"
              variant="ghost"
              size="sm"
              onPress={() => navigation.goBack()}
              disabled={submitting}
            />
            <Button
              label={submitting ? 'Saving…' : editingId ? 'Save changes' : 'Create booking'}
              variant="solid"
              size="sm"
              onPress={handleSave}
              disabled={submitting}
            />
          </>
        }
      />

      <Card style={styles.section}>
        <Text variant="h3" color={colors.text.primary}>
          Where
        </Text>
        <View style={styles.row}>
          <Select
            label="Facility"
            value={form.facilityId}
            options={FACILITIES.map((f) => ({ value: f.id, label: f.name }))}
            onChange={(v) => update('facilityId', v)}
            error={showError('facilityId')}
            placeholder="Pick a facility"
            width={280}
          />
          <Select
            label="Space"
            value={form.spaceId}
            options={spaceOptions}
            onChange={(v) => update('spaceId', v)}
            error={showError('spaceId')}
            placeholder={facility ? 'Pick a space' : 'Pick a facility first'}
            disabled={!facility}
            width={320}
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" color={colors.text.primary}>
          When
        </Text>
        <View style={styles.row}>
          <Input
            label="Starts at (YYYY-MM-DDTHH:MM)"
            value={form.startsAtIso}
            onChangeText={(v) => update('startsAtIso', v)}
            error={showError('startsAtIso')}
            placeholder="2026-04-19T19:00"
            containerStyle={styles.flex2}
          />
          <Input
            label="Duration (minutes)"
            variant="number"
            value={form.durationMinutes}
            onChangeText={(v) => update('durationMinutes', v)}
            error={showError('durationMinutes')}
            placeholder="60"
            containerStyle={styles.flex}
          />
        </View>
        <View>
          <Text variant="caption" color={colors.text.secondary} style={styles.label}>
            Status
          </Text>
          <Tabs
            items={STATUS_TABS}
            value={form.status === 'completed' ? 'confirmed' : form.status}
            onChange={(v) => update('status', v as BookingStatus)}
            variant="segmented"
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" color={colors.text.primary}>
          Host
        </Text>
        <View style={styles.row}>
          <Input
            label="Host name"
            value={form.hostName}
            onChangeText={(v) => update('hostName', v)}
            error={showError('hostName')}
            placeholder="Marcus L."
            containerStyle={styles.flex}
          />
          <Input
            label="Host handle"
            value={form.hostHandle}
            onChangeText={(v) => update('hostHandle', v)}
            error={showError('hostHandle')}
            placeholder="@marcus_strikes"
            containerStyle={styles.flex}
          />
          <Input
            label="Party size"
            variant="number"
            value={form.partySize}
            onChangeText={(v) => update('partySize', v)}
            error={showError('partySize')}
            placeholder="14"
            containerStyle={styles.flex}
          />
        </View>
        <Input
          label="Notes"
          variant="multiline"
          value={form.notes}
          onChangeText={(v) => update('notes', v)}
          placeholder="Awaiting payment, gate code 4422, …"
        />
      </Card>

      <Card style={styles.section}>
        <View style={styles.summaryRow}>
          <Text variant="bodySm" color={colors.text.secondary}>
            Estimated total
          </Text>
          <Text variant="h3" color={colors.brand.primary}>
            {ratePerHourCents > 0 ? formatCurrency(totalCents) : 'Free'}
          </Text>
        </View>
        <Text variant="caption" color={colors.text.muted}>
          {space
            ? `${formatCurrency(ratePerHourCents)}/hr × ${(durationMin / 60).toFixed(2)} hrs`
            : 'Pick a space to compute the total.'}
        </Text>
      </Card>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  flex: { flex: 1, minWidth: 180 },
  flex2: { flex: 2, minWidth: 280 },
  label: { marginBottom: spacing.xs },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
