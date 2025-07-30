'use client';

import { useState, useEffect } from 'react';
import { parseUnits, formatUnits } from 'viem';

import { usePoolsStore } from '../../store/usePoolsStore';
import { useAllTokens } from '../../hooks/useAllTokens';
import { useTokensForToken } from '../../hooks/useTokensForToken';
import { useReservesForTokens } from '../../hooks/useReservesForTokens';
import { useSwapPreview } from '../../hooks/useSwapPreview';
import { useBestPath } from '../../hooks/useBestPath';

import { getMockPrice } from '../../utils/getMockPrice';

import TokenSelector from '../ui/TokenSelector';
import AmountInput from './AmountInput';
import Spinner from './Spinner';

import { SwapFormProps } from '../../types/interfaces';

import { arbitrum } from 'viem/chains';

import { Settings, Repeat } from 'lucide-react';

import {
  ROUTER_ADDRESS as router_address,
  routerABI,
  ERC20Abi,
  MAX_UINT256,
} from '../../src/constants';

import {
  useAccount,
  usePublicClient,
  useWriteContract,
  useSimulateContract,
} from 'wagmi';

import { Token, SwapPreviewParams } from '../../types/interfaces';

const SwapForm = ({ slippagePercent, onToggleSettings }: SwapFormProps) => {
  const { address: userAddress } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: arbitrum.id });

  // ───── Token selection state ─────
  const [tokenIn, setTokenIn] = useState<Token>();
  const [tokenOut, setTokenOut] = useState<Token>();
  const [amountInput, setAmountInput] = useState('');
  const [amountOutput, setAmountOutput] = useState('');

  // ───── Token selection balance ─────
  const [balanceIn, setBalanceIn] = useState<bigint>(BigInt(0));
  const [balanceOut, setBalanceOut] = useState<bigint>(BigInt(0));

  const [formattedRate, setFormattedRate] = useState('0');

  // ───── Input state ─────
  const [amountInStr, setAmountInStr] = useState<string>('');
  const [amountOutStr, setAmountOutStr] = useState<string>('');
  const [focusedInput, setFocusedInput] = useState<'in' | 'out' | null>(null); // tracks which input user is editing

  // ───── Transaction state ─────
  const [approveTxHash, setApproveTxHash] = useState<string | null>(null);
  const [swapTxHash, setSwapTxHash] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  // ───── Global state ─────
  const isLoadingPools = usePoolsStore((state) => state.isLoadingAllPools);

  // ───── Token logic ─────
  const allTokens = useAllTokens();
  const tokenOutOptionsRaw = useTokensForToken(tokenIn?.address);
  const tokenInOptionsRaw = useTokensForToken(tokenOut?.address);

  const allowedTokenOut = tokenOutOptionsRaw?.length
    ? tokenOutOptionsRaw
    : allTokens;
  const allowedTokenIn = tokenInOptionsRaw?.length
    ? tokenInOptionsRaw
    : allTokens;

  // ───── Reserve logic ─────
  const reserves = useReservesForTokens(tokenIn?.address, tokenOut?.address);
  const reserveIn = reserves?.reserveIn ?? BigInt(0);
  const reserveOut = reserves?.reserveOut ?? BigInt(0);

  // ───── Amount parsing ─────
  const parsedAmountIn = parseUnits(
    amountInStr || '0',
    tokenIn?.decimals || 18
  );
  const parsedAmountOut = parseUnits(
    amountOutStr || '0',
    tokenOut?.decimals || 18
  );

  // ───── Slippage ─────
  // Convert slippage from percent to basis points (e.g. 0.5% → 50 BPS)
  const slippageBps = Math.round(slippagePercent * 100);

  // ───── Swap preview (estimates minAmountOut or required amountIn) ─────
  const params: SwapPreviewParams =
    focusedInput === 'out'
      ? {
          reverse: true,
          amountOut: parsedAmountOut,
          reserveIn,
          reserveOut,
          slippageBps,
        }
      : {
          reverse: false,
          amountIn: parsedAmountIn,
          reserveIn,
          reserveOut,
          slippageBps,
        };

  const { amountIn, amountOut, minAmountOut } = useSwapPreview(params);
  const parsedMinAmountOut = minAmountOut ?? BigInt(0);

  // ───── Input change handlers ─────
  const handleAmountInChange = (val: string) => {
    setFocusedInput('in');
    setAmountInStr(val);
    setAmountOutStr('');
  };

  const handleAmountOutChange = (val: string) => {
    setFocusedInput('out');
    setAmountOutStr(val);
    setAmountInStr('');
  };

  // ───── Simulate contract call (before actual execution) ─────
  const bestPath = useBestPath(tokenIn?.address, tokenOut?.address);
  const isMultihop = bestPath != null && bestPath.length > 2;

  const { data: simulation } = useSimulateContract({
    address: router_address,
    abi: routerABI,
    functionName: isMultihop ? 'multiHopSwap' : 'swapTokenForToken',
    args: isMultihop
      ? [
          bestPath, // [tokenA, WETH, tokenB]
          parsedAmountIn,
          parsedMinAmountOut,
        ]
      : [
          tokenIn?.address as `0x${string}`,
          tokenOut?.address as `0x${string}`,
          parsedAmountIn,
          parsedMinAmountOut,
        ],
    account: userAddress,
    chainId: arbitrum.id,
  });

  // ───── Execute swap flow (includes approval if needed) ─────
  const handleSwap = async () => {
    if (!tokenIn || !tokenOut || !userAddress) return;

    setApproveTxHash(null);
    setSwapTxHash(null);
    setIsApproving(false);
    setIsSwapping(false);

    try {
      // 1. Read allowance from tokenIn
      const allowanceTokenIn: bigint = await publicClient!.readContract({
        abi: ERC20Abi,
        address: tokenIn.address,
        functionName: 'allowance',
        args: [userAddress, router_address],
      });

      // 2. If not approved, approve router to spend tokenIn
      if (allowanceTokenIn < parsedAmountIn) {
        setIsApproving(true);
        try {
          const txHash = await writeContractAsync({
            address: tokenIn.address,
            abi: ERC20Abi,
            functionName: 'approve',
            args: [router_address, MAX_UINT256],
          });
          setApproveTxHash(txHash);
          await publicClient!.waitForTransactionReceipt({ hash: txHash });
        } catch (error) {
          console.error('Approval failed:', error);
          return;
        } finally {
          setIsApproving(false);
        }
      }

      // 3. Use simulated request to send swap tx
      if (!simulation?.request) {
        console.error('Simulation failed or missing');
        return;
      }

      setIsSwapping(true);
      try {
        const txHash = await writeContractAsync(simulation.request);
        setSwapTxHash(txHash);
        await publicClient!.waitForTransactionReceipt({ hash: txHash });
        console.log('Swap successful!');
      } catch (err) {
        console.error('Swap failed:', err);
      } finally {
        setIsSwapping(false);
      }
    } catch (err) {
      console.error('Swap flow error:', err);
    }
  };

  // ───── Swap tokenIn ↔ tokenOut and sync values ─────
  const handleSwapTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountInput(amountOutput);
    setAmountOutput(amountInput);
  };

  // ───── Fetch token balances ─────
  useEffect(() => {
    async function fetchBalances() {
      if (!userAddress || !publicClient) return;

      // Fetch balance for tokenIn
      if (tokenIn?.address) {
        try {
          const bal = await publicClient.readContract({
            address: tokenIn.address,
            abi: ERC20Abi,
            functionName: 'balanceOf',
            args: [userAddress],
          });
          setBalanceIn(bal as bigint);
        } catch {
          setBalanceIn(BigInt(0));
        }
      } else {
        setBalanceIn(BigInt(0));
      }

      // Fetch balance for tokenOut
      if (tokenOut?.address) {
        try {
          const bal = await publicClient.readContract({
            address: tokenOut.address,
            abi: ERC20Abi,
            functionName: 'balanceOf',
            args: [userAddress],
          });
          setBalanceOut(bal as bigint);
        } catch {
          setBalanceOut(BigInt(0));
        }
      } else {
        setBalanceOut(BigInt(0));
      }
    }

    fetchBalances();
  }, [tokenIn, tokenOut, userAddress, publicClient]);

  // ───── Format balances for display ─────
  const formattedTokenInBalance =
    balanceIn && typeof balanceIn === 'bigint'
      ? Number(formatUnits(balanceIn, tokenIn?.decimals ?? 18)).toLocaleString(
          undefined,
          {
            minimumFractionDigits: 0,
            maximumFractionDigits: 4,
          }
        )
      : '0';

  const formattedTokenOutBalance =
    balanceOut && typeof balanceOut === 'bigint'
      ? Number(
          formatUnits(balanceOut, tokenOut?.decimals ?? 18)
        ).toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 4,
        })
      : '0';

  // ───── Format reserves and input amounts as numbers ─────
  const reserveInNum = Number(formatUnits(reserveIn, tokenIn?.decimals ?? 18));
  const reserveOutNum = Number(
    formatUnits(reserveOut, tokenOut?.decimals ?? 18)
  );

  const amountInNum = amountInStr ? parseFloat(amountInStr) : 0;
  const amountOutNum = amountOutStr ? parseFloat(amountOutStr) : 0;

  // ───── USD price logic (mocked) ─────
  const priceTokenInUSD = getMockPrice(tokenIn?.symbol ?? '') ?? 0;
  const priceTokenOutUSD = getMockPrice(tokenOut?.symbol ?? '') ?? 0;

  const amountInUsd = amountInNum * priceTokenInUSD;
  const amountOutUsd = amountOutNum * priceTokenOutUSD;

  const formattedInUsd = amountInUsd.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedOutUsd = amountOutUsd.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // ───── Update exchange rate display ─────
  useEffect(() => {
    if (reserveInNum > 0) {
      const rate = reserveOutNum / reserveInNum;
      const formatted = rate.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      });
      setFormattedRate(formatted);
    } else {
      setFormattedRate('0');
    }
  }, [reserveInNum, reserveOutNum]);

  // ───── Update dependent amount string (in ↔ out) ─────
  useEffect(() => {
    if (focusedInput === 'in' && tokenOut) {
      if (!amountInStr) return setAmountOutStr('');
      if (amountOut !== undefined) {
        const formatted = formatUnits(amountOut, tokenOut.decimals);
        if (formatted !== amountOutStr) setAmountOutStr(formatted);
      }
    }
  }, [amountOut, focusedInput, tokenOut, amountOutStr, amountInStr]);

  useEffect(() => {
    if (focusedInput === 'out' && tokenIn) {
      if (!amountOutStr) return setAmountInStr('');
      if (amountIn !== undefined) {
        const formatted = formatUnits(amountIn, tokenIn.decimals);
        if (formatted !== amountInStr) setAmountInStr(formatted);
      }
    }
  }, [amountIn, focusedInput, tokenIn, amountInStr, amountOutStr]);

  // Reset focus state if both inputs are empty
  useEffect(() => {
    if (amountInStr) setFocusedInput('in');
    else if (amountOutStr) setFocusedInput('out');
    else setFocusedInput(null);
  }, [tokenIn, tokenOut, amountInStr, amountOutStr]);

  const isInsufficientBalance = parsedAmountIn > balanceIn;

  // ───── Loading overlay ─────
  if (isLoadingPools) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
        <Spinner />
      </div>
    );
  }

  // ───── Render form ──────────────────────
  return (
    <div className="max-w-md mx-auto p-4 bg-gradient-to-br from-[#1B002B] to-[#320148] rounded-[2rem] border border-purple-500 shadow-[0_0_30px_#a855f766] text-white relative">
      {/* Sell Section */}
      <div className="rounded-3xl border border-purple-500 p-4 mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-white">Sell</span>
          <TokenSelector
            token={tokenIn}
            onSelect={setTokenIn}
            tokens={allowedTokenIn}
          />
        </div>
        <div className="text-sm text-purple-300 pt-4">${formattedInUsd}</div>
        <div className="mt-2">
          <AmountInput value={amountInStr} onChange={handleAmountInChange} />
        </div>

        <div className="text-sm text-gray-500 py-1">
          Balance {formattedTokenInBalance}
        </div>

        <div className="mt-2 flex justify-end gap-2 text-xs">
          <button className="bg-[#320148] border border-purple-400 rounded-full px-2 py-0.5">
            25%
          </button>
          <button className="bg-[#320148] border border-purple-400 rounded-full px-2 py-0.5">
            50%
          </button>
          <button className="bg-[#320148] border border-purple-400 rounded-full px-2 py-0.5">
            Max
          </button>
        </div>
        {tokenIn && tokenOut && (
          <div className="flex justify-end text-xs text-purple-400 mt-1 py-1">
            1 {tokenIn.symbol} ≈ {formattedRate} {tokenOut.symbol}
          </div>
        )}
      </div>

      {/* Swap Icon */}
      <div className="flex justify-center my-3">
        <div className="w-10 h-10 rounded-full border border-purple-500 bg-[#220033] flex items-center justify-center shadow-[0_0_10px_#a855f755]">
          <Repeat
            className="cursor-pointer text-purple-400 hover:rotate-180 transition-transform"
            onClick={handleSwapTokens}
          />
        </div>
      </div>

      {/* Get Section */}
      <div className="rounded-3xl border border-purple-500 p-4 mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-white">Get</span>
          <TokenSelector
            token={tokenOut}
            onSelect={setTokenOut}
            tokens={allowedTokenOut}
          />
        </div>
        <div className="text-sm text-purple-300 pt-4">${formattedOutUsd}</div>
        <div className="mt-2">
          <AmountInput value={amountOutStr} onChange={handleAmountOutChange} />
          {isInsufficientBalance && (
            <p className="text-xs text-red-400 mt-1">Insufficient balance</p>
          )}
        </div>

        <div className="text-sm text-gray-500 py-1">
          Balance {formattedTokenOutBalance}
        </div>

        <div className="mt-2 flex justify-end gap-2 text-xs">
          <button className="bg-[#320148] border border-purple-400 rounded-full px-2 py-0.5">
            25%
          </button>
          <button className="bg-[#320148] border border-purple-400 rounded-full px-2 py-0.5">
            50%
          </button>
          <button className="bg-[#320148] border border-purple-400 rounded-full px-2 py-0.5">
            Max
          </button>
        </div>
      </div>

      {/* Transaction Status Messages */}
      <div className="min-h-[24px]">
        {isApproving && (
          <div className="flex items-center gap-2 text-sm text-yellow-300 mb-3">
            <span className="animate-spin border-2 border-t-transparent border-yellow-300 rounded-full w-4 h-4" />
            Approving token...
          </div>
        )}

        {approveTxHash && !isApproving && (
          <div className="text-xs text-green-400 mb-3">
            ✅ Approval confirmed.{' '}
            <a
              href={`https://arbiscan.io/tx/${approveTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View
            </a>
          </div>
        )}

        {isSwapping && (
          <div className="flex items-center gap-2 text-sm text-purple-300 mb-3">
            <span className="animate-spin border-2 border-t-transparent border-purple-300 rounded-full w-4 h-4" />
            Swapping tokens...
          </div>
        )}

        {swapTxHash && !isSwapping && (
          <div className="text-xs text-green-400 mb-3">
            ✅ Swap complete.{' '}
            <a
              href={`https://arbiscan.io/tx/${swapTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View
            </a>
          </div>
        )}
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleSwap}
        disabled={!amountOut || !tokenIn || !tokenOut}
        className={`mt-6 w-full py-3 rounded-full font-semibold transition duration-200 text-black
        ${
          amountOut && tokenIn && tokenOut
            ? 'bg-gradient-to-r from-purple-400 to-purple-300 hover:from-purple-500 hover:to-purple-400 shadow-[0_0_20px_#a855f777]'
            : 'bg-purple-900 cursor-not-allowed text-white opacity-50'
        }`}
      >
        Swap
      </button>

      {/* Footer */}
      <div className="flex justify-between text-xs text-purple-300 mt-4">
        <span>SwitchFi v1.0</span>
        <button
          onClick={onToggleSettings}
          className="flex items-center gap-1 hover:text-purple-200"
        >
          Slippage {slippagePercent}% <Settings size={14} />
        </button>
      </div>
    </div>
  );
};

export default SwapForm;
