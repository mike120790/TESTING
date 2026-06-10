/** Categorical palette for charts; tuned to read well on the dark theme. */
export const PALETTE = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#84cc16',
  '#06b6d4',
  '#a855f7',
  '#eab308',
];

export function colorAt(index: number): string {
  return PALETTE[index % PALETTE.length];
}
