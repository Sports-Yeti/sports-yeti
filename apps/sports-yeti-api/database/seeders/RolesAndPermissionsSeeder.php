<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions by domain
        $permissions = [
            // League permissions
            'leagues.view',
            'leagues.create',
            'leagues.update',
            'leagues.delete',
            'leagues.manage-admins',

            // Team permissions
            'teams.view',
            'teams.create',
            'teams.update',
            'teams.delete',
            'teams.manage-members',

            // Player permissions
            'players.view',
            'players.update',
            'players.update-own',

            // Facility permissions
            'facilities.view',
            'facilities.create',
            'facilities.update',
            'facilities.delete',

            // Booking permissions
            'bookings.view',
            'bookings.view-own',
            'bookings.create',
            'bookings.cancel',
            'bookings.cancel-own',
            'bookings.check-in',

            // Camp permissions
            'camps.view',
            'camps.create',
            'camps.update',
            'camps.delete',
            'camps.manage-registrations',

            // Game permissions
            'games.view',
            'games.create',
            'games.update',
            'games.delete',
            'games.manage-participants',
            'games.submit-report',

            // Chat permissions
            'chats.view',
            'chats.send-message',
            'chats.delete-message',
            'chats.create-poll',
            'chats.close-poll',

            // Payment permissions
            'payments.view',
            'payments.view-own',
            'payments.create',
            'payments.refund',

            // Notification permissions
            'notifications.view',
            'notifications.send',
            'notifications.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'api']);
        }

        // Create roles and assign permissions
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'api']);
        // Super admin gets all permissions via Gate::before in AuthServiceProvider

        $leagueAdminRole = Role::firstOrCreate(['name' => 'league-admin', 'guard_name' => 'api']);
        $leagueAdminRole->syncPermissions([
            'leagues.view',
            'leagues.update',
            'leagues.manage-admins',
            'teams.view',
            'teams.create',
            'teams.update',
            'teams.delete',
            'teams.manage-members',
            'players.view',
            'players.update',
            'facilities.view',
            'facilities.create',
            'facilities.update',
            'facilities.delete',
            'bookings.view',
            'bookings.create',
            'bookings.cancel',
            'bookings.check-in',
            'camps.view',
            'camps.create',
            'camps.update',
            'camps.delete',
            'camps.manage-registrations',
            'games.view',
            'games.create',
            'games.update',
            'games.delete',
            'games.manage-participants',
            'chats.view',
            'chats.send-message',
            'chats.delete-message',
            'chats.create-poll',
            'chats.close-poll',
            'payments.view',
            'payments.refund',
            'notifications.view',
            'notifications.send',
            'notifications.manage',
        ]);

        $facilityManagerRole = Role::firstOrCreate(['name' => 'facility-manager', 'guard_name' => 'api']);
        $facilityManagerRole->syncPermissions([
            'facilities.view',
            'facilities.update',
            'bookings.view',
            'bookings.check-in',
        ]);

        $teamCaptainRole = Role::firstOrCreate(['name' => 'team-captain', 'guard_name' => 'api']);
        $teamCaptainRole->syncPermissions([
            'teams.view',
            'teams.update',
            'teams.manage-members',
            'players.view',
            'games.view',
            'games.submit-report',
            'games.manage-participants',
            'chats.view',
            'chats.send-message',
            'chats.create-poll',
            'chats.close-poll',
        ]);

        $playerRole = Role::firstOrCreate(['name' => 'player', 'guard_name' => 'api']);
        $playerRole->syncPermissions([
            'leagues.view',
            'teams.view',
            'players.view',
            'players.update-own',
            'facilities.view',
            'bookings.view-own',
            'bookings.create',
            'bookings.cancel-own',
            'camps.view',
            'games.view',
            'chats.view',
            'chats.send-message',
            'payments.view-own',
            'payments.create',
            'notifications.view',
        ]);
    }
}
