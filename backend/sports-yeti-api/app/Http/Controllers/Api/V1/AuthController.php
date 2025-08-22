<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Models\Player;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'language_preference' => 'nullable|string|in:en,es,fr,pt,de,zh',
            'timezone' => 'nullable|string|max:50',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'language_preference' => $validated['language_preference'] ?? 'en',
            'timezone' => $validated['timezone'] ?? 'UTC',
        ]);

        // Create associated player profile
        $user->player()->create([
            'experience_level' => 'beginner',
            'availability_status' => 'available',
            'is_private' => false,
            'point_balance' => 1000, // Welcome bonus
        ]);

        $token = JWTAuth::fromUser($user);
        $refreshToken = $this->createRefreshToken($user);

        return response()->json([
            'data' => [
                'user' => $user->load('player'),
                'access_token' => $token,
                'refresh_token' => $refreshToken,
                'token_type' => 'bearer',
                'expires_in' => auth()->factory()->getTTL() * 60,
            ],
            'message' => 'User registered successfully'
        ], 201);
    }

    /**
     * Login user and create token
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!$token = auth()->attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials provided.'],
            ]);
        }

        $user = auth()->user();
        $refreshToken = $this->createRefreshToken($user);

        return response()->json([
            'data' => [
                'user' => $user->load('player'),
                'access_token' => $token,
                'refresh_token' => $refreshToken,
                'token_type' => 'bearer',
                'expires_in' => auth()->factory()->getTTL() * 60,
            ],
            'message' => 'Login successful'
        ]);
    }

    /**
     * Logout user (invalidate token)
     */
    public function logout(): JsonResponse
    {
        auth()->logout();
        
        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }

    /**
     * Refresh access token
     */
    public function refresh(Request $request): JsonResponse
    {
        $refreshToken = $request->bearerToken();
        
        if (!$refreshToken || !$this->validateRefreshToken($refreshToken)) {
            return response()->json([
                'type' => 'https://tools.ietf.org/html/rfc7235#section-3.1',
                'title' => 'Invalid Refresh Token',
                'status' => 401,
                'detail' => 'The refresh token is invalid or expired.',
                'instance' => $request->getUri(),
            ], 401, ['Content-Type' => 'application/problem+json']);
        }

        try {
            $newToken = auth()->refresh();
            $user = auth()->user();
            $newRefreshToken = $this->createRefreshToken($user);
            
            return response()->json([
                'data' => [
                    'access_token' => $newToken,
                    'refresh_token' => $newRefreshToken,
                    'token_type' => 'bearer',
                    'expires_in' => auth()->factory()->getTTL() * 60,
                ],
                'message' => 'Token refreshed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'type' => 'https://tools.ietf.org/html/rfc7235#section-3.1',
                'title' => 'Token Refresh Failed',
                'status' => 401,
                'detail' => 'Unable to refresh the access token.',
                'instance' => $request->getUri(),
            ], 401, ['Content-Type' => 'application/problem+json']);
        }
    }

    /**
     * Get authenticated user profile
     */
    public function profile(): JsonResponse
    {
        $user = auth()->user();
        
        return response()->json([
            'data' => $user->load(['player', 'administeredLeagues'])
        ]);
    }

    private function createRefreshToken(User $user): string
    {
        // Simple refresh token implementation
        // In production, this should be more sophisticated with rotation
        return base64_encode($user->id . ':' . now()->addDays(7)->timestamp . ':' . bin2hex(random_bytes(16)));
    }

    private function validateRefreshToken(string $token): bool
    {
        try {
            $decoded = base64_decode($token);
            $parts = explode(':', $decoded);
            
            if (count($parts) !== 3) {
                return false;
            }
            
            [$userId, $expiry, $signature] = $parts;
            
            // Check expiry
            if (now()->timestamp > $expiry) {
                return false;
            }
            
            // Validate user exists
            return User::find($userId) !== null;
        } catch (\Exception $e) {
            return false;
        }
    }
}
