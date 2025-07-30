'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useAccount, usePublicClient } from 'wagmi';
import { arbitrum } from 'wagmi/chains';
import Header from '../ui/Header';
import Spinner from '../ui/Spinner';
import AddLiquidityModal from '../modals/addLiquidityModal';
import RemoveLiquidityModal from '../modals/removeLiquidityModal';
import { usePoolsStore } from '../../store/usePoolsStore';
import { getMinAmountAfterSlippage } from '../../utils/slippage';
import { validateOptimalAmounts, approveIfNeeded } from '../../utils/liquidity';
import { parseUnits } from 'viem/utils';
import {
  ROUTER_ADDRESS as routerAddress,
  routerABI,
  ERC20Abi,
  MAX_UINT256,
} from '@/constants';
import { getMockPrice } from '../../utils/getMockPrice';
import { PoolListContainerProps } from '../../types/interfaces';

const PoolListContainer = ({
  pools,
  ListComponent,
  fetchOnMount = true,
  isLoading,
}: PoolListContainerProps) => {
  const { writeContractAsync } = useWriteContract();

  // Zustand store hooks to access global pool data and fetching methods
  const fetchAllPools = usePoolsStore((state) => state.fetchAllPools);
  const fetchUserPools = usePoolsStore((state) => state.fetchUserPools);
  const isLoadingAllPools = usePoolsStore((state) => state.isLoadingAllPools);
  const allPools = usePoolsStore((state) => state.allPools);
  const userPools = usePoolsStore((state) => state.userPools);

  // Get wallet address and connection status from Wagmi
  const { address: userAddress, isConnected } = useAccount();

  // Public client to read blockchain data (Arbitrum network)
  const publicClient = usePublicClient({ chainId: arbitrum.id });

  // Local component state to track selected pair and modal visibility
  const [selectedPair, setSelectedPair] = useState<`0x${string}` | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [liquidityWarning, setLiquidityWarning] = useState<string | null>(null);

  // Find the currently selected pool from user pools or all pools by matching pairAddress
  const selectedPool =
    userPools.find(
      (p) => p.pairAddress.toLowerCase() === selectedPair?.toLowerCase()
    ) ||
    allPools.find(
      (p) => p.pairAddress.toLowerCase() === selectedPair?.toLowerCase()
    );

  // Effect to fetch all pools and user pools on mount or when connection/user changes,
  // but only if fetchOnMount flag is true
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
    // Ensure wallet connected, public client and selected pair are ready
    if (!userAddress) {
      console.error('Wallet not connected');
      return false;
    }
    if (!publicClient) return false;
    if (!selectedPair) return false;

    if (!selectedPool) {
      console.error('No selected pool found');
      return false;
    }

    try {
      const {
        token0,
        token1,
        decimals0,
        decimals1,
        reserves,
        allowanceToken0,
        allowanceToken1,
        symbolToken0,
        symbolToken1,
      } = selectedPool;

      // Check if necessary data is loaded before proceeding
      if (
        decimals0 === null ||
        decimals1 === null ||
        token0 === null ||
        token1 === null ||
        reserves === null ||
        symbolToken0 === undefined ||
        symbolToken1 === undefined
      ) {
        console.error('Token decimals, reserves or allowances not loaded yet');
        return false;
      }

      // Fetch current token allowances if not provided in the pool state
      const finalAllowance0 =
        allowanceToken0 ??
        (await publicClient.readContract({
          address: token0,
          abi: ERC20Abi,
          functionName: 'allowance',
          args: [userAddress, routerAddress],
        }));

      const finalAllowance1 =
        allowanceToken1 ??
        (await publicClient.readContract({
          address: token1,
          abi: ERC20Abi,
          functionName: 'allowance',
          args: [userAddress, routerAddress],
        }));

      // Validate that at least one token input is provided and valid
      const hasInput0 = amountToken0Desired.trim() !== '';
      const hasInput1 = amountToken1Desired.trim() !== '';

      if (!hasInput0 && !hasInput1) {
        console.error('At least one token input is required');
        return false;
      }

      const inputAmount0 = hasInput0 ? parseFloat(amountToken0Desired) : 0;
      const inputAmount1 = hasInput1 ? parseFloat(amountToken1Desired) : 0;

      if (
        (hasInput0 && (isNaN(inputAmount0) || inputAmount0 <= 0)) ||
        (hasInput1 && (isNaN(inputAmount1) || inputAmount1 <= 0))
      ) {
        console.error('Invalid token input');
        return false;
      }

      // Convert user inputs to raw units considering token decimals
      const parsedAmount0 = parseUnits(inputAmount0.toString(), decimals0);
      const parsedAmount1 = parseUnits(inputAmount1.toString(), decimals1);

      // Validate the amounts against pool reserves to maintain the correct ratio
      const optimalAmounts = validateOptimalAmounts(
        parsedAmount0,
        parsedAmount1,
        getMinAmountAfterSlippage(parsedAmount0),
        getMinAmountAfterSlippage(parsedAmount1),
        reserves[0],
        reserves[1]
      );

      // If ratio validation fails, show warning and abort
      if (!optimalAmounts) {
        setLiquidityWarning(
          'The token amounts are too imbalanced to maintain the pool ratio. Please adjust them.'
        );
        return false;
      }

      // Clear any existing warning once inputs are valid
      setLiquidityWarning(null);

      const [finalParsed0, finalParsed1] = optimalAmounts;

      // Calculate minimum acceptable amounts factoring in slippage tolerance
      const amount0Min = getMinAmountAfterSlippage(finalParsed0);
      const amount1Min = getMinAmountAfterSlippage(finalParsed1);

      // Approve tokens for router contract if current allowance is insufficient
      await approveIfNeeded(
        token0,
        finalAllowance0,
        finalParsed0,
        writeContractAsync,
        routerAddress
      );
      await approveIfNeeded(
        token1,
        finalAllowance1,
        finalParsed1,
        writeContractAsync,
        routerAddress
      );

      // Execute addLiquidity transaction on-chain
      const txHash = await writeContractAsync({
        address: routerAddress,
        abi: routerABI,
        functionName: 'addLiquidity',
        args: [
          token0,
          token1,
          finalParsed0,
          finalParsed1,
          amount0Min,
          amount1Min,
          userAddress,
        ],
      });

      // Wait for transaction to be confirmed
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      // Refresh pools state after liquidity addition
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

    // Validate that all required data is present before proceeding
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
      // Determine LP token decimals or default to 18
      const decimalsLP = lpDecimals ?? 18;

      // Convert input liquidity amount to raw units
      const parsedLiquidityAmount = parseUnits(liquidityAmount, decimalsLP);

      // Check user's LP token balance is loaded and sufficient
      if (balanceLP === undefined) {
        console.error('LP balance not loaded yet');
        return false;
      }
      if (balanceLP < parsedLiquidityAmount) {
        console.error('Insufficient LP token balance');
        return false;
      }

      // Calculate expected amounts of tokens to be withdrawn from the pool
      const [reserve0, reserve1] = reserves;
      const expectedAmount0 =
        (reserve0 * parsedLiquidityAmount) / lpTotalSupply;
      const expectedAmount1 =
        (reserve1 * parsedLiquidityAmount) / lpTotalSupply;

      // Calculate minimum amounts considering slippage tolerance
      const amount0Min = getMinAmountAfterSlippage(expectedAmount0);
      const amount1Min = getMinAmountAfterSlippage(expectedAmount1);

      // Fetch current allowance of LP tokens for router contract
      const allowanceLP: bigint = await publicClient!.readContract({
        address: selectedPair,
        abi: ERC20Abi,
        functionName: 'allowance',
        args: [userAddress, routerAddress],
      });

      // Approve LP tokens if allowance is insufficient for removal
      if (allowanceLP < parsedLiquidityAmount) {
        try {
          const txHash = await writeContractAsync({
            address: selectedPair,
            abi: ERC20Abi,
            functionName: 'approve',
            args: [routerAddress, MAX_UINT256],
          });

          // Wait for approval transaction confirmation
          await publicClient!.waitForTransactionReceipt({ hash: txHash });
        } catch (error) {
          console.error('LP token approval failed:', error);
          return false;
        }
      }

      // Execute removeLiquidity transaction on-chain
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

      // Wait for transaction to be confirmed
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      // Refresh pools state after liquidity removal
      await fetchAllPools(publicClient);
      await fetchUserPools(userAddress, publicClient);

      return true;
    } catch (error) {
      console.error('Remove liquidity failed:', error);
      return false;
    }
  };

  // Opens Add Liquidity modal and sets the selected pair
  const onAddLiquidityClick = (pairAddress: `0x${string}`) => {
    setSelectedPair(pairAddress);
    setIsAddModalOpen(true);
  };

  // Opens Remove Liquidity modal and sets the selected pair
  const onRemoveLiquidityClick = (pairAddress: `0x${string}`) => {
    setSelectedPair(pairAddress);
    setIsRemoveModalOpen(true);
  };

  // Closes Add Liquidity modal and clears selected pair and warnings
  const closeAddModal = () => {
    setLiquidityWarning(null);
    setIsAddModalOpen(false);
    setSelectedPair(null);
  };

  // Closes Remove Liquidity modal and clears selected pair
  const closeRemoveModal = () => {
    setIsRemoveModalOpen(false);
    setSelectedPair(null);
  };

  // Show global loading spinner while pools data is loading
  if (isLoadingAllPools) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
        <Spinner />
      </div>
    );
  }

  // Main render: Header, list of pools, and modals for add/remove liquidity
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#120023] via-[#1B002B] to-[#2B003D] text-white font-sans">
      <Header />
      <ListComponent
        pools={pools}
        isLoading={isLoading ?? false}
        onAddLiquidityClick={onAddLiquidityClick}
        onRemoveLiquidityClick={onRemoveLiquidityClick}
      />

      {isAddModalOpen && selectedPool ? (
        <AddLiquidityModal
          isOpen={isAddModalOpen}
          onClose={closeAddModal}
          liquidityWarning={liquidityWarning}
          setLiquidityWarning={setLiquidityWarning}
          handleAddLiquidity={handleAddLiquidity}
          token0={selectedPool.token0}
          token1={selectedPool.token1}
          decimals0={selectedPool.decimals0}
          decimals1={selectedPool.decimals1}
          reserveA={selectedPool.userReserve0}
          reserveB={selectedPool.userReserve1}
          symbolToken0={selectedPool.symbolToken0}
          symbolToken1={selectedPool.symbolToken1}
          price0={getMockPrice(selectedPool.symbolToken0 ?? '') ?? undefined}
          price1={getMockPrice(selectedPool.symbolToken1 ?? '') ?? undefined}
        />
      ) : null}

      {isRemoveModalOpen && selectedPool ? (
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
      ) : null}
    </div>
  );
};

export default PoolListContainer;
