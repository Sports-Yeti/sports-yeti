<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Facility;
use App\Models\League;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Facility>
 */
class FacilityFactory extends Factory
{
    protected $model = Facility::class;

    public function definition(): array
    {
        $facilityTypes = [
            'Sports Center', 'Recreation Complex', 'Community Center',
            'Athletic Club', 'Gym', 'Arena', 'Field House',
        ];

        return [
            'league_id' => League::factory(),
            'name' => $this->faker->company().' '.$this->faker->randomElement($facilityTypes),
            'description' => $this->faker->paragraph(),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'state' => $this->faker->stateAbbr(),
            'zip_code' => $this->faker->postcode(),
            'phone' => $this->faker->phoneNumber(),
            'email' => $this->faker->companyEmail(),
            'website' => $this->faker->url(),
            'status' => 'active',
            'amenities' => $this->faker->randomElements(
                ['parking', 'wifi', 'locker_rooms', 'showers', 'pro_shop', 'cafe', 'air_conditioning'],
                3
            ),
            'operating_hours' => [
                'monday' => ['open' => '06:00', 'close' => '22:00'],
                'tuesday' => ['open' => '06:00', 'close' => '22:00'],
                'wednesday' => ['open' => '06:00', 'close' => '22:00'],
                'thursday' => ['open' => '06:00', 'close' => '22:00'],
                'friday' => ['open' => '06:00', 'close' => '22:00'],
                'saturday' => ['open' => '08:00', 'close' => '20:00'],
                'sunday' => ['open' => '08:00', 'close' => '18:00'],
            ],
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }
}
