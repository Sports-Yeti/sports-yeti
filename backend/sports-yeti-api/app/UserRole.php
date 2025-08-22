<?php

namespace App;

enum UserRole: string
{
    case PLAYER = 'player';
    case CAPTAIN = 'captain';
    case LEAGUE_ADMIN = 'league_admin';
    case REFEREE = 'referee';
    case TRAINER = 'trainer';
    case SYSTEM_ADMIN = 'system_admin';

    public function permissions(): array
    {
        return match($this) {
            self::PLAYER => [
                Permission::JOIN_TEAM,
                Permission::BOOK_FACILITY,
                Permission::VIEW_PROFILE,
            ],
            self::CAPTAIN => [
                Permission::CREATE_TEAM,
                Permission::JOIN_TEAM,
                Permission::BOOK_FACILITY,
                Permission::CREATE_GAME,
                Permission::VIEW_PROFILE,
            ],
            self::LEAGUE_ADMIN => [
                Permission::CREATE_TEAM,
                Permission::JOIN_TEAM,
                Permission::BOOK_FACILITY,
                Permission::CREATE_GAME,
                Permission::MANAGE_LEAGUE,
                Permission::MANAGE_CAMPS,
                Permission::VIEW_ANALYTICS,
                Permission::VIEW_PROFILE,
            ],
            self::REFEREE => [
                Permission::VIEW_PROFILE,
                Permission::BOOK_FACILITY,
            ],
            self::TRAINER => [
                Permission::VIEW_PROFILE,
                Permission::MANAGE_CAMPS,
            ],
            self::SYSTEM_ADMIN => [
                Permission::CREATE_TEAM,
                Permission::JOIN_TEAM,
                Permission::BOOK_FACILITY,
                Permission::CREATE_GAME,
                Permission::MANAGE_LEAGUE,
                Permission::MANAGE_CAMPS,
                Permission::VIEW_ANALYTICS,
                Permission::VIEW_PROFILE,
                Permission::SYSTEM_ADMIN,
            ],
        };
    }
}
