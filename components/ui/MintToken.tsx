'use client';

import { useState, useEffect } from 'react';
import {
  useAccount,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { tokenList, ERC20Abi } from '@/constants';
import { formatUnits, parseUnits, BaseError } from 'viem';
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const MintToken = () => {
  /* ------------------ Wallet State ------------------ */
  const { address, isConnected } = useAccount();

  /* ------------------ Local UI State ------------------ */
  const [selectedToken, setSelectedToken] = useState(tokenList[0].address);
  const [amount, setAmount] = useState('1000');
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [localError, setLocalError] = useState<BaseError | null>(null);

  /* ------------------ Transaction Confirmation ------------------ */
  const { isSuccess: isMintConfirmed } = useWaitForTransactionReceipt({
    hash: txHash ? (txHash as `0x${string}`) : undefined,
  });

  /* ------------------ Contract Write Hook ------------------ */
  const { writeContractAsync } = useWriteContract();

  /* ------------------ Read Token Balance ------------------ */
  const {
    data: rawBalance,
    refetch: refetchBalance,
    isLoading: isBalanceLoading,
  } = useReadContract({
    address: selectedToken as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!selectedToken,
    },
  });

  /* ------------------ Read Token Decimals ------------------ */
  const { data: decimals } = useReadContract({
    address: selectedToken as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'decimals',
    query: {
      enabled: !!selectedToken,
    },
  });

  /* ------------------ Format Balance for Display ------------------ */
  const formattedBalance: string =
    rawBalance && typeof rawBalance === 'bigint' && decimals != null
      ? formatUnits(rawBalance, decimals)
      : '0';

  /* ------------------ Handle Mint Action ------------------ */
  const handleMint = async () => {
    setError(null);

    if (!isConnected || !address) {
      alert('Connect your wallet first');
      return;
    }

    const amountInWei = parseUnits(amount, decimals ?? 18);
    setIsMinting(true);
    setTxHash(null);

    try {
      const hash = await writeContractAsync({
        address: selectedToken as `0x${string}`,
        abi: ERC20Abi,
        functionName: 'mint',
        args: [amountInWei],
      });

      setTxHash(hash);
    } catch (err: unknown) {
      setError(err);
    } finally {
      setIsMinting(false);
    }
  };

  /* ------------------ Refresh Balance After Mint ------------------ */
  useEffect(() => {
    if (isMintConfirmed) {
      refetchBalance();
      setTxHash(null);
    }
  }, [isMintConfirmed, refetchBalance]);

  /* ------------------ Refetch on Token/Address Change ------------------ */
  useEffect(() => {
    if (address) refetchBalance();
  }, [selectedToken, address, refetchBalance]);

  /* ------------------ Show Toast and Set Local Error ------------------ */
  useEffect(() => {
    if (!error) {
      setLocalError(null);
      return;
    }

    // Normalize error message for user-friendly checks
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

    // Set localError for UI display fallback
    setLocalError(error as BaseError);
  }, [error]);

  /* ------------------ Clear localError when amount changes ------------------ */
  useEffect(() => {
    setLocalError(null);
  }, [amount]);

  const isAmountValid = !isNaN(Number(amount)) && Number(amount) > 0;

  return (
    <div className="text-center mt-6 bg-white/5 border border-white/10 rounded-3xl p-6 text-white font-sans shadow-[0_0_40px_#AB37FF33]">
      <h3 className="text-2xl font-bold mb-5 text-white drop-shadow-[0_0_10px_#AB37FFAA]">
        Mint Tokens
      </h3>

      {/* ------------------ Token Selector + Amount Input ------------------ */}
      <div className="grid grid-cols-2 gap-4">
        <select
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-[#AB37FF33] text-white focus:outline-none focus:ring-2 focus:ring-[#AB37FF66] transition"
          value={selectedToken}
          onChange={(e) => setSelectedToken(e.target.value as `0x${string}`)}
        >
          {tokenList.map((token) => (
            <option key={token.address} value={token.address}>
              {token.symbol}
            </option>
          ))}
        </select>

        <input
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-[#AB37FF33] text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-[#AB37FF66] transition"
          type="number"
          placeholder="Amount"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      {/* ------------------ Display Token Balance ------------------ */}
      <div className="mt-3 text-sm text-gray-400">
        Balance:{' '}
        {isBalanceLoading ? 'Loading...' : `${formattedBalance} tokens`}
      </div>

      {/* ------------------ Mint Button ------------------ */}
      <button
        onClick={handleMint}
        className={`mt-6 w-full py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-all ${
          isMinting || !isAmountValid
            ? 'bg-[#451063] opacity-60 cursor-not-allowed'
            : 'bg-[#AB37FF] hover:bg-[#C155FF]'
        } shadow-[0_0_20px_#AB37FF88]`}
        disabled={isMinting || !isAmountValid}
      >
        {isMinting && <Spinner />}
        {isMinting ? 'Minting...' : 'Mint Tokens'}
      </button>

      {/* ------------------ Display Error Message ------------------ */}
      {localError && (
        <p className="mt-4 text-red-400 text-sm">
          Error: {localError.shortMessage || localError.message}
        </p>
      )}

      {/* ------------------ Display Transaction Hash ------------------ */}
      {txHash && (
        <p className="mt-4 text-yellow-400 text-sm break-all">Tx: {txHash}</p>
      )}
    </div>
  );
};

export default MintToken;
