<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\CampController;
use App\Http\Controllers\Api\V1\FacilityController;
use App\Http\Controllers\Api\V1\GameController;
use App\Http\Controllers\Api\V1\LeagueController;
use App\Http\Controllers\Api\V1\PlayerController;
use App\Http\Controllers\Api\V1\TeamController;
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

    // Authentication routes (public)
    Route::prefix('auth')->group(function () {
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
    });
});
