import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import {
  pairABI,
  ERC20Abi,
  ROUTER_ADDRESS as routerAddress,
} from '@/constants';

export function useSelectedPool(
  selectedPair: `0x${string}` | null,
  userAddress: `0x${string}` | undefined
) {
  // Token0 and Token1 addresses
  const { data: tokenAAddress } = useReadContract({
    address: selectedPair ?? undefined,
    abi: pairABI,
    functionName: 'token0',
  });

  const { data: tokenBAddress } = useReadContract({
    address: selectedPair ?? undefined,
    abi: pairABI,
    functionName: 'token1',
  });

  // Token decimals
  const { data: decimalsA } = useReadContract({
    address: tokenAAddress ?? undefined,
    abi: ERC20Abi,
    functionName: 'decimals',
  });

  const { data: decimalsB } = useReadContract({
    address: tokenBAddress ?? undefined,
    abi: ERC20Abi,
    functionName: 'decimals',
  });

  /** ----------------------- Token Symbols ----------------------- */

  const { data: token0Symbol } = useReadContract({
    address: tokenAAddress ?? undefined,
    abi: ERC20Abi,
    functionName: 'symbol',
  });

  const { data: token1Symbol } = useReadContract({
    address: tokenBAddress ?? undefined,
    abi: ERC20Abi,
    functionName: 'symbol',
  });

  // Pool reserves
  const { data: reserves } = useReadContract({
    address: selectedPair ?? undefined,
    abi: pairABI,
    functionName: 'getReserves',
  });

  // Total supply of LP tokens
  const { data: totalSupplyLP } = useReadContract({
    address: selectedPair ?? undefined,
    abi: ERC20Abi,
    functionName: 'totalSupply',
  });

  // Allowance for token0 to router
  const { data: allowanceToken0 } = useReadContract({
    address: tokenAAddress ?? undefined,
    abi: ERC20Abi,
    functionName: 'allowance',
    args: [userAddress!, routerAddress],
  });

  // Allowance for token1 to router
  const { data: allowanceToken1 } = useReadContract({
    address: tokenBAddress ?? undefined,
    abi: ERC20Abi,
    functionName: 'allowance',
    args: [userAddress!, routerAddress],
  });

  // User LP token balance
  const { data: balanceLP } = useReadContract({
    address: selectedPair ?? undefined,
    abi: ERC20Abi,
    functionName: 'balanceOf',
    args: [userAddress!],
  });

  const { data: lpDecimals } = useReadContract({
    address: selectedPair ?? undefined,
    abi: ERC20Abi,
    functionName: 'decimals',
  });

  // States for sorted tokens and reserves (ensuring token0 < token1)
  const [token0, setToken0] = useState<`0x${string}` | null>(null);
  const [token1, setToken1] = useState<`0x${string}` | null>(null);
  const [reservesSorted, setReservesSorted] = useState<[bigint, bigint] | null>(
    null
  );
  const [decimalsToken0, setDecimalsToken0] = useState<number | null>(null);
  const [decimalsToken1, setDecimalsToken1] = useState<number | null>(null);

  useEffect(() => {
    if (tokenAAddress && tokenBAddress && reserves) {
      if (tokenAAddress.toLowerCase() < tokenBAddress.toLowerCase()) {
        setToken0(tokenAAddress as `0x${string}`);
        setToken1(tokenBAddress as `0x${string}`);
        setReservesSorted([reserves[0], reserves[1]]);
      } else {
        setToken0(tokenBAddress as `0x${string}`);
        setToken1(tokenAAddress as `0x${string}`);
        setReservesSorted([reserves[1], reserves[0]]);
      }
    }
  }, [tokenAAddress, tokenBAddress, reserves]);

  useEffect(() => {
    if (decimalsA !== undefined) setDecimalsToken0(decimalsA);
    if (decimalsB !== undefined) setDecimalsToken1(decimalsB);
  }, [decimalsA, decimalsB]);

  return {
    token0,
    token1,
    token0Symbol,
    token1Symbol,
    decimalsToken0,
    decimalsToken1,
    lpDecimals,
    reservesSorted,
    totalSupplyLP,
    allowanceToken0,
    allowanceToken1,
    balanceLP,
  };
}
