import { useMemo } from 'react';
import { usePoolsStore } from '../store/usePoolsStore';
import { Token } from '../types/interfaces';

/**
 * Hook to get a list of unique tokens that can be swapped with a given token address.
 */
export function useTokensForToken(tokenAddress?: string): Token[] {
  // ───── Fetch global pool data ─────
  const allPools = usePoolsStore((state) => state.allPools);

  // ───── Compute compatible tokens ─────
  return useMemo(() => {
    if (!tokenAddress) return [];

    const tokens: Token[] = [];
    const seenAddresses = new Set<string>();

    for (const pool of allPools) {
      const token0 = pool.token0.toLowerCase();
      const token1 = pool.token1.toLowerCase();
      const input = tokenAddress.toLowerCase();

      // ───── Skip if pool doesn't involve the input token ─────
      if (token0 !== input && token1 !== input) continue;

      // ───── Skip if either reserve is zero ─────
      if (pool.reserves[0] === BigInt(0) || pool.reserves[1] === BigInt(0))
        continue;

      // ───── Determine the other token in the pool ─────
      const otherTokenAddress = token0 === input ? pool.token1 : pool.token0;

      // ───── Avoid duplicates ─────
      if (!seenAddresses.has(otherTokenAddress)) {
        seenAddresses.add(otherTokenAddress);

        const isOtherToken0 = otherTokenAddress.toLowerCase() === token0;

        // ───── Push valid token with metadata ─────
        tokens.push({
          address: otherTokenAddress,
          symbol: isOtherToken0
            ? (pool.symbolToken0 ?? '')
            : (pool.symbolToken1 ?? ''),
          decimals: isOtherToken0
            ? (pool.decimals0 ?? 18)
            : (pool.decimals1 ?? 18),
        });
      }
    }

    // ───── Return list of swappable tokens ─────
    return tokens;
  }, [allPools, tokenAddress]);
}
