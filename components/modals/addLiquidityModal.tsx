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
import Spinner from '../ui/Spinner';
import { PlusCircle } from 'lucide-react';

const AddLiquidityModal = ({
  isOpen,
  onClose,
  liquidityWarning,
  setLiquidityWarning,
  handleAddLiquidity,
  token0,
  token1,
  decimalsToken0,
  decimalsToken1,
  reserveA,
  reserveB,
  symbolToken0,
  symbolToken1,
}: AddLiquidityModalProps) => {
  const { address: userAddress } = useAccount();

  /** ----------------------- State ----------------------- */

  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeInput, setActiveInput] = useState<'A' | 'B' | null>(null);

  /** ----------------------- Read User Balances ----------------------- */

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

  const handleAmountAChange = (value: string) => {
    setActiveInput('A');
    setAmountA(value);

    // Reset liquidity warning on input
    if (liquidityWarning) setLiquidityWarning(null);

    // Early exit if value is empty or non-positive
    const numericValue = parseFloat(value);
    if (!value || isNaN(numericValue) || numericValue <= 0) {
      setAmountB('');
      return;
    }

    // Ensure required values exist
    if (
      decimalsToken0 != null &&
      decimalsToken1 != null &&
      reserveA > BigInt(0) &&
      reserveB > BigInt(0)
    ) {
      try {
        const amountADesired = BigInt(
          (numericValue * 10 ** decimalsToken0).toFixed(0)
        );

        const amountBOptimal = quote(amountADesired, reserveA, reserveB);

        // If result is zero, something is wrong
        if (amountBOptimal === BigInt(0)) {
          setLiquidityWarning('Insufficient liquidity for this amount.');
          setAmountB('');
          return;
        }

        const formattedAmountB = (
          Number(amountBOptimal) /
          10 ** decimalsToken1
        ).toLocaleString();

        setAmountB(formattedAmountB);
      } catch (error) {
        console.error('Error calculating optimal amountB:', error);
        setAmountB('');
        setLiquidityWarning('Invalid amount or calculation error.');
      }
    } else {
      // No reserves — assume new pool or zero liquidity
      setAmountB('');
    }
  };

  const handleAmountBChange = (value: string) => {
    setActiveInput('B');
    setAmountB(value);

    // Reset warning if it was previously shown
    if (liquidityWarning) setLiquidityWarning(null);

    const numericValue = parseFloat(value);
    if (!value || isNaN(numericValue) || numericValue <= 0) {
      setAmountA('');
      return;
    }

    if (
      decimalsToken0 != null &&
      decimalsToken1 != null &&
      reserveA > BigInt(0) &&
      reserveB > BigInt(0)
    ) {
      try {
        const amountBDesired = BigInt(
          (numericValue * 10 ** decimalsToken1).toFixed(0)
        );

        const amountAOptimal = quote(amountBDesired, reserveB, reserveA); // flipped reserves

        if (amountAOptimal === BigInt(0)) {
          setLiquidityWarning('Insufficient liquidity for this amount.');
          setAmountA('');
          return;
        }

        const formattedAmountA = (
          Number(amountAOptimal) /
          10 ** decimalsToken0
        ).toLocaleString();

        setAmountA(formattedAmountA);
      } catch (error) {
        console.error('Error calculating optimal amountA:', error);
        setAmountA('');
        setLiquidityWarning('Invalid amount or calculation error.');
      }
    } else {
      // No liquidity — blank the opposite input
      setAmountA('');
    }
  };

  /** ----------------------- Format Balances for Display ----------------------- */

  const formattedTokenABalance = tokenABalance
    ? formatUnits(tokenABalance, decimalsToken0 ?? 18)
    : 0;
  const formattedTokenBBalance = tokenBBalance
    ? formatUnits(tokenBBalance, decimalsToken1 ?? 18)
    : 0;

  const exceedsBalanceA =
    parseFloat(amountA || '0') > parseFloat(formattedTokenABalance.toString());
  const exceedsBalanceB =
    parseFloat(amountB || '0') > parseFloat(formattedTokenBBalance.toString());

  const isAmountAInvalid = amountA === '' || parseFloat(amountA) <= 0;
  const isAmountBInvalid = amountB === '' || parseFloat(amountB) <= 0;

  /** ----------------------- Handle Add Liquidity Submit ----------------------- */

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const success = await handleAddLiquidity(amountA, amountB);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Add liquidity failed:', error);
      // Optionally add user-visible error handling here (e.g., toast notifications)
    } finally {
      setIsSubmitting(false);
    }
  };

  /** ----------------------- Modal UI ----------------------- */

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop transition */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Dark semi-transparent overlay behind the modal */}
          <div className="fixed inset-0 bg-black bg-opacity-60 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            {/* Modal panel transition */}
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* Modal content container */}
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-md border border-white/10 p-8 text-left align-middle shadow-2xl transition-all text-white">
                <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
                  Add Liquidity
                </DialogTitle>

                {liquidityWarning && (
                  <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md mb-4 text-sm">
                    {liquidityWarning}
                  </div>
                )}

                {/* Input fields for token amounts */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="amountA" className="text-sm font-medium">
                        Amount {symbolToken0}
                      </label>
                      <div className="text-xs text-yellow-400">
                        Balance: {formattedTokenABalance}{' '}
                        <button
                          type="button"
                          onClick={() =>
                            setAmountA(formattedTokenABalance.toString())
                          }
                          className="ml-2 px-2 py-0.5 rounded text-gray-400 hover:bg-gray-700 hover:text-gray-200 cursor-pointer select-none"
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

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="amountB" className="text-sm font-medium">
                        Amount {symbolToken1}
                      </label>
                      <div className="text-xs text-yellow-400">
                        Balance: {formattedTokenBBalance}{' '}
                        <button
                          type="button"
                          onClick={() =>
                            setAmountB(formattedTokenBBalance.toString())
                          }
                          className="ml-2 px-2 py-0.5 rounded text-gray-400 hover:bg-gray-700 hover:text-gray-200 cursor-pointer select-none"
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
                        exceedsBalanceA
                          ? 'border-red-500'
                          : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500'
                      }`}
                      value={amountB}
                      onChange={(e) => handleAmountBChange(e.target.value)}
                      placeholder={`Enter amount of ${symbolToken1}`}
                    />
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

                {/* Action buttons: Cancel and Add Liquidity */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-base font-semibold text-zinc-300 hover:bg-white/5 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <div>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-6 py-3 text-base font-semibold text-white transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleSubmit}
                      disabled={
                        isSubmitting ||
                        exceedsBalanceA ||
                        exceedsBalanceB ||
                        isAmountAInvalid ||
                        isAmountBInvalid
                      }
                    >
                      {isSubmitting && <Spinner />}
                      {!isSubmitting && (
                        <>
                          Add Liquidity
                          <PlusCircle className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
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
