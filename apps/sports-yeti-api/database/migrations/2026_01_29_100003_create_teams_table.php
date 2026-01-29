<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->uuid('league_id');
            $table->uuid('captain_id');
            $table->text('description')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected, inactive
            $table->integer('max_roster_size')->default(15);
            $table->json('stats')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('league_id')->references('id')->on('leagues')->onDelete('cascade');
            $table->foreign('captain_id')->references('id')->on('players')->onDelete('cascade');
            $table->index('league_id');
            $table->index('captain_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teams');
    }
};
