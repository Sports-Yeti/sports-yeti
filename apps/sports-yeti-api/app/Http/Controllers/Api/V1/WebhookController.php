<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Player;
use App\Models\Team;
use App\Models\TeamMember;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class WebhookController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function handleStripe(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        if (! $webhookSecret) {
            Log::warning('Stripe webhook secret not configured');

            return response()->json(['error' => 'Webhook secret not configured'], 500);
        }

        try {
            $event = Webhook::constructEvent(
                $payload,
                $signature,
                $webhookSecret
            );
        } catch (SignatureVerificationException $e) {
            Log::warning('Stripe webhook signature verification failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Log the event for debugging
        Log::info('Stripe webhook received', [
            'type' => $event->type,
            'id' => $event->id,
        ]);

        try {
            switch ($event->type) {
                case 'payment_intent.succeeded':
                    $this->handlePaymentIntentSucceeded($event->data->object);
                    break;

                case 'payment_intent.payment_failed':
                    $this->handlePaymentIntentFailed($event->data->object);
                    break;

                case 'charge.refunded':
                    $this->handleChargeRefunded($event->data->object);
                    break;

                case 'customer.subscription.created':
                case 'customer.subscription.updated':
                case 'customer.subscription.deleted':
                    // Handle subscription events if needed in the future
                    break;

                default:
                    Log::info('Unhandled Stripe event type', ['type' => $event->type]);
            }
        } catch (\Exception $e) {
            Log::error('Error processing Stripe webhook', [
                'type' => $event->type,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Webhook processing error'], 500);
        }

        return response()->json(['status' => 'success']);
    }

    private function handlePaymentIntentSucceeded($paymentIntent): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $paymentIntent->id)->first();

        if (! $payment) {
            Log::warning('Payment not found for intent', ['intent_id' => $paymentIntent->id]);

            return;
        }

        // Avoid duplicate processing
        if ($payment->status === 'completed') {
            return;
        }

        $payment->update([
            'status' => 'completed',
            'stripe_charge_id' => $paymentIntent->latest_charge,
            'paid_at' => now(),
        ]);

        // Send notification
        $this->notificationService->sendPaymentConfirmation(
            $payment->user,
            $payment->id,
            (float) $payment->amount,
            $payment->description ?? $payment->type
        );

        // If this is a league_registration payment, mark team member as paid.
        if ($payment->type === 'league_registration' && $payment->payable_type === Team::class) {
            $teamMember = TeamMember::where('team_id', $payment->payable_id)
                ->where('player_id', Player::where('user_id', $payment->user_id)->value('id'))
                ->first();
            if ($teamMember) {
                $teamMember->update(['payment_status' => 'paid']);
            }
        }

        Log::info('Payment completed via webhook', ['payment_id' => $payment->id]);
    }

    private function handlePaymentIntentFailed($paymentIntent): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $paymentIntent->id)->first();

        if (! $payment) {
            return;
        }

        $payment->update([
            'status' => 'failed',
            'metadata' => array_merge($payment->metadata ?? [], [
                'failure_reason' => $paymentIntent->last_payment_error?->message ?? 'Unknown error',
            ]),
        ]);

        Log::info('Payment failed via webhook', ['payment_id' => $payment->id]);
    }

    private function handleChargeRefunded($charge): void
    {
        $payment = Payment::where('stripe_charge_id', $charge->id)->first();

        if (! $payment) {
            return;
        }

        $payment->update([
            'status' => 'refunded',
            'refunded_at' => now(),
        ]);

        Log::info('Payment refunded via webhook', ['payment_id' => $payment->id]);
    }
}
