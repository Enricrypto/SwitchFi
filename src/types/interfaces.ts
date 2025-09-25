import type { Dispatch, SetStateAction } from 'react';
import type { PublicClient } from 'viem';

export interface Token {
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export interface TokenListState {
  tokenList: Token[];
  tokenMap: Record<string, Token>;
  prices: Record<string, number | undefined>; // <--- allow undefined
  isLoading: boolean;
  error?: string;
  fetchTokenList: () => Promise<void>;
  fetchPrice: (address: string) => Promise<void>;
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

interface NormalSwapParams {
  reverse?: false;
  amountIn: bigint;
  amountOut?: never;
  reserveIn: bigint;
  reserveOut: bigint;
  slippageBps?: number;
}

interface ReverseSwapParams {
  reverse: true;
  amountIn?: never;
  amountOut: bigint;
  reserveIn: bigint;
  reserveOut: bigint;
  slippageBps?: number;
}

export type SwapPreviewParams = NormalSwapParams | ReverseSwapParams;

export type SwapPreviewResult = {
  amountOut: bigint;
  minAmountOut: bigint;
  loading: boolean;
  error: string | null;
};

export interface TokenSelectorProps {
  token?: Token;
  onSelect: (token: Token) => void;
  onPriceFetch?: (price: number) => void;
  tokens?: Token[];
}

export interface Props extends TokenSelectorProps {
  placeholder?: string;
  label?: string;
}

export interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
}

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  chainId: number;
}

export interface SwapFormProps {
  slippagePercent: number;
  onToggleSettings: () => void;
}

export interface SwapSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  slippage: number;
  setSlippage: (val: number) => void;
}

export interface Step1Props {
  tokenA: string | null;
  tokenB: string | null;
  feeTier: number | null;
  setTokenA: (token: string) => void;
  setTokenB: (token: string) => void;
  setFeeTier: (fee: number) => void;
  onNext: () => void;
}

export type ReviewData = {
  impliedPriceAperB?: number;
  impliedPriceBperA?: number;
  marketPriceAperB?: number;
  marketPriceBperA?: number;
  marketPriceAInUSD?: number;
  marketPriceBInUSD?: number;
  tokenAPriceUSD?: number;
  tokenBPriceUSD?: number;
};

export interface StepMultistepProps {
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  tokenA: string | null;
  tokenB: string | null;
  setTokenA: Dispatch<SetStateAction<string | null>>;
  setTokenB: Dispatch<SetStateAction<string | null>>;
  feeTier: number | null;
  setFeeTier: Dispatch<SetStateAction<number | null>>;
  amountA: number;
  amountB: number;
  setAmounts: (a: number, b: number) => void;
  pool?: Pool | null;
  poolExists?: boolean;
  isPending?: boolean;
  isConfirming?: boolean;
  hash?: string;
  isPoolLoading?: boolean;
  localError?: { shortMessage?: string; message?: string } | null;
  onCreatePool?: () => void;
  reviewData: ReviewData;
  setReviewData: Dispatch<SetStateAction<ReviewData>>;
}

export interface Step2DepositAmountProps {
  tokenA: string;
  tokenB: string;
  tokenObjA?: Token;
  tokenObjB?: Token;
  amountA: number;
  amountB: number;
  setAmounts: (a: number, b: number) => void;
  onNext: () => void;
  onBack: () => void;
  poolReserves?: { reserveA: number; reserveB: number };
  setReviewData: Dispatch<SetStateAction<ReviewData>>;
  feeTier: number;
}

export interface Step3ReviewProps {
  tokenA: string | null;
  tokenB: string | null;
  amountA: number;
  amountB: number;
  reviewData: ReviewData; // <-- all computed numbers here
  onConfirm: () => void;
  onBack: () => void;
}

interface CoinGeckoToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  platforms?: Record<string, string>; // e.g., arbitrum: "0x..."
}

export interface TokenListResponse {
  name: string;
  tokens: CoinGeckoToken[];
}

interface DexScreenerPair {
  priceUsd: string; // the price in USD
}

export interface DexScreenerPriceResponse {
  pairs: DexScreenerPair[];
}

export interface PoolsState {
  allPools: Pool[];
  userPools: Pool[];
  isLoadingAllPools: boolean;
  isLoadingUserPools: boolean;
  errorAllPools?: string;
  errorUserPools?: string;

  fetchAllPools: (publicClient: PublicClient) => Promise<void>;
  fetchUserPools: (
    userAddress: `0x${string}`,
    publicClient: PublicClient
  ) => Promise<void>;
}

export interface CoinGeckoPriceResponse {
  [address: string]: { usd: number };
}
