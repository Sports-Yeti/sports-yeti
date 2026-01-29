<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('team_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('team_id');
            $table->uuid('player_id');
            $table->string('role')->default('player'); // captain, co-captain, player
            $table->string('payment_status')->default('pending'); // pending, paid, waived
            $table->boolean('waiver_signed')->default(false);
            $table->timestamp('joined_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('team_id')->references('id')->on('teams')->onDelete('cascade');
            $table->foreign('player_id')->references('id')->on('players')->onDelete('cascade');
            $table->unique(['team_id', 'player_id']);
            $table->index('role');
            $table->index('payment_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_members');
    }
};
