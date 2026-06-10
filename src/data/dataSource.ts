import type { Position, RawRow } from '../types/position';
import { parseCsv } from './csvParser';
import {
  DEFAULT_MAPPING,
  inferMapping,
  isMappingComplete,
  mapRows,
  type FieldMapping,
} from './columnMapping';
import { deriveFields } from './normalize';

/**
 * The single ingestion seam. Everything in the UI depends only on this
 * interface, so swapping the sample CSV for a REST/WebSocket/DB source later is
 * a one-file change: implement `DataSource.load` and point `activeDataSource`
 * at it.
 */
export interface DataSource {
  load(): Promise<Position[]>;
}

/** Run mapped rows through the derive step to fill P&L / weight. */
function finalize(rows: RawRow[], mapping: FieldMapping): Position[] {
  return deriveFields(mapRows(rows, mapping));
}

/** Default v1 source: the baked-in sample export shipped in /public/data. */
export const sampleCsvDataSource: DataSource = {
  async load() {
    const res = await fetch(`${import.meta.env.BASE_URL}data/sample-positions.csv`);
    if (!res.ok) throw new Error(`Failed to load sample data: ${res.status}`);
    const text = await res.text();
    const rows = await parseCsv(text);
    return finalize(rows, DEFAULT_MAPPING);
  },
};

/** Active source the app loads on startup. Swap here to wire a real backend. */
export const activeDataSource: DataSource = sampleCsvDataSource;

export interface ImportResult {
  /** Parsed positions, ready for the grid. */
  positions: Position[];
  /** Mapping that was used (auto-inferred). */
  mapping: FieldMapping;
  /** Raw rows, retained so the column-map dialog can re-map if needed. */
  rawRows: RawRow[];
  /** Detected source headers. */
  headers: string[];
  /** True when every required field was auto-matched. */
  complete: boolean;
}

/**
 * Parse a user-uploaded CSV/Excel file. Auto-infers the column mapping; the
 * caller inspects `complete` and opens the remap dialog when needed. Re-mapping
 * later just calls `applyMapping` with the retained `rawRows`.
 */
export async function importFile(file: File): Promise<ImportResult> {
  const isExcel = /\.xlsx?$/i.test(file.name);
  // Excel support pulls in the heavy exceljs dependency; load it on demand so
  // it never lands in the initial bundle (the common path is CSV).
  const rawRows = isExcel
    ? await import('./excelParser').then((m) => m.parseExcel(file))
    : await parseCsv(file);
  const headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
  const mapping = inferMapping(headers);
  const complete = isMappingComplete(mapping);

  return {
    positions: complete ? finalize(rawRows, mapping) : [],
    mapping,
    rawRows,
    headers,
    complete,
  };
}

/** Apply a (possibly user-edited) mapping to already-parsed raw rows. */
export function applyMapping(
  rawRows: RawRow[],
  mapping: FieldMapping,
): Position[] {
  return finalize(rawRows, mapping);
}
