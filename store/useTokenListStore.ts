import { create } from 'zustand';
import axios from 'axios';
import {
  TokenListState,
  Token,
  TokenListResponse,
  CoinGeckoPriceResponse,
} from '../types/interfaces';

export const useTokenListStore = create<TokenListState>((set) => ({
  tokenList: [] as Token[],
  tokenMap: {} as Record<string, Token>, // for fast lookup by address
  prices: {} as Record<string, number>, // USD prices
  isLoading: false,
  error: undefined,

  fetchTokenList: async () => {
    set({ isLoading: true, error: undefined });

    try {
      const res = await axios.get<TokenListResponse>(
        'https://tokens.coingecko.com/arbitrum-one/all.json'
      );

      const tokens: Token[] = res.data.tokens.map((t) => ({
        address: t.address.toLowerCase() as `0x${string}`,
        name: t.name,
        symbol: t.symbol,
        decimals: t.decimals,
        logoURI: t.logoURI,
      }));

      const tokenMap: Record<string, Token> = {};
      tokens.forEach((t) => (tokenMap[t.address] = t));

      set({ tokenList: tokens, tokenMap, isLoading: false });
    } catch (err) {
      console.error('Failed to fetch token list', err);
      set({ error: 'Failed to fetch token list', isLoading: false });
    }
  },

  fetchPrices: async (addresses: string[]) => {
    if (!addresses.length) return;
    try {
      const ids = addresses.map((a) => a.toLowerCase()).join(',');
      const url = `https://api.coingecko.com/api/v3/simple/token_price/arbitrum-one?contract_addresses=${ids}&vs_currencies=usd`;
      const res = await axios.get<CoinGeckoPriceResponse>(url);

      const prices: Record<string, number> = {};
      Object.entries(res.data).forEach(([address, data]) => {
        prices[address.toLowerCase()] = data.usd;
      });

      set((state) => ({ prices: { ...state.prices, ...prices } }));
    } catch (err) {
      console.error('Failed to fetch token prices', err);
    }
  },
}));
