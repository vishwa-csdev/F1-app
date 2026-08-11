import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Polls a fetch function at a given interval.
 * Cleanly starts/stops on mount/unmount or when `enabled` changes.
 */
export function usePolling(fetchFn, intervalMs = 8000, enabled = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const fetchRef = useRef(fetchFn);

  // Keep fetchFn ref current without re-creating the effect
  useEffect(() => {
    fetchRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function doFetch() {
      try {
        const result = await fetchRef.current();
        if (!cancelled) {
          setData(result);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    // Initial fetch
    doFetch();

    // Set up polling
    intervalRef.current = setInterval(doFetch, intervalMs);

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [intervalMs, enabled]);

  return { data, loading, error };
}

/**
 * One-shot fetch with loading/error state. Re-fetches when deps change.
 */
export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchFn()
      .then(result => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return { data, loading, error };
}
