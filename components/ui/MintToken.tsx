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
import TokenSelector from './TokenSelector';
import AmountInput from './AmountInput';

const MintToken = () => {
  // ───── Wallet connection and state ─────
  const { address, isConnected } = useAccount();

  const [selectedToken, setSelectedToken] = useState(tokenList[0].address);
  const [amount, setAmount] = useState('...');
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [localError, setLocalError] = useState<BaseError | null>(null);

  // ───── Wagmi hooks ─────
  const { isSuccess: isMintConfirmed } = useWaitForTransactionReceipt({
    hash: txHash ? (txHash as `0x${string}`) : undefined,
  });

  const { writeContractAsync } = useWriteContract();

  // ───── Read balance ─────
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

  // ───── Read token decimals ─────
  const { data: decimals } = useReadContract({
    address: selectedToken as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'decimals',
    query: {
      enabled: !!selectedToken,
    },
  });

  // ───── Format balance ─────
  const formattedBalance =
    rawBalance && typeof rawBalance === 'bigint'
      ? Number(formatUnits(rawBalance, decimals ?? 18)).toLocaleString(
          undefined,
          { minimumFractionDigits: 0, maximumFractionDigits: 2 }
        )
      : '0';

  // ───── Mint handler ─────
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

  // ───── Toast + reset on successful tx ─────
  useEffect(() => {
    if (isMintConfirmed) {
      toast.success('✅ Mint confirmed!');
      refetchBalance();
      const timer = setTimeout(() => setTxHash(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [isMintConfirmed, refetchBalance]);

  // ───── Refetch balance when token or address changes ─────
  useEffect(() => {
    if (address) refetchBalance();
  }, [selectedToken, address, refetchBalance]);

  // ───── Error handling ─────
  useEffect(() => {
    if (!error) {
      setLocalError(null);
      return;
    }

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

  // ───── Clear local error when amount changes ─────
  useEffect(() => {
    setLocalError(null);
  }, [amount]);

  // ───── Validate input ─────
  const isAmountValid = !isNaN(Number(amount)) && Number(amount) > 0;

  return (
    <div className="mt-6 bg-[#2A0040] rounded-lg p-6 text-white font-sans shadow-[0_0_40px_#AB37FF33] max-w-md mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-white drop-shadow-[0_0_10px_#AB37FFAA] text-center">
        Mint Tokens
      </h3>

      {/* Token selector and amount */}
      <div className="grid grid-cols-2 gap-12 mb-5">
        <TokenSelector
          token={
            tokenList.find((t) => t.address === selectedToken) || undefined
          }
          tokens={tokenList}
          onSelect={(token) => setSelectedToken(token.address)}
        />
        <AmountInput value={amount} onChange={setAmount} />
      </div>

      {/* Balance */}
      <div className="mb-6 text-purple-300 text-sm text-center">
        Balance:{' '}
        {isBalanceLoading ? 'Loading...' : `${formattedBalance} tokens`}
      </div>

      {/* Mint button */}
      <button
        onClick={handleMint}
        disabled={isMinting || !isAmountValid}
        className={`w-full py-3 rounded-full font-semibold flex justify-center items-center gap-2 transition duration-200 ${
          isMinting || !isAmountValid
            ? 'bg-[#451063] opacity-60 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700 shadow-[0_0_20px_#AB37FF88]'
        }`}
      >
        {isMinting && <Spinner />}
        {isMinting ? 'Minting...' : 'Mint Tokens'}
      </button>

      {/* Error */}
      {localError && (
        <p className="mt-4 text-red-400 text-center text-sm">
          Error: {localError.shortMessage || localError.message}
        </p>
      )}

      {/* Tx hash */}
      {txHash && (
        <p className="mt-4 text-yellow-400 text-center text-sm break-all">
          Tx: {txHash}
        </p>
      )}
    </div>
  );
};

export default MintToken;
