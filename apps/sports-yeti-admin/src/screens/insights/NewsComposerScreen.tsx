import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { type WebPressableState } from '../../lib/pressable';
import { Check, Eye, Megaphone, Send } from 'lucide-react-native';
import { PageHeader, PageScroll, type AdminRouteName } from '../../admin';
import {
  Button,
  Card,
  Input,
  Select,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import { colors, radii, spacing } from '../../theme';
import { LEAGUES } from '../../mocks/leagues';
import { TEAMS } from '../../mocks/teams';
import { type NewsPost } from '../../mocks/insights';
import { useNewsStore } from '../../stores';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

type AudienceKind = 'all' | 'players' | 'captains' | 'referees' | 'league' | 'team';
type DispatchMode = 'now' | 'schedule' | 'draft';

interface FormState {
  title: string;
  body: string;
  audienceKind: AudienceKind;
  audienceId: string; // league/team id when audienceKind === 'league'/'team'
  dispatchMode: DispatchMode;
  scheduledAtIso: string;
}

const AUDIENCE_PRIMARY: { key: AudienceKind; label: string }[] = [
  { key: 'all', label: 'Everyone' },
  { key: 'players', label: 'Players' },
  { key: 'captains', label: 'Captains' },
  { key: 'referees', label: 'Referees' },
  { key: 'league', label: 'A specific league' },
  { key: 'team', label: 'A specific team' },
];

const DISPATCH_TABS = [
  { key: 'now', label: 'Publish now' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'draft', label: 'Save draft' },
];

function audienceLabel(state: FormState): string {
  if (state.audienceKind === 'league') {
    return `League · ${LEAGUES.find((l) => l.id === state.audienceId)?.name ?? '—'}`;
  }
  if (state.audienceKind === 'team') {
    return `Team · ${TEAMS.find((t) => t.id === state.audienceId)?.name ?? '—'}`;
  }
  if (state.audienceKind === 'all') return 'Everyone in your org';
  if (state.audienceKind === 'players') return 'All players';
  if (state.audienceKind === 'captains') return 'Captains only';
  return 'All referees';
}

function audienceCount(state: FormState): string {
  if (state.audienceKind === 'all') {
    return `~${LEAGUES.reduce((acc, l) => acc + l.registeredPlayers, 0)} people`;
  }
  if (state.audienceKind === 'players') {
    return `~${LEAGUES.reduce((acc, l) => acc + l.registeredPlayers, 0)} players`;
  }
  if (state.audienceKind === 'captains') {
    return `${TEAMS.length} captains`;
  }
  if (state.audienceKind === 'referees') {
    return '~14 referees';
  }
  if (state.audienceKind === 'league') {
    const league = LEAGUES.find((l) => l.id === state.audienceId);
    return league ? `${league.registeredPlayers} players in ${league.name}` : '—';
  }
  if (state.audienceKind === 'team') {
    const team = TEAMS.find((t) => t.id === state.audienceId);
    return team ? `${team.roster.length} on roster` : '—';
  }
  return '—';
}

function audienceToBackendKind(kind: AudienceKind): NewsPost['audience'] {
  if (kind === 'players' || kind === 'captains' || kind === 'referees') return kind;
  if (kind === 'league' || kind === 'team') return 'all'; // mock-only narrowing
  return 'all';
}

export function NewsComposerScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id?: string } }, 'params'>>();
  const editingId = route.params?.id;
  const toast = useToast();
  const addPost = useNewsStore((s) => s.addPost);

  const [form, setForm] = useState<FormState>({
    title: '',
    body: '',
    audienceKind: 'all',
    audienceId: '',
    dispatchMode: 'now',
    scheduledAtIso: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => {
      if (key === 'audienceKind' && value !== p.audienceKind) {
        return { ...p, audienceKind: value as AudienceKind, audienceId: '' };
      }
      return { ...p, [key]: value };
    });

  const errors = {
    title: form.title.trim().length < 5 ? 'At least 5 characters' : undefined,
    body: form.body.trim().length < 20 ? 'At least 20 characters' : undefined,
    audienceId:
      (form.audienceKind === 'league' || form.audienceKind === 'team') && !form.audienceId
        ? 'Pick a destination'
        : undefined,
    scheduledAtIso:
      form.dispatchMode === 'schedule' &&
      (!form.scheduledAtIso ||
        Number.isNaN(new Date(form.scheduledAtIso).getTime()))
        ? 'Use YYYY-MM-DDTHH:MM'
        : undefined,
  } as const;

  const showError = (key: keyof typeof errors) =>
    submitted ? errors[key] : undefined;
  const isValid = Object.values(errors).every((e) => !e);

  const handlePrimary = () => {
    setSubmitted(true);
    if (!isValid) {
      toast.show({ variant: 'warning', title: 'Fix the highlighted fields' });
      return;
    }
    const status: NewsPost['status'] =
      form.dispatchMode === 'now'
        ? 'published'
        : form.dispatchMode === 'schedule'
        ? 'scheduled'
        : 'draft';
    const publishedAtIso =
      form.dispatchMode === 'schedule' && form.scheduledAtIso
        ? new Date(form.scheduledAtIso).toISOString()
        : new Date().toISOString();
    const post: NewsPost = {
      id: editingId ?? `news-${Date.now()}`,
      title: form.title.trim(),
      body: form.body.trim(),
      publishedAtIso,
      status,
      audience: audienceToBackendKind(form.audienceKind),
    };
    addPost(post);
    toast.show({
      variant: 'success',
      title:
        status === 'published'
          ? 'Announcement sent'
          : status === 'scheduled'
          ? 'Announcement scheduled'
          : 'Draft saved',
      description: `${audienceLabel(form)} · ${audienceCount(form)}`,
    });
    navigation.goBack();
  };

  const audienceOptions = useMemo(() => {
    if (form.audienceKind === 'league') {
      return LEAGUES.map((l) => ({ value: l.id, label: l.name }));
    }
    if (form.audienceKind === 'team') {
      return TEAMS.map((t) => ({
        value: t.id,
        label: `${t.name} · ${t.leagueName}`,
      }));
    }
    return [];
  }, [form.audienceKind]);

  return (
    <PageScroll>
      <PageHeader
        title={editingId ? 'Edit announcement' : 'Compose announcement'}
        subtitle="Reach players, captains, or referees inside the SportsYeti mobile app and via push."
        crumbs={[
          { label: 'News & ads', route: 'News' },
          { label: editingId ? 'Edit' : 'Compose' },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
        trailing={
          <>
            <Button
              label="Cancel"
              variant="ghost"
              size="sm"
              onPress={() => navigation.goBack()}
            />
            <Button
              label={
                form.dispatchMode === 'now'
                  ? 'Publish'
                  : form.dispatchMode === 'schedule'
                  ? 'Schedule'
                  : 'Save draft'
              }
              variant="solid"
              size="sm"
              leadingIcon={
                form.dispatchMode === 'now' ? (
                  <Send size={14} color={colors.text.inverse} strokeWidth={2.5} />
                ) : undefined
              }
              onPress={handlePrimary}
            />
          </>
        }
      />

      <View style={styles.layout}>
        <View style={styles.editorCol}>
          <Card style={styles.section}>
            <Text variant="h3" color={colors.text.primary}>
              Message
            </Text>
            <Input
              label="Title"
              value={form.title}
              onChangeText={(v) => update('title', v)}
              error={showError('title')}
              placeholder="Field A turf re-grooming Apr 30"
              maxLength={120}
              helpText={`${form.title.length}/120`}
            />
            <Input
              label="Body"
              variant="multiline"
              value={form.body}
              onChangeText={(v) => update('body', v)}
              error={showError('body')}
              placeholder="What's happening, when, and what action (if any) the recipient should take."
              maxLength={1000}
              helpText={`${form.body.length}/1000`}
            />
          </Card>

          <Card style={styles.section}>
            <Text variant="h3" color={colors.text.primary}>
              Audience
            </Text>
            <View style={styles.audienceList}>
              {AUDIENCE_PRIMARY.map((a) => {
                const selected = form.audienceKind === a.key;
                return (
                  <Pressable
                    key={a.key}
                    onPress={() => update('audienceKind', a.key)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={a.label}
                    style={({ hovered }: WebPressableState) => [
                      styles.audienceRow,
                      selected ? styles.audienceRowSelected : null,
                      hovered && !selected ? styles.audienceRowHover : null,
                    ]}
                  >
                    <View
                      style={[
                        styles.radioDot,
                        selected ? styles.radioDotActive : null,
                      ]}
                    >
                      {selected ? (
                        <Check
                          size={10}
                          color={colors.text.inverse}
                          strokeWidth={3}
                        />
                      ) : null}
                    </View>
                    <Text variant="bodySm" color={colors.text.primary}>
                      {a.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {form.audienceKind === 'league' || form.audienceKind === 'team' ? (
              <Select
                label={form.audienceKind === 'league' ? 'Pick a league' : 'Pick a team'}
                value={form.audienceId}
                options={audienceOptions}
                onChange={(v) => update('audienceId', v)}
                error={showError('audienceId')}
                placeholder={`Select a ${form.audienceKind}`}
              />
            ) : null}
          </Card>

          <Card style={styles.section}>
            <Text variant="h3" color={colors.text.primary}>
              When
            </Text>
            <Tabs
              items={DISPATCH_TABS}
              value={form.dispatchMode}
              onChange={(v) => update('dispatchMode', v as DispatchMode)}
              variant="segmented"
            />
            {form.dispatchMode === 'schedule' ? (
              <Input
                label="Scheduled at (YYYY-MM-DDTHH:MM)"
                value={form.scheduledAtIso}
                onChangeText={(v) => update('scheduledAtIso', v)}
                error={showError('scheduledAtIso')}
                placeholder="2026-04-29T08:00"
              />
            ) : null}
          </Card>
        </View>

        <View style={styles.previewCol}>
          <Card style={styles.previewCard}>
            <View style={styles.previewHead}>
              <Eye size={14} color={colors.brand.primary} strokeWidth={2.25} />
              <Text variant="caption" color={colors.text.muted}>
                LIVE PREVIEW
              </Text>
            </View>
            <View style={styles.previewBody}>
              <View style={styles.previewMeta}>
                <Tag
                  tone={
                    form.dispatchMode === 'draft'
                      ? 'warning'
                      : form.dispatchMode === 'schedule'
                      ? 'info'
                      : 'success'
                  }
                  leadingDot
                  size="sm"
                  label={
                    form.dispatchMode === 'now'
                      ? 'Publishing now'
                      : form.dispatchMode === 'schedule'
                      ? 'Scheduled'
                      : 'Draft'
                  }
                />
                <Tag tone="brand" size="sm" label={audienceLabel(form)} />
              </View>
              <Text variant="h3" color={colors.text.primary}>
                {form.title || 'Your announcement title'}
              </Text>
              <Text variant="bodySm" color={colors.text.primary}>
                {form.body ||
                  "Type the body of your announcement to see it here. Players see this exact text in their mobile app's News tab and as a push notification."}
              </Text>
              <View style={styles.previewFooter}>
                <Megaphone
                  size={12}
                  color={colors.text.muted}
                  strokeWidth={2.25}
                />
                <Text variant="caption" color={colors.text.muted}>
                  {audienceCount(form)} will receive this
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </View>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  layout: {
    flexDirection: 'row',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  editorCol: {
    flex: 2,
    minWidth: 360,
    gap: spacing.md,
  },
  previewCol: {
    flex: 1,
    minWidth: 280,
  },
  section: { gap: spacing.md },

  audienceList: { gap: spacing.xs },
  audienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.soft,
    backgroundColor: colors.surface.card,
  },
  audienceRowHover: { backgroundColor: colors.surface.bg },
  audienceRowSelected: {
    backgroundColor: colors.brand.soft,
    borderColor: colors.brand.primary,
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDotActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },

  previewCard: {
    gap: spacing.sm,
    backgroundColor: colors.brand.soft,
  },
  previewHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  previewBody: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  previewMeta: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  previewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
});
