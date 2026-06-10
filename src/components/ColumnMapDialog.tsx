import { useState } from 'react';
import type { Position } from '../types/position';
import {
  MAPPABLE_FIELDS,
  isMappingComplete,
  missingRequiredFields,
  type FieldMapping,
} from '../data/columnMapping';

/** Human labels for mappable fields shown in the dialog. */
const FIELD_LABELS: Partial<Record<keyof Position, string>> = {
  account: 'Account',
  portfolio: 'Portfolio',
  securityName: 'Security Name *',
  ticker: 'Ticker',
  identifier: 'Identifier (CUSIP/ISIN)',
  assetClass: 'Asset Class',
  investmentType: 'Investment Type',
  sector: 'Sector',
  currency: 'Currency',
  quantity: 'Quantity *',
  price: 'Price *',
  costBasis: 'Cost Basis',
  marketValue: 'Market Value',
  unrealizedPnl: 'Unrealized P&L',
  weightPct: 'Weight %',
  dayChangePct: 'Day Change %',
  asOfDate: 'As Of Date',
};

interface Props {
  fileName: string;
  headers: string[];
  initialMapping: FieldMapping;
  onApply: (mapping: FieldMapping) => void;
  onCancel: () => void;
}

/**
 * Lets the user assign each `Position` field to a source column when the
 * uploaded file's headers don't auto-match. Fields marked * are required.
 */
export function ColumnMapDialog({
  fileName,
  headers,
  initialMapping,
  onApply,
  onCancel,
}: Props) {
  const [mapping, setMapping] = useState<FieldMapping>(initialMapping);

  const setField = (field: keyof Position, header: string) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (header === '') delete next[field];
      else next[field] = header;
      return next;
    });
  };

  const complete = isMappingComplete(mapping);
  const missing = missingRequiredFields(mapping);

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
          {MAPPABLE_FIELDS.map((field) => (
            <div className="map-row" key={field}>
              <label className="map-field">{FIELD_LABELS[field] ?? field}</label>
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
              Missing required: {missing.join(', ')}
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
