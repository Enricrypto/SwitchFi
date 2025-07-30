'use client';

import React from "react";
import {
  CurrencyDollarIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
 
export function PoolStepperContent() {
  const [activeStep, setActiveStep] = React.useState(0);
  
  const steps = [
    {
      icon: CurrencyDollarIcon,
      title: "Step 1",
      description: "Select token & fee tier"
    },
    {
      icon: AdjustmentsHorizontalIcon,
      title: "Step 2", 
      description: "Set initial price & range"
    },
    {
      icon: PlusIcon,
      title: "Step 3",
      description: "Enter deposit amount"
    }
  ];
 
  return (
    <div className="w-full flex justify-center py-12">
      <div className="max-w-2xl px-6">
        {/* Custom Stepper */}
        <div className="flex items-center">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            
            return (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center relative">
                  {/* Step Circle */}
                  <button
                    onClick={() => setActiveStep(index)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 z-10 ${
                      isActive 
                        ? 'bg-lightblue text-white shadow-[0_0_20px_#AB37FF66]' 
                        : isCompleted
                        ? 'bg-lightblue text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                    aria-label={`Go to ${step.title}: ${step.description}`}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                  
                  {/* Step Info */}
                  <div className="absolute -bottom-16 w-max text-center">
                    <h6 className={`text-sm font-semibold ${
                      isActive ? 'text-white' : 'text-white/60'
                    }`}>
                      {step.title}
                    </h6>
                    <p className={`text-xs mt-1 ${
                      isActive ? 'text-white/80' : 'text-white/40'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`w-24 h-0.5 mx-3 ${
                    index < activeStep ? 'bg-lightblue' : 'bg-white/20'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      
      {/* Navigation Buttons - Hidden for now */}
      {/* <div className="flex justify-between mt-8">
        <Button
          onClick={handlePrev}
          disabled={isFirstStep}
          variant="secondary"
          size="md"
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={isLastStep}
          variant="primary"
          size="md"
        >
          Next
        </Button>
      </div> */}
    </div>
  );
}
