<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\LeagueController;

// Health check endpoint
Route::get('health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'sports-yeti-api',
        'version' => '1.0.0',
        'timestamp' => now()->toISOString(),
    ]);
});

// API v1 routes
Route::prefix('api/v1')->group(function () {
    
    // Public auth routes
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        
        // Protected auth routes
        Route::middleware(['jwt.auth'])->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('profile', [AuthController::class, 'profile']);
        });
    });

    // Protected API routes
    Route::middleware(['jwt.auth'])->group(function () {
        
        // League routes
        Route::prefix('leagues')->group(function () {
            Route::get('/', [LeagueController::class, 'index']);
            Route::post('/', [LeagueController::class, 'store']);
            Route::get('{league}', [LeagueController::class, 'show']);
            Route::put('{league}', [LeagueController::class, 'update']);
            Route::delete('{league}', [LeagueController::class, 'destroy']);
            
            // League sub-resources
            Route::get('{league}/teams', [LeagueController::class, 'teams']);
            Route::post('{league}/teams', [LeagueController::class, 'createTeam']);
            Route::get('{league}/players', [LeagueController::class, 'players']);
        });
    });
});