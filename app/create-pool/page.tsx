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
import Header from '../../components/ui/Header';
import Spinner from '../../components/ui/Spinner';
import MintToken from '../../components/ui/MintToken';
import { toast } from 'react-toastify';

const CreatePoolPage = () => {
  /** ------------------ Wallet Connection Status ------------------ */
  const { isConnected } = useAccount();
  const router = useRouter();

  /** ------------------ Token Selection State ------------------ */
  // Track selected tokens (default to first two tokens in tokenList)
  const [tokenA, setTokenA] = useState<`0x${string}`>(tokenList[0].address);
  const [tokenASelected, setTokenASelected] = useState(false);

  const [tokenB, setTokenB] = useState<`0x${string}`>(tokenList[1].address);
  const [tokenBSelected, setTokenBSelected] = useState(false);

  /** ------------------ Pool Existence & Error State ------------------ */
  // Whether the pool for selected tokens already exists
  const [poolExists, setPoolExists] = useState(false);

  // Track local errors related to transaction or UI
  const [localError, setLocalError] = useState<BaseError | null>(null);

  /** ------------------ Simulate createPair Contract Call ------------------ */
  // Used to validate and prepare transaction data for pool creation
  const { data } = useSimulateContract({
    address: factoryAddress,
    abi: factoryABI,
    functionName: 'createPair',
    args: [tokenA, tokenB],
  });

  /** ------------------ Write Contract Hook ------------------ */
  // Provides method to send the transaction and tracks status/error
  const { data: hash, error, writeContract, isPending } = useWriteContract();

  /** ------------------ Wait for Transaction Confirmation ------------------ */
  // Watches transaction hash and updates confirmation status
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  /** ------------------ Read Current Pool Address ------------------ */
  // Query factory contract to get pair address for selected tokens
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

  /** ------------------ Update Pool Existence State ------------------ */
  useEffect(() => {
    // Pool exists if address is valid and not zero address
    if (poolAddress && poolAddress !== zeroAddress) {
      setPoolExists(true);
    } else {
      setPoolExists(false);
    }
  }, [poolAddress]);

  /** ------------------ Refetch Pool Address After Confirmation ------------------ */
  // After transaction confirmed, re-query pool address to get updated state
  useEffect(() => {
    if (isConfirmed) {
      refetchPoolAddress();
    }
  }, [isConfirmed, refetchPoolAddress]);

  /** ------------------ Show Success Toast and Redirect After Creation ------------------ */
  useEffect(() => {
    // Show success toast and navigate to new pool page after confirmation
    if (isConfirmed && poolAddress && poolAddress !== zeroAddress) {
      toast.success('Pool created successfully!');
      router.push(`/pool/${poolAddress}`);
    }
  }, [isConfirmed, poolAddress, router]);

  /** ------------------ Handle Transaction Errors with Toasts ------------------ */
  useEffect(() => {
    if (!error) return;

    const message = error instanceof Error ? error.message.toLowerCase() : '';

    // Show different error messages based on error type/content
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

  /** ------------------ Clear Errors When Tokens Change ------------------ */
  // Reset local error state when user selects new tokens
  useEffect(() => {
    setLocalError(null);
  }, [tokenA, tokenB]);

  /** ------------------ Handle Create Pool Button Click ------------------ */
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
      return; // stop the function, do not create new pool
    }

    if (!data?.request) {
      toast.error('Transaction data not ready');
      return;
    }

    // Send the createPair transaction using prepared request data
    writeContract(data.request);
    toast.info('Transaction sent. Waiting for confirmation...');
  };

  /** ------------------ JSX Render ------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#120023] via-[#1B002B] to-[#2B003D] text-white font-sans">
      <Header />

      <div className="flex items-center justify-center p-6 mt-18">
        <div className="w-full max-w-md p-8 rounded-3xl backdrop-blur-xl bg-white/5 border border-[#AB37FF33] shadow-[0_0_40px_#AB37FF33] space-y-6 transition-all duration-300">
          <h1 className="text-3xl font-bold text-center text-white tracking-wide drop-shadow-[0_0_10px_#AB37FFAA]">
            Create a Pool
          </h1>

          {/* ------------------ Token Selectors ------------------ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-white/70">
                Token A
              </label>
              <select
                className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-[#AB37FF33] focus:outline-none focus:ring-2 focus:ring-[#AB37FF66] transition"
                value={tokenASelected ? tokenA : ''}
                onChange={(e) => {
                  setTokenA(e.target.value as `0x${string}`);
                  setTokenASelected(true);
                }}
              >
                <option value="">Select Token A</option>
                {tokenList
                  .filter((token) => token.address !== tokenB)
                  .map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.symbol}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1 text-white/70">
                Token B
              </label>
              <select
                className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-[#AB37FF33] focus:outline-none focus:ring-2 focus:ring-[#AB37FF66] transition"
                value={tokenBSelected ? tokenB : ''}
                onChange={(e) => {
                  setTokenB(e.target.value as `0x${string}`);
                  setTokenBSelected(true);
                }}
              >
                <option value="">Select Token B</option>
                {tokenList
                  .filter((token) => token.address !== tokenA)
                  .map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.symbol}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* ------------------ Create Pool Button ------------------ */}
          <button
            onClick={handleCreatePool}
            className={`w-full py-3 px-6 rounded-full font-semibold flex justify-center items-center gap-2 transition-all duration-200 ${
              isPending || isConfirming
                ? 'bg-[#451063] opacity-60 cursor-not-allowed'
                : 'bg-[#AB37FF] hover:bg-[#C155FF]'
            } shadow-[0_0_20px_#AB37FF88]`}
          >
            {isPending || isConfirming ? <Spinner /> : 'Create Pool'}
          </button>

          {/* ------------------ Status Messages ------------------ */}
          <div className="space-y-2 text-sm">
            {isPoolLoading && (
              <div className="text-yellow-400 animate-pulse">
                Checking if pool exists...
              </div>
            )}

            {poolExists && tokenASelected && tokenBSelected && (
              <div className="text-red-400">
                Pool already exists at:
                <span className="block break-all mt-1 opacity-80">
                  {String(poolAddress)}
                </span>
              </div>
            )}

            {hash && (
              <div className="p-3 rounded-xl bg-blue-900/30 text-blue-300 border border-blue-500">
                Transaction sent. Hash:
                <div className="break-all mt-1">{hash}</div>
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

          {/* ------------------ Optional: Mint Component ------------------ */}
          <div className="pt-4 border-t border-white/10">
            <MintToken />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePoolPage;
