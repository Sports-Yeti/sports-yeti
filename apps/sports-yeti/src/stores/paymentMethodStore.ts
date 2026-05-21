import { create } from 'zustand';

/**
 * Tracks whether the current user has a payment method on file.
 *
 * Used by paid-join flows (open-play game join, paid sub-acceptance, etc.)
 * to gate the charge step. When `hasCard` is false, the UI surfaces an
 * "Add a card to join" prompt that routes to Settings → Payment methods
 * (which would open the Stripe SetupIntent sheet in production).
 *
 * Stored in-memory only for now. When backend lands, swap the actions to
 * call `api.listPaymentMethods()` / `api.attachPaymentMethod()` and
 * rehydrate on app start.
 */
interface PaymentMethodState {
  hasCard: boolean;
  /** Display label for the card on file (e.g. "Visa •••• 4242"). */
  cardLabel?: string;
  setHasCard: (hasCard: boolean, label?: string) => void;
  reset: () => void;
}

export const usePaymentMethodStore = create<PaymentMethodState>((set) => ({
  hasCard: false,
  cardLabel: undefined,

  setHasCard: (hasCard, label) =>
    set({ hasCard, cardLabel: hasCard ? label : undefined }),

  reset: () => set({ hasCard: false, cardLabel: undefined }),
}));
