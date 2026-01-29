<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\CampController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\FacilityController;
use App\Http\Controllers\Api\V1\GameController;
use App\Http\Controllers\Api\V1\LeagueController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\PlayerController;
use App\Http\Controllers\Api\V1\TeamController;
use App\Http\Controllers\Api\V1\WebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Sports Yeti API v1
|
*/

Route::prefix('v1')->group(function () {
    // Health check
    Route::get('/health', function () {
        return response()->json([
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
            'version' => 'v1',
        ]);
    });

    // Authentication routes (public) with strict rate limiting
    Route::prefix('auth')->middleware('throttle:auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);

        Route::middleware('auth:api')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/refresh', [AuthController::class, 'refresh']);
        });
    });

    // Protected routes
    Route::middleware('auth:api')->group(function () {
        // Players
        Route::prefix('players')->group(function () {
            Route::get('/', [PlayerController::class, 'index']);
            Route::get('/me', [PlayerController::class, 'me']);
            Route::get('/{player}', [PlayerController::class, 'show']);
            Route::put('/{player}', [PlayerController::class, 'update']);
        });

        // Leagues
        Route::prefix('leagues')->group(function () {
            Route::get('/', [LeagueController::class, 'index']);
            Route::post('/', [LeagueController::class, 'store']);
            Route::get('/{league}', [LeagueController::class, 'show']);
            Route::put('/{league}', [LeagueController::class, 'update']);
            Route::delete('/{league}', [LeagueController::class, 'destroy']);
            Route::get('/{league}/stats', [LeagueController::class, 'stats']);
        });

        // Teams
        Route::prefix('teams')->group(function () {
            Route::get('/', [TeamController::class, 'index']);
            Route::post('/', [TeamController::class, 'store']);
            Route::get('/{team}', [TeamController::class, 'show']);
            Route::put('/{team}', [TeamController::class, 'update']);
            Route::delete('/{team}', [TeamController::class, 'destroy']);
            Route::post('/{team}/members', [TeamController::class, 'addMember']);
            Route::delete('/{team}/members/{player}', [TeamController::class, 'removeMember']);
        });

        // Facilities
        Route::prefix('facilities')->group(function () {
            Route::get('/', [FacilityController::class, 'index']);
            Route::post('/', [FacilityController::class, 'store']);
            Route::get('/{facility}', [FacilityController::class, 'show']);
            Route::put('/{facility}', [FacilityController::class, 'update']);
            Route::delete('/{facility}', [FacilityController::class, 'destroy']);
        });

        // Bookings
        Route::prefix('bookings')->group(function () {
            Route::get('/', [BookingController::class, 'index']);
            Route::post('/', [BookingController::class, 'store']);
            Route::get('/{booking}', [BookingController::class, 'show']);
            Route::post('/{booking}/cancel', [BookingController::class, 'cancel']);
            Route::post('/check-in', [BookingController::class, 'checkIn']);
        });

        // Camps
        Route::prefix('camps')->group(function () {
            Route::get('/', [CampController::class, 'index']);
            Route::post('/', [CampController::class, 'store']);
            Route::get('/{camp}', [CampController::class, 'show']);
            Route::put('/{camp}', [CampController::class, 'update']);
            Route::delete('/{camp}', [CampController::class, 'destroy']);
            Route::post('/{camp}/register', [CampController::class, 'register']);
            Route::delete('/{camp}/register', [CampController::class, 'unregister']);
        });

        // Games
        Route::prefix('games')->group(function () {
            Route::get('/', [GameController::class, 'index']);
            Route::post('/', [GameController::class, 'store']);
            Route::get('/{game}', [GameController::class, 'show']);
            Route::put('/{game}', [GameController::class, 'update']);
            Route::delete('/{game}', [GameController::class, 'destroy']);
            Route::post('/{game}/attendance', [GameController::class, 'respondAttendance']);
        });

        // Chats
        Route::prefix('chats')->group(function () {
            Route::get('/{chat}', [ChatController::class, 'show']);
            Route::get('/{chat}/messages', [ChatController::class, 'messages']);
            Route::post('/{chat}/messages', [ChatController::class, 'sendMessage']);
            Route::delete('/{chat}/messages/{message}', [ChatController::class, 'deleteMessage']);
            Route::get('/{chat}/polls', [ChatController::class, 'polls']);
            Route::post('/{chat}/polls', [ChatController::class, 'createPoll']);
            Route::post('/{chat}/polls/{poll}/vote', [ChatController::class, 'votePoll']);
            Route::post('/{chat}/polls/{poll}/close', [ChatController::class, 'closePoll']);
        });

        // Notifications
        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
            Route::delete('/clear', [NotificationController::class, 'clearAll']);
            Route::put('/push-token', [NotificationController::class, 'updatePushToken']);
            Route::put('/preferences', [NotificationController::class, 'updatePreferences']);
            Route::post('/{notification}/read', [NotificationController::class, 'markAsRead']);
            Route::delete('/{notification}', [NotificationController::class, 'destroy']);
        });

        // Payments with stricter rate limiting
        Route::prefix('payments')->middleware('throttle:payments')->group(function () {
            Route::get('/', [PaymentController::class, 'index']);
            Route::get('/{payment}', [PaymentController::class, 'show']);
            Route::post('/intent', [PaymentController::class, 'createIntent']);
            Route::post('/{payment}/confirm', [PaymentController::class, 'confirm']);
            Route::post('/{payment}/refund', [PaymentController::class, 'refund'])->middleware('permission:payments.refund');
        });
    });

    // Webhooks (no auth required - called by external services)
    Route::prefix('webhooks')->middleware('throttle:webhooks')->group(function () {
        Route::post('/stripe', [WebhookController::class, 'handleStripe']);
    });
});
