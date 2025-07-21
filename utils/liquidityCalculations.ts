// Frontend quote function
export function quote(
  amountA: bigint,
  reserveA: bigint,
  reserveB: bigint
): bigint {
  if (amountA === BigInt(0) || reserveA === BigInt(0) || reserveB === BigInt(0))
    return BigInt(0);
  return (amountA * reserveB) / reserveA;
}

// Frontend _calculateOptimalAmounts function (mirrors smart contract logic)
export function calculateOptimalAmounts(
  amountADesired: bigint,
  amountBDesired: bigint,
  amountAMin: bigint,
  amountBMin: bigint,
  reserveA: bigint,
  reserveB: bigint
): [bigint, bigint] | null {
  if (reserveA === BigInt(0) && reserveB === BigInt(0)) {
    return [amountADesired, amountBDesired];
  }
  const amountBOptimal = quote(amountADesired, reserveA, reserveB);
  if (amountBOptimal <= amountBDesired) {
    if (amountBOptimal < amountBMin) {
      return null;
    }
    return [amountADesired, amountBOptimal];
  } else {
    const amountAOptimal = quote(amountBDesired, reserveB, reserveA);
    if (amountAOptimal > amountADesired || amountAOptimal < amountAMin) {
      return null;
    }
    return [amountAOptimal, amountBDesired];
  }
}
