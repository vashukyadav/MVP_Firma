"use client";

import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  PieChart,
} from "lucide-react";

export default function ReportsPage() {
  return (
    <FirmaLayout activeNav="Reports">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pb-2">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            BUSINESS INTELLIGENCE
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight flex items-center gap-2">
            Executive Reports &amp; Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track operational milestones, cash flow projections, and overall enterprise growth.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Exporting report...")}
          className="flex items-center gap-2 rounded-xl bg-[#182E25] hover:bg-[#12231B] text-white px-4 py-2 text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Summary (PDF)</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-medium text-slate-400">Monthly Revenue</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">₹18,40,000</p>
          <p className="text-[10px] font-medium text-emerald-600 mt-1">↗ +14% vs target</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-medium text-slate-400">Completion Rate</span>
          <p className="text-2xl font-extrabold text-[#2E7D32] mt-1">88.5%</p>
          <p className="text-[10px] font-medium text-emerald-600 mt-1">↗ +4% vs last qtr</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-medium text-slate-400">Total Contract Value</span>
          <p className="text-2xl font-extrabold text-[#C98A19] mt-1">₹4.45 Cr</p>
          <p className="text-[10px] font-medium text-slate-500 mt-1">8 active contracts</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-medium text-slate-400">Pending Payments</span>
          <p className="text-2xl font-extrabold text-[#D84A38] mt-1">₹2,48,000</p>
          <p className="text-[10px] font-medium text-rose-500 mt-1">Across 3 clients</p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Revenue Growth Summary (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-white p-6 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Revenue &amp; Billing Velocity
              </h2>
              <p className="text-[11px] text-slate-400">
                Quarterly billed vs collected amounts
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-[#E6F4EA] px-2.5 py-0.5 rounded-full">
              Q3 Healthy
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Q3 Invoiced Total</span>
                <span className="font-extrabold text-slate-900">₹85,00,000 (100%)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#182E25] rounded-full w-full" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Payments Collected</span>
                <span className="font-extrabold text-[#2E7D32]">₹72,52,000 (85.3%)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#2E7D32] rounded-full w-[85.3%]" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Outstanding Receivables</span>
                <span className="font-extrabold text-[#D84A38]">₹12,48,000 (14.7%)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#D84A38] rounded-full w-[14.7%]" />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block">Avg Payment Cycle</span>
              <span className="text-sm font-extrabold text-slate-900">18 Days</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Overdue Invoices</span>
              <span className="text-sm font-extrabold text-[#2E7D32]">0 Critical</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Projected Profit Margin</span>
              <span className="text-sm font-extrabold text-slate-900">24.2%</span>
            </div>
          </div>
        </div>

        {/* Operational Efficiency (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-white p-6 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E5EDE7] text-[#182E25]">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Site Efficiency
                </h2>
                <p className="text-[11px] text-slate-400">Team delivery metrics</p>
              </div>
            </div>

            <div className="mt-5 space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">On-Time Delivery Rate</span>
                <span className="font-extrabold text-slate-900">92%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Average Inspection Turnaround</span>
                <span className="font-extrabold text-slate-900">2.4 Days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Field Worker Utilization</span>
                <span className="font-extrabold text-[#2E7D32]">86% Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Client Satisfaction Score</span>
                <span className="font-extrabold text-slate-900">4.9 / 5.0</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
              Audit Status
            </span>
            <p className="text-xs font-semibold text-slate-800 mt-0.5">
              All compliance certifications active till Q1 2027.
            </p>
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}
