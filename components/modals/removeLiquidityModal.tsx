import { Fragment, useState, useMemo } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import Spinner from '../ui/Spinner';
import { formatUnits, parseUnits } from 'viem';
import { RemoveLiquidityModalProps } from '../../types/interfaces';
import { MinusCircle } from 'lucide-react';

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
  // ───── Local state for user input and UI states ─────
  const [liquidityAmount, setLiquidityAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ───── Format user's LP token balance for display ─────
  const formattedBalance =
    balanceLP && lpDecimals ? formatUnits(balanceLP, lpDecimals) : '0.00';

  // ───── Parse liquidity amount input and balance to numbers ─────
  const parsedLiquidityAmount = parseFloat(liquidityAmount || '0');
  const parsedBalance = parseFloat(formattedBalance || '0');

  // ───── Validation flags for input ─────
  const isAmountEmpty = liquidityAmount === '';
  const isAmountZeroOrNegative = parsedLiquidityAmount <= 0;
  const exceedsLPBalance =
    !isAmountEmpty && parsedLiquidityAmount > parsedBalance;

  // ───── Validation error message logic ─────
  let validationError: string | null = null;
  if (isAmountEmpty) {
    validationError = null;
  } else if (isAmountZeroOrNegative) {
    validationError = 'Amount must be greater than zero.';
  } else if (exceedsLPBalance) {
    validationError = 'Amount exceeds your LP token balance.';
  }

  // ───── Compute expected token amounts returned on removing liquidity ─────
  const [expectedAmount0, expectedAmount1] = useMemo(() => {
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
      const liquidityBN = parseUnits(liquidityAmount, lpDecimals ?? 18);

      // Calculate proportional token amounts from reserves
      const amount0 = (reserves[0] * liquidityBN) / lpTotalSupply;
      const amount1 = (reserves[1] * liquidityBN) / lpTotalSupply;

      // Format amounts with decimals and round to 2 decimals for display
      return [
        Number(formatUnits(amount0, decimals0 ?? 18)).toFixed(2),
        Number(formatUnits(amount1, decimals1 ?? 18)).toFixed(2),
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

  // ───── Handle form submission for removing liquidity ─────
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

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50" onClose={onClose}>
        {/* Backdrop with blur */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md" />
        </TransitionChild>

        {/* Modal panel container centered on screen */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-md rounded-2xl bg-[#1a002c] p-6 text-white shadow-xl border border-purple-900">
              {/* Modal title */}
              <DialogTitle className="text-lg font-semibold text-purple-300 mb-4">
                Remove Liquidity
              </DialogTitle>

              {/* Pool info */}
              <p className="mb-4">
                Pool: {symbolToken0} / {symbolToken1}
              </p>

              {/* User's LP balance */}
              <p className="text-sm text-yellow-400 mb-4">
                Your LP Balance: {formattedBalance}
              </p>

              {/* Input section */}
              <div className="space-y-2">
                <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                  <label
                    htmlFor="liquidityAmount"
                    className="text-sm font-medium"
                  >
                    Amount of LP tokens to remove
                  </label>
                  {/* MAX button fills input with max balance */}
                  <button
                    type="button"
                    onClick={() => {
                      if (formattedBalance !== 'Loading...') {
                        setLiquidityAmount(formattedBalance);
                        if (error) setError(null);
                      }
                    }}
                    className="bg-[#320148] border border-purple-400 rounded-full px-2 py-0.5"
                  >
                    MAX
                  </button>
                </div>
                <input
                  id="liquidityAmount"
                  type="number"
                  min="0"
                  step="any"
                  className={`w-full rounded-xl bg-gray-800/80 px-4 py-3 text-sm text-white shadow-inner border transition-all duration-300 ${
                    validationError
                      ? 'border-red-500'
                      : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500'
                  }`}
                  value={liquidityAmount}
                  onChange={(e) => {
                    setLiquidityAmount(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter LP token amount"
                />
                {/* Validation and error messages */}
                {validationError && (
                  <p className="text-xs text-red-500 mt-1">{validationError}</p>
                )}
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>

              {/* Show expected token amounts if calculated */}
              {expectedAmount0 && expectedAmount1 && (
                <div className="mt-4">
                  <p className="text-gray-400 mb-1">Estimated received:</p>
                  <ul className="ml-4 list-disc text-sm text-purple-300">
                    <li>
                      {expectedAmount0} {symbolToken0} tokens
                    </li>
                    <li>
                      {expectedAmount1} {symbolToken1} tokens
                    </li>
                  </ul>
                </div>
              )}

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
                  onClick={handleSubmit}
                  disabled={isSubmitting || !!validationError || isAmountEmpty}
                  className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-4 rounded-xl shadow-md disabled:opacity-50 transition"
                >
                  {isSubmitting ? (
                    <Spinner />
                  ) : (
                    <>
                      Remove Liquidity
                      <MinusCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default RemoveLiquidityModal;
