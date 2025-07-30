/**
 * Calculates the amount of output tokens received given an input amount and pool reserves,
 * factoring in a 0.3% trading fee.
 *
 * @param amountIn - The input token amount (raw bigint).
 * @param reserveIn - The reserve of the input token in the pool.
 * @param reserveOut - The reserve of the output token in the pool.
 * @returns The output token amount (raw bigint) after swap fees.
 */
export function getAmountOut(
  amountIn: bigint,
  reserveIn: bigint,
  reserveOut: bigint
): bigint {
  // Return zero if any input is zero to avoid division by zero or invalid swaps
  if (
    amountIn === BigInt(0) ||
    reserveIn === BigInt(0) ||
    reserveOut === BigInt(0)
  ) {
    return BigInt(0);
  }

  // Apply 0.3% fee by multiplying input amount by 997 (out of 1000)
  const amountInWithFee = amountIn * BigInt(997);

  // Calculate numerator and denominator for the Uniswap formula
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * BigInt(1000) + amountInWithFee;

  // Return the final output amount after swap fee deduction
  return numerator / denominator;
}

/**
 * Calculates the minimum input token amount required to receive a desired output amount,
 * factoring in a 0.3% trading fee.
 *
 * @param amountOut - The desired output token amount (raw bigint).
 * @param reserveIn - The reserve of the input token in the pool.
 * @param reserveOut - The reserve of the output token in the pool.
 * @returns The minimum input token amount (raw bigint) required for the swap.
 * @throws Throws an error if the desired output exceeds available reserves.
 */
export function getAmountIn(
  amountOut: bigint,
  reserveIn: bigint,
  reserveOut: bigint
): bigint {
  // Check for sufficient liquidity before proceeding
  if (amountOut >= reserveOut) throw new Error('Insufficient liquidity');

  // Calculate numerator and denominator per Uniswap formula accounting for fees
  const numerator = reserveIn * amountOut * BigInt(1000);
  const denominator = (reserveOut - amountOut) * BigInt(997);

  // Add 1 to round up to the next integer to ensure enough input amount is provided
  return numerator / denominator + BigInt(1);
}
