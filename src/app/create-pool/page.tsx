'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BaseError,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
  useAccount,
} from 'wagmi';
import { FACTORY_ADDRESS as factoryAddress } from '@/constants';
import { factoryABI } from '@/abis/factoryABI';
import { usePoolsStore } from '@/store/usePoolsStore';
import StepMultiStep from '@/components/create-pool/StepMultistep';
import StepSidebar from '@/components/create-pool/StepSidebar';
import { toast } from 'react-toastify';

const CreatePoolPage = () => {
  const { isConnected } = useAccount();
  const router = useRouter();

  /** ------------------ Step State ------------------ */
  const [step, setStep] = useState(1);

  /** ------------------ Step 1 State (tokens, fee & amounts) ------------------ */
  const [tokenA, setTokenA] = useState<string | null>(null);
  const [tokenB, setTokenB] = useState<string | null>(null);
  const [feeTier, setFeeTier] = useState<number | null>(0.25);
  const [amountA, setAmountA] = useState<number>(0);
  const [amountB, setAmountB] = useState<number>(0);

  const [reviewData, setReviewData] = useState<{
    impliedPriceAperB?: number;
    impliedPriceBperA?: number;
    marketPriceAperB?: number;
    marketPriceBperA?: number;
    marketPriceAInUSD?: number;
    marketPriceBInUSD?: number;
    tokenAPriceUSD?: number;
    tokenBPriceUSD?: number;
  }>({});

  /** ------------------ Pool Existence & Errors ------------------ */
  const [localError, setLocalError] = useState<BaseError | null>(null);

  /** ------------------ Pools Store ------------------ */
  const { allPools, fetchAllPools } = usePoolsStore();
  const pool = allPools.find(
    (p) =>
      (p.token0 === tokenA && p.token1 === tokenB) ||
      (p.token0 === tokenB && p.token1 === tokenA)
  );
  const poolExists = Boolean(pool?.pairAddress);

  /** ------------------ Wagmi Hooks ------------------ */
  const { data: simulationData } = useSimulateContract({
    address: factoryAddress,
    abi: factoryABI,
    functionName: 'createPair',
    args: [tokenA as `0x${string}`, tokenB as `0x${string}`],
  });

  const { data: hash, error, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  /** ------------------ Effects ------------------ */

  // Fetch all pools when component mounts
  useEffect(() => {
    fetchAllPools(window.ethereum ? window.ethereum : undefined);
  }, [fetchAllPools]);

  // Navigate after pool is confirmed
  useEffect(() => {
    if (isConfirmed && pool?.pairAddress) {
      toast.success('Pool created successfully!');
      router.push(`/pool/${pool.pairAddress}`);
    }
  }, [isConfirmed, pool, router]);

  // Handle transaction errors
  useEffect(() => {
    if (!error) return;
    const message = error instanceof Error ? error.message.toLowerCase() : '';

    if (
      message.includes('user denied') ||
      message.includes('cancel') ||
      message.includes('rejected')
    ) {
      toast.error('Transaction cancelled by user');
    } else if (error instanceof BaseError) {
      toast.error(`Error: ${error.shortMessage}`);
    } else if (error instanceof Error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.error('Unknown error occurred');
    }

    setLocalError(error as BaseError);
  }, [error]);

  // Clear local error when tokens change
  useEffect(() => {
    setLocalError(null);
  }, [tokenA, tokenB]);

  /** ------------------ Create Pool ------------------ */
  const handleCreatePool = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }
    if (tokenA === tokenB) {
      toast.error('Token A and Token B cannot be the same.');
      return;
    }
    if (poolExists) {
      toast.error('Pool already exists!');
      return;
    }
    if (!simulationData?.request) {
      toast.error('Transaction data not ready');
      return;
    }

    writeContract(simulationData.request);
    toast.info('Transaction sent. Waiting for confirmation...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#120023] via-[#1B002B] to-[#2B003D] text-white font-sans">
      <div className="flex items-start justify-center p-6 mt-18 gap-8">
        <StepSidebar step={step} />
        <div className="w-full max-w-lg">
          <StepMultiStep
            step={step}
            setStep={setStep}
            tokenA={tokenA}
            tokenB={tokenB}
            setTokenA={setTokenA}
            setTokenB={setTokenB}
            feeTier={feeTier}
            setFeeTier={setFeeTier}
            amountA={amountA}
            amountB={amountB}
            setAmounts={(a, b) => {
              setAmountA(a);
              setAmountB(b);
            }}
            pool={pool}
            poolExists={poolExists}
            isPending={isPending}
            isConfirming={isConfirming}
            localError={localError}
            hash={hash}
            isPoolLoading={false} // you can optionally show a loader if fetchAllPools is running
            onCreatePool={handleCreatePool}
            reviewData={reviewData}
            setReviewData={setReviewData}
          />
        </div>
      </div>
    </div>
  );
};

export default CreatePoolPage;
