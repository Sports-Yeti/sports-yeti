import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeft,
  Download,
  FileText,
  ShieldCheck,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Button,
  Card,
  IconBadge,
  Modal,
  Tag,
  Text,
  useToast,
} from '../../ui';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Waivers'>;

type WaiverStatus = 'signed' | 'unsigned' | 'expired';

interface Waiver {
  id: string;
  title: string;
  signedDate?: string;
  expiresDate?: string;
  status: WaiverStatus;
  contextLabel: string; // e.g. "Required for Aurora Hockey League"
}

const WAIVERS: Waiver[] = [
  {
    id: 'liability-2026',
    title: 'General Liability Release · 2026',
    signedDate: 'Mar 4, 2026',
    expiresDate: 'Mar 4, 2027',
    status: 'signed',
    contextLabel: 'Required for all leagues and pickup games',
  },
  {
    id: 'aurora-hockey-2026',
    title: 'Aurora Hockey D2 Waiver',
    expiresDate: 'Required by Sep 4',
    status: 'unsigned',
    contextLabel: 'Required for Aurora Fall Hockey D2',
  },
  {
    id: 'concussion-2025',
    title: 'Concussion Awareness Acknowledgment',
    signedDate: 'Aug 12, 2024',
    expiresDate: 'Expired Aug 12, 2025',
    status: 'expired',
    contextLabel: 'Required for any contact sport',
  },
];

const STATUS_TONE: Record<WaiverStatus, 'success' | 'warning' | 'live'> = {
  signed: 'success',
  unsigned: 'warning',
  expired: 'live',
};

const STATUS_LABEL: Record<WaiverStatus, string> = {
  signed: 'Signed',
  unsigned: 'Required',
  expired: 'Expired',
};

export function WaiversScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [signing, setSigning] = useState<Waiver | null>(null);
  const [waivers, setWaivers] = useState<Waiver[]>(WAIVERS);

  const handleSign = (w: Waiver) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSigning(null);
    setWaivers((prev) =>
      prev.map((x) =>
        x.id === w.id
          ? {
              ...x,
              status: 'signed',
              signedDate: 'Today',
              expiresDate: 'Apr 18, 2027',
            }
          : x,
      ),
    );
    toast.show({ variant: 'success', title: `${w.title} signed`, description: 'Receipt emailed to you.' });
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
          Waivers
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
        <Card style={styles.headerCard}>
          <IconBadge size={48} tone="brand">
            <ShieldCheck size={22} color={colors.brand.deep} strokeWidth={2.25} />
          </IconBadge>
          <View style={styles.headerBody}>
            <Text variant="h3" color={colors.text.primary}>
              Your participation paperwork
            </Text>
            <Text variant="bodySm" color={colors.text.secondary}>
              Sign once per season — we surface them automatically when a
              league or game requires them.
            </Text>
          </View>
        </Card>

        <View style={styles.list}>
          {waivers.map((w) => (
            <Card key={w.id} style={styles.waiverCard}>
              <View style={styles.waiverHead}>
                <FileText size={20} color={colors.brand.primary} strokeWidth={2.25} />
                <Text variant="button" color={colors.text.primary} style={styles.waiverTitle}>
                  {w.title}
                </Text>
                <Tag tone={STATUS_TONE[w.status]} size="sm" label={STATUS_LABEL[w.status]} />
              </View>
              <Text variant="bodySm" color={colors.text.secondary}>
                {w.contextLabel}
              </Text>
              <View style={styles.metaRow}>
                {w.signedDate ? (
                  <Text variant="caption" color={colors.text.secondary}>
                    Signed {w.signedDate}
                  </Text>
                ) : null}
                {w.expiresDate ? (
                  <Text
                    variant="caption"
                    color={
                      w.status === 'expired'
                        ? colors.status.live
                        : colors.text.secondary
                    }
                  >
                    {w.expiresDate}
                  </Text>
                ) : null}
              </View>
              <View style={styles.waiverActions}>
                {w.status === 'signed' ? (
                  <Button
                    label="Download"
                    variant="ghost"
                    size="sm"
                    leadingIcon={
                      <Download
                        size={14}
                        color={colors.brand.primary}
                        strokeWidth={2.5}
                      />
                    }
                    onPress={() =>
                      toast.show({
                        variant: 'success',
                        title: 'Saved to Files',
                      })
                    }
                  />
                ) : (
                  <Button
                    label={w.status === 'expired' ? 'Re-sign' : 'Sign now'}
                    variant="gradient"
                    size="sm"
                    onPress={() => setSigning(w)}
                  />
                )}
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={!!signing}
        onRequestClose={() => setSigning(null)}
        variant="info"
        title={signing?.title ?? ''}
        description="By signing you confirm you've read the document and understand the risks."
        primaryAction={{
          label: 'Tap to sign',
          onPress: () => signing && handleSign(signing),
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setSigning(null),
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
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerBody: {
    flex: 1,
    gap: 2,
  },
  list: {
    gap: spacing.md,
  },
  waiverCard: {
    gap: spacing.sm,
  },
  waiverHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  waiverTitle: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  waiverActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
