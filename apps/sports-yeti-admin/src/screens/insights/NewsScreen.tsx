import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { type WebPressableState } from '../../lib/pressable';
import { Megaphone, Plus } from 'lucide-react-native';
import { PageHeader, PageScroll, type AdminRouteName } from '../../admin';
import { Button, Card, EmptyState, Tag, Text } from '../../ui';
import { colors, radii, spacing } from '../../theme';
import { useAllNewsPosts } from '../../stores';
import { formatRelative } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const STATUS_TONE = {
  published: 'success' as const,
  scheduled: 'info' as const,
  draft: 'warning' as const,
};

export function NewsScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const posts = useAllNewsPosts();
  const drafts = posts.filter((p) => p.status === 'draft').length;
  const scheduled = posts.filter((p) => p.status === 'scheduled').length;

  return (
    <PageScroll>
      <PageHeader
        title="News & ads"
        subtitle="Send announcements to your players, captains, and referees"
        meta={`${posts.length} total · ${drafts} draft · ${scheduled} scheduled`}
        trailing={
          <Button
            label="Compose announcement"
            variant="solid"
            size="sm"
            leadingIcon={<Plus size={14} color={colors.text.inverse} strokeWidth={2.5} />}
            onPress={() => navigation.navigate('NewsComposer')}
          />
        }
      />

      {posts.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Megaphone size={20} color={colors.brand.primary} strokeWidth={2.25} />}
            title="Nothing yet"
            description="Send your first announcement so players see league updates in their app."
            primaryAction={{
              label: 'Compose announcement',
              onPress: () => navigation.navigate('NewsComposer'),
            }}
          />
        </Card>
      ) : (
        posts.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => navigation.navigate('NewsComposer', { id: p.id })}
            accessibilityRole="button"
            accessibilityLabel={`Open ${p.title}`}
            style={({ hovered }: WebPressableState) => [
              styles.cardWrap,
              hovered ? styles.cardWrapHover : null,
            ]}
          >
            <Card>
              <View style={styles.headRow}>
                <Tag
                  size="sm"
                  tone={STATUS_TONE[p.status]}
                  leadingDot
                  label={p.status}
                />
                <Tag size="sm" tone="brand" label={`To ${p.audience}`} />
                <Text variant="caption" color={colors.text.muted} style={styles.head}>
                  {formatRelative(p.publishedAtIso)}
                </Text>
              </View>
              <Text variant="h3" color={colors.text.primary}>
                {p.title}
              </Text>
              <Text variant="body" color={colors.text.primary}>
                {p.body}
              </Text>
            </Card>
          </Pressable>
        ))
      )}
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    borderRadius: radii.md,
  },
  cardWrapHover: {
    opacity: 0.92,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  head: {
    marginLeft: 'auto',
  },
});
