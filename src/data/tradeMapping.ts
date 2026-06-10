import type { AssetClass, RawRow } from '../types/position';
import type {
  OrderType,
  Trade,
  TradeSide,
  TradeStatus,
} from '../types/trade';
import { coerceNumber } from './normalize';
import { rowStr, type MappingSpec } from './mappingSpec';

function num(row: RawRow, header: string | undefined): number {
  if (!header) return 0;
  return coerceNumber(row[header]);
}

/** Buy/Cover are cash-out (long-increasing); Sell/Short are cash-in. */
export function isBuySide(side: TradeSide): boolean {
  return side === 'Buy' || side === 'Cover';
}

function normalizeSide(raw: string): TradeSide {
  const s = raw.trim().toLowerCase();
  if (s.startsWith('b')) return 'Buy';
  if (s === 'cover' || s === 'bto' || s === 'btc') return 'Cover';
  if (s === 'short' || s === 'sell short' || s === 'sto') return 'Short';
  if (s.startsWith('s')) return 'Sell';
  return 'Buy';
}

function mapRowToTrade(
  row: RawRow,
  mapping: Partial<Record<keyof Trade, string>>,
  index: number,
): Trade {
  const account = rowStr(row, mapping.account, 'UNASSIGNED');
  const ticker = rowStr(row, mapping.ticker);
  const tradeDate = rowStr(row, mapping.tradeDate);

  return {
    id: rowStr(row, mapping.id) || `trade-${index}`,
    tradeDate,
    settleDate: rowStr(row, mapping.settleDate) || undefined,
    account,
    securityName: rowStr(row, mapping.securityName, 'Unknown'),
    ticker,
    identifier: rowStr(row, mapping.identifier) || undefined,
    assetClass: rowStr(row, mapping.assetClass, 'Equity') as AssetClass,
    side: normalizeSide(rowStr(row, mapping.side, 'Buy')),
    orderType: (rowStr(row, mapping.orderType, 'Market') as OrderType),
    status: (rowStr(row, mapping.status, 'Filled') as TradeStatus),
    currency: rowStr(row, mapping.currency, 'USD').toUpperCase(),

    quantity: num(row, mapping.quantity),
    price: num(row, mapping.price),
    grossAmount: num(row, mapping.grossAmount),
    commission: num(row, mapping.commission),
    netAmount: num(row, mapping.netAmount),

    trader: rowStr(row, mapping.trader) || undefined,
    broker: rowStr(row, mapping.broker) || undefined,
  };
}

/** Fill gross/net amounts when the source omits them. */
function deriveTrades(trades: Trade[]): Trade[] {
  return trades.map((t) => {
    const grossAmount =
      Number.isFinite(t.grossAmount) && t.grossAmount !== 0
        ? t.grossAmount
        : t.quantity * t.price;
    const netAmount =
      Number.isFinite(t.netAmount) && t.netAmount !== 0
        ? t.netAmount
        : isBuySide(t.side)
          ? grossAmount + t.commission
          : grossAmount - t.commission;
    return { ...t, grossAmount, netAmount };
  });
}

/** Ingestion spec for trade-activity rows. */
export const tradeSpec: MappingSpec<Trade> = {
  fields: [
    'tradeDate',
    'settleDate',
    'account',
    'securityName',
    'ticker',
    'identifier',
    'assetClass',
    'side',
    'orderType',
    'status',
    'currency',
    'quantity',
    'price',
    'grossAmount',
    'commission',
    'netAmount',
    'trader',
    'broker',
  ],
  labels: {
    tradeDate: 'Trade Date *',
    settleDate: 'Settle Date',
    account: 'Account',
    securityName: 'Security Name *',
    ticker: 'Ticker',
    identifier: 'Identifier (CUSIP/ISIN)',
    assetClass: 'Asset Class',
    side: 'Side *',
    orderType: 'Order Type',
    status: 'Status',
    currency: 'Currency',
    quantity: 'Quantity *',
    price: 'Price *',
    grossAmount: 'Gross Amount',
    commission: 'Commission',
    netAmount: 'Net Amount',
    trader: 'Trader',
    broker: 'Broker',
  },
  aliases: {
    tradeDate: ['trade date', 'tradedate', 'date', 'execution date', 'trade dt'],
    settleDate: ['settle date', 'settlement date', 'settledate'],
    account: ['account', 'acct', 'fund', 'portfolio'],
    securityName: ['security name', 'security', 'name', 'description', 'instrument'],
    ticker: ['ticker', 'symbol', 'bbg ticker'],
    identifier: ['identifier', 'cusip', 'isin', 'sedol', 'id'],
    assetClass: ['asset class', 'assetclass', 'class'],
    side: ['side', 'buy/sell', 'b/s', 'direction', 'action'],
    orderType: ['order type', 'ordertype', 'trade type', 'execution type'],
    status: ['status', 'order status', 'state', 'fill status'],
    currency: ['currency', 'ccy', 'curr'],
    quantity: ['quantity', 'qty', 'shares', 'units', 'filled qty'],
    price: ['price', 'fill price', 'avg price', 'execution price', 'px'],
    grossAmount: ['gross amount', 'gross', 'principal', 'notional', 'gross value'],
    commission: ['commission', 'comm', 'fees', 'commissions'],
    netAmount: ['net amount', 'net', 'net value', 'settlement amount'],
    trader: ['trader', 'trader id', 'pm', 'portfolio manager'],
    broker: ['broker', 'counterparty', 'executing broker'],
  },
  required: ['tradeDate', 'securityName', 'side', 'quantity', 'price'],
  defaultMapping: {
    tradeDate: 'Trade Date',
    settleDate: 'Settle Date',
    account: 'Account',
    securityName: 'Security Name',
    ticker: 'Ticker',
    identifier: 'Identifier',
    assetClass: 'Asset Class',
    side: 'Side',
    orderType: 'Order Type',
    status: 'Status',
    currency: 'Currency',
    quantity: 'Quantity',
    price: 'Price',
    grossAmount: 'Gross Amount',
    commission: 'Commission',
    netAmount: 'Net Amount',
    trader: 'Trader',
    broker: 'Broker',
  },
  mapRow: mapRowToTrade,
  derive: deriveTrades,
};
