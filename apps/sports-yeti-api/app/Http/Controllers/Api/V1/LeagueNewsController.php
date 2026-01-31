<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\League;
use App\Models\LeagueNews;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LeagueNewsController extends Controller
{
    public function index(Request $request, League $league): JsonResponse
    {
        $query = LeagueNews::where('league_id', $league->id)
            ->with('author:id,name,avatar_url');

        // By default, only show published news to non-admins
        $user = auth()->user();
        $isLeagueAdmin = $league->admins()->where('user_id', $user->id)->exists()
            || $user->hasRole('super-admin');

        if (!$isLeagueAdmin) {
            $query->where('is_published', true);
        }

        // Filter by published status (for admins)
        if ($request->has('is_published') && $isLeagueAdmin) {
            $query->where('is_published', $request->boolean('is_published'));
        }

        // Only pinned articles
        if ($request->boolean('pinned')) {
            $query->where('is_pinned', true);
        }

        $perPage = min($request->get('per_page', 15), 100);
        $news = $query->orderByDesc('is_pinned')
            ->orderByDesc('published_at')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json([
            'data' => $news->items(),
            'meta' => [
                'current_page' => $news->currentPage(),
                'last_page' => $news->lastPage(),
                'per_page' => $news->perPage(),
                'total' => $news->total(),
            ],
        ]);
    }

    public function store(Request $request, League $league): JsonResponse
    {
        // Only league admins can create news
        $user = auth()->user();
        $isLeagueAdmin = $league->admins()->where('user_id', $user->id)->exists()
            || $user->hasRole('super-admin');

        if (!$isLeagueAdmin) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'You are not authorized to create news for this league.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:10000'],
            'image_url' => ['nullable', 'url', 'max:500'],
            'is_published' => ['nullable', 'boolean'],
            'is_pinned' => ['nullable', 'boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/422',
                'title' => 'Validation Error',
                'status' => 422,
                'detail' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $isPublished = $request->boolean('is_published');

        $news = LeagueNews::create([
            'league_id' => $league->id,
            'author_id' => $user->id,
            'title' => $request->title,
            'content' => $request->content,
            'image_url' => $request->image_url,
            'is_published' => $isPublished,
            'is_pinned' => $request->boolean('is_pinned'),
            'published_at' => $isPublished ? now() : null,
        ]);

        $news->load('author:id,name,avatar_url');

        return response()->json([
            'data' => $news,
        ], 201);
    }

    public function show(League $league, LeagueNews $news): JsonResponse
    {
        // Ensure news belongs to the league
        if ($news->league_id !== $league->id) {
            return response()->json([
                'type' => 'https://httpstatuses.io/404',
                'title' => 'Not Found',
                'status' => 404,
                'detail' => 'News article not found.',
            ], 404);
        }

        // Check if unpublished news can be viewed
        if (!$news->is_published) {
            $user = auth()->user();
            $isLeagueAdmin = $league->admins()->where('user_id', $user->id)->exists()
                || $user->hasRole('super-admin');

            if (!$isLeagueAdmin) {
                return response()->json([
                    'type' => 'https://httpstatuses.io/404',
                    'title' => 'Not Found',
                    'status' => 404,
                    'detail' => 'News article not found.',
                ], 404);
            }
        }

        $news->load([
            'author:id,name,avatar_url',
            'league:id,name',
        ]);

        return response()->json([
            'data' => $news,
        ]);
    }

    public function update(Request $request, League $league, LeagueNews $news): JsonResponse
    {
        // Ensure news belongs to the league
        if ($news->league_id !== $league->id) {
            return response()->json([
                'type' => 'https://httpstatuses.io/404',
                'title' => 'Not Found',
                'status' => 404,
                'detail' => 'News article not found.',
            ], 404);
        }

        // Only league admins can update news
        $user = auth()->user();
        $isLeagueAdmin = $league->admins()->where('user_id', $user->id)->exists()
            || $user->hasRole('super-admin');

        if (!$isLeagueAdmin) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'You are not authorized to update this news article.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => ['sometimes', 'string', 'max:255'],
            'content' => ['sometimes', 'string', 'max:10000'],
            'image_url' => ['sometimes', 'nullable', 'url', 'max:500'],
            'is_published' => ['sometimes', 'boolean'],
            'is_pinned' => ['sometimes', 'boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/422',
                'title' => 'Validation Error',
                'status' => 422,
                'detail' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $request->only(['title', 'content', 'image_url', 'is_pinned']);

        // Handle publishing
        if ($request->has('is_published')) {
            $data['is_published'] = $request->boolean('is_published');

            // Set published_at when first published
            if ($data['is_published'] && !$news->published_at) {
                $data['published_at'] = now();
            }
        }

        $news->update($data);
        $news->load('author:id,name,avatar_url');

        return response()->json([
            'data' => $news,
        ]);
    }

    public function destroy(League $league, LeagueNews $news): JsonResponse
    {
        // Ensure news belongs to the league
        if ($news->league_id !== $league->id) {
            return response()->json([
                'type' => 'https://httpstatuses.io/404',
                'title' => 'Not Found',
                'status' => 404,
                'detail' => 'News article not found.',
            ], 404);
        }

        // Only league admins can delete news
        $user = auth()->user();
        $isLeagueAdmin = $league->admins()->where('user_id', $user->id)->exists()
            || $user->hasRole('super-admin');

        if (!$isLeagueAdmin) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'You are not authorized to delete this news article.',
            ], 403);
        }

        $news->delete();

        return response()->json(null, 204);
    }

    public function publish(League $league, LeagueNews $news): JsonResponse
    {
        // Ensure news belongs to the league
        if ($news->league_id !== $league->id) {
            return response()->json([
                'type' => 'https://httpstatuses.io/404',
                'title' => 'Not Found',
                'status' => 404,
                'detail' => 'News article not found.',
            ], 404);
        }

        // Only league admins can publish news
        $user = auth()->user();
        $isLeagueAdmin = $league->admins()->where('user_id', $user->id)->exists()
            || $user->hasRole('super-admin');

        if (!$isLeagueAdmin) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'You are not authorized to publish this news article.',
            ], 403);
        }

        if ($news->is_published) {
            return response()->json([
                'type' => 'https://httpstatuses.io/409',
                'title' => 'Conflict',
                'status' => 409,
                'detail' => 'This news article is already published.',
            ], 409);
        }

        $news->update([
            'is_published' => true,
            'published_at' => now(),
        ]);

        $news->load('author:id,name,avatar_url');

        return response()->json([
            'data' => $news,
        ]);
    }

    public function unpublish(League $league, LeagueNews $news): JsonResponse
    {
        // Ensure news belongs to the league
        if ($news->league_id !== $league->id) {
            return response()->json([
                'type' => 'https://httpstatuses.io/404',
                'title' => 'Not Found',
                'status' => 404,
                'detail' => 'News article not found.',
            ], 404);
        }

        // Only league admins can unpublish news
        $user = auth()->user();
        $isLeagueAdmin = $league->admins()->where('user_id', $user->id)->exists()
            || $user->hasRole('super-admin');

        if (!$isLeagueAdmin) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'You are not authorized to unpublish this news article.',
            ], 403);
        }

        if (!$news->is_published) {
            return response()->json([
                'type' => 'https://httpstatuses.io/409',
                'title' => 'Conflict',
                'status' => 409,
                'detail' => 'This news article is not published.',
            ], 409);
        }

        $news->update([
            'is_published' => false,
        ]);

        $news->load('author:id,name,avatar_url');

        return response()->json([
            'data' => $news,
        ]);
    }
}
