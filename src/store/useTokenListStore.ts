import { create } from 'zustand';
import axios from 'axios';
import { TokenListState, Token, TokenListResponse } from '../types/interfaces';

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

  fetchPrice: async (address: string) => {
    if (!address) return;

    const normalized = address.toLowerCase();
    try {
      const res = await fetch(`/api/prices?address=${normalized}`);
      const data = await res.json();
      const price = data[normalized] ?? undefined;

      set((state) => ({
        prices: { ...state.prices, [normalized]: price },
      }));
    } catch (err) {
      console.warn('Failed to fetch token price:', err);
    }
  },
}));
