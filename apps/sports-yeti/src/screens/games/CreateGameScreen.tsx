import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  Building2,
  Check,
  ChevronLeft,
  CircleDollarSign,
  MapPin,
  Sparkles,
  Tag as TagIcon,
  Users,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Button,
  Card,
  DateTimeField,
  Input,
  ProgressBar,
  ScreenHeader,
  SearchBar,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import {
  PAYMENT_STATUS_LABEL,
  SKILL_LABELS,
  SPORT_FILTERS,
  sportLabel,
  type GamePaymentStatus,
  type GameSkillLevel,
  type SportKey,
} from '../../mocks/games';
import { FACILITIES, type Facility } from '../../mocks/facilities';
import { formatCurrency } from '../../lib/format';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateGame'>;

const STEP_COUNT = 3;
type Step = 1 | 2 | 3;

type FacilityKind = 'registered' | 'custom';
type FeeSplitMode = 'auto' | 'manual';

interface CustomFacility {
  name: string;
  address: string;
  entranceFeeCents: number;
}

interface FormState {
  sport: SportKey | null;
  title: string;
  description: string;
  skill: GameSkillLevel;
  startsAt: Date | null;
  durationMinutes: number;
  facilityKind: FacilityKind;
  spaceId: string | null;
  facilitySearch: string;
  customFacility: CustomFacility;
  spots: number;
  feeSplitMode: FeeSplitMode;
  manualFeePerPlayerCents: number;
}

const INITIAL: FormState = {
  sport: null,
  title: '',
  description: '',
  skill: 'all',
  startsAt: null,
  durationMinutes: 90,
  facilityKind: 'registered',
  spaceId: null,
  facilitySearch: '',
  customFacility: { name: '', address: '', entranceFeeCents: 0 },
  spots: 12,
  feeSplitMode: 'auto',
  manualFeePerPlayerCents: 0,
};

interface SpaceWithFacility {
  facility: Facility;
  space: Facility['spaces'][number];
}

function flattenSpaces(facilities: Facility[]): SpaceWithFacility[] {
  return facilities.flatMap((facility) =>
    facility.spaces.map((space) => ({ facility, space })),
  );
}

function findSpaceWithFacility(
  spaceId: string | null,
): SpaceWithFacility | null {
  if (!spaceId) return null;
  for (const facility of FACILITIES) {
    const space = facility.spaces.find((s) => s.id === spaceId);
    if (space) return { facility, space };
  }
  return null;
}

function totalCostCents(form: FormState): number {
  if (form.facilityKind === 'custom') {
    return form.customFacility.entranceFeeCents;
  }
  const match = findSpaceWithFacility(form.spaceId);
  if (!match) return 0;
  return Math.round(match.facility.hourlyRateCents * (form.durationMinutes / 60));
}

function perPlayerCents(form: FormState): number {
  if (form.feeSplitMode === 'manual') return form.manualFeePerPlayerCents;
  if (form.spots <= 0) return 0;
  return Math.ceil(totalCostCents(form) / form.spots);
}

export function CreateGameScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const canAdvance = (() => {
    if (step === 1) return !!form.sport && form.title.trim().length >= 3;
    if (step === 2) {
      if (!form.startsAt) return false;
      if (form.facilityKind === 'registered') return !!form.spaceId;
      return form.customFacility.name.trim().length >= 2;
    }
    return form.spots >= 2;
  })();

  const handleNext = () => {
    if (!canAdvance) return;
    if (step < STEP_COUNT) {
      Haptics.selectionAsync();
      setStep((s) => (s + 1) as Step);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.show({
        variant: 'success',
        title: `${form.title} created`,
        description: 'Players can now find and join your game.',
      });
      navigation.goBack();
    }, 600);
  };

  const handleBack = () => {
    if (step === 1) {
      navigation.goBack();
      return;
    }
    setStep((s) => (s - 1) as Step);
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Host a game"
        hasNotifications={false}
        variant="solid"
      />
      <View style={styles.progressWrap}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          onPress={handleBack}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.progressBar}>
          <ProgressBar
            value={step / STEP_COUNT}
            tone="brand"
            size="sm"
            accessibilityLabel={`Step ${step} of ${STEP_COUNT}`}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="eyebrow" color={colors.brand.primary}>
          STEP {step} OF {STEP_COUNT}
        </Text>
        <Text variant="h1" color={colors.text.primary}>
          {step === 1
            ? "What's the game?"
            : step === 2
            ? 'Where & when?'
            : 'Who and how much?'}
        </Text>
        <Text variant="body" color={colors.text.secondary}>
          {step === 1
            ? 'Pick a sport and give it a title.'
            : step === 2
            ? 'Pick a date — we\u2019ll surface available spaces near you.'
            : 'Set roster size. We\u2019ll auto-split the venue cost between players.'}
        </Text>

        {step === 1 ? <Step1 form={form} setForm={setForm} /> : null}
        {step === 2 ? <Step2 form={form} setForm={setForm} /> : null}
        {step === 3 ? <Step3 form={form} setForm={setForm} /> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label={step === STEP_COUNT ? (submitting ? 'Creating…' : 'Create game') : 'Continue'}
          variant="gradient"
          size="lg"
          fullWidth
          disabled={!canAdvance || submitting}
          onPress={handleNext}
        />
      </View>
    </View>
  );
}

