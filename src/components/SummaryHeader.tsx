import { useMemo } from 'react';
import type { Position } from '../types/position';
import { computeTotals } from '../lib/aggregate';
import { fmtCurrency, fmtNumber, fmtPercent, fmtSignedCurrency } from '../lib/format';

interface Props {
  rows: Position[];
}

/** KPI strip computed live over the currently filtered rows. */
export function SummaryHeader({ rows }: Props) {
  const t = useMemo(() => computeTotals(rows), [rows]);
  const pnlCls = t.unrealizedPnl > 0 ? 'pnl-pos' : t.unrealizedPnl < 0 ? 'pnl-neg' : '';

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
