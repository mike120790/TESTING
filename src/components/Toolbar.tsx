import type { Position } from '../types/position';
import { FileImport } from './FileImport';

interface Props {
  search: string;
  onSearch: (s: string) => void;
  visibleCount: number;
  totalCount: number;
  activeFilterCount: number;
  onClearAll: () => void;
  sourceName: string;
  onLoaded: (positions: Position[], sourceName: string) => void;
}

/** Top toolbar: global search, row counts, clear-filters, and file import. */
export function Toolbar({
  search,
  onSearch,
  visibleCount,
  totalCount,
  activeFilterCount,
  onClearAll,
  sourceName,
  onLoaded,
}: Props) {
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
          {visibleCount.toLocaleString()} / {totalCount.toLocaleString()} positions
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
        <FileImport onLoaded={onLoaded} />
      </div>
    </div>
  );
}
