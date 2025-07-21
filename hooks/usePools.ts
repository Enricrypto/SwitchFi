import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { arbitrum } from 'wagmi/chains';
import {
  FACTORY_ADDRESS as factoryAddress,
  factoryABI,
  pairABI,
  ERC20Abi,
} from '@/constants';
import { Pool } from '../types/interfaces';

export function usePools(
  userAddress: `0x${string}` | undefined,
  pairsLength: number
) {
  const publicClient = usePublicClient({ chainId: arbitrum.id });
  const [pools, setPools] = useState<Pool[]>([]);

  useEffect(() => {
    if (!userAddress || !publicClient) return;
    console.log('Client Chain ID:', publicClient.getChainId());

    let isMounted = true;
    const fetchAllPools = async () => {
      try {
        // Fetch the real number of pairs from the factory contract
        const pairsLengthBigInt = await publicClient.readContract({
          address: factoryAddress,
          abi: factoryABI,
          functionName: 'allPairsLength',
        });
        const pairsLength = Number(pairsLengthBigInt);

        console.log('Factory reported pairs length:', pairsLength);
        if (pairsLength === 0) return;

        const allPools: Pool[] = [];

        for (let i = 0; i < pairsLength; i++) {
          try {
            console.log(`Fetching pool index ${i}...`);

            // 1. Get pair address
            const pairAddress: `0x${string}` = await publicClient.readContract({
              address: factoryAddress,
              abi: factoryABI,
              functionName: 'allPairs',
              args: [BigInt(i)],
            });
            console.log(`Pool ${i} pairAddress:`, pairAddress);

            // 2. Get token addresses
            const [tokenA, tokenB] = await Promise.all([
              publicClient.readContract({
                address: pairAddress,
                abi: pairABI,
                functionName: 'token0',
              }),
              publicClient.readContract({
                address: pairAddress,
                abi: pairABI,
                functionName: 'token1',
              }),
            ]);
            console.log(`Pool ${i} tokens:`, tokenA, tokenB);

            // 3. Get decimals
            const [decA, decB] = await Promise.all([
              publicClient.readContract({
                address: tokenA,
                abi: ERC20Abi,
                functionName: 'decimals',
              }),
              publicClient.readContract({
                address: tokenB,
                abi: ERC20Abi,
                functionName: 'decimals',
              }),
            ]);
            console.log(`Pool ${i} decimals:`, decA, decB);

            // 4. Get reserves
            const [res0, res1] = await publicClient.readContract({
              address: pairAddress,
              abi: pairABI,
              functionName: 'getReserves',
            });
            console.log(`Pool ${i} reserves:`, res0, res1);

            // 5. Lexicographic sort
            let token0 = tokenA;
            let token1 = tokenB;
            let reserve0 = res0;
            let reserve1 = res1;
            let decimals0 = decA;
            let decimals1 = decB;

            if (tokenA.toLowerCase() > tokenB.toLowerCase()) {
              [token0, token1] = [tokenB, tokenA];
              [reserve0, reserve1] = [res1, res0];
              [decimals0, decimals1] = [decB, decA];
            }
            console.log(`Pool ${i} sorted tokens:`, token0, token1);

            // 6. Get LP balance & total supply
            const [balanceLP, totalSupply] = await Promise.all([
              publicClient.readContract({
                address: pairAddress,
                abi: ERC20Abi,
                functionName: 'balanceOf',
                args: [userAddress],
              }),
              publicClient.readContract({
                address: pairAddress,
                abi: ERC20Abi,
                functionName: 'totalSupply',
              }),
            ]);
            console.log(
              `Pool ${i} LP balance:`,
              balanceLP.toString(),
              'totalSupply:',
              totalSupply.toString()
            );

            // 7. Compute share and reserve breakdown
            let share: bigint;
            let amount0: bigint;
            let amount1: bigint;

            if (totalSupply === BigInt(0)) {
              share = BigInt(0);
              amount0 = BigInt(0);
              amount1 = BigInt(0);
            } else {
              share = (balanceLP * BigInt(1_000_000)) / totalSupply;
              amount0 = (reserve0 * balanceLP) / totalSupply;
              amount1 = (reserve1 * balanceLP) / totalSupply;
            }

            const pct = Number(share) / 10_000;

            // 8. Push to result array
            allPools.push({
              index: i,
              pairAddress,
              token0,
              token1,
              decimals0,
              decimals1,
              reserves: [reserve0, reserve1],
              userSharePct: pct,
              userReserve0: amount0,
              userReserve1: amount1,
              balanceLP,
            });
            console.log(`Pool ${i} added successfully`);
          } catch (err) {
            console.error(`Error fetching pool index ${i}:`, err);
            continue;
          }
        }
        if (isMounted) {
          setPools(allPools);
        }
      } catch (err) {
        console.error('Error fetching pairs length:', err);
      }
    };

    fetchAllPools();
    return () => {
      isMounted = false;
    };
  }, [userAddress, pairsLength, publicClient]);

  return pools;
}
