import { useState, useEffect, useCallback } from 'react';

/**
 * React hook for database operations
 * Provides a React Query-like API for database calls
 */
export function useDatabase(initialQuery = null, initialParams = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (sql, params = []) => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.api.db.query(sql, params);

      if (result.success) {
        setData(result.data);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const mutate = useCallback(async (sql, params = []) => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.api.db.execute(sql, params);

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-execute initial query if provided
  useEffect(() => {
    if (initialQuery) {
      execute(initialQuery, initialParams);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    execute,
    mutate,
    refetch: () => execute(initialQuery, initialParams),
  };
}

/**
 * Hook to get app version
 */
export function useAppVersion() {
  const [version, setVersion] = useState('');

  useEffect(() => {
    window.api.app.getVersion().then(setVersion);
  }, []);

  return version;
}

/**
 * Hook to get platform
 */
export function usePlatform() {
  const [platform, setPlatform] = useState('');

  useEffect(() => {
    window.api.app.getPlatform().then(setPlatform);
  }, []);

  return platform;
}
