import { useCallback, useEffect, useState } from 'react';
import type { DataSource } from '../data/dataSource';

export interface DatasetState<T> {
  rows: T[];
  loading: boolean;
  error: string | null;
  /** Name of the active dataset (sample vs uploaded file). */
  sourceName: string;
  /** Replace the dataset, e.g. after a file import. */
  replace: (rows: T[], sourceName: string) => void;
  /** Reload the default (sample) source. */
  reload: () => void;
}

/**
 * Owns a typed row set. Loads the given default source on mount and exposes a
 * `replace` action used by the file-import flow. Generic so it backs both the
 * positions grid and the trade blotter.
 */
export function useDataset<T>(
  source: DataSource<T>,
  defaultName: string,
): DatasetState<T> {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState(defaultName);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    source
      .load()
      .then((data) => {
        setRows(data);
        setSourceName(defaultName);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : 'Failed to load data'),
      )
      .finally(() => setLoading(false));
  }, [source, defaultName]);

  useEffect(() => {
    reload();
  }, [reload]);

  const replace = useCallback((next: T[], name: string) => {
    setRows(next);
    setSourceName(name);
    setError(null);
    setLoading(false);
  }, []);

  return { rows, loading, error, sourceName, replace, reload };
}
