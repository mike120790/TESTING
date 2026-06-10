import type { ReactNode } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import type { DatasetState } from '../state/useDataset';
import { useFilters, type FacetDef } from '../state/useFilters';
import type { MappingSpec } from '../data/mappingSpec';
import { FilterSidebar } from './FilterSidebar';
import { Toolbar } from './Toolbar';
import { DataGrid } from './DataGrid';

interface Props<T> {
  data: DatasetState<T>;
  facetDefs: FacetDef<T>[];
  searchFields: (keyof T)[];
  columns: ColumnDef<T>[];
  initialSort: SortingState;
  importSpec: MappingSpec<T>;
  importLabel: string;
  rowNoun: string;
  renderSummary: (rows: T[]) => ReactNode;
  emptyMessage?: string;
}

/**
 * One full dashboard view (positions or activity): summary strip, toolbar,
 * faceted sidebar, and the data grid. Owns filter state; the dataset itself
 * lives in the parent so uploads persist across view switches.
 */
export function DashboardView<T>({
  data,
  facetDefs,
  searchFields,
  columns,
  initialSort,
  importSpec,
  importLabel,
  rowNoun,
  renderSummary,
  emptyMessage,
}: Props<T>) {
  const filters = useFilters(data.rows, facetDefs, searchFields);

  return (
    <div className="view">
      <div className="view-summary">{renderSummary(filters.filtered)}</div>

      <Toolbar
        search={filters.search}
        onSearch={filters.setSearch}
        visibleCount={filters.filtered.length}
        totalCount={data.rows.length}
        rowNoun={rowNoun}
        activeFilterCount={filters.activeCount}
        onClearAll={filters.clearAll}
        sourceName={data.sourceName}
        importSpec={importSpec}
        importLabel={importLabel}
        onLoaded={data.replace}
      />

      <div className="body">
        <FilterSidebar
          facetDefs={facetDefs}
          facets={filters.facets}
          selections={filters.selections}
          activeCount={filters.activeCount}
          onToggle={filters.toggleFacet}
          onClearFacet={filters.clearFacet}
          onClearAll={filters.clearAll}
        />
        <main className="content">
          {data.loading && <div className="state-msg">Loading…</div>}
          {data.error && <div className="state-msg error">Error: {data.error}</div>}
          {!data.loading && !data.error && (
            <DataGrid
              rows={filters.filtered}
              columns={columns}
              initialSort={initialSort}
              emptyMessage={emptyMessage}
            />
          )}
        </main>
      </div>
    </div>
  );
}
