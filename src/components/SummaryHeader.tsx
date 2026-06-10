import { useMemo } from 'react';
import type { Position } from '../types/position';
import type { Trade } from '../types/trade';
import { computeTotals, computeTradeStats } from '../lib/aggregate';
import {
  fmtCurrency,
  fmtNumber,
  fmtPercent,
  fmtSignedCurrency,
} from '../lib/format';

function Kpi({
  label,
  value,
  valueClass = '',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="kpi">
      <span className="kpi-label">{label}</span>
      <span className={`kpi-value ${valueClass}`}>{value}</span>
    </div>
  );
}

/** KPI strip for the positions view, computed over the filtered rows. */
export function PositionSummary({ rows }: { rows: Position[] }) {
  const t = useMemo(() => computeTotals(rows), [rows]);
  const pnlCls =
    t.unrealizedPnl > 0 ? 'pnl-pos' : t.unrealizedPnl < 0 ? 'pnl-neg' : '';

  return (
    <div className="summary">
      <Kpi label="Market Value" value={fmtCurrency(t.marketValue)} />
      <Kpi label="Cost Basis" value={fmtCurrency(t.costBasis)} />
      <Kpi
        label="Unrealized P&L"
        value={fmtSignedCurrency(t.unrealizedPnl)}
        valueClass={pnlCls}
      />
      <Kpi label="P&L %" value={fmtPercent(t.unrealizedPnlPct)} valueClass={pnlCls} />
      <Kpi label="Positions" value={fmtNumber(t.positionCount)} />
      <Kpi label="Accounts" value={fmtNumber(t.accountCount)} />
    </div>
  );
}

/** KPI strip for the activity view, computed over the filtered trades. */
export function TradeSummary({ rows }: { rows: Trade[] }) {
  const s = useMemo(() => computeTradeStats(rows), [rows]);
  const netCls = s.netNotional > 0 ? 'pnl-pos' : s.netNotional < 0 ? 'pnl-neg' : '';

  return (
    <div className="summary">
      <Kpi label="Trades" value={fmtNumber(s.tradeCount)} />
      <Kpi label="Buy Notional" value={fmtCurrency(s.buyNotional)} valueClass="pnl-pos" />
      <Kpi label="Sell Notional" value={fmtCurrency(s.sellNotional)} valueClass="pnl-neg" />
      <Kpi label="Net" value={fmtSignedCurrency(s.netNotional)} valueClass={netCls} />
      <Kpi label="Commission" value={fmtCurrency(s.totalCommission)} />
      <Kpi label="Filled" value={`${s.filledCount} / ${s.tradeCount}`} />
    </div>
  );
}
