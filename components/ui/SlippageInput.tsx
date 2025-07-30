import React, { useState, useEffect } from 'react';

type SlippageInputProps = {
  defaultSlippage?: number;
  onChange?: (slippage: number) => void;
  showToggle?: boolean;
  autoSlippage?: boolean;
  onToggleAuto?: (enabled: boolean) => void;
};

const PRESET_SLIPPAGE = [0.1, 0.5, 1, 3, 5]; // common presets

export function SlippageInput({
  defaultSlippage = 0.5,
  onChange,
  showToggle = false,
  autoSlippage = false,
  onToggleAuto,
}: SlippageInputProps) {
  // ───── State for current slippage and custom input ─────
  const [slippage, setSlippage] = useState(defaultSlippage);
  const [customInput, setCustomInput] = useState('');
  const [warning, setWarning] = useState<string | null>(null);

  // ───── Effect: Update slippage value and validate warning messages ─────
  useEffect(() => {
    const valueToUse = autoSlippage ? 0.5 : slippage;
    onChange?.(valueToUse);

    if (!autoSlippage) {
      if (slippage < 0.1 && slippage !== 0) {
        setWarning('Slippage too low: your transaction might fail.');
      } else if (slippage > 5) {
        setWarning('Slippage too high: you might lose funds.');
      } else {
        setWarning(null);
      }
    } else {
      setWarning(null);
    }
  }, [slippage, autoSlippage, onChange]);

  // ───── Select a preset slippage value ─────
  const selectPreset = (value: number) => {
    setSlippage(value);
    setCustomInput('');
  };

  // ───── Handle user input for custom slippage ─────
  const onCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInput(val);

    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && num <= 10) {
      setSlippage(num);
    }
  };

  // ───── Determine if current slippage is a custom value ─────
  const isCustom = !PRESET_SLIPPAGE.includes(slippage);

  return (
    <div className="w-full max-w-sm p-6 bg-[#2A0040] rounded-lg text-white">
      {/* ───── Auto max slippage toggle ───── */}
      <div className="flex items-center justify-between mb-6">
        <label className="block font-semibold text-lg">
          Auto Max Slippage (0.5%)
        </label>
        {showToggle && (
          <button
            type="button"
            onClick={() => onToggleAuto?.(!autoSlippage)}
            className={`cursor-pointer w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
              autoSlippage ? 'bg-purple-600' : 'bg-gray-600'
            }`}
            aria-pressed={autoSlippage}
            aria-label="Toggle auto max slippage"
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                autoSlippage ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        )}
      </div>

      {/* ───── Preset slippage buttons ───── */}
      <div className="flex gap-4 mb-6 justify-center">
        {PRESET_SLIPPAGE.map((val) => (
          <button
            key={val}
            onClick={() => selectPreset(val)}
            disabled={autoSlippage}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition-shadow duration-200
              ${
                !isCustom && slippage === val
                  ? 'bg-purple-400 shadow-lg text-black'
                  : 'bg-purple-900 hover:bg-purple-800'
              }
              ${autoSlippage ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            aria-pressed={!isCustom && slippage === val}
            type="button"
          >
            {val}%
          </button>
        ))}
      </div>

      {/* ───── Custom slippage input ───── */}
      <label
        htmlFor="slippage-input"
        className="block font-semibold text-sm mb-2"
      >
        Set Slippage
      </label>

      <input
        id="slippage-input"
        className={`w-full p-3 rounded-lg bg-[#320148] border border-purple-600 text-white font-medium transition
          ${
            isCustom ? '' : ''
          } ${autoSlippage ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
        `}
        type="number"
        min={0}
        max={10}
        step={0.01}
        value={customInput}
        onChange={onCustomChange}
        disabled={autoSlippage}
        placeholder="Enter custom slippage %"
        aria-describedby="slippage-warning"
      />

      {/* ───── Help text ───── */}
      <p className="mt-3 text-sm text-purple-300 text-center">
        Enter a custom slippage between 0% and 10%
      </p>

      {/* ───── Warning message ───── */}
      {warning && (
        <p
          id="slippage-warning"
          className="mt-3 text-xs text-yellow-400 text-center"
        >
          {warning}
        </p>
      )}
    </div>
  );
}
