import { useId } from 'react';

/**
 * Stable, SSR-safe id generator with an optional prefix.
 * Used to wire <FormField> to its child control via aria-describedby /
 * accessibilityLabelledBy, even on platforms (RN < 0.81) where IDs
 * aren't natively forwarded.
 */
export function usePrefixedId(prefix: string, override?: string): string {
  const auto = useId();
  return override ?? `${prefix}-${auto.replace(/:/g, '')}`;
}
