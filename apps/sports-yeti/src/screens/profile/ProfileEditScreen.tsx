import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BadgeCheck, Camera, Check, ChevronLeft } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Avatar,
  Button,
  Card,
  IconBadge,
  Input,
  Modal,
  SearchMultiSelect,
  SportCombobox,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import {
  EXPERIENCE_LEVELS,
  GENDER_IDENTITY_OPTIONS,
  PROFILE_USER,
  SPORTS_META,
  SPORT_ATTRIBUTE_TEMPLATES,
  SPORT_META_BY_KEY,
  formatFeetInches,
  type ExperienceLevel,
  type ProfileUser,
  type SportPlayerProfile,
} from '../../mocks/profile';
import { POSITIONS_BY_SPORT, type SportKey } from '../../mocks/teams';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'ProfileEdit'>;

const AVAILABILITY_TABS = [
  { key: 'available', label: 'Available' },
  { key: 'looking_for_team', label: 'LFT' },
  { key: 'busy', label: 'Busy' },
];

// The canonical 6-sport list rendered through the Discover-page combobox.
const SPORT_OPTIONS = SPORTS_META.map((m) => ({
  key: m.key,
  label: m.label,
  Icon: m.Icon,
}));

function parseOptionalInt(value: string): number | undefined {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** Per-sport editing block: positions via the Discover-style searchable
 *  multi-select, plus the sport's optional attribute fields. */
function SportProfileEditor({
  sportProfile,
  isPrimary,
  onPositionsChange,
  onAttributeChange,
}: {
  sportProfile: SportPlayerProfile;
  isPrimary: boolean;
  onPositionsChange: (positions: string[]) => void;
  onAttributeChange: (attributeId: string, value: string) => void;
}) {
  const meta = SPORT_META_BY_KEY[sportProfile.sportKey];
  const Icon = meta.Icon;
  const orderedPositions = [
    sportProfile.position,
    ...(sportProfile.secondaryPositions ?? []),
  ];
  const attributeFields = SPORT_ATTRIBUTE_TEMPLATES[sportProfile.sportKey];
  const attributes = sportProfile.attributes ?? {};

  const handleSetChange = (next: Set<string>) => {
    // Preserve the existing order (first = primary); append new picks.
    const kept = orderedPositions.filter((p) => next.has(p));
    const added = [...next].filter((p) => !orderedPositions.includes(p));
    onPositionsChange([...kept, ...added]);
  };

  return (
    <View style={styles.sportBlock}>
      <View style={styles.sportBlockHeader}>
        <IconBadge size={40} tone="brand">
          <Icon size={18} color={colors.brand.deep} strokeWidth={2.25} />
        </IconBadge>
        <View style={styles.sportBlockTitle}>
          <Text variant="button" color={colors.text.primary}>
            {meta.label}
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            {isPrimary ? 'Primary sport' : 'Additional sport'}
            {orderedPositions.length > 0
              ? ` · primary position: ${orderedPositions[0]}`
              : ''}
          </Text>
        </View>
      </View>

      <SearchMultiSelect
        value={new Set(orderedPositions)}
        onChange={handleSetChange}
        options={POSITIONS_BY_SPORT[sportProfile.sportKey]}
        placeholder={`Search ${meta.label.toLowerCase()} positions…`}
        emptyText="No positions match."
      />

      {attributeFields.length > 0 ? (
        <View style={styles.attributeFields}>
          {attributeFields.map((field) => (
            <Input
              key={field.id}
              label={`${field.label} (optional)`}
              value={attributes[field.id] ?? ''}
              onChangeText={(v) => onAttributeChange(field.id, v)}
              placeholder={field.placeholder}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function ProfileEditScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [form, setForm] = useState<ProfileUser>(PROFILE_USER);
  const [saving, setSaving] = useState(false);
  const [proApplyOpen, setProApplyOpen] = useState(false);
  const [proExperienceNote, setProExperienceNote] = useState('');

  const update = <K extends keyof ProfileUser>(key: K, value: ProfileUser[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const selectedSportKeys = useMemo(
    () => new Set<string>(form.sportProfiles.map((s) => s.sportKey)),
    [form.sportProfiles],
  );

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.show({ variant: 'success', title: 'Profile updated' });
      navigation.goBack();
    }, 500);
  };

  const handleSportsChange = (next: Set<string>) => {
    if (next.size === 0) {
      toast.show({
        variant: 'info',
        title: 'Keep at least one sport',
        description: 'Your profile needs a primary sport.',
      });
      return;
    }
    setForm((prev) => {
      // Preserve existing per-sport data; seed new sports with the first
      // canonical position so the block is never empty.
      const kept = prev.sportProfiles.filter((p) => next.has(p.sportKey));
      const added = [...next]
        .filter(
          (key) => !prev.sportProfiles.some((p) => p.sportKey === key),
        )
        .map((key) => ({
          sportKey: key as SportKey,
          position: POSITIONS_BY_SPORT[key as SportKey][0]!,
        }));
      return { ...prev, sportProfiles: [...kept, ...added] };
    });
  };

  const handlePositionsChange = (sportKey: SportKey, positions: string[]) => {
    if (positions.length === 0) {
      toast.show({
        variant: 'info',
        title: 'Pick at least one position',
        description: 'The first position you pick is shown as your primary.',
      });
      return;
    }
    setForm((prev) => ({
      ...prev,
      sportProfiles: prev.sportProfiles.map((p) =>
        p.sportKey === sportKey
          ? {
              ...p,
              position: positions[0]!,
              secondaryPositions:
                positions.length > 1 ? positions.slice(1) : undefined,
            }
          : p,
      ),
    }));
  };

  const handleAttributeChange = (
    sportKey: SportKey,
    attributeId: string,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      sportProfiles: prev.sportProfiles.map((p) =>
        p.sportKey === sportKey
          ? { ...p, attributes: { ...(p.attributes ?? {}), [attributeId]: value } }
          : p,
      ),
    }));
  };

  const handleProApply = () => {
    setProApplyOpen(false);
    update('proBadge', 'pending');
    toast.show({
      variant: 'success',
      title: 'Pro badge application sent',
      description: 'A platform administrator will review your experience.',
    });
  };

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
        </Pressable>
        <Text variant="h2" color={colors.text.primary}>
          Edit Profile
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarBlock}>
          <Avatar uri={form.avatar} initials={form.name.charAt(0)} size={120} bordered />
          <Pressable
            onPress={() => toast.show({ variant: 'info', title: 'Photo picker coming soon' })}
            accessibilityRole="button"
            accessibilityLabel="Change photo"
            hitSlop={8}
            style={styles.cameraBtn}
          >
            <Camera size={18} color={colors.text.inverse} strokeWidth={2.5} />
          </Pressable>
        </View>

        <Input
          label="Name"
          value={form.name}
          onChangeText={(v) => update('name', v)}
        />
        <Input
          label="Handle"
          value={form.handle}
          onChangeText={(v) => update('handle', v)}
        />
        <Input
          label="Bio"
          value={form.bio}
          onChangeText={(v) => update('bio', v)}
          variant="multiline"
          maxLength={200}
          helpText={`${form.bio.length}/200`}
        />

        <Card style={styles.sectionCard}>
          <Text variant="h3" color={colors.text.primary}>
            Location
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            Used to surface nearby games, teams, and facilities.
          </Text>
          <Input
            label="City"
            value={form.city}
            onChangeText={(v) => update('city', v)}
            placeholder="Denver, CO"
          />
          <Input
            label="Postal code"
            value={form.postalCode}
            onChangeText={(v) => update('postalCode', v)}
            placeholder="80205"
            autoCapitalize="characters"
            maxLength={10}
          />
        </Card>

        <Card style={styles.sectionCard}>
          <Text variant="h3" color={colors.text.primary}>
            Gender identity
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            Optional. Helps leagues place you in the right divisions — shown on
            your profile only if set.
          </Text>
          <View style={styles.genderWrap}>
            {GENDER_IDENTITY_OPTIONS.map((option) => {
              const selected = form.genderIdentity === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected }}
                  onPress={() =>
                    update('genderIdentity', selected ? null : option.value)
                  }
                  style={[
                    styles.genderChip,
                    selected ? styles.genderChipSelected : null,
                  ]}
                >
                  {selected ? (
                    <Check size={14} color={colors.brand.deep} strokeWidth={2.5} />
                  ) : null}
                  <Text
                    variant="bodySm"
                    color={selected ? colors.brand.deep : colors.text.primary}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text variant="h3" color={colors.text.primary}>
            Physical attributes
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            All optional. Captains and scouts see these on your profile.
          </Text>
          <View style={styles.physicalRow}>
            <Input
              label="Height (in)"
              value={form.physical.heightIn ? String(form.physical.heightIn) : ''}
              onChangeText={(v) =>
                update('physical', { ...form.physical, heightIn: parseOptionalInt(v) })
              }
              variant="number"
              placeholder="66"
              helpText={
                form.physical.heightIn
                  ? formatFeetInches(form.physical.heightIn)
                  : ' '
              }
              containerStyle={styles.physicalField}
            />
            <Input
              label="Weight (lb)"
              value={form.physical.weightLb ? String(form.physical.weightLb) : ''}
              onChangeText={(v) =>
                update('physical', { ...form.physical, weightLb: parseOptionalInt(v) })
              }
              variant="number"
              placeholder="140"
              helpText=" "
              containerStyle={styles.physicalField}
            />
            <Input
              label="Wingspan (in)"
              value={form.physical.wingspanIn ? String(form.physical.wingspanIn) : ''}
              onChangeText={(v) =>
                update('physical', { ...form.physical, wingspanIn: parseOptionalInt(v) })
              }
              variant="number"
              placeholder="67"
              helpText={
                form.physical.wingspanIn
                  ? formatFeetInches(form.physical.wingspanIn)
                  : ' '
              }
              containerStyle={styles.physicalField}
            />
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text variant="h3" color={colors.text.primary}>
            Sports you play
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            Search and pick your sports, then set the position(s) you can play
            in each. The first position is your primary.
          </Text>
          <SportCombobox
            value={selectedSportKeys}
            onChange={handleSportsChange}
            options={SPORT_OPTIONS}
            placeholder="Search sports…"
          />
          <View style={styles.sportBlocks}>
            {form.sportProfiles.map((sp, idx) => (
              <SportProfileEditor
                key={sp.sportKey}
                sportProfile={sp}
                isPrimary={idx === 0}
                onPositionsChange={(positions) =>
                  handlePositionsChange(sp.sportKey, positions)
                }
                onAttributeChange={(attributeId, value) =>
                  handleAttributeChange(sp.sportKey, attributeId, value)
                }
              />
            ))}
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text variant="h3" color={colors.text.primary}>
            Experience level
          </Text>
          <View style={styles.experienceGroup}>
            {EXPERIENCE_LEVELS.map((level) => {
              const selected = form.experience === level.key;
              return (
                <Pressable
                  key={level.key}
                  accessibilityRole="radio"
                  accessibilityLabel={level.label}
                  accessibilityHint={level.description}
                  accessibilityState={{ selected }}
                  onPress={() => update('experience', level.key as ExperienceLevel)}
                  style={[
                    styles.experienceRow,
                    selected ? styles.experienceRowSelected : null,
                  ]}
                >
                  <View style={styles.experienceBody}>
                    <Text
                      variant="button"
                      color={selected ? colors.brand.deep : colors.text.primary}
                    >
                      {level.label}
                    </Text>
                    <Text variant="caption" color={colors.text.secondary}>
                      {level.description}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      selected ? styles.radioSelected : null,
                    ]}
                  >
                    {selected ? (
                      <Check size={12} color={colors.text.inverse} strokeWidth={3} />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.proBadgeRow}>
            <IconBadge size={40} tone={form.proBadge === 'approved' ? 'brand' : 'soft'}>
              <BadgeCheck
                size={18}
                color={
                  form.proBadge === 'approved'
                    ? colors.brand.deep
                    : colors.brand.primary
                }
                strokeWidth={2.25}
              />
            </IconBadge>
            <View style={styles.proBadgeBody}>
              <Text variant="button" color={colors.text.primary}>
                Pro badge
              </Text>
              <Text variant="caption" color={colors.text.secondary}>
                Played professionally? Apply for a verified Pro badge — reviewed
                and approved by platform administrators.
              </Text>
            </View>
            {form.proBadge === 'approved' ? (
              <Tag tone="success" size="sm" leadingDot label="Verified" />
            ) : form.proBadge === 'pending' ? (
              <Tag tone="warning" size="sm" leadingDot label="Under review" />
            ) : (
              <Button
                label="Apply"
                variant="soft"
                size="sm"
                onPress={() => {
                  setProExperienceNote('');
                  setProApplyOpen(true);
                }}
              />
            )}
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text variant="h3" color={colors.text.primary}>
            Player profile
          </Text>
          <View>
            <Text variant="eyebrow" color={colors.text.secondary} style={styles.label}>
              Availability
            </Text>
            <Tabs
              variant="segmented"
              items={AVAILABILITY_TABS}
              value={form.availability}
              onChange={(k) =>
                update('availability', k as ProfileUser['availability'])
              }
            />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleBody}>
              <Text variant="button" color={colors.text.primary}>
                Available to sub
              </Text>
              <Text variant="caption" color={colors.text.secondary}>
                Captains can ping you for last-minute roster gaps.
              </Text>
            </View>
            <Switch
              value={form.availableToSub}
              onValueChange={(v) => update('availableToSub', v)}
              trackColor={{ false: colors.surface.chip, true: colors.brand.primary }}
            />
          </View>
          <Input
            label="Certifications"
            value={form.certifications}
            onChangeText={(v) => update('certifications', v)}
            placeholder="CPR, USSF Grade 8…"
          />
        </Card>

        <Card style={styles.sectionCard}>
          <Text variant="h3" color={colors.text.primary}>
            Privacy
          </Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggleBody}>
              <Text variant="button" color={colors.text.primary}>
                Private profile
              </Text>
              <Text variant="caption" color={colors.text.secondary}>
                Only teammates and accepted invites can see your profile.
              </Text>
            </View>
            <Switch
              value={form.privateProfile}
              onValueChange={(v) => update('privateProfile', v)}
              trackColor={{ false: colors.surface.chip, true: colors.brand.primary }}
            />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleBody}>
              <Text variant="button" color={colors.text.primary}>
                Show activity
              </Text>
              <Text variant="caption" color={colors.text.secondary}>
                Other players see your games, teams, camps, and seasons per sport.
              </Text>
            </View>
            <Switch
              value={form.showStats}
              onValueChange={(v) => update('showStats', v)}
              trackColor={{ false: colors.surface.chip, true: colors.brand.primary }}
            />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleBody}>
              <Text variant="button" color={colors.text.primary}>
                Show highlights
              </Text>
              <Text variant="caption" color={colors.text.secondary}>
                Your reels appear on your public profile.
              </Text>
            </View>
            <Switch
              value={form.showHighlights}
              onValueChange={(v) => update('showHighlights', v)}
              trackColor={{ false: colors.surface.chip, true: colors.brand.primary }}
            />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleBody}>
              <Text variant="button" color={colors.text.primary}>
                Show teams
              </Text>
              <Text variant="caption" color={colors.text.secondary}>
                Teams you've joined appear on your profile.
              </Text>
            </View>
            <Switch
              value={form.showTeams}
              onValueChange={(v) => update('showTeams', v)}
              trackColor={{ false: colors.surface.chip, true: colors.brand.primary }}
            />
          </View>
        </Card>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label={saving ? 'Saving…' : 'Save changes'}
          variant="gradient"
          size="lg"
          fullWidth
          disabled={saving}
          onPress={handleSave}
        />
      </View>

      <Modal
        visible={proApplyOpen}
        onRequestClose={() => setProApplyOpen(false)}
        variant="info"
        title="Apply for a Pro badge"
        description="Tell us about your professional experience (league, club, years). A platform administrator reviews every application."
        primaryAction={{ label: 'Submit application', onPress: handleProApply }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setProApplyOpen(false),
        }}
      >
        <View style={styles.proApplyBody}>
          <Input
            placeholder="e.g. Two seasons with Switchbacks FC (USL), 2021–2023…"
            value={proExperienceNote}
            onChangeText={setProExperienceNote}
            variant="multiline"
            maxLength={400}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  avatarBlock: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  sectionCard: {
    gap: spacing.md,
  },
  genderWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  genderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.surface.chip,
    borderWidth: 1,
    borderColor: colors.border.soft,
  },
  genderChipSelected: {
    backgroundColor: colors.brand.soft,
    borderColor: colors.brand.primary,
  },
  physicalRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  physicalField: {
    flex: 1,
    width: 'auto',
  },
  sportBlocks: {
    gap: spacing.lg,
  },
  sportBlock: {
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  sportBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sportBlockTitle: {
    flex: 1,
    gap: 2,
  },
  attributeFields: {
    gap: spacing.sm,
  },
  experienceGroup: {
    gap: spacing.sm,
  },
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.soft,
    minHeight: 64,
  },
  experienceRowSelected: {
    backgroundColor: colors.brand.soft,
    borderColor: colors.brand.primary,
  },
  experienceBody: {
    flex: 1,
    gap: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  proBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  proBadgeBody: {
    flex: 1,
    gap: 2,
  },
  proApplyBody: {
    width: '100%',
    gap: spacing.md,
  },
  label: {
    marginBottom: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  toggleBody: {
    flex: 1,
    gap: 2,
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
