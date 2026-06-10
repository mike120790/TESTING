import { useMemo } from 'react';
import type { Trade } from '../types/trade';
import { groupSum, topN } from '../lib/breakdown';
import { fmtCurrency, fmtNumber } from '../lib/format';
import { ChartCard } from './ChartCard';
import { DonutChart } from './DonutChart';
import { BarList } from './BarList';

/** Breakdown charts for the activity view (notional + counts). */
export function TradeCharts({ rows }: { rows: Trade[] }) {
  const bySide = useMemo(
    () => groupSum(rows, (t) => t.side, (t) => t.grossAmount),
    [rows],
  );
  const byAssetClass = useMemo(
    () => groupSum(rows, (t) => t.assetClass, (t) => t.grossAmount),
    [rows],
  );
  const byStatus = useMemo(
    () => topN(groupSum(rows, (t) => t.status, () => 1), 6),
    [rows],
  );

  return (
    <>
      <ChartCard title="Notional by Side">
        <DonutChart slices={bySide} format={fmtCurrency} centerLabel="Notional" />
      </ChartCard>
      <ChartCard title="Notional by Asset Class">
        <DonutChart slices={byAssetClass} format={fmtCurrency} centerLabel="Notional" />
      </ChartCard>
      <ChartCard title="Trades by Status">
        <BarList slices={byStatus} format={fmtNumber} />
      </ChartCard>
    </>
  );
}
