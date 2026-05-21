import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import MapView, { Circle, Marker, type Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Crosshair, MapPin } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../theme';
import {
  DEFAULT_MAP_CENTER,
  type GeoPoint,
} from '../mocks/facilities';
import { Tabs } from './Tabs';
import { Text } from './Text';

export interface RadiusCenter extends GeoPoint {
  /** Friendly label rendered under the map, e.g. "Current location" or city name. */
  label: string;
}

export interface RadiusMapPickerProps {
  /** The chosen center (or null to fall back to default + autodetect). */
  center: RadiusCenter | null;
  onChangeCenter: (center: RadiusCenter) => void;
  /** Selected radius in miles. */
  radiusMiles: number;
  onChangeRadius: (miles: number) => void;
  /** Selectable radius values shown in the segmented control. */
  radiusOptions?: number[];
  /** Optional fixed markers (e.g. facilities) drawn on the map. */
  markers?: Array<{ id: string; coords: GeoPoint; label?: string }>;
  /** Override the map height in dp. */
  mapHeight?: number;
}

const DEFAULT_RADIUS_OPTIONS = [1, 3, 5, 10, 25, 50];

function regionFor(center: GeoPoint, radiusMiles: number): Region {
  // 1° latitude ≈ 69 mi; the multiplier (~2.4) keeps the circle + a margin visible.
  const latitudeDelta = Math.max((radiusMiles * 2.4) / 69, 0.02);
  // Longitude degrees shrink with latitude; use ~cos(lat) to compensate.
  const cos = Math.cos((center.latitude * Math.PI) / 180);
  const longitudeDelta = latitudeDelta / Math.max(cos, 0.1);
  return {
    latitude: center.latitude,
    longitude: center.longitude,
    latitudeDelta,
    longitudeDelta,
  };
}

/**
 * Map-based radius selector. Users can:
 *  - tap "Use my location" to recenter on their current GPS position
 *  - long-press the map to drop a new center pin
 *  - pick the radius from a segmented control
 *
 * The map preserves its `Circle` overlay so the radius is always rendered
 * to scale. Falls back gracefully when location permission is denied.
 */
export function RadiusMapPicker({
  center,
  onChangeCenter,
  radiusMiles,
  onChangeRadius,
  radiusOptions = DEFAULT_RADIUS_OPTIONS,
  markers,
  mapHeight = 240,
}: RadiusMapPickerProps) {
  const mapRef = useRef<MapView | null>(null);
  const [locating, setLocating] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const effectiveCenter: RadiusCenter = useMemo(
    () =>
      center ?? {
        ...DEFAULT_MAP_CENTER,
        label: 'Default area · Denver',
      },
    [center],
  );

  // Animate the camera whenever center / radius change so the circle is always framed.
  useEffect(() => {
    const region = regionFor(effectiveCenter, radiusMiles);
    mapRef.current?.animateToRegion(region, 400);
  }, [effectiveCenter, radiusMiles]);

  const useMyLocation = useCallback(async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        return;
      }
      setPermissionDenied(false);
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      onChangeCenter({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        label: 'Current location',
      });
    } catch {
      setPermissionDenied(true);
    } finally {
      setLocating(false);
    }
  }, [onChangeCenter]);

  return (
    <View style={styles.container}>
      <View style={[styles.mapWrap, { height: mapHeight }]}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={regionFor(effectiveCenter, radiusMiles)}
          // Tap-and-hold to recenter.
          onLongPress={(e) =>
            onChangeCenter({
              ...e.nativeEvent.coordinate,
              label: 'Dropped pin',
            })
          }
          showsUserLocation={!permissionDenied}
          showsMyLocationButton={false}
          toolbarEnabled={false}
          loadingEnabled
          accessibilityLabel="Radius map"
        >
          <Circle
            center={effectiveCenter}
            radius={radiusMiles * 1609.34}
            strokeColor={colors.brand.primary}
            strokeWidth={2}
            fillColor="rgba(0,100,149,0.12)"
          />
          <Marker coordinate={effectiveCenter} pinColor={colors.brand.primary} />
          {markers?.map((m) => (
            <Marker
              key={m.id}
              coordinate={m.coords}
              title={m.label}
              pinColor={colors.brand.accent}
            />
          ))}
        </MapView>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Use my current location"
          accessibilityState={{ busy: locating }}
          onPress={useMyLocation}
          style={({ pressed }) => [
            styles.locateBtn,
            shadows.card,
            pressed ? styles.pressed : null,
          ]}
        >
          {locating ? (
            <ActivityIndicator color={colors.brand.primary} size="small" />
          ) : (
            <Crosshair
              size={18}
              color={colors.brand.primary}
              strokeWidth={2.5}
            />
          )}
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <MapPin size={14} color={colors.text.secondary} strokeWidth={2.25} />
        <Text variant="bodySm" color={colors.text.secondary} style={styles.flex1}>
          {effectiveCenter.label}
        </Text>
        <Text variant="button" color={colors.brand.primary}>
          {radiusMiles} mi
        </Text>
      </View>

      <Tabs
        variant="segmented"
        items={radiusOptions.map((r) => ({
          key: String(r),
          label: `${r} mi`,
        }))}
        value={String(radiusMiles)}
        onChange={(k) => onChangeRadius(Number(k))}
      />

      {permissionDenied ? (
        <Text variant="caption" color={colors.status.error}>
          Location permission was denied. Long-press the map to drop a pin,
          or update permission in Settings.
        </Text>
      ) : (
        <Text variant="caption" color={colors.text.muted}>
          Tap-and-hold the map to recenter.{Platform.OS === 'web' ? '' : ''}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  mapWrap: {
    width: '100%',
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface.chip,
    position: 'relative',
  },
  locateBtn: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.card,
  },
  pressed: {
    opacity: 0.8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
});
