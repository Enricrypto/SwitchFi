'use client';

import { Step3ReviewProps } from '@/types/interfaces';
import TokenIcon from '@/components/ui/TokenIcon';
import { tokenList } from '@/constants';

export default function Step3Review({
  tokenA,
  tokenB,
  amountA,
  amountB,
  reviewData,
  onBack,
  onConfirm,
}: Step3ReviewProps) {
  const {
    impliedPriceAperB = 0,
    impliedPriceBperA = 0,
    marketPriceAperB = 1,
    marketPriceBperA = 1,
    marketPriceAInUSD = 0,
    marketPriceBInUSD = 0,
  } = reviewData;

  const lpEstimate = Math.sqrt(amountA * amountB);

  // % deviation warning
  const deviation =
    marketPriceAperB && impliedPriceAperB
      ? ((impliedPriceAperB - marketPriceAperB) / marketPriceAperB) * 100
      : 0;

  const tokenObjA = tokenList.find((t) => t.address === tokenA);
  const tokenObjB = tokenList.find((t) => t.address === tokenB);

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Tokens & Implied Price */}
      <div className="p-6 bg-[#2A0040] border border-[#AB37FF33] rounded-2xl shadow-[0_0_40px_#AB37FF33] space-y-4">
        {/* Token labels */}
        <div className="flex justify-center items-center gap-4">
          <div className="flex items-center gap-2">
            <TokenIcon address={tokenA ?? ''} size={20} />
            <span className="text-white font-bold">{tokenObjA?.symbol}</span>
          </div>
          <span className="text-white/60">→</span>
          <div className="flex items-center gap-2">
            <TokenIcon address={tokenB ?? ''} size={20} />
            <span className="text-white font-bold">{tokenObjB?.symbol}</span>
          </div>
        </div>

        {/* Implied price */}
        <div className="flex justify-center items-center gap-4">
          <p className="text-white/80 text-sm">
            1 {tokenObjA?.symbol} = {impliedPriceAperB.toFixed(4)}{' '}
            {tokenObjB?.symbol}
          </p>
        </div>
      </div>

      {/* Liquidity */}
      <div className="p-6 bg-[#2A0040] border border-[#AB37FF33] rounded-2xl shadow-[0_0_40px_#AB37FF33] space-y-6">
        <h1 className="text-2xl font-bold text-white drop-shadow-[0_0_10px_#AB37FFAA]">
          Confirm & Review Pool Details
        </h1>
        {/* Token A */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TokenIcon address={tokenA ?? ''} size={20} />
            <span className="text-white font-bold">{tokenObjA?.symbol}</span>
          </div>
          <span className="text-white/80 font-medium">
            ${(amountA * (marketPriceAInUSD ?? 0)).toFixed(2)}
          </span>
        </div>

        {/* Token B */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TokenIcon address={tokenB ?? ''} size={20} />
            <span className="text-white font-bold">{tokenObjB?.symbol}</span>
          </div>
          <span className="text-white/80 font-medium">
            ${(amountB * (marketPriceBInUSD ?? 0)).toFixed(2)}
          </span>
        </div>

        {/* LP Estimate */}
        <p className="mt-2 font-bold text-white text-center">
          Est. LP Tokens: {lpEstimate.toFixed(4)}
        </p>
        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={onBack}
            className="py-3 px-6 bg-gray-600 hover:bg-gray-700 rounded-full text-white font-bold text-lg transition-all duration-200 shadow-[0_0_20px_#AB37FF88]"
          >
            Back
          </button>
          <button
            onClick={onConfirm}
            className="py-3 px-6 bg-purple-600 hover:bg-purple-700 rounded-full text-white font-bold text-lg transition-all duration-200 shadow-[0_0_20px_#AB37FF88]"
          >
            Confirm
          </button>
        </div>
      </div>

      {/* Warning */}
      {Math.abs(deviation) > 5 && (
        <p className="text-yellow-400 text-sm">
          ⚠️ Your price is {deviation.toFixed(2)}% off the market price. You may
          be arbitraged immediately.
        </p>
      )}
    </div>
  );
}
