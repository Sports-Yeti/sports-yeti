<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class AuthTest extends TestCase
{
    public function test_login_and_me(): void
    {
        $user = User::factory()->create(['password' => 'password']);
        $res = $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'password']);
        $res->assertOk();
        $token = $res->json('access_token');
        $this->assertIsString($token);
        $me = $this->withHeader('Authorization', 'Bearer '.$token)->getJson('/api/v1/auth/me');
        $me->assertOk()->assertJsonPath('email', $user->email);
    }
}


