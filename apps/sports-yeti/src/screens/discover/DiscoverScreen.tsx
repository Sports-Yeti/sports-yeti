import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronRight,
  Clock,
  MessageCircle,
  Play,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Avatar,
  BottomSheet,
  Button,
  Card,
  Chip,
  FilterPill,
  OptionListSheet,
  SearchHeader,
  SectionHeader,
  SportCombobox,
  type SportComboboxOption,
  SportMultiSelectSheet,
  Tag,
  Text,
} from '../../ui';
import {
  PROFILE_USER,
  SPORTS_META,
  SPORT_META_BY_KEY,
} from '../../mocks/profile';
import {
  NEWS_CATEGORY_LABEL,
  NEWS_CONTENT_TYPE_LABEL,
  leaguePromosForSports,
  mvpPostsForSports,
  sportsNewsForSports,
  type LeaguePromo,
  type MvpPost,
  type NewsCategory,
  type NewsContentType,
  type SportsNewsItem,
} from '../../mocks/news';
import { useNewsComments } from '../../features/news-comments-store';
import { OPEN_LEAGUES, type SportKey } from '../../mocks/teams';
import { DISCOVER_CAMPS } from '../../mocks/camps';
import { DISCOVER_TOURNAMENTS } from '../../mocks/tournaments';
import { HIGHLIGHT_REELS } from '../../mocks/highlights';
import { useDiscoverGames } from '../../features/discover-store';
import { useAllSquads } from '../../features/created-squads-store';
import { useTeamMembershipStore } from '../../features/team-membership-store';
import { EventCard } from '../../components/EventCard';
import { CampCard } from '../../components/CampCard';
import { DiscoverLeagueCard } from '../../components/DiscoverLeagueCard';
import { SquadCard } from '../../components/SquadCard';
import { TournamentCard } from '../../components/TournamentCard';
import { HighlightCard } from '../../components/HighlightCard';
import type { JoinContentType } from '../join/JoinScreen';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

interface NewsFilters {
  search: string;
  /** When true, restrict to the user's sports and ignore `sports`. */
  forYou: boolean;
  /** Explicit sport selection (used only when `forYou` is false). Empty = all. */
  sports: Set<SportKey>;
  /** Which content streams to show. Empty = all three. */
  types: Set<NewsContentType>;
  /** Story category filter (applies to stories only). Empty = all. */
  categories: Set<NewsCategory>;
}

function initialFilters(): NewsFilters {
  return {
    search: '',
    forYou: true,
    sports: new Set<SportKey>(),
    types: new Set<NewsContentType>(),
    categories: new Set<NewsCategory>(),
  };
}

const CONTENT_TYPES = Object.keys(NEWS_CONTENT_TYPE_LABEL) as NewsContentType[];
const CATEGORIES = Object.keys(NEWS_CATEGORY_LABEL) as NewsCategory[];
// Reuse the games `SportCombobox` over the canonical News sport set so the
// sports filter matches Discover's searchable multi-select UX (and supports
// hockey, which the games catalog buckets do not).
const SPORT_OPTIONS: SportComboboxOption[] = SPORTS_META.map((m) => ({
  key: m.key,
  label: m.label,
  Icon: m.Icon,
  aliases: [m.short.toLowerCase()],
}));

/** Compact poster width for the highlights rail. */
const HIGHLIGHT_CARD_WIDTH = 200;

/** Snap-scrolling horizontal rail used by every Discover feed section. */
function Rail({
  itemWidth,
  children,
}: {
  itemWidth: number;
  children: React.ReactNode;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={itemWidth + spacing.md}
      snapToAlignment="start"
      contentContainerStyle={styles.rail}
    >
      {children}
    </ScrollView>
  );
}

