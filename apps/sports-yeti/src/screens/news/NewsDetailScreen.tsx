import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ExternalLink } from 'lucide-react-native';
import { OrgAvatar, Tag } from '@sports-yeti/ui';
import {
  articleById,
  draftsForArticle,
  organizationById,
} from '@sports-yeti/mocks';
import { Text } from '../../ui';
import { OrgBrandingProvider } from '../../features/org-branding';
import { colors, radii, shadows, spacing } from '../../theme';

export function NewsDetailScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<
    RouteProp<{ params: { articleId: string } }, 'params'>
  >();
  const article = useMemo(
    () => articleById(route.params.articleId),
    [route.params.articleId],
  );
  const org = useMemo(
    () => (article ? organizationById(article.organizationId) : undefined),
    [article],
  );
  const drafts = useMemo(
    () => (article ? draftsForArticle(article.id) : []),
    [article],
  );

  if (!article || !org) {
    return (
      <View style={styles.root}>
        <Text variant="body">Article not found.</Text>
      </View>
    );
  }

  return (
    <OrgBrandingProvider org={org}>
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
            News
          </Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 120 },
          ]}
        >
          {article.heroImageUrl ? (
            <Image
              accessibilityLabel={article.title}
              source={{ uri: article.heroImageUrl }}
              style={styles.heroImage}
            />
          ) : null}

          <View style={[styles.byline, { gap: spacing.sm }]}>
            <OrgAvatar
              name={org.name}
              logoUrl={org.logoUrl}
              brandColor={org.brandColor}
              size="sm"
              ring={false}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="bodySm" color={colors.text.primary} style={styles.bold}>
                {org.name}
              </Text>
              {article.publishedAtIso ? (
                <Text variant="caption" color={colors.text.muted}>
                  {new Date(article.publishedAtIso).toLocaleDateString(
                    'en-US',
                    { month: 'long', day: 'numeric', year: 'numeric' },
                  )}
                </Text>
              ) : null}
            </View>
          </View>

          <Text variant="display" color={colors.text.primary} style={styles.title}>
            {article.title}
          </Text>

          <View style={[styles.metaRow, { gap: spacing.xs }]}>
            {article.tags.map((t) => (
              <Tag key={t} size="sm" tone="info" label={`#${t}`} />
            ))}
          </View>

          <Text variant="body" color={colors.text.primary}>
            {article.body}
          </Text>

          {drafts.length > 0 ? (
            <View style={styles.socialBlock}>
              <Text variant="h3">Also posted to</Text>
              {drafts.map((d) => (
                <View key={d.id} style={[styles.socialRow, { gap: spacing.xs }]}>
                  {d.channels.map((c) => (
                    <Tag key={c} size="sm" tone="brand" label={c} />
                  ))}
                  <Text variant="caption" color={colors.text.muted}>
                    {d.status}
                  </Text>
                  <ExternalLink
                    size={14}
                    color={colors.text.muted}
                    strokeWidth={2}
                  />
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      </View>
    </OrgBrandingProvider>
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
  scroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  heroImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radii.card,
  },
  byline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  title: {
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  socialBlock: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.lg,
    ...shadows.soft,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  bold: {
    fontWeight: '600',
  },
});
