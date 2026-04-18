import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Clock,
  MapPin,
  Plus,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  AvatarStack,
  Button,
  Card,
  IconBadge,
  ScreenHeader,
  Text,
} from '../../ui';
import {
  TODAYS_DROP_IN,
  TODAYS_LIVE_MATCH,
  WEEK_DAYS,
  type DayCell,
} from '../../mocks/schedule';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

function DayPill({
  day,
  selected,
  onPress,
}: {
  day: DayCell;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[
        dayStyles.pill,
        selected ? dayStyles.pillSelected : dayStyles.pillIdle,
        selected ? shadows.soft : null,
      ]}
    >
      <Text
        variant="eyebrow"
        color={selected ? colors.text.inverse : colors.text.muted}
      >
        {day.weekday}
      </Text>
      <Text
        variant="h2"
        color={selected ? colors.text.inverse : colors.text.primary}
        align="center"
      >
        {day.day}
      </Text>
    </Pressable>
  );
}

function TeamCrest({ abbreviation }: { abbreviation: string }) {
  return (
    <View style={styles.crest}>
      <Text variant="h3" color={colors.brand.primary} align="center">
        {abbreviation}
      </Text>
    </View>
  );
}

function LiveMatchCard({
  onPress,
}: {
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <Card glow style={styles.matchCard}>
        <View style={styles.matchHeaderRow}>
          <Text variant="eyebrow" color={colors.status.live}>
            ● Live Now
          </Text>
          <Text variant="bodySm" color={colors.text.secondary}>
            {TODAYS_LIVE_MATCH.time}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <MapPin size={14} color={colors.text.secondary} strokeWidth={2.25} />
          <Text variant="bodySm" color={colors.text.secondary}>
            {TODAYS_LIVE_MATCH.location}
          </Text>
        </View>
        <Text variant="eyebrow" color={colors.brand.primary}>
          {TODAYS_LIVE_MATCH.league}
        </Text>
        <View style={styles.matchupRow}>
          <View style={styles.teamColumn}>
            <TeamCrest abbreviation={TODAYS_LIVE_MATCH.homeTeam.abbreviation} />
            <Text
              variant="button"
              color={colors.text.primary}
              align="center"
              numberOfLines={2}
            >
              {TODAYS_LIVE_MATCH.homeTeam.name}
            </Text>
          </View>
          <Text variant="h1" color={colors.text.muted}>
            VS
          </Text>
          <View style={styles.teamColumn}>
            <TeamCrest abbreviation={TODAYS_LIVE_MATCH.awayTeam.abbreviation} />
            <Text
              variant="button"
              color={colors.text.primary}
              align="center"
              numberOfLines={2}
            >
              {TODAYS_LIVE_MATCH.awayTeam.name}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

function DropInCard({ onPress }: { onPress: () => void }) {
  const Icon = TODAYS_DROP_IN.Icon;
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.dropInCard}>
        <View style={styles.matchHeaderRow}>
          <View style={styles.metaRow}>
            <Clock size={14} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="button" color={colors.text.primary}>
              {TODAYS_DROP_IN.time}
            </Text>
          </View>
          <Text variant="bodySm" color={colors.text.secondary}>
            {TODAYS_DROP_IN.location}
          </Text>
        </View>
        <Text variant="eyebrow" color={colors.brand.primary}>
          OPEN GYM • COED HOOPS
        </Text>
        <View style={styles.dropInRow}>
          <View style={styles.dropInLeft}>
            <IconBadge size={48}>
              <Icon size={22} color={colors.brand.primary} strokeWidth={2.25} />
            </IconBadge>
            <Text variant="h3" color={colors.text.primary}>
              {TODAYS_DROP_IN.label}
            </Text>
          </View>
          <AvatarStack
            uris={TODAYS_DROP_IN.attendees}
            totalCount={TODAYS_DROP_IN.attendeeTotal}
            size={32}
          />
        </View>
      </Card>
    </Pressable>
  );
}

function NeedMatchCta({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={[...colors.gradient.cta]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.cta, shadows.card]}
      >
        <Text variant="h2" color={colors.text.inverse}>
          Need a Match?
        </Text>
        <Text
          variant="bodySm"
          color={colors.text.inverse}
          style={styles.ctaCopy}
        >
          Book a facility, invite players, and request a ref. Let's get the
          game going.
        </Text>
        <Button
          label="Create Scrimmage"
          variant="soft"
          size="md"
          onPress={onPress}
          leadingIcon={
            <Plus size={16} color={colors.brand.deep} strokeWidth={2.5} />
          }
          style={styles.ctaButton}
        />
      </LinearGradient>
    </Pressable>
  );
}

export function ScheduleScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [selectedDayId, setSelectedDayId] = useState<string>(
    WEEK_DAYS.find((d) => d.isToday)?.id ?? WEEK_DAYS[0]!.id,
  );

  const initials = (user?.name?.charAt(0) ?? 'S').toUpperCase();

  return (
    <View style={styles.root}>
      <ScreenHeader
        initials={initials}
        hasNotifications
        onAvatarPress={() => navigation.navigate('Profile' as never)}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text variant="display" color={colors.brand.primary}>
            Schedule
          </Text>
          <Text
            variant="bodyLg"
            color={colors.text.secondary}
            style={styles.heroSubtitle}
          >
            Your upcoming matches and scrimmages.
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekRow}
        >
          {WEEK_DAYS.map((day) => (
            <DayPill
              key={day.id}
              day={day}
              selected={day.id === selectedDayId}
              onPress={() => setSelectedDayId(day.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.section}>
          <Text variant="h1" color={colors.text.primary}>
            Today's Lineup
          </Text>
          <View style={styles.cardsColumn}>
            <LiveMatchCard
              onPress={() =>
                navigation.navigate('GameDetails', { id: TODAYS_LIVE_MATCH.id })
              }
            />
            <DropInCard
              onPress={() =>
                navigation.navigate('GameDetails', { id: TODAYS_DROP_IN.id })
              }
            />
            <NeedMatchCta
              onPress={() => navigation.navigate('CreateGame')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    gap: spacing.xxl,
  },
  hero: {
    gap: 4,
  },
  heroSubtitle: {
    marginTop: spacing.md,
  },
  weekRow: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  section: {
    gap: spacing.lg,
  },
  cardsColumn: {
    gap: spacing.lg,
  },
  matchCard: {
    gap: spacing.md,
  },
  matchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  teamColumn: {
    alignItems: 'center',
    gap: spacing.sm,
    width: 110,
  },
  crest: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropInCard: {
    gap: spacing.md,
  },
  dropInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropInLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cta: {
    borderRadius: radii.cardLg,
    padding: spacing.xl,
    gap: spacing.md,
    overflow: 'hidden',
  },
  ctaCopy: {
    opacity: 0.9,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
});

const dayStyles = StyleSheet.create({
  pill: {
    width: 56,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pillIdle: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.soft,
  },
  pillSelected: {
    backgroundColor: colors.brand.primary,
  },
});
