<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;

class ReconcilePaymentsJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        private ?Carbon $startDate = null,
        private ?Carbon $endDate = null
    ) {
        $this->startDate = $startDate ?? now()->subDay()->startOfDay();
        $this->endDate = $endDate ?? now()->subDay()->endOfDay();
    }

    public function handle(): void
    {
        Log::info('Starting payment reconciliation', [
            'start_date' => $this->startDate->toIso8601String(),
            'end_date' => $this->endDate->toIso8601String(),
        ]);

        $mismatches = [];

        // Get local payments
        $localPayments = Payment::whereBetween('created_at', [$this->startDate, $this->endDate])
            ->whereNotNull('stripe_payment_intent_id')
            ->get()
            ->keyBy('stripe_payment_intent_id');

        // Get Stripe payments
        $stripePayments = $this->fetchStripePayments();

        // Compare local vs Stripe
        foreach ($stripePayments as $stripePayment) {
            $localPayment = $localPayments->get($stripePayment['id']);

            if (! $localPayment) {
                // Payment exists in Stripe but not locally
                $mismatches[] = [
                    'type' => 'missing_local',
                    'stripe_id' => $stripePayment['id'],
                    'stripe_amount' => $stripePayment['amount'],
                    'stripe_status' => $stripePayment['status'],
                    'created_at' => Carbon::createFromTimestamp($stripePayment['created'])->toIso8601String(),
                ];

                continue;
            }

            // Check amount mismatch
            $localAmountCents = (int) ($localPayment->amount * 100);
            if ($localAmountCents !== $stripePayment['amount']) {
                $mismatches[] = [
                    'type' => 'amount_mismatch',
                    'payment_id' => $localPayment->id,
                    'stripe_id' => $stripePayment['id'],
                    'local_amount' => $localPayment->amount,
                    'stripe_amount' => $stripePayment['amount'] / 100,
                ];
            }

            // Check status mismatch
            $expectedStatus = $this->mapStripeStatus($stripePayment['status']);
            if ($localPayment->status !== $expectedStatus) {
                $mismatches[] = [
                    'type' => 'status_mismatch',
                    'payment_id' => $localPayment->id,
                    'stripe_id' => $stripePayment['id'],
                    'local_status' => $localPayment->status,
                    'stripe_status' => $stripePayment['status'],
                    'expected_status' => $expectedStatus,
                ];
            }
        }

        // Check for local payments not in Stripe
        foreach ($localPayments as $stripeId => $localPayment) {
            if (! isset($stripePayments[$stripeId]) && $localPayment->status !== 'pending') {
                $mismatches[] = [
                    'type' => 'missing_stripe',
                    'payment_id' => $localPayment->id,
                    'stripe_id' => $stripeId,
                    'local_amount' => $localPayment->amount,
                    'local_status' => $localPayment->status,
                ];
            }
        }

        // Log results
        Log::info('Payment reconciliation completed', [
            'local_count' => $localPayments->count(),
            'stripe_count' => count($stripePayments),
            'mismatch_count' => count($mismatches),
        ]);

        if (count($mismatches) > 0) {
            $this->reportMismatches($mismatches);
        }
    }

    private function fetchStripePayments(): array
    {
        $stripeKey = config('services.stripe.secret');

        if (! $stripeKey) {
            Log::warning('Stripe secret key not configured, skipping Stripe fetch');

            return [];
        }

        try {
            $stripe = new StripeClient($stripeKey);

            $paymentIntents = $stripe->paymentIntents->all([
                'created' => [
                    'gte' => $this->startDate->timestamp,
                    'lte' => $this->endDate->timestamp,
                ],
                'limit' => 100,
            ]);

            $payments = [];
            foreach ($paymentIntents->data as $intent) {
                $payments[$intent->id] = [
                    'id' => $intent->id,
                    'amount' => $intent->amount,
                    'currency' => $intent->currency,
                    'status' => $intent->status,
                    'created' => $intent->created,
                ];
            }

            return $payments;
        } catch (\Exception $e) {
            Log::error('Failed to fetch Stripe payments for reconciliation', [
                'error' => $e->getMessage(),
            ]);

            return [];
        }
    }

    private function mapStripeStatus(string $stripeStatus): string
    {
        return match ($stripeStatus) {
            'succeeded' => 'completed',
            'canceled' => 'cancelled',
            'requires_payment_method', 'requires_confirmation', 'requires_action', 'processing' => 'pending',
            default => 'pending',
        };
    }

    private function reportMismatches(array $mismatches): void
    {
        Log::warning('Payment reconciliation found mismatches', [
            'mismatches' => $mismatches,
        ]);

        // Store mismatches for dashboard/reporting
        // In production, you would also:
        // 1. Send alert notification to admin
        // 2. Store in database for dashboard display
        // 3. Send to external monitoring (DataDog, Sentry, etc.)

        // For now, we log and could potentially send notifications
        // This would integrate with NotificationService in production
    }
}
