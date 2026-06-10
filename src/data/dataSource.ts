import type { Position, RawRow } from '../types/position';
import type { Trade } from '../types/trade';
import { parseCsv } from './csvParser';
import { positionSpec } from './columnMapping';
import { tradeSpec } from './tradeMapping';
import {
  inferMapping,
  isMappingComplete,
  mapAndDerive,
  type FieldMapping,
  type MappingSpec,
} from './mappingSpec';

/**
 * The single ingestion seam. Everything in the UI depends only on this
 * interface, so swapping a sample CSV for a REST/WebSocket/DB source later is a
 * one-file change: implement `DataSource.load` and point the relevant source at
 * it.
 */
export interface DataSource<T> {
  load(): Promise<T[]>;
}

/** Fetch a baked-in sample CSV from /public/data and map it through a spec. */
function sampleCsvSource<T>(file: string, spec: MappingSpec<T>): DataSource<T> {
  return {
    async load() {
      const res = await fetch(`${import.meta.env.BASE_URL}data/${file}`);
      if (!res.ok) throw new Error(`Failed to load ${file}: ${res.status}`);
      const rows = await parseCsv(await res.text());
      return mapAndDerive(rows, spec.defaultMapping, spec);
    },
  };
}

/** Default v1 sources: baked-in sample exports shipped in /public/data. */
export const positionsDataSource: DataSource<Position> = sampleCsvSource(
  'sample-positions.csv',
  positionSpec,
);
export const tradesDataSource: DataSource<Trade> = sampleCsvSource(
  'sample-trades.csv',
  tradeSpec,
);

export interface ImportResult<T> {
  positions: T[];
  mapping: FieldMapping<T>;
  rawRows: RawRow[];
  headers: string[];
  complete: boolean;
}

/**
 * Parse a user-uploaded CSV/Excel file against a mapping spec. Auto-infers the
 * column mapping; the caller inspects `complete` and opens the remap dialog when
 * required fields can't be matched.
 */
export async function importFile<T>(
  file: File,
  spec: MappingSpec<T>,
): Promise<ImportResult<T>> {
  const isExcel = /\.xlsx?$/i.test(file.name);
  // Excel support pulls in the heavy exceljs dependency; load it on demand so
  // it never lands in the initial bundle (the common path is CSV).
  const rawRows = isExcel
    ? await import('./excelParser').then((m) => m.parseExcel(file))
    : await parseCsv(file);

  const headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
  const mapping = inferMapping(headers, spec);
  const complete = isMappingComplete(mapping, spec);

  return {
    positions: complete ? mapAndDerive(rawRows, mapping, spec) : [],
    mapping,
    rawRows,
    headers,
    complete,
  };
}

/** Apply a (possibly user-edited) mapping to already-parsed raw rows. */
export function applyMapping<T>(
  rawRows: RawRow[],
  mapping: FieldMapping<T>,
  spec: MappingSpec<T>,
): T[] {
  return mapAndDerive(rawRows, mapping, spec);
}
