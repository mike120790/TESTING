import { useCallback, useMemo, useState } from 'react';
import { FACET_KEYS, type FacetKey, type Position } from '../types/position';
import { computeFacets, type FacetOptions } from './facets';

/** Selected values per facet dimension. */
export type FacetSelections = Partial<Record<FacetKey, Set<string>>>;

export interface FiltersState {
  search: string;
  setSearch: (s: string) => void;
  selections: FacetSelections;
  toggleFacet: (key: FacetKey, value: string) => void;
  clearFacet: (key: FacetKey) => void;
  clearAll: () => void;
  /** Total number of selected facet values across all dimensions. */
  activeCount: number;
  /** Facet options (value + count) for the sidebar. */
  facets: FacetOptions;
  /** Rows after applying search + facet filters. */
  filtered: Position[];
}

function matchesSearch(p: Position, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    p.securityName.toLowerCase().includes(needle) ||
    p.ticker.toLowerCase().includes(needle) ||
    (p.identifier?.toLowerCase().includes(needle) ?? false)
  );
}

/**
 * Owns filter state and derives the filtered row set. Within a facet, selected
 * values combine with OR; across facets they combine with AND. Search is a
 * case-insensitive substring over name / ticker / identifier.
 */
export function useFilters(positions: Position[]): FiltersState {
  const [search, setSearch] = useState('');
  const [selections, setSelections] = useState<FacetSelections>({});

  const toggleFacet = useCallback((key: FacetKey, value: string) => {
    setSelections((prev) => {
      const next: FacetSelections = { ...prev };
      const set = new Set(next[key] ?? []);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      if (set.size === 0) delete next[key];
      else next[key] = set;
      return next;
    });
  }, []);

  const clearFacet = useCallback((key: FacetKey) => {
    setSelections((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSelections({});
    setSearch('');
  }, []);

  const facets = useMemo(() => computeFacets(positions), [positions]);

  const filtered = useMemo(() => {
    const activeKeys = FACET_KEYS.filter((k) => (selections[k]?.size ?? 0) > 0);
    return positions.filter((p) => {
      if (!matchesSearch(p, search)) return false;
      for (const key of activeKeys) {
        const set = selections[key]!;
        if (!set.has(String(p[key] ?? ''))) return false;
      }
      return true;
    });
  }, [positions, selections, search]);

  const activeCount = useMemo(
    () =>
      FACET_KEYS.reduce((sum, k) => sum + (selections[k]?.size ?? 0), 0),
    [selections],
  );

  return {
    search,
    setSearch,
    selections,
    toggleFacet,
    clearFacet,
    clearAll,
    activeCount,
    facets,
    filtered,
  };
}
