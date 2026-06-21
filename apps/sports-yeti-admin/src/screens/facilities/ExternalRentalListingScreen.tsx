import { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Eye, MapPin } from 'lucide-react-native';
import { OrgAvatar } from '@sports-yeti/ui';
import {
  facilityById,
  organizationById,
  rentalConfigForSpace,
  spacesByFacility,
} from '@sports-yeti/mocks';
import { PageHeader, PageScroll, type AdminRouteName } from '../../admin';
import { Button, Card, Tag, Text } from '../../ui';
import { OrgBrandingProvider } from '../../features/org-branding';
import { colors, radii, spacing } from '../../theme';
import { formatCurrency } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

export function ExternalRentalListingScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const facility = useMemo(
    () => facilityById(route.params.id),
    [route.params.id],
  );
  const org = useMemo(
    () => (facility ? organizationById(facility.ownerOrgId) : undefined),
    [facility],
  );
  const externalSpaces = useMemo(() => {
    if (!facility) return [];
    return spacesByFacility(facility.id).filter((s) => {
      const cfg = rentalConfigForSpace(s.id);
      return (
        cfg?.rentalMode === 'external' || cfg?.rentalMode === 'both'
      );
    });
  }, [facility]);

  if (!facility || !org) {
    return (
      <PageScroll>
        <PageHeader title="Listing not found" />
      </PageScroll>
    );
  }

  const inner = (
    <PageScroll>
      <PageHeader
        title="External rental listing — preview"
        subtitle={`Renter-facing preview of ${facility.name}. This is what teams or organizations see when they consider booking.`}
        crumbs={[
          { label: 'Venues' },
          { label: 'Facilities', route: 'Facilities' },
          { label: facility.name, route: 'FacilityDetail' },
          { label: 'External listing' },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
        trailing={
          <View style={[styles.headerTrail, { gap: spacing.sm }]}>
            <Eye size={16} color={colors.text.muted} />
            <Text variant="caption" color={colors.text.muted}>
              Preview · not visible to renters until enabled
            </Text>
          </View>
        }
      />

      <Card padded>
        <View style={[styles.hero, { gap: spacing.md }]}>
          {facility.imageUrls[0] ? (
            <Image
              accessibilityLabel={facility.name}
              source={{ uri: facility.imageUrls[0] }}
              style={styles.heroImage}
            />
          ) : null}
          <View style={[styles.heroOverlay, { gap: spacing.sm }]}>
            <OrgAvatar
              name={org.name}
              logoUrl={org.logoUrl}
              brandColor={org.brandColor}
              size="lg"
            />
            <Text variant="h2">{facility.name}</Text>
            <View style={[styles.iconRow, { gap: spacing.xs }]}>
              <MapPin size={16} color={colors.text.muted} />
              <Text variant="bodySm" color={colors.text.secondary}>
                {facility.address}, {facility.city}, {facility.state}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      <Card padded>
        <Text variant="h3">Available spaces</Text>
        {externalSpaces.length === 0 ? (
          <Text variant="body" color={colors.text.secondary}>
            No spaces are currently listed for external rental. Toggle a
            space's rental mode to "external" or "both" to start accepting
            requests.
          </Text>
        ) : (
          externalSpaces.map((s) => {
            const cfg = rentalConfigForSpace(s.id);
            return (
              <View key={s.id} style={[styles.spaceCard, { gap: spacing.sm }]}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text variant="bodySm" weight="600">
                    {s.name}
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    {s.surface} · {s.isIndoor ? 'Indoor' : 'Outdoor'} ·
                    capacity {s.capacity}
                  </Text>
                  <View style={[styles.metaRow, { gap: spacing.xs }]}>
                    {s.sports.map((sp) => (
                      <Tag key={sp} size="sm" tone="info" label={sp} />
                    ))}
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  {cfg?.externalHourlyRateCents ? (
                    <Text variant="h3" color={colors.brand.primary}>
                      {formatCurrency(cfg.externalHourlyRateCents)}
                      <Text variant="bodySm" color={colors.text.muted}>
                        /hr
                      </Text>
                    </Text>
                  ) : null}
                  <Button
                    size="sm"
                    variant="solid"
                    label="Request booking"
                    onPress={() => undefined}
                  />
                </View>
              </View>
            );
          })
        )}
      </Card>

      <Card padded>
        <Text variant="h3">Amenities</Text>
        <View style={[styles.metaRow, { gap: spacing.xs }]}>
          {facility.amenities.map((a) => (
            <Tag key={a} size="sm" tone="neutral" label={a} />
          ))}
        </View>
      </Card>
    </PageScroll>
  );

  return <OrgBrandingProvider org={org}>{inner}</OrgBrandingProvider>;
}

const styles = StyleSheet.create({
  headerTrail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  heroImage: {
    width: 240,
    height: 160,
    borderRadius: radii.md,
  },
  heroOverlay: {
    flex: 1,
    minWidth: 240,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});
