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
import Spinner from '../ui/Spinner';
import MintToken from '../ui/MintToken';
import { toast } from 'react-toastify';

export function CreatePool() {
  /** ------------------ Tab State ------------------ */
  const [activeTab, setActiveTab] = useState<'create' | 'mint'>('create');

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
      toast.error('Base Token and Quote Token cannot be the same.');
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
    <div className="min-h-screen">
      <div className="flex items-center justify-center p-6 pt-24">
        <div className="w-full max-w-lg p-8 rounded-3xl backdrop-blur-xl bg-white/5 border  gradient-border shadow-[0_0_40px_#AB37FF33] space-y-6 transition-all duration-300">
          {/* ------------------ Tab Navigation ------------------ */}
          <div className="flex rounded-xl bg-white/10 p-1 border border-[#3769ff]">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'create'
                  ? 'bg-lightblue text-white shadow-[0_0_15px_#AB37FF33]'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Create Pool
            </button>
            <button
              onClick={() => setActiveTab('mint')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'mint'
                  ? 'bg-lightblue text-white shadow-[0_0_15px_#AB37FF66]'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Mint Tokens
            </button>
          </div>

          {/* ------------------ Tab Content ------------------ */}
          {activeTab === 'create' ? (
            <>
              <h1 className="lg:text-xl  text-lg font-semibold text-left text-white tracking-wide drop-shadow-[0_0_10px_#AB37FF33]">
                First, select tokens & fee tier
              </h1>

              {/* ------------------ Token Selectors ------------------ */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm/5 mb-1 text-white/70">
                    Base Token
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-[#3e37ff33] focus:outline-none focus:ring-2 focus:ring-[#AB37FF66] transition"
                    value={tokenASelected ? tokenA : ''}
                    onChange={(e) => {
                      setTokenA(e.target.value as `0x${string}`);
                      setTokenASelected(true);
                    }}
                    aria-label="Select Base Token"
                  >
                    <option value="">Select Token</option>
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
                  <label className="block text-sm/5 mb-1 text-white/70">
                    Quote Token
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-[#3769ff] focus:outline-none focus:ring-2 focus:ring-[#AB37FF66] transition"
                    value={tokenBSelected ? tokenB : ''}
                    onChange={(e) => {
                      setTokenB(e.target.value as `0x${string}`);
                      setTokenBSelected(true);
                    }}
                    aria-label="Select Quote Token"
                  >
                    <option value="">Select Token</option>
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
                className={`btn-primary w-full py-3 px-6 rounded-full font-semibold flex justify-center items-center gap-2 transition-all duration-200 ${
                  isPending || isConfirming
                    ? 'opacity-60 cursor-not-allowed'
                    : ''
                } shadow-[0_0_20px_#AB37FF88]`}
                disabled={isPending || isConfirming}
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
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-center text-white tracking-wide drop-shadow-[0_0_10px_#AB37FFAA]">
                Mint Tokens
              </h1>
              <div className="-mx-8 -mb-8">
                <MintToken />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
