import React, { useState } from 'react';
import { TokenSelectorProps, Token } from '../../types/interfaces';
import TokenIcon from './TokenIcon';
import { ChevronDown } from 'lucide-react';
import Spinner from './Spinner';

interface Props extends TokenSelectorProps {
  tokens?: Token[];
}

const TokenSelector = ({ token, onSelect, tokens = [] }: Props) => {
  const [open, setOpen] = useState(false);

  // ───── Loading state: Show spinner if tokens haven't loaded ─────
  if (!tokens.length) return <Spinner />;

  return (
    <div
      tabIndex={0}
      onBlur={() => setOpen(false)}
      onFocus={() => {}}
      className="relative focus:outline-none"
    >
      {/* ───── Token Selector Button ───── */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="
          flex items-center gap-2
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
        {token && <TokenIcon address={token.address} />}
        <span>{token?.symbol || 'Select'}</span>
        <ChevronDown size={16} className="text-purple-300" />
      </button>

      {/* ───── Token Dropdown List ───── */}
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
          {/* ───── Token Options ───── */}
          {tokens.map((t) => (
            <button
              key={t.address}
              onMouseDown={() => {
                onSelect(t);
                setOpen(false);
              }}
              className="
                flex items-center gap-3 w-full text-left px-4 py-3
                hover:bg-[#2A0040] text-white
              "
            >
              <TokenIcon address={t.address} />
              <div className="font-medium">{t.symbol}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TokenSelector;
