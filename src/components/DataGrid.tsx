import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';

interface Props<T> {
  rows: T[];
  columns: ColumnDef<T>[];
  initialSort: SortingState;
  emptyMessage?: string;
}

/**
 * Dense, sortable grid shared by the positions and activity views. Faceting and
 * search happen upstream (the `rows` are already filtered); this component owns
 * only column sorting. Header click cycles asc -> desc -> none.
 */
export function DataGrid<T>({
  rows,
  columns,
  initialSort,
  emptyMessage = 'No rows match the current filters.',
}: Props<T>) {
  const [sorting, setSorting] = useState<SortingState>(initialSort);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="grid-wrap">
      <table className="positions-grid">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                const meta = header.column.columnDef.meta;
                return (
                  <th
                    key={header.id}
                    className={meta?.className}
                    onClick={header.column.getToggleSortingHandler()}
                    aria-sort={
                      sorted === 'asc'
                        ? 'ascending'
                        : sorted === 'desc'
                          ? 'descending'
                          : 'none'
                    }
                  >
                    <span className="th-inner">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      <span className="sort-ind">
                        {sorted === 'asc' ? '▲' : sorted === 'desc' ? '▼' : ''}
                      </span>
                    </span>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => {
                const meta = cell.column.columnDef.meta;
                return (
                  <td key={cell.id} className={meta?.className}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td className="empty" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
