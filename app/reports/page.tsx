"use client";

import { useMemo } from "react";
import FirmaLayout from "@/components/layout/FirmaLayout";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { useLeadFlowStore } from "@/store/leadFlowStore";
import { useTenderFlowStore } from "@/store/tenderFlowStore";
import { toast } from "@/components/ui/toast";
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
  HardHat,
  Briefcase,
  FolderKanban,
} from "lucide-react";

export default function ReportsPage() {
  const { projects = [], quotes = [] } = useLeadFlowStore();
  const { contractors = [], jobs = [] } = useTenderFlowStore();

  // Dynamic calculations
  const totalContractValue = useMemo(() => {
    return contractors.reduce((sum, c) => sum + (c.awardedAmount || 0), 0);
  }, [contractors]);

  const completedJobs = useMemo(() => {
    return jobs.filter((j) => j.completed).length;
  }, [jobs]);

  const completionRate = useMemo(() => {
    if (jobs.length === 0) return 0;
    return Math.round((completedJobs / jobs.length) * 100);
  }, [completedJobs, jobs.length]);

  const acceptedQuotesTotal = useMemo(() => {
    return quotes
      .filter((q) => q.status === "ACCEPTED")
      .reduce((sum, q) => sum + (q.value || 0), 0);
  }, [quotes]);

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN")}`;
  };

  return (
    <FirmaLayout activeNav="Reports">
      <PermissionGuard module="reports" action="view">
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
          onClick={() => toast.success("Report exported successfully.")}
          className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4.5 py-2.5 text-sm font-medium shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>Export Summary (PDF)</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-[10px] bg-white p-4.5 border border-pebble shadow-2xs">
          <span className="text-xs font-semibold text-ash">Revenue (Accepted)</span>
          <p className="text-2xl font-bold text-onyx mt-1">
            {formatCurrency(acceptedQuotesTotal)}
          </p>
          <p className="text-xs font-medium text-ash mt-1">
            {quotes.filter((q) => q.status === "ACCEPTED").length} accepted quotes
          </p>
        </div>

        <div className="rounded-[10px] bg-white p-4 border border-pebble">
          <span className="text-eyebrow font-medium text-ash">Job Completion Rate</span>
          <p className="text-2xl font-bold text-complete-status mt-1">
            {completionRate}%
          </p>
          <p className="text-eyebrow font-medium text-ash mt-1">
            {completedJobs} of {jobs.length} jobs done
          </p>
        </div>

        <div className="rounded-[10px] bg-white p-4 border border-pebble">
          <span className="text-eyebrow font-medium text-ash">Total Contract Value</span>
          <p className="text-2xl font-bold text-onyx mt-1">
            {formatCurrency(totalContractValue)}
          </p>
          <p className="text-eyebrow font-medium text-ash mt-1">
            {contractors.length} awarded contracts
          </p>
        </div>

        <div className="rounded-[10px] bg-white p-4 border border-pebble">
          <span className="text-eyebrow font-medium text-ash">Active Sites / Projects</span>
          <p className="text-2xl font-bold text-onyx mt-1">
            {projects.length}
          </p>
          <p className="text-eyebrow font-medium text-ash mt-1">
            {projects.filter((p) => p.status === "IN_PROGRESS").length} in progress
          </p>
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
                Total contracted vs executed amounts
              </p>
            </div>
            <span className="text-eyebrow font-semibold text-onyx bg-clear-bg px-2.5 py-0.5 rounded-full border border-pebble">
              {contractors.length > 0 ? "Active Operations" : "Ready for Contracts"}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex items-center justify-between text-body mb-1.5">
                <span className="font-semibold text-onyx">Awarded Contract Packages</span>
                <span className="font-bold text-onyx">
                  {formatCurrency(totalContractValue)}
                </span>
              </div>
              <div className="h-2.5 w-full bg-stone rounded-full overflow-hidden">
                <div
                  className="h-full bg-forest rounded-full"
                  style={{ width: totalContractValue > 0 ? "100%" : "0%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-body mb-1.5">
                <span className="font-semibold text-onyx">Accepted Quotations</span>
                <span className="font-bold text-complete-status">
                  {formatCurrency(acceptedQuotesTotal)}
                </span>
              </div>
              <div className="h-2.5 w-full bg-stone rounded-full overflow-hidden">
                <div
                  className="h-full bg-complete-status rounded-full"
                  style={{
                    width: acceptedQuotesTotal > 0 ? "100%" : "0%",
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-body mb-1.5">
                <span className="font-semibold text-onyx">Site Jobs Completed Ratio</span>
                <span className="font-bold text-onyx">
                  {completionRate}%
                </span>
              </div>
              <div className="h-2.5 w-full bg-stone rounded-full overflow-hidden">
                <div
                  className="h-full bg-onyx rounded-full"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-pebble grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-eyebrow text-ash block">Active Contractors</span>
              <span className="text-heading-h3 font-bold text-onyx">
                {contractors.length}
              </span>
            </div>
            <div>
              <span className="text-eyebrow text-ash block">Active Work Orders</span>
              <span className="text-heading-h3 font-bold text-complete-status">
                {jobs.length}
              </span>
            </div>
            <div>
              <span className="text-eyebrow text-ash block">Completed Jobs</span>
              <span className="text-heading-h3 font-bold text-onyx">
                {completedJobs}
              </span>
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
                <p className="text-eyebrow text-ash">Operational execution status</p>
              </div>
            </div>

            <div className="mt-5 space-y-3.5 text-body">
              <div className="flex items-center justify-between">
                <span className="text-ash">Active Work Orders</span>
                <span className="font-bold text-onyx">{jobs.length} Total</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ash">Completed Work Orders</span>
                <span className="font-bold text-complete-status">{completedJobs} Done</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ash">Awarded Contractors</span>
                <span className="font-bold text-onyx">{contractors.length} Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ash">Active Projects</span>
                <span className="font-bold text-onyx">{projects.length} Sites</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-pebble bg-breath p-3.5 rounded-[10px] border border-pebble">
            <span className="text-eyebrow font-semibold text-ash uppercase tracking-wide block">
              Operational Status
            </span>
            <p className="text-body font-medium text-onyx mt-0.5">
              {jobs.length > 0
                ? `${jobs.length} site jobs currently scheduled across active sites.`
                : "No active jobs pending dispatch. All systems synchronized."}
            </p>
          </div>
        </div>
      </div>
      </PermissionGuard>
    </FirmaLayout>
  );
}
