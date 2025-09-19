'use client';

import { StepMultistepProps } from '@/types/interfaces';
import Step1TokenSelection from '@/components/steps/Step1TokenSelection';
import Step2DepositAmount from '@/components/steps/Step2DepositAmount';

export default function StepMultistep({
  step,
  setStep,
  tokenA,
  tokenB,
  setTokenA,
  setTokenB,
  feeTier,
  setFeeTier,
  amountA,
  amountB,
  setAmounts,
  pool,
  poolExists,
  isPending,
  isConfirming,
  hash,
  isPoolLoading,
  localError,
  onCreatePool,
}: StepMultistepProps) {
  // optional local state for step-specific inputs
  // Step 2: deposit amounts
  // could also be lifted to parent if needed in step 4
  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  return (
    <>
      {step === 1 && (
        <Step1TokenSelection
          tokenA={tokenA}
          tokenB={tokenB}
          feeTier={feeTier}
          setTokenA={setTokenA}
          setTokenB={setTokenB}
          setFeeTier={setFeeTier}
          onNext={handleNext}
        />
      )}

      {step === 2 && (
        <Step2DepositAmount
          tokenA={tokenA}
          tokenB={tokenB}
          poolReserves={
            pool
              ? {
                  reserveA: Number(pool.reserves[0]),
                  reserveB: Number(pool.reserves[1]),
                }
              : undefined
          }
          amountA={amountA}
          amountB={amountB}
          setAmounts={setAmounts}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {/* {step === 3 && (
        <Step3DepositAmount onNext={handleNext} onBack={handleBack} />
      )} */}

      {/* {step === 4 && (
        <Step4Confirm
          onBack={handleBack}
          onCreatePool={onCreatePool}
          poolExists={poolExists}
          isPending={isPending}
          isConfirming={isConfirming}
          hash={hash}
          isPoolLoading={isPoolLoading}
          localError={localError}
        />
      )} */}
    </>
  );
}
