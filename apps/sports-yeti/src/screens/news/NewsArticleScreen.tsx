import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeft,
  Clock,
  Heart,
  MessageCircle,
  SendHorizonal,
  Share2,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import { Avatar, Card, Tag, Text } from '../../ui';
import {
  NEWS_CATEGORY_LABEL,
  getSportsNewsItem,
  type NewsComment,
} from '../../mocks/news';
import { PROFILE_USER } from '../../mocks/profile';
import { useNewsComments } from '../../features/news-comments-store';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Route = RouteProp<RootStackParamList, 'NewsArticle'>;

const EMPTY: NewsComment[] = [];

export function NewsArticleScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<Route>();
  const { articleId } = route.params;
  const article = getSportsNewsItem(articleId);

  const comments = useNewsComments((s) => s.commentsByArticle[articleId] ?? EMPTY);
  const likedIds = useNewsComments((s) => s.likedIds);
  const addComment = useNewsComments((s) => s.addComment);
  const toggleLike = useNewsComments((s) => s.toggleLike);

  const [draft, setDraft] = useState('');

  if (!article) {
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
          <Text variant="h2">News</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.missing}>
          <Text variant="body" color={colors.text.secondary} align="center">
            This story is no longer available.
          </Text>
        </View>
      </View>
    );
  }

  const handleShare = async () => {
    Haptics.selectionAsync();
    try {
      await Share.share({
        title: article.headline,
        message: `${article.headline} — via ${article.source}`,
      });
    } catch {
      // user cancelled
    }
  };

  const handleSend = () => {
    if (!draft.trim()) return;
    Haptics.selectionAsync();
    addComment(articleId, draft);
    setDraft('');
  };

  const handleLike = (commentId: string) => {
    Haptics.selectionAsync();
    toggleLike(commentId);
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
        <Text variant="h2">News</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share story"
          hitSlop={8}
          onPress={handleShare}
          style={styles.backBtn}
        >
          <Share2 size={20} color={colors.text.primary} strokeWidth={2.25} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.bottom + 8}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={{ uri: article.imageUrl }}
            style={styles.hero}
            contentFit="cover"
            transition={200}
            accessibilityLabel={article.headline}
          />

          <View style={styles.metaRow}>
            <Tag tone="info" size="sm" label={NEWS_CATEGORY_LABEL[article.category]} />
            <Text variant="caption" color={colors.text.muted}>
              {article.source} · {article.timeAgo}
            </Text>
          </View>

          <Text variant="h1" color={colors.text.primary} style={styles.headline}>
            {article.headline}
          </Text>

          <View style={styles.readRow}>
            <Clock size={13} color={colors.text.muted} strokeWidth={2.25} />
            <Text variant="caption" color={colors.text.muted}>
              {article.readMinutes} min read
            </Text>
          </View>

          <Text variant="bodyLg" color={colors.text.secondary} style={styles.lede}>
            {article.summary}
          </Text>

          {article.body.map((para, idx) => (
            <Text
              key={idx}
              variant="body"
              color={colors.text.primary}
              style={styles.paragraph}
            >
              {para}
            </Text>
          ))}

          {article.tags.length > 0 ? (
            <View style={styles.tagRow}>
              {article.tags.map((t) => (
                <Tag key={t} tone="neutral" size="sm" label={`#${t}`} />
              ))}
            </View>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.commentsHead}>
            <MessageCircle
              size={18}
              color={colors.text.primary}
              strokeWidth={2.25}
            />
            <Text variant="h3" color={colors.text.primary}>
              {comments.length === 0
                ? 'Comments'
                : `Comments · ${comments.length}`}
            </Text>
          </View>

          {comments.length === 0 ? (
            <Card style={styles.emptyComments}>
              <Text variant="bodySm" color={colors.text.secondary} align="center">
                No comments yet. Be the first to share your take.
              </Text>
            </Card>
          ) : (
            <View style={styles.commentList}>
              {comments.map((comment) => (
                <CommentRow
                  key={comment.id}
                  comment={comment}
                  liked={likedIds.has(comment.id)}
                  onLike={() => handleLike(comment.id)}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.sm }]}>
          <Avatar uri={PROFILE_USER.avatar} size={36} />
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Add a comment…"
            placeholderTextColor={colors.text.muted}
            style={styles.input}
            multiline
            accessibilityLabel="Write a comment"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Post comment"
            disabled={!draft.trim()}
            onPress={handleSend}
            style={[styles.sendBtn, !draft.trim() ? styles.sendBtnDisabled : null]}
          >
            <SendHorizonal size={18} color={colors.text.inverse} strokeWidth={2.5} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function CommentRow({
  comment,
  liked,
  onLike,
}: {
  comment: NewsComment;
  liked: boolean;
  onLike: () => void;
}) {
  return (
    <View style={styles.commentRow}>
      <Avatar uri={comment.avatar} size={40} />
      <View style={styles.commentBody}>
        <View style={styles.commentHead}>
          <Text variant="button" color={colors.text.primary}>
            {comment.authorName}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            {comment.timeAgo}
          </Text>
        </View>
        <Text variant="caption" color={colors.text.muted}>
          {comment.authorHandle}
        </Text>
        <Text variant="bodySm" color={colors.text.primary} style={styles.commentText}>
          {comment.body}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={liked ? 'Unlike comment' : 'Like comment'}
        accessibilityState={{ selected: liked }}
        hitSlop={8}
        onPress={onLike}
        style={styles.likeBtn}
      >
        <Heart
          size={16}
          color={liked ? colors.status.live : colors.text.muted}
          strokeWidth={2.25}
          fill={liked ? colors.status.live : 'transparent'}
        />
        {comment.likes > 0 ? (
          <Text
            variant="caption"
            color={liked ? colors.status.live : colors.text.muted}
          >
            {comment.likes}
          </Text>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  flex1: {
    flex: 1,
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
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  hero: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radii.card,
    backgroundColor: colors.surface.chip,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  headline: {
    marginTop: spacing.xs,
  },
  readRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lede: {
    marginTop: spacing.xs,
  },
  paragraph: {
    lineHeight: 24,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.soft,
    marginVertical: spacing.md,
  },
  commentsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyComments: {
    paddingVertical: spacing.lg,
  },
  commentList: {
    gap: spacing.lg,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  commentBody: {
    flex: 1,
    gap: 2,
  },
  commentHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  commentText: {
    marginTop: 4,
  },
  likeBtn: {
    alignItems: 'center',
    gap: 2,
    paddingTop: 2,
    minWidth: 28,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: radii.lg,
    backgroundColor: colors.surface.bg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text.primary,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