export function DiscoverScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useAuthStore();

  const initials = (user?.name?.charAt(0) ?? 'S').toUpperCase();
  const userSportKeys = useMemo(
    () => PROFILE_USER.sportProfiles.map((sp) => sp.sportKey),
    [],
  );

  const [filters, setFilters] = useState<NewsFilters>(initialFilters);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sportSheetOpen, setSportSheetOpen] = useState(false);
  const [typeSheetOpen, setTypeSheetOpen] = useState(false);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);

  const activeSports: SportKey[] = filters.forYou
    ? userSportKeys
    : [...filters.sports];
  const query = filters.search.trim().toLowerCase();
  const matchesQuery = (text: string) =>
    query === '' || text.toLowerCase().includes(query);
  const showType = (t: NewsContentType) =>
    filters.types.size === 0 || filters.types.has(t);

  const stories = showType('story')
    ? sportsNewsForSports(activeSports).filter(
        (s) =>
          (filters.categories.size === 0 ||
            filters.categories.has(s.category)) &&
          matchesQuery(
            `${s.headline} ${s.summary} ${s.source} ${s.tags.join(' ')}`,
          ),
      )
    : [];
  const mvps = showType('mvp')
    ? mvpPostsForSports(activeSports).filter((m) =>
        matchesQuery(
          `${m.playerName} ${m.teamName} ${m.leagueName} ${m.award} ${m.blurb} ${m.gameLabel}`,
        ),
      )
    : [];
  const promos = showType('promo')
    ? leaguePromosForSports(activeSports).filter((p) =>
        matchesQuery(`${p.title} ${p.blurb} ${p.kicker} ${p.highlight}`),
      )
    : [];

  const resultCount = stories.length + mvps.length + promos.length;

  // ---- Discover feed rails ----------------------------------------------
  // Each card renders full width internally, so wrap it in a fixed-width View
  // and leave a peek of the next card to signal the rail scrolls.
  const RAIL_PEEK = spacing.xxl * 2.5;
  const railCardWidth = width - spacing.lg * 2 - RAIL_PEEK;

  const allGames = useDiscoverGames();
  const allSquads = useAllSquads();
  const membershipOverrides = useTeamMembershipStore((s) => s.overrides);

  // Recommended games — featured first, then any open game, capped at six.
  const recommendedGames = useMemo(() => {
    const featured = allGames.filter((g) => g.featured);
    const open = allGames.filter((g) => !g.featured && g.openStatus === 'open');
    return [...featured, ...open].slice(0, 6);
  }, [allGames]);

  // Upcoming tournaments — open registrations, soonest first, sport-filtered
  // to match the feed.
  const upcomingTournaments = useMemo(() => {
    const sportsFilter = filters.forYou ? userSportKeys : [...filters.sports];
    return DISCOVER_TOURNAMENTS.filter(
      (t) =>
        t.status === 'open' &&
        (sportsFilter.length === 0 || sportsFilter.includes(t.sportKey)),
    )
      .slice()
      .sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      )
      .slice(0, 6);
  }, [filters.forYou, filters.sports, userSportKeys]);

  // Recommended teams — joinable squads (spots left, not already on) matching
  // the active sports, so the rail feels personalized like the rest of the feed.
  const recommendedTeams = useMemo(() => {
    const sportsFilter = filters.forYou ? userSportKeys : [...filters.sports];
    return allSquads
      .map((s) => {
        const override = membershipOverrides[s.id];
        return override ? { ...s, membership: override } : s;
      })
      .filter(
        (s) =>
          s.rosterCount < s.rosterMax &&
          s.membership !== 'member' &&
          s.membership !== 'captain' &&
          (sportsFilter.length === 0 || sportsFilter.includes(s.sportKey)),
      )
      .slice(0, 6);
  }, [allSquads, membershipOverrides, filters.forYou, filters.sports, userSportKeys]);

  // Upcoming league seasons — open leagues, sport-filtered to match the feed.
  const upcomingLeagues = useMemo(() => {
    const sportsFilter = filters.forYou ? userSportKeys : [...filters.sports];
    return OPEN_LEAGUES.filter(
      (l) => sportsFilter.length === 0 || sportsFilter.includes(l.sportKey),
    ).slice(0, 6);
  }, [filters.forYou, filters.sports, userSportKeys]);

  // Upcoming camps — open registrations, soonest first.
  const upcomingCamps = useMemo(
    () =>
      DISCOVER_CAMPS.filter((c) => c.status === 'open')
        .slice()
        .sort(
          (a, b) =>
            new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
        )
        .slice(0, 6),
    [],
  );

  const goToJoin = (content: JoinContentType) =>
    navigation.navigate('MainTabs', { screen: 'Join', params: { content } });

  const openHighlights = (focusReelId?: string) =>
    navigation.navigate('MainTabs', {
      screen: 'Highlights',
      params: focusReelId ? { focusReelId } : undefined,
    });

  const isDefault =
    filters.search === '' &&
    filters.forYou &&
    filters.sports.size === 0 &&
    filters.types.size === 0 &&
    filters.categories.size === 0;

  const toggleSport = (k: SportKey) =>
    setFilters((p) => {
      const next = new Set(p.sports);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return { ...p, forYou: false, sports: next };
    });
  const toggleType = (t: NewsContentType) =>
    setFilters((p) => {
      const next = new Set(p.types);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return { ...p, types: next };
    });
  const toggleCategory = (c: NewsCategory) =>
    setFilters((p) => {
      const next = new Set(p.categories);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return { ...p, categories: next };
    });
  const setForYou = () =>
    setFilters((p) => ({ ...p, forYou: true, sports: new Set<SportKey>() }));
  const setAllSports = () =>
    setFilters((p) => ({ ...p, forYou: false, sports: new Set<SportKey>() }));
  // Sport sheet apply: an empty selection reverts to the personalized "For You"
  // stream; any explicit pick switches to that sport set.
  const applySports = (next: Set<string>) =>
    setFilters((p) =>
      next.size === 0
        ? { ...p, forYou: true, sports: new Set<SportKey>() }
        : { ...p, forYou: false, sports: next as Set<SportKey> },
    );

  const firstType = [...filters.types][0];
  const typeLabel =
    filters.types.size === 0
      ? 'All'
      : filters.types.size === 1 && firstType
      ? NEWS_CONTENT_TYPE_LABEL[firstType]
      : `${filters.types.size} types`;
  const firstCategory = [...filters.categories][0];
  const categoryLabel =
    filters.categories.size === 0
      ? 'All'
      : filters.categories.size === 1 && firstCategory
      ? NEWS_CATEGORY_LABEL[firstCategory]
      : `${filters.categories.size} categories`;

  const openLeague = (leagueId: string) =>
    navigation.navigate('LeagueDetails', { leagueId });

  return (
    <View style={styles.root}>
      <SearchHeader
        initials={initials}
        hasNotifications
        searchValue={filters.search}
        onSearchChange={(v) => setFilters((p) => ({ ...p, search: v }))}
        searchPlaceholder="Search stories, players, leagues…"
        onFilterPress={() => setSheetOpen(true)}
        onAvatarPress={() => navigation.navigate('Profile' as never)}
        onBellPress={() => navigation.navigate('Notifications')}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.pillRow}
        >
          {filters.forYou || filters.sports.size === 0 ? (
            <FilterPill
              label={`Sports · ${filters.forYou ? 'For You' : 'All'}`}
              onPress={() => setSportSheetOpen(true)}
            />
          ) : (
            [...filters.sports].map((k) => (
              <FilterPill
                key={k}
                label={SPORT_META_BY_KEY[k].short}
                onPress={() => setSportSheetOpen(true)}
                onClose={() => toggleSport(k)}
                accessibilityLabel={`${SPORT_META_BY_KEY[k].label} filter`}
              />
            ))
          )}
          <FilterPill
            label={`Show · ${typeLabel}`}
            onPress={() => setTypeSheetOpen(true)}
          />
          {showType('story') ? (
            <FilterPill
              label={`Category · ${categoryLabel}`}
              onPress={() => setCategorySheetOpen(true)}
            />
          ) : null}
          {!isDefault ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear all filters"
              hitSlop={8}
              onPress={() => setFilters(initialFilters)}
              style={styles.clearBtn}
            >
              <Text variant="caption" color={colors.text.secondary}>
                Clear
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>

        <View style={styles.section}>
          <SectionHeader
            title="Highlights"
            actionLabel="View all"
            onActionPress={() => openHighlights()}
          />
          <Rail itemWidth={HIGHLIGHT_CARD_WIDTH}>
            {HIGHLIGHT_REELS.map((reel) => (
              <HighlightCard
                key={reel.id}
                reel={reel}
                width={HIGHLIGHT_CARD_WIDTH}
                onPress={() => openHighlights(reel.id)}
              />
            ))}
          </Rail>
        </View>

        {promos.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title="League announcements"
              actionLabel="See all"
              onActionPress={() => goToJoin('leagues')}
            />
            <Rail itemWidth={railCardWidth}>
              {promos.map((promo) => (
                <View key={promo.id} style={{ width: railCardWidth }}>
                  <FeaturedPromo
                    promo={promo}
                    onPress={() => openLeague(promo.leagueId)}
                  />
                </View>
              ))}
            </Rail>
          </View>
        ) : null}

        {recommendedGames.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title="Recommended games"
              actionLabel="See all"
              onActionPress={() => goToJoin('games')}
            />
            <Rail itemWidth={railCardWidth}>
              {recommendedGames.map((game) => (
                <View key={game.id} style={{ width: railCardWidth }}>
                  <EventCard
                    game={game}
                    onPress={() =>
                      navigation.navigate('GameDetails', { id: game.id })
                    }
                    onJoinPress={() =>
                      navigation.navigate('GameDetails', { id: game.id })
                    }
                  />
                </View>
              ))}
            </Rail>
          </View>
        ) : null}

        {upcomingTournaments.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title="Upcoming tournaments"
              actionLabel="See all"
              onActionPress={() => goToJoin('tournaments')}
            />
            <Rail itemWidth={railCardWidth}>
              {upcomingTournaments.map((tournament) => (
                <View key={tournament.id} style={{ width: railCardWidth }}>
                  <TournamentCard
                    tournament={tournament}
                    onPress={() =>
                      navigation.navigate('TournamentDetails', {
                        id: tournament.id,
                      })
                    }
                  />
                </View>
              ))}
            </Rail>
          </View>
        ) : null}

        {recommendedTeams.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title="Recommended teams"
              actionLabel="See all"
              onActionPress={() => goToJoin('teams')}
            />
            <Rail itemWidth={railCardWidth}>
              {recommendedTeams.map((squad) => (
                <View key={squad.id} style={{ width: railCardWidth }}>
                  <SquadCard
                    squad={squad}
                    variant="discover"
                    onPress={() =>
                      navigation.navigate('TeamDetails', { id: squad.id })
                    }
                    onApply={() =>
                      navigation.navigate('TeamDetails', { id: squad.id })
                    }
                  />
                </View>
              ))}
            </Rail>
          </View>
        ) : null}

        {upcomingLeagues.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title="Upcoming league seasons"
              actionLabel="See all"
              onActionPress={() => goToJoin('leagues')}
            />
            <Rail itemWidth={railCardWidth}>
              {upcomingLeagues.map((league) => (
                <View key={league.id} style={{ width: railCardWidth }}>
                  <DiscoverLeagueCard
                    league={league}
                    onPress={() =>
                      navigation.navigate('LeagueDetails', {
                        leagueId: league.id,
                      })
                    }
                  />
                </View>
              ))}
            </Rail>
          </View>
        ) : null}

        {upcomingCamps.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title="Upcoming camps"
              actionLabel="See all"
              onActionPress={() => goToJoin('camps')}
            />
            <Rail itemWidth={railCardWidth}>
              {upcomingCamps.map((camp) => (
                <View key={camp.id} style={{ width: railCardWidth }}>
                  <CampCard
                    camp={camp}
                    onPress={() =>
                      navigation.navigate('CampDetails', { id: camp.id })
                    }
                    onRegisterPress={() =>
                      navigation.navigate('CampDetails', { id: camp.id })
                    }
                  />
                </View>
              ))}
            </Rail>
          </View>
        ) : null}

        {mvps.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="MVP Moments" />
            <View style={styles.cardsColumn}>
              {mvps.map((post) => (
                <MvpCard
                  key={post.id}
                  post={post}
                  onPlay={() =>
                    post.media.kind === 'video'
                      ? navigation.navigate('HighlightDetail', {
                          id: post.media.highlightId,
                        })
                      : post.leagueId
                      ? openLeague(post.leagueId)
                      : undefined
                  }
                  onPlayerPress={() =>
                    post.playerId
                      ? navigation.navigate('PlayerProfile', {
                          playerId: post.playerId,
                        })
                      : undefined
                  }
                />
              ))}
            </View>
          </View>
        ) : null}

        {stories.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Top stories" />
            <View style={styles.cardsColumn}>
              {stories.map((item) => (
                <StoryCard
                  key={item.id}
                  item={item}
                  onPress={() =>
                    navigation.navigate('NewsArticle', { articleId: item.id })
                  }
                />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <BottomSheet
        visible={sheetOpen}
        onRequestClose={() => setSheetOpen(false)}
        title="Filter news"
        snapPoints={['78%']}
      >
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sheetGroup}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Show me
            </Text>
            <View style={styles.chipWrap}>
              <Chip
                label="Everything"
                size="sm"
                selected={filters.types.size === 0}
                onPress={() =>
                  setFilters((p) => ({ ...p, types: new Set<NewsContentType>() }))
                }
              />
              {CONTENT_TYPES.map((t) => (
                <Chip
                  key={t}
                  label={NEWS_CONTENT_TYPE_LABEL[t]}
                  size="sm"
                  selected={filters.types.has(t)}
                  onPress={() => toggleType(t)}
                />
              ))}
            </View>
          </View>

          <View style={styles.sheetGroup}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Sports
            </Text>
            <View style={styles.chipWrap}>
              <Chip
                label="For You"
                size="sm"
                selected={filters.forYou}
                onPress={setForYou}
              />
              <Chip
                label="All sports"
                size="sm"
                selected={!filters.forYou && filters.sports.size === 0}
                onPress={setAllSports}
              />
            </View>
            <SportCombobox
              options={SPORT_OPTIONS}
              value={filters.sports}
              onChange={(next) =>
                setFilters((p) => ({
                  ...p,
                  forYou: false,
                  sports: next as Set<SportKey>,
                }))
              }
              scrollResults={false}
              placeholder="Search a sport to add…"
            />
          </View>

          <View style={styles.sheetGroup}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Story category
            </Text>
            <View style={styles.chipWrap}>
              <Chip
                label="All"
                size="sm"
                selected={filters.categories.size === 0}
                onPress={() =>
                  setFilters((p) => ({
                    ...p,
                    categories: new Set<NewsCategory>(),
                  }))
                }
              />
              {CATEGORIES.map((c) => (
                <Chip
                  key={c}
                  label={NEWS_CATEGORY_LABEL[c]}
                  size="sm"
                  selected={filters.categories.has(c)}
                  onPress={() => toggleCategory(c)}
                />
              ))}
            </View>
            <Text variant="caption" color={colors.text.muted}>
              Category applies to stories only.
            </Text>
          </View>

          <View style={styles.sheetActions}>
            <Button
              label="Reset"
              variant="ghost"
              fullWidth
              onPress={() => setFilters(initialFilters)}
            />
            <Button
              label={
                resultCount === 0
                  ? 'No matches'
                  : `Show ${resultCount} result${resultCount === 1 ? '' : 's'}`
              }
              variant="gradient"
              fullWidth
              onPress={() => setSheetOpen(false)}
            />
          </View>
        </ScrollView>
      </BottomSheet>

      {/* ---------- Per-pill option sheets ---------- */}
      <SportMultiSelectSheet
        visible={sportSheetOpen}
        onRequestClose={() => setSportSheetOpen(false)}
        value={filters.sports}
        onApply={applySports}
        options={SPORT_OPTIONS}
      />

      <OptionListSheet
        visible={typeSheetOpen}
        onRequestClose={() => setTypeSheetOpen(false)}
        title="Show"
        multiple
        options={CONTENT_TYPES.map((t) => ({
          key: t,
          label: NEWS_CONTENT_TYPE_LABEL[t],
        }))}
        selectedKeys={filters.types}
        onApply={(types) =>
          setFilters((p) => ({ ...p, types: types as Set<NewsContentType> }))
        }
      />

      <OptionListSheet
        visible={categorySheetOpen}
        onRequestClose={() => setCategorySheetOpen(false)}
        title="Story category"
        multiple
        options={CATEGORIES.map((c) => ({
          key: c,
          label: NEWS_CATEGORY_LABEL[c],
        }))}
        selectedKeys={filters.categories}
        onApply={(categories) =>
          setFilters((p) => ({
            ...p,
            categories: categories as Set<NewsCategory>,
          }))
        }
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Featured league promo — immersive image card with a gradient scrim.
// ---------------------------------------------------------------------------

function FeaturedPromo({
  promo,
  onPress,
}: {
  promo: LeaguePromo;
  onPress: () => void;
}) {
  const Icon = promo.Icon;
  const sportLabel = SPORT_META_BY_KEY[promo.sportKey].label;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${promo.title}. ${promo.kicker}. ${promo.highlight}`}
      accessibilityHint="Opens the league details"
      onPress={onPress}
      style={({ pressed }) => [
        styles.featured,
        shadows.card,
        { opacity: pressed ? 0.96 : 1 },
      ]}
    >
      <Image
        source={{ uri: promo.imageUrl }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
        accessibilityLabel={`${sportLabel} league`}
      />
      <LinearGradient
        colors={['rgba(12,74,110,0.05)', 'rgba(8,40,60,0.55)', 'rgba(8,32,48,0.92)']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.featuredTop}>
        <View
          style={[
            styles.kickerPill,
            promo.tone === 'warning' ? styles.kickerWarn : styles.kickerBrand,
          ]}
        >
          <Icon size={13} color={colors.text.inverse} strokeWidth={2.5} />
          <Text variant="eyebrow" color={colors.text.inverse}>
            {promo.kicker}
          </Text>
        </View>
        <Tag tone="neutral" size="sm" label={sportLabel} style={styles.featuredSport} />
      </View>
      <View style={styles.featuredBody}>
        <Text variant="h1" color={colors.text.inverse}>
          {promo.title}
        </Text>
        <Text
          variant="bodySm"
          color="rgba(255,255,255,0.88)"
          numberOfLines={2}
        >
          {promo.blurb}
        </Text>
        <View style={styles.featuredFooter}>
          <Text variant="caption" color="rgba(255,255,255,0.92)">
            {promo.highlight}
          </Text>
          <View style={styles.featuredCta}>
            <Text variant="button" color={colors.brand.deep}>
              {promo.ctaLabel}
            </Text>
            <ChevronRight
              size={16}
              color={colors.brand.deep}
              strokeWidth={2.5}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// MVP spotlight — highlight video or stats poster + stat line.
// ---------------------------------------------------------------------------

function MvpCard({
  post,
  onPlay,
  onPlayerPress,
}: {
  post: MvpPost;
  onPlay: () => void;
  onPlayerPress: () => void;
}) {
  const isVideo = post.media.kind === 'video';
  const mediaUri =
    post.media.kind === 'video' ? post.media.poster : post.media.imageUrl;

  return (
    <Card padded={false} radius="card" style={styles.mvpCard}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isVideo
            ? `Play highlight: ${post.playerName}, ${post.award}`
            : `${post.playerName}, ${post.award}`
        }
        accessibilityHint={isVideo ? 'Opens the highlight reel' : 'Opens the league'}
        onPress={onPlay}
        style={styles.mvpMedia}
      >
        <Image
          source={{ uri: mediaUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          accessibilityLabel={`${post.playerName} highlight`}
        />
        <LinearGradient
          colors={['rgba(8,32,48,0.45)', 'rgba(8,32,48,0)', 'rgba(8,32,48,0.35)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.mvpMediaTop}>
          <View style={styles.awardPill}>
            <Text variant="eyebrow" color={colors.text.inverse}>
              {post.award}
            </Text>
          </View>
        </View>
        {isVideo ? (
          <>
            <View style={styles.playButton}>
              <Play
                size={22}
                color={colors.brand.deep}
                strokeWidth={2.5}
                fill={colors.brand.deep}
              />
            </View>
            {post.media.kind === 'video' ? (
              <View style={styles.durationBadge}>
                <Text variant="caption" color={colors.text.inverse}>
                  {post.media.durationLabel}
                </Text>
              </View>
            ) : null}
          </>
        ) : null}
      </Pressable>

      <View style={styles.mvpBody}>
        <View style={styles.mvpMetaRow}>
          <Text variant="eyebrow" color={colors.brand.primary}>
            {post.leagueName}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            {post.timeAgo}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${post.playerName}'s profile`}
          onPress={onPlayerPress}
          style={styles.mvpPlayerRow}
        >
          <Avatar uri={post.playerAvatar} size={40} bordered />
          <View style={styles.mvpPlayerText}>
            <Text variant="h3" color={colors.text.primary}>
              {post.playerName}
            </Text>
            <Text variant="caption" color={colors.text.secondary}>
              {post.teamName}
            </Text>
          </View>
          <ChevronRight
            size={18}
            color={colors.text.muted}
            strokeWidth={2.25}
          />
        </Pressable>

        <Text variant="bodySm" color={colors.text.secondary}>
          {post.gameLabel}
        </Text>
        <Text variant="body" color={colors.text.primary}>
          {post.blurb}
        </Text>

        <View style={styles.statRow}>
          {post.stats.map((stat) => (
            <View key={stat.label} style={styles.statChip}>
              <Text variant="h3" color={colors.brand.deep}>
                {stat.value}
              </Text>
              <Text variant="caption" color={colors.text.secondary}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Editorial story card — taps into the article detail + comments.
// ---------------------------------------------------------------------------

function StoryCard({
  item,
  onPress,
}: {
  item: SportsNewsItem;
  onPress: () => void;
}) {
  const commentCount = useNewsComments(
    (s) => s.commentsByArticle[item.id]?.length ?? 0,
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Read story: ${item.headline}`}
      accessibilityHint="Opens the article and comments"
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.96 : 1 }]}
    >
      <Card padded={false} radius="card" style={styles.storyCard}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.storyImage}
          contentFit="cover"
          transition={200}
          accessibilityLabel={item.headline}
        />
        <View style={styles.storyBody}>
          <View style={styles.storyMeta}>
            <Tag tone="info" size="sm" label={NEWS_CATEGORY_LABEL[item.category]} />
            <Text variant="caption" color={colors.text.muted}>
              {item.source} · {item.timeAgo}
            </Text>
          </View>
          <Text variant="h3" color={colors.text.primary}>
            {item.headline}
          </Text>
          <Text variant="bodySm" color={colors.text.secondary} numberOfLines={2}>
            {item.summary}
          </Text>
          <View style={styles.storyFooter}>
            <View style={styles.storyFooterItem}>
              <Clock size={13} color={colors.text.muted} strokeWidth={2.25} />
              <Text variant="caption" color={colors.text.muted}>
                {item.readMinutes} min read
              </Text>
            </View>
            <View style={styles.storyFooterItem}>
              <MessageCircle
                size={13}
                color={colors.text.muted}
                strokeWidth={2.25}
              />
              <Text variant="caption" color={colors.text.muted}>
                {commentCount === 0
                  ? 'Join the discussion'
                  : `${commentCount} comment${commentCount === 1 ? '' : 's'}`}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
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
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingRight: spacing.lg,
  },
  clearBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    minHeight: 32,
    justifyContent: 'center',
  },
  section: {
    gap: spacing.lg,
  },
  cardsColumn: {
    gap: spacing.lg,
  },
  rail: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingRight: spacing.lg,
  },

  // Filter sheet
  sheetContent: {
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sheetGroup: {
    gap: spacing.md,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },

  // Featured promo
  featured: {
    height: 232,
    borderRadius: radii.cardLg,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: spacing.xl,
  },
  featuredTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  kickerBrand: {
    backgroundColor: 'rgba(0,100,149,0.85)',
  },
  kickerWarn: {
    backgroundColor: 'rgba(171,53,18,0.88)',
  },
  featuredSport: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  featuredBody: {
    gap: spacing.sm,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    gap: spacing.md,
  },
  featuredCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface.card,
    ...shadows.soft,
  },

  // MVP card
  mvpCard: {
    overflow: 'hidden',
  },
  mvpMedia: {
    height: 196,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mvpMediaTop: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
  },
  awardPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(8,32,48,0.62)',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
    ...shadows.card,
  },
  durationBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(8,32,48,0.7)',
  },
  mvpBody: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  mvpMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mvpPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  mvpPlayerText: {
    flex: 1,
    gap: 2,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  statChip: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.brand.soft,
  },

  // Story card
  storyCard: {
    overflow: 'hidden',
  },
  storyImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.surface.chip,
  },
  storyBody: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  storyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  storyFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
