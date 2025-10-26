import { useState, useEffect, useCallback } from 'react';

interface UseAsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

interface UseAsyncReturn<T> extends UseAsyncState<T> {
  execute: () => Promise<void>;
  reset: () => void;
}

// Hook for handling async operations with loading/error states
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
): UseAsyncReturn<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    error: null,
    isLoading: immediate,
    isError: false,
    isSuccess: false,
  });

  const execute = useCallback(async () => {
    setState({
      data: null,
      error: null,
      isLoading: true,
      isError: false,
      isSuccess: false,
    });

    try {
      const data = await asyncFunction();
      setState({
        data,
        error: null,
        isLoading: false,
        isError: false,
        isSuccess: true,
      });
    } catch (error) {
      setState({
        data: null,
        error: error as Error,
        isLoading: false,
        isError: true,
        isSuccess: false,
      });
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isError: false,
      isSuccess: false,
    });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    ...state,
    execute,
    reset,
  };
}

export default useAsync;
