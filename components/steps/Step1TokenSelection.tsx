'use client';

import { useEffect } from 'react';
import TokenSelector from '../ui/TokenSelector';
import { useTokenListStore } from '@/store/useTokenListStore';
import { Step1Props } from '@/types/interfaces';

// ───── Fee options ─────
const feeOptions = [
  0.01, 0.02, 0.03, 0.04, 0.05, 0.1, 0.15, 0.16, 0.18, 0.2, 0.25, 0.4, 0.6, 0.8,
  1, 2, 3, 4,
];

export default function Step1TokenSelection({
  tokenA,
  tokenB,
  feeTier,
  setTokenA,
  setTokenB,
  setFeeTier,
  onNext,
}: Step1Props) {
  const tokenList = useTokenListStore((state) => state.tokenList);
  const fetchTokenList = useTokenListStore((state) => state.fetchTokenList);
  // const isLoading = useTokenListStore((state) => state.isLoading);

  useEffect(() => {
    fetchTokenList();
  }, [fetchTokenList]);

  // ───── Dynamic Button Text ─────
  let buttonText = 'Select Base Token';
  if (tokenA && !tokenB) buttonText = 'Select Quote Token';
  else if (tokenA && tokenB && !feeTier) buttonText = 'Select Fee Tier';
  else if (tokenA && tokenB && feeTier) buttonText = 'Continue';

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto p-6 bg-[#2A0040] border border-[#AB37FF33] rounded-2xl shadow-[0_0_40px_#AB37FF33]">
      <h1 className="text-2xl font-bold text-white text-center drop-shadow-[0_0_10px_#AB37FFAA]">
        First, select tokens & fee tier
      </h1>
      {/* Tokens Label */}
      <label className="block mb-2 text-white/80 font-semibold text-lg">
        Tokens
      </label>

      {/* Token selectors */}
      <div className="grid grid-cols-2 gap-6">
        <TokenSelector
          token={
            tokenA ? tokenList.find((t) => t.address === tokenA) : undefined
          }
          onSelect={(t) => setTokenA(t.address)}
          placeholder="Select"
          label="Base Token"
        />
        <TokenSelector
          token={
            tokenB ? tokenList.find((t) => t.address === tokenB) : undefined
          }
          onSelect={(t) => setTokenB(t.address)}
          placeholder="Select"
          label="Quote Token"
        />
      </div>

      {/* Fee Tier */}
      <div className="mt-4">
        <label className="block mb-2 text-white/80 font-semibold text-lg">
          Fee Tier
        </label>
        <select
          className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-[#3e37ff33] focus:outline-none focus:ring-2 focus:ring-[#AB37FF66] text-lg transition"
          value={feeTier ?? 0.25}
          onChange={(e) => setFeeTier(Number(e.target.value))}
        >
          {feeOptions.map((fee) => (
            <option key={fee} value={fee}>
              {fee}%
            </option>
          ))}
        </select>
      </div>

      {/* Dynamic Button */}
      <button
        onClick={onNext}
        className="mt-6 w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 rounded-full text-white font-bold text-lg transition-all duration-200 shadow-[0_0_20px_#AB37FF88]"
      >
        {buttonText}
      </button>
    </div>
  );
}
