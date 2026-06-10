export interface FacetOption {
  value: string;
  count: number;
}

/** Facet options keyed by the (stringified) field name. */
export type FacetOptions = Record<string, FacetOption[]>;

/**
 * Walk a dataset once and build, for each requested field, the distinct values
 * with their occurrence counts (sorted by count desc, then value). Generic over
 * the row type so it serves both positions and the trade blotter.
 */
export function computeFacets<T>(rows: T[], keys: (keyof T)[]): FacetOptions {
  const maps = new Map<keyof T, Map<string, number>>();
  for (const k of keys) maps.set(k, new Map());

  for (const row of rows) {
    for (const k of keys) {
      const value = String(row[k] ?? '');
      const m = maps.get(k)!;
      m.set(value, (m.get(value) ?? 0) + 1);
    }
  }

  const out: FacetOptions = {};
  for (const k of keys) {
    out[String(k)] = [...maps.get(k)!.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
  }
  return out;
}
