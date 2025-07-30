export const defaultSlippagePercent = 0.5; // Default slippage tolerance percentage (0.5%)

/**
 * Calculate the minimum acceptable amount after applying slippage tolerance.
 *
 * This function reduces the input amount by the slippage percentage to
 * determine the minimum amount that can be accepted after price impact/slippage.
 *
 * @param amount - The original amount in raw units (bigint)
 * @param slippagePercent - Slippage tolerance percentage (e.g., 0.5 means 0.5%), optional, defaults to defaultSlippagePercent
 * @returns bigint - The minimum acceptable amount after slippage adjustment
 */
export function getMinAmountAfterSlippage(
  amount: bigint,
  slippagePercent: number = defaultSlippagePercent
): bigint {
  // Convert slippage percentage into basis points (bps) for integer math
  // Example: 0.5% -> 50 bps
  const slippageBps = Math.floor(slippagePercent * 100);

  // Calculate numerator as (10000 - slippageBps), where 10000 = 100% in bps
  // For 0.5% slippage, numerator = 9950
  const numerator = BigInt(10_000 - slippageBps);

  // Denominator is fixed at 10,000 basis points (100%)
  const denominator = BigInt(10_000);

  // Return the amount reduced by slippage percentage
  // Using integer math to avoid floating point inaccuracies
  return (amount * numerator) / denominator;
}
