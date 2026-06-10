import { FACET_KEYS, type FacetKey, type Position } from '../types/position';

export interface FacetOption {
  value: string;
  count: number;
}

export type FacetOptions = Record<FacetKey, FacetOption[]>;

/**
 * Walk the dataset once and build, for each facet dimension, the distinct
 * values with their occurrence counts (sorted by count desc, then value).
 * `selected` reflects active filters but counts are computed over the full
 * dataset for a stable, predictable sidebar (classic OR-within-facet UX).
 */
export function computeFacets(positions: Position[]): FacetOptions {
  const maps: Record<FacetKey, Map<string, number>> = {
    account: new Map(),
    assetClass: new Map(),
    investmentType: new Map(),
    sector: new Map(),
    currency: new Map(),
  };

  for (const p of positions) {
    for (const key of FACET_KEYS) {
      const value = String(p[key] ?? '');
      maps[key].set(value, (maps[key].get(value) ?? 0) + 1);
    }
  }

  const out = {} as FacetOptions;
  for (const key of FACET_KEYS) {
    out[key] = [...maps[key].entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
  }
  return out;
}
