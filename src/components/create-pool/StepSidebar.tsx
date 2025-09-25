// components/create-pool/StepSidebar.tsx
import { CheckCircle, Circle } from 'lucide-react';

interface StepSidebarProps {
  step: number;
}

const steps = [
  { id: 1, title: 'Select Tokens & Fee Tier' },
  { id: 2, title: 'Set initial Liquidity Deposit' },
  { id: 3, title: 'Confirm and Review Pool Details' },
  { id: 4, title: 'Approve & Create Pool Transaction' },
];

export default function StepSidebar({ step }: StepSidebarProps) {
  return (
    <div className="flex flex-col gap-4 p-4 text-sm text-white/80">
      {steps.map((s) => {
        const isCompleted = s.id < step;
        const isActive = s.id === step;

        return (
          <div
            key={s.id}
            className={`flex items-center gap-2 rounded-lg px-2 py-1 transition ${
              isActive
                ? 'bg-purple-600/20 text-white font-semibold'
                : isCompleted
                  ? 'text-green-400'
                  : 'text-white/50'
            }`}
          >
            {isCompleted ? (
              <CheckCircle size={18} className="text-green-400" />
            ) : (
              <Circle
                size={18}
                className={isActive ? 'text-purple-400' : 'text-gray-500'}
              />
            )}
            <span>{s.title}</span>
          </div>
        );
      })}
    </div>
  );
}
