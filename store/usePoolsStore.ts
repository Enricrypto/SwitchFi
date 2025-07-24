import { create } from 'zustand';
import {
  FACTORY_ADDRESS as factoryAddress,
  ROUTER_ADDRESS as routerAddress,
  factoryABI,
  pairABI,
  ERC20Abi,
} from '@/constants';
import { Pool } from '../types/interfaces';
import type { PublicClient } from 'viem';

interface PoolsState {
  allPools: Pool[];
  userPools: Pool[];
  isLoadingAllPools: boolean;
  isLoadingUserPools: boolean;
  errorAllPools?: string;
  errorUserPools?: string;

  fetchAllPools: (publicClient: PublicClient) => Promise<void>;
  fetchUserPools: (
    userAddress: `0x${string}`,
    publicClient: PublicClient
  ) => Promise<void>;
}

export const usePoolsStore = create<PoolsState>((set, get) => ({
  allPools: [], // <--- initial empty array
  userPools: [], // <--- initial empty array
  isLoadingAllPools: false, // <--- initial loading state
  isLoadingUserPools: false, // <--- initial loading state
  errorAllPools: undefined, // <--- initial no error
  errorUserPools: undefined, // <--- initial no error

  fetchAllPools: async (publicClient) => {
    if (!publicClient) {
      return;
    }
    set({ isLoadingAllPools: true, errorAllPools: undefined });
    try {
      const pairsLengthBigInt = await publicClient.readContract({
        address: factoryAddress,
        abi: factoryABI,
        functionName: 'allPairsLength',
      });
      const pairsLength = Number(pairsLengthBigInt);

      const allPools: Pool[] = [];

      for (let i = 0; i < pairsLength; i++) {
        try {
          const pairAddress: `0x${string}` = await publicClient.readContract({
            address: factoryAddress,
            abi: factoryABI,
            functionName: 'allPairs',
            args: [BigInt(i)],
          });

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

          const [decA, decB, lpDecimals] = await Promise.all([
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
            publicClient.readContract({
              address: pairAddress,
              abi: ERC20Abi,
              functionName: 'decimals',
            }),
          ]);

          const [res0, res1] = await publicClient.readContract({
            address: pairAddress,
            abi: pairABI,
            functionName: 'getReserves',
          });

          const lpTotalSupply = await publicClient.readContract({
            address: pairAddress,
            abi: ERC20Abi,
            functionName: 'totalSupply',
          });

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

          const [symbolToken0, symbolToken1] = await Promise.all([
            publicClient.readContract({
              address: token0,
              abi: ERC20Abi,
              functionName: 'symbol',
            }),
            publicClient.readContract({
              address: token1,
              abi: ERC20Abi,
              functionName: 'symbol',
            }),
          ]);

          allPools.push({
            index: i,
            pairAddress,
            token0,
            token1,
            decimals0,
            decimals1,
            reserves: [reserve0, reserve1],
            lpTotalSupply: lpTotalSupply as bigint,
            lpDecimals: Number(lpDecimals),
            symbolToken0: symbolToken0 as string,
            symbolToken1: symbolToken1 as string,
            userSharePct: 0,
            userReserve0: BigInt(0),
            userReserve1: BigInt(0),
            balanceLP: BigInt(0),
          });
        } catch (err) {
          console.error(`Error fetching pool ${i}:`, err);
          continue;
        }
      }

      set({ allPools, isLoadingAllPools: false });
    } catch (err) {
      console.error('Error fetching all pools:', err);
      set({
        errorAllPools: 'Failed to fetch all pools',
        isLoadingAllPools: false,
      });
    }
  },

  fetchUserPools: async (userAddress, publicClient) => {
    set({ isLoadingUserPools: true, errorUserPools: undefined });

    try {
      let allPools = get().allPools;
      if (allPools.length === 0) {
        console.warn(
          '[fetchUserPools] No pools loaded. Fetching allPools first.'
        );
        await get().fetchAllPools(publicClient);
        allPools = get().allPools;
      }

      const userPools: Pool[] = [];

      for (const pool of allPools) {
        try {
          const [
            balanceLP,
            symbolToken0,
            symbolToken1,
            allowanceToken0,
            allowanceToken1,
          ] = await Promise.all([
            publicClient.readContract({
              address: pool.pairAddress,
              abi: ERC20Abi,
              functionName: 'balanceOf',
              args: [userAddress],
            }),
            publicClient.readContract({
              address: pool.token0,
              abi: ERC20Abi,
              functionName: 'symbol',
            }),
            publicClient.readContract({
              address: pool.token1,
              abi: ERC20Abi,
              functionName: 'symbol',
            }),
            publicClient.readContract({
              address: pool.token0,
              abi: ERC20Abi,
              functionName: 'allowance',
              args: [userAddress, routerAddress],
            }),
            publicClient.readContract({
              address: pool.token1,
              abi: ERC20Abi,
              functionName: 'allowance',
              args: [userAddress, routerAddress],
            }),
          ]);

          if (balanceLP === BigInt(0)) continue;

          const totalSupply = pool.lpTotalSupply || BigInt(0);

          const share =
            totalSupply === BigInt(0)
              ? BigInt(0)
              : (balanceLP * BigInt(1_000_000)) / totalSupply;

          const amount0 =
            totalSupply === BigInt(0)
              ? BigInt(0)
              : (pool.reserves[0] * balanceLP) / totalSupply;

          const amount1 =
            totalSupply === BigInt(0)
              ? BigInt(0)
              : (pool.reserves[1] * balanceLP) / totalSupply;

          const pct = Number(share) / 10_000;

          userPools.push({
            ...pool,
            balanceLP: balanceLP as bigint,
            userSharePct: pct,
            userReserve0: amount0,
            userReserve1: amount1,
            allowanceToken0: allowanceToken0 as bigint,
            allowanceToken1: allowanceToken1 as bigint,
            symbolToken0: symbolToken0 as string,
            symbolToken1: symbolToken1 as string,
          });
        } catch (err) {
          console.error(
            `Error fetching user data for pool ${pool.index}:`,
            err
          );
          continue;
        }
      }
      set({ userPools, isLoadingUserPools: false });
    } catch (err) {
      console.error('Error fetching user pools:', err);
      set({
        errorUserPools: 'Failed to fetch user pools',
        isLoadingUserPools: false,
      });
    }
  },
}));
