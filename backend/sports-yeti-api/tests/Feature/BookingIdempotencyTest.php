<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\League;
use App\Models\Facility;
use Tests\TestCase;

class BookingIdempotencyTest extends TestCase
{
    public function test_booking_idempotency(): void
    {
        $user = User::factory()->create(['password' => 'password']);
        $login = $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'password']);
        $token = $login->json('access_token');

        $league = League::create(['name' => 'L']);
        $facility = Facility::create(['league_id' => $league->id, 'name' => 'Court']);

        $headers = [
            'Authorization' => 'Bearer '.$token,
            'X-League-Id' => (string) $league->id,
            'Idempotency-Key' => 'abc123',
        ];

        $payload = [
            'facility_id' => $facility->id,
            'start_at' => '2025-01-01T10:00:00Z',
            'end_at' => '2025-01-01T11:00:00Z',
        ];

        $r1 = $this->withHeaders($headers)->postJson("/api/v1/leagues/{$league->id}/bookings", $payload);
        $r1->assertCreated();
        $r2 = $this->withHeaders($headers)->postJson("/api/v1/leagues/{$league->id}/bookings", $payload);
        $r2->assertOk();
    }
}


