'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useReadContract, useAccount, usePublicClient } from 'wagmi';
import { arbitrum } from 'wagmi/chains';
import { ERC20Abi } from '@/constants';
import { formatUnits } from 'viem';
import Header from '../../../components/ui/Header';
import { usePoolsStore } from '../../../store/usePoolsStore';

const PoolDetailPage = () => {
  /* ------------------ Get URL params ------------------ */
  const { pairAddress } = useParams();

  /* ------------------ Get user account info ------------------ */
  const { address: userAddress, isConnected } = useAccount();

  const publicClient = usePublicClient({ chainId: arbitrum.id });

  // Normalize pairAddress to a string or undefined
  const normalizedPairAddress = Array.isArray(pairAddress)
    ? pairAddress[0]
    : pairAddress;

  // Access pool-related state and actions from the global store
  const selectedPool = usePoolsStore((state) => {
    if (!normalizedPairAddress) return undefined;

    return (
      state.userPools.find(
        (p) =>
          p.pairAddress.toLowerCase() === normalizedPairAddress.toLowerCase()
      ) ??
      state.allPools.find(
        (p) =>
          p.pairAddress.toLowerCase() === normalizedPairAddress.toLowerCase()
      )
    );
  });

  const fetchUserPools = usePoolsStore((state) => state.fetchUserPools);

  // Fetch pools when user connects and public client is available
  useEffect(() => {
    if (!publicClient || !isConnected || !userAddress) return;
    {
      fetchUserPools(userAddress, publicClient);
    }
  }, [isConnected, userAddress, fetchUserPools, publicClient]);

  const {
    token0,
    token1,
    decimals0,
    decimals1,
    reserves,
    userReserve0,
    userReserve1,
    symbolToken0,
    symbolToken1,
    userSharePct,
  } = selectedPool ?? {};

  /* ------------------ Read user token0 balance ------------------ */
  const { data: token0BalanceRaw } = useReadContract({
    address: token0 as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
  });

  /* ------------------ Read user token1 balance ------------------ */
  const { data: token1BalanceRaw } = useReadContract({
    address: token1 as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
  });

  /* ------------------ Format token balances ------------------ */
  const formattedToken0Balance =
    token0BalanceRaw && typeof token0BalanceRaw === 'bigint'
      ? Number(formatUnits(token0BalanceRaw, decimals0 ?? 18)).toLocaleString(
          undefined,
          {
            minimumFractionDigits: 0,
            maximumFractionDigits: 4, // show up to 4 decimals max
          }
        )
      : '0';

  const formattedToken1Balance =
    token1BalanceRaw && typeof token1BalanceRaw === 'bigint'
      ? Number(formatUnits(token1BalanceRaw, decimals1 ?? 18)).toLocaleString(
          undefined,
          {
            minimumFractionDigits: 0,
            maximumFractionDigits: 4,
          }
        )
      : '0';

  /* ------------------ Format reserves ------------------ */
  const reserve0Formatted =
    reserves && decimals0 !== undefined
      ? formatUnits(reserves[0], decimals0)
      : '0';

  const reserve1Formatted =
    reserves && decimals1 !== undefined
      ? formatUnits(reserves[1], decimals1)
      : '0';

  const userReserve0Formatted =
    userReserve0 && decimals0 !== undefined
      ? formatUnits(userReserve0, decimals0)
      : '0';

  const userReserve1Formatted =
    userReserve1 && decimals1 !== undefined
      ? formatUnits(userReserve1, decimals1)
      : '0';

  /* ------------------ Read token names ------------------ */
  const { data: token0Name } = useReadContract({
    address: token0 as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'name',
  });

  const { data: token1Name } = useReadContract({
    address: token1 as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'name',
  });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#120023] via-[#1B002B] to-[#2B003D] text-white font-sans">
        <Header />
        {/* ------------------ Top Section: Pair & Token Addresses ------------------ */}
        <div className="m-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
          {/* Pair Address */}
          <div className="bg-gradient-to-br from-[#1B002B] to-[#320148] border border-[#AB37FF33] rounded-3xl p-6 shadow-[0_0_30px_#AB37FF33] backdrop-blur-sm transition-all duration-300 text-center h-full">
            <h2 className="text-purple-500 text-xl font-semibold mb-3 text-center">
              Pair Address
            </h2>
            <p className="break-all text-gray-400 text-md text-md p-4">
              {pairAddress}
            </p>
          </div>

          {/* Token Contracts */}
          <div className="bg-gradient-to-br from-[#1B002B] to-[#320148] border border-[#AB37FF33] rounded-3xl p-6 shadow-[0_0_30px_#AB37FF33] backdrop-blur-sm transition-all duration-300 text-center h-full">
            <h2 className="text-purple-500 text-xl font-semibold mb-3 text-center">
              Token Contracts
            </h2>
            <div className="text-md space-y-3 text-center">
              <p>
                <span className="font-semibold text-gray-400">
                  {symbolToken0?.toString() ?? '...'}:
                </span>{' '}
                <span className=" text-gray-400 break-all">
                  {token0 ?? 'Loading...'}
                </span>
              </p>
              <p>
                <span className="font-semibold text-gray-400">
                  {symbolToken1?.toString() ?? '...'}:
                </span>{' '}
                <span className="text-gray-400 break-all">
                  {token1 ?? 'Loading...'}
                </span>
              </p>
            </div>
          </div>

          {/* ------------------ Bottom Section: Tokens, Reserves & User Balances ------------------ */}
          {/* Tokens Card */}
          <div className="bg-gradient-to-br from-[#1B002B] to-[#320148] border border-[#AB37FF33] rounded-3xl p-6 shadow-[0_0_30px_#AB37FF33] backdrop-blur-sm transition-all duration-300 text-center h-full">
            <h2 className="text-purple-500 text-xl font-semibold mb-3">
              Pool Tokens
            </h2>
            <div className="flex-1 space-y-3">
              <p className="text-gray-400 text-md text-center">
                {token0Name?.toString() ?? '...'}{' '}
                <span className=" text-gray-400">
                  ({symbolToken0?.toString() ?? '...'})
                </span>
              </p>
              <p className="text-gray-400 text-md text-center">
                {token1Name?.toString() ?? '...'}{' '}
                <span className=" text-gray-400">
                  ({symbolToken1?.toString() ?? '...'})
                </span>
              </p>
            </div>
          </div>

          {/* Reserves Card */}
          <div className="bg-gradient-to-br from-[#1B002B] to-[#320148] border border-[#AB37FF33] rounded-3xl p-6 shadow-[0_0_30px_#AB37FF33] backdrop-blur-sm transition-all duration-300 text-center h-full">
            <h2 className="text-purple-500 text-xl font-semibold mb-3">
              Pool Reserves
            </h2>
            {reserves ? (
              <div className="flex-1 space-y-3">
                <p className="text-gray-400 text-md text-center">
                  {symbolToken0?.toString() ?? '...'}:{' '}
                  <span className=" text-gray-400">{reserve0Formatted}</span>
                </p>
                <p className="text-gray-400 text-md text-center">
                  {symbolToken1?.toString() ?? '...'}:{' '}
                  <span className=" text-gray-400">{reserve1Formatted}</span>
                </p>
              </div>
            ) : (
              <p className="text-white/70">Loading reserves...</p>
            )}
          </div>

          <div className="bg-gradient-to-br from-[#1B002B] to-[#320148] border border-[#AB37FF33] rounded-3xl p-6 shadow-[0_0_30px_#AB37FF33] backdrop-blur-sm transition-all duration-300 text-center h-full">
            <h2 className="text-purple-500 text-xl font-semibold mb-3">
              User Share of Reserves
            </h2>
            {reserves ? (
              <div className="flex-1 space-y-3">
                <p className="text-gray-400 text-md text-center">
                  {symbolToken0?.toString() ?? '...'}:{' '}
                  <span className=" text-gray-400">
                    {userReserve0Formatted}
                  </span>
                </p>
                <p className="text-gray-400 text-md text-center">
                  {symbolToken1?.toString() ?? '...'}:{' '}
                  <span className=" text-gray-400">
                    {userReserve1Formatted}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-white/70">Loading reserves...</p>
            )}
          </div>

          {/* Token Balances Card */}
          <div className="bg-gradient-to-br from-[#1B002B] to-[#320148] border border-[#AB37FF33] rounded-3xl p-6 shadow-[0_0_30px_#AB37FF33] backdrop-blur-sm transition-all duration-300 text-center h-full">
            <h2 className="text-purple-500 text-xl font-semibold mb-3">
              User Token Balances
            </h2>
            {isConnected ? (
              <div className="flex-1 space-y-3">
                <p className="text-gray-400 text-md text-center">
                  {symbolToken0?.toString() ?? 'Token0'}:{' '}
                  <span className=" text-gray-400">
                    {formattedToken0Balance}
                  </span>
                </p>
                <p className="text-gray-400 text-md text-center">
                  {symbolToken1?.toString() ?? 'Token1'}:{' '}
                  <span className=" text-gray-400">
                    {formattedToken1Balance}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-white/70 text-sm">
                Connect your wallet to view balances.
              </p>
            )}
          </div>

          {/* User Share in Pool */}
          <div className="flex-1 bg-gradient-to-br from-[#1B002B] to-[#320148] border border-[#AB37FF33] rounded-3xl p-6 shadow-[0_0_30px_#AB37FF33] backdrop-blur-sm transition-all duration-300 text-center h-full lg:col-start-2">
            <h2 className="text-purple-500 text-xl font-semibold mb-3">
              Pool Share
            </h2>
            <p className="text-gray-400 text-2xl font-bold">
              {(userSharePct! * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PoolDetailPage;
