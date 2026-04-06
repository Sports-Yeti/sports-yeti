import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { League } from '../../types';

const TABS = ['League News', 'Ads'] as const;
type Tab = (typeof TABS)[number];

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  is_pinned: boolean;
  author_name: string;
  created_at: string;
}

function TabBar({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (t: Tab) => void }) {
  return (
    <View style={styles.tabBar}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.tabActive]}
          onPress={() => onTabChange(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function NewsScreen() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('League News');
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const { data: leaguesData, isLoading: isLoadingLeagues, refetch: refetchLeagues } = useQuery({
    queryKey: ['leagues'],
    queryFn: () => api.getLeagues({ per_page: 50 }),
  });

  const leagues = leaguesData?.data ?? [];

  const { data: newsData, isLoading: isLoadingNews, refetch: refetchNews } = useQuery({
    queryKey: ['league-news', selectedLeagueId],
    queryFn: () => api.getLeagueNews(selectedLeagueId!),
    enabled: !!selectedLeagueId,
  });

  const newsArticles: NewsArticle[] = Array.isArray(newsData?.data)
    ? newsData.data.map((n: Record<string, unknown>) => ({
        id: String(n.id ?? ''),
        title: String(n.title ?? ''),
        content: String(n.content ?? ''),
        is_published: Boolean(n.is_published),
        is_pinned: Boolean(n.is_pinned),
        author_name: String(n.author_name ?? 'Admin'),
        created_at: String(n.created_at ?? ''),
      }))
    : [];

  const createMutation = useMutation({
    mutationFn: () => api.createLeagueNews(selectedLeagueId!, { title: newTitle, content: newContent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['league-news', selectedLeagueId] });
      setIsCreating(false);
      setNewTitle('');
      setNewContent('');
    },
    onError: () => Alert.alert('Error', 'Failed to create article'),
  });

  const publishMutation = useMutation({
    mutationFn: (newsId: string) => api.publishLeagueNews(selectedLeagueId!, newsId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['league-news', selectedLeagueId] }),
  });

  const unpublishMutation = useMutation({
    mutationFn: (newsId: string) => api.unpublishLeagueNews(selectedLeagueId!, newsId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['league-news', selectedLeagueId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (newsId: string) => api.deleteLeagueNews(selectedLeagueId!, newsId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['league-news', selectedLeagueId] }),
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchLeagues();
    if (selectedLeagueId) await refetchNews();
    setRefreshing(false);
  }, [refetchLeagues, refetchNews, selectedLeagueId]);

  const handleDelete = (newsId: string, title: string) => {
    Alert.alert('Delete Article', `Are you sure you want to delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(newsId) },
    ]);
  };

  const isLoading = isLoadingLeagues && !refreshing;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>News & Ads</Text>
          <Text style={styles.subtitle}>Manage league news and advertisements</Text>
        </View>
      </View>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'League News' && (
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select League</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {leagues.map((league: League) => (
                <TouchableOpacity
                  key={league.id}
                  style={[styles.leagueChip, selectedLeagueId === league.id && styles.leagueChipActive]}
                  onPress={() => setSelectedLeagueId(league.id)}
                >
                  <Text style={[styles.leagueChipText, selectedLeagueId === league.id && styles.leagueChipTextActive]}>
                    {league.name}
                  </Text>
                </TouchableOpacity>
              ))}
              {leagues.length === 0 && <Text style={styles.emptyText}>No leagues available</Text>}
            </ScrollView>
          </View>

          {selectedLeagueId && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Articles</Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => setIsCreating(!isCreating)}
                >
                  <Text style={styles.createButtonText}>{isCreating ? 'Cancel' : 'New Article'}</Text>
                </TouchableOpacity>
              </View>

              {isCreating && (
                <View style={styles.createForm}>
                  <TextInput
                    style={styles.input}
                    value={newTitle}
                    onChangeText={setNewTitle}
                    placeholder="Article title"
                    placeholderTextColor={COLORS.textMuted}
                  />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={newContent}
                    onChangeText={setNewContent}
                    placeholder="Article content..."
                    placeholderTextColor={COLORS.textMuted}
                    multiline
                    numberOfLines={6}
                  />
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={() => createMutation.mutate()}
                    disabled={createMutation.isPending || !newTitle.trim()}
                  >
                    {createMutation.isPending ? (
                      <ActivityIndicator size="small" color={COLORS.surface} />
                    ) : (
                      <Text style={styles.submitButtonText}>Create Article</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {isLoadingNews ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : newsArticles.length === 0 ? (
                <Text style={styles.emptyText}>No articles yet</Text>
              ) : (
                newsArticles.map((article) => (
                  <View key={article.id} style={styles.articleCard}>
                    <View style={styles.articleHeader}>
                      <View style={styles.articleTitleRow}>
                        <Text style={styles.articleTitle} numberOfLines={1}>{article.title}</Text>
                        {article.is_pinned && <Text style={styles.pinnedBadge}>Pinned</Text>}
                      </View>
                      <View style={[styles.statusBadge, article.is_published ? styles.publishedBadge : styles.draftBadge]}>
                        <Text style={[styles.statusBadgeText, article.is_published ? styles.publishedText : styles.draftText]}>
                          {article.is_published ? 'Published' : 'Draft'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.articleMeta}>
                      By {article.author_name} · {new Date(article.created_at).toLocaleDateString()}
                    </Text>
                    <Text style={styles.articlePreview} numberOfLines={2}>{article.content}</Text>
                    <View style={styles.articleActions}>
                      <TouchableOpacity
                        style={styles.articleActionButton}
                        onPress={() =>
                          article.is_published
                            ? unpublishMutation.mutate(article.id)
                            : publishMutation.mutate(article.id)
                        }
                      >
                        <Text style={styles.articleActionText}>
                          {article.is_published ? 'Unpublish' : 'Publish'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.articleActionButton}
                        onPress={() => handleDelete(article.id, article.title)}
                      >
                        <Text style={[styles.articleActionText, { color: COLORS.error }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      )}

      {activeTab === 'Ads' && (
        <View style={styles.content}>
          <View style={styles.placeholderSection}>
            <Text style={styles.placeholderIcon}>📢</Text>
            <Text style={styles.placeholderTitle}>Ad Management Coming Soon</Text>
            <Text style={styles.placeholderText}>
              Manage banner ads, sponsor placements, and promotional content for your leagues.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: SPACING.lg, paddingBottom: SPACING.md,
  },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  tabBar: {
    flexDirection: 'row', marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    backgroundColor: COLORS.surface, borderRadius: 10, padding: 4, borderWidth: 1, borderColor: COLORS.border,
  },
  tab: { flex: 1, paddingVertical: SPACING.sm + 2, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.surface },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  section: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.lg,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md,
  },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center', paddingVertical: SPACING.xl },
  leagueChip: {
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: 20,
    backgroundColor: COLORS.background, marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  leagueChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  leagueChipText: { fontSize: FONT_SIZES.sm, fontWeight: '500', color: COLORS.textSecondary },
  leagueChipTextActive: { color: COLORS.surface },
  createButton: {
    backgroundColor: COLORS.primary, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: 8,
  },
  createButtonText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.surface },
  createForm: {
    backgroundColor: COLORS.background, borderRadius: 8, padding: SPACING.md, marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface, borderRadius: 8, padding: SPACING.md,
    fontSize: FONT_SIZES.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm,
  },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  submitButton: {
    backgroundColor: COLORS.primary, paddingVertical: SPACING.sm + 2, borderRadius: 8, alignItems: 'center',
  },
  submitButtonText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.surface },
  articleCard: {
    backgroundColor: COLORS.background, borderRadius: 8, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  articleHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs,
  },
  articleTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: SPACING.sm },
  articleTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text, flex: 1 },
  pinnedBadge: {
    fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.warning,
    backgroundColor: COLORS.warning + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: SPACING.xs,
  },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: 4 },
  publishedBadge: { backgroundColor: COLORS.success + '20' },
  draftBadge: { backgroundColor: COLORS.warning + '20' },
  statusBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  publishedText: { color: COLORS.success },
  draftText: { color: COLORS.warning },
  articleMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginBottom: SPACING.xs },
  articlePreview: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  articleActions: { flexDirection: 'row', gap: SPACING.md },
  articleActionButton: { paddingVertical: SPACING.xs },
  articleActionText: { fontSize: FONT_SIZES.sm, fontWeight: '500', color: COLORS.primary },
  placeholderSection: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.xxl,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  placeholderIcon: { fontSize: 48, marginBottom: SPACING.md },
  placeholderTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  placeholderText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center', maxWidth: 400 },
});
