<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\Refund;
use Stripe\Stripe;

class PaymentService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function createPaymentIntent(
        User $user,
        float $amount,
        string $currency = 'usd',
        array $metadata = []
    ): array {
        try {
            // Ensure customer exists in Stripe
            $customerId = $this->getOrCreateStripeCustomer($user);

            $paymentIntent = PaymentIntent::create([
                'amount' => (int) ($amount * 100), // Convert to cents
                'currency' => $currency,
                'customer' => $customerId,
                'metadata' => $metadata,
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            return [
                'success' => true,
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe PaymentIntent creation failed', [
                'user_id' => $user->id,
                'amount' => $amount,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function confirmPayment(string $paymentIntentId): array
    {
        try {
            $paymentIntent = PaymentIntent::retrieve($paymentIntentId);

            if ($paymentIntent->status === 'succeeded') {
                return [
                    'success' => true,
                    'status' => 'completed',
                    'charge_id' => $paymentIntent->latest_charge,
                ];
            }

            return [
                'success' => false,
                'status' => $paymentIntent->status,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe payment confirmation failed', [
                'payment_intent_id' => $paymentIntentId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function refundPayment(Payment $payment, ?float $amount = null): array
    {
        try {
            if (!$payment->stripe_charge_id) {
                return [
                    'success' => false,
                    'error' => 'No charge ID found for this payment.',
                ];
            }

            $refundParams = [
                'charge' => $payment->stripe_charge_id,
            ];

            if ($amount !== null) {
                $refundParams['amount'] = (int) ($amount * 100);
            }

            $refund = Refund::create($refundParams);

            $payment->update([
                'status' => 'refunded',
                'stripe_refund_id' => $refund->id,
                'refunded_at' => now(),
            ]);

            return [
                'success' => true,
                'refund_id' => $refund->id,
                'amount' => $refund->amount / 100,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe refund failed', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    private function getOrCreateStripeCustomer(User $user): string
    {
        if ($user->stripe_customer_id) {
            return $user->stripe_customer_id;
        }

        $customer = \Stripe\Customer::create([
            'email' => $user->email,
            'name' => $user->name,
            'metadata' => [
                'user_id' => $user->id,
            ],
        ]);

        $user->update(['stripe_customer_id' => $customer->id]);

        return $customer->id;
    }

    public function calculateFee(float $amount): float
    {
        // Platform fee: 3% + Stripe fee estimate (2.9% + $0.30)
        $platformFeePercent = 0.03;
        $stripeFeePercent = 0.029;
        $stripeFixedFee = 0.30;

        return ($amount * ($platformFeePercent + $stripeFeePercent)) + $stripeFixedFee;
    }
}
