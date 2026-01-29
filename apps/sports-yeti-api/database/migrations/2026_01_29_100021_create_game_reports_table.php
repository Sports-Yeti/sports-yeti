<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('game_id');
            $table->uuid('captain_id');
            $table->string('report_type'); // absence, equipment_damage, incident, general
            $table->text('details');
            $table->json('absent_players')->nullable();
            $table->boolean('equipment_damage')->default(false);
            $table->text('equipment_damage_description')->nullable();
            $table->string('status')->default('submitted'); // submitted, reviewed, resolved
            $table->timestamps();

            $table->foreign('game_id')->references('id')->on('games')->onDelete('cascade');
            $table->foreign('captain_id')->references('id')->on('players')->onDelete('cascade');
            $table->index('game_id');
            $table->index('report_type');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_reports');
    }
};
