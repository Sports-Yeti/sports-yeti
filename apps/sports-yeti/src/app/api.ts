/* eslint-disable @typescript-eslint/no-explicit-any */
import { Platform } from 'react-native';

const DEFAULT_API = 'http://localhost:8000';

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

export function getApiBaseUrl(): string {
  // Expo public env or fallback
  const fromEnv = (process as any)?.env?.EXPO_PUBLIC_API_URL as string | undefined;
  return fromEnv || DEFAULT_API;
}

export function generateTraceId(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const g: any = global as any;
    if (g?.crypto?.randomUUID) return g.crypto.randomUUID() as string;
  } catch {}
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {},
  token?: string,
  leagueId?: string | number
): Promise<T> {
  const base = getApiBaseUrl();
  const url = `${base}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Trace-Id': generateTraceId(),
    ...(leagueId ? { 'X-League-Id': String(leagueId) } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = res.headers.get('Content-Type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : (await res.text());

  if (!res.ok) {
    const detail = (data as any)?.detail || (typeof data === 'string' ? data : 'Request failed');
    throw new Error(`${res.status}: ${detail}`);
  }
  return data as T;
}

export const platformInfo = {
  os: Platform.OS,
  version: Platform.Version,
};


