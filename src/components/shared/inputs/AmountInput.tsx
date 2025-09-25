import { AmountInputProps } from '../../types/interfaces';

/**
 * A styled input component for entering numeric token amounts.
 */
const AmountInput = ({ value, onChange }: AmountInputProps) => {
  return (
    <div className="mb-4">
      {/* Numeric input field */}
      <input
        type="number"
        min="0"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0.00"
        className="
        w-full
        bg-transparent
        text-3xl
        font-semibold
        placeholder-purple-400
        text-white
        border-none
        focus:outline-none
        focus:ring-0
        p-0
        m-0
      "
      />
    </div>
  );
};

export default AmountInput;
