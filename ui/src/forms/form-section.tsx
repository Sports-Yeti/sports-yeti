import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/provider';
import { UIText } from '../text/ui-text';

export interface FormSectionProps {
  title?: string;
  description?: string;
  style?: StyleProp<ViewStyle>;
  /** When true, renders as a flat group with no card chrome — useful for
   *  embedding inside a parent that already provides surface styling. */
  bare?: boolean;
  children: React.ReactNode;
}

/**
 * Vertical stack of form fields under an optional title/description.
 * By default renders inside a Card-style surface. Use `bare` to opt out.
 */
export function FormSection({
  title,
  description,
  style,
  bare = false,
  children,
}: FormSectionProps) {
  const { colors, spacing, radii, shadows } = useTheme();
  return (
    <View
      style={[
        bare
          ? null
          : {
              backgroundColor: colors.surface.card,
              borderRadius: radii.lg,
              padding: spacing.lg,
              ...shadows.soft,
            },
        { gap: spacing.md },
        style,
      ]}
    >
      {title || description ? (
        <View style={{ gap: 4 }}>
          {title ? (
            <UIText variant="h3" color={colors.text.primary}>
              {title}
            </UIText>
          ) : null}
          {description ? (
            <UIText variant="bodySm" color={colors.text.secondary}>
              {description}
            </UIText>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}
