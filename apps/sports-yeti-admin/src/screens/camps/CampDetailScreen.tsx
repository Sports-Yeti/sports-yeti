import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Edit3, Tent } from 'lucide-react-native';
import {
  PageHeader,
  PageScroll,
  StatCard,
  type AdminRouteName,
} from '../../admin';
import { Button, Card, EmptyState, Tag, Text, useToast } from '../../ui';
import { colors, radii, spacing } from '../../theme';
import { campById, STATUS_LABEL } from '../../mocks/camps';
import { formatCurrency, formatDate } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

export function CampDetailScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const toast = useToast();
  const camp = campById(route.params.id);

  if (!camp) {
    return (
      <PageScroll>
        <PageHeader
          title="Camp not found"
          crumbs={[{ label: 'Camps', route: 'Camps' }, { label: '—' }]}
          onNavigate={(r) => navigation.navigate(r)}
        />
        <EmptyState
          title="Camp not found"
          primaryAction={{ label: 'Back to camps', onPress: () => navigation.navigate('Camps') }}
        />
      </PageScroll>
    );
  }

  return (
    <PageScroll>
      <PageHeader
        title={camp.name}
        subtitle={`${camp.sportLabel} · ${camp.city}`}
        crumbs={[
          { label: 'Camps', route: 'Camps' },
          { label: camp.name },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
        meta={`${formatDate(camp.startIso)} – ${formatDate(camp.endIso)}`}
        trailing={
          <Button
            label="Edit camp"
            variant="ghost"
            size="sm"
            leadingIcon={<Edit3 size={14} color={colors.brand.primary} strokeWidth={2.25} />}
            onPress={() => toast.show({ variant: 'info', title: 'Camp editor coming soon' })}
          />
        }
      />

      <Image source={{ uri: camp.cover }} style={styles.cover} />

      <View style={styles.statsRow}>
        <StatCard
          label="Status"
          value={STATUS_LABEL[camp.status]}
          tone={camp.status === 'open' ? 'success' : 'warning'}
          icon={<Tent size={14} color={colors.brand.deep} strokeWidth={2.25} />}
        />
        <StatCard
          label="Registered"
          value={`${camp.registered} / ${camp.capacity}`}
          helper={`${Math.round((camp.registered / camp.capacity) * 100)}% full`}
          tone="brand"
        />
        <StatCard
          label="Fee"
          value={formatCurrency(camp.feeCents)}
          helper="per registration"
          tone="brand"
        />
        <StatCard
          label="Age group"
          value={camp.ageGroup}
          tone="brand"
        />
      </View>

      <Card>
        <Text variant="h3" color={colors.text.primary}>
          About this camp
        </Text>
        <Text variant="body" color={colors.text.primary}>
          {camp.description}
        </Text>
      </Card>

      <Card>
        <Text variant="h3" color={colors.text.primary}>
          Roster preview
        </Text>
        <Text variant="bodySm" color={colors.text.muted}>
          {camp.registered} signed up. Roster CSV export will appear here once we wire registrations
          to the API.
        </Text>
      </Card>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  cover: {
    width: '100%',
    height: 220,
    borderRadius: radii.card,
    backgroundColor: colors.surface.chip,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
