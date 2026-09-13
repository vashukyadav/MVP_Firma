"use client";

import { useRouter } from "next/navigation";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";
import { Check, ArrowRight, Sparkles } from "lucide-react";

export default function CompletePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-stone flex flex-col font-sans antialiased">
      {/* Header */}
      <OnboardingHeader />

      {/* Main Container */}
      <main className="flex-1 pb-16 pt-4 flex flex-col items-center">
        <div className="w-full max-w-4xl px-4 sm:px-6">
          {/* Stepper (Step 4: All 4 Complete) */}
          <OnboardingStepper currentStep={4} />

          {/* Centered Celebration Card */}
          <div className="mx-auto mt-10 max-w-lg text-center bg-white p-8 sm:p-10 rounded-[20px] border border-pebble">
            
            {/* Animated / Celebratory Checkmark Icon with Confetti Particles */}
            <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
              {/* Confetti Particles (SVG) */}
              <svg
                className="absolute inset-0 h-full w-full pointer-events-none"
                viewBox="0 0 144 144"
                fill="none"
              >
                {/* Dots & Stars */}
                <circle cx="20" cy="30" r="3" fill="#f9f2aa" />
                <circle cx="124" cy="35" r="3.5" fill="#dae4de" />
                <circle cx="15" cy="90" r="2.5" fill="#608164" />
                <circle cx="130" cy="85" r="3" fill="#608164" />
                <circle cx="35" cy="125" r="2" fill="#5e4040" />
                <circle cx="110" cy="120" r="2.5" fill="#f9f2aa" />
                
                {/* Confetti rectangles / ribbons */}
                <rect x="25" y="55" width="6" height="3" rx="1.5" transform="rotate(30 25 55)" fill="#b84c4c" />
                <rect x="115" y="60" width="7" height="3" rx="1.5" transform="rotate(-25 115 60)" fill="#608164" />
                <rect x="40" y="20" width="6" height="3" rx="1.5" transform="rotate(-40 40 20)" fill="#608164" />
                <rect x="100" y="20" width="6" height="3" rx="1.5" transform="rotate(45 100 20)" fill="#f9f2aa" />
                <rect x="30" y="105" width="7" height="3" rx="1.5" transform="rotate(65 30 105)" fill="#dae4de" />
                <rect x="110" y="100" width="6" height="3" rx="1.5" transform="rotate(-30 110 100)" fill="#5e4040" />
              </svg>

              {/* Glowing Outer Rings */}
              <div className="absolute h-28 w-28 rounded-full bg-clear-bg/70 animate-pulse" />
              
              {/* Inner Circle with Success Fill */}
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-clear-bg text-success-text ring-4 ring-breath">
                <Check className="h-10 w-10 stroke-[3]" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <h1 className="mt-6 text-display-h1 font-bold tracking-tight text-onyx flex items-center justify-center gap-2">
              <span>You&apos;re all set!</span>
              <span className="text-2xl">🎉</span>
            </h1>

            <p className="mt-3 text-body text-ash max-w-sm mx-auto leading-relaxed">
              Your company has been successfully onboarded. You can now start managing projects, teams, and quotations with FIRMA.
            </p>

            {/* Action Button */}
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="flex items-center justify-center gap-2 rounded-[10px] bg-onyx px-8 py-3 text-body font-bold text-white shadow-none transition hover:bg-onyx/90 active:scale-[0.99] cursor-pointer w-full max-w-xs"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}