/**
 * Core domain model for the OMS positions dashboard.
 *
 * A `Position` is a single holding within an account/portfolio at a point in
 * time. Fields mirror what a typical custodian / fund-admin position export
 * contains, plus a few derived analytics computed in `data/normalize.ts`.
 */

export type AssetClass =
  | 'Equity'
  | 'Fixed Income'
  | 'Cash'
  | 'Derivative'
  | 'Commodity'
  | 'FX'
  | 'Fund'
  | 'Alternative';

export type InvestmentType =
  | 'Common Stock'
  | 'Preferred Stock'
  | 'ETF'
  | 'Mutual Fund'
  | 'Corporate Bond'
  | 'Government Bond'
  | 'Municipal Bond'
  | 'Money Market'
  | 'Option'
  | 'Future'
  | 'Swap'
  | 'REIT';

export interface Position {
  /** Stable key — account + identifier, or generated when absent. */
  id: string;
  account: string;
  portfolio?: string;
  securityName: string;
  ticker: string;
  identifier?: string; // CUSIP / ISIN / SEDOL
  assetClass: AssetClass;
  investmentType: InvestmentType;
  sector: string; // GICS-style; "N/A" for cash
  currency: string; // ISO 4217

  quantity: number;
  price: number; // last price per unit/share
  costBasis: number; // total cost (not per-unit)
  marketValue: number; // quantity * price, base ccy

  // Derived in normalize.ts when not supplied by the source:
  unrealizedPnl: number; // marketValue - costBasis
  unrealizedPnlPct: number; // unrealizedPnl / costBasis
  weightPct: number; // marketValue / total portfolio MV

  // Optional analytics:
  dayChangePct?: number;
  asOfDate?: string; // ISO date of the snapshot
}

/** Loosely-typed row as it comes out of a CSV/Excel parser. */
export type RawRow = Record<string, string | number | null | undefined>;
