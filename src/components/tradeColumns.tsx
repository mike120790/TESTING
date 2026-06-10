import type { ColumnDef } from '@tanstack/react-table';
import type { Trade } from '../types/trade';
import { fmtCurrency, fmtDate, fmtNumber, fmtPrice } from '../lib/format';

const numMeta = { className: 'num' } as const;

/** Lower-cased, hyphen-safe class suffix for a status/side value. */
const slug = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, '-');

export const tradeColumns: ColumnDef<Trade>[] = [
  {
    accessorKey: 'tradeDate',
    header: 'Trade Date',
    cell: (c) => fmtDate(c.getValue<string>()),
  },
  {
    accessorKey: 'account',
    header: 'Account',
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
    accessorKey: 'side',
    header: 'Side',
    cell: (c) => {
      const v = c.getValue<string>();
      return <span className={`side side-${slug(v)}`}>{v}</span>;
    },
  },
  {
    accessorKey: 'assetClass',
    header: 'Asset Class',
  },
  {
    accessorKey: 'orderType',
    header: 'Order',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (c) => {
      const v = c.getValue<string>();
      return <span className={`status status-${slug(v)}`}>{v}</span>;
    },
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
    accessorKey: 'grossAmount',
    header: 'Gross Amount',
    meta: numMeta,
    cell: (c) => fmtCurrency(c.getValue<number>()),
  },
  {
    accessorKey: 'commission',
    header: 'Commission',
    meta: numMeta,
    cell: (c) => fmtCurrency(c.getValue<number>()),
  },
  {
    accessorKey: 'netAmount',
    header: 'Net Amount',
    meta: numMeta,
    cell: (c) => fmtCurrency(c.getValue<number>()),
  },
  {
    accessorKey: 'currency',
    header: 'Ccy',
  },
  {
    accessorKey: 'broker',
    header: 'Broker',
    cell: (c) => c.getValue<string>() ?? '—',
  },
];
