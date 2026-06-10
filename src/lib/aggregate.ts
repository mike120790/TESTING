import type { Position } from '../types/position';

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
