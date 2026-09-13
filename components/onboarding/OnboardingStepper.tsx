"use client";

import React from "react";
import { Check } from "lucide-react";

interface OnboardingStepperProps {
  currentStep: 1 | 2 | 3 | 4; // 1: Plan, 2: Company, 3: Billing, 4: Complete
}

const steps = [
  { step: 1, label: "Plan" },
  { step: 2, label: "Company" },
  { step: 3, label: "Billing" },
  { step: 4, label: "Complete" },
];

export function OnboardingStepper({ currentStep }: OnboardingStepperProps) {
  return (
    <div className="w-full max-w-lg mx-auto py-5 px-4">
      <div className="relative flex items-center justify-between">
        {/* Connecting Line Segments */}
        <div className="absolute left-[8%] right-[8%] top-[16px] -translate-y-1/2 flex -z-0">
          <div
            className={`h-[2px] flex-1 transition-colors duration-200 ${
              currentStep >= 2 ? "bg-onyx" : "bg-pebble"
            }`}
          />
          <div
            className={`h-[2px] flex-1 transition-colors duration-200 ${
              currentStep >= 3 ? "bg-onyx" : "bg-pebble"
            }`}
          />
          <div
            className={`h-[2px] flex-1 transition-colors duration-200 ${
              currentStep === 4 ? "bg-onyx" : "bg-pebble"
            }`}
          />
        </div>

        {/* Step Nodes */}
        {steps.map((item) => {
          const isCompleted =
            currentStep === 4
              ? true
              : item.step < currentStep;

          const isActive = currentStep !== 4 && item.step === currentStep;

          return (
            <div key={item.step} className="relative z-10 flex flex-col items-center">
              {/* Step Circle */}
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                  isCompleted
                    ? "bg-complete-status text-white shadow-none"
                    : isActive
                    ? "bg-onyx text-white ring-4 ring-breath shadow-none"
                    : "border border-pebble bg-white text-ash"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 stroke-[2.5]" />
                ) : (
                  <span>{item.step}</span>
                )}
              </div>

              {/* Step Label */}
              <span
                className={`mt-1.5 text-eyebrow font-medium tracking-tight ${
                  isActive
                    ? "text-onyx font-bold"
                    : isCompleted
                    ? "text-onyx font-medium"
                    : "text-ash"
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
