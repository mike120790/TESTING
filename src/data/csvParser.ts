import Papa from 'papaparse';
import type { RawRow } from '../types/position';

/**
 * Parse CSV text or a File into header-keyed rows. Uses PapaParse with
 * `header: true` so each row is an object keyed by column name.
 */
export function parseCsv(input: string | File): Promise<RawRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawRow>(input as string, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      complete: (results) => resolve(results.data),
      error: (err: unknown) => reject(err),
    });
  });
}

/** Extract the ordered list of column headers from CSV text or a File. */
export function parseCsvHeaders(input: string): string[] {
  const result = Papa.parse<string[]>(input, {
    preview: 1,
    skipEmptyLines: true,
  });
  const first = result.data[0];
  return Array.isArray(first) ? first.map((h) => String(h).trim()) : [];
}
