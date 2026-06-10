import type { FacetOptions } from '../state/facets';
import type { FacetDef, FacetSelections } from '../state/useFilters';
import { FacetGroup } from './FacetGroup';

interface Props<T> {
  facetDefs: FacetDef<T>[];
  facets: FacetOptions;
  selections: FacetSelections;
  activeCount: number;
  onToggle: (key: string, value: string) => void;
  onClearFacet: (key: string) => void;
  onClearAll: () => void;
}

/** Left-hand faceted filter panel: one group per configured dimension. */
export function FilterSidebar<T>({
  facetDefs,
  facets,
  selections,
  activeCount,
  onToggle,
  onClearFacet,
  onClearAll,
}: Props<T>) {
  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <h2>Filters</h2>
        {activeCount > 0 && (
          <button className="link-btn" onClick={onClearAll}>
            Clear all ({activeCount})
          </button>
        )}
      </div>
      {facetDefs.map((def) => (
        <FacetGroup
          key={def.key}
          facetKey={def.key}
          label={def.label}
          options={facets[def.key] ?? []}
          selected={selections[def.key]}
          onToggle={onToggle}
          onClear={onClearFacet}
        />
      ))}
    </aside>
  );
}
