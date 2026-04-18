import React, { useMemo, useState } from 'react';
import { type WebPressableState } from '../lib/pressable';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { ChevronRight, Search } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../theme';
import { Text } from '../ui';
import { LEAGUES } from '../mocks/leagues';
import { TEAMS } from '../mocks/teams';
import { PEOPLE } from '../mocks/people';
import { FACILITIES } from '../mocks/facilities';
import { PAYMENTS } from '../mocks/payments';
import { BOOKINGS } from '../mocks/bookings';
import {
  NAV_GROUPS,
  ROUTE_LABELS,
  SETTINGS_ITEM,
  type AdminRouteName,
} from './nav';

type ResultKind = 'navigate' | 'league' | 'team' | 'person' | 'facility' | 'payment' | 'booking';

interface PaletteResult {
  id: string;
  kind: ResultKind;
  label: string;
  hint?: string;
  route: AdminRouteName;
}

interface CommandPaletteProps {
  visible: boolean;
  onRequestClose: () => void;
  onNavigate: (route: AdminRouteName) => void;
}

function buildIndex(): PaletteResult[] {
  const items: PaletteResult[] = [];
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      items.push({
        id: `nav-${item.id}`,
        kind: 'navigate',
        label: `Go to ${item.label}`,
        hint: group.label,
        route: item.route,
      });
    }
  }
  items.push({
    id: 'nav-settings',
    kind: 'navigate',
    label: `Go to ${SETTINGS_ITEM.label}`,
    hint: 'Settings',
    route: SETTINGS_ITEM.route,
  });
  for (const l of LEAGUES) {
    items.push({
      id: `league-${l.id}`,
      kind: 'league',
      label: l.name,
      hint: `${l.sportLabel} · ${l.city}`,
      route: 'LeagueDetail',
    });
  }
  for (const t of TEAMS) {
    items.push({
      id: `team-${t.id}`,
      kind: 'team',
      label: t.name,
      hint: `${t.leagueName}`,
      route: 'TeamDetail',
    });
  }
  for (const p of PEOPLE.slice(0, 30)) {
    items.push({
      id: `person-${p.id}`,
      kind: 'person',
      label: p.name,
      hint: `${p.kind} · ${p.city}`,
      route: p.kind === 'referee' ? 'Referees' : 'Players',
    });
  }
  for (const f of FACILITIES) {
    items.push({
      id: `facility-${f.id}`,
      kind: 'facility',
      label: f.name,
      hint: f.city,
      route: 'FacilityDetail',
    });
  }
  for (const pay of PAYMENTS.slice(0, 10)) {
    items.push({
      id: `payment-${pay.id}`,
      kind: 'payment',
      label: `${pay.payerName} · ${pay.contextLabel}`,
      hint: `Payment · ${pay.status}`,
      route: 'PaymentDetail',
    });
  }
  for (const b of BOOKINGS.slice(0, 10)) {
    items.push({
      id: `booking-${b.id}`,
      kind: 'booking',
      label: `${b.facilityName} · ${b.spaceName}`,
      hint: `Booking · ${b.status}`,
      route: 'BookingDetail',
    });
  }
  return items;
}

const KIND_LABEL: Record<ResultKind, string> = {
  navigate: 'Navigate',
  league: 'League',
  team: 'Team',
  person: 'Person',
  facility: 'Facility',
  payment: 'Payment',
  booking: 'Booking',
};

export function CommandPalette({
  visible,
  onRequestClose,
  onNavigate,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  const index = useMemo(buildIndex, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.filter((r) => r.kind === 'navigate').slice(0, 12);
    return index
      .filter((r) => `${r.label} ${r.hint ?? ''}`.toLowerCase().includes(q))
      .slice(0, 30);
  }, [index, query]);

  const grouped = useMemo(() => {
    const map = new Map<ResultKind, PaletteResult[]>();
    for (const r of results) {
      const list = map.get(r.kind) ?? [];
      list.push(r);
      map.set(r.kind, list);
    }
    return [...map.entries()];
  }, [results]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onRequestClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[styles.panel, shadows.popover]}
          accessibilityViewIsModal
          accessibilityRole="alert"
        >
          <View style={styles.searchRow}>
            <Search size={16} color={colors.text.muted} strokeWidth={2.25} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Type to jump to a person, team, payment…"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              accessibilityLabel="Search admin"
            />
            <Text variant="caption" color={colors.text.muted}>
              Esc
            </Text>
          </View>

          <ScrollView style={styles.results} keyboardShouldPersistTaps="handled">
            {results.length === 0 ? (
              <View style={styles.empty}>
                <Text variant="bodySm" color={colors.text.muted} align="center">
                  No matches for "{query}". Try a name, payment ID, or facility.
                </Text>
              </View>
            ) : (
              grouped.map(([kind, items]) => (
                <View key={kind} style={styles.group}>
                  <Text
                    variant="eyebrow"
                    color={colors.text.muted}
                    style={styles.groupLabel}
                  >
                    {KIND_LABEL[kind]}
                  </Text>
                  {items.map((r) => (
                    <Pressable
                      key={r.id}
                      onPress={() => {
                        onNavigate(r.route);
                        onRequestClose();
                      }}
                      accessibilityRole="menuitem"
                      accessibilityLabel={r.label}
                      style={({ hovered }: WebPressableState) => [
                        styles.row,
                        hovered ? styles.rowHover : null,
                      ]}
                    >
                      <View style={styles.rowBody}>
                        <Text variant="bodySm" color={colors.text.primary}>
                          {r.label}
                        </Text>
                        {r.hint ? (
                          <Text variant="caption" color={colors.text.muted}>
                            {r.hint}
                          </Text>
                        ) : null}
                      </View>
                      <Text variant="caption" color={colors.text.muted}>
                        {ROUTE_LABELS[r.route]}
                      </Text>
                      <ChevronRight
                        size={12}
                        color={colors.text.muted}
                        strokeWidth={2.25}
                      />
                    </Pressable>
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: spacing.xl,
  },
  panel: {
    width: 640,
    maxWidth: '100%',
    maxHeight: 540,
    backgroundColor: colors.surface.card,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    paddingVertical: 0,
    outlineStyle: 'none' as never,
  },
  results: {
    flex: 1,
  },
  group: {
    paddingVertical: spacing.sm,
  },
  groupLabel: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing['2xs'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  rowHover: {
    backgroundColor: colors.brand.soft,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  empty: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
});
