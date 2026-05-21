import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  Building2,
  CalendarClock,
  Check,
  ChevronLeft,
  CircleDollarSign,
  HandCoins,
  Lock,
  MapPin,
  Sparkles,
  Tag as TagIcon,
  Users,
  Wallet,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Button,
  Card,
  DateTimeField,
  Input,
  ProgressBar,
  type RadiusCenter,
  RadiusMapPicker,
  ScreenHeader,
  SearchBar,
  SportCombobox,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import {
  PAYMENT_STATUS_LABEL,
  SKILL_LABELS,
  sportCatalogEntry,
  type GamePaymentStatus,
  type GameSkillLevel,
} from '../../mocks/games';
import {
  DEFAULT_MAP_CENTER,
  distanceMilesBetween,
  FACILITIES,
  type Facility,
  type GeoPoint,
} from '../../mocks/facilities';
import { formatCurrency } from '../../lib/format';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateGame'>;

const STEP_COUNT = 3;
type Step = 1 | 2 | 3;

type FacilityKind = 'registered' | 'custom';
type FeeSplitMode = 'auto' | 'manual';
type BookingMode = 'split' | 'host-prepay';
type CustomCostType = 'free' | 'paid';

interface CustomFacility {
  name: string;
  address: string;
  /** Whether the venue charges a fee. `free` zeroes out `entranceFeeCents`. */
  costType: CustomCostType;
  entranceFeeCents: number;
}

interface FormState {
  /** Catalog key (e.g. `soccer`, `futsal`, `pickleball`). */
  sport: string | null;
  title: string;
  description: string;
  skill: GameSkillLevel;
  startsAt: Date | null;
  durationMinutes: number;
  facilityKind: FacilityKind;
  spaceId: string | null;
  facilitySearch: string;
  searchCenter: RadiusCenter | null;
  searchRadiusMiles: number;
  customFacility: CustomFacility;
  spots: number;
  feeSplitMode: FeeSplitMode;
  manualFeePerPlayerCents: number;
  /** How the venue gets paid for. */
  bookingMode: BookingMode;
}

const DEFAULT_RADIUS_MILES = 25;

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
  searchCenter: null,
  searchRadiusMiles: DEFAULT_RADIUS_MILES,
  customFacility: {
    name: '',
    address: '',
    costType: 'free',
    entranceFeeCents: 0,
  },
  spots: 12,
  feeSplitMode: 'auto',
  manualFeePerPlayerCents: 0,
  bookingMode: 'split',
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
    return form.customFacility.costType === 'free'
      ? 0
      : form.customFacility.entranceFeeCents;
  }
  const match = findSpaceWithFacility(form.spaceId);
  if (!match) return 0;
  return Math.round(match.facility.hourlyRateCents * (form.durationMinutes / 60));
}

function perPlayerCents(form: FormState): number {
  const total = totalCostCents(form);
  // Custom (non-registered) venues: SportsYeti doesn't process the
  // payment. The host sets a per-player fee they collect in person.
  if (form.facilityKind === 'custom') {
    return form.manualFeePerPlayerCents;
  }
  // Registered + host-prepay: the host pays the venue upfront via the
  // platform, then collects from each player in person at whatever rate
  // they set. No platform charge to players.
  if (form.bookingMode === 'host-prepay') {
    return form.manualFeePerPlayerCents;
  }
  // Registered + split: platform-processed per-player payment.
  if (form.feeSplitMode === 'manual') return form.manualFeePerPlayerCents;
  if (form.spots <= 0) return 0;
  return Math.ceil(total / form.spots);
}

