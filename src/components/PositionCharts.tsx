import { useMemo } from 'react';
import type { Position } from '../types/position';
import { groupSum, topN } from '../lib/breakdown';
import { fmtCurrency } from '../lib/format';
import { ChartCard } from './ChartCard';
import { DonutChart } from './DonutChart';
import { BarList } from './BarList';

/** Allocation charts for the positions view (by market value). */
export function PositionCharts({ rows }: { rows: Position[] }) {
  const byAssetClass = useMemo(
    () => groupSum(rows, (p) => p.assetClass, (p) => p.marketValue),
    [rows],
  );
  const byAccount = useMemo(
    () => groupSum(rows, (p) => p.account, (p) => p.marketValue),
    [rows],
  );
  const bySector = useMemo(
    () => topN(groupSum(rows, (p) => p.sector, (p) => p.marketValue), 8),
    [rows],
  );

  return (
    <>
      <ChartCard title="Allocation by Asset Class">
        <DonutChart slices={byAssetClass} format={fmtCurrency} centerLabel="Mkt Value" />
      </ChartCard>
      <ChartCard title="Allocation by Account">
        <DonutChart slices={byAccount} format={fmtCurrency} centerLabel="Mkt Value" />
      </ChartCard>
      <ChartCard title="Market Value by Sector">
        <BarList slices={bySector} format={fmtCurrency} />
      </ChartCard>
    </>
  );
}
