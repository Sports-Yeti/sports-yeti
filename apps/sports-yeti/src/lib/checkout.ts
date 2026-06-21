import { useCallback, useState } from 'react';
import * as Haptics from 'expo-haptics';
import {
  initPaymentSheet,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import { formatCurrency } from './format';

/**
 * Centralized checkout hook for every paid action in the app.
 *
 * Real path:
 *   1. Caller's `createPaymentIntent` resolves a clientSecret +
 *      ephemeralKey + customerId from the SportsYeti backend.
 *   2. We call Stripe's `initPaymentSheet` then `presentPaymentSheet`.
 *   3. The user sees Apple Pay / Google Pay / Card via the native sheet.
 *
 * Mock path (no backend yet, or running in Expo Go without dev client):
 *   - We simulate a 700ms confirmation delay and resolve { status: 'success' }.
 *   - The integration shape is identical, so swapping in a real
 *     `createPaymentIntent` later is a one-line change at each call site.
 *
 * Backend integration guidance (per Stripe best practices, API
 * version 2026-01-28.clover):
 *   - Prefer creating a Stripe **Checkout Session** for one-time
 *     purchases (TeamPayment, HighlightUpload, BookingDetail,
 *     FacilityDetail) and pass `client_secret` from
 *     `session.payment_intent`. CheckoutSessions handle taxes,
 *     discounts, and dynamic payment methods automatically.
 *   - Use the PaymentIntents API directly only if you need to model
 *     intermediate state on your side. Never pin
 *     `payment_method_types` — let dashboard settings decide.
 *   - For saving a card for later (e.g. team-fee auto-pay) use the
 *     SetupIntent API, never Sources / Charges (legacy).
 *   - Customer object + ephemeral key must be created server-side per
 *     session and short-lived; never ship a long-lived customer
 *     secret to the client.
 *
 * Both paths trigger the same haptic feedback and surface the same
 * { status } shape to the caller.
 */

export type CheckoutStatus = 'success' | 'cancelled' | 'failed';

export interface CheckoutResult {
  status: CheckoutStatus;
  error?: string;
}

export interface CheckoutInput {
  /** Amount in the smallest currency unit (e.g. cents). */
  amountCents: number;
  /** ISO 4217 currency. Defaults to USD. */
  currency?: string;
  /** Human-readable label shown to the user (e.g. "Avalanche FC season fee"). */
  merchantLabel: string;
  /**
   * Async function that creates a PaymentIntent on the backend and returns
   * the client secret + the customer's ephemeral key. When omitted (mock
   * mode), we simulate a successful charge.
   */
  createPaymentIntent?: () => Promise<{
    clientSecret: string;
    ephemeralKey: string;
    customerId: string;
  }>;
}

interface UseCheckoutResult {
  pay: (input: CheckoutInput) => Promise<CheckoutResult>;
  isPaying: boolean;
  lastError: string | null;
}

export function useCheckout(): UseCheckoutResult {
  const [isPaying, setIsPaying] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const pay = useCallback(
    async ({
      amountCents,
      currency = 'USD',
      merchantLabel,
      createPaymentIntent,
    }: CheckoutInput): Promise<CheckoutResult> => {
      setIsPaying(true);
      setLastError(null);
      try {
        // Mock mode — no backend wired yet. Pretend the sheet completed.
        if (!createPaymentIntent) {
          await new Promise((resolve) => setTimeout(resolve, 700));
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
          return { status: 'success' };
        }

        // Real Stripe path.
        const { clientSecret, ephemeralKey, customerId } =
          await createPaymentIntent();

        const initResult = await initPaymentSheet({
          merchantDisplayName: merchantLabel,
          paymentIntentClientSecret: clientSecret,
          customerEphemeralKeySecret: ephemeralKey,
          customerId,
          allowsDelayedPaymentMethods: false,
        });
        if (initResult.error) {
          setLastError(initResult.error.message);
          return {
            status: 'failed',
            error: initResult.error.message,
          };
        }

        const presentResult = await presentPaymentSheet();
        if (presentResult.error) {
          if (presentResult.error.code === 'Canceled') {
            return { status: 'cancelled' };
          }
          setLastError(presentResult.error.message);
          return { status: 'failed', error: presentResult.error.message };
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return { status: 'success' };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Could not complete payment';
        setLastError(message);
        return { status: 'failed', error: message };
      } finally {
        setIsPaying(false);
      }
    },
    [],
  );

  return { pay, isPaying, lastError };
}

/**
 * Helper for human-friendly success Toast messages.
 */
export function describeCharge(amountCents: number, currency = 'USD'): string {
  return `${formatCurrency(amountCents, currency)} charged via Apple Pay`;
}
