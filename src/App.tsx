import { usePositions } from './state/usePositions';
import { useFilters } from './state/useFilters';
import { SummaryHeader } from './components/SummaryHeader';
import { Toolbar } from './components/Toolbar';
import { FilterSidebar } from './components/FilterSidebar';
import { PositionsGrid } from './components/PositionsGrid';

export default function App() {
  const { positions, loading, error, sourceName, replacePositions } =
    usePositions();
  const filters = useFilters(positions);

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">◆</span>
          <span className="brand-name">OMS</span>
          <span className="brand-sub">Positions Dashboard</span>
        </div>
        <SummaryHeader rows={filters.filtered} />
      </header>

      <Toolbar
        search={filters.search}
        onSearch={filters.setSearch}
        visibleCount={filters.filtered.length}
        totalCount={positions.length}
        activeFilterCount={filters.activeCount}
        onClearAll={filters.clearAll}
        sourceName={sourceName}
        onLoaded={replacePositions}
      />

      <div className="body">
        <FilterSidebar
          facets={filters.facets}
          selections={filters.selections}
          activeCount={filters.activeCount}
          onToggle={filters.toggleFacet}
          onClearFacet={filters.clearFacet}
          onClearAll={filters.clearAll}
        />
        <main className="content">
          {loading && <div className="state-msg">Loading positions…</div>}
          {error && <div className="state-msg error">Error: {error}</div>}
          {!loading && !error && <PositionsGrid rows={filters.filtered} />}
        </main>
      </div>
    </div>
  );
}
