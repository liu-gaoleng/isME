import { useState, useCallback, useEffect } from 'react';
import { ApiError } from './client';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

type ApiCall<T> = () => Promise<T>;

export function useApi<T>(apiCall: ApiCall<T>) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : err instanceof Error 
          ? err.message 
          : 'Unknown error';
      
      setState({ data: null, loading: false, error: errorMessage });
      throw err;
    }
  }, [apiCall]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
  };
}

export function useAsyncData<T>(apiCall: ApiCall<T>, deps: unknown[] = []) {
  const { data, loading, error, execute } = useApi(apiCall);

  useEffect(() => {
    execute();
  }, deps);

  return { data, loading, error };
}

export { ApiError };
