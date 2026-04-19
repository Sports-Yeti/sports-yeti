import React, { useMemo } from 'react';
import {
  FormProvider as RHFFormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';

export interface FormProps<TValues extends FieldValues>
  extends Omit<UseFormProps<TValues>, 'defaultValues' | 'resolver'> {
  defaultValues: DefaultValues<TValues>;
  resolver?: Resolver<TValues>;
  onSubmit: SubmitHandler<TValues>;
  onInvalid?: SubmitErrorHandler<TValues>;
  /** Optional render-prop receiving the form instance for advanced cases. */
  children:
    | React.ReactNode
    | ((form: UseFormReturn<TValues>) => React.ReactNode);
  /** Wrap children in a top-level form element on web only. Keeps mobile
   *  React Native rendering completely unchanged. */
  asWebForm?: boolean;
}

/**
 * Thin wrapper around react-hook-form's FormProvider that pre-wires
 *  - sane defaults (`mode: 'onBlur'` + `reValidateMode: 'onChange'`)
 *  - a single `onSubmit` callback exposed via context to <Form.Actions>
 *
 * Usage:
 *   <Form
 *     defaultValues={{ email: '' }}
 *     resolver={zodResolver(schema)}
 *     onSubmit={async (values) => { ... }}
 *   >
 *     <FormField label="Email"> ... </FormField>
 *     <Form.Actions submitLabel="Sign in" />
 *   </Form>
 */
export function Form<TValues extends FieldValues>({
  defaultValues,
  resolver,
  onSubmit,
  onInvalid,
  mode = 'onBlur',
  reValidateMode = 'onChange',
  children,
  asWebForm = false,
  ...rest
}: FormProps<TValues>) {
  const methods = useForm<TValues>({
    defaultValues,
    resolver,
    mode,
    reValidateMode,
    ...rest,
  });

  const submit = useMemo(
    () => methods.handleSubmit(onSubmit, onInvalid),
    [methods, onSubmit, onInvalid],
  );

  // Expose the bound submit handler + form methods through context so
  // nested <Form.Actions> can fire submit without needing a render prop.
  const contextValue = useMemo<FormContextValue>(
    () => ({ submit, isSubmitting: methods.formState.isSubmitting }),
    [submit, methods.formState.isSubmitting],
  );

  const rendered =
    typeof children === 'function' ? children(methods) : children;

  return (
    <RHFFormProvider {...methods}>
      <FormContext.Provider value={contextValue}>
        {asWebForm && typeof document !== 'undefined' ? (
          // react-native-web compiles to DOM; emit a real <form> so the
          // browser handles Enter-to-submit + autofill correctly.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (React.createElement as any)(
            'form',
            {
              onSubmit: (e: { preventDefault: () => void }) => {
                e.preventDefault();
                void submit();
              },
              noValidate: true,
              style: { display: 'contents' },
            },
            rendered,
          )
        ) : (
          rendered
        )}
      </FormContext.Provider>
    </RHFFormProvider>
  );
}

interface FormContextValue {
  submit: () => Promise<void>;
  isSubmitting: boolean;
}

const FormContext = React.createContext<FormContextValue | null>(null);

export function useFormSubmit(): FormContextValue {
  const ctx = React.useContext(FormContext);
  if (!ctx) {
    throw new Error(
      '@sports-yeti/ui: useFormSubmit() must be used inside <Form>.',
    );
  }
  return ctx;
}
