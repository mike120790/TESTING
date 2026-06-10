import type {
  AssetClass,
  InvestmentType,
  Position,
  RawRow,
} from '../types/position';
import { coerceNumber, deriveFields } from './normalize';
import { rowStr, type MappingSpec } from './mappingSpec';

function num(row: RawRow, header: string | undefined): number {
  if (!header) return 0;
  return coerceNumber(row[header]);
}

function mapRowToPosition(
  row: RawRow,
  mapping: Partial<Record<keyof Position, string>>,
  index: number,
): Position {
  const account = rowStr(row, mapping.account, 'UNASSIGNED');
  const identifier = rowStr(row, mapping.identifier) || undefined;
  const ticker = rowStr(row, mapping.ticker);

  const id = identifier
    ? `${account}:${identifier}`
    : ticker
      ? `${account}:${ticker}:${index}`
      : `row-${index}`;

  return {
    id,
    account,
    portfolio: rowStr(row, mapping.portfolio) || undefined,
    securityName: rowStr(row, mapping.securityName, 'Unknown'),
    ticker,
    identifier,
    assetClass: rowStr(row, mapping.assetClass, 'Equity') as AssetClass,
    investmentType: rowStr(
      row,
      mapping.investmentType,
      'Common Stock',
    ) as InvestmentType,
    sector: rowStr(row, mapping.sector, 'N/A'),
    currency: rowStr(row, mapping.currency, 'USD').toUpperCase(),

    quantity: num(row, mapping.quantity),
    price: num(row, mapping.price),
    costBasis: num(row, mapping.costBasis),
    marketValue: num(row, mapping.marketValue),

    unrealizedPnl: num(row, mapping.unrealizedPnl),
    unrealizedPnlPct: 0,
    weightPct: 0,

    dayChangePct: mapping.dayChangePct ? num(row, mapping.dayChangePct) : undefined,
    asOfDate: rowStr(row, mapping.asOfDate) || undefined,
  };
}

/** Ingestion spec for portfolio positions. */
export const positionSpec: MappingSpec<Position> = {
  fields: [
    'account',
    'portfolio',
    'securityName',
    'ticker',
    'identifier',
    'assetClass',
    'investmentType',
    'sector',
    'currency',
    'quantity',
    'price',
    'costBasis',
    'marketValue',
    'unrealizedPnl',
    'asOfDate',
  ],
  labels: {
    account: 'Account',
    portfolio: 'Portfolio',
    securityName: 'Security Name *',
    ticker: 'Ticker',
    identifier: 'Identifier (CUSIP/ISIN)',
    assetClass: 'Asset Class',
    investmentType: 'Investment Type',
    sector: 'Sector',
    currency: 'Currency',
    quantity: 'Quantity *',
    price: 'Price *',
    costBasis: 'Cost Basis',
    marketValue: 'Market Value',
    unrealizedPnl: 'Unrealized P&L',
    asOfDate: 'As Of Date',
  },
  aliases: {
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
    asOfDate: ['as of date', 'as of', 'asofdate', 'date', 'snapshot date'],
  },
  required: ['securityName', 'quantity', 'price'],
  defaultMapping: {
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
  },
  mapRow: mapRowToPosition,
  derive: deriveFields,
};
