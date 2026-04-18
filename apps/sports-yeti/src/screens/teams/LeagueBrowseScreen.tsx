import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Trophy, Users } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  BottomSheet,
  Button,
  Card,
  EmptyState,
  IconBadge,
  Input,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import { OPEN_LEAGUES, type OpenLeague } from '../../mocks/teams';
import { formatCurrency } from '../../lib/format';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const SPORT_FILTERS = [
  { key: 'all', label: 'All sports' },
  { key: 'soccer', label: 'Soccer' },
  { key: 'basketball', label: 'Basketball' },
  { key: 'volleyball', label: 'Volleyball' },
  { key: 'hockey', label: 'Hockey' },
];

function LeagueCard({
  league,
  onApply,
}: {
  league: OpenLeague;
  onApply: () => void;
}) {
  const Icon = league.Icon;
  const spotsLeft = league.maxTeams - league.registeredTeams;
  return (
    <Card style={styles.card}>
      <View style={styles.cardHead}>
        <IconBadge size={48} tone="brand">
          <Icon size={22} color={colors.brand.deep} strokeWidth={2.25} />
        </IconBadge>
        <View style={styles.cardHeadBody}>
          <Text variant="h3" color={colors.text.primary}>
            {league.name}
          </Text>
          <Text variant="bodySm" color={colors.text.secondary}>
            {league.sport} · {league.city}
          </Text>
        </View>
      </View>

      <Text variant="body" color={colors.text.primary}>
        {league.description}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text variant="caption" color={colors.text.secondary}>
            STARTS
          </Text>
          <Text variant="button" color={colors.text.primary}>
            {league.startDate.replace('Starts ', '')}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text variant="caption" color={colors.text.secondary}>
            REGISTRATION
          </Text>
          <Text variant="button" color={colors.text.primary}>
            {league.registrationCloses.replace('Closes ', '')}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text variant="caption" color={colors.text.secondary}>
            FEE
          </Text>
          <Text variant="button" color={colors.brand.primary}>
            {league.feeCents === 0 ? 'Free' : formatCurrency(league.feeCents)}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Tag
          tone={league.spotsTone}
          leadingDot
          size="sm"
          label={`${spotsLeft} of ${league.maxTeams} team spots left`}
        />
        <Button
          label="Register team"
          variant="gradient"
          size="sm"
          onPress={onApply}
        />
      </View>
    </Card>
  );
}

export function LeagueBrowseScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [sport, setSport] = useState('all');
  const [pendingLeague, setPendingLeague] = useState<OpenLeague | null>(null);
  const [teamName, setTeamName] = useState('');
  const [rosterSize, setRosterSize] = useState('8');
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(
    () =>
      sport === 'all'
        ? OPEN_LEAGUES
        : OPEN_LEAGUES.filter((l) => l.sportKey === sport),
    [sport],
  );

  const teamNameError =
    teamName.length > 0 && teamName.trim().length < 3
      ? 'Team name must be at least 3 characters.'
      : undefined;
  const rosterError =
    rosterSize.length > 0 && (Number(rosterSize) < 2 || Number(rosterSize) > 30)
      ? 'Roster must be 2-30 players.'
      : undefined;
  const canSubmit =
    !!pendingLeague &&
    teamName.trim().length >= 3 &&
    !rosterError &&
    Number(rosterSize) >= 2;

  const perPlayer =
    pendingLeague && Number(rosterSize) > 0
      ? Math.round(pendingLeague.feeCents / Number(rosterSize))
      : 0;

  const handleSubmit = () => {
    if (!pendingLeague || !canSubmit) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const name = teamName.trim();
      setPendingLeague(null);
      setTeamName('');
      toast.show({
        variant: 'success',
        title: `Application submitted`,
        description: `${name} is pending admin review (~24h).`,
        action: {
          label: 'View',
          onPress: () =>
            navigation.navigate('TeamDetails', { id: 'avalanche-fc' }),
        },
      });
    }, 700);
  };

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
        </Pressable>
        <Text variant="h2" color={colors.text.primary}>
          Open Leagues
        </Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.filterBlock}>
        <Tabs
          variant="pill"
          scrollable
          items={SPORT_FILTERS}
          value={sport}
          onChange={setSport}
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Trophy size={28} color={colors.brand.primary} strokeWidth={2.25} />}
            title="No leagues"
            description="Nothing open in this sport yet — we'll notify you when one launches."
            primaryAction={{
              label: 'Notify me',
              onPress: () =>
                toast.show({ variant: 'success', title: "We'll let you know" }),
            }}
          />
        ) : (
          filtered.map((l) => (
            <LeagueCard
              key={l.id}
              league={l}
              onApply={() => {
                setPendingLeague(l);
                setTeamName('');
                setRosterSize('8');
              }}
            />
          ))
        )}
      </ScrollView>

      <BottomSheet
        visible={!!pendingLeague}
        onRequestClose={() => setPendingLeague(null)}
        title={`Register for ${pendingLeague?.name ?? ''}`}
        snapPoints={['72%']}
      >
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Team name"
            placeholder="Avalanche FC"
            value={teamName}
            onChangeText={setTeamName}
            maxLength={40}
            error={teamNameError}
          />
          <Input
            label="Roster size"
            placeholder="8"
            variant="number"
            value={rosterSize}
            onChangeText={setRosterSize}
            error={rosterError}
            helpText="Players you plan to bring (2-30)."
          />

          {pendingLeague ? (
            <Card style={styles.feeCard}>
              <View style={styles.feeRow}>
                <Text variant="body" color={colors.text.secondary}>
                  Registration fee
                </Text>
                <Text variant="button" color={colors.text.primary}>
                  {formatCurrency(pendingLeague.feeCents)}
                </Text>
              </View>
              <View style={styles.feeRow}>
                <Text variant="body" color={colors.text.secondary}>
                  Per player ({rosterSize || '0'})
                </Text>
                <Text variant="button" color={colors.brand.primary}>
                  {formatCurrency(perPlayer)}
                </Text>
              </View>
              <Text variant="caption" color={colors.text.secondary}>
                Estimate. Actual per-player share recalculates from your final
                roster after admin approves.
              </Text>
            </Card>
          ) : null}

          <View style={styles.actions}>
            <Button
              label="Cancel"
              variant="ghost"
              fullWidth
              onPress={() => setPendingLeague(null)}
              disabled={submitting}
            />
            <Button
              label={submitting ? 'Submitting…' : 'Submit'}
              variant="gradient"
              fullWidth
              onPress={handleSubmit}
              disabled={!canSubmit || submitting}
            />
          </View>
        </ScrollView>
      </BottomSheet>
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
  filterBlock: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    gap: spacing.md,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardHeadBody: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface.bg,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  metaItem: {
    flex: 1,
    gap: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  sheetContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  feeCard: {
    gap: spacing.sm,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
