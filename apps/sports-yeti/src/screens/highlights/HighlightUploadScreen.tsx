import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import {
  ArrowRight,
  Camera,
  Check,
  ChevronLeft,
  Clapperboard,
  Clock,
  Crosshair,
  Film,
  Flame,
  Gauge,
  Library,
  Send,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  BottomSheet,
  Button,
  Card,
  Chip,
  EmptyState,
  IconBadge,
  Modal,
  ProgressBar,
  Tag,
  Text,
  useToast,
} from '../../ui';
import {
  AI_HIGHLIGHT_MODELS,
  DEFAULT_MODEL_ID,
  SPEED_LABEL,
  VIBE_LABEL,
  getModelById,
  type AIHighlightModel,
  type ModelIconKey,
} from '../../mocks/ai-highlight-models';
import { HIGHLIGHT_PRICE_CENTS, HIGHLIGHT_REELS } from '../../mocks/highlights';
import { formatCurrency } from '../../lib/format';
import { useCheckout } from '../../lib/checkout';
import {
  FOCUS_SUGGESTIONS,
  createInitialBrief,
  greetingFor,
  interpretDirection,
  summarizeBrief,
  type DirectorMessage,
  type HighlightBrief,
} from '../../lib/highlight-director';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'HighlightUpload'>;
type Step = 'pick' | 'model' | 'direct' | 'paying' | 'generating' | 'done';

type IconComponent = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

const MODEL_ICON: Record<ModelIconKey, IconComponent> = {
  zap: Zap,
  clapperboard: Clapperboard,
  target: Target,
  flame: Flame,
  crosshair: Crosshair,
};

interface PickedVideo {
  uri: string;
  durationSeconds?: number;
  fileSize?: number;
}

// Demo footage so the full flow is walkable without a real video — essential
// on the iOS Simulator / Expo Go where the photo library is empty and the
// camera is unavailable. The uri doubles as the preview thumbnail (it's only
// rendered as an image in this flow, never played), so a poster URL is fine.
const SAMPLE_VIDEO: PickedVideo = {
  uri: HIGHLIGHT_REELS[0]?.poster ?? 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=900&q=80',
  durationSeconds: 2520, // 42 min — a believable full-game source
};

const STEP_INDEX: Record<Step, number> = {
  pick: 0,
  model: 1,
  direct: 2,
  paying: 2,
  generating: 2,
  done: 2,
};

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function StepDots({ active }: { active: number }) {
  return (
    <View style={styles.stepDots} accessibilityElementsHidden>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[styles.stepDot, i === active ? styles.stepDotActive : null]}
        />
      ))}
    </View>
  );
}

function QualityMeter({ value, tint }: { value: number; tint: string }) {
  return (
    <View style={styles.meter} accessibilityLabel={`Quality ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[
            styles.meterBar,
            { backgroundColor: i <= value ? tint : colors.surface.chip },
          ]}
        />
      ))}
    </View>
  );
}

function ModelCard({
  model,
  selected,
  onPress,
}: {
  model: AIHighlightModel;
  selected: boolean;
  onPress: () => void;
}) {
  const Icon = MODEL_ICON[model.iconKey];
  const priceLabel =
    model.priceModifierCents === 0
      ? 'Included'
      : `+${formatCurrency(model.priceModifierCents)}`;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${model.name}. ${model.tagline}. ${priceLabel}`}
    >
      <Card
        radius="lg"
        style={[
          styles.modelCard,
          selected
            ? { borderColor: model.accent, borderWidth: 2 }
            : styles.modelCardIdle,
        ]}
      >
        <View style={styles.modelHead}>
          <View style={[styles.modelIcon, { backgroundColor: model.accent }]}>
            <Icon size={22} color={colors.text.inverse} strokeWidth={2.25} />
          </View>
          <View style={styles.modelHeadText}>
            <View style={styles.modelNameRow}>
              <Text variant="h3" color={colors.text.primary}>
                {model.name}
              </Text>
              {model.premium ? (
                <Tag tone="warning" size="sm" label="PRO" />
              ) : null}
            </View>
            <Text variant="bodySm" color={colors.text.secondary}>
              {model.tagline}
            </Text>
          </View>
          <View
            style={[
              styles.radio,
              selected ? { backgroundColor: model.accent, borderColor: model.accent } : null,
            ]}
          >
            {selected ? (
              <Check size={14} color={colors.text.inverse} strokeWidth={3} />
            ) : null}
          </View>
        </View>

        <Text variant="bodySm" color={colors.text.secondary} style={styles.modelDesc}>
          {model.description}
        </Text>

        <View style={styles.modelMetaRow}>
          <View style={styles.modelMetaItem}>
            <Gauge size={14} color={colors.text.muted} strokeWidth={2.25} />
            <Text variant="caption" color={colors.text.secondary}>
              {SPEED_LABEL[model.speed]}
            </Text>
          </View>
          <View style={styles.modelMetaItem}>
            <Clock size={14} color={colors.text.muted} strokeWidth={2.25} />
            <Text variant="caption" color={colors.text.secondary}>
              {model.etaLabel}
            </Text>
          </View>
          <View style={styles.modelMetaItem}>
            <QualityMeter value={model.quality} tint={model.accent} />
          </View>
          <View style={styles.modelPrice}>
            <Text
              variant="button"
              color={model.priceModifierCents === 0 ? colors.status.success : colors.text.primary}
            >
              {priceLabel}
            </Text>
          </View>
        </View>

        <View style={styles.bestForRow}>
          {model.bestFor.map((b) => (
            <Tag key={b} tone="neutral" size="sm" label={b} />
          ))}
        </View>
      </Card>
    </Pressable>
  );
}

