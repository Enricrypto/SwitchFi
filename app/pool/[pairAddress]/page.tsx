'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { pairABI, ERC20Abi } from '@/constants';
import { formatUnits } from 'viem';
import Header from '../../../components/ui/Header';

const PoolDetailPage = () => {
  /* ------------------ Get URL params ------------------ */
  const { pairAddress } = useParams();

  /* ------------------ Get user account info ------------------ */
  const { address: userAddress, isConnected } = useAccount();

  /* ------------------ State: Token addresses and reserves ------------------ */
  const [token0Address, setToken0Address] = useState<`0x${string}` | null>(
    null
  );
  const [token1Address, setToken1Address] = useState<`0x${string}` | null>(
    null
  );
  const [reserves, setReserves] = useState<[bigint, bigint] | null>(null);

  /* ------------------ Read token0 and token1 addresses from pair contract ------------------ */
  const { data: token0 } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: pairABI,
    functionName: 'token0',
  });

  const { data: token1 } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: pairABI,
    functionName: 'token1',
  });

  /* ------------------ Read reserves from pair contract ------------------ */
  const { data: reservesData } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: pairABI,
    functionName: 'getReserves',
  }) as { data: readonly [bigint, bigint] | undefined };

  /* ------------------ Sync token addresses and reserves state ------------------ */
  useEffect(() => {
    if (typeof token0 === 'string' && token0.startsWith('0x')) {
      setToken0Address(token0 as `0x${string}`);
    }
    if (typeof token1 === 'string' && token1.startsWith('0x')) {
      setToken1Address(token1 as `0x${string}`);
    }
    if (reservesData && reservesData.length === 2) {
      setReserves([reservesData[0], reservesData[1]]);
    }
  }, [token0, token1, reservesData]);

  /* ------------------ Read token0 decimals ------------------ */
  const { data: token0Decimals } = useReadContract({
    address: token0Address as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'decimals',
    query: { enabled: !!token0Address },
  });

  /* ------------------ Read token1 decimals ------------------ */
  const { data: token1Decimals } = useReadContract({
    address: token1Address as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'decimals',
    query: { enabled: !!token1Address },
  });

  /* ------------------ Read user token0 balance ------------------ */
  const { data: token0BalanceRaw } = useReadContract({
    address: token0Address as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress && !!token0Address },
  });

  /* ------------------ Read user token1 balance ------------------ */
  const { data: token1BalanceRaw } = useReadContract({
    address: token1Address as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress && !!token1Address },
  });

  /* ------------------ Format token balances ------------------ */
  const formattedToken0Balance =
    token0BalanceRaw && typeof token0BalanceRaw === 'bigint'
      ? formatUnits(token0BalanceRaw, token0Decimals ?? 18)
      : '0';

  const formattedToken1Balance =
    token1BalanceRaw && typeof token1BalanceRaw === 'bigint'
      ? formatUnits(token1BalanceRaw, token1Decimals ?? 18)
      : '0';

  /* ------------------ Format reserves ------------------ */
  const reserve0Formatted =
    reserves && token0Decimals !== undefined
      ? formatUnits(reserves[0], token0Decimals)
      : '0';

  const reserve1Formatted =
    reserves && token1Decimals !== undefined
      ? formatUnits(reserves[1], token1Decimals)
      : '0';

  /* ------------------ Read token symbols ------------------ */
  const { data: token0Symbol } = useReadContract({
    address: token0Address as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'symbol',
  });

  const { data: token1Symbol } = useReadContract({
    address: token1Address as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'symbol',
  });

  /* ------------------ Read token names ------------------ */
  const { data: token0Name } = useReadContract({
    address: token0Address as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'name',
  });

  const { data: token1Name } = useReadContract({
    address: token1Address as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'name',
  });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#120023] via-[#1B002B] to-[#2B003D] text-white font-sans">
        <Header />
        {/* ------------------ Top Section: Pair & Token Addresses ------------------ */}
        <div className="m-16 flex flex-col md:flex-row gap-10">
          {/* Pair Address */}
          <div className="flex-1 bg-gradient-to-br from-[#1B002B] to-[#320148] border border-[#AB37FF33] rounded-3xl p-6 shadow-[0_0_30px_#AB37FF33] backdrop-blur-sm transition-all duration-300">
            <h2 className="text-purple-500 text-xl font-semibold mb-3 text-center">
              Pair Address
            </h2>
            <p className="break-all text-gray-400 text-sm text-center">
              {pairAddress}
            </p>
          </div>

          {/* Token Addresses */}
          <div className="flex-1 bg-gradient-to-br from-[#1B002B] to-[#320148] border border-[#AB37FF33] rounded-3xl p-6 shadow-[0_0_30px_#AB37FF33] backdrop-blur-sm transition-all duration-300">
            <h2 className="text-purple-500 text-xl font-semibold mb-3 text-center">
              Token Addresses
            </h2>
            <div className="text-sm space-y-2 text-center">
              <p>
                <span className="font-semibold text-white">
                  {token0Symbol?.toString() ?? '...'}:
                </span>{' '}
                <span className=" text-gray-400 break-all">
                  {token0Address ?? 'Loading...'}
                </span>
              </p>
              <p>
                <span className="font-semibold text-white">
                  {token1Symbol?.toString() ?? '...'}:
                </span>{' '}
                <span className="text-gray-400 break-all">
                  {token1Address ?? 'Loading...'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* ------------------ Bottom Section: Tokens, Reserves & User Balances ------------------ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 m-16">
          {/* Tokens Card */}
          <div className="flex-1 bg-gradient-to-br from-[#1B002B] to-[#320148] border border-[#AB37FF33] rounded-3xl p-6 shadow-[0_0_30px_#AB37FF33] backdrop-blur-sm transition-all duration-300 text-center">
            <h2 className="text-purple-500 text-xl font-semibold mb-6">
              Tokens
            </h2>
            <p className="text-white text-lg font-semibold">
              {token0Name?.toString() ?? '...'}{' '}
              <span className=" text-gray-400">
                ({token0Symbol?.toString() ?? '...'})
              </span>
            </p>
            <p className="text-white text-lg font-semibold mt-4">
              {token1Name?.toString() ?? '...'}{' '}
              <span className=" text-gray-400">
                ({token1Symbol?.toString() ?? '...'})
              </span>
            </p>
          </div>

          {/* Reserves Card */}
          <div className="flex-1 bg-gradient-to-br from-[#1B002B] to-[#320148] border border-[#AB37FF33] rounded-3xl p-6 shadow-[0_0_30px_#AB37FF33] backdrop-blur-sm transition-all duration-300 text-center">
            <h2 className="text-purple-500 text-xl font-semibold mb-6">
              Reserves
            </h2>
            {reserves ? (
              <>
                <p className="text-white font-mono text-lg">
                  {token0Symbol?.toString() ?? '...'}:{' '}
                  <span className=" text-gray-400">{reserve0Formatted}</span>
                </p>
                <p className="text-white font-mono text-lg mt-4">
                  {token1Symbol?.toString() ?? '...'}:{' '}
                  <span className=" text-gray-400">{reserve1Formatted}</span>
                </p>
              </>
            ) : (
              <p className="text-white/70">Loading reserves...</p>
            )}
          </div>

          {/* User Balances Card */}
          <div className="flex-1 bg-gradient-to-br from-[#1B002B] to-[#320148] border border-[#AB37FF33] rounded-3xl p-6 shadow-[0_0_30px_#AB37FF33] backdrop-blur-sm transition-all duration-300 text-center">
            <h2 className="text-purple-500 text-xl font-semibold mb-6">
              Your Balances
            </h2>
            {isConnected ? (
              <>
                <p className="text-white text-lg font-medium">
                  {token0Symbol?.toString() ?? 'Token0'}:{' '}
                  <span className=" text-gray-400">
                    {formattedToken0Balance}
                  </span>
                </p>
                <p className="text-white text-lg font-medium mt-4">
                  {token1Symbol?.toString() ?? 'Token1'}:{' '}
                  <span className=" text-gray-400">
                    {formattedToken1Balance}
                  </span>
                </p>
              </>
            ) : (
              <p className="text-white/70 text-sm">
                Connect your wallet to view balances.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PoolDetailPage;
