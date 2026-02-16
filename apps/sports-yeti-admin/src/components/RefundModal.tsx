import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import type { Payment } from '../types';

interface RefundModalProps {
  visible: boolean;
  payment: Payment;
  maxRefundAmount: number;
  isProcessing: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (amount: number | undefined, reason: string) => Promise<void>;
}

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function RefundModal({
  visible,
  payment,
  maxRefundAmount,
  isProcessing,
  error,
  onClose,
  onSubmit,
}: RefundModalProps) {
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (visible) {
      // Reset form when modal opens
      setRefundType('full');
      setAmount('');
      setReason('');
      setLocalError('');
    }
  }, [visible]);

  const handleSubmit = async () => {
    setLocalError('');

    if (refundType === 'partial') {
      const refundAmount = parseFloat(amount);
      if (isNaN(refundAmount) || refundAmount <= 0) {
        setLocalError('Please enter a valid refund amount');
        return;
      }
      if (refundAmount > maxRefundAmount) {
        setLocalError(`Maximum refundable amount is ${formatCurrency(maxRefundAmount)}`);
        return;
      }
      await onSubmit(refundAmount, reason);
    } else {
      await onSubmit(undefined, reason); // undefined means full refund
    }
  };

  const displayError = error || localError;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Issue Refund</Text>
            <TouchableOpacity onPress={onClose} disabled={isProcessing}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Payment Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Original Payment</Text>
              <Text style={styles.summaryAmount}>
                {formatCurrency(payment.amount)}
              </Text>
              {payment.refund_amount && payment.refund_amount > 0 && (
                <Text style={styles.summaryRefunded}>
                  Already refunded: {formatCurrency(payment.refund_amount)}
                </Text>
              )}
              <Text style={styles.summaryAvailable}>
                Available for refund: {formatCurrency(maxRefundAmount)}
              </Text>
            </View>

            {/* Refund Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Refund Type</Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    refundType === 'full' && styles.typeButtonActive,
                  ]}
                  onPress={() => setRefundType('full')}
                  disabled={isProcessing}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      refundType === 'full' && styles.typeButtonTextActive,
                    ]}
                  >
                    Full Refund
                  </Text>
                  <Text
                    style={[
                      styles.typeButtonSubtext,
                      refundType === 'full' && styles.typeButtonSubtextActive,
                    ]}
                  >
                    {formatCurrency(maxRefundAmount)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    refundType === 'partial' && styles.typeButtonActive,
                  ]}
                  onPress={() => setRefundType('partial')}
                  disabled={isProcessing}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      refundType === 'partial' && styles.typeButtonTextActive,
                    ]}
                  >
                    Partial Refund
                  </Text>
                  <Text
                    style={[
                      styles.typeButtonSubtext,
                      refundType === 'partial' && styles.typeButtonSubtextActive,
                    ]}
                  >
                    Custom amount
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Partial Amount Input */}
            {refundType === 'partial' && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Refund Amount</Text>
                <View style={styles.amountInputWrapper}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    placeholderTextColor={COLORS.textMuted}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    editable={!isProcessing}
                  />
                </View>
              </View>
            )}

            {/* Reason */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Reason (optional)</Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="Enter refund reason..."
                placeholderTextColor={COLORS.textMuted}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
                editable={!isProcessing}
              />
            </View>

            {/* Error Message */}
            {displayError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            )}

            {/* Warning */}
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                ⚠️ This action cannot be undone. The refund will be processed
                immediately through Stripe.
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isProcessing}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, isProcessing && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={COLORS.textLight} />
              ) : (
                <Text style={styles.submitButtonText}>
                  Process Refund
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textMuted,
    padding: SPACING.xs,
  },
  content: {
    padding: SPACING.lg,
  },
  summaryCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  summaryAmount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  summaryRefunded: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
  summaryAvailable: {
    fontSize: FONT_SIZES.md,
    color: COLORS.success,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  typeButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  typeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  typeButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  typeButtonTextActive: {
    color: COLORS.primary,
  },
  typeButtonSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  typeButtonSubtextActive: {
    color: COLORS.primary,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  currencySymbol: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    paddingVertical: SPACING.md,
  },
  reasonInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorContainer: {
    backgroundColor: COLORS.error + '15',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  warningContainer: {
    backgroundColor: COLORS.warning + '15',
    borderRadius: 8,
    padding: SPACING.md,
  },
  warningText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textLight,
  },
});
