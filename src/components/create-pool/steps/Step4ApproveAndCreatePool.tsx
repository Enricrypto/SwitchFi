'use client';

import { useState } from 'react';
import { parseUnits, formatUnits } from 'viem';
import { useSimulateContract, useWriteContract, useAccount } from 'wagmi';
import { ERC20ABI } from '@/src/abis/ERC20ABI';
import { factoryABI } from '@/src/abis/factoryABI';
import { routerABI } from '@/src/abis/routerABI';
import { ROUTER_ADDRESS, FACTORY_ADDRESS } from '@/constants';
import { Step4ApproveCreateProps } from '@/types/interfaces';
import { toast } from 'react-toastify';
import TokenIcon from '@/components/shared/icons/TokenIcon';

export default function Step4ApproveCreate({
  tokenA,
  tokenB,
  amountA,
  amountB,
  decimalsA,
  decimalsB,
  pairAddress,
  tokenObjA,
  tokenObjB,
  onBack,
}: Step4ApproveCreateProps & { onBack: () => void }) {
  const { address: userAddress } = useAccount();
  const [status, setStatus] = useState<string | null>(null);
  const [approvalACompleted, setApprovalACompleted] = useState(false);
  const [approvalBCompleted, setApprovalBCompleted] = useState(false);
  const [poolCreated, setPoolCreated] = useState(false);
  const [liquidityAdded, setLiquidityAdded] = useState(false);

  const amountAParsed = parseUnits(amountA.toString(), decimalsA);
  const amountBParsed = parseUnits(amountB.toString(), decimalsB);

  const approveAData = useSimulateContract({
    address: tokenA as `0x${string}` | undefined,
    abi: ERC20ABI,
    functionName: 'approve',
    args: tokenA ? [ROUTER_ADDRESS as `0x${string}`, amountAParsed] : undefined,
  });

  const approveBData = useSimulateContract({
    address: tokenB as `0x${string}` | undefined,
    abi: ERC20ABI,
    functionName: 'approve',
    args: tokenB ? [ROUTER_ADDRESS as `0x${string}`, amountBParsed] : undefined,
  });

  const createPairData = useSimulateContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: factoryABI,
    functionName: 'createPair',
    args:
      tokenA && tokenB
        ? [tokenA as `0x${string}`, tokenB as `0x${string}`]
        : undefined,
  });

  const addLiquidityData = useSimulateContract({
    address: ROUTER_ADDRESS as `0x${string}`,
    abi: routerABI,
    functionName: 'addLiquidity',
    args:
      tokenA && tokenB && userAddress
        ? [
            tokenA as `0x${string}`,
            tokenB as `0x${string}`,
            amountAParsed,
            amountBParsed,
            BigInt(0),
            BigInt(0),
            userAddress as `0x${string}`,
          ]
        : undefined,
  });

  const { writeContractAsync, isPending } = useWriteContract();

  const handleApproveAndCreate = async () => {
    if (!userAddress) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      // Approve Token A
      if (!approveAData?.data?.request)
        throw new Error('Approve Token A not ready');
      setStatus('Approving Token A...');
      await writeContractAsync(approveAData.data.request);
      setApprovalACompleted(true);
      toast.info('Token A approved!');

      // Approve Token B
      if (!approveBData?.data?.request)
        throw new Error('Approve Token B not ready');
      setStatus('Approving Token B...');
      await writeContractAsync(approveBData.data.request);
      setApprovalBCompleted(true);
      toast.info('Token B approved!');

      // Create Pair
      if (!pairAddress) {
        if (!createPairData?.data?.request)
          throw new Error('Create Pair not ready');
        setStatus('Creating pool...');
        await writeContractAsync(createPairData.data.request);
        setPoolCreated(true);
        toast.info('Pool created!');
      } else {
        toast.info('Pool already exists. Skipping creation.');
      }

      // Add Liquidity
      if (!addLiquidityData?.data?.request)
        throw new Error('Add Liquidity not ready');
      setStatus('Adding liquidity...');
      await writeContractAsync(addLiquidityData.data.request);
      setLiquidityAdded(true);
      toast.success('Liquidity added successfully!');

      setStatus('All steps completed!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      console.error(err);
      toast.error(message);
      setStatus('Error occurred');
    }
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto p-6 bg-[#2A0040] border border-[#AB37FF33] rounded-2xl shadow-[0_0_40px_#AB37FF33]">
      <h2 className="text-xl font-bold text-white text-center mb-4">
        Finalize Pool Creation
      </h2>

      {/* Summary */}
      <div className="space-y-3 bg-[#3a004f] p-4 rounded-xl border border-[#AB37FF33]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {tokenA && <TokenIcon address={tokenA} />}
            <span className="text-white font-semibold">
              {tokenObjA?.symbol}
            </span>
          </div>
          <span className="text-white/80">
            {formatUnits(amountAParsed, decimalsA)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {tokenB && <TokenIcon address={tokenB} />}
            <span className="text-white font-semibold">
              {tokenObjB?.symbol}
            </span>
          </div>
          <span className="text-white/80">
            {formatUnits(amountBParsed, decimalsB)}
          </span>
        </div>

        <div className="pt-2 border-t border-[#AB37FF33] space-y-1">
          <p className="text-white text-sm">
            Pool status:{' '}
            {pairAddress || poolCreated ? (
              <span className="text-green-400 font-semibold">Exists</span>
            ) : (
              <span className="text-yellow-400 font-semibold">
                Will be created
              </span>
            )}
          </p>
          <p className="text-white text-sm">
            Approvals:
            <span
              className={`ml-2 ${approvalACompleted ? 'text-green-400' : 'text-yellow-400'}`}
            >
              Token A {approvalACompleted ? '✅' : '⏳'}
            </span>
            <span
              className={`ml-2 ${approvalBCompleted ? 'text-green-400' : 'text-yellow-400'}`}
            >
              Token B {approvalBCompleted ? '✅' : '⏳'}
            </span>
          </p>
          <p className="text-white text-sm">
            Liquidity:{' '}
            {liquidityAdded ? (
              <span className="text-green-400">Added ✅</span>
            ) : (
              <span className="text-yellow-400">Pending ⏳</span>
            )}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-4">
        <button
          className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-full text-white font-bold transition"
          onClick={onBack}
          disabled={isPending}
        >
          Back
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-full font-bold text-white transition
          ${isPending ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
          onClick={handleApproveAndCreate}
          disabled={isPending}
        >
          {isPending ? 'Processing...' : 'Approve & Create Pool'}
        </button>
      </div>

      {status && (
        <p className="text-white text-center text-sm mt-2">{status}</p>
      )}
    </div>
  );
}
