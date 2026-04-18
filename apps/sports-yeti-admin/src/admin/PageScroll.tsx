import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { spacing } from '../theme';

interface PageScrollProps {
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

export function PageScroll({ children, contentStyle }: PageScrollProps) {
  return (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.content, contentStyle]}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xxxl,
    paddingBottom: spacing.huge,
    gap: spacing.lg,
  },
});
