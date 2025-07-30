import { create } from 'zustand';
import { TokenListState } from '../types/interfaces';

// Create a Zustand store to manage the token list state globally
export const useTokenListStore = create<TokenListState>((set) => ({
  tokenList: [], // Holds the array of tokens fetched from CoinGecko
  isLoading: false, // Tracks whether the token list is currently loading
  error: undefined, // Holds any error message if fetching fails

  // Async action to fetch the token list from the CoinGecko endpoint
  fetchTokenList: async () => {
    set({ isLoading: true }); // Set loading to true before fetch starts

    try {
      // Fetch token list JSON from CoinGecko's Uniswap token list URL
      const res = await fetch('https://tokens.coingecko.com/uniswap/all.json');
      const data = await res.json();

      // Update the store with the fetched tokens and mark loading as false
      set({ tokenList: data.tokens, isLoading: false });
    } catch (err) {
      // Log error to console for debugging
      console.error('Failed to fetch token list', err);

      // Update store with error message and mark loading as false
      set({ error: 'Failed to fetch token list', isLoading: false });
    }
  },
}));
