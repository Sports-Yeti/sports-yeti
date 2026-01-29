<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Payment::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $perPage = min($request->get('per_page', 20), 100);
        $payments = $query->paginate($perPage);

        return response()->json([
            'data' => $payments->items(),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
            ],
        ]);
    }

    public function show(Payment $payment): JsonResponse
    {
        if ($payment->user_id !== auth()->id()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'You cannot view this payment.',
            ], 403);
        }

        $payment->load(['payable', 'league:id,name']);

        return response()->json([
            'data' => $payment,
        ]);
    }

    public function createIntent(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount' => ['required', 'numeric', 'min:1'],
            'type' => ['required', 'string', 'in:league_registration,camp_registration,facility_booking'],
            'payable_type' => ['required', 'string'],
            'payable_id' => ['required', 'uuid'],
            'league_id' => ['nullable', 'uuid', 'exists:leagues,id'],
            'idempotency_key' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/422',
                'title' => 'Validation Error',
                'status' => 422,
                'detail' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Check idempotency
        if ($request->idempotency_key) {
            $existingPayment = Payment::where('idempotency_key', $request->idempotency_key)->first();
            if ($existingPayment) {
                return response()->json([
                    'data' => [
                        'payment' => $existingPayment,
                        'client_secret' => null,
                    ],
                ]);
            }
        }

        $amount = (float) $request->amount;
        $fee = $this->paymentService->calculateFee($amount);
        $netAmount = $amount - $fee;

        // Create payment record
        $payment = Payment::create([
            'user_id' => auth()->id(),
            'league_id' => $request->league_id,
            'amount' => $amount,
            'fee_amount' => $fee,
            'net_amount' => $netAmount,
            'type' => $request->type,
            'status' => 'pending',
            'payable_type' => $request->payable_type,
            'payable_id' => $request->payable_id,
            'idempotency_key' => $request->idempotency_key,
        ]);

        // Create Stripe payment intent
        $result = $this->paymentService->createPaymentIntent(
            auth()->user(),
            $amount,
            'usd',
            [
                'payment_id' => $payment->id,
                'type' => $request->type,
            ]
        );

        if (!$result['success']) {
            $payment->update(['status' => 'failed']);
            return response()->json([
                'type' => 'https://httpstatuses.io/500',
                'title' => 'Payment Error',
                'status' => 500,
                'detail' => $result['error'] ?? 'Failed to create payment intent.',
            ], 500);
        }

        $payment->update([
            'stripe_payment_intent_id' => $result['payment_intent_id'],
            'status' => 'processing',
        ]);

        return response()->json([
            'data' => [
                'payment' => $payment,
                'client_secret' => $result['client_secret'],
            ],
        ], 201);
    }

    public function confirm(Request $request, Payment $payment): JsonResponse
    {
        if ($payment->user_id !== auth()->id()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'You cannot confirm this payment.',
            ], 403);
        }

        if ($payment->status === 'completed') {
            return response()->json([
                'data' => $payment,
            ]);
        }

        if (!$payment->stripe_payment_intent_id) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'No payment intent found.',
            ], 400);
        }

        $result = $this->paymentService->confirmPayment($payment->stripe_payment_intent_id);

        if ($result['success'] && $result['status'] === 'completed') {
            $payment->update([
                'status' => 'completed',
                'stripe_charge_id' => $result['charge_id'] ?? null,
                'paid_at' => now(),
            ]);
        } else {
            $payment->update(['status' => $result['status'] ?? 'failed']);
        }

        return response()->json([
            'data' => $payment,
        ]);
    }

    public function refund(Request $request, Payment $payment): JsonResponse
    {
        $this->authorize('refund', $payment);

        if ($payment->status !== 'completed') {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'Only completed payments can be refunded.',
            ], 400);
        }

        $amount = $request->amount ? (float) $request->amount : null;

        $result = $this->paymentService->refundPayment($payment, $amount);

        if (!$result['success']) {
            return response()->json([
                'type' => 'https://httpstatuses.io/500',
                'title' => 'Refund Error',
                'status' => 500,
                'detail' => $result['error'] ?? 'Failed to process refund.',
            ], 500);
        }

        return response()->json([
            'data' => $payment->fresh(),
            'refund' => [
                'refund_id' => $result['refund_id'],
                'amount' => $result['amount'],
            ],
        ]);
    }
}
