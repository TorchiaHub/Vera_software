import { useEffect, useRef } from 'react';

/**
 * Custom hook per intervalli precisi
 * Migliore di setInterval nativo per aggiornamenti React
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();

  // Salva la callback più recente
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Setup dell'intervallo
  useEffect(() => {
    if (delay === null) return;

    const tick = () => {
      savedCallback.current?.();
    };

    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}
