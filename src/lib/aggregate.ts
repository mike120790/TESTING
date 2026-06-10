import type { Position } from '../types/position';
import type { Trade } from '../types/trade';
import { isBuySide } from '../data/tradeMapping';

export interface PortfolioTotals {
  marketValue: number;
  costBasis: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  positionCount: number;
  accountCount: number;
}

/** Roll up totals across a set of positions (typically the filtered rows). */
export function computeTotals(positions: Position[]): PortfolioTotals {
  let marketValue = 0;
  let costBasis = 0;
  const accounts = new Set<string>();

  for (const p of positions) {
    marketValue += p.marketValue;
    costBasis += p.costBasis;
    accounts.add(p.account);
  }

  const unrealizedPnl = marketValue - costBasis;
  const unrealizedPnlPct = costBasis !== 0 ? unrealizedPnl / costBasis : 0;

  return {
    marketValue,
    costBasis,
    unrealizedPnl,
    unrealizedPnlPct,
    positionCount: positions.length,
    accountCount: accounts.size,
  };
}

export interface TradeStats {
  tradeCount: number;
  buyNotional: number;
  sellNotional: number;
  netNotional: number; // buy - sell
  totalCommission: number;
  filledCount: number;
}

/** Roll up trade-blotter stats across a set of trades (the filtered rows). */
export function computeTradeStats(trades: Trade[]): TradeStats {
  let buyNotional = 0;
  let sellNotional = 0;
  let totalCommission = 0;
  let filledCount = 0;

  for (const t of trades) {
    if (isBuySide(t.side)) buyNotional += t.grossAmount;
    else sellNotional += t.grossAmount;
    totalCommission += t.commission;
    if (t.status === 'Filled') filledCount++;
  }

  return {
    tradeCount: trades.length,
    buyNotional,
    sellNotional,
    netNotional: buyNotional - sellNotional,
    totalCommission,
    filledCount,
  };
}
