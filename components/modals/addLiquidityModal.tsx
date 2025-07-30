'use client';

import { Fragment, useState } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { ERC20Abi } from '@/constants';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem/utils';
import { quote } from '../../utils/liquidityCalculations';
import { AddLiquidityModalProps } from '../../types/interfaces';
import { SwapSettingsModal } from '../modals/SwapSettings';
import Spinner from '../ui/Spinner';
import { Settings, PlusCircle } from 'lucide-react';
import BigNumber from 'bignumber.js';

const AddLiquidityModal = ({
  isOpen,
  onClose,
  liquidityWarning,
  setLiquidityWarning,
  handleAddLiquidity,
  token0,
  token1,
  decimals0,
  decimals1,
  reserveA,
  reserveB,
  symbolToken0,
  symbolToken1,
  price0,
  price1,
}: AddLiquidityModalProps) => {
  // ───── Connected user address ─────
  const { address: userAddress } = useAccount();

  // ───── Local state for input amounts and UI ─────
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);

  // ───── Fetch token balances for the connected user ─────
  const { data: tokenABalance } = useReadContract({
    address: token0,
    abi: ERC20Abi,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
  });

  const { data: tokenBBalance } = useReadContract({
    address: token1,
    abi: ERC20Abi,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
  });

  /** Handle changes for token A input */
  const handleAmountAChange = (value: string) => {
    setAmountA(value);
    if (liquidityWarning) setLiquidityWarning(null);

    const numericValue = parseFloat(value);
    if (!value || isNaN(numericValue) || numericValue <= 0) {
      // Reset B if invalid input
      setAmountB('');
      return;
    }

    try {
      // Convert input to raw units (BigInt)
      const amountADesired = BigInt(
        (numericValue * 10 ** decimals0!).toFixed(0)
      );
      let amountBOptimal: bigint = BigInt(0);

      // Calculate optimal token B amount based on reserves or prices
      if (reserveA > BigInt(0) && reserveB > BigInt(0)) {
        amountBOptimal = quote(amountADesired, reserveA, reserveB);
      } else if (price0 && price1) {
        // Fallback: use token prices to approximate amount B
        const usdValue = numericValue * price0;
        const tokenBAmount = usdValue / price1;
        amountBOptimal = BigInt((tokenBAmount * 10 ** decimals1!).toFixed(0));
      } else {
        setAmountB('');
        return;
      }

      if (amountBOptimal === BigInt(0)) {
        setLiquidityWarning('Insufficient liquidity for this amount.');
        setAmountB('');
        return;
      }

      // Format optimal amount B to decimal string for display
      const formattedAmountB = new BigNumber(amountBOptimal.toString())
        .dividedBy(new BigNumber(10).pow(decimals1!))
        .toFixed();

      setAmountB(formattedAmountB);
    } catch (error) {
      console.error('Error calculating amountB:', error);
      setAmountB('');
      setLiquidityWarning('Invalid amount or calculation error.');
    }
  };

  /** Handle changes for token B input (similar logic, reversed) */
  const handleAmountBChange = (value: string) => {
    setAmountB(value);
    if (liquidityWarning) setLiquidityWarning(null);

    const numericValue = parseFloat(value);
    if (!value || isNaN(numericValue) || numericValue <= 0) {
      setAmountA('');
      return;
    }

    try {
      const amountBDesired = BigInt(
        new BigNumber(numericValue)
          .multipliedBy(new BigNumber(10).pow(decimals1!))
          .toFixed(0)
      );
      let amountAOptimal: bigint = BigInt(0);

      if (reserveA > BigInt(0) && reserveB > BigInt(0)) {
        amountAOptimal = quote(amountBDesired, reserveB, reserveA);
      } else if (price0 && price1) {
        const usdValue = numericValue * price1;
        const tokenAAmount = usdValue / price0;
        amountAOptimal = BigInt(
          new BigNumber(tokenAAmount)
            .multipliedBy(new BigNumber(10).pow(decimals0!))
            .toFixed(0)
        );
      } else {
        setAmountA('');
        return;
      }

      if (amountAOptimal === BigInt(0)) {
        setLiquidityWarning('Insufficient liquidity for this amount.');
        setAmountA('');
        return;
      }

      const formattedAmountA = new BigNumber(amountAOptimal.toString())
        .dividedBy(new BigNumber(10).pow(decimals0!)) // corrected decimals here
        .toFixed();

      setAmountA(formattedAmountA);
    } catch (error) {
      console.error('Error calculating amountA:', error);
      setAmountA('');
      setLiquidityWarning('Invalid amount or calculation error.');
    }
  };

  /** Handle clicking MAX for token A balance */
  const handleMaxA = () => {
    if (!tokenABalance || !decimals0 || !decimals1 || (!price0 && !reserveA))
      return;

    const maxTokenA = new BigNumber(formatUnits(tokenABalance, decimals0));
    let amountBOptimal = new BigNumber(0);

    if (reserveA > BigInt(0) && reserveB > BigInt(0)) {
      const amountADesired = BigInt(
        maxTokenA.multipliedBy(new BigNumber(10).pow(decimals0)).toFixed(0)
      );
      const amountB = quote(amountADesired, reserveA, reserveB);
      amountBOptimal = new BigNumber(amountB.toString()).dividedBy(
        new BigNumber(10).pow(decimals1)
      );
    } else if (price0 && price1) {
      const usdValue = maxTokenA.multipliedBy(price0);
      amountBOptimal = usdValue.dividedBy(price1);
    }

    const maxTokenB = new BigNumber(
      formatUnits(tokenBBalance ?? BigInt(0), decimals1)
    );
    if (amountBOptimal.gt(maxTokenB)) {
      // Adjust amounts to max balances if token B is limiting
      if (!price0 || !price1) return;
      const usdB = maxTokenB.multipliedBy(price1);
      const adjustedTokenA = usdB.dividedBy(price0);

      setAmountA(adjustedTokenA.toFixed(6));
      setAmountB(maxTokenB.toFixed(6));
    } else {
      setAmountA(maxTokenA.toFixed(6));
      setAmountB(amountBOptimal.toFixed(6));
    }
  };

  /** Handle clicking MAX for token B balance */
  const handleMaxB = () => {
    if (!tokenBBalance || !decimals0 || !decimals1 || (!price1 && !reserveB))
      return;

    const maxTokenB = new BigNumber(formatUnits(tokenBBalance, decimals1));
    let amountAOptimal = new BigNumber(0);

    if (reserveA > BigInt(0) && reserveB > BigInt(0)) {
      const amountBDesired = BigInt(
        maxTokenB.multipliedBy(new BigNumber(10).pow(decimals1)).toFixed(0)
      );
      const amountA = quote(amountBDesired, reserveB, reserveA);
      amountAOptimal = new BigNumber(amountA.toString()).dividedBy(
        new BigNumber(10).pow(decimals0)
      );
    } else if (price0 && price1) {
      const usdValue = maxTokenB.multipliedBy(price1);
      amountAOptimal = usdValue.dividedBy(price0);
    }

    const maxTokenA = new BigNumber(
      formatUnits(tokenABalance ?? BigInt(0), decimals0)
    );
    if (amountAOptimal.gt(maxTokenA)) {
      if (!price0 || !price1) return;
      const usdA = maxTokenA.multipliedBy(price0);
      const adjustedTokenB = usdA.dividedBy(price1);

      setAmountA(maxTokenA.toFixed(6));
      setAmountB(adjustedTokenB.toFixed(6));
    } else {
      setAmountB(maxTokenB.toFixed(6));
      setAmountA(amountAOptimal.toFixed(6));
    }
  };

  // ───── Format balances for UI display ─────
  const formattedTokenABalance = tokenABalance
    ? parseFloat(formatUnits(tokenABalance, decimals0 ?? 18)).toFixed(2)
    : '0.00';

  const formattedTokenBBalance = tokenBBalance
    ? parseFloat(formatUnits(tokenBBalance, decimals1 ?? 18)).toFixed(2)
    : '0.00';

  // ───── Validation: Check if inputs exceed balances or are invalid ─────
  const exceedsBalanceA =
    parseFloat(amountA || '0') > parseFloat(formattedTokenABalance);
  const exceedsBalanceB =
    parseFloat(amountB || '0') > parseFloat(formattedTokenBBalance);
  const isAmountAInvalid = amountA === '' || parseFloat(amountA) <= 0;
  const isAmountBInvalid = amountB === '' || parseFloat(amountB) <= 0;

  /** Handle submitting the add liquidity action */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const success = await handleAddLiquidity(amountA, amountB);
      if (success) onClose();
    } catch (error) {
      console.error('Add liquidity failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop with fade */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md" />
        </TransitionChild>

        {/* Modal container centered */}
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md rounded-2xl bg-[#1a002c] p-6 text-white shadow-xl border border-purple-900">
                {/* Header with title and settings button */}
                <div className="flex items-center justify-between gap-2">
                  <DialogTitle className="text-lg font-semibold text-purple-300 mb-4">
                    Add Liquidity
                  </DialogTitle>
                  <button
                    type="button"
                    aria-label="Toggle slippage tolerance settings"
                    onClick={() =>
                      setShowSlippageSettings(!showSlippageSettings)
                    }
                    className="p-1 rounded hover:bg-gray-700 transition cursor-pointer"
                  >
                    <Settings className="w-6 h-6 text-gray-300 pb-1" />
                  </button>
                </div>

                {/* Show Slippage Settings modal overlay */}
                {showSlippageSettings && (
                  <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <SwapSettingsModal
                      isOpen={showSlippageSettings}
                      onClose={() => setShowSlippageSettings(false)}
                      slippage={slippage}
                      setSlippage={setSlippage}
                    />
                  </div>
                )}

                {/* Liquidity warning message */}
                {liquidityWarning && (
                  <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md mb-4 text-sm">
                    {liquidityWarning}
                  </div>
                )}

                {/* Input fields for token amounts */}
                <div className="space-y-4">
                  {/* Token A input */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="amountA" className="text-sm font-medium">
                        Amount {symbolToken0}
                      </label>
                      <div className="mt-2 flex items-center justify-end gap-2 text-xs">
                        Balance: {formattedTokenABalance}{' '}
                        <button
                          type="button"
                          onClick={handleMaxA}
                          className="bg-[#320148] border border-purple-400 rounded-full px-2 py-0.5"
                        >
                          MAX
                        </button>
                      </div>
                    </div>
                    <input
                      id="amountA"
                      type="number"
                      min="0"
                      step="any"
                      className={`w-full rounded-xl bg-gray-800/80 px-4 py-3 text-sm text-white shadow-inner border transition-all duration-800 ${
                        exceedsBalanceA
                          ? 'border-red-500'
                          : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500'
                      }`}
                      value={amountA}
                      onChange={(e) => handleAmountAChange(e.target.value)}
                      placeholder={`Enter amount of ${symbolToken0}`}
                    />
                    <p className="flex items-center justify-start text-xs text-gray-400 mt-1">
                      ≈ $
                      {(
                        parseFloat(amountA || '0') * (price0 ?? 0)
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      USD
                    </p>
                    {amountA !== '' && isAmountAInvalid && !exceedsBalanceA && (
                      <p className="text-xs text-red-500 mt-1">
                        Please enter a valid amount greater than 0.
                      </p>
                    )}
                    {amountA !== '' && exceedsBalanceA && (
                      <p className="text-xs text-red-500 mt-1">
                        Amount exceeds available balance.
                      </p>
                    )}
                  </div>

                  {/* Token B input */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="amountB" className="text-sm font-medium">
                        Amount {symbolToken1}
                      </label>
                      <div className="mt-2 flex items-center justify-end gap-2 text-xs">
                        Balance: {formattedTokenBBalance}{' '}
                        <button
                          type="button"
                          onClick={handleMaxB}
                          className="bg-[#320148] border border-purple-400 rounded-full px-2 py-0.5"
                        >
                          MAX
                        </button>
                      </div>
                    </div>
                    <input
                      id="amountB"
                      type="number"
                      min="0"
                      step="any"
                      className={`w-full rounded-xl bg-gray-800/80 px-4 py-3 text-sm text-white shadow-inner border transition-all duration-800 ${
                        exceedsBalanceB
                          ? 'border-red-500'
                          : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500'
                      }`}
                      value={amountB}
                      onChange={(e) => handleAmountBChange(e.target.value)}
                      placeholder={`Enter amount of ${symbolToken1}`}
                    />
                    <p className="flex items-center justify-start text-xs text-gray-400 mt-1">
                      ≈ $
                      {(
                        parseFloat(amountB || '0') * (price1 ?? 0)
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      USD
                    </p>
                    {amountB !== '' && isAmountBInvalid && !exceedsBalanceB && (
                      <p className="text-xs text-red-500 mt-1">
                        Please enter a valid amount greater than 0.
                      </p>
                    )}
                    {amountB !== '' && exceedsBalanceB && (
                      <p className="text-xs text-red-500 mt-1">
                        Amount exceeds available balance.
                      </p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="bg-purple-500 hover:bg-purple-600 transition-colors text-white font-semibold px-6 py-4 rounded-xl shadow-md"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-4 rounded-xl shadow-md"
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting ||
                      exceedsBalanceA ||
                      exceedsBalanceB ||
                      isAmountAInvalid ||
                      isAmountBInvalid
                    }
                  >
                    {isSubmitting ? (
                      <Spinner />
                    ) : (
                      <>
                        Add Liquidity
                        <PlusCircle className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddLiquidityModal;
