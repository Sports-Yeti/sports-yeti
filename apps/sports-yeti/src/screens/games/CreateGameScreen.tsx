import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, MapPin, Sparkles, Tag as TagIcon } from 'lucide-react-native';
import { colors, radii, spacing } from '../../theme';
import {
  Button,
  Card,
  Input,
  ProgressBar,
  ScreenHeader,
  Tabs,
  Text,
  useToast,
} from '../../ui';
import {
  SKILL_LABELS,
  SPORT_FILTERS,
  type GameSkillLevel,
  type SportKey,
} from '../../mocks/games';
import { FACILITIES } from '../../mocks/facilities';
import { formatCurrency } from '../../lib/format';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateGame'>;

const STEP_COUNT = 3;

type Step = 1 | 2 | 3;

interface FormState {
  sport: SportKey | null;
  title: string;
  description: string;
  skill: GameSkillLevel;
  date: string;
  time: string;
  duration: string;
  venueId: string | null;
  spots: string;
  feeCents: number;
}

const INITIAL: FormState = {
  sport: null,
  title: '',
  description: '',
  skill: 'all',
  date: 'Sat, Apr 19',
  time: '7:00 PM',
  duration: '90',
  venueId: null,
  spots: '12',
  feeCents: 0,
};

export function CreateGameScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const canAdvance = (() => {
    if (step === 1) return !!form.sport && form.title.trim().length >= 3;
    if (step === 2) return !!form.venueId;
    return Number(form.spots) >= 2;
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
            ? 'Choose a venue and date — players see the closest first.'
            : 'Decide roster size and whether you want to charge.'}
        </Text>

        {step === 1 ? (
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
                    onPress={() =>
                      setForm((f) => ({ ...f, sport: sport.key }))
                    }
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
                      color={
                        selected ? colors.text.inverse : colors.text.primary
                      }
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
        ) : null}

        {step === 2 ? (
          <View style={styles.stepBlock}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Venue
            </Text>
            <View style={styles.venuesList}>
              {FACILITIES.slice(0, 4).map((f) => {
                const selected = form.venueId === f.id;
                return (
                  <Pressable
                    key={f.id}
                    accessibilityRole="button"
                    accessibilityLabel={f.name}
                    accessibilityState={{ selected }}
                    onPress={() =>
                      setForm((p) => ({ ...p, venueId: f.id }))
                    }
                    style={({ pressed }) => [
                      styles.venueRow,
                      selected ? styles.venueRowSelected : null,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <View style={styles.venueIcon}>
                      <MapPin
                        size={18}
                        color={
                          selected ? colors.brand.deep : colors.brand.primary
                        }
                        strokeWidth={2.25}
                      />
                    </View>
                    <View style={styles.venueBody}>
                      <Text variant="button" color={colors.text.primary}>
                        {f.name}
                      </Text>
                      <Text variant="bodySm" color={colors.text.secondary}>
                        {f.city} · {f.distanceMiles} mi
                      </Text>
                    </View>
                    <Text variant="bodySm" color={colors.text.secondary}>
                      {f.hourlyRateCents === 0
                        ? 'Free'
                        : formatCurrency(f.hourlyRateCents) + '/hr'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.row}>
              <Input
                label="Date"
                value={form.date}
                onChangeText={(v) => setForm((f) => ({ ...f, date: v }))}
                containerStyle={styles.flex1}
              />
              <Input
                label="Time"
                value={form.time}
                onChangeText={(v) => setForm((f) => ({ ...f, time: v }))}
                containerStyle={styles.flex1}
              />
            </View>
            <Input
              label="Duration (minutes)"
              value={form.duration}
              variant="number"
              onChangeText={(v) => setForm((f) => ({ ...f, duration: v }))}
            />
          </View>
        ) : null}

        {step === 3 ? (
          <View style={styles.stepBlock}>
            <Input
              label="Player spots"
              value={form.spots}
              variant="number"
              onChangeText={(v) => setForm((f) => ({ ...f, spots: v }))}
              helpText="Including yourself."
            />

            <View>
              <Text
                variant="eyebrow"
                color={colors.text.secondary}
                style={styles.label}
              >
                Player fee
              </Text>
              <Tabs
                variant="segmented"
                items={[
                  { key: '0', label: 'Free' },
                  { key: '500', label: '$5' },
                  { key: '1000', label: '$10' },
                  { key: '2000', label: '$20' },
                ]}
                value={String(form.feeCents)}
                onChange={(k) =>
                  setForm((f) => ({ ...f, feeCents: Number(k) }))
                }
              />
              <Text variant="caption" color={colors.text.secondary} style={styles.help}>
                Fees go through SportsYeti checkout — players are only charged once their spot is confirmed.
              </Text>
            </View>

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
                  {form.title || 'Untitled'} · {form.sport ?? '—'} · {SKILL_LABELS[form.skill]}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <MapPin size={14} color={colors.text.secondary} strokeWidth={2.25} />
                <Text variant="bodySm" color={colors.text.secondary}>
                  {FACILITIES.find((f) => f.id === form.venueId)?.name ?? '—'} · {form.date} · {form.time}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text variant="bodySm" color={colors.text.secondary}>
                  {form.spots || '—'} spots ·{' '}
                  {form.feeCents === 0 ? 'Free' : formatCurrency(form.feeCents) + '/player'}
                </Text>
              </View>
            </Card>
          </View>
        ) : null}
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
  help: {
    marginTop: spacing.sm,
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
  venuesList: {
    gap: spacing.sm,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.soft,
  },
  venueRowSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.soft,
  },
  venueIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueBody: {
    flex: 1,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  summaryCard: {
    gap: spacing.md,
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
