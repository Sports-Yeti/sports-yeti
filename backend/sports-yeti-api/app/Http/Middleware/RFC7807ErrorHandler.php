<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Support\Str;

class RFC7807ErrorHandler
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $response = $next($request);
            
            // If we get here without exception, but response has error status
            if ($response->getStatusCode() >= 400 && $request->expectsJson()) {
                return $this->formatErrorResponse(
                    $response->getStatusCode(),
                    'HTTP Error',
                    $response->getContent(),
                    $request
                );
            }
            
            return $response;
        } catch (\Exception $e) {
            if ($request->expectsJson()) {
                return $this->handleException($e, $request);
            }
            
            throw $e;
        }
    }

    private function handleException(\Exception $e, Request $request): JsonResponse
    {
        $traceId = $request->header('X-Trace-Id') ?? Str::uuid();
        
        return match (true) {
            $e instanceof ValidationException => $this->formatValidationError($e, $request, $traceId),
            $e instanceof ModelNotFoundException => $this->formatNotFoundError($e, $request, $traceId),
            $e instanceof HttpException => $this->formatHttpError($e, $request, $traceId),
            default => $this->formatGenericError($e, $request, $traceId),
        };
    }

    private function formatValidationError(ValidationException $e, Request $request, string $traceId): JsonResponse
    {
        return response()->json([
            'type' => 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
            'title' => 'Validation Failed',
            'status' => 422,
            'detail' => 'The request contains invalid or missing data.',
            'instance' => $request->getUri(),
            'trace_id' => $traceId,
            'errors' => $e->errors(),
        ], 422, [
            'Content-Type' => 'application/problem+json',
            'X-Trace-Id' => $traceId,
        ]);
    }

    private function formatNotFoundError(ModelNotFoundException $e, Request $request, string $traceId): JsonResponse
    {
        return response()->json([
            'type' => 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
            'title' => 'Resource Not Found',
            'status' => 404,
            'detail' => 'The requested resource could not be found.',
            'instance' => $request->getUri(),
            'trace_id' => $traceId,
        ], 404, [
            'Content-Type' => 'application/problem+json',
            'X-Trace-Id' => $traceId,
        ]);
    }

    private function formatHttpError(HttpException $e, Request $request, string $traceId): JsonResponse
    {
        return response()->json([
            'type' => 'https://tools.ietf.org/html/rfc7231',
            'title' => Response::$statusTexts[$e->getStatusCode()] ?? 'HTTP Error',
            'status' => $e->getStatusCode(),
            'detail' => $e->getMessage() ?: 'An HTTP error occurred.',
            'instance' => $request->getUri(),
            'trace_id' => $traceId,
        ], $e->getStatusCode(), [
            'Content-Type' => 'application/problem+json',
            'X-Trace-Id' => $traceId,
        ]);
    }

    private function formatGenericError(\Exception $e, Request $request, string $traceId): JsonResponse
    {
        $status = 500;
        $title = 'Internal Server Error';
        $detail = config('app.debug') ? $e->getMessage() : 'An unexpected error occurred.';

        return response()->json([
            'type' => 'https://tools.ietf.org/html/rfc7231#section-6.6.1',
            'title' => $title,
            'status' => $status,
            'detail' => $detail,
            'instance' => $request->getUri(),
            'trace_id' => $traceId,
        ], $status, [
            'Content-Type' => 'application/problem+json',
            'X-Trace-Id' => $traceId,
        ]);
    }

    private function formatErrorResponse(int $status, string $title, string $detail, Request $request): JsonResponse
    {
        $traceId = $request->header('X-Trace-Id') ?? Str::uuid();
        
        return response()->json([
            'type' => 'https://tools.ietf.org/html/rfc7231',
            'title' => $title,
            'status' => $status,
            'detail' => $detail,
            'instance' => $request->getUri(),
            'trace_id' => $traceId,
        ], $status, [
            'Content-Type' => 'application/problem+json',
            'X-Trace-Id' => $traceId,
        ]);
    }
}
