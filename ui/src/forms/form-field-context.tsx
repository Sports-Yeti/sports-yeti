import React, { createContext, useContext, useMemo } from 'react';

/**
 * Context surface a FormField exposes to its child control.
 *
 * Every form control (Input, Select, DatePicker, Toggle, …) calls
 * useFormFieldContext() to discover the label/help/error/required state
 * its parent FormField is rendering, and to get a stable id used for
 * accessibility wiring.
 *
 * If a control is rendered without a FormField parent (allowed — controls
 * can stand alone), useFormFieldContext() returns null and the control
 * falls back to its own props (e.g. its own `error` / `accessibilityLabel`).
 */
export interface FormFieldContextValue {
  controlId: string;
  labelId: string;
  descriptionId: string;
  errorId: string;
  hasLabel: boolean;
  hasDescription: boolean;
  hasError: boolean;
  isInvalid: boolean;
  isDisabled: boolean;
  isRequired: boolean;
  /** Caller-provided error string, when set. Useful so controls can
   *  drop their own border/focus styling onto the field appropriately. */
  errorMessage?: string;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export interface FormFieldContextProviderProps {
  value: FormFieldContextValue;
  children: React.ReactNode;
}

export function FormFieldContextProvider({
  value,
  children,
}: FormFieldContextProviderProps) {
  const memoised = useMemo(() => value, [
    value.controlId,
    value.labelId,
    value.descriptionId,
    value.errorId,
    value.hasLabel,
    value.hasDescription,
    value.hasError,
    value.isInvalid,
    value.isDisabled,
    value.isRequired,
    value.errorMessage,
  ]);
  return (
    <FormFieldContext.Provider value={memoised}>
      {children}
    </FormFieldContext.Provider>
  );
}

export function useFormFieldContext(): FormFieldContextValue | null {
  return useContext(FormFieldContext);
}
