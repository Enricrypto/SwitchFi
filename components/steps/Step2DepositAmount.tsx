'use client';

import { useEffect } from 'react';
import { useTokenListStore } from '@/store/useTokenListStore';
import PoolHeader from '@/components/create-pool/PoolHeader';
import TokenIcon from '@/components/ui/TokenIcon';
import { Step2DepositAmountProps } from '@/types/interfaces';

export default function Step2DepositAmount({
  tokenA,
  tokenB,
  tokenObjA,
  tokenObjB,
  amountA,
  amountB,
  setAmounts,
  onNext,
  onBack,
  poolReserves,
  setReviewData,
  feeTier,
}: Step2DepositAmountProps) {
  const tokenList = useTokenListStore((state) => state.tokenList);
  const prices = useTokenListStore((state) => state.prices);

  // Use the passed tokenObj if available; otherwise, lookup in tokenList
  const tokenAData =
    tokenObjA ??
    tokenList.find((t) => t.address === tokenA) ??
    ({ symbol: '', address: '' } as const);

  const tokenBData =
    tokenObjB ??
    tokenList.find((t) => t.address === tokenB) ??
    ({ symbol: '', address: '' } as const);

  // ------------------ Compute market prices ------------------
  const marketPriceAInUSD = tokenA ? (prices[tokenA.toLowerCase()] ?? 0) : 0;
  console.log('Price A in USD:', marketPriceAInUSD);
  const marketPriceBInUSD = tokenB ? (prices[tokenB.toLowerCase()] ?? 0) : 0;
  console.log('Price B in USD:', marketPriceBInUSD);

  // 1 tokenA ≈ X tokenB
  const marketPriceAperB = poolReserves
    ? poolReserves.reserveB / poolReserves.reserveA
    : marketPriceBInUSD > 0 && marketPriceAInUSD > 0
      ? marketPriceAInUSD / marketPriceBInUSD
      : 1;

  const marketPriceBperA = poolReserves
    ? poolReserves.reserveA / poolReserves.reserveB
    : marketPriceAperB > 0
      ? 1 / marketPriceAperB
      : 1;

  /** ------------------ Bidirectional input updates ------------------ */
  const handleAmountAChange = (val: number) => {
    const newAmountB = val > 0 ? val * marketPriceAperB : 0;
    setAmounts(val, newAmountB);
  };

  const handleAmountBChange = (val: number) => {
    const newAmountA = val > 0 ? val * marketPriceBperA : 0;
    setAmounts(newAmountA, val);
  };

  const isValid = amountA > 0 && amountB > 0;

  // ------------------ Push computed data up ------------------
  useEffect(() => {
    setReviewData({
      impliedPriceAperB: amountB / amountA,
      impliedPriceBperA: amountA / amountB,
      marketPriceAperB,
      marketPriceBperA,
      marketPriceAInUSD: marketPriceAInUSD,
      marketPriceBInUSD: marketPriceBInUSD,
    });
  }, [
    amountA,
    amountB,
    marketPriceAperB,
    marketPriceBperA,
    marketPriceAInUSD,
    marketPriceBInUSD,
    setReviewData,
  ]);

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Pool header */}
      <PoolHeader
        tokenA={tokenAData}
        tokenB={tokenBData}
        feeTier={feeTier}
        impliedPrice={marketPriceAperB} // shows 1 tokenA ≈ X tokenB
      />

      <div className="p-6 bg-[#2A0040] border border-[#AB37FF33] rounded-2xl shadow-[0_0_40px_#AB37FF33] text-left">
        <h1 className="text-2xl font-bold text-white drop-shadow-[0_0_10px_#AB37FFAA]">
          Deposit tokens
        </h1>
        <h3 className="text-white/80 text-sm mt-1">
          Specify the token amounts for your liquidity contribution.
        </h3>

        {/* Token inputs */}
        <div className="space-y-4 mt-4">
          {/** Token A input */}
          <div className="relative w-full">
            <input
              type="text"
              inputMode="decimal"
              value={amountA || ''}
              onChange={(e) => handleAmountAChange(Number(e.target.value))}
              className="w-full px-4 pr-24 py-3 rounded-xl bg-white/10 text-white border border-[#3e37ff33] focus:outline-none focus:ring-2 focus:ring-[#AB37FF66] text-lg"
              placeholder="0"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <TokenIcon address={tokenAData.address} size={20} />
                <span className="text-white font-bold">
                  {tokenAData.symbol}
                </span>
              </div>
              {marketPriceAInUSD !== undefined && (
                <span className="text-white/60 text-xs">
                  ${(amountA * marketPriceAInUSD).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/** Token B input */}
          <div className="relative w-full">
            <input
              type="text"
              inputMode="decimal"
              value={amountB || ''}
              onChange={(e) => handleAmountBChange(Number(e.target.value))}
              className="w-full px-4 pr-24 py-3 rounded-xl bg-white/10 text-white border border-[#3e37ff33] focus:outline-none focus:ring-2 focus:ring-[#AB37FF66] text-lg"
              placeholder="0"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <TokenIcon address={tokenBData.address} size={20} />
                <span className="text-white font-bold">
                  {tokenBData.symbol}
                </span>
              </div>
              {marketPriceBInUSD !== undefined && (
                <span className="text-white/60 text-xs">
                  ${(amountB * marketPriceBInUSD).toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>

        {!poolReserves && (
          <p className="mt-2 text-yellow-400 text-xs text-center">
            ⚠️ You are setting the initial price for this pool. If your ratio
            differs from the market, arbitrageurs may rebalance it and you could
            lose value immediately.
          </p>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={onBack}
            className="py-3 px-6 bg-gray-600 hover:bg-gray-700 rounded-full text-white font-bold text-lg transition-all duration-200 shadow-[0_0_20px_#AB37FF88]"
          >
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!isValid}
            className={`py-3 px-6 rounded-full font-bold text-lg transition-all duration-200 shadow-[0_0_20px_#AB37FF88] 
              ${
                isValid
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-500 cursor-not-allowed text-white/50'
              }
            `}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
