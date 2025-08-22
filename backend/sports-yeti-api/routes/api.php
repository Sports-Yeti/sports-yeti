<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', function () {
        return response()->json([
            'ok' => true,
            'service' => 'sports-yeti-api',
            'time' => now()->toISOString(),
        ]);
    });

    Route::prefix('auth')->group(function () {
        Route::post('/register', [App\Http\Controllers\AuthController::class, 'register']);
        Route::post('/login', [App\Http\Controllers\AuthController::class, 'login']);
        Route::post('/refresh', [App\Http\Controllers\AuthController::class, 'refresh']);
        Route::middleware('auth:api')->group(function () {
            Route::get('/me', [App\Http\Controllers\AuthController::class, 'me']);
            Route::post('/logout', [App\Http\Controllers\AuthController::class, 'logout']);
        });
    });

    Route::middleware(['auth:api', 'throttle:120,1'])->group(function () {
        Route::get('/leagues', [App\Http\Controllers\LeagueController::class, 'index']);
        Route::post('/leagues', [App\Http\Controllers\LeagueController::class, 'store']);

        Route::get('/leagues/{leagueId}/teams', [App\Http\Controllers\TeamController::class, 'index']);
        Route::post('/leagues/{leagueId}/teams', [App\Http\Controllers\TeamController::class, 'store']);

        Route::get('/leagues/{leagueId}/players', [App\Http\Controllers\PlayerController::class, 'index']);
        Route::post('/leagues/{leagueId}/players', [App\Http\Controllers\PlayerController::class, 'store']);

        Route::get('/leagues/{leagueId}/facilities', [App\Http\Controllers\FacilityController::class, 'index']);
        Route::post('/leagues/{leagueId}/facilities', [App\Http\Controllers\FacilityController::class, 'store']);

        Route::get('/leagues/{leagueId}/bookings', [App\Http\Controllers\BookingController::class, 'index']);
        Route::post('/leagues/{leagueId}/bookings', [App\Http\Controllers\BookingController::class, 'store']);

        Route::post('/leagues/{leagueId}/payments/charges', [App\Http\Controllers\PaymentController::class, 'createCharge']);
        Route::post('/leagues/{leagueId}/payments/charges/{chargeId}/refunds', [App\Http\Controllers\PaymentController::class, 'refund']);
    });

    Route::post('/payments/webhook', [App\Http\Controllers\PaymentController::class, 'webhook']);

    Route::middleware(['auth:api', 'throttle:120,1'])->group(function () {
        Route::get('/leagues/{leagueId}/chat/stream', [App\Http\Controllers\SseChatController::class, 'stream']);
        Route::post('/leagues/{leagueId}/chat/publish', [App\Http\Controllers\SseChatController::class, 'publish']);
    });
});


