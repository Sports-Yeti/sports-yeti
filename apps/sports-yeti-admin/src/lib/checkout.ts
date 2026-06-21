import { useCallback, useState } from 'react';
import { formatCurrency } from './format';

/**
 * Admin-side payment actions (refunds + off-session charges) backed by
 * the SportsYeti API. Aligned with Stripe best practices for the
 * 2026-01-28.clover API:
 *
 * - Refunds run server-side against an existing PaymentIntent via
 *   Stripe's POST /v1/refunds endpoint. The admin client never holds
 *   Stripe secrets — we send {amountCents, reason} to our API and it
 *   issues the refund + records an audit entry.
 *
 * - Off-session balance charges (e.g. "charge $X for the pending
 *   booking") use Stripe's confirm-on-behalf flow: server creates a
 *   PaymentIntent with `confirm: true, off_session: true` against the
 *   payer's saved payment method. If the bank requires
 *   re-authentication (PSD2 / 3DS), Stripe surfaces an
 *   `authentication_required` error and the admin nudges the customer
 *   to complete the action in the mobile app.
 *
 * Each call returns a normalized { status } shape so the UI doesn't
 * need to know Stripe error semantics.
 */

export type CheckoutStatus = 'success' | 'failed' | 'authentication_required';

export interface PaymentActionResult {
  status: CheckoutStatus;
  error?: string;
  /**
   * Server-issued correlation id for audit linking. Mock mode generates a
   * Stripe-shaped id so receipts look real in the UI.
   */
  id?: string;
}

export interface RefundInput {
  paymentId: string;
  amountCents: number;
  reason: string;
}

export interface ChargeBalanceInput {
  bookingId: string;
  amountCents: number;
  /** Saved payment method id Stripe should charge off-session. */
  paymentMethodId?: string;
}

const MOCK_LATENCY_MS = 700;

function shouldFakeFailure(): boolean {
  // 8% mock failure rate so the UI's failure paths get exercised.
  return Math.random() < 0.08;
}

function makeMockId(prefix: 're' | 'pi'): string {
  const rand = Math.random().toString(36).slice(2, 14);
  return `${prefix}_3${rand}`;
}

interface AdminPaymentApi {
  refundPayment: (input: RefundInput) => Promise<PaymentActionResult>;
  chargeBookingBalance: (
    input: ChargeBalanceInput,
  ) => Promise<PaymentActionResult>;
}

/**
 * Default implementation. Swap with a real fetch-based client once the
 * SportsYeti backend exposes /admin/payments/refund + /admin/bookings/charge.
 */
const mockApi: AdminPaymentApi = {
  async refundPayment({ amountCents, paymentId }) {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
    if (shouldFakeFailure()) {
      return {
        status: 'failed',
        error: `Stripe declined the refund on ${paymentId} — the source charge may already be disputed.`,
      };
    }
    return {
      status: 'success',
      id: makeMockId('re'),
    };
  },
  async chargeBookingBalance({ amountCents, bookingId }) {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
    if (Math.random() < 0.05) {
      return {
        status: 'authentication_required',
        error: `${formatCurrency(amountCents)} requires the cardholder to re-authenticate. We notified the host via push.`,
      };
    }
    if (shouldFakeFailure()) {
      return {
        status: 'failed',
        error: `Stripe declined the charge on booking ${bookingId} (insufficient funds).`,
      };
    }
    return {
      status: 'success',
      id: makeMockId('pi'),
    };
  },
};

interface UsePaymentActionsResult {
  refund: (input: RefundInput) => Promise<PaymentActionResult>;
  chargeBalance: (
    input: ChargeBalanceInput,
  ) => Promise<PaymentActionResult>;
  isProcessing: boolean;
  lastError: string | null;
}

export function usePaymentActions(
  api: AdminPaymentApi = mockApi,
): UsePaymentActionsResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const wrap = useCallback(
    async <T extends PaymentActionResult>(
      fn: () => Promise<T>,
    ): Promise<T> => {
      setIsProcessing(true);
      setLastError(null);
      try {
        const result = await fn();
        if (result.error) setLastError(result.error);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unexpected error';
        setLastError(message);
        return {
          status: 'failed' as const,
          error: message,
        } as T;
      } finally {
        setIsProcessing(false);
      }
    },
    [],
  );

  const refund = useCallback(
    (input: RefundInput) => wrap(() => api.refundPayment(input)),
    [api, wrap],
  );

  const chargeBalance = useCallback(
    (input: ChargeBalanceInput) => wrap(() => api.chargeBookingBalance(input)),
    [api, wrap],
  );

  return { refund, chargeBalance, isProcessing, lastError };
}
