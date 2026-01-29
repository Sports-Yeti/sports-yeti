<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leagues', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('admin_id')->constrained('users')->onDelete('cascade');
            $table->string('sport_type')->default('basketball');
            $table->string('location')->nullable();
            $table->string('timezone')->default('America/New_York');
            $table->decimal('registration_fee', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('admin_id');
            $table->index('sport_type');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leagues');
    }
};
