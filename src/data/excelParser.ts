import ExcelJS from 'exceljs';
import type { RawRow } from '../types/position';

/**
 * Parse the first worksheet of an .xlsx/.xls File into header-keyed rows.
 * The first row is treated as the header. Output mirrors the shape produced by
 * `parseCsv` so both feed the same mapping pipeline downstream.
 */
export async function parseExcel(file: File): Promise<RawRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, col) => {
    headers[col] = cellToString(cell.value);
  });

  const rows: RawRow[] = [];
  for (let r = 2; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const obj: RawRow = {};
    let hasValue = false;
    row.eachCell({ includeEmpty: false }, (cell, col) => {
      const key = headers[col];
      if (!key) return;
      obj[key] = cellToPrimitive(cell.value);
      hasValue = true;
    });
    if (hasValue) rows.push(obj);
  }
  return rows;
}

/** Flatten an ExcelJS cell value to a string (used for header names). */
function cellToString(value: ExcelJS.CellValue): string {
  return String(cellToPrimitive(value) ?? '').trim();
}

/** Flatten an ExcelJS cell value to a string/number primitive. */
function cellToPrimitive(
  value: ExcelJS.CellValue,
): string | number | null {
  if (value == null) return null;
  if (typeof value === 'number' || typeof value === 'string') return value;
  if (typeof value === 'boolean') return String(value);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  // Rich text, hyperlink, and formula results expose a `text`/`result` field.
  if (typeof value === 'object') {
    const obj = value as unknown as Record<string, unknown>;
    if ('text' in obj && obj.text != null) return String(obj.text);
    if ('result' in obj && obj.result != null) {
      const r = obj.result;
      return typeof r === 'number' || typeof r === 'string' ? r : String(r);
    }
    if ('richText' in obj && Array.isArray(obj.richText)) {
      return obj.richText.map((rt) => (rt as { text: string }).text).join('');
    }
  }
  return String(value);
}
