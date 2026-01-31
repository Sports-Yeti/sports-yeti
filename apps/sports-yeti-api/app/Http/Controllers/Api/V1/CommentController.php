<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'post_id' => ['required', 'uuid', 'exists:posts,id'],
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

        $query = Comment::where('post_id', $request->post_id)
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

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'post_id' => ['required', 'uuid', 'exists:posts,id'],
            'parent_id' => ['nullable', 'uuid', 'exists:comments,id'],
            'content' => ['required', 'string', 'max:2000'],
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

        // If parent_id is provided, verify it belongs to the same post
        if ($request->parent_id) {
            $parentComment = Comment::find($request->parent_id);
            if ($parentComment && $parentComment->post_id !== $request->post_id) {
                return response()->json([
                    'type' => 'https://httpstatuses.io/422',
                    'title' => 'Validation Error',
                    'status' => 422,
                    'detail' => 'Parent comment does not belong to the specified post.',
                    'errors' => ['parent_id' => ['Parent comment does not belong to the specified post.']],
                ], 422);
            }

            // Prevent deeply nested comments (max 1 level of nesting)
            if ($parentComment && $parentComment->parent_id !== null) {
                return response()->json([
                    'type' => 'https://httpstatuses.io/422',
                    'title' => 'Validation Error',
                    'status' => 422,
                    'detail' => 'Cannot reply to a reply. Only one level of nesting is allowed.',
                    'errors' => ['parent_id' => ['Cannot reply to a reply. Only one level of nesting is allowed.']],
                ], 422);
            }
        }

        $comment = DB::transaction(function () use ($request) {
            $comment = Comment::create([
                'post_id' => $request->post_id,
                'user_id' => auth()->id(),
                'parent_id' => $request->parent_id,
                'content' => $request->content,
            ]);

            // Increment comments count on the post (only for top-level comments)
            if (!$request->parent_id) {
                Post::where('id', $request->post_id)->increment('comments_count');
            }

            return $comment;
        });

        $comment->load('user:id,name,avatar_url');

        return response()->json([
            'data' => $comment,
        ], 201);
    }

    public function show(Comment $comment): JsonResponse
    {
        $comment->load([
            'user:id,name,avatar_url',
            'post:id,content,user_id',
            'post.user:id,name',
            'replies' => function ($q) {
                $q->with('user:id,name,avatar_url')
                    ->orderBy('created_at');
            },
        ]);

        return response()->json([
            'data' => $comment,
        ]);
    }

    public function update(Request $request, Comment $comment): JsonResponse
    {
        // Only comment owner can update
        if ($comment->user_id !== auth()->id()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'You are not authorized to update this comment.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'content' => ['required', 'string', 'max:2000'],
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

        $comment->update([
            'content' => $request->content,
        ]);

        $comment->load('user:id,name,avatar_url');

        return response()->json([
            'data' => $comment,
        ]);
    }

    public function destroy(Comment $comment): JsonResponse
    {
        // Only comment owner or super-admin can delete
        if ($comment->user_id !== auth()->id() && !auth()->user()->hasRole('super-admin')) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'You are not authorized to delete this comment.',
            ], 403);
        }

        DB::transaction(function () use ($comment) {
            // If this is a top-level comment, decrement the post's comment count
            if ($comment->parent_id === null) {
                Post::where('id', $comment->post_id)->decrement('comments_count');
            }

            // Soft delete will cascade to replies via the model's SoftDeletes trait
            $comment->delete();
        });

        return response()->json(null, 204);
    }

    public function replies(Comment $comment, Request $request): JsonResponse
    {
        // Only allow fetching replies for top-level comments
        if ($comment->parent_id !== null) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'Cannot fetch replies for a reply. Use top-level comment ID.',
            ], 400);
        }

        $perPage = min($request->get('per_page', 20), 100);
        $replies = $comment->replies()
            ->with('user:id,name,avatar_url')
            ->orderBy('created_at')
            ->paginate($perPage);

        return response()->json([
            'data' => $replies->items(),
            'meta' => [
                'current_page' => $replies->currentPage(),
                'last_page' => $replies->lastPage(),
                'per_page' => $replies->perPage(),
                'total' => $replies->total(),
            ],
        ]);
    }
}
