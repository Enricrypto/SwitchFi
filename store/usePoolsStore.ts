import { create } from 'zustand';
import {
  FACTORY_ADDRESS as factoryAddress,
  ROUTER_ADDRESS as routerAddress,
  factoryABI,
  pairABI,
  ERC20Abi,
} from '@/constants';
import { getContract, PublicClient } from 'viem';
import { publicClient } from '@/clients/viemClient';
import { Pool, PoolsState } from '../types/interfaces';

// ───── Zustand store for pools ─────
export const usePoolsStore = create<PoolsState>((set, get) => ({
  allPools: [],
  userPools: [],
  isLoadingAllPools: false,
  isLoadingUserPools: false,
  errorAllPools: undefined,
  errorUserPools: undefined,

  // ───── Fetch all pools ─────
  fetchAllPools: async () => {
    set({ isLoadingAllPools: true, errorAllPools: undefined });

    try {
      // --- Refactor 1: Use getContract instead of raw readContract ---
      const factoryContract = getContract({
        address: factoryAddress,
        abi: factoryABI,
        client: publicClient,
      });

      const pairsLength = Number(await factoryContract.read.allPairsLength());

      const allPools: Pool[] = [];

      // --- Refactor 2: Loop through all pairs using getContract ---
      for (let i = 0; i < pairsLength; i++) {
        try {
          const pairAddress: `0x${string}` =
            await factoryContract.read.allPairs([BigInt(i)]);

          const pairContract = getContract({
            address: pairAddress,
            abi: pairABI,
            client: publicClient,
          });

          // --- Refactor 3: Fetch token addresses, reserves, LP supply concurrently ---
          const [tokenA, tokenB, reserves, lpTotalSupply, lpDecimals] =
            await Promise.all([
              pairContract.read.token0(),
              pairContract.read.token1(),
              pairContract.read.getReserves(),
              pairContract.read.totalSupply(),
              pairContract.read.decimals(),
            ]);

          // --- Refactor 4: Create ERC20 contracts for token metadata ---
          const token0Contract = getContract({
            address: tokenA,
            abi: ERC20Abi,
            client: publicClient,
          });
          const token1Contract = getContract({
            address: tokenB,
            abi: ERC20Abi,
            client: publicClient,
          });

          const [decA, decB, symbolToken0, symbolToken1] = await Promise.all([
            token0Contract.read.decimals(),
            token1Contract.read.decimals(),
            token0Contract.read.symbol(),
            token1Contract.read.symbol(),
          ]);

          // --- Refactor 5: Normalize token order ---
          let token0 = tokenA,
            token1 = tokenB;
          let reserve0 = reserves[0],
            reserve1 = reserves[1];
          let decimals0 = decA,
            decimals1 = decB;

          if (tokenA.toLowerCase() > tokenB.toLowerCase()) {
            [token0, token1] = [tokenB, tokenA];
            [reserve0, reserve1] = [reserves[1], reserves[0]];
            [decimals0, decimals1] = [decB, decA];
          }

          allPools.push({
            index: i,
            pairAddress,
            token0,
            token1,
            decimals0,
            decimals1,
            reserves: [reserve0, reserve1],
            lpTotalSupply,
            lpDecimals: Number(lpDecimals),
            symbolToken0,
            symbolToken1,
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

  // ───── Fetch user-specific pools ─────
  fetchUserPools: async (userAddress, publicClient: PublicClient) => {
    set({ isLoadingUserPools: true, errorUserPools: undefined });

    try {
      let allPools = get().allPools;
      if (!allPools.length) {
        await get().fetchAllPools(publicClient);
        allPools = get().allPools;
      }

      const userPools: Pool[] = [];

      for (const pool of allPools) {
        try {
          const pairContract = getContract({
            address: pool.pairAddress,
            abi: ERC20Abi,
            client: publicClient,
          });
          const token0Contract = getContract({
            address: pool.token0,
            abi: ERC20Abi,
            client: publicClient,
          });
          const token1Contract = getContract({
            address: pool.token1,
            abi: ERC20Abi,
            client: publicClient,
          });

          const [balanceLP, allowanceToken0, allowanceToken1] =
            await Promise.all([
              pairContract.read.balanceOf([userAddress]),
              token0Contract.read.allowance([userAddress, routerAddress]),
              token1Contract.read.allowance([userAddress, routerAddress]),
            ]);

          const totalSupply = pool.lpTotalSupply || BigInt(0);
          const balance = balanceLP || BigInt(0);
          const userSharePct =
            totalSupply === BigInt(0)
              ? 0
              : Number((balance * BigInt(1_000_000)) / totalSupply) / 10_000;
          const userReserve0 =
            totalSupply === BigInt(0)
              ? BigInt(0)
              : (pool.reserves[0] * balance) / totalSupply;
          const userReserve1 =
            totalSupply === BigInt(0)
              ? BigInt(0)
              : (pool.reserves[1] * balance) / totalSupply;

          userPools.push({
            ...pool,
            balanceLP,
            userSharePct: userSharePct / 100,
            userReserve0,
            userReserve1,
            allowanceToken0,
            allowanceToken1,
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
