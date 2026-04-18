import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../theme';
import { Text } from './Text';

export interface DrawerProps {
  visible: boolean;
  onRequestClose: () => void;
  title?: string;
  width?: number;
  side?: 'right' | 'left';
  children?: React.ReactNode;
}

export function Drawer({
  visible,
  onRequestClose,
  title,
  width = 480,
  side = 'right',
  children,
}: DrawerProps) {
  const screenWidth = Dimensions.get('window').width;
  const drawerWidth = Math.min(width, screenWidth);
  const initialX = side === 'right' ? drawerWidth : -drawerWidth;

  const translateX = useRef(new Animated.Value(initialX)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: visible ? 0 : initialX,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, translateX, opacity, initialX]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onRequestClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onRequestClose}
            accessibilityRole="button"
            accessibilityLabel="Close panel"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.panel,
            shadows.popover,
            {
              width: drawerWidth,
              transform: [{ translateX }],
              [side]: 0,
            },
          ]}
          accessibilityViewIsModal
        >
          <View style={styles.header}>
            <Text variant="h2" color={colors.text.primary}>
              {title}
            </Text>
            <Pressable
              onPress={onRequestClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={8}
              style={styles.closeBtn}
            >
              <X size={18} color={colors.text.secondary} strokeWidth={2.25} />
            </Pressable>
          </View>
          <View style={styles.body}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.surface.card,
    borderRadius: 0,
    borderTopLeftRadius: radii.lg,
    borderBottomLeftRadius: radii.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    padding: spacing.xl,
  },
});
