/**
 * Centralized formatters used across every admin screen.
 * Always pass cents (integer) for currency, ISO strings for dates.
 */

export function formatCurrency(
  cents: number,
  currency = 'USD',
  locale = 'en-US',
): string {
  const safe = Number.isFinite(cents) ? cents : 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: safe % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(safe / 100);
}

export function formatNumber(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) {
    const v = value / 1000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1)}k`;
  }
  return `${value}`;
}

export function formatDate(
  iso: string,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' },
  locale = 'en-US',
): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, options).format(d);
}

export function formatDateTime(iso: string, locale = 'en-US'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

export function formatTime(iso: string, locale = 'en-US'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

export function formatRange(startIso: string, endIso: string): string {
  const a = new Date(startIso);
  const b = new Date(endIso);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return '—';
  const sameDay = a.toDateString() === b.toDateString();
  if (sameDay) {
    return `${formatDate(startIso, { month: 'short', day: 'numeric' })} · ${formatTime(startIso)} – ${formatTime(endIso)}`;
  }
  return `${formatDate(startIso)} – ${formatDate(endIso)}`;
}

export function formatRelative(iso: string, now = new Date()): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '—';
  const diffMs = now.getTime() - then.getTime();
  const past = diffMs >= 0;
  const abs = Math.abs(diffMs);
  const seconds = Math.round(abs / 1000);
  if (seconds < 30) return past ? 'just now' : 'in moments';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return past ? `${minutes}m ago` : `in ${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return past ? `${hours}h ago` : `in ${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return past ? `${days}d ago` : `in ${days}d`;
  return formatDate(iso, { month: 'short', day: 'numeric' });
}

export function formatPercent(numerator: number, denominator: number): string {
  if (!denominator) return '0%';
  return `${Math.round((numerator / denominator) * 100)}%`;
}
