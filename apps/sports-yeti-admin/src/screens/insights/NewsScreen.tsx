import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Megaphone, Plus } from 'lucide-react-native';
import { PageHeader, PageScroll } from '../../admin';
import { Button, Card, EmptyState, Tag, Text, useToast } from '../../ui';
import { colors, spacing } from '../../theme';
import { NEWS_POSTS } from '../../mocks/insights';
import { formatRelative } from '../../lib/format';

export function NewsScreen() {
  const toast = useToast();
  const [posts] = useState(NEWS_POSTS);

  return (
    <PageScroll>
      <PageHeader
        title="News & ads"
        subtitle="Send announcements to your players, captains, and referees"
        meta={`${posts.length} total · ${posts.filter((p) => p.status === 'draft').length} draft`}
        trailing={
          <Button
            label="Compose announcement"
            variant="solid"
            size="sm"
            leadingIcon={<Plus size={14} color={colors.text.inverse} strokeWidth={2.5} />}
            onPress={() =>
              toast.show({ variant: 'info', title: 'Announcement composer coming soon' })
            }
          />
        }
      />

      {posts.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Megaphone size={20} color={colors.brand.primary} strokeWidth={2.25} />}
            title="Nothing yet"
            description="Send your first announcement so players see league updates in their app."
          />
        </Card>
      ) : (
        posts.map((p) => (
          <Card key={p.id}>
            <View style={styles.headRow}>
              <Tag
                size="sm"
                tone={p.status === 'published' ? 'success' : p.status === 'scheduled' ? 'info' : 'warning'}
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
        ))
      )}
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  head: {
    marginLeft: 'auto',
  },
});
