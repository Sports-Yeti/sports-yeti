import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CreditCard, Smartphone } from 'lucide-react-native';
import { SocialChannelChip } from '@sports-yeti/ui';
import {
  DEMO_ORG_ID,
  organizationById,
  type SocialChannel,
} from '@sports-yeti/mocks';
import {
  PageHeader,
  PageScroll,
  type AdminRouteName,
} from '../../admin';
import { Button, Card, Tag, Text, useToast } from '../../ui';
import { OrgBrandingProvider } from '../../features/org-branding';
import { colors, spacing } from '../../theme';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const ALL_CHANNELS: SocialChannel[] = [
  'x',
  'facebook',
  'instagram',
  'linkedin',
];

export function OrgIntegrationsScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const toast = useToast();
  const org = useMemo(() => organizationById(DEMO_ORG_ID), []);

  if (!org) {
    return (
      <PageScroll>
        <PageHeader title="Org not found" />
      </PageScroll>
    );
  }

  return (
    <OrgBrandingProvider org={org}>
      <PageScroll>
        <PageHeader
          variant="flatHero"
          eyebrow="ORG ADMIN · INTEGRATIONS"
          title="Integrations"
          subtitle="Social channels for cross-posting, payment processor, and push notifications."
          crumbs={[
            { label: 'Organization' },
            { label: org.name, route: 'OrganizationDetail' },
            { label: 'Integrations' },
          ]}
          onNavigate={(r) => navigation.navigate(r)}
        />

        <Card padded>
          <Text variant="h3">Social channels</Text>
          <Text variant="body" color={colors.text.secondary}>
            Cross-post news + promotions to these channels from the News
            composer.
          </Text>
          <View style={[styles.row, { gap: spacing.sm, marginTop: 12 }]}>
            {ALL_CHANNELS.map((ch) => (
              <SocialChannelChip
                key={ch}
                channel={ch}
                status={org.socialIntegrationStatus[ch] ?? 'disconnected'}
                onPress={() =>
                  toast.show({
                    variant: 'info',
                    title: `${ch} OAuth (mock)`,
                    description:
                      org.socialIntegrationStatus[ch] === 'connected'
                        ? 'Disconnect flow opens in production.'
                        : 'OAuth redirect opens in production.',
                  })
                }
              />
            ))}
          </View>
        </Card>

        <Card padded>
          <View style={[styles.cardHead, { gap: spacing.sm }]}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="h3">Stripe Connect</Text>
              <Text variant="body" color={colors.text.secondary}>
                Used for league fee collection, external rental payouts, and
                referee payouts.
              </Text>
            </View>
            <CreditCard size={28} color={colors.brand.primary} />
          </View>
          <View style={[styles.row, { gap: spacing.sm }]}>
            <Tag size="md" tone="success" label="Connected (mock)" leadingDot />
            <Button
              size="sm"
              variant="outline"
              label="Open Stripe dashboard"
              onPress={() =>
                toast.show({
                  variant: 'info',
                  title: 'Opens Stripe dashboard',
                  description: 'External link in production.',
                })
              }
            />
          </View>
        </Card>

        <Card padded>
          <View style={[styles.cardHead, { gap: spacing.sm }]}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="h3">Push notifications</Text>
              <Text variant="body" color={colors.text.secondary}>
                Expo push provider — used for game reminders, schedule
                releases, sub-request alerts.
              </Text>
            </View>
            <Smartphone size={28} color={colors.brand.primary} />
          </View>
          <View style={[styles.row, { gap: spacing.sm }]}>
            <Tag size="md" tone="success" label="Active (mock)" leadingDot />
            <Button
              size="sm"
              variant="outline"
              label="Send test"
              onPress={() =>
                toast.show({
                  variant: 'info',
                  title: 'Test push sent (mock)',
                  description: 'Goes to your registered devices.',
                })
              }
            />
          </View>
        </Card>
      </PageScroll>
    </OrgBrandingProvider>
  );
}

const styles = StyleSheet.create({
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});
