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

interface ToastInternal {
  id: string;
  title: string;
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
  success: colors.status.success,
  info: colors.brand.primary,
  warning: colors.status.warning,
  error: colors.status.error,
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
      <Viewport queue={queue} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>');
  return ctx;
}

interface ViewportProps {
  queue: ToastInternal[];
  onDismiss: (id: string) => void;
}

function Viewport({ queue, onDismiss }: ViewportProps) {
  if (queue.length === 0) return null;
  return (
    <View style={styles.viewport} pointerEvents="box-none">
      {queue.map((toast) => (
        <Item key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </View>
  );
}

interface ItemProps {
  toast: ToastInternal;
  onDismiss: (id: string) => void;
}

function Item({ toast, onDismiss }: ItemProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    if (toast.duration > 0) {
      const id = setTimeout(() => onDismiss(toast.id), toast.duration);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [opacity, translateY, toast.duration, toast.id, onDismiss]);

  const Icon = VARIANT_ICON[toast.variant];
  const accent = VARIANT_COLOR[toast.variant];
  const isError = toast.variant === 'error';

  return (
    <Animated.View
      style={[
        styles.toast,
        shadows.popover,
        { opacity, transform: [{ translateY }] },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion={isError ? 'assertive' : 'polite'}
    >
      <View style={[styles.iconBubble, { backgroundColor: `${accent}1A` }]}>
        <Icon size={16} color={accent} strokeWidth={2.25} />
      </View>
      <View style={styles.body}>
        <Text variant="h4" color={colors.text.primary}>
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
            hitSlop={6}
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
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Dismiss notification"
        style={styles.close}
      >
        <X size={14} color={colors.text.muted} strokeWidth={2.25} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    gap: spacing.sm,
    width: 360,
    maxWidth: '100%',
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.soft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  iconBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  action: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  close: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
