import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { type WebPressableState } from '../../lib/pressable';
import {
  Building2,
  CreditCard,
  Lock,
  Plug,
  ShieldCheck,
  Users,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import {
  PageHeader,
  PageScroll,
  SectionHeader,
  StickyActionBar,
  type AdminRouteName,
} from '../../admin';
import { Avatar, Button, Card, Input, Modal, Tag, Text, useToast } from '../../ui';
import { colors, radii, spacing } from '../../theme';
import { useAuthStore } from '../../stores';
import { ADMIN_TEAMMATES, CURRENT_ORG } from '../../mocks/org';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const SECTIONS = [
  { id: 'org', label: 'Organization', Icon: Building2 },
  { id: 'team', label: 'Team & roles', Icon: Users },
  { id: 'billing', label: 'Plan & billing', Icon: CreditCard },
  { id: 'security', label: 'Security & SSO', Icon: ShieldCheck },
  { id: 'integrations', label: 'Integrations', Icon: Plug },
  { id: 'privacy', label: 'Privacy', Icon: Lock },
];

export function SettingsScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const toast = useToast();
  const logout = useAuthStore((s) => s.logout);
  const [section, setSection] = useState('org');
  const [orgName, setOrgName] = useState(CURRENT_ORG.name);
  const [orgCity, setOrgCity] = useState(CURRENT_ORG.city);
  const [requireMFA, setRequireMFA] = useState(true);
  const [allowMarketplace, setAllowMarketplace] = useState(true);
  const [allowSSO, setAllowSSO] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slackConnected, setSlackConnected] = useState(false);

  // Watch every editable surface so the StickyActionBar can render
  // only when the page actually has unsaved changes.
  const dirty = useMemo(
    () =>
      orgName !== CURRENT_ORG.name ||
      orgCity !== CURRENT_ORG.city ||
      !requireMFA ||
      !allowMarketplace ||
      !allowSSO,
    [orgName, orgCity, requireMFA, allowMarketplace, allowSSO],
  );

  const discardChanges = () => {
    setOrgName(CURRENT_ORG.name);
    setOrgCity(CURRENT_ORG.city);
    setRequireMFA(true);
    setAllowMarketplace(true);
    setAllowSSO(true);
  };

  const saveChanges = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.show({ variant: 'success', title: 'Settings saved' });
    }, 600);
  };

  return (
    <PageScroll>
      <PageHeader
        variant="flatHero"
        eyebrow="WORKSPACE"
        title="League Settings"
        subtitle="Manage your organization, teammates, billing, and security."
      />

      <View style={styles.layout}>
        <Card style={styles.nav}>
          {SECTIONS.map((s) => {
            const Icon = s.Icon;
            const active = section === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => setSection(s.id)}
                accessibilityRole="button"
                accessibilityLabel={s.label}
                accessibilityState={{ selected: active }}
                style={({ hovered }: WebPressableState) => [
                  styles.navItem,
                  active ? styles.navItemActive : null,
                  hovered && !active ? styles.navItemHover : null,
                ]}
              >
                <Icon
                  size={14}
                  color={active ? colors.brand.primary : colors.text.secondary}
                  strokeWidth={2.25}
                />
                <Text
                  variant="bodySm"
                  color={active ? colors.brand.primary : colors.text.secondary}
                >
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </Card>

        <View style={styles.body}>
          {section === 'org' ? (
            <Card style={styles.sectionCard}>
              <SectionHeader
                icon={
                  <Building2
                    size={20}
                    color={colors.brand.deep}
                    strokeWidth={2.25}
                  />
                }
                title="General Configuration"
                description="Display name, location, and core operating defaults."
              />
              <Input label="Display name" value={orgName} onChangeText={setOrgName} />
              <Input label="City" value={orgCity} onChangeText={setOrgCity} />
              <Input label="Time zone" value={CURRENT_ORG.timezone} disabled />
              <Input label="Currency" value={CURRENT_ORG.currency} disabled />
            </Card>
          ) : null}

          {section === 'team' ? (
            <Card style={styles.sectionCard}>
              <SectionHeader
                icon={
                  <Users
                    size={20}
                    color={colors.brand.deep}
                    strokeWidth={2.25}
                  />
                }
                title="Team & roles"
                description="Owners, admins, and viewers in your workspace."
                trailing={
                  <Button
                    label="Invite teammate"
                    variant="solid"
                    size="sm"
                    onPress={() =>
                      navigation.navigate('InvitePeople', { id: 'admin' })
                    }
                  />
                }
              />
              {ADMIN_TEAMMATES.map((u) => (
                <View key={u.id} style={styles.teamRow}>
                  <Avatar uri={u.avatar} initials={u.initials} size={36} />
                  <View style={styles.teamBody}>
                    <Text variant="bodySm" color={colors.text.primary} weight="600">
                      {u.name}
                    </Text>
                    <Text variant="caption" color={colors.text.muted}>
                      {u.email}
                    </Text>
                  </View>
                  <Tag size="sm" tone={u.role === 'owner' ? 'brand' : 'neutral'} label={u.role} />
                </View>
              ))}
            </Card>
          ) : null}

          {section === 'billing' ? (
            <Card style={styles.sectionCard}>
              <SectionHeader
                icon={
                  <CreditCard
                    size={20}
                    color={colors.brand.deep}
                    strokeWidth={2.25}
                  />
                }
                title="Plan & billing"
                description="Subscription, payout method, and tax settings."
              />
              <View style={styles.planRow}>
                <View>
                  <Text variant="bodySm" color={colors.text.primary} weight="600">
                    {CURRENT_ORG.plan === 'pro' ? 'Pro plan' : CURRENT_ORG.plan} · $99/mo
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    Renews May 1 · Visa •••• 4242
                  </Text>
                </View>
                <Button
                  label="Manage subscription"
                  variant="ghost"
                  size="sm"
                  onPress={() =>
                    toast.show({ variant: 'info', title: 'Stripe portal (mock)' })
                  }
                />
              </View>
            </Card>
          ) : null}

          {section === 'security' ? (
            <Card style={styles.sectionCard}>
              <SectionHeader
                icon={
                  <ShieldCheck
                    size={20}
                    color={colors.brand.deep}
                    strokeWidth={2.25}
                  />
                }
                title="Security & SSO"
                description="Authentication policies for admin access."
              />
              <SettingToggle
                title="Require 2FA for all admins"
                description="Owners and admins must verify a TOTP code on every sign-in."
                value={requireMFA}
                onValueChange={setRequireMFA}
              />
              <SettingToggle
                title="Allow Google Workspace SSO"
                description="Pro plan members of yetiathletic.com can sign in with Google."
                value={allowSSO}
                onValueChange={setAllowSSO}
              />
            </Card>
          ) : null}

          {section === 'integrations' ? (
            <Card style={styles.sectionCard}>
              <SectionHeader
                icon={
                  <Plug size={20} color={colors.brand.deep} strokeWidth={2.25} />
                }
                title="Integrations"
                description="Connect Stripe, Slack, and the player-facing marketplace."
              />
              <SettingToggle
                title="Marketplace listings"
                description="Allow players to post sub-for-hire and gear listings."
                value={allowMarketplace}
                onValueChange={setAllowMarketplace}
              />
              <View style={styles.intRow}>
                <View>
                  <Text variant="bodySm" color={colors.text.primary} weight="600">
                    Stripe
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    Connected · acct_••• 18Z
                  </Text>
                </View>
                <Tag size="sm" tone="success" leadingDot label="Live" />
              </View>
              <View style={styles.intRow}>
                <View>
                  <Text variant="bodySm" color={colors.text.primary} weight="600">
                    Slack
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    {slackConnected
                      ? 'Connected · #ops on failed payments'
                      : 'Notify #ops on failed payments'}
                  </Text>
                </View>
                <View style={styles.intRowActions}>
                  {slackConnected ? (
                    <Tag size="sm" tone="success" leadingDot label="Connected (mock)" />
                  ) : null}
                  <Button
                    label={slackConnected ? 'Disconnect' : 'Connect'}
                    variant="ghost"
                    size="sm"
                    onPress={() => {
                      setSlackConnected((prev) => !prev);
                      toast.show({
                        variant: slackConnected ? 'info' : 'success',
                        title: slackConnected
                          ? 'Slack disconnected (mock)'
                          : 'Slack connected (mock)',
                        description: slackConnected
                          ? undefined
                          : 'OAuth handshake lands with backend wiring.',
                      });
                    }}
                  />
                </View>
              </View>
            </Card>
          ) : null}

          {section === 'privacy' ? (
            <Card style={styles.sectionCard}>
              <SectionHeader
                icon={
                  <Lock size={20} color={colors.brand.alpine} strokeWidth={2.25} />
                }
                title="Privacy & data"
                description="Retention, GDPR / CCPA, and account deletion."
                tone="alpine"
              />
              <Text variant="bodySm" color={colors.text.secondary}>
                Configure data retention, GDPR / CCPA exports, and deletion windows. Tools are
                listed here so admins can find them; wiring lands with the next phase.
              </Text>
              <View style={styles.actionsRow}>
                <Button
                  label="Request data export"
                  variant="ghost"
                  size="md"
                  onPress={() =>
                    toast.show({ variant: 'info', title: 'Data export queued (mock)' })
                  }
                />
                <Button
                  label="Delete account"
                  variant="destructive"
                  size="md"
                  onPress={() => {
                    setConfirmName('');
                    setConfirmDelete(true);
                  }}
                />
              </View>
            </Card>
          ) : null}
        </View>
      </View>

      <StickyActionBar
        visible={dirty}
        message="You have unsaved changes."
        secondary={{ label: 'Discard changes', onPress: discardChanges }}
        primary={{
          label: 'Save configuration',
          onPress: saveChanges,
          loading: saving,
        }}
      />

      <Modal
        visible={confirmDelete}
        onRequestClose={() => setConfirmDelete(false)}
        variant="destructive"
        title={`Delete ${CURRENT_ORG.name}?`}
        description="This is irreversible. All leagues, teams, payments, waivers, and audit history are permanently deleted. Type the org name to confirm."
        primaryAction={{
          label: deleting ? 'Deleting…' : 'Delete organization',
          disabled: confirmName !== CURRENT_ORG.name || deleting,
          onPress: () => {
            setDeleting(true);
            setTimeout(() => {
              setDeleting(false);
              setConfirmDelete(false);
              toast.show({
                variant: 'info',
                title: `${CURRENT_ORG.name} scheduled for deletion`,
                description:
                  'Final deletion completes in 30 days. Sign back in to cancel.',
              });
              logout().catch(() => undefined);
            }, 600);
          },
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setConfirmDelete(false),
          disabled: deleting,
        }}
      >
        <Input
          autoFocus
          value={confirmName}
          onChangeText={setConfirmName}
          placeholder={CURRENT_ORG.name}
          accessibilityLabel="Organization name confirmation"
        />
      </Modal>
    </PageScroll>
  );
}

function SettingToggle({
  title,
  description,
  value,
  onValueChange,
}: {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleBody}>
        <Text variant="bodySm" color={colors.text.primary} weight="600">
          {title}
        </Text>
        {description ? (
          <Text variant="caption" color={colors.text.muted}>
            {description}
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

const styles = StyleSheet.create({
  layout: {
    flexDirection: 'row',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  nav: {
    width: 240,
    gap: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.sm,
  },
  navItemActive: {
    backgroundColor: colors.brand.soft,
  },
  navItemHover: {
    backgroundColor: colors.surface.bg,
  },
  body: {
    flex: 1,
    minWidth: 320,
    gap: spacing.md,
  },
  sectionCard: {
    gap: spacing.lg,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
  },
  teamBody: {
    flex: 1,
    gap: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
  },
  toggleBody: {
    flex: 1,
    gap: 2,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  intRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  intRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
