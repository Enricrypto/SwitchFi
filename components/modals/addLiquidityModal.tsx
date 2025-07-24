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
  const { address: userAddress } = useAccount();

  /** ----------------------- State ----------------------- */

  const [amountA, setAmountA] = useState(''); // user input for token A
  const [amountB, setAmountB] = useState(''); // user input for token B
  const [isSubmitting, setIsSubmitting] = useState(false); // tracks form submission

  /** ----------------------- Read User Balances ----------------------- */

  // Read the balance of token0 for the connected user
  const { data: tokenABalance } = useReadContract({
    address: token0,
    abi: ERC20Abi,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
  });

  // Read the balance of token1 for the connected user
  const { data: tokenBBalance } = useReadContract({
    address: token1,
    abi: ERC20Abi,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
  });

  /** ----------------------- Handle Input Changes ----------------------- */

  // When the user updates amount for token A
  const handleAmountAChange = (value: string) => {
    setAmountA(value);
    if (liquidityWarning) setLiquidityWarning(null);

    const numericValue = parseFloat(value);
    if (!value || isNaN(numericValue) || numericValue <= 0) {
      setAmountB('');
      return;
    }

    try {
      // Convert to base units
      const amountADesired = BigInt(
        (numericValue * 10 ** decimals0!).toFixed(0)
      );
      let amountBOptimal: bigint = BigInt(0);

      // Calculate optimal token B amount using reserves or prices
      // When reserves exist in the pool (reserveA > 0 && reserveB > 0), you call
      // quote(amountIn, reserveIn, reserveOut) to maintain the pool ratio.
      // When reserves are empty (new pool or no liquidity), you fall back to USD prices
      // (price0 and price1) to calculate the equivalent amount of the other token.
      if (reserveA > BigInt(0) && reserveB > BigInt(0)) {
        amountBOptimal = quote(amountADesired, reserveA, reserveB);
      } else if (price0 && price1) {
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

      // Format for display
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

  // When the user updates amount for token B
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

      // Calculate optimal token A amount
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
        .dividedBy(new BigNumber(10).pow(decimals1!))
        .toFixed();
      setAmountA(formattedAmountA);
    } catch (error) {
      console.error('Error calculating amountA:', error);
      setAmountA('');
      setLiquidityWarning('Invalid amount or calculation error.');
    }
  };

  /** ----------------------- Handle MAX Buttons ----------------------- */

  // Max button for token A: fill max available token A and calculate required token B
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

    // Ensure user also has enough token B
    const maxTokenB = new BigNumber(
      formatUnits(tokenBBalance ?? BigInt(0), decimals1)
    );
    if (amountBOptimal.gt(maxTokenB)) {
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

  // Max button for token B: fill max available token B and calculate required token A
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

  /** ----------------------- Format Balances for Display ----------------------- */

  const formattedTokenABalance = tokenABalance
    ? formatUnits(tokenABalance, decimals0 ?? 18)
    : 0;
  const formattedTokenBBalance = tokenBBalance
    ? formatUnits(tokenBBalance, decimals1 ?? 18)
    : 0;

  // Validation helpers
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
        onClose(); // Close modal on success
      }
    } catch (error) {
      console.error('Add liquidity failed:', error);
      // Optional: notify user of failure
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
                          onClick={() => handleMaxA()}
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
                    <p className="text-xs text-gray-400 mt-1">
                      ≈ $
                      {(parseFloat(amountA || '0') * (price0 ?? 0)).toFixed(2)}{' '}
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

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="amountB" className="text-sm font-medium">
                        Amount {symbolToken1}
                      </label>
                      <div className="text-xs text-yellow-400">
                        Balance: {formattedTokenBBalance}{' '}
                        <button
                          type="button"
                          onClick={handleMaxB}
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
                        exceedsBalanceB
                          ? 'border-red-500'
                          : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500'
                      }`}
                      value={amountB}
                      onChange={(e) => handleAmountBChange(e.target.value)}
                      placeholder={`Enter amount of ${symbolToken1}`}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      ≈ $
                      {(parseFloat(amountB || '0') * (price1 ?? 0)).toFixed(2)}{' '}
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
