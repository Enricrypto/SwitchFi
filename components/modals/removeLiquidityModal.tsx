'use client';

import { Fragment, useState, useMemo } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { formatUnits, parseUnits } from 'viem';
import { RemoveLiquidityModalProps } from '../../types/interfaces';

const RemoveLiquidityModal = ({
  isOpen,
  onClose,
  handleRemoveLiquidity,
  symbolToken0,
  symbolToken1,
  lpDecimals,
  balanceLP,
  reserves,
  lpTotalSupply,
  decimals0,
  decimals1,
}: RemoveLiquidityModalProps) => {
  /** ----------------------- State ----------------------- */

  // Amount of LP tokens user wants to remove
  const [liquidityAmount, setLiquidityAmount] = useState('');
  // Submission status for disabling buttons and showing loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Local error message to display validation or transaction errors
  const [error, setError] = useState<string | null>(null);

  /** ----------------------- Format LP Balance ----------------------- */

  // Format user's LP token balance from BigInt to human-readable string
  const formattedBalance =
    balanceLP && lpDecimals ? formatUnits(balanceLP, lpDecimals) : '0';

  // Parse amounts for validation
  const parsedLiquidityAmount = parseFloat(liquidityAmount || '0');
  const parsedBalance = parseFloat(formattedBalance || '0');

  // Validation flags for input amount
  const isAmountEmpty = liquidityAmount === '';
  const isAmountZeroOrNegative = parsedLiquidityAmount <= 0;
  const exceedsLPBalance =
    !isAmountEmpty && parsedLiquidityAmount > parsedBalance;

  // Validation error message depending on input state
  let validationError: string | null = null;
  if (isAmountEmpty) {
    validationError = null; // no error if input is empty yet
  } else if (isAmountZeroOrNegative) {
    validationError = 'Amount must be greater than zero.';
  } else if (exceedsLPBalance) {
    validationError = 'Amount exceeds your LP token balance.';
  }

  /** ----------------------- Compute Expected Token Amounts ----------------------- */

  // Calculate expected amounts of token0 and token1 received when removing liquidity
  const [expectedAmount0, expectedAmount1] = useMemo(() => {
    // Validate inputs before calculation
    if (
      !liquidityAmount ||
      !lpTotalSupply ||
      isNaN(Number(liquidityAmount)) ||
      Number(liquidityAmount) <= 0 ||
      lpTotalSupply === BigInt(0)
    ) {
      return [null, null];
    }

    try {
      // Convert input amount to BigInt with correct decimals
      const liquidityBN = parseUnits(liquidityAmount, lpDecimals ?? 18);

      // Calculate proportional amounts of token0 and token1 based on reserves and total LP supply
      const amount0 = (reserves[0] * liquidityBN) / lpTotalSupply;
      const amount1 = (reserves[1] * liquidityBN) / lpTotalSupply;

      // Format calculated amounts to human-readable strings
      return [
        formatUnits(amount0, decimals0 ?? 18),
        formatUnits(amount1, decimals1 ?? 18),
      ];
    } catch (err) {
      console.error('Error computing expected token amounts:', err);
      return [null, null];
    }
  }, [
    liquidityAmount,
    reserves,
    lpTotalSupply,
    lpDecimals,
    decimals0,
    decimals1,
  ]);

  /** ----------------------- Handle Remove Liquidity Submit ----------------------- */

  // Called when user confirms removal of liquidity
  const handleSubmit = async () => {
    setIsSubmitting(true); // disable inputs and buttons
    setError(null); // clear previous errors

    try {
      // Call parent handler, passing the amount to remove
      const success = await handleRemoveLiquidity(liquidityAmount);
      if (success) {
        onClose(); // close modal on success
        setLiquidityAmount(''); // reset input
      } else {
        setError(
          'Failed to remove liquidity. Please check the amount and try again.'
        );
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Remove liquidity failed:', err);
    } finally {
      setIsSubmitting(false); // re-enable inputs/buttons
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
                    {/* Input for specifying LP token amount to remove */}
                    <div className="mb-1 flex justify-between items-center">
                      <label
                        htmlFor="liquidityAmount"
                        className="text-sm font-medium"
                      >
                        Amount of LP tokens to remove
                      </label>
                      {/* MAX button sets input to full LP balance */}
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
                    {/* Show validation error message for input */}
                    {validationError && (
                      <div className="text-red-400 text-sm mt-1">
                        {validationError}
                      </div>
                    )}
                  </div>
                  {/* Show submission or other errors */}
                  {error && (
                    <div className="text-red-400 text-sm mt-1">{error}</div>
                  )}
                </div>

                {/* Display estimated token amounts user will receive on removal */}
                {expectedAmount0 && expectedAmount1 && (
                  <div className="mt-3">
                    <p className="text-gray-400">Estimated received:</p>
                    <ul className="mt-1 ml-4 list-disc text-sm text-purple-300">
                      <li>
                        {expectedAmount0} {symbolToken0}
                        {' tokens'}
                      </li>
                      <li>
                        {expectedAmount1} {symbolToken1} {' tokens'}
                      </li>
                    </ul>
                  </div>
                )}

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
                    // Disable submit if submitting, input invalid or empty
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
