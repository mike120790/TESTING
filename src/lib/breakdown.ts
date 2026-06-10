/** A single category slice for a chart. */
export interface Slice {
  label: string;
  value: number;
}

/**
 * Group rows by a category and sum a numeric measure, returning slices sorted
 * by value descending. Zero/blank categories are kept (labelled if empty).
 */
export function groupSum<T>(
  rows: T[],
  category: (row: T) => string,
  measure: (row: T) => number,
): Slice[] {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const label = category(row) || '(blank)';
    totals.set(label, (totals.get(label) ?? 0) + measure(row));
  }
  return [...totals.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Collapse a sorted slice list to the top `n`, rolling the remainder into a
 * single "Other" slice. Keeps charts legible when a dimension has a long tail.
 */
export function topN(slices: Slice[], n: number): Slice[] {
  if (slices.length <= n) return slices;
  const head = slices.slice(0, n);
  const rest = slices.slice(n).reduce((sum, s) => sum + s.value, 0);
  if (rest > 0) head.push({ label: 'Other', value: rest });
  return head;
}
