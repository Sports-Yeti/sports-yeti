<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Changes subject_id and causer_id from bigint to string to support
     * models that use UUIDs as primary keys (e.g., Player model).
     */
    public function up(): void
    {
        Schema::table('activity_log', function (Blueprint $table) {
            // Drop the existing indexes before changing column types
            $table->dropIndex('subject');
            $table->dropIndex('causer');
        });

        Schema::table('activity_log', function (Blueprint $table) {
            // Change subject_id and causer_id to string to support UUIDs
            $table->string('subject_id', 36)->nullable()->change();
            $table->string('causer_id', 36)->nullable()->change();
        });

        Schema::table('activity_log', function (Blueprint $table) {
            // Re-add the indexes
            $table->index(['subject_id', 'subject_type'], 'subject');
            $table->index(['causer_id', 'causer_type'], 'causer');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activity_log', function (Blueprint $table) {
            $table->dropIndex('subject');
            $table->dropIndex('causer');
        });

        Schema::table('activity_log', function (Blueprint $table) {
            // Revert back to bigint (note: this may fail if UUID data exists)
            $table->unsignedBigInteger('subject_id')->nullable()->change();
            $table->unsignedBigInteger('causer_id')->nullable()->change();
        });

        Schema::table('activity_log', function (Blueprint $table) {
            $table->index(['subject_id', 'subject_type'], 'subject');
            $table->index(['causer_id', 'causer_type'], 'causer');
        });
    }
};
