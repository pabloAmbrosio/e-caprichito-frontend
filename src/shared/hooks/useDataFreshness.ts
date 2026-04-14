import { useEffect, useState } from 'react';

export type FreshnessState = 'fresh' | 'stale';

interface UseDataFreshnessOptions {
  /** Timestamp (epoch ms) cuando los datos fueron generados en el servidor */
  generatedAt: number;
  /** Cuántos ms tienen que pasar para considerar los datos viejos */
  staleAfterMs: number;
  /** Cada cuántos ms re-evaluar (default: 30000 = 30s) */
  checkIntervalMs?: number;
}

export function useDataFreshness({
  generatedAt,
  staleAfterMs,
  checkIntervalMs = 30_000,
}: UseDataFreshnessOptions): FreshnessState {
  const [state, setState] = useState<FreshnessState>(() =>
    Date.now() - generatedAt > staleAfterMs ? 'stale' : 'fresh',
  );

  useEffect(() => {
    const evaluate = () => {
      setState(Date.now() - generatedAt > staleAfterMs ? 'stale' : 'fresh');
    };
    evaluate();
    const id = setInterval(evaluate, checkIntervalMs);
    return () => clearInterval(id);
  }, [generatedAt, staleAfterMs, checkIntervalMs]);

  return state;
}
