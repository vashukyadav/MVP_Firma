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
          <span className="text-eyebrow font-semibold tracking-wider text-ash uppercase">
            BUSINESS INTELLIGENCE
          </span>
          <h1 className="text-display-h1 font-bold text-onyx mt-0.5 tracking-tight flex items-center gap-2">
            Executive Reports &amp; Analytics
          </h1>
          <p className="text-body text-ash mt-1">
            Track operational milestones, cash flow projections, and overall enterprise growth.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Exporting report...")}
          className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4.5 py-2.5 text-sm font-medium shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>Export Summary (PDF)</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-[10px] bg-white p-4.5 border border-pebble shadow-2xs">
          <span className="text-xs font-semibold text-ash">Monthly Revenue</span>
          <p className="text-2xl font-bold text-onyx mt-1">₹18,40,000</p>
          <p className="text-xs font-medium text-success-text mt-1">↗ +14% vs target</p>
        </div>

        <div className="rounded-[10px] bg-white p-4 border border-pebble">
          <span className="text-eyebrow font-medium text-ash">Completion Rate</span>
          <p className="text-2xl font-bold text-complete-status mt-1">88.5%</p>
          <p className="text-eyebrow font-medium text-success-text mt-1">↗ +4% vs last qtr</p>
        </div>

        <div className="rounded-[10px] bg-white p-4 border border-pebble">
          <span className="text-eyebrow font-medium text-ash">Total Contract Value</span>
          <p className="text-2xl font-bold text-onyx mt-1">₹4.45 Cr</p>
          <p className="text-eyebrow font-medium text-ash mt-1">8 active contracts</p>
        </div>

        <div className="rounded-[10px] bg-white p-4 border border-pebble">
          <span className="text-eyebrow font-medium text-ash">Pending Payments</span>
          <p className="text-2xl font-bold text-delayed-status mt-1">₹2,48,000</p>
          <p className="text-eyebrow font-medium text-hazard-text mt-1">Across 3 clients</p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Revenue Growth Summary (8 cols) */}
        <div className="lg:col-span-8 rounded-[10px] bg-white p-6 border border-pebble">
          <div className="flex items-center justify-between pb-4 border-b border-pebble">
            <div>
              <h2 className="text-heading-h3 font-bold text-onyx">
                Revenue &amp; Billing Velocity
              </h2>
              <p className="text-eyebrow text-ash">
                Quarterly billed vs collected amounts
              </p>
            </div>
            <span className="text-eyebrow font-semibold text-success-text bg-clear-bg px-2.5 py-0.5 rounded-full border border-pebble">
              Q3 Healthy
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex items-center justify-between text-body mb-1.5">
                <span className="font-semibold text-onyx">Q3 Invoiced Total</span>
                <span className="font-bold text-onyx">₹85,00,000 (100%)</span>
              </div>
              <div className="h-2.5 w-full bg-stone rounded-full overflow-hidden">
                <div className="h-full bg-onyx rounded-full w-full" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-body mb-1.5">
                <span className="font-semibold text-onyx">Payments Collected</span>
                <span className="font-bold text-complete-status">₹72,52,000 (85.3%)</span>
              </div>
              <div className="h-2.5 w-full bg-stone rounded-full overflow-hidden">
                <div className="h-full bg-complete-status rounded-full w-[85.3%]" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-body mb-1.5">
                <span className="font-semibold text-onyx">Outstanding Receivables</span>
                <span className="font-bold text-delayed-status">₹12,48,000 (14.7%)</span>
              </div>
              <div className="h-2.5 w-full bg-stone rounded-full overflow-hidden">
                <div className="h-full bg-delayed-status rounded-full w-[14.7%]" />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-pebble grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-eyebrow text-ash block">Avg Payment Cycle</span>
              <span className="text-heading-h3 font-bold text-onyx">18 Days</span>
            </div>
            <div>
              <span className="text-eyebrow text-ash block">Overdue Invoices</span>
              <span className="text-heading-h3 font-bold text-complete-status">0 Critical</span>
            </div>
            <div>
              <span className="text-eyebrow text-ash block">Projected Profit Margin</span>
              <span className="text-heading-h3 font-bold text-onyx">24.2%</span>
            </div>
          </div>
        </div>

        {/* Operational Efficiency (4 cols) */}
        <div className="lg:col-span-4 rounded-[10px] bg-white p-6 border border-pebble flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-pebble">
              <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-breath text-onyx">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-heading-h3 font-bold text-onyx">
                  Site Efficiency
                </h2>
                <p className="text-eyebrow text-ash">Team delivery metrics</p>
              </div>
            </div>

            <div className="mt-5 space-y-3.5 text-body">
              <div className="flex items-center justify-between">
                <span className="text-ash">On-Time Delivery Rate</span>
                <span className="font-bold text-onyx">92%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ash">Average Inspection Turnaround</span>
                <span className="font-bold text-onyx">2.4 Days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ash">Field Worker Utilization</span>
                <span className="font-bold text-complete-status">86% Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ash">Client Satisfaction Score</span>
                <span className="font-bold text-onyx">4.9 / 5.0</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-pebble bg-breath p-3.5 rounded-[10px] border border-pebble">
            <span className="text-eyebrow font-semibold text-ash uppercase tracking-wide block">
              Audit Status
            </span>
            <p className="text-body font-medium text-onyx mt-0.5">
              All compliance certifications active till Q1 2027.
            </p>
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}