// ---------- Step 1: sport, title, skill ----------

interface StepProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}

function Step1({ form, setForm }: StepProps) {
  return (
    <View style={styles.stepBlock}>
      <Text variant="eyebrow" color={colors.text.secondary}>
        Sport
      </Text>
      <View style={styles.sportGrid}>
        {SPORT_FILTERS.filter((s) => s.key !== 'allSports').map((sport) => {
          const Icon = sport.Icon;
          const selected = form.sport === sport.key;
          return (
            <Pressable
              key={sport.key}
              accessibilityRole="button"
              accessibilityLabel={sport.label}
              accessibilityState={{ selected }}
              onPress={() => setForm((f) => ({ ...f, sport: sport.key }))}
              style={({ pressed }) => [
                styles.sportChip,
                selected ? styles.sportChipSelected : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <Icon
                size={22}
                color={selected ? colors.text.inverse : colors.brand.primary}
                strokeWidth={2.25}
              />
              <Text
                variant="button"
                color={selected ? colors.text.inverse : colors.text.primary}
              >
                {sport.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Input
        label="Title"
        placeholder="Friday night scrimmage"
        value={form.title}
        onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
        maxLength={60}
        helpText="Players see this in their feed."
      />

      <Input
        label="What to expect"
        placeholder="Light vs dark shirts, 12-min subs, no slide tackles…"
        value={form.description}
        onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
        variant="multiline"
        maxLength={400}
      />

      <View>
        <Text
          variant="eyebrow"
          color={colors.text.secondary}
          style={styles.label}
        >
          Skill level
        </Text>
        <Tabs
          variant="segmented"
          items={(Object.keys(SKILL_LABELS) as GameSkillLevel[]).map((k) => ({
            key: k,
            label: SKILL_LABELS[k],
          }))}
          value={form.skill}
          onChange={(k) =>
            setForm((f) => ({ ...f, skill: k as GameSkillLevel }))
          }
        />
      </View>
    </View>
  );
}

// ---------- Step 2: when + venue ----------

function Step2({ form, setForm }: StepProps) {
  const recommended = useMemo<SpaceWithFacility[]>(() => {
    const allSpaces = flattenSpaces(FACILITIES);
    const filtered = allSpaces.filter(({ facility }) => {
      // Sport match if a sport is chosen and facility supports it; otherwise show all.
      if (form.sport && form.sport !== 'allSports') {
        const sportKey = form.sport as string;
        if (!facility.sports.some((s) => s === sportKey)) return false;
      }
      const q = form.facilitySearch.trim().toLowerCase();
      if (!q) return true;
      return (
        facility.name.toLowerCase().includes(q) ||
        facility.city.toLowerCase().includes(q)
      );
    });
    return filtered.sort(
      (a, b) => a.facility.distanceMiles - b.facility.distanceMiles,
    );
  }, [form.sport, form.facilitySearch]);

  const setCustom = (patch: Partial<CustomFacility>) =>
    setForm((f) => ({
      ...f,
      customFacility: { ...f.customFacility, ...patch },
    }));

  const minimumDate = useMemo(() => new Date(), []);

  return (
    <View style={styles.stepBlock}>
      <View>
        <Text
          variant="eyebrow"
          color={colors.text.secondary}
          style={styles.label}
        >
          When
        </Text>
        <View style={styles.row}>
          <DateTimeField
            label="Date"
            mode="date"
            value={form.startsAt}
            minimumDate={minimumDate}
            onChange={(date) =>
              setForm((f) => {
                const next = new Date(date);
                if (f.startsAt) {
                  next.setHours(
                    f.startsAt.getHours(),
                    f.startsAt.getMinutes(),
                    0,
                    0,
                  );
                }
                return { ...f, startsAt: next };
              })
            }
            placeholder="Pick a date"
            containerStyle={styles.flex1}
          />
          <DateTimeField
            label="Time"
            mode="time"
            value={form.startsAt}
            onChange={(date) =>
              setForm((f) => {
                const base = f.startsAt ?? new Date();
                const next = new Date(base);
                next.setHours(date.getHours(), date.getMinutes(), 0, 0);
                return { ...f, startsAt: next };
              })
            }
            placeholder="Pick a time"
            containerStyle={styles.flex1}
          />
        </View>

        <Input
          label="Duration (minutes)"
          value={String(form.durationMinutes)}
          variant="number"
          containerStyle={styles.durationField}
          onChangeText={(v) => {
            const n = Number(v.replace(/[^0-9]/g, ''));
            setForm((f) => ({
              ...f,
              durationMinutes: Number.isFinite(n) ? Math.min(360, n) : 0,
            }));
          }}
        />
      </View>

      <View style={styles.kindToggle}>
        <Tabs
          variant="segmented"
          items={[
            { key: 'registered', label: 'Recommended spaces' },
            { key: 'custom', label: 'Custom location' },
          ]}
          value={form.facilityKind}
          onChange={(k) =>
            setForm((f) => ({
              ...f,
              facilityKind: k as FacilityKind,
              spaceId: k === 'registered' ? f.spaceId : null,
            }))
          }
        />
      </View>

      {form.facilityKind === 'registered' ? (
        <RegisteredVenuePicker
          form={form}
          setForm={setForm}
          spaces={recommended}
        />
      ) : (
        <CustomVenueForm form={form} setCustom={setCustom} />
      )}
    </View>
  );
}

interface RegisteredVenuePickerProps extends StepProps {
  spaces: SpaceWithFacility[];
}

function RegisteredVenuePicker({
  form,
  setForm,
  spaces,
}: RegisteredVenuePickerProps) {
  const dateLabel = form.startsAt
    ? form.startsAt.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <View style={styles.venueBlock}>
      <SearchBar
        value={form.facilitySearch}
        onChangeText={(v) => setForm((f) => ({ ...f, facilitySearch: v }))}
        placeholder="Search facilities by name or city…"
      />

      <View style={styles.recHeader}>
        <Text variant="eyebrow" color={colors.text.secondary}>
          Available near you
          {dateLabel ? ` · ${dateLabel}` : ''}
        </Text>
        <Text variant="caption" color={colors.text.muted}>
          {spaces.length} space{spaces.length === 1 ? '' : 's'}
        </Text>
      </View>

      {spaces.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text variant="body" color={colors.text.secondary} align="center">
            No matching spaces. Try clearing your search or switch to a custom
            location.
          </Text>
        </Card>
      ) : (
        <View style={styles.spaceList}>
          {spaces.map(({ facility, space }) => {
            const selected = form.spaceId === space.id;
            const hourly = facility.hourlyRateCents;
            const blockCost = Math.round(
              hourly * (form.durationMinutes / 60),
            );
            return (
              <Pressable
                key={space.id}
                accessibilityRole="button"
                accessibilityLabel={`${facility.name} · ${space.name}`}
                accessibilityState={{ selected }}
                onPress={() => setForm((f) => ({ ...f, spaceId: space.id }))}
                style={({ pressed }) => [
                  styles.spaceCard,
                  selected ? styles.spaceCardSelected : null,
                  pressed ? styles.pressed : null,
                ]}
              >
                <View style={styles.spaceIcon}>
                  <MapPin
                    size={18}
                    color={
                      selected ? colors.brand.deep : colors.brand.primary
                    }
                    strokeWidth={2.25}
                  />
                </View>
                <View style={styles.spaceBody}>
                  <Text variant="button" color={colors.text.primary}>
                    {space.name}
                  </Text>
                  <Text variant="bodySm" color={colors.text.secondary}>
                    {facility.name} · {facility.city} · {facility.distanceMiles}{' '}
                    mi
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    {space.surface} · up to {space.capacity} players
                  </Text>
                </View>
                <View style={styles.spacePrice}>
                  <Text variant="button" color={colors.brand.primary}>
                    {hourly === 0 ? 'Free' : `${formatCurrency(hourly)}/hr`}
                  </Text>
                  {hourly > 0 ? (
                    <Text variant="caption" color={colors.text.muted}>
                      ≈ {formatCurrency(blockCost)} total
                    </Text>
                  ) : null}
                </View>
                {selected ? (
                  <View style={styles.spaceCheck}>
                    <Check
                      size={18}
                      color={colors.brand.primary}
                      strokeWidth={2.5}
                    />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

interface CustomVenueFormProps {
  form: FormState;
  setCustom: (patch: Partial<CustomFacility>) => void;
}

function CustomVenueForm({ form, setCustom }: CustomVenueFormProps) {
  const dollars =
    form.customFacility.entranceFeeCents === 0
      ? ''
      : (form.customFacility.entranceFeeCents / 100).toFixed(2);

  return (
    <View style={styles.venueBlock}>
      <Card style={styles.customHint}>
        <Building2
          size={18}
          color={colors.brand.primary}
          strokeWidth={2.25}
        />
        <Text variant="bodySm" color={colors.text.secondary}>
          Hosting somewhere not on SportsYeti? Add the venue and an entrance
          fee — we’ll split it across players.
        </Text>
      </Card>

      <Input
        label="Facility name"
        placeholder="e.g. Riverside Park · East field"
        value={form.customFacility.name}
        onChangeText={(v) => setCustom({ name: v })}
        maxLength={80}
      />
      <Input
        label="Address or details"
        placeholder="2200 N Riverside Dr · meet at the picnic shelter"
        value={form.customFacility.address}
        onChangeText={(v) => setCustom({ address: v })}
        variant="multiline"
        maxLength={200}
      />
      <Input
        label="Total entrance fee (USD)"
        placeholder="0.00"
        value={dollars}
        variant="number"
        leadingIcon={
          <CircleDollarSign
            size={18}
            color={colors.brand.primary}
            strokeWidth={2.25}
          />
        }
        helpText="Split equally between players in the next step."
        onChangeText={(v) => {
          const cleaned = v.replace(/[^0-9.]/g, '');
          const cents = Math.round((Number(cleaned) || 0) * 100);
          setCustom({ entranceFeeCents: cents });
        }}
      />
    </View>
  );
}

// ---------- Step 3: roster size + fee split ----------

function Step3({ form, setForm }: StepProps) {
  const total = totalCostCents(form);
  const perPlayer = perPlayerCents(form);
  const venue =
    form.facilityKind === 'custom'
      ? {
          name: form.customFacility.name || 'Custom location',
          subtitle: form.customFacility.address || '—',
          breakdown: [
            { label: 'Entrance fee', value: total },
          ],
        }
      : (() => {
          const match = findSpaceWithFacility(form.spaceId);
          if (!match) {
            return {
              name: 'No space selected',
              subtitle: 'Go back to step 2',
              breakdown: [] as { label: string; value: number }[],
            };
          }
          return {
            name: `${match.facility.name} · ${match.space.name}`,
            subtitle: `${match.facility.city} · ${form.durationMinutes} min`,
            breakdown: [
              {
                label: `Rental (${(form.durationMinutes / 60).toFixed(1)}h × ${formatCurrency(match.facility.hourlyRateCents)}/hr)`,
                value: total,
              },
            ],
          };
        })();

  const dollarsManual =
    form.manualFeePerPlayerCents === 0
      ? ''
      : (form.manualFeePerPlayerCents / 100).toFixed(2);

  return (
    <View style={styles.stepBlock}>
      <Input
        label="Player spots"
        value={String(form.spots)}
        variant="number"
        leadingIcon={
          <Users
            size={18}
            color={colors.brand.primary}
            strokeWidth={2.25}
          />
        }
        helpText="Including yourself."
        onChangeText={(v) => {
          const n = Number(v.replace(/[^0-9]/g, ''));
          setForm((f) => ({
            ...f,
            spots: Number.isFinite(n) ? Math.min(40, n) : 0,
          }));
        }}
      />

      <View>
        <Text
          variant="eyebrow"
          color={colors.text.secondary}
          style={styles.label}
        >
          Fee split
        </Text>
        <Tabs
          variant="segmented"
          items={[
            { key: 'auto', label: 'Auto-split' },
            { key: 'manual', label: 'Set per-player' },
          ]}
          value={form.feeSplitMode}
          onChange={(k) =>
            setForm((f) => ({ ...f, feeSplitMode: k as FeeSplitMode }))
          }
        />
      </View>

      {form.feeSplitMode === 'manual' ? (
        <Input
          label="Per-player fee (USD)"
          placeholder="0.00"
          value={dollarsManual}
          variant="number"
          leadingIcon={
            <CircleDollarSign
              size={18}
              color={colors.brand.primary}
              strokeWidth={2.25}
            />
          }
          onChangeText={(v) => {
            const cleaned = v.replace(/[^0-9.]/g, '');
            const cents = Math.round((Number(cleaned) || 0) * 100);
            setForm((f) => ({ ...f, manualFeePerPlayerCents: cents }));
          }}
        />
      ) : null}

      <Card style={styles.feeCard}>
        <View style={styles.feeHead}>
          <View style={styles.feeIcon}>
            <CircleDollarSign
              size={18}
              color={colors.brand.primary}
              strokeWidth={2.25}
            />
          </View>
          <Text variant="h3" color={colors.text.primary}>
            Cost breakdown
          </Text>
        </View>

        {venue.breakdown.length === 0 ? (
          <Text variant="bodySm" color={colors.text.secondary}>
            Pick a space in step 2 to see the auto-split.
          </Text>
        ) : (
          venue.breakdown.map((row) => (
            <View key={row.label} style={styles.feeRow}>
              <Text variant="bodySm" color={colors.text.secondary}>
                {row.label}
              </Text>
              <Text variant="bodySm" color={colors.text.primary}>
                {row.value === 0 ? 'Free' : formatCurrency(row.value)}
              </Text>
            </View>
          ))
        )}

        <View style={styles.feeDivider} />

        <View style={styles.feeRow}>
          <Text variant="button" color={colors.text.primary}>
            Total
          </Text>
          <Text variant="button" color={colors.text.primary}>
            {total === 0 ? 'Free' : formatCurrency(total)}
          </Text>
        </View>
        <View style={styles.feeRow}>
          <Text variant="button" color={colors.text.primary}>
            Per player ({form.spots})
          </Text>
          <Text variant="h3" color={colors.brand.primary}>
            {perPlayer === 0 ? 'Free' : formatCurrency(perPlayer)}
          </Text>
        </View>
      </Card>

      <Card style={styles.legendCard}>
        <Text variant="eyebrow" color={colors.text.secondary}>
          Player commitment
        </Text>
        <Text variant="bodySm" color={colors.text.secondary}>
          As players join, they’ll appear in your roster with one of these
          status badges:
        </Text>
        <View style={styles.legendRow}>
          {(['paid', 'committed', 'pending'] as GamePaymentStatus[]).map(
            (status) => (
              <Tag
                key={status}
                size="sm"
                leadingDot
                tone={
                  status === 'paid'
                    ? 'success'
                    : status === 'committed'
                    ? 'brand'
                    : 'warning'
                }
                label={PAYMENT_STATUS_LABEL[status]}
              />
            ),
          )}
        </View>
      </Card>

      <Card style={styles.summaryCard}>
        <View style={styles.summaryHead}>
          <View style={styles.summaryIcon}>
            <Sparkles size={18} color={colors.brand.primary} strokeWidth={2.25} />
          </View>
          <Text variant="h3" color={colors.text.primary}>
            Summary
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <TagIcon size={14} color={colors.text.secondary} strokeWidth={2.25} />
          <Text variant="bodySm" color={colors.text.secondary}>
            {form.title || 'Untitled'} ·{' '}
            {form.sport ? sportLabel(form.sport) : '—'} ·{' '}
            {SKILL_LABELS[form.skill]}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <MapPin size={14} color={colors.text.secondary} strokeWidth={2.25} />
          <Text variant="bodySm" color={colors.text.secondary}>
            {venue.name} · {venue.subtitle}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Users size={14} color={colors.text.secondary} strokeWidth={2.25} />
          <Text variant="bodySm" color={colors.text.secondary}>
            {form.spots} spots ·{' '}
            {perPlayer === 0
              ? 'Free per player'
              : `${formatCurrency(perPlayer)}/player`}
          </Text>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface.card,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  stepBlock: {
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  label: {
    marginBottom: spacing.sm,
  },
  sportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.soft,
    minHeight: 44,
  },
  sportChipSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  pressed: {
    opacity: 0.75,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  durationField: {
    marginTop: spacing.md,
  },
  kindToggle: {
    marginTop: spacing.sm,
  },
  venueBlock: {
    gap: spacing.md,
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyCard: {
    padding: spacing.lg,
  },
  spaceList: {
    gap: spacing.sm,
  },
  spaceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.soft,
    ...shadows.soft,
  },
  spaceCardSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.soft,
  },
  spaceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceBody: {
    flex: 1,
    gap: 2,
  },
  spacePrice: {
    alignItems: 'flex-end',
    gap: 2,
  },
  spaceCheck: {
    width: 24,
    alignItems: 'center',
  },
  customHint: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    padding: spacing.md,
  },
  feeCard: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  feeHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  feeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  feeDivider: {
    height: 1,
    backgroundColor: colors.border.soft,
    marginVertical: spacing.xs,
  },
  legendCard: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  summaryCard: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  summaryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    backgroundColor: colors.surface.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
});