/** A reasonable default per-player suggestion for in-person collection. */
function suggestedPerPlayerCents(form: FormState): number {
  const total = totalCostCents(form);
  if (form.spots <= 0 || total <= 0) return 0;
  return Math.ceil(total / form.spots);
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
      const total = totalCostCents(form);
      const perHead = perPlayerCents(form);
      const isCustom = form.facilityKind === 'custom';
      let description = 'Players can now find and join your game.';
      if (!isCustom && form.bookingMode === 'host-prepay' && total > 0) {
        description = `Charged ${formatCurrency(total)} — venue locked. Collect ${formatCurrency(perHead)}/player in person.`;
      } else if (isCustom && total > 0) {
        description = `Heads up: collect ${formatCurrency(perHead)}/player in person.`;
      }
      toast.show({
        variant: 'success',
        title: `${form.title} created`,
        description,
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
            ? 'Pin a search area and pick an available space inside it.'
            : 'Set roster size and decide how the venue gets paid for.'}
        </Text>

        {step === 1 ? <Step1 form={form} setForm={setForm} /> : null}
        {step === 2 ? <Step2 form={form} setForm={setForm} /> : null}
        {step === 3 ? <Step3 form={form} setForm={setForm} /> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label={
            step === STEP_COUNT
              ? submitting
                ? 'Creating…'
                : totalCostCents(form) > 0 &&
                  form.facilityKind === 'registered' &&
                  form.bookingMode === 'host-prepay'
                ? `Pay ${formatCurrency(totalCostCents(form))} & create`
                : 'Create game'
              : 'Continue'
          }
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
  // SportCombobox stores selections as a Set<string>. We bridge to the
  // single-select `form.sport` here.
  const sportSet = useMemo(
    () => new Set(form.sport ? [form.sport] : []),
    [form.sport],
  );

  return (
    <View style={styles.stepBlock}>
      <Text variant="eyebrow" color={colors.text.secondary}>
        Sport
      </Text>
      <SportCombobox
        mode="single"
        value={sportSet}
        onChange={(next) => {
          const [first] = next;
          setForm((f) => ({ ...f, sport: first ?? null }));
        }}
        placeholder="Search sports (e.g. soccer, pickleball)…"
        scrollResults={false}
        maxVisibleResults={6}
      />

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
  const sportEntry = form.sport ? sportCatalogEntry(form.sport) : null;
  const sportBucket = sportEntry?.bucket ?? null;

  const center: GeoPoint = form.searchCenter ?? DEFAULT_MAP_CENTER;

  const recommended = useMemo<SpaceWithFacility[]>(() => {
    const allSpaces = flattenSpaces(FACILITIES);
    const filtered = allSpaces.filter(({ facility }) => {
      // Sport match if a sport-bucket is chosen and facility supports it.
      if (sportBucket) {
        if (!facility.sports.some((s) => (s as string) === sportBucket))
          return false;
      }
      // Distance from chosen search centre.
      const d = distanceMilesBetween(center, facility.coords);
      if (d > form.searchRadiusMiles) return false;

      const q = form.facilitySearch.trim().toLowerCase();
      if (!q) return true;
      return (
        facility.name.toLowerCase().includes(q) ||
        facility.city.toLowerCase().includes(q)
      );
    });
    // Sort by actual haversine distance from the chosen centre.
    return filtered
      .map((entry) => ({
        ...entry,
        d: distanceMilesBetween(center, entry.facility.coords),
      }))
      .sort((a, b) => a.d - b.d)
      .map(({ facility, space }) => ({ facility, space }));
  }, [
    sportBucket,
    form.facilitySearch,
    center,
    form.searchRadiusMiles,
  ]);

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
  const center: GeoPoint = form.searchCenter ?? DEFAULT_MAP_CENTER;

  return (
    <View style={styles.venueBlock}>
      <Text variant="eyebrow" color={colors.text.secondary}>
        Search area
      </Text>
      <RadiusMapPicker
        center={form.searchCenter}
        onChangeCenter={(c) => setForm((f) => ({ ...f, searchCenter: c }))}
        radiusMiles={form.searchRadiusMiles}
        onChangeRadius={(r) => setForm((f) => ({ ...f, searchRadiusMiles: r }))}
        // A facility with N spaces would otherwise produce N marker rows
        // with the same `facility.id` — drop a single pin per facility.
        markers={Array.from(
          new Map(
            spaces.map(({ facility }) => [
              facility.id,
              {
                id: facility.id,
                coords: facility.coords,
                label: facility.name,
              },
            ]),
          ).values(),
        )}
        mapHeight={200}
      />

      <SearchBar
        value={form.facilitySearch}
        onChangeText={(v) => setForm((f) => ({ ...f, facilitySearch: v }))}
        placeholder="Filter facilities by name or city…"
      />

      <View style={styles.recHeader}>
        <Text variant="eyebrow" color={colors.text.secondary}>
          Available within {form.searchRadiusMiles} mi
          {dateLabel ? ` · ${dateLabel}` : ''}
        </Text>
        <Text variant="caption" color={colors.text.muted}>
          {spaces.length} space{spaces.length === 1 ? '' : 's'}
        </Text>
      </View>

      {spaces.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text variant="body" color={colors.text.secondary} align="center">
            No matching spaces inside this radius. Widen the radius, drop a
            new pin, or switch to a custom location.
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
            const distance = distanceMilesBetween(center, facility.coords);
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
                    {facility.name} · {facility.city} · {distance.toFixed(1)}{' '}
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
  return (
    <View style={styles.venueBlock}>
      <Card style={styles.customHint}>
        <Building2
          size={18}
          color={colors.brand.primary}
          strokeWidth={2.25}
        />
        <Text variant="bodySm" color={colors.text.secondary}>
          Hosting somewhere not on SportsYeti? Add the venue here — you’ll
          set the cost (or mark it free) in the next step.
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
    </View>
  );
}

// ---------- Money input ----------

interface MoneyInputProps {
  label: string;
  helpText?: string;
  placeholder?: string;
  valueCents: number;
  onChangeCents: (cents: number) => void;
  containerStyle?: import('react-native').StyleProp<import('react-native').ViewStyle>;
}

/**
 * Currency input that keeps the raw user text in local state so partial
 * values (`5`, `5.`, `5.0`) round-trip through backspace correctly. The
 * canonical cents value only updates when the text is parseable, and we
 * reformat to two decimals on blur.
 */
function MoneyInput({
  label,
  helpText,
  placeholder = '0.00',
  valueCents,
  onChangeCents,
  containerStyle,
}: MoneyInputProps) {
  const [text, setText] = useState(() =>
    valueCents === 0 ? '' : (valueCents / 100).toFixed(2),
  );
  // If the parent resets the cents value (e.g. user toggles Free → Paid),
  // re-derive the text. Otherwise let the user-typed text stand.
  React.useEffect(() => {
    const parsed = Math.round((Number(text.replace(/[^0-9.]/g, '')) || 0) * 100);
    if (parsed !== valueCents) {
      setText(valueCents === 0 ? '' : (valueCents / 100).toFixed(2));
    }
    // Intentionally only key on the canonical value, not `text`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueCents]);

  return (
    <Input
      label={label}
      placeholder={placeholder}
      helpText={helpText}
      value={text}
      variant="number"
      containerStyle={containerStyle}
      leadingIcon={
        <CircleDollarSign
          size={18}
          color={colors.brand.primary}
          strokeWidth={2.25}
        />
      }
      onChangeText={(v) => {
        // Allow only digits and a single dot, max 2 decimal places.
        const cleaned = v
          .replace(/[^0-9.]/g, '')
          .replace(/(\..*?)\./g, '$1')
          .replace(/^(\d*\.\d{0,2}).*$/, '$1');
        setText(cleaned);
        const cents = Math.round((Number(cleaned) || 0) * 100);
        onChangeCents(cents);
      }}
      onBlur={() => {
        // Normalize on blur: empty stays empty; otherwise pin to 2 decimals.
        if (text === '' || text === '.') return;
        const n = Number(text);
        if (Number.isFinite(n)) setText(n.toFixed(2));
      }}
    />
  );
}

// ---------- Step 3: roster size + payment ----------

function Step3({ form, setForm }: StepProps) {
  const total = totalCostCents(form);
  const perPlayer = perPlayerCents(form);
  const isHostPrepay = form.bookingMode === 'host-prepay';
  const isCustomVenue = form.facilityKind === 'custom';
  const isCustomFree =
    isCustomVenue && form.customFacility.costType === 'free';
  // Booking-mode + per-player split only matter when there's a real cost.
  // For free events (custom · free, or registered venues that don't charge)
  // we suppress the toggles and just call out that nothing is owed.
  const hasCost = total > 0;
  const venue =
    isCustomVenue
      ? {
          name: form.customFacility.name || 'Custom location',
          subtitle: form.customFacility.address || '—',
          breakdown: hasCost
            ? [{ label: 'Entrance fee', value: total }]
            : ([] as { label: string; value: number }[]),
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

  const splitContribution = isHostPrepay
    ? total
    : Math.max(0, total - perPlayer * form.spots);

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

      {isCustomVenue ? (
        <View>
          <Text
            variant="eyebrow"
            color={colors.text.secondary}
            style={styles.label}
          >
            Cost for the space
          </Text>
          <Tabs
            variant="segmented"
            items={[
              { key: 'free', label: 'Free event' },
              { key: 'paid', label: 'Paid event' },
            ]}
            value={form.customFacility.costType}
            onChange={(k) =>
              setForm((f) => ({
                ...f,
                customFacility: {
                  ...f.customFacility,
                  costType: k as CustomCostType,
                },
              }))
            }
          />
          {form.customFacility.costType === 'paid' ? (
            <MoneyInput
              containerStyle={styles.customCostInput}
              label="Total cost for the space (USD)"
              helpText="What the venue charges in total. We'll handle the split below."
              valueCents={form.customFacility.entranceFeeCents}
              onChangeCents={(cents) =>
                setForm((f) => ({
                  ...f,
                  customFacility: {
                    ...f.customFacility,
                    entranceFeeCents: cents,
                  },
                }))
              }
            />
          ) : (
            <Text
              variant="caption"
              color={colors.text.muted}
              style={styles.customCostHint}
            >
              Players join for free. We&rsquo;ll skip checkout entirely.
            </Text>
          )}
        </View>
      ) : null}

      {/* Booking-mode toggle only applies to registered venues. */}
      {hasCost && !isCustomVenue ? (
        <View>
          <Text
            variant="eyebrow"
            color={colors.text.secondary}
            style={styles.label}
          >
            How does the venue get paid?
          </Text>
          <Tabs
            variant="segmented"
            items={[
              { key: 'split', label: 'Split with players' },
              { key: 'host-prepay', label: 'Pay now to lock in' },
            ]}
            value={form.bookingMode}
            onChange={(k) =>
              setForm((f) => ({ ...f, bookingMode: k as BookingMode }))
            }
          />
          <BookingModeExplainer mode={form.bookingMode} totalCents={total} />
        </View>
      ) : null}

      {/* Auto/manual per-player toggle only applies to platform-processed
          splits. Host-prepay always collects in person, custom venues
          always collect in person — both skip the toggle. */}
      {hasCost && !isCustomVenue && !isHostPrepay ? (
        <View>
          <Text
            variant="eyebrow"
            color={colors.text.secondary}
            style={styles.label}
          >
            Per-player fee
          </Text>
          <Tabs
            variant="segmented"
            items={[
              { key: 'auto', label: 'Auto-split' },
              { key: 'manual', label: 'Set amount' },
            ]}
            value={form.feeSplitMode}
            onChange={(k) =>
              setForm((f) => ({ ...f, feeSplitMode: k as FeeSplitMode }))
            }
          />
        </View>
      ) : null}

      {/* Manual platform-processed per-player fee. */}
      {hasCost && !isCustomVenue && !isHostPrepay && form.feeSplitMode === 'manual' ? (
        <MoneyInput
          label="Per-player fee (USD)"
          valueCents={form.manualFeePerPlayerCents}
          onChangeCents={(cents) =>
            setForm((f) => ({ ...f, manualFeePerPlayerCents: cents }))
          }
        />
      ) : null}

      {/* Per-player fee for in-person collection — applies to both
          host-prepay (registered) and custom-paid venues. */}
      {hasCost && (isHostPrepay || isCustomVenue) ? (
        <MoneyInput
          label="Per-player fee · collected in person (USD)"
          helpText={
            suggestedPerPlayerCents(form) > 0
              ? `Suggested even split: ${formatCurrency(suggestedPerPlayerCents(form))} × ${form.spots} players.`
              : undefined
          }
          valueCents={form.manualFeePerPlayerCents}
          onChangeCents={(cents) =>
            setForm((f) => ({ ...f, manualFeePerPlayerCents: cents }))
          }
        />
      ) : null}

      {hasCost && (isHostPrepay || isCustomVenue) ? (
        <Card style={styles.inPersonCard}>
          <View style={styles.inPersonHead}>
            <HandCoins
              size={18}
              color={colors.brand.primary}
              strokeWidth={2.25}
            />
            <Text variant="button" color={colors.text.primary}>
              Player payments collected in person
            </Text>
          </View>
          <Text variant="bodySm" color={colors.text.secondary}>
            {isCustomVenue
              ? `SportsYeti doesn't process payment for custom locations. You'll collect ${formatCurrency(form.manualFeePerPlayerCents)} from each player on the day — cash, Venmo, etc.`
              : `You're paying the venue upfront, so SportsYeti doesn't take additional money from players. You'll collect ${formatCurrency(form.manualFeePerPlayerCents)} from each on the day — cash, Venmo, etc.`}
            {' '}The amount shows up in their game details so they know what to bring.
          </Text>
        </Card>
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
            {isCustomFree
              ? 'Free event — no payment required from players.'
              : isCustomVenue
              ? 'Set a cost above to enable splits and host-prepay.'
              : 'Pick a space in step 2 to see the auto-split.'}
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
        {isHostPrepay && total > 0 ? (
          <View style={styles.feeRow}>
            <Text variant="button" color={colors.text.secondary}>
              Charged to you now
            </Text>
            <Text variant="button" color={colors.brand.deep}>
              {formatCurrency(total)}
            </Text>
          </View>
        ) : null}
        {(isCustomVenue || isHostPrepay) && hasCost ? (
          <View style={styles.feeRow}>
            <Text variant="button" color={colors.text.secondary}>
              Collected in person
            </Text>
            <Text variant="button" color={colors.brand.deep}>
              {formatCurrency(perPlayer)} / player
            </Text>
          </View>
        ) : null}
        {!isCustomVenue && !isHostPrepay && total > 0 ? (
          <View style={styles.feeRow}>
            <Text variant="button" color={colors.text.secondary}>
              Booking confirmed when
            </Text>
            <Text variant="button" color={colors.brand.deep}>
              total reaches {formatCurrency(total)}
            </Text>
          </View>
        ) : null}
        {!isCustomVenue && !isHostPrepay && splitContribution > 0 ? (
          <Text variant="caption" color={colors.text.muted}>
            You can prepay any time before the start time to lock the venue
            in early.
          </Text>
        ) : null}
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
            {form.sport ? sportCatalogEntry(form.sport)?.label ?? form.sport : '—'}{' '}
            · {SKILL_LABELS[form.skill]}
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
        <View style={styles.summaryRow}>
          {!hasCost ? (
            <CalendarClock
              size={14}
              color={colors.text.secondary}
              strokeWidth={2.25}
            />
          ) : isCustomVenue || isHostPrepay ? (
            <HandCoins
              size={14}
              color={colors.text.secondary}
              strokeWidth={2.25}
            />
          ) : (
            <CalendarClock
              size={14}
              color={colors.text.secondary}
              strokeWidth={2.25}
            />
          )}
          <Text variant="bodySm" color={colors.text.secondary}>
            {!hasCost
              ? 'Free event · no checkout required'
              : isHostPrepay
              ? `Venue locked · collect ${formatCurrency(perPlayer)}/player in person`
              : isCustomVenue
              ? `In-person collection · ${formatCurrency(perPlayer)}/player`
              : `Split-pay · venue locked when total hits ${formatCurrency(total)}`}
          </Text>
        </View>
      </Card>
    </View>
  );
}

interface BookingModeExplainerProps {
  mode: BookingMode;
  totalCents: number;
}

function BookingModeExplainer({ mode, totalCents }: BookingModeExplainerProps) {
  if (mode === 'host-prepay') {
    return (
      <Card style={styles.explainerCard}>
        <View style={styles.explainerRow}>
          <Wallet
            size={16}
            color={colors.brand.primary}
            strokeWidth={2.25}
          />
          <Text variant="bodySm" color={colors.text.primary}>
            You pay the venue {totalCents === 0 ? 'nothing' : formatCurrency(totalCents)}{' '}
            now and lock the booking in immediately. SportsYeti doesn’t take
            money from players — you’ll set a per-player fee below and collect
            it in person.
          </Text>
        </View>
      </Card>
    );
  }
  return (
    <Card style={styles.explainerCard}>
      <View style={styles.explainerRow}>
        <Users size={16} color={colors.brand.primary} strokeWidth={2.25} />
        <Text variant="bodySm" color={colors.text.primary}>
          Each spot costs an even share, charged through SportsYeti. The
          venue is booked once the final player pays — you can prepay the
          remaining balance any time before the start to lock it in earlier.
        </Text>
      </View>
    </Card>
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
  customCostInput: {
    marginTop: spacing.md,
  },
  customCostHint: {
    marginTop: spacing.sm,
    marginLeft: spacing.xs,
  },
  inPersonCard: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  inPersonHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  explainerCard: {
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  explainerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
