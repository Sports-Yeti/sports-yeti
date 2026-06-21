import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { type WebPressableState } from '../../lib/pressable';
import { Check, MailPlus, Sparkles } from 'lucide-react-native';
import { PageHeader, PageScroll, type AdminRouteName } from '../../admin';
import {
  Button,
  Card,
  Input,
  Select,
  Tag,
  Text,
  useToast,
} from '../../ui';
import { colors, radii, spacing } from '../../theme';
import { LEAGUES } from '../../mocks/leagues';
import {
  useInviteStore,
  type InviteKind,
  type PendingInvite,
} from '../../stores';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

type Mode = 'people' | 'teammate';

const PEOPLE_ROLES: { key: InviteKind; label: string; description: string }[] = [
  {
    key: 'player',
    label: 'Player',
    description: 'Joins a team roster and pays a player share.',
  },
  {
    key: 'referee',
    label: 'Referee',
    description: 'Receives game assignments and earns per match.',
  },
  {
    key: 'coach',
    label: 'Coach',
    description: 'Read-only access to team chat + roster.',
  },
  {
    key: 'parent',
    label: 'Parent / guardian',
    description: 'Receives waivers, payment receipts, and game reminders.',
  },
];

const TEAMMATE_ROLES: { key: InviteKind; label: string; description: string }[] = [
  {
    key: 'admin',
    label: 'Admin',
    description: 'Full org access — leagues, teams, money, settings.',
  },
  {
    key: 'manager',
    label: 'Manager',
    description: 'Run leagues, schedule, bookings. No billing or settings.',
  },
  {
    key: 'viewer',
    label: 'Viewer',
    description: 'Read-only across the entire org.',
  },
];

interface FormState {
  emailsRaw: string;
  role: InviteKind;
  leagueId: string;
  message: string;
}

function modeFromKind(kind: string | undefined): Mode {
  if (kind === 'admin' || kind === 'manager' || kind === 'viewer' || kind === 'teammate') {
    return 'teammate';
  }
  return 'people';
}

function defaultRole(mode: Mode, kind: string | undefined): InviteKind {
  if (mode === 'teammate') {
    if (kind === 'manager' || kind === 'viewer' || kind === 'admin') return kind;
    return 'admin';
  }
  if (kind === 'referee' || kind === 'coach' || kind === 'parent' || kind === 'player') {
    return kind;
  }
  return 'player';
}

