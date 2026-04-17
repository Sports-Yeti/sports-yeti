<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('team_invitations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('team_id');
            $table->uuid('player_id');
            $table->foreignId('invited_by')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->text('message')->nullable();
            $table->timestamps();

            $table->foreign('team_id')->references('id')->on('teams')->cascadeOnDelete();
            $table->foreign('player_id')->references('id')->on('players')->cascadeOnDelete();
            $table->index(['team_id', 'player_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_invitations');
    }
};
