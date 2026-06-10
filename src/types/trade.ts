import type { AssetClass } from './position';

export type TradeSide = 'Buy' | 'Sell' | 'Short' | 'Cover';

export type OrderType = 'Market' | 'Limit' | 'Stop' | 'VWAP' | 'TWAP';

export type TradeStatus =
  | 'Filled'
  | 'Partially Filled'
  | 'Pending'
  | 'Cancelled';

/**
 * A single executed (or working) order in the activity blotter. Mirrors a
 * typical OMS trade-activity export.
 */
export interface Trade {
  id: string;
  tradeDate: string; // ISO date
  settleDate?: string; // ISO date (T+n)
  account: string;
  securityName: string;
  ticker: string;
  identifier?: string;
  assetClass: AssetClass;
  side: TradeSide;
  orderType: OrderType;
  status: TradeStatus;
  currency: string;

  quantity: number;
  price: number;
  grossAmount: number; // quantity * price (signed by side)
  commission: number;
  netAmount: number; // grossAmount +/- commission

  trader?: string;
  broker?: string;
}
