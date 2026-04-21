import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Avatar,
  Button,
  Card,
  IconBadge,
  Input,
  PositionPickerSheet,
  SportPickerSheet,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import {
  PROFILE_USER,
  SPORT_META_BY_KEY,
  type ProfileUser,
  type SportPlayerProfile,
} from '../../mocks/profile';
import { POSITIONS_BY_SPORT, type SportKey } from '../../mocks/teams';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'ProfileEdit'>;

const EXPERIENCE_TABS = [
  { key: 'beginner', label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'advanced', label: 'Advanced' },
  { key: 'pro', label: 'Pro' },
];

const AVAILABILITY_TABS = [
  { key: 'available', label: 'Available' },
  { key: 'looking_for_team', label: 'LFT' },
  { key: 'busy', label: 'Busy' },
];

interface SportRowProps {
  sportProfile: SportPlayerProfile;
  isPrimary: boolean;
  canRemove: boolean;
  onEditPositions: () => void;
  onRemove: () => void;
}

function SportRow({
  sportProfile,
  isPrimary,
  canRemove,
  onEditPositions,
  onRemove,
}: SportRowProps) {
  const meta = SPORT_META_BY_KEY[sportProfile.sportKey];
  const Icon = meta.Icon;
  const secondary = sportProfile.secondaryPositions ?? [];

  return (
    <View style={styles.sportRow}>
      <View style={styles.sportRowHeader}>
        <IconBadge size={44} tone="brand">
          <Icon size={20} color={colors.brand.deep} strokeWidth={2.25} />
        </IconBadge>
        <View style={styles.sportRowTitle}>
          <Text variant="button" color={colors.text.primary}>
            {meta.label}
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            {isPrimary ? 'Primary sport' : 'Additional sport'}
          </Text>
        </View>
        {canRemove ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${meta.label}`}
            hitSlop={8}
            onPress={onRemove}
            style={styles.iconBtnGhost}
          >
            <Trash2 size={18} color={colors.status.live} strokeWidth={2.25} />
          </Pressable>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Edit positions for ${meta.label}`}
        accessibilityHint="Opens the position picker for this sport"
        onPress={onEditPositions}
        style={({ pressed }) => [
          styles.positionField,
          pressed ? styles.positionFieldPressed : null,
        ]}
      >
        <View style={styles.positionFieldBody}>
          <Text variant="eyebrow" color={colors.text.secondary}>
            POSITIONS
          </Text>
          <View style={styles.positionTags}>
            <Tag tone="brand" size="sm" label={`${sportProfile.position} · Primary`} />
            {secondary.map((pos) => (
              <Tag key={pos} tone="neutral" size="sm" label={pos} />
            ))}
          </View>
        </View>
        <ChevronRight size={18} color={colors.text.secondary} strokeWidth={2.25} />
      </Pressable>
    </View>
  );
}

export function ProfileEditScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [form, setForm] = useState<ProfileUser>(PROFILE_USER);
  const [saving, setSaving] = useState(false);
  const [sportPickerOpen, setSportPickerOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<SportKey | null>(null);

  const update = <K extends keyof ProfileUser>(key: K, value: ProfileUser[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.show({ variant: 'success', title: 'Profile updated' });
      navigation.goBack();
    }, 500);
  };

  const handleSportsChange = (sports: SportKey[]) => {
    setForm((prev) => {
      // Preserve existing position data for sports the user kept; create a
      // sensible default (first canonical position) for newly-added sports.
      const next: SportPlayerProfile[] = sports.map((sportKey) => {
        const existing = prev.sportProfiles.find((p) => p.sportKey === sportKey);
        if (existing) return existing;
        // Use the first canonical position for the sport as a default; the
        // user is nudged to refine this via the picker on the row.
        const defaultPosition = POSITIONS_BY_SPORT[sportKey][0]!;
        return { sportKey, position: defaultPosition };
      });
      return { ...prev, sportProfiles: next };
    });
  };

  const handlePositionsChange = (sportKey: SportKey, positions: string[]) => {
    if (positions.length === 0) return;
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

  const removeSport = (sportKey: SportKey) => {
    if (form.sportProfiles.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      sportProfiles: prev.sportProfiles.filter((p) => p.sportKey !== sportKey),
    }));
  };

  const editingSportProfile = editingSport
    ? form.sportProfiles.find((p) => p.sportKey === editingSport)
    : undefined;

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
          label="City"
          value={form.city}
          onChangeText={(v) => update('city', v)}
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
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderTitle}>
              <Text variant="h3" color={colors.text.primary}>
                Sports & positions
              </Text>
              <Text variant="caption" color={colors.text.secondary}>
                Pick the sports you play and your position in each. Stats and
                team suggestions follow these picks.
              </Text>
            </View>
            <Button
              label="Edit sports"
              variant="soft"
              size="sm"
              leadingIcon={
                <Plus size={14} color={colors.brand.primary} strokeWidth={2.5} />
              }
              onPress={() => setSportPickerOpen(true)}
            />
          </View>

          <View style={styles.sportRows}>
            {form.sportProfiles.map((sp, idx) => (
              <SportRow
                key={sp.sportKey}
                sportProfile={sp}
                isPrimary={idx === 0}
                canRemove={form.sportProfiles.length > 1}
                onEditPositions={() => setEditingSport(sp.sportKey)}
                onRemove={() => removeSport(sp.sportKey)}
              />
            ))}
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text variant="h3" color={colors.text.primary}>
            Player profile
          </Text>
          <View>
            <Text variant="eyebrow" color={colors.text.secondary} style={styles.label}>
              Experience
            </Text>
            <Tabs
              variant="segmented"
              items={EXPERIENCE_TABS}
              value={form.experience}
              onChange={(k) => update('experience', k as ProfileUser['experience'])}
            />
          </View>
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
                Only teammates and accepted invites can see your profile and stats.
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
                Show stats
              </Text>
              <Text variant="caption" color={colors.text.secondary}>
                Other players see your sport-specific stats on your profile.
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

      <SportPickerSheet
        visible={sportPickerOpen}
        selected={form.sportProfiles.map((s) => s.sportKey)}
        onChange={handleSportsChange}
        onRequestClose={() => setSportPickerOpen(false)}
      />

      {editingSport && editingSportProfile ? (
        <PositionPickerSheet
          visible={!!editingSport}
          sportKey={editingSport}
          selected={[
            editingSportProfile.position,
            ...(editingSportProfile.secondaryPositions ?? []),
          ]}
          onChange={(positions) => handlePositionsChange(editingSport, positions)}
          onRequestClose={() => setEditingSport(null)}
        />
      ) : null}
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  sectionHeaderTitle: {
    flex: 1,
    gap: 2,
  },
  sportRows: {
    gap: spacing.md,
  },
  sportRow: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  sportRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sportRowTitle: {
    flex: 1,
    gap: 2,
  },
  iconBtnGhost: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.chipMuted,
  },
  positionField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface.chipMuted,
    minHeight: 60,
  },
  positionFieldPressed: {
    opacity: 0.85,
  },
  positionFieldBody: {
    flex: 1,
    gap: 6,
  },
  positionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
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
