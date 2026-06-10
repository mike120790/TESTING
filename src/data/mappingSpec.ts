import type { RawRow } from '../types/position';

/** Maps a domain field to the source column header that supplies it. */
export type FieldMapping<T> = Partial<Record<keyof T, string>>;

/**
 * Describes how to ingest a CSV/Excel export into a typed domain object.
 * One spec per view (positions, trades); the generic engine below handles
 * header auto-detection, required-field checks, and row mapping.
 */
export interface MappingSpec<T> {
  /** Mappable fields in display order (used by the column-map dialog). */
  fields: (keyof T)[];
  /** Human labels per field; a trailing "*" marks required fields. */
  labels: Partial<Record<keyof T, string>>;
  /** Known header aliases per field for auto-detection. */
  aliases: Partial<Record<keyof T, string[]>>;
  /** Fields that must be mapped for a usable record. */
  required: (keyof T)[];
  /** Default mapping for the baked-in sample export. */
  defaultMapping: FieldMapping<T>;
  /** Build one record from a raw row + resolved mapping. */
  mapRow: (row: RawRow, mapping: FieldMapping<T>, index: number) => T;
  /** Fill derived fields across the full set (P&L, weights, net amounts…). */
  derive: (rows: T[]) => T[];
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

/** Auto-match source headers to fields via the spec's alias table. */
export function inferMapping<T>(
  headers: string[],
  spec: MappingSpec<T>,
): FieldMapping<T> {
  const mapping: FieldMapping<T> = {};
  const byNorm = new Map(headers.map((h) => [norm(h), h]));

  for (const field of spec.fields) {
    const aliases = spec.aliases[field] ?? [];
    for (const alias of aliases) {
      const hit = byNorm.get(norm(alias));
      if (hit) {
        mapping[field] = hit;
        break;
      }
    }
  }
  return mapping;
}

/** Are all required fields present in the mapping? */
export function isMappingComplete<T>(
  mapping: FieldMapping<T>,
  spec: MappingSpec<T>,
): boolean {
  return spec.required.every((f) => Boolean(mapping[f]));
}

/** Required fields still missing from the mapping. */
export function missingRequiredFields<T>(
  mapping: FieldMapping<T>,
  spec: MappingSpec<T>,
): (keyof T)[] {
  return spec.required.filter((f) => !mapping[f]);
}

/** Map a full set of raw rows, then run the spec's derive step. */
export function mapAndDerive<T>(
  rows: RawRow[],
  mapping: FieldMapping<T>,
  spec: MappingSpec<T>,
): T[] {
  return spec.derive(rows.map((row, i) => spec.mapRow(row, mapping, i)));
}

// --- Shared cell helpers for spec implementations -------------------------

export function rowStr(
  row: RawRow,
  header: string | undefined,
  fallback = '',
): string {
  if (!header) return fallback;
  const v = row[header];
  if (v == null) return fallback;
  const s = String(v).trim();
  return s === '' ? fallback : s;
}
