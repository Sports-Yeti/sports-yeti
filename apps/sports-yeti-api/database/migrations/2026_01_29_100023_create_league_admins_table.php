<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('league_admins', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('league_id');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('role')->default('admin'); // owner, admin, moderator
            $table->json('permissions')->nullable();
            $table->timestamps();

            $table->foreign('league_id')->references('id')->on('leagues')->onDelete('cascade');
            $table->unique(['league_id', 'user_id']);
            $table->index('role');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('league_admins');
    }
};
