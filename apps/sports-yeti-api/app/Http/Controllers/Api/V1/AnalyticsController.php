<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Facility;
use App\Models\Game;
use App\Models\League;
use App\Models\Payment;
use App\Models\Player;
use App\Models\Space;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');

        return response()->json([
            'data' => [
                'total_leagues' => League::count(),
                'total_teams' => Team::withoutGlobalScopes()->count(),
                'total_players' => Player::count(),
                'total_games' => Game::withoutGlobalScopes()->count(),
                'upcoming_games' => Game::withoutGlobalScopes()->where('status', 'scheduled')->where('scheduled_at', '>', now())->count(),
                'completed_games' => Game::withoutGlobalScopes()->where('status', 'completed')->count(),
                'active_leagues' => League::where('is_active', true)->count(),
                'total_revenue' => $totalRevenue,
            ],
        ]);
    }

    public function revenue(Request $request): JsonResponse
    {
        $months = (int) $request->get('months', 12);

        $revenueByLeague = DB::table('payments')
            ->join('leagues', 'payments.league_id', '=', 'leagues.id')
            ->where('payments.status', 'completed')
            ->where('payments.created_at', '>=', now()->subMonths($months))
            ->whereNull('payments.deleted_at')
            ->select('leagues.id', 'leagues.name', DB::raw('SUM(payments.amount) as total_revenue'))
            ->groupBy('leagues.id', 'leagues.name')
            ->orderByDesc('total_revenue')
            ->get();

        $revenueByMonth = DB::table('payments')
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subMonths($months))
            ->whereNull('deleted_at')
            ->select(
                DB::raw("to_char(created_at, 'YYYY-MM') as month"),
                DB::raw('SUM(amount) as total_revenue'),
                DB::raw('COUNT(*) as transaction_count'),
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'data' => [
                'leagues' => $revenueByLeague->map(fn ($r) => [
                    'league_id' => $r->id,
                    'league_name' => $r->name,
                    'revenue' => (float) $r->total_revenue,
                ]),
                'monthly' => $revenueByMonth->map(fn ($r) => [
                    'month' => $r->month,
                    'revenue' => (float) $r->total_revenue,
                ]),
            ],
        ]);
    }

    public function registrations(Request $request): JsonResponse
    {
        $months = (int) $request->get('months', 12);

        $registrationsByLeague = DB::table('team_members')
            ->join('teams', 'team_members.team_id', '=', 'teams.id')
            ->join('leagues', 'teams.league_id', '=', 'leagues.id')
            ->where('team_members.created_at', '>=', now()->subMonths($months))
            ->whereNull('team_members.deleted_at')
            ->select('leagues.id', 'leagues.name', DB::raw('COUNT(team_members.id) as registration_count'))
            ->groupBy('leagues.id', 'leagues.name')
            ->orderByDesc('registration_count')
            ->get();

        return response()->json([
            'data' => [
                'leagues' => $registrationsByLeague->map(fn ($r) => [
                    'league_id' => $r->id,
                    'league_name' => $r->name,
                    'registrations' => (int) $r->registration_count,
                ]),
            ],
        ]);
    }

    public function facilityUtilization(Request $request): JsonResponse
    {
        $facilities = Facility::withoutGlobalScopes()
            ->where('is_active', true)
            ->with('spaces')
            ->get()
            ->map(function ($facility) {
                $spaceIds = $facility->spaces->pluck('id');
                $totalBookings = Booking::whereIn('space_id', $spaceIds)->count();
                $completedBookings = Booking::whereIn('space_id', $spaceIds)->where('status', 'completed')->count();
                $totalGames = Game::withoutGlobalScopes()->where('facility_id', $facility->id)->count();

                return [
                    'id' => $facility->id,
                    'name' => $facility->name,
                    'city' => $facility->city,
                    'total_games' => $totalGames,
                    'total_bookings' => $totalBookings,
                    'completed_bookings' => $completedBookings,
                    'spaces_count' => $spaceIds->count(),
                    'utilization_percentage' => $totalBookings > 0
                        ? round(($completedBookings / $totalBookings) * 100, 1)
                        : 0.0,
                ];
            });

        return response()->json([
            'data' => [
                'facilities' => $facilities->map(fn ($f) => [
                    'facility_id' => $f['id'],
                    'facility_name' => $f['name'],
                    'utilization_percent' => $f['utilization_percentage'],
                    'total_bookings' => $f['total_bookings'],
                    'total_games' => $f['total_games'],
                ]),
            ],
        ]);
    }
}
