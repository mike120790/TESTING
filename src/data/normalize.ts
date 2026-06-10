import type { Position } from '../types/position';

/**
 * Coerce a loosely-typed CSV/Excel cell into a number.
 * Tolerates currency symbols, thousands separators, percent signs and
 * parenthesised negatives, e.g. "$1,234.50", "(500)", "12.5%".
 */
export function coerceNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (value == null) return 0;

  let s = String(value).trim();
  if (s === '' || s === '-' || s === '—') return 0;

  let negative = false;
  if (s.startsWith('(') && s.endsWith(')')) {
    negative = true;
    s = s.slice(1, -1);
  }

  s = s.replace(/[$€£¥,%\s]/g, '');
  const n = Number(s);
  if (!Number.isFinite(n)) return 0;
  return negative ? -n : n;
}

/**
 * Fill in derived fields. Market value defaults to quantity * price when the
 * source didn't provide it; P&L and portfolio weight are always recomputed so
 * they stay internally consistent.
 */
export function deriveFields(positions: Position[]): Position[] {
  const totalMv = positions.reduce(
    (sum, p) => sum + (Number.isFinite(p.marketValue) ? p.marketValue : 0),
    0,
  );

  return positions.map((p) => {
    const marketValue =
      Number.isFinite(p.marketValue) && p.marketValue !== 0
        ? p.marketValue
        : p.quantity * p.price;

    const unrealizedPnl = marketValue - p.costBasis;
    const unrealizedPnlPct = p.costBasis !== 0 ? unrealizedPnl / p.costBasis : 0;
    const weightPct = totalMv !== 0 ? marketValue / totalMv : 0;

    return {
      ...p,
      marketValue,
      unrealizedPnl,
      unrealizedPnlPct,
      weightPct,
    };
  });
}
