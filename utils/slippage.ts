export const SLIPPAGE_PERCENT = 0.5;

/**
 * Returns the minimum amount after slippage is applied.
 * Slippage is subtracted (e.g. 0.5% becomes 99.5% of original amount).
 */
export const getSlippageBounds = (amount: bigint): bigint => {
  const slippageNumerator = BigInt(
    Math.floor((100 - SLIPPAGE_PERCENT) * 10000)
  );
  const slippageDenominator = BigInt(10000 * 100);
  return (amount * slippageNumerator) / slippageDenominator;
};
