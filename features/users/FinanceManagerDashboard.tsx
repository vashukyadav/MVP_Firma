"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useLeadFlowStore } from "@/store/leadFlowStore";
import { useTenderFlowStore } from "@/store/tenderFlowStore";
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  FileCheck2,
  Clock,
  ArrowRight,
  Plus,
  Sparkles,
  AlertCircle,
  FileText,
  CheckCircle2,
} from "lucide-react";

interface FinanceDashboardProps {
  companyName: string;
}

export default function FinanceManagerDashboard({ companyName }: FinanceDashboardProps) {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { quotes = [] } = useLeadFlowStore();
  const { contractors = [] } = useTenderFlowStore();

  const firstName = currentUser?.name?.split(" ")[0] || "Finance Manager";

  const totalAcceptedQuoteValue = useMemo(() => {
    return quotes
      .filter((q) => q.status === "ACCEPTED")
      .reduce((sum, q) => sum + (q.value || 0), 0);
  }, [quotes]);

  const totalContractorCommitted = useMemo(() => {
    return contractors.reduce((sum, c) => sum + (c.awardedAmount || 0), 0);
  }, [contractors]);

  return (
    <div className="space-y-6 mt-4">
      {/* ========================================================================= */}
      {/* 1. WELCOME BANNER (Role-Tailored, Clean Firma Card Styling)               */}
      {/* ========================================================================= */}
      <div className="rounded-[16px] bg-white border border-pebble/80 p-6 sm:p-7 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-stone border border-pebble px-3 py-1 text-[10px] font-bold tracking-wider text-ash uppercase mb-2.5">
              <Sparkles className="h-3 w-3 text-forest" />
              <span className="text-onyx font-semibold">Financial &amp; Billing Accounts Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-onyx tracking-tight leading-tight">
              Welcome back, {firstName}! <span className="inline-block">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-ash mt-1.5 leading-relaxed">
              Monitor running account (RA) billings, client receivables, retention deposit releases, and subcontractor payouts for {companyName || "your enterprise"}.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="rounded-[12px] bg-stone/70 border border-pebble px-4 py-2.5 text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-ash block">
                Total Invoiced
              </span>
              <span className="text-lg font-bold text-onyx leading-tight">
                ₹{totalAcceptedQuoteValue > 0 ? (totalAcceptedQuoteValue / 100000).toFixed(1) + "L" : "24.8L"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/finance")}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-[10px] bg-onyx text-white px-4 py-2.5 text-xs font-semibold hover:bg-black transition shadow-2xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New RA Bill</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/finance")}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-[10px] border border-pebble bg-white text-onyx px-4 py-2.5 text-xs font-semibold hover:bg-stone transition cursor-pointer"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Collections</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SIX FINANCIAL KPI METRICS CARDS                                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div
          onClick={() => router.push("/finance")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-clear-bg text-success-text">
              <CreditCard className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-ash">Total Billed</span>
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold text-onyx leading-tight">
              ₹{totalAcceptedQuoteValue > 0 ? (totalAcceptedQuoteValue / 100000).toFixed(1) + "L" : "₹24.8L"}
            </p>
            <p className="text-[10px] font-medium text-success-text mt-1">Certified RA bills</p>
          </div>
        </div>

        <div
          onClick={() => router.push("/finance")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-sunfleck text-onyx">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-ash">Collected</span>
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold text-onyx leading-tight">₹18.5L</p>
            <p className="text-[10px] font-medium text-complete-status mt-1">74% Realized</p>
          </div>
        </div>

        <div
          onClick={() => router.push("/finance")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-caution-bg text-caution-text">
              <Clock className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-ash">Pending Dues</span>
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold text-caution-text leading-tight">₹6.3L</p>
            <p className="text-[10px] font-medium text-ash mt-1">Awaiting client release</p>
          </div>
        </div>

        <div
          onClick={() => router.push("/finance")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-breath text-onyx">
              <FileCheck2 className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-ash">Retention Fund</span>
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold text-onyx leading-tight">₹2.4L</p>
            <p className="text-[10px] font-medium text-ash mt-1">5% DLP deduction</p>
          </div>
        </div>

        <div
          onClick={() => router.push("/contractors")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-mist text-onyx font-bold text-xs">
              ₹
            </div>
            <span className="text-[11px] font-medium text-ash">Contractor Dues</span>
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold text-onyx leading-tight">
              ₹{totalContractorCommitted > 0 ? (totalContractorCommitted / 100000).toFixed(1) + "L" : "₹0"}
            </p>
            <p className="text-[10px] font-medium text-ash mt-1">Committed trade spend</p>
          </div>
        </div>

        <div
          onClick={() => router.push("/finance")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-clear-bg text-success-text">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-ash">Gross Margin</span>
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold text-complete-status leading-tight">+18.4%</p>
            <p className="text-[10px] font-medium text-ash mt-1">Target protected</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MIDDLE ROW: RECENT RA INVOICES TABLE & CASHFLOW REALIZATION            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recent RA Invoices */}
        <div className="lg:col-span-8 rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-onyx">Running Account (RA) Invoices</h2>
              <p className="text-[11px] text-ash mt-0.5">
                Milestone verification and billing status across active project sites
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/finance")}
              className="text-xs font-semibold text-forest hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All RA Bills</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="divide-y divide-pebble/40 text-xs">
            <div className="py-3 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-onyx">RA-2025-014</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-clear-bg text-success-text">
                    Paid
                  </span>
                </div>
                <p className="text-[11px] text-ash mt-0.5">
                  Skyline Elegance • Milestone: Foundation &amp; Plinth Beam Completion
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-onyx">₹8,45,000</p>
                <p className="text-[10px] text-ash">Settled Sep 12</p>
              </div>
            </div>

            <div className="py-3 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-onyx">RA-2025-015</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-caution-bg text-caution-text">
                    Pending Verification
                  </span>
                </div>
                <p className="text-[11px] text-ash mt-0.5">
                  Prestige Tech Park • Milestone: 4th Floor Slab RCC Pouring
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-onyx">₹6,30,000</p>
                <p className="text-[10px] text-ash">Due in 5 days</p>
              </div>
            </div>

            <div className="py-3 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-onyx">RA-2025-016</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-mist text-onyx">
                    Draft
                  </span>
                </div>
                <p className="text-[11px] text-ash mt-0.5">
                  Palm Grove Enclave • Milestone: Exterior Plaster &amp; Plumbing
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-onyx">₹4,80,000</p>
                <p className="text-[10px] text-ash">Site DPR Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cashflow Realization Breakdown */}
        <div className="lg:col-span-4 rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-onyx">Payment Stage Tracker</h2>
            <p className="text-[11px] text-ash mt-0.5">Receivable settlement stages</p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-ash">Billed &amp; Realized</span>
                  <span className="font-bold text-success-text">74%</span>
                </div>
                <div className="h-2 w-full bg-stone rounded-full overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: "74%" }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-ash">Certified But Pending</span>
                  <span className="font-bold text-caution-text">16%</span>
                </div>
                <div className="h-2 w-full bg-stone rounded-full overflow-hidden">
                  <div className="h-full bg-caution rounded-full" style={{ width: "16%" }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-ash">Retention Held (DLP)</span>
                  <span className="font-bold text-onyx">10%</span>
                </div>
                <div className="h-2 w-full bg-stone rounded-full overflow-hidden">
                  <div className="h-full bg-onyx rounded-full" style={{ width: "10%" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-pebble/60">
            <button
              type="button"
              onClick={() => router.push("/finance")}
              className="w-full text-center py-2 rounded-[8px] bg-onyx text-white text-xs font-bold hover:bg-black transition cursor-pointer"
            >
              Export Billing Statement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
