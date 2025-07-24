import { SlippageInput } from './Slippage';

interface SwapSettingsProps {
  slippage: number;
  setSlippage: (val: number) => void;
  showSlippage: boolean;
}

export function SwapSettings({
  slippage,
  setSlippage,
  showSlippage,
}: SwapSettingsProps) {
  if (!showSlippage) return null;

  return (
    <div className="relative p-4 bg-[#2A0040] rounded-lg text-white max-w-md">
      <SlippageInput defaultSlippage={slippage} onChange={setSlippage} />
    </div>
  );
}
