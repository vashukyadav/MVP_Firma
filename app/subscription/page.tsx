"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import { db, type PlanType } from "@/lib/db";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  CreditCard,
  Check,
  Zap,
  ShieldCheck,
  Clock,
  Download,
  ArrowUpRight,
} from "lucide-react";

const planDetails: Record<
  PlanType,
  {
    name: string;
    price: string;
    period: string;
    description: string;
    badge?: string;
    features: string[];
  }
> = {
  STARTER: {
    name: "Starter",
    price: "₹4,999",
    period: "/ year",
    description: "Ideal for small teams and contractors starting out.",
    features: [
      "Up to 50 team members",
      "Project & task management",
      "Basic financial reporting",
      "Email support within 24h",
      "Mobile access for field workers",
    ],
  },
  PROFESSIONAL: {
    name: "Professional",
    price: "₹9,999",
    period: "/ year",
    description: "For growing teams that need deeper automation and control.",
    badge: "Most Popular",
    features: [
      "Unlimited team members",
      "Advanced project & Gantt charts",
      "Full quotation & billing workflow",
      "Real-time profit & loss analytics",
      "Priority phone & email support",
      "Custom role permissions",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: "Custom",
    period: "tailored billing",
    description: "For large construction firms with bespoke integrations.",
    features: [
      "Everything in Professional",
      "Dedicated account manager",
      "Custom ERP & accounting integrations",
      "99.9% uptime SLA",
      "Custom security & SSO audit logs",
    ],
  },
};

export default function SubscriptionPage() {
  const { currentUser } = useAuthStore();

  const [plan, setPlan] = useState<PlanType>("STARTER");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }

      const onboarding = await db.onboarding.get(currentUser.id);
      if (onboarding?.plan) {
        setPlan(onboarding.plan);
      }
      setLoading(false);
    };

    loadSubscription();
  }, [currentUser?.id]);

  const selectedPlan = planDetails[plan] || planDetails.STARTER;

  if (loading) {
    return (
      <FirmaLayout activeNav="Subscription">
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-xs font-medium text-slate-400">
            Loading subscription...
          </p>
        </div>
      </FirmaLayout>
    );
  }

  return (
    <FirmaLayout activeNav="Subscription">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pb-2">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            SUBSCRIPTION &amp; BILLING
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight flex items-center gap-2">
            Plans &amp; Subscription
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your current FIRMA subscription plan, member limits, and billing history.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Invoices</span>
          </button>
        </div>
      </div>

      {/* Current Active Plan Banner */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative overflow-hidden">
        {/* Botanical Plant artwork */}
        <div className="absolute right-0 bottom-0 top-6 w-36 pointer-events-none opacity-80 hidden md:block">
          <Image
            src="/images/subscription_branch.jpg"
            alt="Botanical branch"
            fill
            className="object-contain object-right-bottom mix-blend-multiply"
          />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Current Plan
            </span>
            <span className="rounded-full bg-[#E6F4EA] px-2.5 py-0.5 text-[10px] font-bold text-[#2E7D32]">
              Active
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            <h2 className="text-3xl font-black text-slate-900">
              {selectedPlan.name} Plan
            </h2>
            <span className="text-xl font-bold text-slate-700">
              {selectedPlan.price}
            </span>
            <span className="text-xs text-slate-400">
              {selectedPlan.period}
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            {selectedPlan.description} Next auto-renewal scheduled for{" "}
            <span className="font-semibold text-slate-700">26 May 2026</span>.
          </p>

          <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {selectedPlan.features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-xs text-slate-700"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E6F4EA] text-[#2E7D32] shrink-0">
                  <Check className="h-3 w-3 stroke-[2.5]" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Available Plans Comparison */}
      <div className="mt-6">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900">
            Available Plans
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose the plan that fits the scale of your projects and team.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {(Object.keys(planDetails) as PlanType[]).map((planKey) => {
            const item = planDetails[planKey];
            const isCurrent = planKey === plan;
            const isPopular = item.badge !== undefined;

            return (
              <div
                key={planKey}
                className={`rounded-2xl p-6 transition flex flex-col justify-between relative ${
                  isPopular
                    ? "bg-[#182E25] text-white shadow-lg ring-1 ring-black/5"
                    : "bg-white text-slate-800 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                }`}
              >
                {item.badge && (
                  <span className="absolute -top-3 right-6 rounded-full bg-amber-400 px-3 py-0.5 text-[10px] font-bold text-slate-900 shadow-xs">
                    {item.badge}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-lg font-bold ${
                        isPopular ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {item.name}
                    </h3>
                    {isCurrent && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          isPopular
                            ? "bg-white/20 text-white"
                            : "bg-[#E6F4EA] text-[#2E7D32]"
                        }`}
                      >
                        Current
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span
                      className={`text-3xl font-black ${
                        isPopular ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {item.price}
                    </span>
                    <span
                      className={`text-xs ${
                        isPopular ? "text-white/70" : "text-slate-400"
                      }`}
                    >
                      {item.period}
                    </span>
                  </div>

                  <p
                    className={`mt-2 text-xs leading-relaxed ${
                      isPopular ? "text-white/80" : "text-slate-500"
                    }`}
                  >
                    {item.description}
                  </p>

                  <div className="my-5 border-t border-slate-100/20" />

                  <div className="space-y-2.5 text-xs">
                    {item.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <Check
                          className={`h-3.5 w-3.5 shrink-0 stroke-[2.5] ${
                            isPopular ? "text-emerald-400" : "text-[#2E7D32]"
                          }`}
                        />
                        <span
                          className={
                            isPopular ? "text-white/90" : "text-slate-700"
                          }
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-2">
                  <button
                    type="button"
                    disabled={isCurrent}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isCurrent
                        ? isPopular
                          ? "bg-white/10 text-white/60 cursor-not-allowed"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : isPopular
                        ? "bg-white text-[#182E25] hover:bg-slate-100 shadow-xs"
                        : "bg-[#182E25] text-white hover:bg-[#12231B] shadow-xs"
                    }`}
                  >
                    {isCurrent ? "Active Plan" : "Upgrade Plan"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </FirmaLayout>
  );
}