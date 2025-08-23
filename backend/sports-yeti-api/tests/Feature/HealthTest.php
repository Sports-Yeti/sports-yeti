<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthTest extends TestCase
{
    public function test_health_returns_ok(): void
    {
        $res = $this->getJson('/api/v1/health');
        $res->assertOk()->assertJsonPath('ok', true);
    }
}


