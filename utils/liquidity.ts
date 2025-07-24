import { calculateOptimalAmounts } from './liquidityCalculations';
import { ERC20Abi, MAX_UINT256 } from '@/constants';

// Type for contract write function, returns transaction hash.
type WriteContractAsync = (params: {
  address: `0x${string}`;
  abi: readonly unknown[];
  functionName: string;
  args?: readonly unknown[];
}) => Promise<`0x${string}`>;

// Computes optimal token amounts based on user input and pool reserves.
export const validateOptimalAmounts = (
  parsedAmount0: bigint,
  parsedAmount1: bigint,
  amount0Min: bigint,
  amount1Min: bigint,
  reserve0: bigint,
  reserve1: bigint
): [bigint, bigint] | null => {
  return calculateOptimalAmounts(
    parsedAmount0,
    parsedAmount1,
    amount0Min,
    amount1Min,
    reserve0,
    reserve1
  );
};

// Approves router to spend tokens if allowance is insufficient.
export const approveIfNeeded = async (
  tokenAddress: `0x${string}`,
  currentAllowance: bigint,
  requiredAmount: bigint,
  writeContractAsync: WriteContractAsync,
  routerAddress: `0x${string}`
) => {
  if (currentAllowance < requiredAmount) {
    await writeContractAsync({
      address: tokenAddress,
      abi: ERC20Abi,
      functionName: 'approve',
      args: [routerAddress, MAX_UINT256],
    });
  }
};
