'use client';

import { useState } from 'react';
import Header from '../../components/ui/Header';
import SwapForm from '../../components/ui/SwapForm';
import { SwapSettingsModal } from '../../components/modals/SwapSettings';

export default function SwapPage() {
  // ───── Swap Settings State ─────
  const [slippagePercent, setSlippagePercent] = useState(0.5); // Default 0.5%
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#120023] via-[#1B002B] to-[#2B003D] text-white font-sans overflow-hidden">
      {/* ───── Page Header ───── */}
      <Header />

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
