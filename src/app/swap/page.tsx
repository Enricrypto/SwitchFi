'use client';

import { useState } from 'react';
import SwapForm from '../../components/swap/SwapForm';
import { SwapSettingsModal } from '../../components/swap/SwapSettingsModal';

export default function SwapPage() {
  // ───── Swap Settings State ─────
  const [slippagePercent, setSlippagePercent] = useState(0.5); // Default 0.5%
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#120023] via-[#1B002B] to-[#2B003D] text-white font-sans overflow-hidden">
      {/* ───── Swap Form ───── */}
      <SwapForm
        onToggleSettings={() => setIsSettingsOpen(true)}
        slippagePercent={slippagePercent}
      />

      {/* ───── Swap Settings Modal ───── */}
      <SwapSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        slippage={slippagePercent}
        setSlippage={setSlippagePercent}
      />
    </div>
  );
}
