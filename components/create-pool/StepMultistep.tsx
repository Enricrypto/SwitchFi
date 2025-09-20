'use client';

import { StepMultistepProps } from '@/types/interfaces';
import Step1TokenSelection from '@/components/steps/Step1TokenSelection';
import Step2DepositAmount from '@/components/steps/Step2DepositAmount';
import Step3Review from '@/components/steps/Step3Review';

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
  // poolExists,
  // isPending,
  // isConfirming,
  // hash,
  // isPoolLoading,
  // localError,
  // onCreatePool,
  reviewData,
  setReviewData,
}: StepMultistepProps) {
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
          setReviewData={setReviewData}
        />
      )}

      {step === 3 && (
        <Step3Review
          tokenA={tokenA}
          tokenB={tokenB}
          amountA={amountA}
          amountB={amountB}
          reviewData={reviewData} // <-- pass the whole object
          onConfirm={handleNext}
          onBack={handleBack}
        />
      )}
    </>
  );
}
