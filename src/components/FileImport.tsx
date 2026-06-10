import { useRef, useState } from 'react';
import type { Position, RawRow } from '../types/position';
import { applyMapping, importFile } from '../data/dataSource';
import type { FieldMapping } from '../data/columnMapping';
import { ColumnMapDialog } from './ColumnMapDialog';

interface Props {
  onLoaded: (positions: Position[], sourceName: string) => void;
}

interface PendingMap {
  fileName: string;
  headers: string[];
  mapping: FieldMapping;
  rawRows: RawRow[];
}

/**
 * Upload control for CSV/Excel position exports. Auto-maps known headers; when
 * required columns can't be matched it opens the column-map dialog.
 */
export function FileImport({ onLoaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingMap | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setError(null);
    try {
      const result = await importFile(file);
      if (result.complete) {
        onLoaded(result.positions, file.name);
      } else {
        setPending({
          fileName: file.name,
          headers: result.headers,
          mapping: result.mapping,
          rawRows: result.rawRows,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to read file');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const applyAndClose = (mapping: FieldMapping) => {
    if (!pending) return;
    const positions = applyMapping(pending.rawRows, mapping);
    onLoaded(positions, pending.fileName);
    setPending(null);
  };

  return (
    <>
      <label className="btn btn-import">
        Import CSV / Excel
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => handleFiles(e.target.files)}
          hidden
        />
      </label>
      {error && <span className="import-error">{error}</span>}
      {pending && (
        <ColumnMapDialog
          fileName={pending.fileName}
          headers={pending.headers}
          initialMapping={pending.mapping}
          onApply={applyAndClose}
          onCancel={() => setPending(null)}
        />
      )}
    </>
  );
}
