import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { type WebPressableState } from '../../lib/pressable';
import { PageHeader, PageScroll, type AdminRouteName } from '../../admin';
import { Button, Card, Input, Tag, Text, useToast } from '../../ui';
import { colors, radii, spacing } from '../../theme';
import { facilityById } from '../../mocks/facilities';
import { SPORT_OPTIONS, type SportKey } from '../../mocks/leagues';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

interface FormState {
  name: string;
  city: string;
  address: string;
  sports: SportKey[];
  amenities: string[];
  hoursLabel: string;
  isActive: boolean;
  cover: string;
}

const COMMON_AMENITIES = [
  'Lights',
  'Showers',
  'Lockers',
  'Bathrooms',
  'Parking',
  'Free parking',
  'Scoreboard',
  'Pro shop',
  'Ball machine',
  'Locker rooms',
  'Skate sharpening',
  'Restrooms',
];

function buildInitial(id?: string): FormState {
  if (!id) {
    return {
      name: '',
      city: '',
      address: '',
      sports: [],
      amenities: [],
      hoursLabel: 'Open today · 6:00 AM – 10:00 PM',
      isActive: true,
      cover: '',
    };
  }
  const facility = facilityById(id);
  if (!facility) return buildInitial(undefined);
  return {
    name: facility.name,
    city: facility.city,
    address: facility.address,
    sports: facility.sports,
    amenities: facility.amenities,
    hoursLabel: facility.hoursLabel,
    isActive: facility.isActive,
    cover: facility.cover,
  };
}