function TypingDots() {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 550, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] });
  return (
    <View style={styles.typingRow}>
      {[0, 1, 2].map((i) => (
        <Animated.View key={i} style={[styles.typingDot, { opacity }]} />
      ))}
    </View>
  );
}

function MessageBubble({
  message,
  model,
}: {
  message: DirectorMessage;
  model: AIHighlightModel;
}) {
  const isAi = message.role === 'ai';
  const Icon = MODEL_ICON[model.iconKey];
  if (isAi) {
    return (
      <View style={styles.aiRow}>
        <View style={[styles.aiAvatar, { backgroundColor: model.accent }]}>
          <Icon size={16} color={colors.text.inverse} strokeWidth={2.25} />
        </View>
        <View style={styles.aiBubble}>
          <Text variant="bodySm" color={colors.text.primary}>
            {message.text}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.userRow}>
      <View style={styles.userBubble}>
        <Text variant="bodySm" color={colors.text.inverse}>
          {message.text}
        </Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

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

  const [selectedModelId, setSelectedModelId] = useState<string>(DEFAULT_MODEL_ID);
  const [directedFor, setDirectedFor] = useState<string | null>(null);
  const [brief, setBrief] = useState<HighlightBrief>(() =>
    createInitialBrief(getModelById(DEFAULT_MODEL_ID)),
  );
  const [messages, setMessages] = useState<DirectorMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const [genStage, setGenStage] = useState(0);

  const selectedModel = getModelById(selectedModelId);
  const totalPriceCents = HIGHLIGHT_PRICE_CENTS + selectedModel.priceModifierCents;

  const briefRef = useRef(brief);
  useEffect(() => {
    briefRef.current = brief;
  }, [brief]);

  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const sourceMinutes = video?.durationSeconds
    ? Math.max(1, Math.round(video.durationSeconds / 60))
    : 12;

  const generationStages = useMemo(
    () => [
      'Uploading source video',
      `Scanning ${sourceMinutes} min of footage`,
      brief.jerseyNumber
        ? `Locking onto #${brief.jerseyNumber}`
        : 'Detecting key moments',
      'Scoring excitement',
      `Cutting ~${brief.maxClips} clips`,
      `Adding ${VIBE_LABEL[brief.vibe].toLowerCase()} polish`,
    ],
    [sourceMinutes, brief.jerseyNumber, brief.maxClips, brief.vibe],
  );

  // Auto-scroll the conversation as it grows.
  useEffect(() => {
    if (step !== 'direct') return undefined;
    const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(id);
  }, [messages, aiTyping, step]);

  // Drive the multi-stage generation animation, then land on the done screen.
  useEffect(() => {
    if (step !== 'generating') return undefined;
    setGenStage(0);
    const total = generationStages.length;
    const interval = setInterval(() => {
      setGenStage((s) => {
        const nextStage = s + 1;
        if (nextStage >= total) {
          clearInterval(interval);
          finishTimer.current = setTimeout(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setStep('done');
          }, 700);
        }
        return nextStage;
      });
    }, 820);
    return () => {
      clearInterval(interval);
      if (finishTimer.current) clearTimeout(finishTimer.current);
    };
  }, [step, generationStages.length]);

  // Clear any pending timers on unmount.
  useEffect(
    () => () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
      if (finishTimer.current) clearTimeout(finishTimer.current);
    },
    [],
  );

  const acceptVideo = (picked: PickedVideo) => {
    setVideo(picked);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStep('model');
  };

  const handleUseSample = () => {
    setPickerOpen(false);
    acceptVideo(SAMPLE_VIDEO);
  };

  const handlePickFrom = async (source: 'library' | 'camera') => {
    setPickerOpen(false);
    try {
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
      const seconds = asset.duration
        ? Math.round(asset.duration / 1000)
        : undefined;
      acceptVideo({
        uri: asset.uri,
        durationSeconds: seconds,
        fileSize: asset.fileSize,
      });
    } catch {
      // expo-image-picker can throw in Expo Go / simulator (no camera, etc.).
      // Don't dead-end the prototype — fall back to demo footage.
      toast.show({
        variant: 'info',
        title: 'Using a sample clip',
        description: "Couldn't open the device picker here, so we loaded demo footage.",
      });
      acceptVideo(SAMPLE_VIDEO);
    }
  };

  const handleSelectModel = (id: string) => {
    Haptics.selectionAsync();
    setSelectedModelId(id);
  };

  const goToDirector = () => {
    Haptics.selectionAsync();
    if (directedFor !== selectedModelId) {
      const model = getModelById(selectedModelId);
      setBrief(createInitialBrief(model));
      setMessages([{ id: 'ai-greeting', role: 'ai', text: greetingFor(model) }]);
      setDirectedFor(selectedModelId);
    }
    setStep('direct');
  };

  const sendDirection = (raw: string) => {
    const text = raw.trim();
    if (!text || aiTyping) return;
    Haptics.selectionAsync();
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', text },
    ]);
    setDraft('');
    setAiTyping(true);
    const result = interpretDirection(text, briefRef.current);
    typingTimer.current = setTimeout(() => {
      setBrief(result.brief);
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'ai', text: result.reply },
      ]);
      setAiTyping(false);
    }, 750);
  };

  const startGeneration = async () => {
    setConfirmPay(false);
    setStep('paying');
    const result = await checkout.pay({
      amountCents: totalPriceCents,
      merchantLabel: `SportsYeti · ${selectedModel.name}`,
      // TODO: pass createPaymentIntent once backend exposes it.
    });
    if (result.status === 'success') {
      setStep('generating');
      return;
    }
    if (result.status === 'cancelled') {
      toast.show({ variant: 'info', title: 'Payment cancelled' });
      setStep('direct');
      return;
    }
    toast.show({
      variant: 'error',
      title: 'Payment failed',
      description: result.error,
    });
    setStep('direct');
  };

  const handleReset = () => {
    setVideo(null);
    setMessages([]);
    setDirectedFor(null);
    setSelectedModelId(DEFAULT_MODEL_ID);
    setBrief(createInitialBrief(getModelById(DEFAULT_MODEL_ID)));
    setStep('pick');
  };

  const handleBack = () => {
    if (step === 'direct') {
      setStep('model');
      return;
    }
    if (step === 'model') {
      setStep('pick');
      return;
    }
    navigation.goBack();
  };

  const title =
    step === 'pick'
      ? 'New Highlight'
      : step === 'model'
      ? 'Choose your AI'
      : step === 'direct'
      ? selectedModel.name
      : step === 'done'
      ? 'All set'
      : 'Generating';

  const showBack = step !== 'paying' && step !== 'generating';
  const showDots = step === 'pick' || step === 'model' || step === 'direct';

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
            onPress={handleBack}
            style={styles.backBtn}
          >
            <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}
        <View style={styles.titleWrap}>
          <Text variant="h2" color={colors.text.primary} numberOfLines={1}>
            {title}
          </Text>
          {showDots ? <StepDots active={STEP_INDEX[step]} /> : null}
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* ----- Step 1: pick a video ----- */}
      {step === 'pick' ? (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 140 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <IconBadge size={64} tone="brand">
              <Film size={28} color={colors.brand.deep} strokeWidth={2.25} />
            </IconBadge>
            <Text variant="h1" color={colors.text.primary} align="center">
              Turn a game into clips
            </Text>
            <Text variant="body" color={colors.text.secondary} align="center">
              Upload up to 30 minutes, pick an AI editor, then tell it exactly what
              you want. You choose what to post.
            </Text>
          </View>

          <Card style={styles.priceCard}>
            <View style={styles.priceRow}>
              <View style={styles.priceLeft}>
                <Sparkles size={20} color={colors.brand.primary} strokeWidth={2.25} />
                <Text variant="button" color={colors.text.primary}>
                  Per highlight
                </Text>
              </View>
              <Text variant="h2" color={colors.brand.primary}>
                {`from ${formatCurrency(HIGHLIGHT_PRICE_CENTS)}`}
              </Text>
            </View>
            <View style={styles.bullets}>
              <Text variant="bodySm" color={colors.text.secondary}>
                • Choose from {AI_HIGHLIGHT_MODELS.length} AI editors
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                • Direct the cut in plain language
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
        </ScrollView>
      ) : null}

      {/* ----- Step 2: pick an AI model ----- */}
      {step === 'model' ? (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 132 }]}
          showsVerticalScrollIndicator={false}
        >
          {video ? (
            <View style={styles.sourceChip}>
              <Image
                source={{ uri: video.uri }}
                style={styles.sourceThumb}
                contentFit="cover"
                accessibilityLabel="Selected video"
              />
              <View style={styles.sourceMeta}>
                <Tag tone="info" size="sm" leadingDot label="Source ready" />
                <Text variant="caption" color={colors.text.secondary}>
                  {video.durationSeconds
                    ? `${sourceMinutes} min of footage`
                    : 'Footage selected'}
                </Text>
              </View>
              <Pressable
                onPress={handleReset}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Change video"
              >
                <Text variant="button" color={colors.brand.primary}>
                  Change
                </Text>
              </Pressable>
            </View>
          ) : null}

          <Text variant="bodySm" color={colors.text.secondary}>
            Each model edits with a different eye. Pick one — you can change it before
            you pay.
          </Text>

          <View style={styles.modelList}>
            {AI_HIGHLIGHT_MODELS.map((m) => (
              <ModelCard
                key={m.id}
                model={m}
                selected={m.id === selectedModelId}
                onPress={() => handleSelectModel(m.id)}
              />
            ))}
          </View>
        </ScrollView>
      ) : null}

      {/* ----- Step 3: direct the AI (chat) ----- */}
      {step === 'direct' ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.directRoot}
          keyboardVerticalOffset={insets.top + 64}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.chatScroll}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} model={selectedModel} />
            ))}
            {aiTyping ? (
              <View style={styles.aiRow}>
                <View style={[styles.aiAvatar, { backgroundColor: selectedModel.accent }]}>
                  <Sparkles size={16} color={colors.text.inverse} strokeWidth={2.25} />
                </View>
                <View style={styles.aiBubble}>
                  <TypingDots />
                </View>
              </View>
            ) : null}
          </ScrollView>

          <View style={[styles.directFooter, { paddingBottom: insets.bottom + spacing.sm }]}>
            <Card radius="lg" style={styles.briefCard}>
              <View style={styles.briefHead}>
                <Text variant="eyebrow" color={colors.brand.primary}>
                  Highlight brief
                </Text>
                <Text variant="caption" color={colors.text.muted}>
                  {selectedModel.etaLabel}
                </Text>
              </View>
              <Text variant="bodySm" color={colors.text.primary}>
                {summarizeBrief(brief)}
              </Text>
            </Card>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionRow}
              keyboardShouldPersistTaps="handled"
            >
              {FOCUS_SUGGESTIONS.map((s) => {
                const alreadyAdded = brief.focus.includes(s);
                return (
                  <Chip
                    key={s}
                    label={s}
                    size="sm"
                    selected={alreadyAdded}
                    onPress={alreadyAdded ? undefined : () => sendDirection(s)}
                  />
                );
              })}
            </ScrollView>

            <View style={styles.composer}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={`Tell ${selectedModel.name} what to chase…`}
                placeholderTextColor={colors.text.muted}
                style={styles.composerInput}
                multiline
                maxLength={240}
                returnKeyType="send"
                blurOnSubmit
                onSubmitEditing={() => sendDirection(draft)}
                accessibilityLabel="Describe the highlight you want"
              />
              <Pressable
                onPress={() => sendDirection(draft)}
                disabled={draft.trim().length === 0 || aiTyping}
                style={[
                  styles.composerSend,
                  draft.trim().length === 0 || aiTyping
                    ? styles.composerSendDisabled
                    : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Send direction"
                hitSlop={8}
              >
                <Send
                  size={18}
                  color={
                    draft.trim().length === 0 || aiTyping
                      ? colors.text.muted
                      : colors.text.inverse
                  }
                  strokeWidth={2.25}
                />
              </Pressable>
            </View>

            <Button
              label={`Generate highlight · ${formatCurrency(totalPriceCents)}`}
              variant="gradient"
              size="lg"
              fullWidth
              trailingIcon={
                <ArrowRight size={18} color={colors.text.inverse} strokeWidth={2.5} />
              }
              onPress={() => setConfirmPay(true)}
            />
          </View>
        </KeyboardAvoidingView>
      ) : null}

      {/* ----- Step 4/5: paying + generating ----- */}
      {step === 'paying' ? (
        <View style={styles.processBlock}>
          <IconBadge size={64} tone="brand">
            <Sparkles size={28} color={colors.brand.deep} strokeWidth={2.25} />
          </IconBadge>
          <Text variant="h2" color={colors.text.primary} align="center">
            Processing payment…
          </Text>
          <Text variant="body" color={colors.text.secondary} align="center">
            Confirming with Apple Pay…
          </Text>
          <View style={styles.processBar}>
            <ProgressBar tone="brand" size="md" variant="indeterminate" />
          </View>
        </View>
      ) : null}

      {step === 'generating' ? (
        <View style={styles.generatingBlock}>
          <View style={[styles.genIcon, { backgroundColor: selectedModel.accent }]}>
            {(() => {
              const Icon = MODEL_ICON[selectedModel.iconKey];
              return <Icon size={30} color={colors.text.inverse} strokeWidth={2.25} />;
            })()}
          </View>
          <Text variant="h2" color={colors.text.primary} align="center">
            {selectedModel.name} is editing
          </Text>
          <Text variant="bodySm" color={colors.text.secondary} align="center">
            {"We'll push a notification when your clips are ready. You can close this screen."}
          </Text>

          <View style={styles.processBar}>
            <ProgressBar
              tone="brand"
              size="md"
              value={Math.min(genStage, generationStages.length) / generationStages.length}
            />
          </View>

          <View style={styles.stageList}>
            {generationStages.map((label, i) => {
              const done = i < genStage;
              const active = i === genStage;
              return (
                <View key={label} style={styles.stageRow}>
                  <View
                    style={[
                      styles.stageDot,
                      done ? styles.stageDotDone : null,
                      active ? styles.stageDotActive : null,
                    ]}
                  >
                    {done ? (
                      <Check size={12} color={colors.text.inverse} strokeWidth={3} />
                    ) : null}
                  </View>
                  <Text
                    variant="bodySm"
                    color={done || active ? colors.text.primary : colors.text.muted}
                  >
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* ----- Step 6: done ----- */}
      {step === 'done' ? (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <EmptyState
            icon={<Sparkles size={28} color={colors.brand.primary} strokeWidth={2.25} />}
            title="Highlight kicked off"
            description={`${selectedModel.name} is rendering ~${brief.maxClips} clips. We'll notify you the moment it's ready in your Studio.`}
          />
          <Card radius="lg" style={styles.recapCard}>
            <Text variant="eyebrow" color={colors.brand.primary}>
              Your brief
            </Text>
            <Text variant="bodySm" color={colors.text.primary}>
              {summarizeBrief(brief)}
            </Text>
            {brief.focus.length > 0 ? (
              <View style={styles.recapTags}>
                {brief.focus.map((f) => (
                  <Tag key={f} tone="brand" size="sm" label={f} />
                ))}
              </View>
            ) : null}
          </Card>
          <View style={styles.doneActions}>
            <Button
              label="Back to Studio"
              variant="gradient"
              size="lg"
              fullWidth
              onPress={() => navigation.goBack()}
            />
            <Button
              label="Generate another"
              variant="ghost"
              fullWidth
              onPress={handleReset}
            />
          </View>
        </ScrollView>
      ) : null}

      {/* ----- Sheets + modals ----- */}
      <BottomSheet
        visible={pickerOpen}
        onRequestClose={() => setPickerOpen(false)}
        title="Add a video"
        snapPoints={['52%']}
      >
        <View style={styles.pickerSheet}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose from library"
            onPress={() => handlePickFrom('library')}
            style={({ pressed }) => [styles.pickerRow, pressed ? styles.pressed : null]}
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
            style={({ pressed }) => [styles.pickerRow, pressed ? styles.pressed : null]}
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

          <View style={styles.pickerDivider} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Use a sample clip"
            onPress={handleUseSample}
            style={({ pressed }) => [
              styles.pickerRow,
              styles.pickerRowSample,
              pressed ? styles.pressed : null,
            ]}
          >
            <Sparkles size={22} color={colors.brand.deep} strokeWidth={2.25} />
            <View style={styles.pickerBody}>
              <Text variant="button" color={colors.text.primary}>
                Use a sample clip
              </Text>
              <Text variant="caption" color={colors.text.secondary}>
                Demo footage — walk through the whole flow instantly.
              </Text>
            </View>
            <Tag tone="brand" size="sm" label="Demo" />
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
        title={`Pay ${formatCurrency(totalPriceCents)}?`}
        description={`${selectedModel.name} will generate ~${brief.maxClips} clips from your brief. Apple/Google Pay appears next — we only generate after payment is authorized.`}
        primaryAction={{
          label: `Confirm ${formatCurrency(totalPriceCents)}`,
          onPress: startGeneration,
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
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  stepDots: {
    flexDirection: 'row',
    gap: 6,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface.chip,
  },
  stepDotActive: {
    width: 18,
    backgroundColor: colors.brand.primary,
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
  // Source preview chip (model + direct steps)
  sourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    paddingRight: spacing.md,
    backgroundColor: colors.surface.card,
    borderRadius: radii.lg,
    ...shadows.soft,
  },
  sourceThumb: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.surface.chip,
  },
  sourceMeta: {
    flex: 1,
    gap: 4,
  },
  // Model cards
  modelList: {
    gap: spacing.md,
  },
  modelCard: {
    gap: spacing.md,
  },
  modelCardIdle: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modelHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  modelIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelHeadText: {
    flex: 1,
    gap: 2,
  },
  modelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modelDesc: {
    marginTop: -spacing.xs,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  modelMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modelPrice: {
    marginLeft: 'auto',
  },
  meter: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  meterBar: {
    width: 8,
    height: 6,
    borderRadius: 2,
  },
  bestForRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  // Director chat
  directRoot: {
    flex: 1,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    maxWidth: '88%',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBubble: {
    flex: 1,
    backgroundColor: colors.surface.card,
    borderRadius: radii.lg,
    borderTopLeftRadius: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...shadows.soft,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  userBubble: {
    maxWidth: '82%',
    backgroundColor: colors.brand.primary,
    borderRadius: radii.lg,
    borderBottomRightRadius: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  typingRow: {
    flexDirection: 'row',
    gap: 5,
    paddingVertical: 4,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.brand.primary,
  },
  directFooter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surface.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
    ...shadows.nav,
  },
  briefCard: {
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.brand.soft,
  },
  briefHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionRow: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  composerInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.surface.bg,
    borderWidth: 1,
    borderColor: colors.border.strong,
    color: colors.text.primary,
    fontSize: 15,
    lineHeight: 20,
  },
  composerSend: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  composerSendDisabled: {
    backgroundColor: colors.surface.chip,
  },
  // Processing / generating
  processBlock: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.huge,
  },
  processBar: {
    width: '100%',
    marginTop: spacing.lg,
  },
  generatingBlock: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  genIcon: {
    width: 64,
    height: 64,
    borderRadius: radii.chip,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  stageList: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stageDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageDotActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.soft,
  },
  stageDotDone: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary,
  },
  // Done recap
  recapCard: {
    gap: spacing.sm,
  },
  recapTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  doneActions: {
    gap: spacing.sm,
  },
  // Picker sheet
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
  pickerRowSample: {
    backgroundColor: colors.brand.soft,
  },
  pickerBody: {
    flex: 1,
    gap: 2,
  },
  pickerDivider: {
    height: 1,
    backgroundColor: colors.border.soft,
    marginVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.75,
  },
});
