import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Globe,
  HelpCircle,
  Lock,
  LogOut,
  Sparkles,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Button,
  Card,
  IconBadge,
  Modal,
  Text,
  useToast,
} from '../../ui';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

interface SettingsState {
  pushNotifications: boolean;
  emailDigests: boolean;
  inviteAlerts: boolean;
  paymentAlerts: boolean;
  highlightAlerts: boolean;
}

const INITIAL: SettingsState = {
  pushNotifications: true,
  emailDigests: true,
  inviteAlerts: true,
  paymentAlerts: true,
  highlightAlerts: false,
};

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      hitSlop={4}
      style={styles.row}
    >
      <IconBadge size={36}>{icon}</IconBadge>
      <View style={styles.rowBody}>
        <Text variant="button" color={colors.text.primary}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color={colors.text.secondary}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <ChevronRight size={18} color={colors.text.secondary} strokeWidth={2.25} />
    </Pressable>
  );
}

function ToggleRow({
  title,
  subtitle,
  value,
  onValueChange,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowBody}>
        <Text variant="button" color={colors.text.primary}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color={colors.text.secondary}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.surface.chip, true: colors.brand.primary }}
      />
    </View>
  );
}

export function SettingsScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { logout } = useAuthStore();
  const toast = useToast();
  const [settings, setSettings] = useState<SettingsState>(INITIAL);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const update = <K extends keyof SettingsState>(k: K, v: SettingsState[K]) => {
    setSettings((p) => ({ ...p, [k]: v }));
    toast.show({
      variant: 'success',
      title: 'Saved',
      duration: 1200,
    });
  };

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
        </Pressable>
        <Text variant="h2" color={colors.text.primary}>
          Settings
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.upsell}>
          <View style={styles.upsellRow}>
            <IconBadge size={48} tone="brand">
              <Sparkles size={22} color={colors.brand.deep} strokeWidth={2.25} />
            </IconBadge>
            <View style={styles.upsellBody}>
              <Text variant="h3" color={colors.text.primary}>
                You're on Pro
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                Renews May 14 · $9/month
              </Text>
            </View>
          </View>
          <Button
            label="Manage subscription"
            variant="ghost"
            fullWidth
            onPress={() => toast.show({ variant: 'info', title: 'App Store sheet would open here' })}
          />
        </Card>

        <Card style={styles.section}>
          <Text variant="eyebrow" color={colors.text.secondary} style={styles.sectionLabel}>
            Notifications
          </Text>
          <ToggleRow
            title="Push notifications"
            subtitle="Game reminders, invites, and replies."
            value={settings.pushNotifications}
            onValueChange={(v) => update('pushNotifications', v)}
          />
          <ToggleRow
            title="Email digest"
            subtitle="Weekly summary of activity and matches."
            value={settings.emailDigests}
            onValueChange={(v) => update('emailDigests', v)}
          />
          <ToggleRow
            title="Invite alerts"
            value={settings.inviteAlerts}
            onValueChange={(v) => update('inviteAlerts', v)}
          />
          <ToggleRow
            title="Payment reminders"
            value={settings.paymentAlerts}
            onValueChange={(v) => update('paymentAlerts', v)}
          />
          <ToggleRow
            title="Highlight ready"
            value={settings.highlightAlerts}
            onValueChange={(v) => update('highlightAlerts', v)}
          />
        </Card>

        <Card style={styles.section}>
          <Text variant="eyebrow" color={colors.text.secondary} style={styles.sectionLabel}>
            Account
          </Text>
          <SettingsRow
            icon={
              <CreditCard size={18} color={colors.brand.primary} strokeWidth={2.25} />
            }
            title="Payment methods"
            subtitle="Apple Pay · Visa •••• 4242"
            onPress={() =>
              toast.show({ variant: 'info', title: 'Payment sheet would open here' })
            }
          />
          <SettingsRow
            icon={<Lock size={18} color={colors.brand.primary} strokeWidth={2.25} />}
            title="Privacy & data"
            onPress={() =>
              toast.show({ variant: 'info', title: 'Privacy controls coming soon' })
            }
          />
          <SettingsRow
            icon={<Globe size={18} color={colors.brand.primary} strokeWidth={2.25} />}
            title="Language & region"
            subtitle="English · USD · United States"
            onPress={() =>
              toast.show({ variant: 'info', title: 'Locale picker coming soon' })
            }
          />
          <SettingsRow
            icon={<Bell size={18} color={colors.brand.primary} strokeWidth={2.25} />}
            title="Notifications center"
            onPress={() => navigation.navigate('Notifications')}
          />
        </Card>

        <Card style={styles.section}>
          <Text variant="eyebrow" color={colors.text.secondary} style={styles.sectionLabel}>
            Support
          </Text>
          <SettingsRow
            icon={
              <HelpCircle size={18} color={colors.brand.primary} strokeWidth={2.25} />
            }
            title="Help center"
            onPress={() =>
              toast.show({ variant: 'info', title: 'Help center coming soon' })
            }
          />
          <SettingsRow
            icon={<Lock size={18} color={colors.brand.primary} strokeWidth={2.25} />}
            title="Terms & privacy"
            onPress={() =>
              toast.show({ variant: 'info', title: 'Terms link would open here' })
            }
          />
        </Card>

        <Button
          label="Sign out"
          variant="ghost"
          fullWidth
          leadingIcon={
            <LogOut size={16} color={colors.status.live} strokeWidth={2.5} />
          }
          onPress={() => setConfirmSignOut(true)}
        />

        <Pressable
          onPress={() => setConfirmDelete(true)}
          accessibilityRole="button"
          accessibilityLabel="Delete account"
          style={styles.deleteRow}
        >
          <Text variant="caption" color={colors.status.live} align="center">
            Delete account
          </Text>
        </Pressable>

        <Text
          variant="caption"
          color={colors.text.secondary}
          align="center"
          style={styles.versionTag}
        >
          SportsYeti · v1.0.0
        </Text>
      </ScrollView>

      <Modal
        visible={confirmSignOut}
        onRequestClose={() => setConfirmSignOut(false)}
        variant="destructive"
        title="Sign out?"
        description="You'll need to log in again to access your games and squads."
        primaryAction={{
          label: 'Sign out',
          onPress: () => {
            setConfirmSignOut(false);
            logout();
          },
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setConfirmSignOut(false),
        }}
      />

      <Modal
        visible={confirmDelete}
        onRequestClose={() => setConfirmDelete(false)}
        variant="destructive"
        title="Delete your account?"
        description="This is permanent. All games, teams, and highlights tied to your profile will be removed."
        primaryAction={{
          label: 'Delete forever',
          onPress: () => {
            setConfirmDelete(false);
            toast.show({
              variant: 'info',
              title: 'Account deletion request sent',
            });
            logout();
          },
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setConfirmDelete(false),
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  upsell: {
    gap: spacing.md,
  },
  upsellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  upsellBody: {
    flex: 1,
    gap: 2,
  },
  section: {
    gap: spacing.md,
  },
  sectionLabel: {
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    paddingVertical: spacing.xs,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  deleteRow: {
    paddingVertical: spacing.md,
  },
  versionTag: {
    marginTop: spacing.lg,
  },
});
