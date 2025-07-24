export interface Token {
  symbol?: string;
  address: `0x${string}`;
}

export interface Pool {
  index: number;
  pairAddress: `0x${string}`;
  token0: `0x${string}`;
  token1: `0x${string}`;
  decimals0: number;
  decimals1: number;
  reserves: [bigint, bigint];
  userSharePct: number; // e.g. 12.34 (%)
  userReserve0: bigint; // user's portion of token0
  userReserve1: bigint; // user's portion of token1
  balanceLP: bigint; // user's LP token balance
  allowanceToken0?: bigint;
  allowanceToken1?: bigint;
  symbolToken0?: string;
  symbolToken1?: string;
  lpTotalSupply?: bigint;
  lpDecimals?: number;
  isUserPool?: boolean;
}

export interface CreatePoolPageState {
  tokenA: `0x${string}`;
  tokenB: `0x${string}`;
  poolExists: boolean;
  localError: Error | null;
}

export interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

// Mint panel props (if you later extract it)
export interface MintTokenPanelProps {
  token: Token;
  amount: string;
  onMint: () => void;
}

export interface RemoveLiquidityModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleRemoveLiquidity: (amount: string) => Promise<boolean>;
  symbolToken0: string | undefined;
  symbolToken1: string | undefined;
  lpDecimals: number | undefined;
  balanceLP: bigint | undefined;
  reserves: [bigint, bigint];
  lpTotalSupply: bigint | undefined;
  decimals0: number | undefined;
  decimals1: number | undefined;
}

export interface AddLiquidityModalProps {
  isOpen: boolean;
  onClose: () => void;
  liquidityWarning: string | null;
  setLiquidityWarning: React.Dispatch<React.SetStateAction<string | null>>;
  handleAddLiquidity: (amountA: string, amountB: string) => Promise<boolean>;
  token0: `0x${string}`;
  token1: `0x${string}`;
  decimals0: number | undefined;
  decimals1: number | undefined;
  reserveA: bigint;
  reserveB: bigint;
  symbolToken0: string | undefined;
  symbolToken1: string | undefined;
  price0: number | undefined;
  price1: number | undefined;
}

export interface PoolListProps {
  pools: Pool[]; // add the pools array here
  isLoading: boolean;
  onAddLiquidityClick: (pairAddress: `0x${string}`) => void;
  onRemoveLiquidityClick: (pairAddress: `0x${string}`) => void;
}

export interface PairData extends Pool {
  onAddLiquidityClick: (pair: `0x${string}`) => void;
  onRemoveLiquidityClick: (pair: `0x${string}`) => void;
}

export interface PoolListContainerProps {
  pools: Pool[];
  isLoading?: boolean;
  ListComponent: React.ComponentType<PoolListProps & { isLoading: boolean }>;
  fetchOnMount?: boolean;
}
