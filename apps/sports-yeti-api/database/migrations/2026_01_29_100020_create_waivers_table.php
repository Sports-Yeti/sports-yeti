<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('waivers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('league_id');
            $table->string('title');
            $table->text('content');
            $table->boolean('is_required')->default(true);
            $table->boolean('is_active')->default(true);
            $table->string('version')->default('1.0');
            $table->timestamps();

            $table->foreign('league_id')->references('id')->on('leagues')->onDelete('cascade');
            $table->index('league_id');
            $table->index('is_active');
        });

        Schema::create('waiver_signatures', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('waiver_id');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('signed_at');
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->string('signature_hash')->nullable();
            $table->timestamps();

            $table->foreign('waiver_id')->references('id')->on('waivers')->onDelete('cascade');
            $table->unique(['waiver_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waiver_signatures');
        Schema::dropIfExists('waivers');
    }
};
