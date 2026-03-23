<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Player;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
        ]);

        // Assign default player role
        $user->assignRole('player');

        // Create a player profile for the user
        Player::create([
            'user_id' => $user->id,
            'experience_level' => 'beginner',
            'availability_status' => 'available',
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'data' => [
                'user' => $this->formatUser($user),
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl') * 60,
            ],
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (! $token = JWTAuth::attempt($credentials)) {
            return response()->json([
                'type' => 'https://httpstatuses.io/401',
                'title' => 'Unauthorized',
                'status' => 401,
                'detail' => 'Invalid credentials.',
            ], 401);
        }

        $user = auth()->user();
        $user->update(['last_login_at' => now()]);

        return response()->json([
            'data' => [
                'user' => $this->formatUser($user),
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl') * 60,
            ],
        ]);
    }

    public function me(): JsonResponse
    {
        $user = auth('api')->user();
        if (! $user) {
            return response()->json([
                'type' => 'https://httpstatuses.io/401',
                'title' => 'Unauthorized',
                'status' => 401,
                'detail' => 'Unauthenticated.',
            ], 401);
        }
        $user->load('player');

        return response()->json([
            'data' => $this->formatUser($user),
        ]);
    }

    public function logout(): JsonResponse
    {
        $token = JWTAuth::getToken();
        if ($token) {
            JWTAuth::invalidate($token);
        }

        return response()->json([
            'message' => 'Successfully logged out.',
        ]);
    }

    public function refresh(): JsonResponse
    {
        $currentToken = JWTAuth::getToken();
        if (! $currentToken) {
            return response()->json([
                'type' => 'https://httpstatuses.io/401',
                'title' => 'Unauthorized',
                'status' => 401,
                'detail' => 'Token not provided.',
            ], 401);
        }

        $token = JWTAuth::refresh($currentToken);

        return response()->json([
            'data' => [
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl') * 60,
            ],
        ]);
    }

    private function formatUser(User $user): array
    {
        // Load roles if not already loaded
        if (! $user->relationLoaded('roles')) {
            $user->load('roles');
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar_url' => $user->avatar_url,
            'timezone' => $user->timezone,
            'is_active' => $user->is_active,
            'email_verified_at' => $user->email_verified_at?->toIso8601String(),
            'created_at' => $user->created_at->toIso8601String(),
            'player' => $user->player ? [
                'id' => $user->player->id,
                'bio' => $user->player->bio,
                'experience_level' => $user->player->experience_level,
                'availability_status' => $user->player->availability_status,
                'is_private' => $user->player->is_private,
            ] : null,
            'roles' => $user->roles->map(fn ($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'guard_name' => $role->guard_name,
            ])->toArray(),
        ];
    }
}
