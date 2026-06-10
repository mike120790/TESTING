import { useCallback, useMemo, useState } from 'react';
import { computeFacets, type FacetOptions } from './facets';

/** A filterable dimension: which field it reads and how to label it. */
export interface FacetDef<T> {
  key: keyof T & string;
  label: string;
}

/** Selected values per facet field (keyed by the field name). */
export type FacetSelections = Record<string, Set<string>>;

export interface FiltersState<T> {
  search: string;
  setSearch: (s: string) => void;
  selections: FacetSelections;
  toggleFacet: (key: string, value: string) => void;
  clearFacet: (key: string) => void;
  clearAll: () => void;
  /** Total number of selected facet values across all dimensions. */
  activeCount: number;
  /** Facet options (value + count) for the sidebar. */
  facets: FacetOptions;
  /** Rows after applying search + facet filters. */
  filtered: T[];
}

/**
 * Generic faceted-filter engine. Within a facet, selected values combine with
 * OR; across facets they combine with AND. Search is a case-insensitive
 * substring over the configured `searchFields`.
 */
export function useFilters<T>(
  rows: T[],
  facetDefs: FacetDef<T>[],
  searchFields: (keyof T)[],
): FiltersState<T> {
  const [search, setSearch] = useState('');
  const [selections, setSelections] = useState<FacetSelections>({});

  const toggleFacet = useCallback((key: string, value: string) => {
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

  const clearFacet = useCallback((key: string) => {
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

  const facetKeys = useMemo(() => facetDefs.map((d) => d.key), [facetDefs]);

  const facets = useMemo(
    () => computeFacets(rows, facetKeys),
    [rows, facetKeys],
  );

  const matchesSearch = useCallback(
    (row: T, q: string): boolean => {
      if (!q) return true;
      const needle = q.toLowerCase();
      return searchFields.some((f) => {
        const v = row[f];
        return v != null && String(v).toLowerCase().includes(needle);
      });
    },
    [searchFields],
  );

  const filtered = useMemo(() => {
    const activeKeys = facetKeys.filter((k) => (selections[k]?.size ?? 0) > 0);
    return rows.filter((row) => {
      if (!matchesSearch(row, search)) return false;
      for (const key of activeKeys) {
        const set = selections[key]!;
        if (!set.has(String(row[key] ?? ''))) return false;
      }
      return true;
    });
  }, [rows, selections, search, facetKeys, matchesSearch]);

  const activeCount = useMemo(
    () =>
      Object.values(selections).reduce((sum, set) => sum + set.size, 0),
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
