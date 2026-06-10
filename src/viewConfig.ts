import type { Position } from './types/position';
import type { Trade } from './types/trade';
import type { FacetDef } from './state/useFilters';

/** Facet dimensions and searchable fields for the positions view. */
export const POSITION_FACETS: FacetDef<Position>[] = [
  { key: 'account', label: 'Account' },
  { key: 'assetClass', label: 'Asset Class' },
  { key: 'investmentType', label: 'Investment Type' },
  { key: 'sector', label: 'Sector' },
  { key: 'currency', label: 'Currency' },
];

export const POSITION_SEARCH_FIELDS: (keyof Position)[] = [
  'securityName',
  'ticker',
  'identifier',
];

/** Facet dimensions and searchable fields for the activity (trade) view. */
export const TRADE_FACETS: FacetDef<Trade>[] = [
  { key: 'account', label: 'Account' },
  { key: 'side', label: 'Side' },
  { key: 'assetClass', label: 'Asset Class' },
  { key: 'orderType', label: 'Order Type' },
  { key: 'status', label: 'Status' },
  { key: 'currency', label: 'Currency' },
];

export const TRADE_SEARCH_FIELDS: (keyof Trade)[] = [
  'securityName',
  'ticker',
  'trader',
  'broker',
];
