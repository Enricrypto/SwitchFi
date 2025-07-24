import { useState, useEffect } from 'react';

type PriceData = {
  price: number;
  loading: boolean;
  error: string | null;
};

export function useDexPrice(
  chainId: number,
  token0: string,
  token1: string
): PriceData {
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chainId || !token0 || !token1) return;

    setLoading(true);
    setError(null);

    const url = `https://api.dexscreener.com/latest/dex/pairs/${chainId}/${token0}/${token1}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data || !data.pair) {
          setError('Invalid data from Dexscreener');
          setLoading(false);
          return;
        }

        // Extract price of token0 in terms of token1 (or USD)
        const priceNum = parseFloat(data.pair.priceUsd);

        if (isNaN(priceNum)) {
          setError('Price is NaN');
          setLoading(false);
          return;
        }

        setPrice(priceNum);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch price');
        setLoading(false);
      });
  }, [chainId, token0, token1]);

  return { price, loading, error };
}
