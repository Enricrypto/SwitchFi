import { useRouter } from 'next/navigation';
import { formatUnits } from 'viem';
import { tokenList } from '@/constants';
import { PairData } from '../../types/interfaces';
import { TokenAIcon, TokenBIcon } from '../tokens/TokenIcons';
import { PlusCircle, MinusCircle } from 'lucide-react';

const PairAddress = ({
  index,
  pairAddress,
  token0,
  token1,
  decimals0,
  decimals1,
  reserves,
  userSharePct,
  symbolToken0,
  symbolToken1,
  onAddLiquidityClick,
  onRemoveLiquidityClick,
}: PairData) => {
  const router = useRouter();

  /** ------------------ Format reserve values for display ------------------ */
  const reserve0Formatted =
    reserves && decimals0 !== undefined
      ? formatUnits(reserves[0], decimals0)
      : '0';

  const reserve1Formatted =
    reserves && decimals1 !== undefined
      ? formatUnits(reserves[1], decimals1)
      : '0';

  /** ------------------ Look up token metadata from local token list ------------------ */
  const token0Info = tokenList.find(
    (t) => t.address.toLowerCase() === (token0 as string)?.toLowerCase()
  );
  const token1Info = tokenList.find(
    (t) => t.address.toLowerCase() === (token1 as string)?.toLowerCase()
  );

  /** ------------------ Redirect to /pool/[pairAddress] ------------------ */
  const handleVisitPoolClick = () => {
    router.push(`/pool/${pairAddress}`);
  };

  /** ------------------ Render fallback UI if pairAddress is invalid ------------------ */
  if (!pairAddress) {
    return (
      <div className="rounded-xl bg-zinc-900 p-4 text-red-500 border border-zinc-700">
        No pair found at index {index}
      </div>
    );
  }

  /** ------------------ Render pool card UI ------------------ */
  return (
    <div className="bg-gradient-to-br from-[#1B002B] to-[#320148] border border-[#AB37FF33] rounded-3xl p-6 shadow-[0_0_30px_#AB37FF33] backdrop-blur-sm transition-all duration-300 h-full flex flex-col justify-between">
      <div className="flex-1">
        {/* ------------------ Token icons + symbols ------------------ */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="scale-[1.6] drop-shadow-[0_0_6px_#AB37FF99]">
              <TokenAIcon />
            </div>
            <div className="scale-[1.6] -ml-4 drop-shadow-[0_0_6px_#AB37FF99]">
              <TokenBIcon />
            </div>
          </div>

          <button
            onClick={handleVisitPoolClick}
            type="button"
            className="text-xl font-semibold text-white bg-transparent border-0 hover:underline hover:text-cosmic-primary transition duration-200"
          >
            {token0Info?.symbol || 'Token0'} / {token1Info?.symbol || 'Token1'}
          </button>
        </div>

        {/* ------------------ Pool index + address ------------------ */}
        <div className="text-center mb-6">
          <p className="text-lg font-medium text-white">Pool #{index}</p>
          <p className="text-xs text-gray-400 mt-1 break-words">
            {pairAddress}
          </p>
        </div>

        {/* ------------------ Reserves ------------------ */}
        <div className="text-center mt-6">
          <h2 className="text-lg font-semibold text-white mb-2 tracking-wide">
            Reserves
          </h2>
          {reserves ? (
            <>
              <p className="text-sm text-gray-400">
                {token0Info?.symbol ?? '...'}:{' '}
                <span className="font-medium text-gray-400">
                  {reserve0Formatted}
                </span>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {token1Info?.symbol ?? '...'}:{' '}
                <span className="font-medium text-gray-400">
                  {reserve1Formatted}
                </span>
              </p>
            </>
          ) : (
            <p className="text-white/60">Loading reserves...</p>
          )}
        </div>

        {/* ------------------ Action Buttons ------------------ */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
          <button
            className="flex items-center justify-center gap-2 text-base font-semibold text-white bg-[#AB37FF] hover:bg-[#C155FF] px-6 py-3 rounded-full shadow-[0_0_20px_#AB37FF66] transition duration-200"
            onClick={() => onAddLiquidityClick(pairAddress as `0x${string}`)}
          >
            Add Liquidity
            <PlusCircle className="w-5 h-5 text-white" />
          </button>

          <button
            className="flex items-center justify-center gap-2 text-base font-semibold text-white bg-[#1C012D] hover:bg-[#2A0145] px-6 py-3 rounded-full shadow-inner border border-[#AB37FF33] transition duration-200"
            onClick={() => onRemoveLiquidityClick(pairAddress as `0x${string}`)}
          >
            Remove Liquidity
            <MinusCircle className="w-5 h-5 text-[#AB37FF]" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default PairAddress;
