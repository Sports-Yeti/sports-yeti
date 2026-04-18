import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  Compass,
  Inbox,
  Mail,
  Plus,
  Settings,
  Trophy,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing, typography } from '../../theme';
import {
  Avatar,
  AvatarStack,
  BottomSheet,
  Button,
  Card,
  Chip,
  EmptyState,
  IconBadge,
  Input,
  Modal,
  ProgressBar,
  SearchBar,
  SectionHeader,
  Skeleton,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function Section({ title, description, children }: SectionProps) {
  return (
    <View style={sectionStyles.section}>
      <View style={sectionStyles.header}>
        <Text variant="h2" color={colors.text.primary}>
          {title}
        </Text>
        {description ? (
          <Text variant="bodySm" color={colors.text.secondary}>
            {description}
          </Text>
        ) : null}
      </View>
      <View style={sectionStyles.body}>{children}</View>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  section: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  body: {
    gap: spacing.lg,
  },
});

export function ComponentShowcaseScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [emailValue, setEmailValue] = useState('valid@example.com');
  const [errorValue, setErrorValue] = useState('');
  const [pwValue, setPwValue] = useState('');
  const [chipSelected, setChipSelected] = useState<string>('basketball');
  const [tabValue, setTabValue] = useState('games');
  const [segmentedValue, setSegmentedValue] = useState('day');
  const [pillValue, setPillValue] = useState('all');
  const [progress, setProgress] = useState(0.65);
  const [modalVisible, setModalVisible] = useState(false);
  const [destructiveVisible, setDestructiveVisible] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.huge,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroBlock}>
          <Text variant="eyebrow" color={colors.brand.primary}>
            DESIGN SYSTEM
          </Text>
          <Text variant="display" color={colors.text.primary}>
            Component
          </Text>
          <Text variant="display" color={colors.brand.primary}>
            showcase.
          </Text>
          <Text
            variant="bodyLg"
            color={colors.text.secondary}
            style={styles.heroSubtitle}
          >
            Every primitive in one place. Use as a reference when handing off to
            Figma or when deciding which component fits a new layout.
          </Text>
        </View>

        {/* Typography */}
        <Section
          title="Typography"
          description="11 variants × 2 font families. Plus Jakarta Sans display, Be Vietnam Pro body."
        >
          <Card>
            <View style={styles.typeStack}>
              {(
                [
                  'display',
                  'displaySm',
                  'h1',
                  'h2',
                  'h3',
                  'bodyLg',
                  'body',
                  'bodySm',
                  'caption',
                  'eyebrow',
                  'button',
                ] as const
              ).map((variant) => {
                const sample = typography[variant];
                return (
                  <View key={variant} style={styles.typeRow}>
                    <Text variant={variant} color={colors.text.primary}>
                      {variant}
                    </Text>
                    <Text variant="caption" color={colors.text.muted}>
                      {sample.fontSize ?? '?'} / {sample.lineHeight ?? '?'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </Section>

        {/* Color tokens */}
        <Section
          title="Colors"
          description="Brand, surface, text, status, gradient. text.muted updated to #6B7785 (4.6:1 AA)."
        >
          <Card>
            <View style={styles.colorGrid}>
              {[
                { name: 'brand.primary', hex: colors.brand.primary },
                { name: 'brand.accent', hex: colors.brand.accent },
                { name: 'brand.deep', hex: colors.brand.deep },
                { name: 'brand.soft', hex: colors.brand.soft },
                { name: 'surface.bg', hex: colors.surface.bg },
                { name: 'surface.card', hex: colors.surface.card },
                { name: 'text.primary', hex: colors.text.primary },
                { name: 'text.secondary', hex: colors.text.secondary },
                { name: 'text.muted', hex: colors.text.muted },
                { name: 'status.live', hex: colors.status.live },
                { name: 'status.success', hex: colors.status.success },
                { name: 'status.warning', hex: colors.status.warning },
                { name: 'status.error', hex: colors.status.error },
              ].map((token) => (
                <View key={token.name} style={styles.colorCell}>
                  <View
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: token.hex },
                    ]}
                  />
                  <View style={styles.colorMeta}>
                    <Text variant="button" color={colors.text.primary}>
                      {token.name}
                    </Text>
                    <Text variant="caption" color={colors.text.muted}>
                      {token.hex.toUpperCase()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </Section>

        {/* Buttons */}
        <Section title="Buttons" description="4 variants × 3 sizes × disabled state.">
          <Card>
            <View style={styles.componentStack}>
              <View style={styles.buttonRow}>
                <Button label="Gradient" onPress={() => undefined} />
                <Button label="Solid" variant="solid" onPress={() => undefined} />
              </View>
              <View style={styles.buttonRow}>
                <Button label="Soft" variant="soft" onPress={() => undefined} />
                <Button label="Ghost" variant="ghost" onPress={() => undefined} />
              </View>
              <View style={styles.buttonRow}>
                <Button label="Small" size="sm" onPress={() => undefined} />
                <Button label="Medium" size="md" onPress={() => undefined} />
                <Button label="Large" size="lg" onPress={() => undefined} />
              </View>
              <Button
                label="Full width with icon"
                fullWidth
                leadingIcon={<Plus size={16} color={colors.text.inverse} strokeWidth={2.5} />}
                onPress={() => undefined}
              />
              <Button
                label="Disabled"
                variant="solid"
                disabled
                onPress={() => undefined}
              />
            </View>
          </Card>
        </Section>

        {/* Inputs */}
        <Section
          title="Inputs"
          description="Token-driven, with label/help/error, password show-hide, multiline."
        >
          <Card>
            <View style={styles.componentStack}>
              <Input
                label="Default"
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="Type something..."
                helpText="Optional helper text"
              />
              <Input
                label="Email"
                variant="email"
                value={emailValue}
                onChangeText={setEmailValue}
                leadingIcon={
                  <Mail size={18} color={colors.text.secondary} strokeWidth={2.25} />
                }
              />
              <Input
                label="Password"
                variant="password"
                value={pwValue}
                onChangeText={setPwValue}
                placeholder="At least 8 characters"
              />
              <Input
                label="With error"
                value={errorValue}
                onChangeText={setErrorValue}
                placeholder="Try leaving blank"
                error="This field is required"
              />
              <Input
                label="Disabled"
                value="Read only"
                onChangeText={() => undefined}
                disabled
              />
              <Input
                label="Multiline"
                variant="multiline"
                value=""
                onChangeText={() => undefined}
                placeholder="Tell us about your last game..."
              />
            </View>
          </Card>
        </Section>

        {/* Search Bar */}
        <Section title="Search Bar" description="With or without filter button.">
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onFilterPress={() => setSheetVisible(true)}
          />
          <SearchBar value={search} onChangeText={setSearch} />
        </Section>

        {/* Chips */}
        <Section
          title="Chips"
          description="Selectable pills used in filter rows. Two sizes."
        >
          <Card>
            <View style={styles.chipRow}>
              {[
                { key: 'allSports', label: 'All Sports' },
                { key: 'basketball', label: 'Basketball' },
                { key: 'soccer', label: 'Soccer' },
                { key: 'volleyball', label: 'Volleyball' },
              ].map((c) => (
                <Chip
                  key={c.key}
                  label={c.label}
                  selected={chipSelected === c.key}
                  onPress={() => setChipSelected(c.key)}
                />
              ))}
            </View>
            <View style={[styles.chipRow, styles.chipRowSmall]}>
              <Chip label="Small" size="sm" />
              <Chip label="Selected" size="sm" selected />
              <Chip label="Static" />
            </View>
          </Card>
        </Section>

        {/* Tags */}
        <Section
          title="Tags"
          description="Smaller, denser, color-coded. Use for status indicators."
        >
          <Card>
            <View style={styles.tagWrap}>
              <Tag label="Live" tone="live" leadingDot />
              <Tag label="Booked" tone="brand" />
              <Tag label="Confirmed" tone="success" leadingDot />
              <Tag label="Pending" tone="warning" />
              <Tag label="Cancelled" tone="neutral" />
              <Tag label="Indoor" tone="info" />
            </View>
            <View style={styles.tagWrap}>
              <Tag label="Small" tone="brand" size="sm" />
              <Tag label="Small live" tone="live" size="sm" leadingDot />
              <Tag label="Small success" tone="success" size="sm" />
            </View>
          </Card>
        </Section>

        {/* Tabs */}
        <Section
          title="Tabs"
          description="3 variants: underline (default), segmented, pill."
        >
          <Card>
            <View style={styles.componentStack}>
              <Tabs
                items={[
                  { key: 'games', label: 'Open Games', badge: '12' },
                  { key: 'slots', label: 'Available Slots' },
                  { key: 'subs', label: 'Sub Requests' },
                ]}
                value={tabValue}
                onChange={setTabValue}
                variant="underline"
                scrollable
              />
              <Tabs
                items={[
                  { key: 'day', label: 'Day' },
                  { key: 'week', label: 'Week' },
                  { key: 'month', label: 'Month' },
                ]}
                value={segmentedValue}
                onChange={setSegmentedValue}
                variant="segmented"
              />
              <Tabs
                items={[
                  { key: 'all', label: 'All' },
                  { key: 'home', label: 'Home' },
                  { key: 'away', label: 'Away' },
                  { key: 'tournaments', label: 'Tournaments' },
                ]}
                value={pillValue}
                onChange={setPillValue}
                variant="pill"
                scrollable
              />
            </View>
          </Card>
        </Section>

        {/* Avatars */}
        <Section title="Avatars" description="Round profile media + stacked group.">
          <Card>
            <View style={styles.componentStack}>
              <View style={styles.avatarRow}>
                <Avatar size={32} initials="MS" />
                <Avatar size={48} initials="JT" />
                <Avatar size={64} initials="AB" />
                <Avatar size={96} initials="OK" bordered />
              </View>
              <AvatarStack
                uris={[
                  'https://i.pravatar.cc/64?img=1',
                  'https://i.pravatar.cc/64?img=2',
                  'https://i.pravatar.cc/64?img=3',
                  'https://i.pravatar.cc/64?img=4',
                ]}
                totalCount={12}
                size={40}
              />
            </View>
          </Card>
        </Section>

        {/* Icon Badges */}
        <Section
          title="Icon Badges"
          description="Decorative containers. Two tones."
        >
          <Card>
            <View style={styles.iconRow}>
              <IconBadge>
                <Compass size={22} color={colors.brand.primary} strokeWidth={2.25} />
              </IconBadge>
              <IconBadge tone="brand">
                <Trophy size={22} color={colors.brand.deep} strokeWidth={2.25} />
              </IconBadge>
              <IconBadge size={64}>
                <Bell size={28} color={colors.brand.primary} strokeWidth={2.25} />
              </IconBadge>
              <IconBadge size={64} tone="brand">
                <Settings size={28} color={colors.brand.deep} strokeWidth={2.25} />
              </IconBadge>
            </View>
          </Card>
        </Section>

        {/* Progress */}
        <Section
          title="Progress"
          description="Determinate (with label) and indeterminate."
        >
          <Card>
            <View style={styles.componentStack}>
              <ProgressBar value={progress} showLabel />
              <ProgressBar value={progress} tone="success" />
              <ProgressBar value={0.95} tone="warning" />
              <ProgressBar value={1} tone="error" />
              <ProgressBar variant="indeterminate" />
              <View style={styles.buttonRow}>
                <Button
                  label="-"
                  size="sm"
                  variant="soft"
                  onPress={() => setProgress((p) => Math.max(0, p - 0.1))}
                />
                <Button
                  label="+"
                  size="sm"
                  variant="soft"
                  onPress={() => setProgress((p) => Math.min(1, p + 0.1))}
                />
              </View>
            </View>
          </Card>
        </Section>

        {/* Skeletons */}
        <Section title="Skeletons" description="Loading placeholders that respect reduceMotion.">
          <Card>
            <View style={styles.componentStack}>
              <View style={styles.skelRow}>
                <Skeleton variant="circle" width={48} height={48} />
                <View style={styles.skelStack}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="50%" />
                </View>
              </View>
              <Skeleton height={120} radius="lg" />
              <View style={styles.skelTwoCol}>
                <Skeleton height={80} radius="md" />
                <Skeleton height={80} radius="md" />
              </View>
            </View>
          </Card>
        </Section>

        {/* Cards & SectionHeader */}
        <Section title="Cards & Headers">
          <SectionHeader
            title="Today's Lineup"
            actionLabel="See all"
            onActionPress={() => undefined}
          />
          <Card glow>
            <Text variant="h2" color={colors.text.primary}>
              Featured event card
            </Text>
            <Text
              variant="body"
              color={colors.text.secondary}
              style={styles.spacedText}
            >
              Cards have <Text variant="button" color={colors.brand.primary}>glow</Text> + <Text variant="button" color={colors.brand.primary}>padded</Text> + <Text variant="button" color={colors.brand.primary}>radius</Text> options.
            </Text>
            <View style={[styles.buttonRow, styles.spacedRow]}>
              <Tag label="Live" tone="live" leadingDot />
              <Tag label="Indoor" tone="info" />
            </View>
          </Card>
        </Section>

        {/* Toast / Modal / Sheet triggers */}
        <Section
          title="Overlays"
          description="Toast (non-blocking), Modal (blocking), BottomSheet (pickers)."
        >
          <Card>
            <View style={styles.componentStack}>
              <Button
                label="Show success toast"
                variant="soft"
                onPress={() =>
                  toast.show({
                    variant: 'success',
                    title: 'You joined the game',
                    description: 'See you Saturday at 8pm.',
                  })
                }
              />
              <Button
                label="Show info toast with action"
                variant="soft"
                onPress={() =>
                  toast.show({
                    variant: 'info',
                    title: 'New chat message',
                    description: 'Maria · "On my way!"',
                    action: {
                      label: 'Open',
                      onPress: () => undefined,
                    },
                  })
                }
              />
              <Button
                label="Show warning toast"
                variant="soft"
                onPress={() =>
                  toast.show({
                    variant: 'warning',
                    title: "You're offline",
                    description: 'Changes will sync when you reconnect.',
                  })
                }
              />
              <Button
                label="Show error toast"
                variant="soft"
                onPress={() =>
                  toast.show({
                    variant: 'error',
                    title: 'Could not join game',
                    description: 'Network error.',
                    action: {
                      label: 'Retry',
                      onPress: () => undefined,
                    },
                  })
                }
              />
              <Button
                label="Open info modal"
                variant="solid"
                onPress={() => setModalVisible(true)}
              />
              <Button
                label="Open destructive modal"
                variant="solid"
                onPress={() => setDestructiveVisible(true)}
              />
              <Button
                label="Open bottom sheet"
                variant="gradient"
                onPress={() => setSheetVisible(true)}
              />
            </View>
          </Card>
        </Section>

        {/* EmptyState */}
        <Section title="Empty States">
          <Card>
            <EmptyState
              icon={
                <Inbox size={28} color={colors.brand.primary} strokeWidth={2.25} />
              }
              title="No messages yet"
              description="When teammates send you a note, it'll show up here."
              primaryAction={{
                label: 'Find teammates',
                onPress: () => undefined,
              }}
              secondaryAction={{
                label: 'Browse leagues',
                onPress: () => undefined,
              }}
            />
          </Card>
        </Section>
      </ScrollView>

      {/* Overlays */}
      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        variant="info"
        title="Heads up"
        description="This is an informational modal. Use it for confirmations and one-time alerts."
        primaryAction={{
          label: 'Got it',
          onPress: () => setModalVisible(false),
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setModalVisible(false),
        }}
      />

      <Modal
        visible={destructiveVisible}
        onRequestClose={() => setDestructiveVisible(false)}
        variant="destructive"
        title="Leave team?"
        description="You'll lose access to team chat, schedule, and stats. This can't be undone."
        primaryAction={{
          label: 'Leave team',
          onPress: () => setDestructiveVisible(false),
        }}
        secondaryAction={{
          label: 'Keep me in',
          onPress: () => setDestructiveVisible(false),
        }}
      />

      <BottomSheet
        visible={sheetVisible}
        onRequestClose={() => setSheetVisible(false)}
        title="Filter games"
        snapPoints={['55%']}
      >
        <View style={styles.sheetBody}>
          <Text variant="eyebrow" color={colors.text.muted}>
            SPORT
          </Text>
          <View style={styles.chipRow}>
            <Chip label="Basketball" selected />
            <Chip label="Soccer" />
            <Chip label="Volleyball" />
            <Chip label="Football" />
          </View>
          <Text variant="eyebrow" color={colors.text.muted}>
            DISTANCE
          </Text>
          <ProgressBar value={0.4} showLabel />
          <Text variant="eyebrow" color={colors.text.muted}>
            SKILL
          </Text>
          <View style={styles.chipRow}>
            <Chip label="All levels" selected />
            <Chip label="Beginner" />
            <Chip label="Intermediate" />
            <Chip label="Advanced" />
          </View>
          <Button
            label="Apply"
            variant="gradient"
            fullWidth
            onPress={() => setSheetVisible(false)}
          />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xxxl,
  },
  heroBlock: {
    gap: 4,
  },
  heroSubtitle: {
    marginTop: spacing.md,
  },
  componentStack: {
    gap: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  spacedRow: {
    marginTop: spacing.md,
  },
  spacedText: {
    marginTop: spacing.sm,
  },
  typeStack: {
    gap: spacing.md,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  colorCell: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.soft,
    ...shadows.soft,
  },
  colorMeta: {
    flex: 1,
    gap: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chipRowSmall: {
    marginTop: spacing.md,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  skelRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  skelStack: {
    flex: 1,
    gap: spacing.sm,
  },
  skelTwoCol: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  sheetBody: {
    gap: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
