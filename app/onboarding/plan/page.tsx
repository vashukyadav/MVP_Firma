"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db, type PlanType } from "@/lib/db";
import { useAuthStore } from "@/store/authStore";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";

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

  const handleContinue = async () => {
    if (!currentUser?.id) {
      alert("User not found. Please login again.");
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <OnboardingHeader />

      {/* Main Container */}
      <main className="flex-1 pb-16 pt-4">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Stepper (Step 1: Plan) */}
          <OnboardingStepper currentStep={1} />

          {/* Page Heading */}
          <div className="text-center my-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Choose the right plan for your business
            </h1>
            <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto">
              Select a plan based on your team size and business needs. You can always upgrade later.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative flex flex-col justify-between rounded-2xl border bg-white p-6 transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "border-blue-600 ring-2 ring-blue-100 shadow-md"
                      : "border-slate-200/80 hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <div>
                    {/* Top Row: Title, Badge & Radio */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">
                          {plan.name}
                        </span>
                        {plan.recommended && (
                          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                            Recommended
                          </span>
                        )}
                      </div>

                      {/* Custom Radio Button */}
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${
                          isSelected
                            ? "border-blue-600 bg-blue-600"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-slate-900">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-xs font-medium text-slate-500">
                          {plan.period}
                        </span>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
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
          <div className="mt-10 flex items-center justify-between border-t border-slate-200/60 pt-6">
            <button
              type="button"
              onClick={() => router.push("/onboarding/welcome")}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-[0.99] transition cursor-pointer"
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