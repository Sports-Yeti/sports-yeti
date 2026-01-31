/**
 * Tracing utilities for distributed tracing with W3C Trace Context support.
 * Generates traceparent headers for correlating frontend and backend requests.
 *
 * W3C Trace Context format:
 * traceparent: {version}-{trace-id}-{parent-id}-{trace-flags}
 *
 * Example: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
 */

// Store the current trace context
interface TraceContext {
  traceId: string;
  spanId: string;
  sampled: boolean;
}

let currentTraceContext: TraceContext | null = null;

/**
 * Generates a random hex string of the specified length
 */
function generateRandomHex(length: number): string {
  const bytes = new Uint8Array(length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generates a W3C trace ID (32 hex characters / 16 bytes)
 */
export function generateTraceId(): string {
  return generateRandomHex(32);
}

/**
 * Generates a W3C span/parent ID (16 hex characters / 8 bytes)
 */
export function generateSpanId(): string {
  return generateRandomHex(16);
}

/**
 * Creates a new trace context
 */
export function createTraceContext(sampled = true): TraceContext {
  const context: TraceContext = {
    traceId: generateTraceId(),
    spanId: generateSpanId(),
    sampled,
  };
  currentTraceContext = context;
  return context;
}

/**
 * Gets the current trace context, creating one if it doesn't exist
 */
export function getTraceContext(): TraceContext {
  if (!currentTraceContext) {
    currentTraceContext = createTraceContext();
  }
  return currentTraceContext;
}

/**
 * Creates a new span within the current trace
 * Returns a new span ID while keeping the same trace ID
 */
export function createSpan(): string {
  const context = getTraceContext();
  const newSpanId = generateSpanId();
  currentTraceContext = {
    ...context,
    spanId: newSpanId,
  };
  return newSpanId;
}

/**
 * Generates a W3C traceparent header value
 *
 * Format: {version}-{trace-id}-{parent-id}-{trace-flags}
 * - version: 00 (current version)
 * - trace-id: 32 hex chars (16 bytes) - unique ID for the entire trace
 * - parent-id: 16 hex chars (8 bytes) - unique ID for this request
 * - trace-flags: 01 if sampled, 00 if not sampled
 *
 * @param context Optional trace context, uses current context if not provided
 * @returns The traceparent header value
 */
export function generateTraceparent(context?: TraceContext): string {
  const ctx = context ?? getTraceContext();
  const version = '00';
  const traceFlags = ctx.sampled ? '01' : '00';

  // Create a new span for each request
  const spanId = generateSpanId();

  return `${version}-${ctx.traceId}-${spanId}-${traceFlags}`;
}

/**
 * Parses a traceparent header value into its components
 */
export function parseTraceparent(
  traceparent: string
): TraceContext | null {
  const parts = traceparent.split('-');
  if (parts.length !== 4) return null;

  const [version, traceId, spanId, traceFlags] = parts;

  // Validate version
  if (version !== '00') return null;

  // Validate trace ID (32 hex chars)
  if (!/^[0-9a-f]{32}$/i.test(traceId)) return null;

  // Validate span ID (16 hex chars)
  if (!/^[0-9a-f]{16}$/i.test(spanId)) return null;

  // Validate trace flags (2 hex chars)
  if (!/^[0-9a-f]{2}$/i.test(traceFlags)) return null;

  return {
    traceId,
    spanId,
    sampled: traceFlags === '01',
  };
}

/**
 * Resets the current trace context
 * Call this when starting a new user session or navigation flow
 */
export function resetTraceContext(): void {
  currentTraceContext = null;
}

/**
 * Generates headers object with tracing information
 * Includes both traceparent and tracestate headers
 */
export function getTracingHeaders(): Record<string, string> {
  const traceparent = generateTraceparent();

  return {
    traceparent,
    // tracestate is optional but can include vendor-specific info
    tracestate: 'sports-yeti=true',
  };
}
