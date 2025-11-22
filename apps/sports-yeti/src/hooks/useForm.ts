import { useState, useCallback } from 'react';

interface ValidationRule<T> {
  field: keyof T;
  validate: (value: any, formData: T) => string | null;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  handleChange: (field: keyof T) => (value: any) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (
    onSubmit: (values: T) => void | Promise<void>
  ) => () => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  reset: () => void;
  isValid: boolean;
  isDirty: boolean;
}

// Custom hook for form state management and validation
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules?: ValidationRule<T>[]
): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validate = useCallback((): boolean => {
    if (!validationRules) return true;

    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    validationRules.forEach((rule) => {
      const error = rule.validate(values[rule.field], values);
      if (error) {
        newErrors[rule.field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules]);

  const handleChange = useCallback(
    (field: keyof T) => (value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      // Clear error for this field
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      // Validate this field
      if (validationRules) {
        const rule = validationRules.find((r) => r.field === field);
        if (rule) {
          const error = rule.validate(values[field], values);
          if (error) {
            setErrors((prev) => ({ ...prev, [field]: error }));
          }
        }
      }
    },
    [values, validationRules]
  );

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void | Promise<void>) => async () => {
      // Mark all fields as touched
      const allTouched = Object.keys(initialValues).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(allTouched);

      // Validate
      const isValid = validate();

      if (isValid) {
        await onSubmit(values);
      }
    },
    [values, validate, initialValues]
  );

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    reset,
    isValid,
    isDirty,
  };
}

export default useForm;
