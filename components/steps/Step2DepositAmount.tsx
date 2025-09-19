'use client';

import React from 'react';
import { tokenList } from '@/constants';

interface Step2DepositAmountProps {
  tokenA: string | null;
  tokenB: string | null;
  amountA: number;
  amountB: number;
  onNext: () => void;
  onBack: () => void;
  poolReserves?: { reserveA: number; reserveB: number } | null;
  setAmounts: (amountA: number, amountB: number) => void;
}

export default function Step2DepositAmount({
  tokenA,
  tokenB,
  amountA,
  amountB,
  setAmounts,
  onNext,
  onBack,
  poolReserves,
}: Step2DepositAmountProps) {
  const tokenObjA = tokenList.find((t) => t.address === tokenA);
  const tokenObjB = tokenList.find((t) => t.address === tokenB);

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto p-6 bg-[#2A0040] border border-[#AB37FF33] rounded-2xl shadow-[0_0_40px_#AB37FF33]">
      <h1 className="text-2xl font-bold text-white text-center drop-shadow-[0_0_10px_#AB37FFAA]">
        Deposit Token Amounts
      </h1>

      {/* Token Labels */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 text-white/80 font-semibold text-lg">
            {tokenObjA?.symbol ?? 'Token A'}
          </label>
          <input
            type="number"
            value={amountA}
            onChange={(e) => setAmounts(Number(e.target.value), amountB)}
            className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-[#3e37ff33] focus:outline-none focus:ring-2 focus:ring-[#AB37FF66] text-lg transition"
          />
        </div>

        <div>
          <label className="block mb-2 text-white/80 font-semibold text-lg">
            {tokenObjB?.symbol ?? 'Token B'}
          </label>
          <input
            type="number"
            value={amountB}
            onChange={(e) => setAmounts(amountA, Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-[#3e37ff33] focus:outline-none focus:ring-2 focus:ring-[#AB37FF66] text-lg transition"
          />
        </div>
      </div>

      {/* Optional pool reserves */}
      {poolReserves && (
        <p className="text-white/70 text-sm">
          Pool Reserves: {tokenObjA?.symbol} {poolReserves.reserveA},{' '}
          {tokenObjB?.symbol} {poolReserves.reserveB}
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
          className="py-3 px-6 bg-purple-600 hover:bg-purple-700 rounded-full text-white font-bold text-lg transition-all duration-200 shadow-[0_0_20px_#AB37FF88]"
        >
          Next
        </button>
      </div>
    </div>
  );
}
