import { useEffect, useState } from 'react';
import { getAmountOut, getAmountIn } from '../utils/swap';
import { SwapPreviewParams } from '../types/interfaces';

export function useSwapPreview(params: SwapPreviewParams) {
  // ───── State ─────
  const [amountOut, setAmountOut] = useState<bigint>(BigInt(0));
  const [minAmountOut, setMinAmountOut] = useState<bigint>(BigInt(0));
  const [amountIn, setAmountIn] = useState<bigint>(BigInt(0));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { reserveIn, reserveOut, slippageBps = 50 } = params;

  // ───── Effect: Calculate preview amounts ─────
  useEffect(() => {
    setLoading(true);

    try {
      // ───── Reverse mode: calculate amountIn from amountOut ─────
      if (params.reverse) {
        if (
          !params.amountOut ||
          reserveIn === BigInt(0) ||
          reserveOut === BigInt(0)
        ) {
          setError('Missing input or liquidity');
          setAmountIn(BigInt(0));
          setMinAmountOut(BigInt(0));
          setAmountOut(BigInt(0));
          return;
        }

        const calculatedAmountIn = getAmountIn(
          params.amountOut,
          reserveIn,
          reserveOut
        );

        setAmountIn(calculatedAmountIn);
        setMinAmountOut(BigInt(0)); // minAmountOut not used here
        setAmountOut(params.amountOut);
        setError(null);

        // ───── Forward mode: calculate amountOut from amountIn ─────
      } else {
        if (
          !params.amountIn ||
          reserveIn === BigInt(0) ||
          reserveOut === BigInt(0)
        ) {
          setError('Missing input or liquidity');
          setAmountOut(BigInt(0));
          setMinAmountOut(BigInt(0));
          return;
        }

        const out = getAmountOut(params.amountIn, reserveIn, reserveOut);
        const minOut = (out * BigInt(10_000 - slippageBps)) / BigInt(10_000);

        setAmountOut(out);
        setMinAmountOut(minOut);
        setAmountIn(params.amountIn);
        setError(null);
      }
    } catch (e) {
      // ───── Handle internal errors ─────
      console.error('Swap preview error:', e);
      setAmountOut(BigInt(0));
      setMinAmountOut(BigInt(0));
      setAmountIn(BigInt(0));
      setError((e as Error).message);
    }

    setLoading(false);
  }, [params, reserveIn, reserveOut, slippageBps]);

  // ───── Return swap preview values ─────
  return {
    amountOut,
    minAmountOut,
    amountIn,
    loading,
    error,
  };
}
