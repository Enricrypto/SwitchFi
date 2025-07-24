export const defaultSlippagePercent = 0.5;

/**
 * Calculate minimum amount after applying slippage.
 * @param amount - The original amount (bigint)
 * @param slippagePercent - Slippage percentage (0.5 means 0.5%), optional defaults to defaultSlippagePercent
 * @returns bigint - minimum acceptable amount after slippage
 */
export function getMinAmountAfterSlippage(
  amount: bigint,
  slippagePercent: number = defaultSlippagePercent
): bigint {
  // Convert slippagePercent to basis points (bps)
  const slippageBps = Math.floor(slippagePercent * 100); // e.g. 0.5% -> 50 bps

  const numerator = BigInt(10_000 - slippageBps); // e.g. 10,000 - 50 = 9,950
  const denominator = BigInt(10_000);

  return (amount * numerator) / denominator;
}
