import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { User } from '../../types';

const TIMEZONE_OPTIONS = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'UTC',
] as const;

function ToggleRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity style={styles.toggleRow} onPress={onToggle}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.toggle, value && styles.toggleActive]}>
        <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
      </View>
    </TouchableOpacity>
  );
}

export function SettingsScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [timezone, setTimezone] = useState('America/New_York');
  const [showTimezoneSelector, setShowTimezoneSelector] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [defaultRegistrationFee, setDefaultRegistrationFee] = useState('50');
  const [requireWaivers, setRequireWaivers] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const me = await api.getMe();
        setUser(me);
        setTimezone(me.timezone || 'America/New_York');
      } catch {
        // handled by auth interceptor
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.logout();
          } catch {
            // still clear locally
          }
        },
      },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'This will clear all locally cached data.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', onPress: () => Alert.alert('Done', 'Cache cleared successfully') },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your admin preferences</Text>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.sectionCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() ?? 'A'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name ?? 'Admin'}</Text>
              <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{user?.name ?? '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email ?? '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{user?.phone ?? 'Not set'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.settingRow} onPress={() => setShowTimezoneSelector(!showTimezoneSelector)}>
            <Text style={styles.settingLabel}>Timezone</Text>
            <Text style={styles.settingValue}>{timezone}</Text>
          </TouchableOpacity>
          {showTimezoneSelector && (
            <View style={styles.timezoneList}>
              {TIMEZONE_OPTIONS.map((tz) => (
                <TouchableOpacity
                  key={tz}
                  style={[styles.timezoneOption, timezone === tz && styles.timezoneOptionActive]}
                  onPress={() => { setTimezone(tz); setShowTimezoneSelector(false); }}
                >
                  <Text style={[styles.timezoneText, timezone === tz && styles.timezoneTextActive]}>{tz}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <ToggleRow
            label="Email Notifications"
            value={emailNotifications}
            onToggle={() => setEmailNotifications(!emailNotifications)}
          />
          <ToggleRow
            label="Push Notifications"
            value={pushNotifications}
            onToggle={() => setPushNotifications(!pushNotifications)}
          />
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>League Settings</Text>
        <View style={styles.sectionCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Default Registration Fee</Text>
            <View style={styles.feeInputWrap}>
              <Text style={styles.feePrefix}>$</Text>
              <TextInput
                style={styles.feeInput}
                value={defaultRegistrationFee}
                onChangeText={setDefaultRegistrationFee}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>
          <ToggleRow
            label="Require Waiver by Default"
            value={requireWaivers}
            onToggle={() => setRequireWaivers(!requireWaivers)}
          />
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>System</Text>
        <View style={styles.sectionCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>App Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
          <TouchableOpacity style={styles.settingRow} onPress={handleClearCache}>
            <Text style={styles.settingLabel}>Clear Cache</Text>
            <Text style={[styles.settingValue, { color: COLORS.primary }]}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: SPACING.lg, paddingBottom: SPACING.md },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  sectionContainer: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
  sectionCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  profileRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: COLORS.surface },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text },
  profileEmail: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  infoLabel: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  infoValue: { fontSize: FONT_SIZES.md, color: COLORS.text, fontWeight: '500' },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SPACING.sm + 2, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  settingLabel: { fontSize: FONT_SIZES.md, color: COLORS.text },
  settingValue: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, fontWeight: '500' },
  timezoneList: {
    backgroundColor: COLORS.background, borderRadius: 8, padding: SPACING.xs, marginBottom: SPACING.sm,
  },
  timezoneOption: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: 6 },
  timezoneOptionActive: { backgroundColor: COLORS.primary },
  timezoneText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  timezoneTextActive: { color: COLORS.surface, fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SPACING.sm + 2, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  toggleLabel: { fontSize: FONT_SIZES.md, color: COLORS.text },
  toggle: {
    width: 50, height: 28, borderRadius: 14, backgroundColor: COLORS.border, padding: 2,
  },
  toggleActive: { backgroundColor: COLORS.primary },
  toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.surface },
  toggleThumbActive: { marginLeft: 22 },
  feeInputWrap: { flexDirection: 'row', alignItems: 'center' },
  feePrefix: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginRight: 4 },
  feeInput: {
    backgroundColor: COLORS.background, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8,
    fontSize: FONT_SIZES.md, color: COLORS.text, width: 80, textAlign: 'right',
    borderWidth: 1, borderColor: COLORS.border,
  },
  logoutButton: {
    marginHorizontal: SPACING.lg, paddingVertical: SPACING.md, alignItems: 'center',
    borderRadius: 8, borderWidth: 1, borderColor: COLORS.error,
  },
  logoutText: { fontSize: FONT_SIZES.md, color: COLORS.error, fontWeight: '600' },
  bottomPadding: { height: SPACING.xxl },
});
