'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useAccount, usePublicClient } from 'wagmi';
import { arbitrum } from 'wagmi/chains';
import Header from '../ui/Header';
import Spinner from '../ui/Spinner';
import AddLiquidityModal from '../modals/addLiquidityModal';
import RemoveLiquidityModal from '../modals/removeLiquidityModal';
import { usePoolsStore } from '../../store/usePoolsStore';
import { getSlippageBounds } from '../../utils/slippage';
import { validateOptimalAmounts, approveIfNeeded } from '../../utils/liquidity';
import { parseUnits } from 'viem/utils';
import {
  ROUTER_ADDRESS as routerAddress,
  routerABI,
  ERC20Abi,
  MAX_UINT256,
} from '@/constants';
import { PoolListContainerProps } from '../../types/interfaces';

const PoolListContainer = ({
  pools,
  ListComponent,
  fetchOnMount = true,
  isLoading,
}: PoolListContainerProps) => {
  const { writeContractAsync } = useWriteContract();

  const fetchAllPools = usePoolsStore((state) => state.fetchAllPools);
  const fetchUserPools = usePoolsStore((state) => state.fetchUserPools);
  const isLoadingAllPools = usePoolsStore((state) => state.isLoadingAllPools);
  const userPools = usePoolsStore((state) => state.userPools);

  const { address: userAddress, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: arbitrum.id });

  const [selectedPair, setSelectedPair] = useState<`0x${string}` | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [liquidityWarning, setLiquidityWarning] = useState<string | null>(null);

  const selectedPool = pools.find((p) => p.pairAddress === selectedPair);

  useEffect(() => {
    if (!fetchOnMount) return;
    if (!publicClient || !isConnected || !userAddress) return;
    fetchAllPools(publicClient);
    fetchUserPools(userAddress, publicClient);
  }, [
    publicClient,
    isConnected,
    userAddress,
    fetchAllPools,
    fetchUserPools,
    fetchOnMount,
  ]);

  /** ----------------------- Add Liquidity Handler ---------------------- */
  const handleAddLiquidity = async (
    amountToken0Desired: string,
    amountToken1Desired: string
  ): Promise<boolean> => {
    if (!userAddress) {
      console.error('Wallet not connected');
      return false;
    }
    if (!publicClient) return false;
    if (!selectedPair) return false;

    const selectedPool = userPools.find(
      (p) => p.pairAddress.toLowerCase() === selectedPair?.toLowerCase()
    );

    if (!selectedPool) {
      console.error('No selected pool found');
      return false;
    }

    const {
      token0,
      token1,
      decimals0,
      decimals1,
      reserves,
      allowanceToken0,
      allowanceToken1,
    } = selectedPool;
    if (
      decimals0 === null ||
      decimals1 === null ||
      token0 === null ||
      token1 === null ||
      reserves === null
    ) {
      console.error('Token decimals or reserves not loaded yet');
      return false;
    }

    try {
      const parsedAmount0 = parseUnits(amountToken0Desired, decimals0);
      const parsedAmount1 = parseUnits(amountToken1Desired, decimals1);

      const amount0Min = getSlippageBounds(parsedAmount0);
      const amount1Min = getSlippageBounds(parsedAmount1);

      // Validate the ratio is balanced
      const optimalAmounts = validateOptimalAmounts(
        parsedAmount0,
        parsedAmount1,
        amount0Min,
        amount1Min,
        reserves[0],
        reserves[1]
      );

      if (!optimalAmounts) {
        setLiquidityWarning(
          'The token amounts are too imbalanced to maintain the pool ratio. Please adjust them.'
        );
        return false;
      }

      const [optimal0, optimal1] = optimalAmounts;
      if (optimal0 !== parsedAmount0 || optimal1 !== parsedAmount1) {
        setLiquidityWarning(
          'The token amounts you entered are not in the correct ratio. Please adjust them to match the pool balance.'
        );
        return false;
      }
      setLiquidityWarning(null);

      // Approve tokens if needed
      await approveIfNeeded(
        token0,
        allowanceToken0!,
        parsedAmount0,
        writeContractAsync,
        routerAddress
      );
      await approveIfNeeded(
        token1,
        allowanceToken1!,
        parsedAmount1,
        writeContractAsync,
        routerAddress
      );

      // Add liquidity on-chain
      const txHash = await writeContractAsync({
        address: routerAddress,
        abi: routerABI,
        functionName: 'addLiquidity',
        args: [
          token0,
          token1,
          parsedAmount0,
          parsedAmount1,
          amount0Min,
          amount1Min,
          userAddress,
        ],
      });

      // 2. Wait for tx confirmation
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      // 3. Refetch pools after tx confirmation
      await fetchAllPools(publicClient);
      await fetchUserPools(userAddress, publicClient);

      return true;
    } catch (error) {
      console.error('Add liquidity failed:', error);
      return false;
    }
  };

  /** ----------------------- Remove Liquidity Handler ---------------------- */
  const handleRemoveLiquidity = async (
    liquidityAmount: string
  ): Promise<boolean> => {
    if (!publicClient) return false;
    if (!selectedPair) return false;

    const selectedPool = userPools.find((p) => p.pairAddress === selectedPair);
    if (!selectedPool) return false;

    const {
      token0,
      token1,
      decimals0,
      decimals1,
      reserves,
      lpTotalSupply,
      balanceLP,
      lpDecimals,
    } = selectedPool;
    if (
      !userAddress ||
      !selectedPair ||
      !token0 ||
      !token1 ||
      decimals0 === null ||
      decimals1 === null ||
      reserves === null ||
      lpTotalSupply === undefined
    ) {
      console.error('Required data not loaded yet');
      return false;
    }

    try {
      // 1. Fetch LP decimals
      const decimalsLP = lpDecimals ?? 18;

      // 2. Parse input liquidity amount
      const parsedLiquidityAmount = parseUnits(liquidityAmount, decimalsLP);

      // 3. Check LP token balance
      if (balanceLP === undefined) {
        console.error('LP balance not loaded yet');
        return false;
      }
      if (balanceLP < parsedLiquidityAmount) {
        console.error('Insufficient LP token balance');
        return false;
      }

      // 4. Calculate expected withdrawal amounts
      const [reserve0, reserve1] = reserves;
      const expectedAmount0 =
        (reserve0 * parsedLiquidityAmount) / lpTotalSupply;
      const expectedAmount1 =
        (reserve1 * parsedLiquidityAmount) / lpTotalSupply;

      // 5. Apply slippage tolerance
      const amount0Min = getSlippageBounds(expectedAmount0);
      const amount1Min = getSlippageBounds(expectedAmount1);

      // 6. Check allowance of LP tokens
      const allowanceLP: bigint = await publicClient!.readContract({
        address: selectedPair,
        abi: ERC20Abi,
        functionName: 'allowance',
        args: [userAddress, routerAddress],
      });

      // 7. Approve LP tokens if needed
      if (allowanceLP < parsedLiquidityAmount) {
        try {
          const txHash = await writeContractAsync({
            address: selectedPair,
            abi: ERC20Abi,
            functionName: 'approve',
            args: [routerAddress, MAX_UINT256],
          });
          await publicClient!.waitForTransactionReceipt({ hash: txHash });
        } catch (error) {
          console.error('LP token approval failed:', error);
          return false;
        }
      }

      // 8. Execute removeLiquidity
      const txHash = await writeContractAsync({
        address: routerAddress,
        abi: routerABI,
        functionName: 'removeLiquidity',
        args: [
          token0,
          token1,
          parsedLiquidityAmount,
          amount0Min,
          amount1Min,
          userAddress,
        ],
      });

      // Wait for tx confirmation
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      // Refetch pools after tx confirmation
      await fetchAllPools(publicClient);
      await fetchUserPools(userAddress, publicClient);

      return true;
    } catch (error) {
      console.error('Remove liquidity failed:', error);
      return false;
    }
  };

  const onAddLiquidityClick = (pairAddress: `0x${string}`) => {
    setSelectedPair(pairAddress);
    setIsAddModalOpen(true);
  };

  const onRemoveLiquidityClick = (pairAddress: `0x${string}`) => {
    setSelectedPair(pairAddress);
    setIsRemoveModalOpen(true);
  };

  const closeAddModal = () => {
    setLiquidityWarning(null);
    setIsAddModalOpen(false);
    setSelectedPair(null);
  };

  const closeRemoveModal = () => {
    setIsRemoveModalOpen(false);
    setSelectedPair(null);
  };

  // You can keep your handlers here: handleAddLiquidity, handleRemoveLiquidity
  // OR abstract them to external helpers if needed.
  console.log('Selected Pool:', selectedPool);
  console.log('Pools prop:', pools);
  console.log('Selected Pair:', selectedPair);

  if (isLoadingAllPools) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#120023] via-[#1B002B] to-[#2B003D] text-white font-sans">
      <Header />
      <ListComponent
        pools={pools}
        isLoading={isLoading ?? false}
        onAddLiquidityClick={onAddLiquidityClick}
        onRemoveLiquidityClick={onRemoveLiquidityClick}
      />

      {isAddModalOpen && selectedPool && (
        <AddLiquidityModal
          isOpen={isAddModalOpen}
          onClose={closeAddModal}
          liquidityWarning={liquidityWarning}
          setLiquidityWarning={setLiquidityWarning}
          handleAddLiquidity={handleAddLiquidity}
          token0={selectedPool.token0}
          token1={selectedPool.token1}
          decimalsToken0={selectedPool.decimals0}
          decimalsToken1={selectedPool.decimals1}
          reserveA={selectedPool.userReserve0}
          reserveB={selectedPool.userReserve1}
          symbolToken0={selectedPool.symbolToken0}
          symbolToken1={selectedPool.symbolToken1}
        />
      )}

      {isRemoveModalOpen && selectedPool && (
        <RemoveLiquidityModal
          isOpen={isRemoveModalOpen}
          onClose={closeRemoveModal}
          handleRemoveLiquidity={handleRemoveLiquidity}
          symbolToken0={selectedPool.symbolToken0}
          symbolToken1={selectedPool.symbolToken1}
          lpDecimals={selectedPool.lpDecimals}
          balanceLP={selectedPool.balanceLP}
          reserves={selectedPool.reserves}
          lpTotalSupply={selectedPool.lpTotalSupply}
          decimals0={selectedPool.decimals0}
          decimals1={selectedPool.decimals1}
        />
      )}
    </div>
  );
};

export default PoolListContainer;
