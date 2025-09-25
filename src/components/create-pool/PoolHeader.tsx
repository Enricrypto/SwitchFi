'use client';

import TokenIcon from '@/src/components/shared/icons/TokenIcon';

interface PoolHeaderProps {
  tokenA: { symbol: string; address: string };
  tokenB: { symbol: string; address: string };
  feeTier: number;
  impliedPrice: number;
}

const PoolHeader = ({
  tokenA,
  tokenB,
  feeTier,
  impliedPrice,
}: PoolHeaderProps) => {
  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-[#2A0040] border border-[#AB37FF33] rounded-2xl shadow-[0_0_40px_#AB37FF33]">
      {/* Token pair and version */}
      <div className="flex items-center gap-2 font-bold text-xl">
        <TokenIcon address={tokenA.address} size={24} />
        <span>{tokenA.symbol}</span>
        <span>/</span>
        <TokenIcon address={tokenB.address} size={24} />
        <span>{tokenB.symbol}</span>
        <div className="text-sm text-white/80">
          {feeTier !== null ? `${feeTier}%` : '0.3%'}
        </div>
      </div>

      {/* Market price / implied ratio */}
      {impliedPrice && (
        <div className="text-sm text-white/80 mt-2">
          Market price: 1 {tokenA.symbol} = {impliedPrice.toFixed(6)}{' '}
          {tokenB.symbol}
        </div>
      )}
    </div>
  );
};

export default PoolHeader;
