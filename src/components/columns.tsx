import type { ColumnDef } from '@tanstack/react-table';
import type { Position } from '../types/position';
import {
  fmtCurrency,
  fmtNumber,
  fmtPercent,
  fmtPrice,
  fmtSignedCurrency,
} from '../lib/format';

/** Right-aligned numeric header/cell helper. */
const numMeta = { className: 'num' } as const;

export const positionColumns: ColumnDef<Position>[] = [
  {
    accessorKey: 'account',
    header: 'Account',
    cell: (c) => c.getValue<string>(),
  },
  {
    accessorKey: 'securityName',
    header: 'Security',
    cell: (c) => (
      <div className="sec-cell">
        <span className="sec-name">{c.getValue<string>()}</span>
        <span className="sec-ticker">{c.row.original.ticker}</span>
      </div>
    ),
  },
  {
    accessorKey: 'assetClass',
    header: 'Asset Class',
  },
  {
    accessorKey: 'investmentType',
    header: 'Investment Type',
  },
  {
    accessorKey: 'sector',
    header: 'Sector',
  },
  {
    accessorKey: 'currency',
    header: 'Ccy',
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    meta: numMeta,
    cell: (c) => fmtNumber(c.getValue<number>()),
  },
  {
    accessorKey: 'price',
    header: 'Price',
    meta: numMeta,
    cell: (c) => fmtPrice(c.getValue<number>()),
  },
  {
    accessorKey: 'marketValue',
    header: 'Market Value',
    meta: numMeta,
    cell: (c) => fmtCurrency(c.getValue<number>()),
  },
  {
    accessorKey: 'costBasis',
    header: 'Cost Basis',
    meta: numMeta,
    cell: (c) => fmtCurrency(c.getValue<number>()),
  },
  {
    accessorKey: 'unrealizedPnl',
    header: 'Unrealized P&L',
    meta: numMeta,
    cell: (c) => {
      const v = c.getValue<number>();
      const cls = v > 0 ? 'pnl-pos' : v < 0 ? 'pnl-neg' : '';
      return <span className={cls}>{fmtSignedCurrency(v)}</span>;
    },
  },
  {
    accessorKey: 'unrealizedPnlPct',
    header: 'P&L %',
    meta: numMeta,
    cell: (c) => {
      const v = c.getValue<number>();
      const cls = v > 0 ? 'pnl-pos' : v < 0 ? 'pnl-neg' : '';
      return <span className={cls}>{fmtPercent(v)}</span>;
    },
  },
  {
    accessorKey: 'weightPct',
    header: 'Weight',
    meta: numMeta,
    cell: (c) => fmtPercent(c.getValue<number>()),
  },
];
