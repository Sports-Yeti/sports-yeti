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

export type PageHeaderVariant = 'standard' | 'hero';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  meta?: string;
  crumbs?: Crumb[];
  onNavigate?: (route: AdminRouteName) => void;
  trailing?: React.ReactNode;
  /**
   * Visual treatment.
   *  - `standard` (default): compact header — h1 title, subtitle, meta.
   *  - `hero`: oversized "Summit" title (display-LG) over a soft glacier
   *    backdrop. Optionally pass `heroImage` for an atmospheric photo.
   */
  variant?: PageHeaderVariant;
  /** Background image for `hero` variant (atmospheric backdrop). */
  heroImage?: ImageSourcePropType;
  /**
   * Eyebrow tag rendered above the title in `hero` variant
   * (e.g. "MARKETPLACE OVERVIEW", "SEASON HUB").
   */
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
        <HeroBackdrop heroImage={heroImage}>
          <View style={styles.heroRow}>
            <View style={styles.heroTitleBlock}>
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
              <View style={styles.heroTrailing}>{trailing}</View>
            ) : null}
          </View>
        </HeroBackdrop>
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
  // With image: photo + dark scrim so display-LG stays readable.
  if (heroImage) {
    return (
      <ImageBackground
        source={heroImage}
        style={styles.heroBackdrop}
        imageStyle={styles.heroBackdropImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(244,246,250,0.55)', 'rgba(244,246,250,0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.heroContent}>{children}</View>
      </ImageBackground>
    );
  }

  // Without image: soft "summit" gradient wash for the alpine feel.
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

  // Hero variant
  heroWrap: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xxxl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  heroCrumbs: {
    paddingHorizontal: spacing['2xs'],
  },
  heroBackdrop: {
    borderRadius: radii.summit,
    overflow: 'hidden',
    minHeight: 200,
    ...shadows.glow,
  },
  heroBackdropImage: {
    borderRadius: radii.summit,
  },
  heroContent: {
    padding: spacing.xxl,
    flex: 1,
    justifyContent: 'flex-end',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.xl,
  },
  heroTitleBlock: {
    gap: spacing.xs,
    flex: 1,
    minWidth: 0,
  },
  heroTrailing: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
});
