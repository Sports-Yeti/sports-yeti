<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('post_id');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->uuid('parent_id')->nullable();
            $table->text('content');
            $table->integer('likes_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
            $table->index('post_id');
            $table->index('user_id');
            $table->index('parent_id');
        });

        // Self-referencing foreign key must be added after table creation
        Schema::table('comments', function (Blueprint $table) {
            $table->foreign('parent_id')->references('id')->on('comments')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
