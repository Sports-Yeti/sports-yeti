<?php

namespace App;

enum Permission: string
{
    case CREATE_TEAM = 'create_team';
    case JOIN_TEAM = 'join_team';
    case BOOK_FACILITY = 'book_facility';
    case CREATE_GAME = 'create_game';
    case MANAGE_LEAGUE = 'manage_league';
    case MANAGE_CAMPS = 'manage_camps';
    case VIEW_ANALYTICS = 'view_analytics';
    case VIEW_PROFILE = 'view_profile';
    case SYSTEM_ADMIN = 'system_admin';
}
