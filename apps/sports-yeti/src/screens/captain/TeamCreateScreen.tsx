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
  HandCoins,
  MapPin,
  Sparkles,
  Tag as TagIcon,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Button,
  Card,
  Input,
  MoneyInput,
  ProgressBar,
  type RadiusCenter,
  RadiusMapPicker,
  ScreenHeader,
  SearchBar,
  SearchSelect,
  SportCombobox,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import {
  SKILL_LABELS,
  sportCatalogEntry,
  type GameSkillLevel,
} from '../../mocks/games';
import {
  CITY_COORDS,
  MOCK_CITY_OPTIONS,
  OPEN_LEAGUES,
  type OpenLeague,
} from '../../mocks/teams';
import {
  DEFAULT_MAP_CENTER,
  distanceMilesBetween,
  type GeoPoint,
} from '../../mocks/facilities';
import { formatCurrency } from '../../lib/format';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'TeamCreate'>;

const STEP_COUNT = 3;
type Step = 1 | 2 | 3;

/** Skill levels mirror the Discover skill filter (Beginner / Intermediate /
 *  Advanced), minus the filter-only "All". */
type CreateSkillLevel = Exclude<GameSkillLevel, 'all'>;
const CREATE_LEVELS: CreateSkillLevel[] = ['beginner', 'intermediate', 'advanced'];

type LeagueMode = 'league' | 'custom';
/** League selected: split the entry fee with players, or pay now to lock in. */
type LeaguePayMode = 'split' | 'lock-in';
type FeeSplitMode = 'auto' | 'manual';
/** Custom league: free to join, or paid (collected in person). */
type CustomEntry = 'free' | 'paid';

interface FormState {
  /** Catalog key (e.g. `soccer`, `futsal`, `pickleball`). */
  sport: string | null;
  name: string;
  skill: CreateSkillLevel;
  city: string | null;

  leagueMode: LeagueMode;
  leagueId: string | null;
  leagueSearch: string;
  searchCenter: RadiusCenter | null;
  searchRadiusMiles: number;
  customLeagueName: string;

  rosterSize: number;
  // League payment.
  payMode: LeaguePayMode;
  feeSplitMode: FeeSplitMode;
  /** Per-player fee used for manual splits and in-person collection. */
  manualFeePerPlayerCents: number;
  // Custom payment.
  customEntry: CustomEntry;
}

const DEFAULT_RADIUS_MILES = 25;

const INITIAL: FormState = {
  sport: null,
  name: '',
  skill: 'beginner',
  city: null,
  leagueMode: 'league',
  leagueId: null,
  leagueSearch: '',
  searchCenter: null,
  searchRadiusMiles: DEFAULT_RADIUS_MILES,
  customLeagueName: '',
  rosterSize: 12,
  payMode: 'split',
  feeSplitMode: 'auto',
  manualFeePerPlayerCents: 0,
  customEntry: 'free',
};

function findLeague(id: string | null): OpenLeague | null {
  if (!id) return null;
  return OPEN_LEAGUES.find((l) => l.id === id) ?? null;
}

function leagueCoords(league: OpenLeague): GeoPoint {
  return CITY_COORDS[league.city] ?? DEFAULT_MAP_CENTER;
}

/** Total cost owed for the team's entry — the league registration fee, or
 *  zero for a custom/free squad (custom paid is per-player, collected in
 *  person, so there's no platform total). */
function totalCostCents(form: FormState): number {
  if (form.leagueMode === 'custom') return 0;
  const league = findLeague(form.leagueId);
  return league?.feeCents ?? 0;
}

function perPlayerCents(form: FormState): number {
  if (form.leagueMode === 'custom') {
    return form.customEntry === 'paid' ? form.manualFeePerPlayerCents : 0;
  }
  const total = totalCostCents(form);
  // Lock-in: captain prepays the league, then collects from players in person.
  if (form.payMode === 'lock-in') return form.manualFeePerPlayerCents;
  if (form.feeSplitMode === 'manual') return form.manualFeePerPlayerCents;
  if (form.rosterSize <= 0) return 0;
  return Math.ceil(total / form.rosterSize);
}

