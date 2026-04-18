import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CalendarHeart,
  Compass,
  Trophy,
  type LucideIcon,
} from 'lucide-react-native';
import { colors, radii, spacing } from '../../theme';
import { Button, IconBadge, Text } from '../../ui';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

interface Slide {
  id: string;
  Icon: LucideIcon;
  eyebrow: string;
  title: string;
  accentTitle: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    id: 'discover',
    Icon: Compass,
    eyebrow: 'Discover',
    title: 'Find your',
    accentTitle: 'next game.',
    description:
      'Pickup runs, league matches, open gyms — every sport in your city in one place.',
  },
  {
    id: 'squad',
    Icon: Trophy,
    eyebrow: 'Squads',
    title: 'Build your',
    accentTitle: 'squad.',
    description:
      'Join teams actively recruiting players at your skill level — or start your own.',
  },
  {
    id: 'schedule',
    Icon: CalendarHeart,
    eyebrow: 'Schedule',
    title: 'Never miss',
    accentTitle: 'a tip-off.',
    description:
      'Reminders, RSVPs, ref assignments and live scores — your week, in order.',
  },
];

const { width: WINDOW_WIDTH } = Dimensions.get('window');

export function OnboardingScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(e.nativeEvent.contentOffset.x / WINDOW_WIDTH);
      if (next !== index) setIndex(next);
    },
    [index],
  );

  const goNext = useCallback(() => {
    if (index < SLIDES.length - 1) {
      const nextIndex = index + 1;
      listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setIndex(nextIndex);
      return;
    }
    navigation.navigate('Register');
  }, [index, navigation]);

  const renderItem: ListRenderItem<Slide> = useCallback(
    ({ item }) => {
      const Icon = item.Icon;
      return (
        <View style={[styles.slide, { width: WINDOW_WIDTH }]}>
          <View style={styles.illustration}>
            <View
              style={styles.illustrationGlowOne}
              pointerEvents="none"
            />
            <View
              style={styles.illustrationGlowTwo}
              pointerEvents="none"
            />
            <IconBadge size={120} tone="brand" style={styles.illustrationIcon}>
              <Icon
                size={56}
                color={colors.brand.primary}
                strokeWidth={2}
              />
            </IconBadge>
          </View>

          <View style={styles.copyBlock}>
            <Text variant="eyebrow" color={colors.brand.primary} align="center">
              {item.eyebrow}
            </Text>
            <Text variant="display" color={colors.text.primary} align="center">
              {item.title}
            </Text>
            <Text variant="display" color={colors.brand.primary} align="center">
              {item.accentTitle}
            </Text>
            <Text
              variant="bodyLg"
              color={colors.text.secondary}
              align="center"
              style={styles.description}
            >
              {item.description}
            </Text>
          </View>
        </View>
      );
    },
    [],
  );

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
        <Pressable
          onPress={() => navigation.navigate('Register')}
          accessibilityRole="button"
          accessibilityLabel="Skip introduction"
          hitSlop={12}
          style={styles.skip}
        >
          <Text variant="button" color={colors.text.secondary}>
            Skip
          </Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={WINDOW_WIDTH}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, i) => ({
          length: WINDOW_WIDTH,
          offset: WINDOW_WIDTH * i,
          index: i,
        })}
      />

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.dots}>
          {SLIDES.map((slide, i) => (
            <View
              key={slide.id}
              style={[styles.dot, i === index ? styles.dotActive : null]}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
          ))}
        </View>
        <Button
          label={index === SLIDES.length - 1 ? "Let's go" : 'Next'}
          variant="gradient"
          size="lg"
          fullWidth
          onPress={goNext}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  skip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  slide: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    gap: spacing.huge,
    alignItems: 'center',
  },
  illustration: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  illustrationGlowOne: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(63,177,250,0.18)',
    top: 20,
    left: 20,
  },
  illustrationGlowTwo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0,100,149,0.12)',
    bottom: 30,
    right: 10,
  },
  illustrationIcon: {
    width: 120,
    height: 120,
  },
  copyBlock: {
    gap: 4,
    width: '100%',
    alignItems: 'center',
  },
  description: {
    marginTop: spacing.lg,
    maxWidth: 320,
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surface.chip,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.brand.primary,
  },
});
