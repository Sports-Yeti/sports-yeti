import { Switch, type SwitchProps } from 'react-native';
import { useTheme } from '../theme/provider';
import { useFormFieldContext } from './form-field-context';

export interface ToggleProps
  extends Omit<
    SwitchProps,
    | 'value'
    | 'onValueChange'
    | 'trackColor'
    | 'thumbColor'
    | 'ios_backgroundColor'
  > {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
  /** Override the on-state track color. Defaults to brand.primary. */
  tone?: 'brand' | 'success' | 'warning' | 'error';
}

/**
 * Branded wrapper around the platform <Switch>. Reads the brand color
 * from the active theme and stays in sync with FormField's disabled /
 * accessibility state.
 *
 * Use inside <FormField orientation="row" label="…" description="…">
 * for the standard "settings row" layout. As a standalone control, it
 * needs an explicit aria-label.
 */
export function Toggle({
  value,
  onValueChange,
  disabled = false,
  tone = 'brand',
  accessibilityLabel,
  ...rest
}: ToggleProps) {
  const { colors } = useTheme();
  const fieldCtx = useFormFieldContext();
  const resolvedDisabled = disabled || fieldCtx?.isDisabled === true;

  const onColor =
    tone === 'success'
      ? colors.status.success
      : tone === 'warning'
      ? colors.status.warning
      : tone === 'error'
      ? colors.status.error
      : colors.brand.primary;

  return (
    <Switch
      {...rest}
      value={value}
      onValueChange={resolvedDisabled ? undefined : onValueChange}
      disabled={resolvedDisabled}
      trackColor={{ false: colors.surface.chip, true: onColor }}
      thumbColor={colors.surface.card}
      ios_backgroundColor={colors.surface.chip}
      accessibilityLabel={accessibilityLabel}
      accessibilityLabelledBy={
        fieldCtx?.hasLabel ? fieldCtx.labelId : undefined
      }
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: resolvedDisabled }}
      aria-describedby={
        fieldCtx?.hasError
          ? fieldCtx.errorId
          : fieldCtx?.hasDescription
          ? fieldCtx.descriptionId
          : undefined
      }
    />
  );
}