function suggestedPerPlayerCents(form: FormState): number {
  const total = totalCostCents(form);
  if (form.rosterSize <= 0 || total <= 0) return 0;
  return Math.ceil(total / form.rosterSize);
}

export function TeamCreateScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const canAdvance = (() => {
    if (step === 1)
      return !!form.sport && form.name.trim().length >= 2 && !!form.city;
    if (step === 2)
      return form.leagueMode === 'league' ? !!form.leagueId : true;
    return form.rosterSize >= 2;
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
        title: `${form.name.trim()} is forming`,
        description: buildSummaryLine(form),
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

  const total = totalCostCents(form);
  const primaryLabel =
    step === STEP_COUNT
      ? submitting
        ? 'Creating…'
        : form.leagueMode === 'league' &&
          form.payMode === 'lock-in' &&
          total > 0
        ? `Pay ${formatCurrency(total)} & create`
        : 'Create squad'
      : 'Continue';

  return (
    <View style={styles.root}>
      <ScreenHeader title="Start a squad" hasNotifications={false} variant="solid" />
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
            ? "Who's the squad?"
            : step === 2
            ? 'Pick a league'
            : 'Roster & entry fee'}
        </Text>
        <Text variant="body" color={colors.text.secondary}>
          {step === 1
            ? 'Name your team, pick a sport, skill level, and home city.'
            : step === 2
            ? 'Find a league near you, or set up an independent squad.'
            : 'Set the roster size and decide how the entry fee is covered.'}
        </Text>

        {step === 1 ? <Step1 form={form} setForm={setForm} /> : null}
        {step === 2 ? <Step2 form={form} setForm={setForm} /> : null}
        {step === 3 ? <Step3 form={form} setForm={setForm} /> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label={primaryLabel}
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

function buildSummaryLine(form: FormState): string {
  const perPlayer = perPlayerCents(form);
  const total = totalCostCents(form);
  if (form.leagueMode === 'custom') {
    return form.customEntry === 'paid' && perPlayer > 0
      ? `Independent squad — collect ${formatCurrency(perPlayer)}/player in person.`
      : "Independent squad — free to join. You're the captain.";
  }
  const league = findLeague(form.leagueId);
  const leagueName = league?.name ?? 'the league';
  if (form.payMode === 'lock-in') {
    return `Paid ${formatCurrency(total)} to lock your ${leagueName} spot. Collect ${formatCurrency(perPlayer)}/player in person.`;
  }
  return `Joining ${leagueName} — players split the ${formatCurrency(total)} entry (${formatCurrency(perPlayer)} each).`;
}

// ---------- Step 1: sport, name, skill, city ----------

interface StepProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}

function Step1({ form, setForm }: StepProps) {
  // SportCombobox stores selections as a Set<string>; bridge to single-select.
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
        placeholder="Search sports (e.g. soccer, hockey)…"
        scrollResults={false}
        maxVisibleResults={6}
      />

      <Input
        label="Team name"
        placeholder="Aurora FC"
        value={form.name}
        onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
        maxLength={60}
        helpText="Players see this when they find your squad."
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
          items={CREATE_LEVELS.map((k) => ({ key: k, label: SKILL_LABELS[k] }))}
          value={form.skill}
          onChange={(k) => setForm((f) => ({ ...f, skill: k as CreateSkillLevel }))}
        />
      </View>

      <View>
        <Text
          variant="eyebrow"
          color={colors.text.secondary}
          style={styles.label}
        >
          City
        </Text>
        <SearchSelect
          options={MOCK_CITY_OPTIONS}
          value={form.city}
          onChange={(city) =>
            setForm((f) => {
              const coords = city ? CITY_COORDS[city] : undefined;
              return {
                ...f,
                city,
                // Seed the league radius search around the chosen city.
                searchCenter:
                  coords && city
                    ? { ...coords, label: city }
                    : f.searchCenter,
              };
            })
          }
          placeholder="Search your city…"
          emptyText="No cities match that search."
        />
      </View>
    </View>
  );
}

// ---------- Step 2: league radius search + custom ----------

function Step2({ form, setForm }: StepProps) {
  const sportEntry = form.sport ? sportCatalogEntry(form.sport) : null;
  const sportBucket = sportEntry?.bucket ?? null;
  const center: GeoPoint = form.searchCenter ?? DEFAULT_MAP_CENTER;

  const leagues = useMemo<OpenLeague[]>(() => {
    const q = form.leagueSearch.trim().toLowerCase();
    return OPEN_LEAGUES.filter((league) => {
      if (sportBucket && (league.sportKey as string) !== (sportBucket as string))
        return false;
      const d = distanceMilesBetween(center, leagueCoords(league));
      if (d > form.searchRadiusMiles) return false;
      if (!q) return true;
      return (
        league.name.toLowerCase().includes(q) ||
        league.city.toLowerCase().includes(q) ||
        league.sport.toLowerCase().includes(q)
      );
    }).sort(
      (a, b) =>
        distanceMilesBetween(center, leagueCoords(a)) -
        distanceMilesBetween(center, leagueCoords(b)),
    );
  }, [sportBucket, form.leagueSearch, center, form.searchRadiusMiles]);

  return (
    <View style={styles.stepBlock}>
      <View style={styles.kindToggle}>
        <Tabs
          variant="segmented"
          items={[
            { key: 'league', label: 'Find a league' },
            { key: 'custom', label: 'Custom league' },
          ]}
          value={form.leagueMode}
          onChange={(k) =>
            setForm((f) => ({
              ...f,
              leagueMode: k as LeagueMode,
              leagueId: k === 'league' ? f.leagueId : null,
            }))
          }
        />
      </View>

      {form.leagueMode === 'league' ? (
        <LeaguePicker form={form} setForm={setForm} leagues={leagues} center={center} />
      ) : (
        <CustomLeagueForm form={form} setForm={setForm} />
      )}
    </View>
  );
}

interface LeaguePickerProps extends StepProps {
  leagues: OpenLeague[];
  center: GeoPoint;
}

function LeaguePicker({ form, setForm, leagues, center }: LeaguePickerProps) {
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
        markers={Array.from(
          new Map(
            leagues.map((league) => [
              league.id,
              {
                id: league.id,
                coords: leagueCoords(league),
                label: league.name,
              },
            ]),
          ).values(),
        )}
        mapHeight={200}
      />

      <SearchBar
        value={form.leagueSearch}
        onChangeText={(v) => setForm((f) => ({ ...f, leagueSearch: v }))}
        placeholder="Filter leagues by name or city…"
      />

      <View style={styles.recHeader}>
        <Text variant="eyebrow" color={colors.text.secondary}>
          Within {form.searchRadiusMiles} mi
        </Text>
        <Text variant="caption" color={colors.text.muted}>
          {leagues.length} league{leagues.length === 1 ? '' : 's'}
        </Text>
      </View>

      {leagues.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text variant="body" color={colors.text.secondary} align="center">
            No leagues for this sport inside the radius. Widen the radius, move
            the pin, or set up a custom league instead.
          </Text>
        </Card>
      ) : (
        <View style={styles.spaceList}>
          {leagues.map((league) => {
            const selected = form.leagueId === league.id;
            const distance = distanceMilesBetween(center, leagueCoords(league));
            const spotsLeft = league.maxTeams - league.registeredTeams;
            return (
              <Pressable
                key={league.id}
                accessibilityRole="button"
                accessibilityLabel={`${league.name} · ${league.sport}`}
                accessibilityState={{ selected }}
                onPress={() => setForm((f) => ({ ...f, leagueId: league.id }))}
                style={({ pressed }) => [
                  styles.spaceCard,
                  selected ? styles.spaceCardSelected : null,
                  pressed ? styles.pressed : null,
                ]}
              >
                <View style={styles.spaceIcon}>
                  <Trophy
                    size={18}
                    color={selected ? colors.brand.deep : colors.brand.primary}
                    strokeWidth={2.25}
                  />
                </View>
                <View style={styles.spaceBody}>
                  <Text variant="button" color={colors.text.primary}>
                    {league.name}
                  </Text>
                  <Text variant="bodySm" color={colors.text.secondary}>
                    {league.sport} · {league.city} · {distance.toFixed(1)} mi
                  </Text>
                  <View style={styles.leagueMeta}>
                    <Tag
                      size="sm"
                      tone={league.spotsTone}
                      label={`${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
                    />
                    <Tag size="sm" tone="neutral" label={SKILL_LABELS[skillOf(league)]} />
                  </View>
                </View>
                <View style={styles.spacePrice}>
                  <Text variant="button" color={colors.brand.primary}>
                    {league.feeCents === 0
                      ? 'Free'
                      : formatCurrency(league.feeCents)}
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    team entry
                  </Text>
                </View>
                {selected ? (
                  <View style={styles.spaceCheck}>
                    <Check size={18} color={colors.brand.primary} strokeWidth={2.5} />
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

/** Map an OpenLeague's TEAM level onto the Discover skill taxonomy for tags. */
function skillOf(league: OpenLeague): CreateSkillLevel {
  switch (league.level) {
    case 'RECREATIONAL':
      return 'beginner';
    case 'ADVANCED':
      return 'advanced';
    case 'INTERMEDIATE':
    default:
      return 'intermediate';
  }
}

function CustomLeagueForm({ form, setForm }: StepProps) {
  return (
    <View style={styles.venueBlock}>
      <Card style={styles.customHint}>
        <Building2 size={18} color={colors.brand.primary} strokeWidth={2.25} />
        <Text variant="bodySm" color={colors.text.secondary}>
          Not joining a registered league? Run an independent squad — you'll set
          free or paid entry in the next step.
        </Text>
      </Card>

      <Input
        label="League / competition name"
        placeholder="e.g. Sunday Pickup Crew (optional)"
        value={form.customLeagueName}
        onChangeText={(v) => setForm((f) => ({ ...f, customLeagueName: v }))}
        maxLength={80}
        helpText="Optional — give your casual setup a name if you'd like."
      />
    </View>
  );
}

// ---------- Step 3: roster size + payment ----------

function Step3({ form, setForm }: StepProps) {
  const total = totalCostCents(form);
  const perPlayer = perPlayerCents(form);
  const isCustom = form.leagueMode === 'custom';
  const isLockIn = form.payMode === 'lock-in';
  const league = findLeague(form.leagueId);
  const hasLeagueCost = !isCustom && total > 0;
  const isCustomPaid = isCustom && form.customEntry === 'paid';

  return (
    <View style={styles.stepBlock}>
      <Input
        label="Roster size"
        value={String(form.rosterSize)}
        variant="number"
        leadingIcon={
          <Users size={18} color={colors.brand.primary} strokeWidth={2.25} />
        }
        helpText="Max players on the squad, including yourself."
        onChangeText={(v) => {
          const n = Number(v.replace(/[^0-9]/g, ''));
          setForm((f) => ({
            ...f,
            rosterSize: Number.isFinite(n) ? Math.min(40, n) : 0,
          }));
        }}
      />

      {/* Custom league → free or paid entry (paid collected in person). */}
      {isCustom ? (
        <View>
          <Text variant="eyebrow" color={colors.text.secondary} style={styles.label}>
            Entry
          </Text>
          <Tabs
            variant="segmented"
            items={[
              { key: 'free', label: 'Free to join' },
              { key: 'paid', label: 'Paid entry' },
            ]}
            value={form.customEntry}
            onChange={(k) =>
              setForm((f) => ({ ...f, customEntry: k as CustomEntry }))
            }
          />
          {isCustomPaid ? (
            <MoneyInput
              containerStyle={styles.customCostInput}
              label="Per-player fee · collected in person (USD)"
              helpText="SportsYeti doesn't process payment for custom squads — collect this from each player directly."
              valueCents={form.manualFeePerPlayerCents}
              onChangeCents={(cents) =>
                setForm((f) => ({ ...f, manualFeePerPlayerCents: cents }))
              }
            />
          ) : (
            <Text
              variant="caption"
              color={colors.text.muted}
              style={styles.customCostHint}
            >
              Players join for free — no payment required.
            </Text>
          )}
        </View>
      ) : null}

      {/* League selected with a real entry fee → split vs lock-in. */}
      {hasLeagueCost ? (
        <View>
          <Text variant="eyebrow" color={colors.text.secondary} style={styles.label}>
            How is the {formatCurrency(total)} entry fee covered?
          </Text>
          <Tabs
            variant="segmented"
            items={[
              { key: 'split', label: 'Split with players' },
              { key: 'lock-in', label: 'Pay now to lock in' },
            ]}
            value={form.payMode}
            onChange={(k) => setForm((f) => ({ ...f, payMode: k as LeaguePayMode }))}
          />
          <PayModeExplainer mode={form.payMode} totalCents={total} />
        </View>
      ) : null}

      {/* Split → auto-split or set a manual per-player amount. */}
      {hasLeagueCost && !isLockIn ? (
        <View>
          <Text variant="eyebrow" color={colors.text.secondary} style={styles.label}>
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

      {hasLeagueCost && !isLockIn && form.feeSplitMode === 'manual' ? (
        <MoneyInput
          label="Per-player fee (USD)"
          valueCents={form.manualFeePerPlayerCents}
          onChangeCents={(cents) =>
            setForm((f) => ({ ...f, manualFeePerPlayerCents: cents }))
          }
        />
      ) : null}

      {/* Lock-in → captain prepays, collects per-player in person. */}
      {hasLeagueCost && isLockIn ? (
        <MoneyInput
          label="Per-player fee · collected in person (USD)"
          helpText={
            suggestedPerPlayerCents(form) > 0
              ? `Suggested even split: ${formatCurrency(suggestedPerPlayerCents(form))} × ${form.rosterSize} players.`
              : undefined
          }
          valueCents={form.manualFeePerPlayerCents}
          onChangeCents={(cents) =>
            setForm((f) => ({ ...f, manualFeePerPlayerCents: cents }))
          }
        />
      ) : null}

      {(isCustomPaid || (hasLeagueCost && isLockIn)) ? (
        <Card style={styles.inPersonCard}>
          <View style={styles.inPersonHead}>
            <HandCoins size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <Text variant="button" color={colors.text.primary}>
              Player payments collected in person
            </Text>
          </View>
          <Text variant="bodySm" color={colors.text.secondary}>
            {isCustom
              ? `SportsYeti doesn't process payment for custom squads. You'll collect ${formatCurrency(form.manualFeePerPlayerCents)} from each player directly — cash, Venmo, etc.`
              : `You're paying the league entry upfront, so SportsYeti doesn't take additional money from players. You'll collect ${formatCurrency(form.manualFeePerPlayerCents)} from each on the day — cash, Venmo, etc.`}
          </Text>
        </Card>
      ) : null}

      <Card style={styles.feeCard}>
        <View style={styles.feeHead}>
          <View style={styles.feeIcon}>
            <CircleDollarSign size={18} color={colors.brand.primary} strokeWidth={2.25} />
          </View>
          <Text variant="h3" color={colors.text.primary}>
            Cost breakdown
          </Text>
        </View>

        {isCustom && !isCustomPaid ? (
          <Text variant="bodySm" color={colors.text.secondary}>
            Free squad — no payment required from players.
          </Text>
        ) : isCustom ? (
          <View style={styles.feeRow}>
            <Text variant="bodySm" color={colors.text.secondary}>
              Per-player entry (in person)
            </Text>
            <Text variant="bodySm" color={colors.text.primary}>
              {perPlayer === 0 ? '—' : formatCurrency(perPlayer)}
            </Text>
          </View>
        ) : (
          <View style={styles.feeRow}>
            <Text variant="bodySm" color={colors.text.secondary}>
              {league ? `${league.name} entry` : 'League entry'}
            </Text>
            <Text variant="bodySm" color={colors.text.primary}>
              {total === 0 ? 'Free' : formatCurrency(total)}
            </Text>
          </View>
        )}

        <View style={styles.feeDivider} />

        <View style={styles.feeRow}>
          <Text variant="button" color={colors.text.primary}>
            Per player ({form.rosterSize})
          </Text>
          <Text variant="h3" color={colors.brand.primary}>
            {perPlayer === 0 ? 'Free' : formatCurrency(perPlayer)}
          </Text>
        </View>
        {hasLeagueCost && isLockIn ? (
          <View style={styles.feeRow}>
            <Text variant="button" color={colors.text.secondary}>
              Charged to you now
            </Text>
            <Text variant="button" color={colors.brand.deep}>
              {formatCurrency(total)}
            </Text>
          </View>
        ) : null}
        {hasLeagueCost && !isLockIn ? (
          <View style={styles.feeRow}>
            <Text variant="button" color={colors.text.secondary}>
              Spot confirmed when
            </Text>
            <Text variant="button" color={colors.brand.deep}>
              total reaches {formatCurrency(total)}
            </Text>
          </View>
        ) : null}
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
            {form.name || 'Untitled squad'} ·{' '}
            {form.sport ? sportCatalogEntry(form.sport)?.label ?? form.sport : '—'}{' '}
            · {SKILL_LABELS[form.skill]}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <MapPin size={14} color={colors.text.secondary} strokeWidth={2.25} />
          <Text variant="bodySm" color={colors.text.secondary}>
            {form.city ?? '—'} ·{' '}
            {isCustom
              ? form.customLeagueName || 'Independent squad'
              : league?.name ?? 'No league selected'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Users size={14} color={colors.text.secondary} strokeWidth={2.25} />
          <Text variant="bodySm" color={colors.text.secondary}>
            {form.rosterSize} roster spots ·{' '}
            {perPlayer === 0
              ? 'Free per player'
              : `${formatCurrency(perPlayer)}/player`}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          {isCustomPaid || (hasLeagueCost && isLockIn) ? (
            <HandCoins size={14} color={colors.text.secondary} strokeWidth={2.25} />
          ) : (
            <Wallet size={14} color={colors.text.secondary} strokeWidth={2.25} />
          )}
          <Text variant="bodySm" color={colors.text.secondary}>
            {isCustom
              ? isCustomPaid
                ? `In-person collection · ${formatCurrency(perPlayer)}/player`
                : 'Free squad · no checkout required'
              : isLockIn
              ? `Spot locked · collect ${formatCurrency(perPlayer)}/player in person`
              : `Split-pay · spot locked when total hits ${formatCurrency(total)}`}
          </Text>
        </View>
      </Card>
    </View>
  );
}

interface PayModeExplainerProps {
  mode: LeaguePayMode;
  totalCents: number;
}

function PayModeExplainer({ mode, totalCents }: PayModeExplainerProps) {
  if (mode === 'lock-in') {
    return (
      <Card style={styles.explainerCard}>
        <View style={styles.explainerRow}>
          <Wallet size={16} color={colors.brand.primary} strokeWidth={2.25} />
          <Text variant="bodySm" color={colors.text.primary}>
            You pay the {formatCurrency(totalCents)} league entry now and lock
            your spot immediately. SportsYeti doesn't take money from players —
            set a per-player fee below and collect it in person.
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
          Each player pays an even share through SportsYeti. Your spot is
          confirmed once the roster covers the {formatCurrency(totalCents)}{' '}
          entry — you can prepay the balance any time to lock in earlier.
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
    gap: 4,
  },
  leagueMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 2,
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
