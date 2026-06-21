import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, shadows, spacing } from '../theme';
import { Text } from '../ui';
import { Breadcrumbs, type Crumb } from './Breadcrumbs';
import type { AdminRouteName } from './nav';

export type PageHeaderVariant = 'standard' | 'hero' | 'flatHero';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  meta?: string;
  crumbs?: Crumb[];
  onNavigate?: (route: AdminRouteName) => void;
  trailing?: React.ReactNode;
  /**
   * Visual treatment.
   *  - `standard` (default): compact h1 + subtitle + meta.
   *  - `hero`: "Summit" pattern — atmospheric image (or summit gradient
   *    fallback) with the displayLg title HANGING BELOW the image,
   *    overlapping into the content area below. Trailing actions
   *    align to the bottom-right inside the image.
   *  - `flatHero`: oversized displayLg title without an image — used
   *    on dense data screens (Settings, Analytics, Referees) where a
   *    photo would compete with the data viz.
   */
  variant?: PageHeaderVariant;
  /** Background image for `hero` variant (atmospheric backdrop). */
  heroImage?: ImageSourcePropType;
  /** Eyebrow tag rendered above the title (hero + flatHero only). */
  eyebrow?: string;
}

export function PageHeader({
  title,
  subtitle,
  meta,
  crumbs,
  onNavigate,
  trailing,
  variant = 'standard',
  heroImage,
  eyebrow,
}: PageHeaderProps) {
  if (variant === 'hero') {
    return (
      <View style={styles.heroWrap}>
        {crumbs && crumbs.length > 0 && onNavigate ? (
          <View style={styles.heroCrumbs}>
            <Breadcrumbs crumbs={crumbs} onNavigate={onNavigate} />
          </View>
        ) : null}
        <View style={styles.heroBackdropWrap}>
          <HeroBackdrop heroImage={heroImage}>
            {trailing ? (
              <View style={styles.heroTrailing}>{trailing}</View>
            ) : null}
          </HeroBackdrop>
          {/*
            Title hangs BELOW the image, overlapping into the content
            below — Stitch "Summit Header" pattern. The wrapper that
            uses this header should reserve mt-16 / margin-top spacing
            on the next block, which our `PageScroll` already provides
            via `gap`.
          */}
          <View style={styles.heroTitleHang}>
            {eyebrow ? (
              <Text variant="eyebrow" color={colors.brand.primary}>
                {eyebrow}
              </Text>
            ) : null}
            <Text variant="displayLg" color={colors.text.primary}>
              {title}
            </Text>
            {subtitle ? (
              <Text variant="bodyLg" color={colors.text.secondary}>
                {subtitle}
              </Text>
            ) : null}
            {meta ? (
              <Text variant="caption" color={colors.text.muted}>
                {meta}
              </Text>
            ) : null}
          </View>
        </View>
        {/* Spacer absorbs the hanging-title overlap so the next block doesn't collide. */}
        <View style={styles.heroSpacer} />
      </View>
    );
  }

  if (variant === 'flatHero') {
    return (
      <View style={styles.flatHeroWrap}>
        {crumbs && crumbs.length > 0 && onNavigate ? (
          <Breadcrumbs crumbs={crumbs} onNavigate={onNavigate} />
        ) : null}
        <View style={styles.flatHeroRow}>
          <View style={styles.flatHeroTitleBlock}>
            {eyebrow ? (
              <Text variant="eyebrow" color={colors.brand.primary}>
                {eyebrow}
              </Text>
            ) : null}
            <Text variant="displayLg" color={colors.text.primary}>
              {title}
            </Text>
            {subtitle ? (
              <Text variant="bodyLg" color={colors.text.secondary}>
                {subtitle}
              </Text>
            ) : null}
            {meta ? (
              <Text variant="caption" color={colors.text.muted}>
                {meta}
              </Text>
            ) : null}
          </View>
          {trailing ? (
            <View style={styles.flatHeroTrailing}>{trailing}</View>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {crumbs && crumbs.length > 0 && onNavigate ? (
        <Breadcrumbs crumbs={crumbs} onNavigate={onNavigate} />
      ) : null}
      <View style={styles.row}>
        <View style={styles.titleBlock}>
          <Text variant="h1" color={colors.text.primary}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="body" color={colors.text.secondary}>
              {subtitle}
            </Text>
          ) : null}
          {meta ? (
            <Text variant="caption" color={colors.text.muted}>
              {meta}
            </Text>
          ) : null}
        </View>
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
    </View>
  );
}

interface HeroBackdropProps {
  heroImage?: ImageSourcePropType;
  children: React.ReactNode;
}

function HeroBackdrop({ heroImage, children }: HeroBackdropProps) {
  if (heroImage) {
    return (
      <ImageBackground
        source={heroImage}
        style={styles.heroBackdrop}
        imageStyle={styles.heroBackdropImage}
        resizeMode="cover"
      >
        {/* Top-down soft scrim so trailing buttons stay legible. */}
        <LinearGradient
          colors={['rgba(15,23,42,0.18)', 'rgba(15,23,42,0)', 'rgba(244,246,250,0.45)']}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Brand-tinted gradient (left-to-right) — adds the "frosty"
            atmospheric mood from Glacier ethos §2. */}
        <LinearGradient
          colors={['rgba(63,177,250,0.32)', 'rgba(63,177,250,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.heroContent}>{children}</View>
      </ImageBackground>
    );
  }
  return (
    <View style={styles.heroBackdrop}>
      <LinearGradient
        colors={[...colors.gradient.summit]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, styles.heroBackdropImage]}
      />
      <View style={styles.heroContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Standard variant
  wrap: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xxxl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  titleBlock: {
    gap: spacing['2xs'],
    flex: 1,
    minWidth: 0,
  },
  trailing: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },

  // Hero variant — Summit overlap pattern
  heroWrap: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xxxl,
    paddingBottom: 0,
    gap: spacing.md,
  },
  heroCrumbs: {
    paddingHorizontal: spacing['2xs'],
  },
  heroBackdropWrap: {
    position: 'relative',
  },
  heroBackdrop: {
    borderRadius: radii.summit,
    overflow: 'hidden',
    height: 192,
    ...shadows.glow,
  },
  heroBackdropImage: {
    borderRadius: radii.summit,
  },
  heroContent: {
    flex: 1,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  heroTrailing: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  heroTitleHang: {
    position: 'absolute',
    bottom: -36, //   title overflows the image downward
    left: spacing.xl,
    right: spacing.xl,
    gap: spacing.xs,
  },
  heroSpacer: {
    // Reserves room for the hanging title so the next block doesn't
    // collide. Tuned to displayLg lineHeight (60) + eyebrow (14) +
    // subtitle (~22) + a small breathing gap.
    height: 96,
  },

  // Flat hero — oversized title, no image
  flatHeroWrap: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xxxl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  flatHeroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.xl,
  },
  flatHeroTitleBlock: {
    gap: spacing.xs,
    flex: 1,
    minWidth: 0,
  },
  flatHeroTrailing: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
});
