import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../theme';
import { Text } from './Text';

export type ToastVariant = 'success' | 'info' | 'warning' | 'error';

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: { label: string; onPress: () => void };
  id?: string;
}

interface ToastInternal extends Required<Pick<ToastInput, 'title'>> {
  id: string;
  variant: ToastVariant;
  description?: string;
  duration: number;
  action?: ToastInput['action'];
}

interface ToastApi {
  show: (toast: ToastInput) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const MAX_VISIBLE = 3;
const DEFAULT_DURATION = 4000;

const VARIANT_ICON: Record<
  ToastVariant,
  React.ComponentType<{ size: number; color: string; strokeWidth?: number }>
> = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
};

const VARIANT_COLOR: Record<ToastVariant, string> = {
  success: '#2E7D32',
  info: colors.brand.primary,
  warning: '#B26200',
  error: '#C62828',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<ToastInternal[]>([]);

  const dismiss = useCallback((id: string) => {
    setQueue((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => setQueue([]), []);

  const show = useCallback((toast: ToastInput) => {
    const id =
      toast.id ?? `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const next: ToastInternal = {
      id,
      title: toast.title,
      description: toast.description,
      variant: toast.variant ?? 'info',
      duration: toast.duration ?? DEFAULT_DURATION,
      action: toast.action,
    };
    setQueue((prev) => {
      const without = prev.filter((t) => t.id !== id);
      const combined = [...without, next];
      return combined.slice(Math.max(0, combined.length - MAX_VISIBLE));
    });
    return id;
  }, []);

  const api = useMemo<ToastApi>(
    () => ({ show, dismiss, dismissAll }),
    [show, dismiss, dismissAll],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport queue={queue} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}

interface ToastViewportProps {
  queue: ToastInternal[];
  onDismiss: (id: string) => void;
}

function ToastViewport({ queue, onDismiss }: ToastViewportProps) {
  const insets = useSafeAreaInsets();
  if (queue.length === 0) return null;
  return (
    <View
      style={[styles.viewport, { top: insets.top + spacing.md }]}
      pointerEvents="box-none"
    >
      {queue.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </View>
  );
}

interface ToastItemProps {
  toast: ToastInternal;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    if (toast.duration > 0) {
      const id = setTimeout(() => onDismiss(toast.id), toast.duration);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [opacity, translateY, toast.id, toast.duration, onDismiss]);

  const Icon = VARIANT_ICON[toast.variant];
  const accent = VARIANT_COLOR[toast.variant];
  const isError = toast.variant === 'error';

  return (
    <Animated.View
      style={[styles.toast, shadows.card, { opacity, transform: [{ translateY }] }]}
      accessibilityRole="alert"
      accessibilityLiveRegion={isError ? 'assertive' : 'polite'}
    >
      <View style={[styles.iconBubble, { backgroundColor: `${accent}1A` }]}>
        <Icon size={20} color={accent} strokeWidth={2.25} />
      </View>
      <View style={styles.body}>
        <Text variant="button" color={colors.text.primary}>
          {toast.title}
        </Text>
        {toast.description ? (
          <Text variant="bodySm" color={colors.text.secondary}>
            {toast.description}
          </Text>
        ) : null}
        {toast.action ? (
          <Pressable
            onPress={() => {
              toast.action?.onPress();
              onDismiss(toast.id);
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={toast.action.label}
            style={styles.action}
          >
            <Text variant="button" color={accent}>
              {toast.action.label}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <Pressable
        onPress={() => onDismiss(toast.id)}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Dismiss notification"
        style={styles.close}
      >
        <X size={18} color={colors.text.muted} strokeWidth={2.25} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    gap: spacing.sm,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.soft,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  action: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  close: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
