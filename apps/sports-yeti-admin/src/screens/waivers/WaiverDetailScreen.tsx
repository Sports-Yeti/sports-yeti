import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Download, Edit3, FileText } from 'lucide-react-native';
import {
  PageHeader,
  PageScroll,
  StatCard,
  type AdminRouteName,
} from '../../admin';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Tag,
  Text,
  useToast,
} from '../../ui';
import { colors, spacing } from '../../theme';
import { signaturesFor, waiverById } from '../../mocks/waivers';
import { formatDate, formatPercent, formatRelative } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

export function WaiverDetailScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const toast = useToast();
  const waiver = waiverById(route.params.id);

  if (!waiver) {
    return (
      <PageScroll>
        <PageHeader
          title="Waiver not found"
          crumbs={[{ label: 'Waivers', route: 'Waivers' }, { label: '—' }]}
          onNavigate={(r) => navigation.navigate(r)}
        />
        <EmptyState
          title="Waiver not found"
          primaryAction={{
            label: 'Back to waivers',
            onPress: () => navigation.navigate('Waivers'),
          }}
        />
      </PageScroll>
    );
  }

  const signatures = signaturesFor(waiver.id);

  return (
    <PageScroll>
      <PageHeader
        title={waiver.title}
        subtitle={waiver.leagueName}
        crumbs={[
          { label: 'Waivers', route: 'Waivers' },
          { label: waiver.title },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
        meta={`Effective ${formatDate(waiver.effectiveIso)}${waiver.expiresIso ? ` · expires ${formatDate(waiver.expiresIso)}` : ''}`}
        trailing={
          <>
            <Button
              label="Export CSV"
              variant="ghost"
              size="sm"
              leadingIcon={<Download size={14} color={colors.brand.primary} strokeWidth={2.25} />}
              onPress={() =>
                toast.show({ variant: 'success', title: 'CSV exported (mock)' })
              }
            />
            <Button
              label="Edit"
              variant="solid"
              size="sm"
              leadingIcon={<Edit3 size={14} color={colors.text.inverse} strokeWidth={2.25} />}
              onPress={() => toast.show({ variant: 'info', title: 'Waiver editor coming soon' })}
            />
          </>
        }
      />

      <View style={styles.statsRow}>
        <StatCard
          label="Required"
          value={waiver.isRequired ? 'Yes' : 'No'}
          tone={waiver.isRequired ? 'warning' : 'brand'}
          icon={<FileText size={14} color={colors.brand.deep} strokeWidth={2.25} />}
        />
        <StatCard
          label="Signatures"
          value={`${waiver.signatureCount} / ${waiver.totalRequired}`}
          helper={`${formatPercent(waiver.signatureCount, waiver.totalRequired)} complete`}
          tone="success"
        />
        <StatCard
          label="Outstanding"
          value={String(Math.max(0, waiver.totalRequired - waiver.signatureCount))}
          helper="players still need to sign"
          tone="warning"
        />
      </View>

      <Card>
        <Text variant="h3" color={colors.text.primary}>
          Document
        </Text>
        <Text variant="body" color={colors.text.primary}>
          {waiver.bodyExcerpt}
        </Text>
      </Card>

      <Card>
        <Text variant="h3" color={colors.text.primary}>
          Recent signatures ({signatures.length})
        </Text>
        {signatures.slice(0, 8).map((s) => (
          <View key={s.id} style={styles.sigRow}>
            <Avatar uri={s.playerAvatar} initials={s.playerName.charAt(0)} size={28} />
            <View style={styles.sigBody}>
              <Text variant="bodySm" color={colors.text.primary}>
                {s.playerName}
              </Text>
              <Text variant="caption" color={colors.text.muted}>
                {s.ipAddress} · {formatRelative(s.signedAtIso)}
              </Text>
            </View>
            <Tag size="sm" tone="success" leadingDot label="Signed" />
          </View>
        ))}
      </Card>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  sigRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
  },
  sigBody: {
    flex: 1,
    gap: 2,
  },
});
