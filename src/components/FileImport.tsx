import { useRef, useState } from 'react';
import type { RawRow } from '../types/position';
import { applyMapping, importFile } from '../data/dataSource';
import type { FieldMapping, MappingSpec } from '../data/mappingSpec';
import { ColumnMapDialog } from './ColumnMapDialog';

interface Props<T> {
  spec: MappingSpec<T>;
  label: string;
  onLoaded: (rows: T[], sourceName: string) => void;
}

interface PendingMap<T> {
  fileName: string;
  headers: string[];
  mapping: FieldMapping<T>;
  rawRows: RawRow[];
}

/**
 * Upload control for CSV/Excel exports. Auto-maps known headers via the given
 * spec; when required columns can't be matched it opens the column-map dialog.
 */
export function FileImport<T>({ spec, label, onLoaded }: Props<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingMap<T> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setError(null);
    try {
      const result = await importFile(file, spec);
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

  const applyAndClose = (mapping: FieldMapping<T>) => {
    if (!pending) return;
    onLoaded(applyMapping(pending.rawRows, mapping, spec), pending.fileName);
    setPending(null);
  };

  return (
    <>
      <label className="btn btn-import">
        {label}
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
          spec={spec}
          onApply={applyAndClose}
          onCancel={() => setPending(null)}
        />
      )}
    </>
  );
}
