<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Space;
use App\Services\BookingService;
use App\Services\QrCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    public function __construct(
        private BookingService $bookingService,
        private QrCodeService $qrCodeService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Booking::with([
            'space.facility:id,name',
            'user:id,name,email',
        ])->where('user_id', auth()->id());

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('upcoming')) {
            $query->where('start_time', '>', now())
                ->where('status', 'confirmed');
        }

        $perPage = min($request->get('per_page', 15), 100);
        $bookings = $query->orderBy('start_time', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $bookings->items(),
            'meta' => [
                'current_page' => $bookings->currentPage(),
                'last_page' => $bookings->lastPage(),
                'per_page' => $bookings->perPage(),
                'total' => $bookings->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'space_id' => ['required', 'uuid', 'exists:spaces,id'],
            'start_time' => ['required', 'date', 'after:now'],
            'end_time' => ['required', 'date', 'after:start_time'],
            'purpose' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
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
        $idempotencyKey = $request->idempotency_key ?? Str::uuid()->toString();
        $existingBooking = Booking::where('idempotency_key', $idempotencyKey)->first();
        if ($existingBooking) {
            return response()->json([
                'data' => $existingBooking,
            ], 200);
        }

        // Check for conflicts
        $space = Space::findOrFail($request->space_id);
        $hasConflict = $this->bookingService->hasConflict(
            $space,
            $request->start_time,
            $request->end_time
        );

        if ($hasConflict) {
            return response()->json([
                'type' => 'https://httpstatuses.io/409',
                'title' => 'Conflict',
                'status' => 409,
                'detail' => 'This time slot is not available.',
            ], 409);
        }

        // Calculate amount
        $hours = $this->bookingService->calculateHours(
            $request->start_time,
            $request->end_time
        );
        $amount = $hours * $space->hourly_rate;

        // Create booking
        $booking = Booking::create([
            'space_id' => $request->space_id,
            'user_id' => auth()->id(),
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'status' => 'pending',
            'amount' => $amount,
            'purpose' => $request->purpose,
            'notes' => $request->notes,
            'idempotency_key' => $idempotencyKey,
        ]);

        // Generate QR code
        $qrCode = $this->qrCodeService->generateBookingQr($booking);
        $booking->update([
            'qr_code' => $qrCode['code'],
            'qr_code_url' => $qrCode['url'],
        ]);

        $booking->load('space.facility:id,name');

        return response()->json([
            'data' => $booking,
        ], 201);
    }

    public function show(Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);

        $booking->load([
            'space.facility:id,name,address,city',
            'user:id,name,email',
        ]);

        return response()->json([
            'data' => $booking,
        ]);
    }

    public function cancel(Booking $booking): JsonResponse
    {
        $this->authorize('cancel', $booking);

        if ($booking->status === 'cancelled') {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'Booking is already cancelled.',
            ], 400);
        }

        if ($booking->checked_in_at) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'Cannot cancel a booking that has been checked in.',
            ], 400);
        }

        $booking->update(['status' => 'cancelled']);

        return response()->json([
            'data' => $booking,
        ]);
    }

    public function checkIn(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'qr_code' => ['required', 'string'],
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

        $booking = Booking::where('qr_code', $request->qr_code)->first();

        if (! $booking) {
            return response()->json([
                'type' => 'https://httpstatuses.io/404',
                'title' => 'Not Found',
                'status' => 404,
                'detail' => 'Invalid QR code.',
            ], 404);
        }

        if ($booking->checked_in_at) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'Already checked in.',
            ], 400);
        }

        if ($booking->status !== 'confirmed') {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'Booking is not confirmed.',
            ], 400);
        }

        $booking->update([
            'checked_in_at' => now(),
            'status' => 'completed',
        ]);

        return response()->json([
            'data' => $booking,
            'message' => 'Check-in successful!',
        ]);
    }
}
