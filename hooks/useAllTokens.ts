import { useMemo } from 'react';
import { usePoolsStore } from '../store/usePoolsStore';
import { Token } from '../types/interfaces';

export function useAllTokens(): Token[] {
  // ───── Subscribe to allPools from global Zustand store ─────
  const allPools = usePoolsStore((state) => state.allPools);

  return useMemo(() => {
    // ───── Map to track unique tokens by address ─────
    const tokenMap = new Map<string, Token>();

    for (const pool of allPools) {
      // ───── Extract reserves or fallback to zero if undefined ─────
      const [reserve0, reserve1] = pool.reserves ?? [BigInt(0), BigInt(0)];

      // ───── Skip pools with no liquidity (both reserves zero) ─────
      if (reserve0 === BigInt(0) && reserve1 === BigInt(0)) continue;

      // ───── Prepare token objects for both tokens in the pool ─────
      const tokens: Token[] = [
        {
          address: pool.token0,
          symbol: pool.symbolToken0 ?? '', // fallback empty string if missing
          decimals: pool.decimals0 ?? 18, // default 18 decimals if missing
        },
        {
          address: pool.token1,
          symbol: pool.symbolToken1 ?? '',
          decimals: pool.decimals1 ?? 18,
        },
      ];

      // ───── Add tokens to the map if not already present to avoid duplicates ─────
      tokens.forEach((t) => {
        if (!tokenMap.has(t.address)) {
          tokenMap.set(t.address, t);
        }
      });
    }

    // ───── Return an array of unique tokens extracted from all pools ─────
    return Array.from(tokenMap.values());
  }, [allPools]); // Recompute only if allPools changes to optimize performance
}
