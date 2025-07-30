import { Fragment, useState } from 'react';
import {
  Dialog,
  Transition,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from '@headlessui/react';
import { SlippageInput } from '../../components/ui/SlippageInput';
import { SwapSettingsModalProps } from '../../types/interfaces';

export function SwapSettingsModal({
  isOpen,
  onClose,
  slippage,
  setSlippage,
}: SwapSettingsModalProps) {
  // ───── Local state to control auto slippage toggle ─────
  const [autoSlippage, setAutoSlippage] = useState(true);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50" onClose={onClose}>
        {/* Backdrop with blur */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md" />
        </TransitionChild>

        {/* Modal panel centered on screen */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-md rounded-2xl bg-[#1a002c] p-6 text-white shadow-xl border border-purple-900">
              {/* Modal Title */}
              <DialogTitle className="text-lg font-semibold text-purple-300 mb-4">
                Settings
              </DialogTitle>

              {/* Slippage Input component with toggle */}
              <div className="space-y-4">
                <SlippageInput
                  showToggle={true}
                  autoSlippage={autoSlippage}
                  onToggleAuto={setAutoSlippage}
                  defaultSlippage={slippage}
                  onChange={setSlippage}
                />
              </div>

              {/* Close button */}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-purple-500 hover:bg-purple-600 transition-colors text-white font-medium px-4 py-2 rounded-xl shadow-md"
                >
                  Close
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
