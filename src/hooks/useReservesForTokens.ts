import { usePoolsStore } from '../store/usePoolsStore';
import { Address } from 'viem';

// ───── Custom hook to get reserves of a token pair ─────
export function useReservesForTokens(
  tokenIn?: Address, // Input token address (optional)
  tokenOut?: Address // Output token address (optional)
): { reserveIn: bigint; reserveOut: bigint } | null {
  // ───── Fetch all pools from Zustand store ─────
  const allPools = usePoolsStore((state) => state.allPools);

  // ───── Return null if either token is missing ─────
  if (!tokenIn || !tokenOut) return null;

  // ───── Find pool matching the token pair in either order ─────
  const pool = allPools.find(
    (p) =>
      (p.token0.toLowerCase() === tokenIn.toLowerCase() &&
        p.token1.toLowerCase() === tokenOut.toLowerCase()) ||
      (p.token0.toLowerCase() === tokenOut.toLowerCase() &&
        p.token1.toLowerCase() === tokenIn.toLowerCase())
  );

  // ───── Return null if no matching pool found ─────
  if (!pool) return null;

  // ───── Extract reserves from the pool ─────
  const [reserve0, reserve1] = pool.reserves;

  // ───── Align reserves so reserveIn matches tokenIn ─────
  return tokenIn.toLowerCase() === pool.token0.toLowerCase()
    ? { reserveIn: reserve0, reserveOut: reserve1 } // tokenIn is token0
    : { reserveIn: reserve1, reserveOut: reserve0 }; // tokenIn is token1
}
