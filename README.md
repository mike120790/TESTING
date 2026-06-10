# OMS Positions Dashboard

A simplified Order Management System (OMS) style dashboard — a pared-down take on
tools like IVP, Allvue, and Aladdin. It shows portfolio **positions** and trade
**activity** in dense, professional grids and lets you **filter and sort** by
investment type, sector, asset class, account, side, status, and more.

Built with **React + Vite + TypeScript**. Frontend-only — no server required.

## Features

- **Two views** — switch between **Positions** (current holdings) and **Activity**
  (the trade blotter) from the tabs in the header.
- **Dense, sortable grids** — click any column header to sort; right-aligned
  numerics, red/green unrealized P&L, and color-coded trade side / status badges.
- **Faceted filters** — left sidebar with checkbox groups (live value counts) per
  dimension: Account, Asset Class, Investment Type, Sector, Currency for positions;
  Account, Side, Asset Class, Order Type, Status, Currency for activity. Selections
  combine with OR within a dimension and AND across dimensions.
- **Global search** — substring match over name, ticker, identifier (and
  trader/broker on the activity view).
- **Live summary** — KPI strip recomputed over the currently filtered rows:
  market value / cost / unrealized P&L for positions; trade count, buy & sell
  notional, net, commission, and fill rate for activity.
- **Allocation charts** — a collapsible panel of donut and bar breakdowns that
  also respond to filters: allocation by asset class / account / sector for
  positions; notional by side / asset class and trades by status for activity.
  Rendered as lightweight inline SVG (no charting dependency).
- **CSV / Excel import** — drop in your own position or trade export. Known column
  headers are auto-detected; otherwise a column-mapping dialog lets you match your
  columns to dashboard fields. The active view determines which export is expected.

## Getting started

```bash
npm install
npm run dev      # start the dev server (prints a local URL)
```

Then open the printed URL. The app loads built-in sample data so it works
immediately: a portfolio of ~45 holdings (`public/data/sample-positions.csv`) and
a blotter of ~38 trades (`public/data/sample-trades.csv`), both spanning 4
accounts and several asset classes.

```bash
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build locally
npm run typecheck  # fast type-only check
```

## Using your own data

Switch to the view you want to load (Positions or Activity), click **Import** in
the toolbar, and select a `.csv`, `.xlsx`, or `.xls` file. Columns with
recognizable headers (e.g. `Market Value`, `Trade Date`, `Side`, `Ticker`) are
mapped automatically; anything unmatched can be assigned in the column-map dialog.
Derived fields (position P&L / weight, trade gross / net amounts) are computed when
not supplied.

- **Positions** require Security Name, Quantity, Price.
- **Trades** require Trade Date, Security Name, Side, Quantity, Price.

## Architecture

The grid, faceted-filter, and CSV/Excel import machinery are all **generic over the
row type**, so the Positions and Activity views are two configurations of the same
engine rather than duplicated code. Each view supplies a `MappingSpec` (how to
ingest a file) and a small view config (facets, search fields, columns).

```
src/
  types/        position.ts, trade.ts        Domain models + enums
  data/
    dataSource.ts     DataSource<T> seam + sample sources + generic import flow
    mappingSpec.ts    MappingSpec<T>: aliases, auto-detect, required-field checks
    columnMapping.ts  positionSpec (Position ingestion)
    tradeMapping.ts   tradeSpec (Trade ingestion)
    csvParser.ts      PapaParse  -> RawRow[]
    excelParser.ts    ExcelJS    -> RawRow[]   (code-split, loaded on demand)
    normalize.ts      Number coercion, derived position fields
  state/
    useDataset.ts     Owns a typed row set; loads its source on mount (generic)
    useFilters.ts     Generic faceted filter + search engine
    facets.ts         Distinct values + counts per field (generic)
  components/          DashboardView (per-view shell), DataGrid, FilterSidebar,
                      FacetGroup, Toolbar, FileImport, ColumnMapDialog,
                      SummaryHeader (Position/Trade summaries), columns, tradeColumns
  viewConfig.ts       Facet defs + search fields per view
```

To connect a real backend later, implement `DataSource.load()` in
`src/data/dataSource.ts` (e.g. `positionsDataSource`) and point it at your API or
database — nothing else needs to change.

## Tech

- [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- [TanStack Table v8](https://tanstack.com/table) — headless grid, sorting
- [PapaParse](https://www.papaparse.com/) — CSV parsing
- [ExcelJS](https://github.com/exceljs/exceljs) — Excel parsing
