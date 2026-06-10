import type { MappingSpec } from '../data/mappingSpec';
import { FileImport } from './FileImport';

interface Props<T> {
  search: string;
  onSearch: (s: string) => void;
  visibleCount: number;
  totalCount: number;
  rowNoun: string;
  activeFilterCount: number;
  onClearAll: () => void;
  sourceName: string;
  importSpec: MappingSpec<T>;
  importLabel: string;
  onLoaded: (rows: T[], sourceName: string) => void;
}

/** Top toolbar: global search, row counts, clear-filters, and file import. */
export function Toolbar<T>({
  search,
  onSearch,
  visibleCount,
  totalCount,
  rowNoun,
  activeFilterCount,
  onClearAll,
  sourceName,
  importSpec,
  importLabel,
  onLoaded,
}: Props<T>) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <input
          className="search"
          type="search"
          placeholder="Search name, ticker, identifier…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        <span className="row-count">
          {visibleCount.toLocaleString()} / {totalCount.toLocaleString()} {rowNoun}
        </span>
        {activeFilterCount > 0 && (
          <button className="link-btn" onClick={onClearAll}>
            Clear filters ({activeFilterCount})
          </button>
        )}
      </div>
      <div className="toolbar-right">
        <span className="source-name" title="Active dataset">
          {sourceName}
        </span>
        <FileImport spec={importSpec} label={importLabel} onLoaded={onLoaded} />
      </div>
    </div>
  );
}
