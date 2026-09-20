"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db, type PlanType } from "@/lib/db";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/components/ui/toast";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";
import { Check, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

interface PlanItem {
  id: PlanType;
  name: string;
  price: string;
  period?: string;
  recommended?: boolean;
  features: string[];
}

const plans: PlanItem[] = [
  {
    id: "STARTER",
    name: "Starter",
    price: "₹4,999",
    period: "/ year",
    recommended: true,
    features: [
      "Up to 50 team members",
      "Project management",
      "Basic support",
    ],
  },
  {
    id: "PROFESSIONAL",
    name: "Professional",
    price: "₹9,999",
    period: "/ year",
    features: [
      "Up to 200 team members",
      "Advanced reporting",
      "Role based support",
    ],
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: "Custom",
    features: [
      "Unlimited team members",
      "Advanced security",
      "Dedicated support",
      "Custom features",
    ],
  },
];

export default function PlanPage() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.currentUser);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("STARTER");

  // ── ALL ORIGINAL LOGIC PRESERVED ──────────────────────────────────────
  const handleContinue = async () => {
    if (!currentUser?.id) {
      toast.error("User not found. Please login again.");
      return;
    }

    await db.onboarding.put({
      userId: currentUser.id,
      plan: selectedPlan,
      companyCompleted: false,
      billingCompleted: false,
    });

    router.push("/onboarding/company");
  };
  // ───────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-stone flex flex-col font-sans antialiased">
      <OnboardingHeader />

      <main className="flex-1 pb-16 pt-4">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <OnboardingStepper currentStep={1} />

          {/* Page Heading */}
          <div className="text-center my-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-breath px-3.5 py-1.5 text-eyebrow font-semibold text-onyx border border-pebble mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Step 1 of 4
            </div>
            <h1 className="text-display-h1 font-bold tracking-tight text-onyx">
              Choose the right plan for your business
            </h1>
            <p className="mt-2 text-body text-ash max-w-xl mx-auto">
              Select a plan based on your team size and business needs. You can always upgrade later.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative flex flex-col justify-between rounded-[20px] border bg-white p-6 transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "border-onyx ring-2 ring-breath shadow-none"
                      : "border-pebble hover:border-onyx shadow-none"
                  }`}
                >
                  <div>
                    {/* Top Row: Title, Badge & Radio */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-heading-h3 font-bold text-onyx">
                          {plan.name}
                        </span>
                        {plan.recommended && (
                          <span className="rounded-full bg-onyx px-2 py-0.5 text-eyebrow font-bold text-white">
                            Recommended
                          </span>
                        )}
                      </div>

                      {/* Custom Radio Button */}
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors shrink-0 ${
                          isSelected
                            ? "border-onyx bg-onyx"
                            : "border-pebble bg-white"
                        }`}
                      >
                        {isSelected && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-onyx">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-eyebrow font-medium text-ash">
                          {plan.period}
                        </span>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="mt-5 space-y-2.5 border-t border-pebble pt-5">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2.5 text-body text-onyx">
                          <Check className="h-3.5 w-3.5 text-complete-status shrink-0 mt-0.5 stroke-[2.5]" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Navigation */}
          <div className="mt-10 flex items-center justify-between border-t border-pebble pt-6">
            <button
              type="button"
              onClick={() => router.push("/onboarding/welcome")}
              className="flex items-center gap-2 rounded-[10px] border border-pebble bg-stone px-4 py-2 text-body font-semibold text-onyx hover:bg-mist transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="flex items-center gap-2 rounded-[10px] bg-onyx px-6 py-2.5 text-body font-bold text-white hover:bg-onyx/90 active:scale-[0.99] transition cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}