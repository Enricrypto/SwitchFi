// ───── Zustand store for managing pools data ─────
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
  allPools: Pool[]; // All pools available in the factory
  userPools: Pool[]; // Pools the user has liquidity in
  isLoadingAllPools: boolean; // Loading state for all pools fetch
  isLoadingUserPools: boolean; // Loading state for user pools fetch
  errorAllPools?: string; // Error message if fetching all pools fails
  errorUserPools?: string; // Error message if fetching user pools fails

  // Fetch all pools from the factory contract
  fetchAllPools: (publicClient: PublicClient) => Promise<void>;
  // Fetch user's pools and liquidity data
  fetchUserPools: (
    userAddress: `0x${string}`,
    publicClient: PublicClient
  ) => Promise<void>;
}

// ───── Create Zustand store for pools ─────
export const usePoolsStore = create<PoolsState>((set, get) => ({
  allPools: [], // Initially no pools loaded
  userPools: [], // Initially no user pools loaded
  isLoadingAllPools: false, // Initially not loading all pools
  isLoadingUserPools: false, // Initially not loading user pools
  errorAllPools: undefined, // Initially no error for all pools
  errorUserPools: undefined, // Initially no error for user pools

  // ───── Fetch all pools from the factory ─────
  fetchAllPools: async (publicClient) => {
    if (!publicClient) {
      // If no public client is provided, just return early
      return;
    }
    // Set loading state and reset error
    set({ isLoadingAllPools: true, errorAllPools: undefined });

    try {
      // Read total number of pairs from factory contract
      const pairsLengthBigInt = await publicClient.readContract({
        address: factoryAddress,
        abi: factoryABI,
        functionName: 'allPairsLength',
      });
      const pairsLength = Number(pairsLengthBigInt);

      const allPools: Pool[] = [];

      // Iterate over all pairs to fetch details
      for (let i = 0; i < pairsLength; i++) {
        try {
          // Get pair address at index i
          const pairAddress: `0x${string}` = await publicClient.readContract({
            address: factoryAddress,
            abi: factoryABI,
            functionName: 'allPairs',
            args: [BigInt(i)],
          });

          // Fetch tokens of the pair concurrently
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

          // Fetch decimals for tokens and LP token
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

          // Fetch reserves from pair contract
          const [res0, res1] = await publicClient.readContract({
            address: pairAddress,
            abi: pairABI,
            functionName: 'getReserves',
          });

          // Fetch total LP supply
          const lpTotalSupply = await publicClient.readContract({
            address: pairAddress,
            abi: ERC20Abi,
            functionName: 'totalSupply',
          });

          // Normalize token order by address lexicographic sorting
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

          // Fetch token symbols concurrently
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

          // Add pool data to allPools array
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
            userSharePct: 0, // Default user share 0 for all pools
            userReserve0: BigInt(0), // User reserves 0 initially
            userReserve1: BigInt(0),
            balanceLP: BigInt(0), // User LP token balance 0 initially
          });
        } catch (err) {
          // Log error fetching this pool but continue with others
          console.error(`Error fetching pool ${i}:`, err);
          continue;
        }
      }

      // Update state with all fetched pools and reset loading
      set({ allPools, isLoadingAllPools: false });
    } catch (err) {
      // Log error and update error state for all pools
      console.error('Error fetching all pools:', err);
      set({
        errorAllPools: 'Failed to fetch all pools',
        isLoadingAllPools: false,
      });
    }
  },

  // ───── Fetch user-specific pool data ─────
  fetchUserPools: async (userAddress, publicClient) => {
    set({ isLoadingUserPools: true, errorUserPools: undefined });

    try {
      // Get current allPools from store
      let allPools = get().allPools;

      // If allPools not loaded yet, fetch them first
      if (allPools.length === 0) {
        console.warn(
          '[fetchUserPools] No pools loaded. Fetching allPools first.'
        );
        await get().fetchAllPools(publicClient);
        allPools = get().allPools;
      }

      const userPools: Pool[] = [];

      // Iterate through all pools to fetch user-specific data
      for (const pool of allPools) {
        try {
          // Fetch user LP balance, symbols, and allowances concurrently
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

          const totalSupply = pool.lpTotalSupply || BigInt(0);
          const balance = balanceLP || BigInt(0);

          // Calculate user's share % of LP tokens (scaled to percentage)
          const userSharePct =
            totalSupply === BigInt(0)
              ? 0
              : Number((balance * BigInt(1_000_000)) / totalSupply) / 10_000;

          // Calculate user's token reserves proportional to LP balance
          const userReserve0 =
            totalSupply === BigInt(0)
              ? BigInt(0)
              : (pool.reserves[0] * balance) / totalSupply;

          const userReserve1 =
            totalSupply === BigInt(0)
              ? BigInt(0)
              : (pool.reserves[1] * balance) / totalSupply;

          // Convert share percent to fraction for easier use
          const pct = Number(userSharePct) / 100;

          // Add user-specific data merged with pool data
          userPools.push({
            ...pool,
            balanceLP: balanceLP as bigint,
            userSharePct: pct,
            userReserve0: userReserve0 as bigint,
            userReserve1: userReserve1 as bigint,
            allowanceToken0: allowanceToken0 as bigint,
            allowanceToken1: allowanceToken1 as bigint,
            symbolToken0: symbolToken0 as string,
            symbolToken1: symbolToken1 as string,
          });
        } catch (err) {
          // Log error fetching user data but continue processing other pools
          console.error(
            `Error fetching user data for pool ${pool.index}:`,
            err
          );
          continue;
        }
      }
      // Update userPools in store and reset loading state
      set({ userPools, isLoadingUserPools: false });
    } catch (err) {
      // Log error and update error state for user pools
      console.error('Error fetching user pools:', err);
      set({
        errorUserPools: 'Failed to fetch user pools',
        isLoadingUserPools: false,
      });
    }
  },
}));
