import type {
  AssetClass,
  InvestmentType,
  Position,
  RawRow,
} from '../types/position';
import { coerceNumber } from './normalize';

/**
 * Maps a `Position` field to the source column header that supplies it.
 * Produced by `inferMapping` (auto) or the column-map dialog (manual).
 */
export type FieldMapping = Partial<Record<keyof Position, string>>;

/**
 * Known header aliases per field. Lower-cased on both sides when matching so
 * "Market Value", "market_value" and "MV" all resolve to `marketValue`.
 */
export const HEADER_ALIASES: Partial<Record<keyof Position, string[]>> = {
  account: ['account', 'acct', 'portfolio account', 'fund'],
  portfolio: ['portfolio', 'parent portfolio', 'strategy'],
  securityName: ['security name', 'security', 'name', 'description', 'instrument'],
  ticker: ['ticker', 'symbol', 'bbg ticker'],
  identifier: ['identifier', 'cusip', 'isin', 'sedol', 'id'],
  assetClass: ['asset class', 'assetclass', 'asset_class', 'class'],
  investmentType: [
    'investment type',
    'investmenttype',
    'instrument type',
    'security type',
    'type',
  ],
  sector: ['sector', 'gics sector', 'industry'],
  currency: ['currency', 'ccy', 'curr'],
  quantity: ['quantity', 'qty', 'shares', 'units', 'par', 'face'],
  price: ['price', 'last price', 'market price', 'px', 'last'],
  costBasis: ['cost basis', 'costbasis', 'cost', 'book value', 'total cost'],
  marketValue: ['market value', 'marketvalue', 'market_value', 'mv', 'market val'],
  unrealizedPnl: ['unrealized p&l', 'unrealized pnl', 'pnl', 'gain/loss', 'u/r p&l'],
  weightPct: ['weight %', 'weight', 'weight pct', '% of portfolio', 'allocation'],
  dayChangePct: ['day change %', 'day change', '1d %', 'daily change'],
  asOfDate: ['as of date', 'as of', 'asofdate', 'date', 'snapshot date'],
};

/** Default mapping used by the baked-in sample CSV (identity-ish labels). */
export const DEFAULT_MAPPING: FieldMapping = {
  account: 'Account',
  securityName: 'Security Name',
  ticker: 'Ticker',
  identifier: 'Identifier',
  assetClass: 'Asset Class',
  investmentType: 'Investment Type',
  sector: 'Sector',
  currency: 'Currency',
  quantity: 'Quantity',
  price: 'Price',
  costBasis: 'Cost Basis',
  marketValue: 'Market Value',
  asOfDate: 'As Of Date',
};

/** Fields the user can target in the column-map dialog. */
export const MAPPABLE_FIELDS = Object.keys(HEADER_ALIASES) as (keyof Position)[];

/** Fields we must have a column for to build a usable Position. */
const REQUIRED_FIELDS: (keyof Position)[] = [
  'securityName',
  'quantity',
  'price',
];

/**
 * Auto-match source headers to Position fields via the alias table.
 * Case- and whitespace-insensitive.
 */
export function inferMapping(headers: string[]): FieldMapping {
  const mapping: FieldMapping = {};
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
  const byNorm = new Map(headers.map((h) => [norm(h), h]));

  for (const field of MAPPABLE_FIELDS) {
    const aliases = HEADER_ALIASES[field] ?? [];
    for (const alias of aliases) {
      const hit = byNorm.get(norm(alias));
      if (hit) {
        mapping[field] = hit;
        break;
      }
    }
  }
  return mapping;
}

/** Are all required fields present in the mapping? */
export function isMappingComplete(mapping: FieldMapping): boolean {
  return REQUIRED_FIELDS.every((f) => Boolean(mapping[f]));
}

/** Required fields still missing from the mapping. */
export function missingRequiredFields(mapping: FieldMapping): (keyof Position)[] {
  return REQUIRED_FIELDS.filter((f) => !mapping[f]);
}

function str(row: RawRow, header: string | undefined, fallback = ''): string {
  if (!header) return fallback;
  const v = row[header];
  if (v == null) return fallback;
  const s = String(v).trim();
  return s === '' ? fallback : s;
}

function num(row: RawRow, header: string | undefined): number {
  if (!header) return 0;
  return coerceNumber(row[header]);
}

/**
 * Build a `Position` from a raw row using the supplied mapping. Numeric fields
 * are coerced tolerantly; unknown enum values pass through as-is so nothing is
 * silently dropped. Derived fields (P&L, weight) are filled later by
 * `deriveFields`.
 */
export function mapRowToPosition(
  row: RawRow,
  mapping: FieldMapping,
  index: number,
): Position {
  const account = str(row, mapping.account, 'UNASSIGNED');
  const identifier = str(row, mapping.identifier) || undefined;
  const ticker = str(row, mapping.ticker);

  const id = identifier
    ? `${account}:${identifier}`
    : ticker
      ? `${account}:${ticker}:${index}`
      : `row-${index}`;

  return {
    id,
    account,
    portfolio: str(row, mapping.portfolio) || undefined,
    securityName: str(row, mapping.securityName, 'Unknown'),
    ticker,
    identifier,
    assetClass: (str(row, mapping.assetClass, 'Equity') as AssetClass),
    investmentType: (str(
      row,
      mapping.investmentType,
      'Common Stock',
    ) as InvestmentType),
    sector: str(row, mapping.sector, 'N/A'),
    currency: str(row, mapping.currency, 'USD').toUpperCase(),

    quantity: num(row, mapping.quantity),
    price: num(row, mapping.price),
    costBasis: num(row, mapping.costBasis),
    marketValue: num(row, mapping.marketValue),

    unrealizedPnl: num(row, mapping.unrealizedPnl),
    unrealizedPnlPct: 0,
    weightPct: 0,

    dayChangePct: mapping.dayChangePct ? num(row, mapping.dayChangePct) : undefined,
    asOfDate: str(row, mapping.asOfDate) || undefined,
  };
}

/** Map a full set of raw rows. */
export function mapRows(rows: RawRow[], mapping: FieldMapping): Position[] {
  return rows.map((row, i) => mapRowToPosition(row, mapping, i));
}