function parseEmails(raw: string): string[] {
  // split by comma, semicolon, or newline; trim, lowercase, dedupe
  const parts = raw
    .split(/[\n,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set(parts));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InvitePeopleScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id?: string } }, 'params'>>();
  const seedKind = route.params?.id;
  const mode = modeFromKind(seedKind);
  const initialRole = defaultRole(mode, seedKind);
  const toast = useToast();
  const addInvites = useInviteStore((s) => s.addInvites);

  const [form, setForm] = useState<FormState>({
    emailsRaw: '',
    role: initialRole,
    leagueId:
      mode === 'people' && LEAGUES[0]?.status === 'published'
        ? LEAGUES[0].id
        : '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const emails = useMemo(() => parseEmails(form.emailsRaw), [form.emailsRaw]);
  const validEmails = emails.filter((e) => EMAIL_RE.test(e));
  const invalidEmails = emails.filter((e) => !EMAIL_RE.test(e));

  const errors = {
    emails:
      emails.length === 0
        ? 'Add at least one email'
        : invalidEmails.length > 0
        ? `${invalidEmails.length} email${invalidEmails.length === 1 ? '' : 's'} look invalid`
        : undefined,
  } as const;

  const showError = (key: keyof typeof errors) =>
    submitted ? errors[key] : undefined;
  const isValid = !errors.emails;

  const ROLES = mode === 'people' ? PEOPLE_ROLES : TEAMMATE_ROLES;
  const selectedRole = ROLES.find((r) => r.key === form.role) ?? ROLES[0]!;

  const handleSend = () => {
    setSubmitted(true);
    if (!isValid) {
      toast.show({ variant: 'warning', title: 'Fix the highlighted fields' });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const invites: PendingInvite[] = validEmails.map((email, i) => ({
        id: `inv-${Date.now()}-${i}`,
        email,
        kind: form.role,
        leagueId:
          mode === 'people' && form.leagueId ? form.leagueId : undefined,
        message: form.message.trim() || undefined,
        sentAtIso: new Date().toISOString(),
      }));
      addInvites(invites);
      setSubmitting(false);
      toast.show({
        variant: 'success',
        title: `Sent ${validEmails.length} invite${validEmails.length === 1 ? '' : 's'}`,
        description: `${selectedRole.label}${
          mode === 'people' && form.leagueId
            ? ` · ${LEAGUES.find((l) => l.id === form.leagueId)?.name ?? ''}`
            : ''
        }`,
      });
      navigation.goBack();
    }, 600);
  };

  const parentCrumb: { label: string; route?: AdminRouteName } = (() => {
    if (mode === 'teammate') return { label: 'Settings', route: 'Settings' };
    if (initialRole === 'referee') return { label: 'Referees', route: 'Referees' };
    return { label: 'Players', route: 'Players' };
  })();

  return (
    <PageScroll>
      <PageHeader
        title={mode === 'teammate' ? 'Invite teammate' : 'Invite people'}
        subtitle={
          mode === 'teammate'
            ? 'Add admins, managers, or viewers to your organization.'
            : 'Send an invite — recipients sign up via email and land on their player profile.'
        }
        crumbs={[parentCrumb, { label: 'Invite' }]}
        onNavigate={(r) => navigation.navigate(r)}
        trailing={
          <>
            <Button
              label="Cancel"
              variant="ghost"
              size="sm"
              onPress={() => navigation.goBack()}
              disabled={submitting}
            />
            <Button
              label={
                submitting
                  ? 'Sending…'
                  : `Send ${validEmails.length || ''} invite${validEmails.length === 1 ? '' : 's'}`.trim()
              }
              variant="solid"
              size="sm"
              leadingIcon={
                <MailPlus
                  size={14}
                  color={colors.text.inverse}
                  strokeWidth={2.25}
                />
              }
              onPress={handleSend}
              disabled={submitting}
            />
          </>
        }
      />

      <Card style={styles.section}>
        <Text variant="h3" color={colors.text.primary}>
          Recipients
        </Text>
        <Input
          label="Emails (one per line, comma-separated, or semicolon-separated)"
          variant="multiline"
          value={form.emailsRaw}
          onChangeText={(v) => update('emailsRaw', v)}
          error={showError('emails')}
          placeholder={
            mode === 'teammate'
              ? 'priya@yetiathletic.com\nsam@yetiathletic.com'
              : 'marcus@email.com, ash@email.com\ntara@email.com'
          }
          helpText="Pasting from a spreadsheet works — we split on common separators."
        />
        {emails.length > 0 ? (
          <View style={styles.tagRow}>
            <Tag
              tone={validEmails.length > 0 ? 'success' : 'neutral'}
              size="sm"
              leadingDot
              label={`${validEmails.length} valid`}
            />
            {invalidEmails.length > 0 ? (
              <Tag
                tone="live"
                size="sm"
                leadingDot
                label={`${invalidEmails.length} invalid`}
              />
            ) : null}
          </View>
        ) : null}
        {invalidEmails.length > 0 ? (
          <Text variant="caption" color={colors.status.error}>
            Skipped: {invalidEmails.join(', ')}
          </Text>
        ) : null}
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" color={colors.text.primary}>
          Role
        </Text>
        <View style={styles.roleList}>
          {ROLES.map((r) => {
            const selected = form.role === r.key;
            return (
              <Pressable
                key={r.key}
                onPress={() => update('role', r.key)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={r.label}
                style={({ hovered }: WebPressableState) => [
                  styles.roleRow,
                  selected ? styles.roleRowSelected : null,
                  hovered && !selected ? styles.roleRowHover : null,
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
                <View style={styles.roleBody}>
                  <Text variant="bodySm" color={colors.text.primary} weight="600">
                    {r.label}
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    {r.description}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {mode === 'people' ? (
        <Card style={styles.section}>
          <Text variant="h3" color={colors.text.primary}>
            League (optional)
          </Text>
          <Select
            label="Pre-assign to league"
            value={form.leagueId}
            options={[
              { value: '', label: 'No league — they pick later' },
              ...LEAGUES.filter((l) => l.status !== 'archived').map((l) => ({
                value: l.id,
                label: `${l.name} · ${l.seasonName}`,
              })),
            ]}
            onChange={(v) => update('leagueId', v)}
          />
          <Text variant="caption" color={colors.text.muted}>
            When set, the invitee lands directly on this league's registration screen.
          </Text>
        </Card>
      ) : null}

      <Card style={styles.section}>
        <Text variant="h3" color={colors.text.primary}>
          Message (optional)
        </Text>
        <Input
          variant="multiline"
          value={form.message}
          onChangeText={(v) => update('message', v)}
          placeholder={
            mode === 'teammate'
              ? "Hey — I'm adding you to the org so we can split league ops 50/50. Holler if anything looks off."
              : "We'd love to have you in Mile High Spring this season. The league pages have everything you need."
          }
          maxLength={500}
          helpText={`${form.message.length}/500`}
        />
      </Card>

      <Card style={[styles.section, styles.summaryCard]}>
        <View style={styles.summaryHead}>
          <Sparkles size={14} color={colors.brand.primary} strokeWidth={2.25} />
          <Text variant="caption" color={colors.text.muted}>
            SUMMARY
          </Text>
        </View>
        <Text variant="bodySm" color={colors.text.primary}>
          {validEmails.length} invite{validEmails.length === 1 ? '' : 's'} as{' '}
          <Text variant="bodySm" color={colors.brand.primary} weight="600">
            {selectedRole.label}
          </Text>
          {mode === 'people' && form.leagueId ? (
            <>
              {' '}for{' '}
              <Text variant="bodySm" color={colors.brand.primary} weight="600">
                {LEAGUES.find((l) => l.id === form.leagueId)?.name ?? '—'}
              </Text>
            </>
          ) : null}
          .
        </Text>
        <Text variant="caption" color={colors.text.muted}>
          Invites expire in 14 days. Each recipient can accept once.
        </Text>
      </Card>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  tagRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  roleList: { gap: spacing.sm },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.soft,
    backgroundColor: colors.surface.card,
  },
  roleRowHover: { backgroundColor: colors.surface.bg },
  roleRowSelected: {
    backgroundColor: colors.brand.soft,
    borderColor: colors.brand.primary,
  },
  roleBody: { flex: 1, gap: 2 },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDotActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  summaryCard: {
    backgroundColor: colors.brand.soft,
  },
  summaryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
