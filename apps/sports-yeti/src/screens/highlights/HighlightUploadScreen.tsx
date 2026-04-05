import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../services/api';
import { useHighlightStore } from '../../stores/highlightStore';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

interface HighlightUploadScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    goBack: () => void;
  };
}

type UploadStep = 'pick' | 'uploading' | 'confirm' | 'paying' | 'generating' | 'done';

export function HighlightUploadScreen({
  navigation,
}: HighlightUploadScreenProps) {
  const [step, setStep] = useState<UploadStep>('pick');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [price, setPrice] = useState<number>(1.99);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const { uploadProgress, setUploadProgress, setUploading } =
    useHighlightStore();

  const pickVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to upload videos.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 1,
      videoMaxDuration: 3600,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setVideoUri(asset.uri);
    setStep('uploading');
    setUploading(true);

    try {
      const uploadResult = await api.uploadVideo(asset.uri, (progress) => {
        setUploadProgress(progress);
      });
      setVideoPath(uploadResult.video_path);
      setPrice(Number(uploadResult.price) || 0);
      setUploading(false);
      setStep('confirm');
    } catch {
      setUploading(false);
      Alert.alert('Upload Failed', 'Could not upload the video. Please try again.');
      setStep('pick');
    }
  };

  const handlePayAndGenerate = async () => {
    if (!videoPath) return;

    setStep('paying');

    try {
      const paymentResult = await api.createHighlightPaymentIntent(price);

      // In production, present Stripe PaymentSheet here using paymentResult.client_secret
      // For now, simulate confirmed payment by confirming the intent
      setStep('generating');

      const highlight = await api.generateHighlights(
        videoPath,
        paymentResult.payment.stripe_payment_intent_id
      );
      setHighlightId(highlight.id);
      setStep('done');

      navigation.navigate('HighlightDetail', { id: highlight.id });
    } catch {
      Alert.alert(
        'Payment Failed',
        'Could not process payment. You have not been charged.'
      );
      setStep('confirm');
    }
  };

  return (
    <View style={styles.container}>
      {step === 'pick' && (
        <View style={styles.center}>
          <Text style={styles.icon}>🎥</Text>
          <Text style={styles.title}>Upload Game Video</Text>
          <Text style={styles.subtitle}>
            Select a video from your library and AI will find the best highlight
            moments.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={pickVideo}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Choose Video</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'uploading' && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.title}>Uploading Video</Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${uploadProgress}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{uploadProgress}%</Text>
        </View>
      )}

      {step === 'confirm' && (
        <View style={styles.center}>
          <Text style={styles.icon}>✨</Text>
          <Text style={styles.title}>Ready to Generate Highlights</Text>
          <Text style={styles.subtitle}>
            AI will analyze your video and extract the best moments as shareable
            clips.
          </Text>
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceValue}>
              ${price.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handlePayAndGenerate}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              Pay & Generate Highlights
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {(step === 'paying' || step === 'generating') && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.title}>
            {step === 'paying' ? 'Processing Payment...' : 'Generating Highlights...'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'generating'
              ? 'This may take a few minutes. You can leave this screen.'
              : 'Please wait...'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  icon: { fontSize: 64, marginBottom: SPACING.lg },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  primaryButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  secondaryButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginTop: SPACING.lg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  priceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  priceLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
