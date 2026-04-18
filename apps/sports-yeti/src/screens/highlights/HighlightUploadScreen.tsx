import React, { useEffect, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import {
  Camera,
  ChevronLeft,
  Film,
  Library,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';
import { colors, radii, spacing } from '../../theme';
import {
  BottomSheet,
  Button,
  Card,
  EmptyState,
  IconBadge,
  Modal,
  ProgressBar,
  Tag,
  Text,
  useToast,
} from '../../ui';
import { HIGHLIGHT_PRICE_CENTS } from '../../mocks/highlights';
import { formatCurrency } from '../../lib/format';
import { useCheckout } from '../../lib/checkout';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'HighlightUpload'>;
type Step = 'pick' | 'review' | 'paying' | 'generating' | 'done';

interface PickedVideo {
  uri: string;
  durationSeconds?: number;
  fileSize?: number;
}

export function HighlightUploadScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const checkout = useCheckout();
  const [step, setStep] = useState<Step>('pick');
  const [video, setVideo] = useState<PickedVideo | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmPay, setConfirmPay] = useState(false);

  useEffect(() => {
    if (step === 'generating') {
      const id = setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStep('done');
      }, 2400);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [step]);

  const handlePickFrom = async (source: 'library' | 'camera') => {
    setPickerOpen(false);
    const permission =
      source === 'library'
        ? await ImagePicker.requestMediaLibraryPermissionsAsync()
        : await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setPermissionDenied(true);
      return;
    }

    const launcher =
      source === 'library'
        ? ImagePicker.launchImageLibraryAsync
        : ImagePicker.launchCameraAsync;

    const result = await launcher({
      mediaTypes: ['videos'],
      quality: 0.8,
      videoMaxDuration: 1800,
    });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const seconds = asset.duration ? Math.round(asset.duration / 1000) : undefined;
    setVideo({ uri: asset.uri, durationSeconds: seconds, fileSize: asset.fileSize });
    setStep('review');
  };

  const startUpload = async () => {
    setConfirmPay(false);
    setStep('paying');
    const result = await checkout.pay({
      amountCents: HIGHLIGHT_PRICE_CENTS,
      merchantLabel: 'SportsYeti highlight generation',
      // TODO: pass createPaymentIntent once backend exposes it.
    });
    if (result.status === 'success') {
      setStep('generating');
      return;
    }
    if (result.status === 'cancelled') {
      toast.show({ variant: 'info', title: 'Payment cancelled' });
      setStep('review');
      return;
    }
    toast.show({
      variant: 'error',
      title: 'Payment failed',
      description: result.error,
    });
    setStep('review');
  };

  const handleReset = () => {
    setVideo(null);
    setStep('pick');
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
          New Highlight
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {step === 'pick' ? (
          <>
            <View style={styles.intro}>
              <IconBadge size={64} tone="brand">
                <Film size={28} color={colors.brand.deep} strokeWidth={2.25} />
              </IconBadge>
              <Text variant="h1" color={colors.text.primary} align="center">
                Turn a game into clips
              </Text>
              <Text variant="body" color={colors.text.secondary} align="center">
                Upload up to 30 minutes from your library or record a quick capture. AI
                surfaces the best moments — you choose what to post.
              </Text>
            </View>

            <Card style={styles.priceCard}>
              <View style={styles.priceRow}>
                <View style={styles.priceLeft}>
                  <Sparkles
                    size={20}
                    color={colors.brand.primary}
                    strokeWidth={2.25}
                  />
                  <Text variant="button" color={colors.text.primary}>
                    Per highlight
                  </Text>
                </View>
                <Text variant="h2" color={colors.brand.primary}>
                  {formatCurrency(HIGHLIGHT_PRICE_CENTS)}
                </Text>
              </View>
              <View style={styles.bullets}>
                <Text variant="bodySm" color={colors.text.secondary}>
                  • Up to 15 AI-selected clips
                </Text>
                <Text variant="bodySm" color={colors.text.secondary}>
                  • Watermark-free downloads + share to feed
                </Text>
                <Text variant="bodySm" color={colors.text.secondary}>
                  • Fully refundable if AI returns 0 clips
                </Text>
              </View>
            </Card>

            <Button
              label="Choose video"
              variant="gradient"
              size="lg"
              fullWidth
              onPress={() => setPickerOpen(true)}
            />
          </>
        ) : null}

        {step === 'review' && video ? (
          <>
            <Image
              source={{ uri: video.uri }}
              style={styles.thumbnailLarge}
              contentFit="cover"
              accessibilityLabel="Video preview"
            />
            <View style={styles.reviewMeta}>
              <Tag tone="info" size="sm" leadingDot label="Video selected" />
              {video.durationSeconds ? (
                <Text variant="bodySm" color={colors.text.secondary}>
                  {Math.round(video.durationSeconds / 60)} min source
                </Text>
              ) : null}
            </View>

            <Card style={styles.priceCard}>
              <View style={styles.priceRow}>
                <Text variant="button" color={colors.text.primary}>
                  Generate highlights
                </Text>
                <Text variant="h2" color={colors.brand.primary}>
                  {formatCurrency(HIGHLIGHT_PRICE_CENTS)}
                </Text>
              </View>
              <View style={styles.bullets}>
                <View style={styles.bulletRow}>
                  <ShieldCheck
                    size={14}
                    color={colors.brand.primary}
                    strokeWidth={2.25}
                  />
                  <Text variant="caption" color={colors.text.secondary}>
                    Charged via Apple/Google Pay sheet — no auto-charge before confirm.
                  </Text>
                </View>
              </View>
            </Card>

            <Button
              label={`Pay & generate · ${formatCurrency(HIGHLIGHT_PRICE_CENTS)}`}
              variant="gradient"
              size="lg"
              fullWidth
              onPress={() => setConfirmPay(true)}
            />
            <Button
              label="Choose a different video"
              variant="ghost"
              fullWidth
              onPress={handleReset}
            />
          </>
        ) : null}

        {(step === 'paying' || step === 'generating') ? (
          <View style={styles.processBlock}>
            <IconBadge size={64} tone="brand">
              <Sparkles size={28} color={colors.brand.deep} strokeWidth={2.25} />
            </IconBadge>
            <Text variant="h2" color={colors.text.primary} align="center">
              {step === 'paying' ? 'Processing payment…' : 'Analyzing your video…'}
            </Text>
            <Text variant="body" color={colors.text.secondary} align="center">
              {step === 'paying'
                ? 'Confirming with Apple Pay…'
                : "We'll push a notification when your clips are ready (~2 min). You can close this screen."}
            </Text>
            <View style={styles.processBar}>
              <ProgressBar tone="brand" size="md" variant="indeterminate" />
            </View>
          </View>
        ) : null}

        {step === 'done' ? (
          <EmptyState
            icon={
              <Sparkles size={28} color={colors.brand.primary} strokeWidth={2.25} />
            }
            title="Highlight kicked off"
            description="We'll notify you the moment it's ready in your Studio."
            primaryAction={{
              label: 'Back to Studio',
              onPress: () => navigation.goBack(),
            }}
          />
        ) : null}
      </ScrollView>

      <BottomSheet
        visible={pickerOpen}
        onRequestClose={() => setPickerOpen(false)}
        title="Add a video"
        snapPoints={['38%']}
      >
        <View style={styles.pickerSheet}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose from library"
            onPress={() => handlePickFrom('library')}
            style={({ pressed }) => [
              styles.pickerRow,
              pressed ? styles.pressed : null,
            ]}
          >
            <Library size={22} color={colors.brand.primary} strokeWidth={2.25} />
            <View style={styles.pickerBody}>
              <Text variant="button" color={colors.text.primary}>
                Choose from library
              </Text>
              <Text variant="caption" color={colors.text.secondary}>
                Pick a clip up to 30 minutes long.
              </Text>
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Record new"
            onPress={() => handlePickFrom('camera')}
            style={({ pressed }) => [
              styles.pickerRow,
              pressed ? styles.pressed : null,
            ]}
          >
            <Camera size={22} color={colors.brand.primary} strokeWidth={2.25} />
            <View style={styles.pickerBody}>
              <Text variant="button" color={colors.text.primary}>
                Record now
              </Text>
              <Text variant="caption" color={colors.text.secondary}>
                Capture a quick clip from the field.
              </Text>
            </View>
          </Pressable>
        </View>
      </BottomSheet>

      <Modal
        visible={permissionDenied}
        onRequestClose={() => setPermissionDenied(false)}
        variant="info"
        title="Permission needed"
        description="Allow camera/photo access in Settings to upload a video."
        primaryAction={{
          label: 'Open Settings',
          onPress: () => {
            setPermissionDenied(false);
            Linking.openSettings();
          },
        }}
        secondaryAction={{
          label: 'Not now',
          onPress: () => setPermissionDenied(false),
        }}
      />

      <Modal
        visible={confirmPay}
        onRequestClose={() => setConfirmPay(false)}
        variant="info"
        title={`Pay ${formatCurrency(HIGHLIGHT_PRICE_CENTS)}?`}
        description="Apple/Google Pay sheet will appear. We'll only generate after the payment is authorized."
        primaryAction={{
          label: `Confirm ${formatCurrency(HIGHLIGHT_PRICE_CENTS)}`,
          onPress: startUpload,
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setConfirmPay(false),
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
  intro: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  priceCard: {
    gap: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bullets: {
    gap: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  thumbnailLarge: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radii.lg,
    backgroundColor: colors.surface.chip,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  processBlock: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  processBar: {
    width: '100%',
    marginTop: spacing.lg,
  },
  pickerSheet: {
    gap: spacing.md,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface.bg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    minHeight: 64,
  },
  pickerBody: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.75,
  },
});
