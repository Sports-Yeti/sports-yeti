<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Facility;
use App\Models\League;
use App\Models\Space;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Facility $facility;
    private Space $space;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed roles and permissions
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

        $this->user = User::factory()->create();
        $this->user->assignRole('player');

        $league = League::create([
            'name' => 'Test League',
            'admin_id' => $this->user->id,
            'sport' => 'basketball',
            'status' => 'active',
        ]);

        $this->facility = Facility::create([
            'league_id' => $league->id,
            'name' => 'Test Facility',
            'address' => '123 Test St',
            'city' => 'Test City',
            'state' => 'TS',
            'zip_code' => '12345',
            'status' => 'active',
        ]);

        $this->space = Space::create([
            'facility_id' => $this->facility->id,
            'name' => 'Court 1',
            'type' => 'basketball_court',
            'capacity' => 20,
            'hourly_rate' => 50.00,
            'is_active' => true,
        ]);
    }

    public function test_user_can_list_bookings(): void
    {
        Booking::create([
            'user_id' => $this->user->id,
            'space_id' => $this->space->id,
            'start_time' => now()->addDays(1)->setHour(10),
            'end_time' => now()->addDays(1)->setHour(11),
            'status' => 'confirmed',
            'total_amount' => 50.00,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/bookings');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'start_time',
                        'end_time',
                        'status',
                    ],
                ],
            ]);
    }

    public function test_user_can_create_booking(): void
    {
        $startTime = now()->addDays(1)->setHour(10)->format('Y-m-d H:i:s');
        $endTime = now()->addDays(1)->setHour(11)->format('Y-m-d H:i:s');

        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/bookings', [
                'space_id' => $this->space->id,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'purpose' => 'Basketball practice',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'start_time',
                    'end_time',
                    'status',
                    'qr_code',
                ],
            ]);

        $this->assertDatabaseHas('bookings', [
            'user_id' => $this->user->id,
            'space_id' => $this->space->id,
        ]);
    }

    public function test_booking_conflict_detection(): void
    {
        $startTime = now()->addDays(1)->setHour(10);
        $endTime = now()->addDays(1)->setHour(11);

        // Create an existing booking
        Booking::create([
            'user_id' => $this->user->id,
            'space_id' => $this->space->id,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'status' => 'confirmed',
            'total_amount' => 50.00,
        ]);

        // Try to create overlapping booking
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/bookings', [
                'space_id' => $this->space->id,
                'start_time' => $startTime->format('Y-m-d H:i:s'),
                'end_time' => $endTime->format('Y-m-d H:i:s'),
            ]);

        $response->assertStatus(409); // Conflict
    }

    public function test_user_can_cancel_own_booking(): void
    {
        $booking = Booking::create([
            'user_id' => $this->user->id,
            'space_id' => $this->space->id,
            'start_time' => now()->addDays(1)->setHour(10),
            'end_time' => now()->addDays(1)->setHour(11),
            'status' => 'confirmed',
            'total_amount' => 50.00,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/bookings/{$booking->id}/cancel");

        $response->assertOk();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_user_cannot_cancel_other_users_booking(): void
    {
        $otherUser = User::factory()->create();
        $otherUser->assignRole('player');

        $booking = Booking::create([
            'user_id' => $otherUser->id,
            'space_id' => $this->space->id,
            'start_time' => now()->addDays(1)->setHour(10),
            'end_time' => now()->addDays(1)->setHour(11),
            'status' => 'confirmed',
            'total_amount' => 50.00,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/bookings/{$booking->id}/cancel");

        $response->assertStatus(403);
    }

    public function test_idempotent_booking_creation(): void
    {
        $startTime = now()->addDays(2)->setHour(10)->format('Y-m-d H:i:s');
        $endTime = now()->addDays(2)->setHour(11)->format('Y-m-d H:i:s');
        $idempotencyKey = 'test-idempotency-key-' . uniqid();

        // First request
        $response1 = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/bookings', [
                'space_id' => $this->space->id,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'idempotency_key' => $idempotencyKey,
            ]);

        $response1->assertStatus(201);
        $bookingId = $response1->json('data.id');

        // Second request with same idempotency key should return same booking
        $response2 = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/bookings', [
                'space_id' => $this->space->id,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'idempotency_key' => $idempotencyKey,
            ]);

        $response2->assertOk()
            ->assertJson([
                'data' => [
                    'id' => $bookingId,
                ],
            ]);

        // Only one booking should exist
        $this->assertEquals(1, Booking::where('idempotency_key', $idempotencyKey)->count());
    }

    public function test_booking_requires_future_start_time(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/bookings', [
                'space_id' => $this->space->id,
                'start_time' => now()->subHour()->format('Y-m-d H:i:s'),
                'end_time' => now()->format('Y-m-d H:i:s'),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['start_time']);
    }
}
