'use client';

import { Fragment, useState } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { formatUnits } from 'viem';
import { RemoveLiquidityModalProps } from '../../types/interfaces';

const RemoveLiquidityModal = ({
  isOpen,
  onClose,
  handleRemoveLiquidity,
  symbolToken0,
  symbolToken1,
  lpDecimals,
  balanceLP,
}: RemoveLiquidityModalProps) => {
  /** ----------------------- State ----------------------- */

  const [liquidityAmount, setLiquidityAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** ----------------------- Format LP Balance ----------------------- */

  const formattedBalance =
    balanceLP && lpDecimals ? formatUnits(balanceLP, lpDecimals) : '0';

  const parsedLiquidityAmount = parseFloat(liquidityAmount || '0');
  const parsedBalance = parseFloat(formattedBalance || '0');

  const isAmountEmpty = liquidityAmount === '';
  const isAmountZeroOrNegative = parsedLiquidityAmount <= 0;
  const exceedsLPBalance =
    !isAmountEmpty && parsedLiquidityAmount > parsedBalance;

  let validationError: string | null = null;
  if (isAmountEmpty) {
    validationError = null; // no error if empty input yet
  } else if (isAmountZeroOrNegative) {
    validationError = 'Amount must be greater than zero.';
  } else if (exceedsLPBalance) {
    validationError = 'Amount exceeds your LP token balance.';
  }

  /** ----------------------- Handle Remove Liquidity Submit ----------------------- */

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const success = await handleRemoveLiquidity(liquidityAmount);
      if (success) {
        onClose();
        setLiquidityAmount('');
      } else {
        setError(
          'Failed to remove liquidity. Please check the amount and try again.'
        );
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Remove liquidity failed:', err);
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
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all text-white">
                <DialogTitle
                  as="h3"
                  className="text-lg font-semibold leading-6 mb-4"
                >
                  Remove Liquidity
                </DialogTitle>

                <p className="mb-4">
                  Pool: {symbolToken0} / {symbolToken1}
                </p>

                <p className="text-sm text-yellow-400 mb-1">
                  Your LP Balance: {formattedBalance}
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex justify-between items-center">
                      <label
                        htmlFor="liquidityAmount"
                        className="text-sm font-medium"
                      >
                        Amount of LP tokens to remove
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (formattedBalance !== 'Loading...') {
                            setLiquidityAmount(formattedBalance);
                            if (error) setError(null);
                          }
                        }}
                        className="ml-2 px-2 py-0.5 rounded text-gray-400 hover:bg-gray-700 hover:text-gray-200 cursor-pointer select-none"
                      >
                        MAX
                      </button>
                    </div>
                    <input
                      id="liquidityAmount"
                      type="number"
                      min="0"
                      step="any"
                      className="w-full rounded-md border border-gray-700 bg-gray-800 p-2 text-white"
                      value={liquidityAmount}
                      onChange={(e) => {
                        setLiquidityAmount(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Enter LP token amount"
                      required
                    />
                    {validationError && (
                      <div className="text-red-400 text-sm mt-1">
                        {validationError}
                      </div>
                    )}
                  </div>
                  {error && (
                    <div className="text-red-400 text-sm mt-1">{error}</div>
                  )}
                </div>

                {/* Action buttons: Cancel and Remove Liquidity */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="rounded-md border border-gray-600 px-4 py-2 text-sm hover:bg-gray-800"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting || !!validationError || isAmountEmpty
                    }
                  >
                    {isSubmitting ? 'Removing...' : 'Remove Liquidity'}
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

export default RemoveLiquidityModal;
