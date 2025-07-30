import { useState, useEffect } from 'react';

type PriceData = {
  price: number;
  loading: boolean;
  error: string | null;
};

// ───── Hook to fetch token price from Dexscreener ─────
export function useDexPrice(
  chainId: number,
  token0: string,
  token1: string
): PriceData {
  // ───── Local state: price, loading status, and error ─────
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ───── Fetch price data on dependencies change ─────
  useEffect(() => {
    // ───── Early exit if required params missing ─────
    if (!chainId || !token0 || !token1) return;

    setLoading(true);
    setError(null);

    // ───── Build Dexscreener API URL ─────
    const url = `https://api.dexscreener.com/latest/dex/pairs/${chainId}/${token0}/${token1}`;

    // ───── Fetch price data ─────
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        // ───── Validate response data ─────
        if (!data || !data.pair) {
          setError('Invalid data from Dexscreener');
          setLoading(false);
          return;
        }

        // ───── Extract price (token0 in token1/USD) ─────
        const priceNum = parseFloat(data.pair.priceUsd);

        if (isNaN(priceNum)) {
          setError('Price is NaN');
          setLoading(false);
          return;
        }

        // ───── Update price and loading state ─────
        setPrice(priceNum);
        setLoading(false);
      })
      .catch((err) => {
        // ───── Handle fetch errors ─────
        setError(err.message || 'Failed to fetch price');
        setLoading(false);
      });
  }, [chainId, token0, token1]);

  // ───── Return current price, loading status, and error ─────
  return { price, loading, error };
}
