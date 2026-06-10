import { useCallback, useEffect, useState } from 'react';
import type { Position } from '../types/position';
import { activeDataSource } from '../data/dataSource';

export interface PositionsState {
  positions: Position[];
  loading: boolean;
  error: string | null;
  /** Name of the active dataset (sample vs uploaded file). */
  sourceName: string;
  /** Replace the dataset, e.g. after a file import. */
  replacePositions: (positions: Position[], sourceName: string) => void;
  /** Reload the default (sample) dataset. */
  reload: () => void;
}

/**
 * Owns the raw `Position[]`. Loads the default source on mount and exposes a
 * `replacePositions` action used by the file-import flow.
 */
export function usePositions(): PositionsState {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState('Sample portfolio');

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    activeDataSource
      .load()
      .then((data) => {
        setPositions(data);
        setSourceName('Sample portfolio');
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : 'Failed to load data'),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const replacePositions = useCallback(
    (next: Position[], name: string) => {
      setPositions(next);
      setSourceName(name);
      setError(null);
      setLoading(false);
    },
    [],
  );

  return {
    positions,
    loading,
    error,
    sourceName,
    replacePositions,
    reload,
  };
}
