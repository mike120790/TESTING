import { useState } from 'react';
import type { FacetOption } from '../state/facets';

interface Props {
  facetKey: string;
  label: string;
  options: FacetOption[];
  selected: Set<string> | undefined;
  onToggle: (key: string, value: string) => void;
  onClear: (key: string) => void;
}

/** One collapsible facet dimension rendered as a checkbox list with counts. */
export function FacetGroup({
  facetKey,
  label,
  options,
  selected,
  onToggle,
  onClear,
}: Props) {
  const [open, setOpen] = useState(true);
  const selectedCount = selected?.size ?? 0;

  return (
    <div className="facet-group">
      <div className="facet-head">
        <button
          className="facet-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <span className="facet-caret">{open ? '▾' : '▸'}</span>
          {label}
          {selectedCount > 0 && <span className="facet-badge">{selectedCount}</span>}
        </button>
        {selectedCount > 0 && (
          <button className="facet-clear" onClick={() => onClear(facetKey)}>
            clear
          </button>
        )}
      </div>
      {open && (
        <ul className="facet-list">
          {options.map((opt) => {
            const checked = selected?.has(opt.value) ?? false;
            return (
              <li key={opt.value}>
                <label className="facet-item">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(facetKey, opt.value)}
                  />
                  <span className="facet-value" title={opt.value || '(blank)'}>
                    {opt.value || '(blank)'}
                  </span>
                  <span className="facet-count">{opt.count}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
