import React, { useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { CircleDollarSign } from 'lucide-react-native';
import { colors } from '../theme';
import { Input } from './Input';

export interface MoneyInputProps {
  label: string;
  helpText?: string;
  placeholder?: string;
  valueCents: number;
  onChangeCents: (cents: number) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Currency input that keeps the raw user text in local state so partial
 * values (`5`, `5.`, `5.0`) round-trip through backspace correctly. The
 * canonical cents value only updates when the text is parseable, and we
 * reformat to two decimals on blur. Shared across the host-a-game and
 * create-a-squad flows.
 */
export function MoneyInput({
  label,
  helpText,
  placeholder = '0.00',
  valueCents,
  onChangeCents,
  containerStyle,
}: MoneyInputProps) {
  const [text, setText] = useState(() =>
    valueCents === 0 ? '' : (valueCents / 100).toFixed(2),
  );
  // If the parent resets the cents value (e.g. user toggles Free → Paid),
  // re-derive the text. Otherwise let the user-typed text stand.
  React.useEffect(() => {
    const parsed = Math.round((Number(text.replace(/[^0-9.]/g, '')) || 0) * 100);
    if (parsed !== valueCents) {
      setText(valueCents === 0 ? '' : (valueCents / 100).toFixed(2));
    }
    // Intentionally only key on the canonical value, not `text`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueCents]);

  return (
    <Input
      label={label}
      placeholder={placeholder}
      helpText={helpText}
      value={text}
      variant="number"
      containerStyle={containerStyle}
      leadingIcon={
        <CircleDollarSign
          size={18}
          color={colors.brand.primary}
          strokeWidth={2.25}
        />
      }
      onChangeText={(v) => {
        // Allow only digits and a single dot, max 2 decimal places.
        const cleaned = v
          .replace(/[^0-9.]/g, '')
          .replace(/(\..*?)\./g, '$1')
          .replace(/^(\d*\.\d{0,2}).*$/, '$1');
        setText(cleaned);
        const cents = Math.round((Number(cleaned) || 0) * 100);
        onChangeCents(cents);
      }}
      onBlur={() => {
        // Normalize on blur: empty stays empty; otherwise pin to 2 decimals.
        if (text === '' || text === '.') return;
        const n = Number(text);
        if (Number.isFinite(n)) setText(n.toFixed(2));
      }}
    />
  );
}
