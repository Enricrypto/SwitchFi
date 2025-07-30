'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BaseError,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
  useReadContract,
  useAccount,
} from 'wagmi';
import { zeroAddress } from 'viem';
import {
  FACTORY_ADDRESS as factoryAddress,
  factoryABI,
  tokenList,
} from '@/constants';
import TokenSelector from '../../components/ui/TokenSelector';
import Header from '../../components/ui/Header';
import Spinner from '../../components/ui/Spinner';
import MintToken from '../../components/ui/MintToken';
import { toast } from 'react-toastify';

const CreatePoolPage = () => {
  const { isConnected } = useAccount();
  const router = useRouter();

  // ───── Token Selection State ─────
  const [tokenA, setTokenA] = useState<`0x${string}`>(tokenList[0].address);
  const [tokenASelected, setTokenASelected] = useState(false);

  const [tokenB, setTokenB] = useState<`0x${string}`>(tokenList[1].address);
  const [tokenBSelected, setTokenBSelected] = useState(false);

  // ───── Pool State ─────
  const [poolExists, setPoolExists] = useState(false);
  const [localError, setLocalError] = useState<BaseError | null>(null);

  // ───── Simulate contract write (to get calldata) ─────
  const { data } = useSimulateContract({
    address: factoryAddress,
    abi: factoryABI,
    functionName: 'createPair',
    args: [tokenA, tokenB],
  });

  // ───── Execute contract write ─────
  const { data: hash, error, writeContract, isPending } = useWriteContract();

  // ───── Track transaction confirmation status ─────
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // ───── Fetch existing pool address (if any) ─────
  const {
    data: poolAddress,
    isLoading: isPoolLoading,
    refetch: refetchPoolAddress,
  } = useReadContract({
    address: factoryAddress,
    abi: factoryABI,
    functionName: 'getPair',
    args: [tokenA, tokenB],
  });

  // ───── Check if pool exists ─────
  useEffect(() => {
    if (poolAddress && poolAddress !== zeroAddress) {
      setPoolExists(true);
    } else {
      setPoolExists(false);
    }
  }, [poolAddress]);

  // ───── Refetch pool address on confirmation ─────
  useEffect(() => {
    if (isConfirmed) {
      refetchPoolAddress();
    }
  }, [isConfirmed, refetchPoolAddress]);

  // ───── Navigate after pool is confirmed and exists ─────
  useEffect(() => {
    if (isConfirmed && poolAddress && poolAddress !== zeroAddress) {
      toast.success('Pool created successfully!');
      router.push(`/pool/${poolAddress}`);
    }
  }, [isConfirmed, poolAddress, router]);

  // ───── Handle transaction errors ─────
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

  // ───── Clear local error when tokens change ─────
  useEffect(() => {
    setLocalError(null);
  }, [tokenA, tokenB]);

  // ───── Main action: Create pool ─────
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

    if (!data?.request) {
      toast.error('Transaction data not ready');
      return;
    }

    writeContract(data.request);
    toast.info('Transaction sent. Waiting for confirmation...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#120023] via-[#1B002B] to-[#2B003D] text-white font-sans">
      <Header />

      <div className="flex items-center justify-center p-6 mt-18">
        <div className="w-full max-w-md p-8 rounded-lg bg-[#2A0040] border border-[#AB37FF33] shadow-[0_0_40px_#AB37FF33] space-y-6 transition-all duration-300">
          <h1 className="text-2xl font-bold text-center text-white tracking-wide drop-shadow-[0_0_10px_#AB37FFAA]">
            Create a Pool
          </h1>

          {/* Token Selectors */}
          <div className="grid grid-cols-2 gap-6 justify-items-center">
            <div>
              <TokenSelector
                token={tokenList.find((t) => t.address === tokenA) || undefined}
                tokens={tokenList.filter((t) => t.address !== tokenB)}
                onSelect={(token) => {
                  setTokenA(token.address);
                  setTokenASelected(true);
                }}
              />
            </div>

            <div>
              <TokenSelector
                token={tokenList.find((t) => t.address === tokenB) || undefined}
                tokens={tokenList.filter((t) => t.address !== tokenA)}
                onSelect={(token) => {
                  setTokenB(token.address);
                  setTokenBSelected(true);
                }}
              />
            </div>
          </div>

          {/* Create Pool Button */}
          <button
            onClick={handleCreatePool}
            className={`w-full py-3 px-6 rounded-full font-semibold flex justify-center items-center gap-2 transition-all duration-200 ${
              isPending || isConfirming
                ? 'bg-[#451063] opacity-60 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            } shadow-[0_0_20px_#AB37FF88]`}
            disabled={isPending || isConfirming}
          >
            {isPending || isConfirming ? <Spinner /> : 'Create Pool'}
          </button>

          {/* Status Messages */}
          <div className="space-y-2 text-sm">
            {isPoolLoading && (
              <div className="text-yellow-400 animate-pulse">
                Checking if pool exists...
              </div>
            )}

            {poolExists && tokenASelected && tokenBSelected && (
              <div className="text-red-400 break-words">
                Pool already exists at:
                <span className="block mt-1 opacity-80">
                  {String(poolAddress)}
                </span>
              </div>
            )}

            {hash && (
              <div className="p-3 rounded-xl bg-blue-900/30 text-blue-300 border border-blue-500 break-words">
                Transaction sent. Hash:
                <div className="mt-1">{hash}</div>
              </div>
            )}

            {isConfirming && (
              <div className="text-yellow-600">Waiting for confirmation...</div>
            )}

            {isConfirmed && (
              <div className="text-yellow-400">Transaction confirmed</div>
            )}

            {localError && (
              <div className="text-red-400">
                Error: {localError.shortMessage || localError.message}
              </div>
            )}
          </div>

          {/* Optional Mint Token */}
          <div className="pt-4 border-t border-white/10">
            <MintToken />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePoolPage;
