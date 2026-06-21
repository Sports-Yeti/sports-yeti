import { Image, StyleSheet, View } from 'react-native';
import { Heart, MessageCircle, Repeat, Share2 } from 'lucide-react-native';
import { OrgAvatar, type SocialChannel } from '@sports-yeti/ui';
import { type Organization } from '@sports-yeti/mocks';
import { Text } from '../ui';
import { colors, radii, shadows, spacing } from '../theme';

const MAX_CHARS: Record<SocialChannel, number> = {
  x: 280,
  facebook: 5000,
  instagram: 2200,
  linkedin: 3000,
};

export interface SocialPreviewCardProps {
  channel: SocialChannel;
  org: Organization;
  copy: string;
  imageUrl?: string;
}

/**
 * Visual mock of how a cross-posted news article will appear on each
 * social channel. Used by the composer's preview pane.
 */
export function SocialPreviewCard({
  channel,
  org,
  copy,
  imageUrl,
}: SocialPreviewCardProps) {
  const max = MAX_CHARS[channel];
  const isOver = copy.length > max;

  return (
    <View style={styles.card}>
      <View style={[styles.head, { gap: spacing.sm }]}>
        <OrgAvatar
          name={org.name}
          logoUrl={org.logoUrl}
          brandColor={org.brandColor}
          size="sm"
          ring={false}
        />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodySm" weight="600">
            {org.name}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            @{org.slug} · {channelHandle(channel)}
          </Text>
        </View>
        <View style={[styles.channelBadge, { backgroundColor: channelColor(channel) }]}>
          <Text variant="caption" color="#FFFFFF" weight="600">
            {channel.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text
        variant="body"
        color={colors.text.primary}
        style={channel === 'instagram' ? styles.igCopy : undefined}
        numberOfLines={channel === 'x' ? 6 : undefined}
      >
        {copy.slice(0, max + 50)}
      </Text>

      {imageUrl ? (
        <Image
          accessibilityLabel="Post image"
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            channel === 'instagram'
              ? { aspectRatio: 1 }
              : { aspectRatio: 16 / 9 },
          ]}
        />
      ) : null}

      <View style={[styles.footer, { gap: spacing.md }]}>
        <Action icon={<Heart size={14} color={colors.text.muted} />} label="—" />
        <Action
          icon={<MessageCircle size={14} color={colors.text.muted} />}
          label="—"
        />
        <Action icon={<Repeat size={14} color={colors.text.muted} />} label="—" />
        <Action icon={<Share2 size={14} color={colors.text.muted} />} label="—" />
        <View style={{ flex: 1 }} />
        <Text
          variant="caption"
          color={isOver ? colors.status.error : colors.text.muted}
        >
          {copy.length} / {max}
        </Text>
      </View>
    </View>
  );
}

interface ActionProps {
  icon: React.ReactNode;
  label: string;
}
function Action({ icon, label }: ActionProps) {
  return (
    <View style={[styles.action, { gap: 4 }]}>
      {icon}
      <Text variant="caption" color={colors.text.muted}>
        {label}
      </Text>
    </View>
  );
}

function channelHandle(c: SocialChannel): string {
  switch (c) {
    case 'x':
      return 'X (Twitter)';
    case 'facebook':
      return 'Facebook page';
    case 'instagram':
      return 'Instagram';
    case 'linkedin':
      return 'LinkedIn';
    default: {
      const _exhaustive: never = c;
      return _exhaustive;
    }
  }
}

function channelColor(c: SocialChannel): string {
  switch (c) {
    case 'x':
      return '#0F1419';
    case 'facebook':
      return '#1877F2';
    case 'instagram':
      return '#E4405F';
    case 'linkedin':
      return '#0A66C2';
    default: {
      const _exhaustive: never = c;
      return _exhaustive;
    }
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
    width: '100%',
    minWidth: 280,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  igCopy: {
    fontFamily: 'monospace',
  },
  image: {
    width: '100%',
    borderRadius: radii.lg,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
