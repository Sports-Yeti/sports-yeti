import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OrgAvatar, Wordmark } from '@sports-yeti/ui';
import {
  DEMO_ORG_ID,
  organizationById,
  type Organization,
} from '@sports-yeti/mocks';
import {
  PageHeader,
  PageScroll,
  type AdminRouteName,
} from '../../admin';
import { Button, Card, Input, Text, useToast } from '../../ui';
import { OrgBrandingProvider } from '../../features/org-branding';
import { colors, radii, spacing } from '../../theme';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

const PRESET_COLORS = [
  '#006495',
  '#A14A1B',
  '#0E7C66',
  '#7A1FA2',
  '#B91C1C',
  '#0F172A',
  '#FF8766',
];

export function OrgBrandingScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const toast = useToast();
  const initial = useMemo(() => organizationById(DEMO_ORG_ID), []);
  const [primary, setPrimary] = useState(initial?.brandColor ?? '#006495');
  const [accent, setAccent] = useState(initial?.brandColorAccent ?? '#3FB1FA');

  if (!initial) {
    return (
      <PageScroll>
        <PageHeader title="Org not found" />
      </PageScroll>
    );
  }

  // Override the branded subtree with the in-progress edits so the
  // preview block updates live.
  const previewOrg: Organization = {
    ...initial,
    brandColor: primary,
    brandColorAccent: accent,
  };

  return (
    <OrgBrandingProvider org={previewOrg}>
      <PageScroll>
        <PageHeader
          variant="flatHero"
          eyebrow="ORG ADMIN · BRANDING"
          title="Branding"
          subtitle="Brand color overlays the active theme on every org-scoped surface."
          crumbs={[
            { label: 'Organization' },
            { label: initial.name, route: 'OrganizationDetail' },
            { label: 'Branding' },
          ]}
          onNavigate={(r) => navigation.navigate(r)}
        />

        <Card padded>
          <Text variant="h3">Logo + name</Text>
          <View style={[styles.previewRow, { gap: spacing.lg }]}>
            <OrgAvatar
              name={initial.name}
              logoUrl={initial.logoUrl}
              brandColor={primary}
              size="xl"
            />
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="h2">{initial.name}</Text>
              <Text variant="bodySm" color={colors.text.muted}>
                {initial.slug}
              </Text>
              <Wordmark size="md" />
            </View>
          </View>
        </Card>

        <Card padded>
          <Text variant="h3">Brand color</Text>
          <Text variant="body" color={colors.text.secondary}>
            Used as the brand-primary token on every org-scoped surface
            (avatar ring, accents, primary buttons).
          </Text>
          <View style={[styles.swatchRow, { gap: spacing.sm }]}>
            {PRESET_COLORS.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={c === primary ? 'solid' : 'outline'}
                label={c}
                onPress={() => setPrimary(c)}
              />
            ))}
          </View>
          <View style={[styles.row, { gap: spacing.md, marginTop: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text variant="eyebrow" color={colors.text.secondary}>
                Hex
              </Text>
              <Input value={primary} onChangeText={setPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="eyebrow" color={colors.text.secondary}>
                Accent
              </Text>
              <Input value={accent} onChangeText={setAccent} />
            </View>
          </View>
        </Card>

        <Card padded>
          <Text variant="h3">Live preview</Text>
          <View style={[styles.previewBlock, { gap: spacing.sm }]}>
            <View
              style={[
                styles.swatchHero,
                { backgroundColor: primary, borderRadius: radii.lg },
              ]}
            >
              <Text variant="h2" color={colors.text.inverse}>
                Primary
              </Text>
            </View>
            <View
              style={[
                styles.swatchHero,
                { backgroundColor: accent, borderRadius: radii.lg },
              ]}
            >
              <Text variant="h2" color={colors.text.inverse}>
                Accent
              </Text>
            </View>
            <View
              style={[
                styles.swatchHero,
                {
                  borderWidth: 2,
                  borderColor: primary,
                  borderRadius: radii.lg,
                },
              ]}
            >
              <Text variant="h2" color={primary}>
                Outline
              </Text>
            </View>
          </View>
        </Card>

        <View style={[styles.actions, { gap: spacing.sm }]}>
          <Button
            size="md"
            variant="ghost"
            label="Cancel"
            onPress={() => navigation.goBack()}
          />
          <Button
            size="md"
            variant="solid"
            label="Save branding"
            onPress={() =>
              toast.show({
                variant: 'success',
                title: 'Branding saved (mock)',
                description: `${initial.name} colors updated.`,
              })
            }
          />
        </View>
      </PageScroll>
    </OrgBrandingProvider>
  );
}

const styles = StyleSheet.create({
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  previewBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  swatchHero: {
    flex: 1,
    minWidth: 140,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: 12,
  },
});