export function FacilityFormScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id?: string } }, 'params'>>();
  const editingId = route.params?.id;
  const toast = useToast();
  const [form, setForm] = useState<FormState>(() => buildInitial(editingId));
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customAmenity, setCustomAmenity] = useState('');

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const toggleSport = (sport: SportKey) =>
    setForm((p) => ({
      ...p,
      sports: p.sports.includes(sport)
        ? p.sports.filter((s) => s !== sport)
        : [...p.sports, sport],
    }));

  const toggleAmenity = (amenity: string) =>
    setForm((p) => ({
      ...p,
      amenities: p.amenities.includes(amenity)
        ? p.amenities.filter((a) => a !== amenity)
        : [...p.amenities, amenity],
    }));

  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (!trimmed || form.amenities.includes(trimmed)) return;
    setForm((p) => ({ ...p, amenities: [...p.amenities, trimmed] }));
    setCustomAmenity('');
  };

  const errors = {
    name: form.name.trim().length < 3 ? 'At least 3 characters' : undefined,
    city: !form.city.trim() ? 'Required' : undefined,
    address: !form.address.trim() ? 'Required' : undefined,
    sports: form.sports.length === 0 ? 'Pick at least one sport' : undefined,
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
          ? 'Facility details saved.'
          : 'Add bookable spaces from the facility detail page next.',
      });
      navigation.goBack();
    }, 600);
  };

  return (
    <PageScroll>
      <PageHeader
        title={editingId ? 'Edit facility' : 'New facility'}
        subtitle={
          editingId
            ? 'Update venue contact info, sports, or amenities.'
            : 'Add a venue to your roster. Bookable spaces are configured from the detail page after save.'
        }
        crumbs={[
          { label: 'Facilities', route: 'Facilities' },
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
              label={submitting ? 'Saving…' : editingId ? 'Save changes' : 'Create facility'}
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
          label="Facility name"
          value={form.name}
          onChangeText={(v) => update('name', v)}
          error={showError('name')}
          placeholder="Yeti Center"
        />
        <View style={styles.row}>
          <Input
            label="City"
            value={form.city}
            onChangeText={(v) => update('city', v)}
            error={showError('city')}
            placeholder="Denver, CO"
            containerStyle={styles.flex}
          />
          <Input
            label="Address"
            value={form.address}
            onChangeText={(v) => update('address', v)}
            error={showError('address')}
            placeholder="1840 Mile High Loop, Denver, CO"
            containerStyle={styles.flex2}
          />
        </View>
        <Input
          label="Hours label"
          value={form.hoursLabel}
          onChangeText={(v) => update('hoursLabel', v)}
          helpText="Free-text hours surfaced on the facility detail page"
        />
        <View style={styles.toggleRow}>
          <View style={styles.toggleBody}>
            <Text variant="bodySm" color={colors.text.primary} weight="600">
              Active
            </Text>
            <Text variant="caption" color={colors.text.muted}>
              Inactive facilities are hidden from public booking but stay in admin.
            </Text>
          </View>
          <Switch
            value={form.isActive}
            onValueChange={(v) => update('isActive', v)}
            trackColor={{ false: colors.surface.chip, true: colors.brand.primary }}
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <View style={styles.sectionHead}>
          <Text variant="h3" color={colors.text.primary}>
            Sports
          </Text>
          {showError('sports') ? (
            <Text variant="caption" color={colors.status.error}>
              {showError('sports')}
            </Text>
          ) : null}
        </View>
        <View style={styles.chipRow}>
          {SPORT_OPTIONS.map((s) => {
            const selected = form.sports.includes(s.value);
            return (
              <Pressable
                key={s.value}
                onPress={() => toggleSport(s.value)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={s.label}
                style={({ hovered }: WebPressableState) => [
                  styles.chip,
                  selected ? styles.chipSelected : null,
                  hovered ? styles.chipHover : null,
                ]}
              >
                <Text
                  variant="bodySm"
                  color={selected ? colors.text.inverse : colors.text.primary}
                >
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" color={colors.text.primary}>
          Amenities
        </Text>
        <View style={styles.amenityGrid}>
          {COMMON_AMENITIES.map((a) => {
            const selected = form.amenities.includes(a);
            return (
              <Pressable
                key={a}
                onPress={() => toggleAmenity(a)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={a}
                style={({ hovered }: WebPressableState) => [
                  styles.chip,
                  selected ? styles.chipSelected : null,
                  hovered ? styles.chipHover : null,
                ]}
              >
                <Text
                  variant="bodySm"
                  color={selected ? colors.text.inverse : colors.text.primary}
                >
                  {a}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {form.amenities.filter((a) => !COMMON_AMENITIES.includes(a)).length >
        0 ? (
          <View style={styles.customRow}>
            <Text variant="caption" color={colors.text.muted}>
              CUSTOM
            </Text>
            <View style={styles.chipRow}>
              {form.amenities
                .filter((a) => !COMMON_AMENITIES.includes(a))
                .map((a) => (
                  <Tag
                    key={a}
                    tone="brand"
                    size="sm"
                    label={a}
                  />
                ))}
            </View>
          </View>
        ) : null}
        <View style={styles.row}>
          <Input
            label="Add custom amenity"
            value={customAmenity}
            onChangeText={setCustomAmenity}
            placeholder="EV charging"
            containerStyle={styles.flex2}
          />
          <View style={styles.addBtnWrap}>
            <Button
              label="Add"
              variant="ghost"
              size="sm"
              onPress={addCustomAmenity}
              disabled={!customAmenity.trim()}
            />
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" color={colors.text.primary}>
          Cover image
        </Text>
        <Input
          label="Cover URL"
          value={form.cover}
          onChangeText={(v) => update('cover', v)}
          helpText="Square or 16:9 preferred. Image upload comes after backend wiring."
          placeholder="https://images.unsplash.com/…"
        />
      </Card>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  row: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap', alignItems: 'flex-end' },
  flex: { flex: 1, minWidth: 200 },
  flex2: { flex: 2, minWidth: 280 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border.soft,
    backgroundColor: colors.surface.card,
    minHeight: 32,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  chipHover: { backgroundColor: colors.brand.soft },
  customRow: { gap: spacing.xs },
  addBtnWrap: { paddingBottom: 4 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  toggleBody: { flex: 1, gap: 2 },
});
