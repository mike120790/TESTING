import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  // Allow per-column display metadata (e.g. right-aligning numeric columns).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends unknown, TValue> {
    className?: string;
  }
}
