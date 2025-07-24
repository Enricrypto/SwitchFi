import React, { useState, useEffect } from 'react';

type SlippageInputProps = {
  defaultSlippage?: number; // default slippage %
  onChange?: (slippage: number) => void; // callback on change
};

const PRESET_SLIPPAGE = [0.1, 0.5, 1, 3, 5]; // common presets

export function SlippageInput({
  defaultSlippage = 0.5,
  onChange,
}: SlippageInputProps) {
  const [slippage, setSlippage] = useState(defaultSlippage);
  const [customInput, setCustomInput] = useState('');
  const [warning, setWarning] = useState<string | null>(null);

  // Trigger onChange whenever slippage changes
  useEffect(() => {
    if (onChange) {
      onChange(slippage);
    }

    // Show warnings
    if (slippage < 0.1 && slippage !== 0) {
      setWarning('Slippage too low: your transaction might fail.');
    } else if (slippage > 5) {
      setWarning('Slippage too high: you might lose funds.');
    } else {
      setWarning(null);
    }
  }, [slippage, onChange]);

  // Handle preset button click
  function selectPreset(value: number) {
    setSlippage(value);
    setCustomInput(''); // clear custom input
  }

  // Handle custom input change
  function onCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;

    // Allow empty input
    setCustomInput(val);

    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && num <= 5) {
      setSlippage(num);
    }
  }

  const isCustom = !PRESET_SLIPPAGE.includes(slippage);

  return (
    <div className="w-full max-w-sm p-2 bg-[#1B002B] rounded-lg text-white">
      <label className="block mb-2 font-normal text-sm">
        Transaction Slippage (%)
      </label>

      <div className="flex gap-4 mb-4 justify-center">
        {PRESET_SLIPPAGE.map((val) => (
          <button
            key={val}
            onClick={() => selectPreset(val)}
            className={`px-3 py-1 rounded ${
              !isCustom && slippage === val
                ? 'bg-purple-400 font-bold'
                : 'bg-purple-900 hover:bg-purple-700'
            }`}
            aria-pressed={!isCustom && slippage === val}
            type="button"
          >
            {val}%
          </button>
        ))}
      </div>

      <input
        id="slippage-input"
        type="number"
        min={0}
        max={10}
        step={0.01}
        placeholder="Custom %"
        value={customInput}
        onChange={onCustomChange}
        className={`w-full p-2 rounded bg-[#320148] border border-purple-600 text-white ${
          isCustom ? 'font-medium' : ''
        }`}
      />

      <p className="mt-2 text-sm text-purple-400 text-center">
        Enter a custom slippage between 0% and 10%
      </p>

      {warning && (
        <p className="mt-2 text-xs text-yellow-400 text-center">{warning}</p>
      )}
    </div>
  );
}
