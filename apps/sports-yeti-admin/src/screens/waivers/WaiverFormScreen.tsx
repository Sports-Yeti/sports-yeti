import React, { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { PageHeader, PageScroll, type AdminRouteName } from '../../admin';
import { Button, Card, Input, Select, Text, useToast } from '../../ui';
import { colors, spacing } from '../../theme';
import { LEAGUES } from '../../mocks/leagues';
import { WAIVERS } from '../../mocks/waivers';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

interface FormState {
  leagueId: string;
  title: string;
  isRequired: boolean;
  effectiveIso: string;
  expiresIso: string;
  bodyExcerpt: string;
}

function buildInitial(id?: string): FormState {
  if (!id) {
    return {
      leagueId: LEAGUES[0]?.id ?? '',
      title: '',
      isRequired: true,
      effectiveIso: '',
      expiresIso: '',
      bodyExcerpt: '',
    };
  }
  const waiver = WAIVERS.find((w) => w.id === id);
  if (!waiver) return buildInitial(undefined);
  return {
    leagueId: waiver.leagueId,
    title: waiver.title,
    isRequired: waiver.isRequired,
    effectiveIso: waiver.effectiveIso.slice(0, 10),
    expiresIso: waiver.expiresIso ? waiver.expiresIso.slice(0, 10) : '',
    bodyExcerpt: waiver.bodyExcerpt,
  };
}

export function WaiverFormScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id?: string } }, 'params'>>();
  const editingId = route.params?.id;
  const toast = useToast();
  const [form, setForm] = useState<FormState>(() => buildInitial(editingId));
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const errors = {
    title: form.title.trim().length < 5 ? 'At least 5 characters' : undefined,
    leagueId: !form.leagueId ? 'Pick a league' : undefined,
    effectiveIso: !/^\d{4}-\d{2}-\d{2}$/.test(form.effectiveIso)
      ? 'Use YYYY-MM-DD'
      : undefined,
    expiresIso:
      form.expiresIso && !/^\d{4}-\d{2}-\d{2}$/.test(form.expiresIso)
        ? 'Use YYYY-MM-DD'
        : form.expiresIso && form.expiresIso < form.effectiveIso
        ? 'Must be after effective date'
        : undefined,
    bodyExcerpt: form.bodyExcerpt.trim().length < 20 ? 'At least 20 characters' : undefined,
  } as const;

  const showError = (key: keyof typeof errors) =>
    submitted ? errors[key] : undefined;
  const isValid = Object.values(errors).every((e) => !e);

  const handleSave = () => {
    setSubmitted(true);
    if (!isValid) {
      toast.show({ variant: 'warning', title: 'Fix the highlighted fields' });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.show({
        variant: 'success',
        title: editingId ? `${form.title} updated` : `${form.title} created`,
        description: form.isRequired
          ? 'Players must re-sign to participate.'
          : 'Players can sign at their option.',
      });
      navigation.goBack();
    }, 600);
  };

  const leagueOptions = LEAGUES.map((l) => ({ value: l.id, label: l.name }));

  return (
    <PageScroll>
      <PageHeader
        title={editingId ? 'Edit waiver' : 'New waiver'}
        subtitle="Legal document players sign to participate. Updates send a re-signing prompt to anyone affected."
        crumbs={[
          { label: 'Waivers', route: 'Waivers' },
          { label: editingId ? form.title || 'Edit' : 'New' },
        ]}
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
              label={submitting ? 'Saving…' : editingId ? 'Save changes' : 'Create waiver'}
              variant="solid"
              size="sm"
              onPress={handleSave}
              disabled={submitting}
            />
          </>
        }
      />

      <Card style={styles.section}>
        <Text variant="h3" color={colors.text.primary}>
          Basics
        </Text>
        <Input
          label="Title"
          value={form.title}
          onChangeText={(v) => update('title', v)}
          error={showError('title')}
          placeholder="General Liability Release · 2026"
        />
        <Select
          label="League"
          value={form.leagueId}
          options={leagueOptions}
          onChange={(v) => update('leagueId', v)}
          error={showError('leagueId')}
          placeholder="Pick a league"
        />
        <View style={styles.toggleRow}>
          <View style={styles.toggleBody}>
            <Text variant="bodySm" color={colors.text.primary} weight="600">
              Required to play
            </Text>
            <Text variant="caption" color={colors.text.muted}>
              Required waivers block check-in until signed.
            </Text>
          </View>
          <Switch
            value={form.isRequired}
            onValueChange={(v) => update('isRequired', v)}
            trackColor={{ false: colors.surface.chip, true: colors.brand.primary }}
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" color={colors.text.primary}>
          Validity
        </Text>
        <View style={styles.row}>
          <Input
            label="Effective (YYYY-MM-DD)"
            value={form.effectiveIso}
            onChangeText={(v) => update('effectiveIso', v)}
            error={showError('effectiveIso')}
            placeholder="2026-01-01"
            containerStyle={styles.flex}
          />
          <Input
            label="Expires (optional)"
            value={form.expiresIso}
            onChangeText={(v) => update('expiresIso', v)}
            error={showError('expiresIso')}
            placeholder="2026-12-31"
            helpText="Leave blank for evergreen waivers"
            containerStyle={styles.flex}
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" color={colors.text.primary}>
          Body
        </Text>
        <Input
          label="Excerpt shown in mobile app"
          variant="multiline"
          value={form.bodyExcerpt}
          onChangeText={(v) => update('bodyExcerpt', v)}
          error={showError('bodyExcerpt')}
          helpText="Full PDF upload arrives with backend wiring. The excerpt is what players read inline before signing."
          placeholder="I assume the risks inherent in athletic participation…"
        />
      </Card>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  flex: { flex: 1, minWidth: 220 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  toggleBody: { flex: 1, gap: 2 },
});
