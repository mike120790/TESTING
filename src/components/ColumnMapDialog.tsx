import { useState } from 'react';
import {
  isMappingComplete,
  missingRequiredFields,
  type FieldMapping,
  type MappingSpec,
} from '../data/mappingSpec';

interface Props<T> {
  fileName: string;
  headers: string[];
  initialMapping: FieldMapping<T>;
  spec: MappingSpec<T>;
  onApply: (mapping: FieldMapping<T>) => void;
  onCancel: () => void;
}

/**
 * Lets the user assign each domain field to a source column when an uploaded
 * file's headers don't auto-match. Fields whose label ends in "*" are required.
 */
export function ColumnMapDialog<T>({
  fileName,
  headers,
  initialMapping,
  spec,
  onApply,
  onCancel,
}: Props<T>) {
  const [mapping, setMapping] = useState<FieldMapping<T>>(initialMapping);

  const setField = (field: keyof T, header: string) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (header === '') delete next[field];
      else next[field] = header;
      return next;
    });
  };

  const complete = isMappingComplete(mapping, spec);
  const missing = missingRequiredFields(mapping, spec);

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h2>Map columns</h2>
          <p className="modal-sub">
            Match the columns in <strong>{fileName}</strong> to dashboard fields.
            Fields marked <span className="req">*</span> are required.
          </p>
        </header>

        <div className="map-grid">
          {spec.fields.map((field) => (
            <div className="map-row" key={String(field)}>
              <label className="map-field">
                {spec.labels[field] ?? String(field)}
              </label>
              <select
                className="map-select"
                value={mapping[field] ?? ''}
                onChange={(e) => setField(field, e.target.value)}
              >
                <option value="">— ignore —</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <footer className="modal-foot">
          {!complete && (
            <span className="modal-warn">
              Missing required: {missing.map(String).join(', ')}
            </span>
          )}
          <div className="modal-actions">
            <button className="btn" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={!complete}
              onClick={() => onApply(mapping)}
            >
              Load data
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
