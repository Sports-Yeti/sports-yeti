import React, { useState } from 'react';
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
import { CAMPS, type CampStatus } from '../../mocks/camps';
import { SPORT_OPTIONS, type SportKey } from '../../mocks/leagues';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

interface FormState {
  name: string;
  sport: SportKey;
  city: string;
  status: CampStatus;
  startIso: string;
  endIso: string;
  feeDollars: string;
  capacity: string;
  ageGroup: string;
  description: string;
  cover: string;
}

const STATUS_TABS = [
  { key: 'draft', label: 'Draft' },
  { key: 'open', label: 'Open' },
  { key: 'closed', label: 'Closed' },
];

function dollarsFromCents(cents: number): string {
  return cents === 0 ? '0' : (cents / 100).toFixed(2).replace(/\.00$/, '');
}

function buildInitial(id?: string): FormState {
  if (!id) {
    return {
      name: '',
      sport: 'soccer',
      city: '',
      status: 'draft',
      startIso: '',
      endIso: '',
      feeDollars: '',
      capacity: '',
      ageGroup: 'Open',
      description: '',
      cover: '',
    };
  }
  const camp = CAMPS.find((c) => c.id === id);
  if (!camp) return buildInitial(undefined);
  // Best-effort sport key from sportLabel:
  const inferredSport: SportKey = camp.sportLabel.toLowerCase().includes('hockey')
    ? 'hockey'
    : camp.sportLabel.toLowerCase().includes('volley')
    ? 'volleyball'
    : camp.sportLabel.toLowerCase().includes('basket')
    ? 'basketball'
    : camp.sportLabel.toLowerCase().includes('tennis')
    ? 'tennis'
    : camp.sportLabel.toLowerCase().includes('softball') ||
      camp.sportLabel.toLowerCase().includes('baseball')
    ? 'baseball'
    : 'soccer';
  return {
    name: camp.name,
    sport: inferredSport,
    city: camp.city,
    status: camp.status === 'completed' || camp.status === 'cancelled'
      ? 'closed'
      : camp.status,
    startIso: camp.startIso,
    endIso: camp.endIso,
    feeDollars: dollarsFromCents(camp.feeCents),
    capacity: String(camp.capacity),
    ageGroup: camp.ageGroup,
    description: camp.description,
    cover: camp.cover,
  };
}

export function CampFormScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id?: string } }, 'params'>>();
  const editingId = route.params?.id;
  const toast = useToast();
  const [form, setForm] = useState<FormState>(() => buildInitial(editingId));
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const errors = {
    name: form.name.trim().length < 3 ? 'At least 3 characters' : undefined,
    city: !form.city.trim() ? 'Required' : undefined,
    startIso: !/^\d{4}-\d{2}-\d{2}$/.test(form.startIso)
      ? 'Use YYYY-MM-DD'
      : undefined,
    endIso: !/^\d{4}-\d{2}-\d{2}$/.test(form.endIso)
      ? 'Use YYYY-MM-DD'
      : form.endIso < form.startIso
      ? 'Must be on or after start'
      : undefined,
    capacity:
      !form.capacity || Number.isNaN(Number(form.capacity)) || Number(form.capacity) < 1
        ? '1 or more'
        : undefined,
    feeDollars: form.feeDollars && Number.isNaN(Number(form.feeDollars))
      ? 'Numbers only'
      : undefined,
    ageGroup: !form.ageGroup.trim() ? 'Required' : undefined,
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
        title: editingId ? `${form.name} updated` : `${form.name} created`,
        description: editingId
          ? 'Camp details saved.'
          : 'Camp ready — open registration when you are.',
      });
      navigation.goBack();
    }, 600);
  };

  return (
    <PageScroll>
      <PageHeader
        title={editingId ? 'Edit camp' : 'New camp'}
        subtitle={
          editingId
            ? 'Update dates, fees, and capacity. Registered campers see updates immediately.'
            : 'Set up a clinic, intensive, or holiday camp.'
        }
        crumbs={[
          { label: 'Camps', route: 'Camps' },
          { label: editingId ? form.name || 'Edit' : 'New' },
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
              label={submitting ? 'Saving…' : editingId ? 'Save changes' : 'Create camp'}
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
          Basics
        </Text>
        <Input
          label="Camp name"
          value={form.name}
          onChangeText={(v) => update('name', v)}
          error={showError('name')}
          placeholder="Mile High Summer Soccer Camp"
        />
        <View style={styles.row}>
          <Select
            label="Sport"
            value={form.sport}
            options={SPORT_OPTIONS}
            onChange={(v) => update('sport', v as SportKey)}
            width={220}
          />
          <Input
            label="City"
            value={form.city}
            onChangeText={(v) => update('city', v)}
            error={showError('city')}
            placeholder="Denver, CO"
            containerStyle={styles.flex}
          />
          <Input
            label="Age group"
            value={form.ageGroup}
            onChangeText={(v) => update('ageGroup', v)}
            error={showError('ageGroup')}
            placeholder="U10 – U14"
            containerStyle={styles.flex}
          />
        </View>
        <View>
          <Text variant="caption" color={colors.text.secondary} style={styles.label}>
            Status
          </Text>
          <Tabs
            items={STATUS_TABS}
            value={
              form.status === 'completed' || form.status === 'cancelled'
                ? 'closed'
                : form.status
            }
            onChange={(v) => update('status', v as CampStatus)}
            variant="segmented"
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" color={colors.text.primary}>
          Dates &amp; capacity
        </Text>
        <View style={styles.row}>
          <Input
            label="Start (YYYY-MM-DD)"
            value={form.startIso}
            onChangeText={(v) => update('startIso', v)}
            error={showError('startIso')}
            placeholder="2026-06-15"
            containerStyle={styles.flex}
          />
          <Input
            label="End (YYYY-MM-DD)"
            value={form.endIso}
            onChangeText={(v) => update('endIso', v)}
            error={showError('endIso')}
            placeholder="2026-06-19"
            containerStyle={styles.flex}
          />
          <Input
            label="Capacity"
            variant="number"
            value={form.capacity}
            onChangeText={(v) => update('capacity', v)}
            error={showError('capacity')}
            placeholder="32"
            containerStyle={styles.flex}
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" color={colors.text.primary}>
          Fee &amp; copy
        </Text>
        <Input
          label="Fee per camper (USD)"
          variant="number"
          value={form.feeDollars}
          onChangeText={(v) => update('feeDollars', v)}
          error={showError('feeDollars')}
          placeholder="285"
        />
        <Input
          label="Description"
          variant="multiline"
          value={form.description}
          onChangeText={(v) => update('description', v)}
          placeholder="What campers learn, who coaches, what to bring."
        />
        <Input
          label="Cover URL"
          value={form.cover}
          onChangeText={(v) => update('cover', v)}
          helpText="Image upload arrives with backend wiring."
        />
      </Card>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  flex: { flex: 1, minWidth: 180 },
  label: { marginBottom: spacing.xs },
});
