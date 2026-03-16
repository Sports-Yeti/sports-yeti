<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostLike;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Post::with([
            'user:id,name,avatar_url',
            'league:id,name',
            'team:id,name',
        ])->withCount(['comments', 'likes']);

        // Filter by league
        if ($request->has('league_id')) {
            $query->where('league_id', $request->league_id);
        }

        // Filter by team
        if ($request->has('team_id')) {
            $query->where('team_id', $request->team_id);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by post type
        if ($request->has('post_type')) {
            $query->where('post_type', $request->post_type);
        }

        // Filter by visibility
        if ($request->has('visibility')) {
            $query->where('visibility', $request->visibility);
        }

        // Only pinned posts
        if ($request->boolean('pinned')) {
            $query->where('is_pinned', true);
        }

        // Add like status for current user
        $userId = auth()->id();
        $query->addSelect([
            'is_liked' => PostLike::selectRaw('COUNT(*) > 0')
                ->whereColumn('post_id', 'posts.id')
                ->where('user_id', $userId)
                ->limit(1),
        ]);

        $perPage = min($request->get('per_page', 15), 100);
        $posts = $query->orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json([
            'data' => $posts->items(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'content' => ['required', 'string', 'max:5000'],
            'league_id' => ['nullable', 'uuid', 'exists:leagues,id'],
            'team_id' => ['nullable', 'uuid', 'exists:teams,id'],
            'media_urls' => ['nullable', 'array', 'max:10'],
            'media_urls.*' => ['url', 'max:500'],
            'post_type' => ['nullable', 'string', 'in:post,announcement,news'],
            'visibility' => ['nullable', 'string', 'in:public,league,team'],
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

        // Only admins can pin posts
        $isPinned = false;
        if ($request->has('is_pinned') && $request->boolean('is_pinned')) {
            if (auth()->user()->hasPermissionTo('posts.pin')) {
                $isPinned = true;
            }
        }

        $post = Post::create([
            'user_id' => auth()->id(),
            'content' => $request->content,
            'league_id' => $request->league_id,
            'team_id' => $request->team_id,
            'media_urls' => $request->media_urls,
            'post_type' => $request->post_type ?? 'post',
            'visibility' => $request->visibility ?? 'public',
            'is_pinned' => $isPinned,
        ]);

        $post->load([
            'user:id,name,avatar_url',
            'league:id,name',
            'team:id,name',
        ]);

        return response()->json([
            'data' => $post,
        ], 201);
    }

    public function show(Post $post): JsonResponse
    {
        $post->load([
            'user:id,name,avatar_url',
            'league:id,name',
            'team:id,name',
            'comments' => function ($query) {
                $query->whereNull('parent_id')
                    ->with(['user:id,name,avatar_url', 'replies.user:id,name,avatar_url'])
                    ->orderByDesc('created_at')
                    ->limit(10);
            },
        ])->loadCount(['comments', 'likes']);

        // Check if current user liked this post
        $post->is_liked = PostLike::where('post_id', $post->id)
            ->where('user_id', auth()->id())
            ->exists();

        return response()->json([
            'data' => $post,
        ]);
    }

    public function update(Request $request, Post $post): JsonResponse
    {
        // Only post owner or super-admin can update
        if ($post->user_id !== auth()->id() && ! auth()->user()->hasRole('super-admin')) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'You are not authorized to update this post.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'content' => ['sometimes', 'string', 'max:5000'],
            'media_urls' => ['sometimes', 'array', 'max:10'],
            'media_urls.*' => ['url', 'max:500'],
            'visibility' => ['sometimes', 'string', 'in:public,league,team'],
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

        $data = $request->only(['content', 'media_urls', 'visibility']);

        // Only admins can pin posts
        if ($request->has('is_pinned') && auth()->user()->hasPermissionTo('posts.pin')) {
            $data['is_pinned'] = $request->boolean('is_pinned');
        }

        $post->update($data);
        $post->load([
            'user:id,name,avatar_url',
            'league:id,name',
            'team:id,name',
        ]);

        return response()->json([
            'data' => $post,
        ]);
    }

    public function destroy(Post $post): JsonResponse
    {
        // Only post owner or super-admin can delete
        if ($post->user_id !== auth()->id() && ! auth()->user()->hasRole('super-admin')) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'You are not authorized to delete this post.',
            ], 403);
        }

        $post->delete();

        return response()->json(null, 204);
    }

    public function like(Post $post): JsonResponse
    {
        $userId = auth()->id();

        // Check if already liked
        $existingLike = PostLike::where('post_id', $post->id)
            ->where('user_id', $userId)
            ->first();

        if ($existingLike) {
            return response()->json([
                'type' => 'https://httpstatuses.io/409',
                'title' => 'Conflict',
                'status' => 409,
                'detail' => 'You have already liked this post.',
            ], 409);
        }

        DB::transaction(function () use ($post, $userId) {
            PostLike::create([
                'post_id' => $post->id,
                'user_id' => $userId,
            ]);

            $post->increment('likes_count');
        });

        return response()->json([
            'data' => [
                'liked' => true,
                'likes_count' => $post->fresh()->likes_count,
            ],
        ], 201);
    }

    public function unlike(Post $post): JsonResponse
    {
        $userId = auth()->id();

        $like = PostLike::where('post_id', $post->id)
            ->where('user_id', $userId)
            ->first();

        if (! $like) {
            return response()->json([
                'type' => 'https://httpstatuses.io/404',
                'title' => 'Not Found',
                'status' => 404,
                'detail' => 'You have not liked this post.',
            ], 404);
        }

        DB::transaction(function () use ($post, $like) {
            $like->delete();
            $post->decrement('likes_count');
        });

        return response()->json([
            'data' => [
                'liked' => false,
                'likes_count' => $post->fresh()->likes_count,
            ],
        ]);
    }

    public function comments(Post $post, Request $request): JsonResponse
    {
        $query = $post->comments()
            ->whereNull('parent_id')
            ->with([
                'user:id,name,avatar_url',
                'replies' => function ($q) {
                    $q->with('user:id,name,avatar_url')
                        ->orderBy('created_at');
                },
            ]);

        $perPage = min($request->get('per_page', 20), 100);
        $comments = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'data' => $comments->items(),
            'meta' => [
                'current_page' => $comments->currentPage(),
                'last_page' => $comments->lastPage(),
                'per_page' => $comments->perPage(),
                'total' => $comments->total(),
            ],
        ]);
    }
}
