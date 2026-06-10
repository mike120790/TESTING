# OMS Positions Dashboard

A simplified Order Management System (OMS) style dashboard — a pared-down take on
tools like IVP, Allvue, and Aladdin. It shows portfolio **positions** in a dense,
professional grid and lets you **filter and sort** by investment type, sector,
asset class, account, and currency.

Built with **React + Vite + TypeScript**. Frontend-only — no server required.

## Features

- **Positions grid** — dense, sortable table (click any column header to sort)
  with right-aligned numerics and red/green unrealized P&L.
- **Faceted filters** — left sidebar with checkbox groups for Account, Asset
  Class, Investment Type, Sector, and Currency, each showing live value counts.
  Selections combine with OR within a dimension and AND across dimensions.
- **Global search** — substring match over security name, ticker, and identifier.
- **Live summary** — total market value, cost basis, unrealized P&L (and %),
  position and account counts, all recomputed over the currently filtered rows.
- **CSV / Excel import** — drop in your own position export. Known column headers
  are auto-detected; otherwise a column-mapping dialog lets you match your columns
  to dashboard fields.

## Getting started

```bash
npm install
npm run dev      # start the dev server (prints a local URL)
```

Then open the printed URL. The app loads a built-in sample portfolio
(`public/data/sample-positions.csv`, ~45 holdings across 4 accounts and several
asset classes) so it works immediately.

```bash
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build locally
npm run typecheck  # fast type-only check
```

## Using your own data

Click **Import CSV / Excel** in the toolbar and select a `.csv`, `.xlsx`, or
`.xls` file. Columns with recognizable headers (e.g. `Market Value`, `Cost
Basis`, `Ticker`) are mapped automatically; anything unmatched can be assigned in
the dialog. Required fields are **Security Name**, **Quantity**, and **Price** —
market value, P&L, and portfolio weight are derived when not supplied.

## Architecture

The data ingestion layer is isolated behind a single seam so the source can be
swapped without touching the UI:

```
src/
  types/position.ts        Position model, asset-class/investment-type enums, facet keys
  data/
    dataSource.ts          DataSource interface + active source (swap here for an API/DB)
    csvParser.ts           PapaParse wrapper  -> RawRow[]
    excelParser.ts         SheetJS wrapper    -> RawRow[]
    columnMapping.ts       Header aliases, auto-mapping, RawRow -> Position
    normalize.ts           Number coercion, derived P&L / weight
  state/
    usePositions.ts        Owns the raw Position[]; loads default source on mount
    useFilters.ts          Facet + search state, memoized filtered rows
    facets.ts              Distinct values + counts per dimension
  components/              SummaryHeader, Toolbar, FilterSidebar, FacetGroup,
                           PositionsGrid, columns, FileImport, ColumnMapDialog
```

To connect a real backend later, implement `DataSource.load()` in
`src/data/dataSource.ts` and point `activeDataSource` at it — nothing else needs
to change.

## Tech

- [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- [TanStack Table v8](https://tanstack.com/table) — headless grid, sorting
- [PapaParse](https://www.papaparse.com/) — CSV parsing
- [ExcelJS](https://github.com/exceljs/exceljs) — Excel parsing
