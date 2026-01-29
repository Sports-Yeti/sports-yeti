<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spaces', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('facility_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('sport_type')->default('basketball');
            $table->integer('capacity')->default(10);
            $table->decimal('hourly_rate', 10, 2)->default(0);
            $table->string('surface_type')->nullable();
            $table->boolean('is_indoor')->default(true);
            $table->boolean('is_active')->default(true);
            $table->json('features')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('facility_id')->references('id')->on('facilities')->onDelete('cascade');
            $table->index('facility_id');
            $table->index('sport_type');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spaces');
    }
};
