import { FACET_KEYS, FACET_LABELS, type FacetKey } from '../types/position';
import type { FacetOptions } from '../state/facets';
import type { FacetSelections } from '../state/useFilters';
import { FacetGroup } from './FacetGroup';

interface Props {
  facets: FacetOptions;
  selections: FacetSelections;
  activeCount: number;
  onToggle: (key: FacetKey, value: string) => void;
  onClearFacet: (key: FacetKey) => void;
  onClearAll: () => void;
}

/** Left-hand faceted filter panel: one group per filterable dimension. */
export function FilterSidebar({
  facets,
  selections,
  activeCount,
  onToggle,
  onClearFacet,
  onClearAll,
}: Props) {
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
      {FACET_KEYS.map((key) => (
        <FacetGroup
          key={key}
          facetKey={key}
          label={FACET_LABELS[key]}
          options={facets[key]}
          selected={selections[key]}
          onToggle={onToggle}
          onClear={onClearFacet}
        />
      ))}
    </aside>
  );
}
