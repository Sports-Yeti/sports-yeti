import { useCallback } from 'react';
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from 'react-hook-form';

export interface UseFieldControllerArgs<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  name: TName;
  control?: Control<TFieldValues>;
  rules?: Omit<
    RegisterOptions<TFieldValues, TName>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >;
  defaultValue?: TFieldValues[TName];
  shouldUnregister?: boolean;
  /** Optional transform applied to the raw control value before
   *  publishing it to RHF state (e.g. trim, parseInt). */
  transformOut?: (value: unknown) => TFieldValues[TName];
}

export interface FieldController<TValue = unknown> {
  /** Field name (RHF). */
  name: string;
  /** Current value held in the form. */
  value: TValue;
  /** Standard onChange. Accepts (value) or any RN-style event. */
  onChange: (value: TValue) => void;
  /** RHF blur handler — call from the control's onBlur to mark touched. */
  onBlur: () => void;
  /** Field-level error message, if any. */
  error: string | undefined;
  /** True after first interaction (RHF dirty/touched state). */
  isTouched: boolean;
  isDirty: boolean;
  /** True while a submit is in flight (RHF formState.isSubmitting). */
  isSubmitting: boolean;
  /** True when the control is disabled at the form level. */
  isDisabled: boolean;
  /** Stable ref to attach to the control for programmatic focus. */
  ref: (instance: unknown) => void;
}

/**
 * react-hook-form integration for shared form controls.
 *
 * Usage:
 *   const email = useFieldController({ name: 'email' });
 *   return (
 *     <FormField label="Email" error={email.error}>
 *       <Input variant="email" value={email.value} onChangeText={email.onChange} onBlur={email.onBlur} />
 *     </FormField>
 *   );
 *
 * The hook intentionally normalizes all RHF state into a flat shape so
 * controls don't need to import RHF types directly.
 */
export function useFieldController<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  args: UseFieldControllerArgs<TFieldValues, TName>,
): FieldController<TFieldValues[TName]> {
  const { name, control, rules, defaultValue, shouldUnregister, transformOut } = args;

  const { field, fieldState, formState } = useController({
    name,
    control,
    rules,
    defaultValue,
    shouldUnregister,
  });

  const onChange = useCallback(
    (value: TFieldValues[TName]) => {
      const next = transformOut
        ? transformOut(value)
        : value;
      field.onChange(next);
    },
    [field, transformOut],
  );

  const errorMessage =
    fieldState.error?.message ??
    (fieldState.error ? String(fieldState.error.type) : undefined);

  return {
    name: field.name,
    value: field.value,
    onChange,
    onBlur: field.onBlur,
    error: errorMessage,
    isTouched: fieldState.isTouched,
    isDirty: fieldState.isDirty,
    isSubmitting: formState.isSubmitting,
    isDisabled: field.disabled === true,
    ref: field.ref,
  };
}
