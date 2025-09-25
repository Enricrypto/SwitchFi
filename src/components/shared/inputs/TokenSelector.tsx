import { useState, useMemo } from 'react';
import { Props } from '@/src/types/interfaces';
import { useTokenListStore } from '@/store/useTokenListStore';
import TokenIcon from '../icons/TokenIcon';
import { ChevronDown } from 'lucide-react';
import Spinner from '../layout/Spinner';

const TokenSelector = ({
  token,
  onSelect,
  placeholder = 'Select',
  label,
  onPriceFetch,
}: Props) => {
  const tokenList = useTokenListStore((state) => state.tokenList);
  const isLoading = useTokenListStore((state) => state.isLoading);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Memoized filtered list
  const filteredTokens = useMemo(() => {
    const query = search.trim().toLowerCase();

    // show top 20 if search is empty
    if (!query) return tokenList.slice(0, 20);

    return tokenList.filter(
      (t) =>
        t.symbol.toLowerCase().includes(query) ||
        t.name.toLowerCase().includes(query) ||
        t.address.toLowerCase() === query || // exact address match
        t.address.toLowerCase().startsWith(query) // allow partial match
    );
  }, [search, tokenList]);

  // -------------------- Price fetch --------------------
  const fetchPrice = async (address: string) => {
    if (!onPriceFetch) return;
    try {
      const res = await fetch(`/api/prices?addresses=${address}`);
      const data = await res.json();
      const price = data[address.toLowerCase()] ?? 0;
      onPriceFetch(price);
    } catch (err) {
      console.warn('Failed to fetch token price:', err);
      onPriceFetch(0);
    }
  };

  // Loading state
  if (isLoading) return <Spinner />;

  return (
    <div className="relative">
      {/* Button to open dropdown */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="
      flex flex-col items-start gap-1
      bg-[#320148]
      border border-purple-500
      text-white
      font-semibold
      px-4 py-2
      rounded-full
      cursor-pointer
      hover:bg-[#40015f]
      transition
    "
      >
        {label && (
          <span className="text-xs text-white/70 font-normal">{label}</span>
        )}
        <div className="flex items-center gap-2">
          {token && <TokenIcon address={token.address} />}
          <span>{token?.symbol || placeholder || 'Select'}</span>
          <ChevronDown size={16} className="text-purple-300" />
        </div>
      </button>

      {/* Dropdown list */}
      {open && (
        <div
          className="
        absolute z-20 mt-2 w-56 max-h-64 overflow-y-auto
        bg-[#1B002B]
        border border-[#AB37FF33]
        rounded-xl
        shadow-[0_0_30px_#AB37FF33]
        backdrop-blur-md
      "
        >
          {/* 🆕 Search bar */}
          <div className="sticky top-0 bg-[#1B002B] p-2 border-b border-[#AB37FF33]">
            <input
              type="text"
              placeholder="Search token..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full rounded-lg bg-[#2A0040]
                text-white px-3 py-2 text-sm
                placeholder-white/40
                focus:outline-none focus:ring-2 focus:ring-purple-400
              "
            />
          </div>

          {/* 🆕 Show filtered tokens */}
          {filteredTokens.length === 0 ? (
            <div className="p-3 text-center text-white/60 text-sm">
              No tokens found
            </div>
          ) : (
            filteredTokens.map((t) => (
              <button
                key={t.address}
                type="button"
                onClick={() => {
                  onSelect(t);
                  fetchPrice(t.address);
                  setOpen(false);
                  setSearch('');
                }}
                className="
                  flex items-center justify-between w-full text-left px-4 py-3
                  hover:bg-[#2A0040] text-white
                "
              >
                <div className="flex items-center gap-3">
                  <TokenIcon address={t.address} />
                  <div className="font-medium">{t.symbol}</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TokenSelector;
