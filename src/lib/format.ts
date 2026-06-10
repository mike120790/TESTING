/** Display formatters for the grid and summary header. */

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const currencyFmtCents = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFmt = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

const percentFmt = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Whole-dollar currency, e.g. $1,234,567. Used for market value / cost. */
export function fmtCurrency(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return currencyFmt.format(value);
}

/** Currency with cents, e.g. $123.45. Used for unit prices. */
export function fmtPrice(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return currencyFmtCents.format(value);
}

/** Plain number with thousands separators. Used for quantity. */
export function fmtNumber(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return numberFmt.format(value);
}

/** Fractional ratio rendered as a percent, e.g. 0.1234 -> 12.34%. */
export function fmtPercent(ratio: number): string {
  if (!Number.isFinite(ratio)) return '—';
  return percentFmt.format(ratio);
}

/** Signed whole-dollar currency for P&L, e.g. +$1,200 / -$340. */
export function fmtSignedCurrency(value: number): string {
  if (!Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return sign + currencyFmt.format(value);
}
