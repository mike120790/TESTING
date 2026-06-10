import { useState } from 'react';
import { useDataset } from './state/useDataset';
import { positionsDataSource, tradesDataSource } from './data/dataSource';
import { positionSpec } from './data/columnMapping';
import { tradeSpec } from './data/tradeMapping';
import { positionColumns } from './components/columns';
import { tradeColumns } from './components/tradeColumns';
import { PositionSummary, TradeSummary } from './components/SummaryHeader';
import { DashboardView } from './components/DashboardView';
import {
  POSITION_FACETS,
  POSITION_SEARCH_FIELDS,
  TRADE_FACETS,
  TRADE_SEARCH_FIELDS,
} from './viewConfig';

type View = 'positions' | 'activity';

export default function App() {
  const positions = useDataset(positionsDataSource, 'Sample portfolio');
  const trades = useDataset(tradesDataSource, 'Sample blotter');
  const [view, setView] = useState<View>('positions');

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">◆</span>
          <span className="brand-name">OMS</span>
          <span className="brand-sub">Dashboard</span>
        </div>
        <nav className="tabs">
          <button
            className={`tab ${view === 'positions' ? 'active' : ''}`}
            onClick={() => setView('positions')}
          >
            Positions
          </button>
          <button
            className={`tab ${view === 'activity' ? 'active' : ''}`}
            onClick={() => setView('activity')}
          >
            Activity
          </button>
        </nav>
      </header>

      {view === 'positions' ? (
        <DashboardView
          data={positions}
          facetDefs={POSITION_FACETS}
          searchFields={POSITION_SEARCH_FIELDS}
          columns={positionColumns}
          initialSort={[{ id: 'marketValue', desc: true }]}
          importSpec={positionSpec}
          importLabel="Import positions (CSV / Excel)"
          rowNoun="positions"
          renderSummary={(rows) => <PositionSummary rows={rows} />}
          emptyMessage="No positions match the current filters."
        />
      ) : (
        <DashboardView
          data={trades}
          facetDefs={TRADE_FACETS}
          searchFields={TRADE_SEARCH_FIELDS}
          columns={tradeColumns}
          initialSort={[{ id: 'tradeDate', desc: true }]}
          importSpec={tradeSpec}
          importLabel="Import trades (CSV / Excel)"
          rowNoun="trades"
          renderSummary={(rows) => <TradeSummary rows={rows} />}
          emptyMessage="No trades match the current filters."
        />
      )}
    </div>
  );
}
