import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OrgAvatar, Tag } from '@sports-yeti/ui';
import {
  DEMO_ORG_ID,
  organizationById,
  publishedArticlesForOrg,
  type NewsArticle,
} from '@sports-yeti/mocks';
import { Text } from '../../ui';
import { OrgBrandingProvider } from '../../features/org-branding';
import { colors, radii, shadows, spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function NewsFeedScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const org = useMemo(() => organizationById(DEMO_ORG_ID), []);
  const articles = useMemo(() => publishedArticlesForOrg(DEMO_ORG_ID), []);

  if (!org) return null;

  return (
    <OrgBrandingProvider org={org}>
      <View style={styles.root}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + spacing.lg,
              paddingBottom: insets.bottom + 120,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <OrgAvatar
              name={org.name}
              logoUrl={org.logoUrl}
              brandColor={org.brandColor}
              size="md"
            />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="eyebrow" color={colors.text.muted}>
                NEWS
              </Text>
              <Text variant="bodySm" color={colors.text.primary} style={styles.bold}>
                {org.name}
              </Text>
            </View>
          </View>

          <Text variant="display" color={colors.text.primary} style={styles.title}>
            What's happening
          </Text>

          {articles.map((a) => (
            <NewsCard
              key={a.id}
              article={a}
              onPress={() =>
                navigation.navigate('NewsDetail', { articleId: a.id })
              }
            />
          ))}
        </ScrollView>
      </View>
    </OrgBrandingProvider>
  );
}

interface NewsCardProps {
  article: NewsArticle;
  onPress: () => void;
}
function NewsCard({ article, onPress }: NewsCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open article: ${article.title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.95 : 1 }]}
    >
      {article.heroImageUrl ? (
        <Image
          accessibilityLabel={article.title}
          source={{ uri: article.heroImageUrl }}
          style={styles.heroImage}
        />
      ) : null}
      <View style={[styles.body, { gap: spacing.sm }]}>
        <Text variant="h3">{article.title}</Text>
        <Text
          variant="body"
          color={colors.text.secondary}
          numberOfLines={3}
        >
          {article.body}
        </Text>
        <View style={[styles.metaRow, { gap: spacing.xs }]}>
          {article.tags.slice(0, 3).map((t) => (
            <Tag key={t} size="sm" tone="info" label={`#${t}`} />
          ))}
          {article.publishedAtIso ? (
            <Text variant="caption" color={colors.text.muted}>
              {new Date(article.publishedAtIso).toLocaleDateString()}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.6,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    overflow: 'hidden',
    ...shadows.card,
  },
  heroImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  body: {
    padding: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  bold: {
    fontWeight: '600',
  },
});
