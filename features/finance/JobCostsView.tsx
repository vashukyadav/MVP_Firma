"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useFinanceStore,
  JobFinancialSummary,
  CostCategory,
} from "@/store/financeStore";
import { useLeadFlowStore } from "@/store/leadFlowStore";
import { useSiteStore } from "@/store/siteStore";
import { useTenderFlowStore, JobItem } from "@/store/tenderFlowStore";
import {
  Briefcase,
  Search,
  Building2,
  MapPin,
  IndianRupee,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  FileCheck2,
  Calendar,
  ExternalLink,
} from "lucide-react";

interface JobCostsViewProps {
  initialJobFilter?: string;
  onSelectJobForDetail?: (jobId: string) => void;
}

export default function JobCostsView({
  initialJobFilter,
  onSelectJobForDetail,
}: JobCostsViewProps) {
  const router = useRouter();
  const { jobs = [] } = useTenderFlowStore();
  const { projects = [] } = useLeadFlowStore();
  const { sites = [] } = useSiteStore();
  const { getJobFinancialSummary, settings } = useFinanceStore();

  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [selectedJobId, setSelectedJobId] = useState<string>(
    initialJobFilter || (jobs[0]?.id || "")
  );

  const currencySymbol = settings.currencySymbol || "₹";

  const formatCurrency = (val: number) => {
    return `${currencySymbol}${val.toLocaleString("en-IN")}`;
  };

  // Compute live financials for all jobs
  const allJobSummaries: (JobFinancialSummary & {
    job: JobItem;
    status: string;
    assignee: string;
  })[] = useMemo(() => {
    return jobs.map((j) => {
      const summary = getJobFinancialSummary(j.id, {
        timesheets: j.timesheets,
        variations: j.variations,
      });
      return {
        ...summary,
        job: j,
        status: j.status,
        assignee: j.assignee,
      };
    });
  }, [jobs, getJobFinancialSummary]);

  // Filtered jobs list
  const filteredJobs = useMemo(() => {
    return allJobSummaries.filter((js) => {
      const matchSearch =
        js.jobId.toLowerCase().includes(search.toLowerCase()) ||
        js.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
        js.projectName.toLowerCase().includes(search.toLowerCase()) ||
        js.siteName.toLowerCase().includes(search.toLowerCase()) ||
        js.assignee.toLowerCase().includes(search.toLowerCase());

      const matchProj =
        projectFilter === "ALL" ||
        js.projectName === projectFilter ||
        js.job.projectId === projectFilter;

      return matchSearch && matchProj;
    });
  }, [allJobSummaries, search, projectFilter]);

  // Currently inspected job in drilldown view
  const activeSummary = useMemo(() => {
    const found = allJobSummaries.find((js) => js.jobId === selectedJobId);
    return found || allJobSummaries[0] || null;
  }, [allJobSummaries, selectedJobId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-onyx tracking-tight">
            Job Costing &amp; Profitability
          </h2>
          <p className="text-body text-ash mt-0.5">
            Real-time financial cost of specific jobs derived directly from bills, timesheets, and variations without double-counting.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (activeSummary) {
              router.push(`/jobs?jobId=${activeSummary.jobId}&tab=FINANCE`);
            }
          }}
          className="flex items-center gap-2 rounded-[10px] border border-pebble bg-white hover:bg-mist text-onyx px-3.5 py-2 text-xs font-semibold shadow-2xs transition cursor-pointer self-start sm:self-auto"
        >
          <ExternalLink className="h-3.5 w-3.5 text-ash" />
          <span>Open Full Job Financial View</span>
        </button>
      </div>

      {/* Top Filter Bar */}
      <div className="bg-white p-3.5 rounded-[12px] border border-pebble shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="h-3.5 w-3.5 text-ash absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search job ID, title, project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs text-onyx placeholder:text-ash bg-stone rounded-[8px] border border-pebble outline-none focus:border-onyx transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
          <span className="text-ash font-medium shrink-0">Filter by Project:</span>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-stone border border-pebble rounded-[6px] px-2.5 py-1 text-onyx outline-none focus:border-onyx"
          >
            <option value="ALL">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Split Grid: Left Jobs List, Right Active Job Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Job Costing Table (7 cols) */}
        <div className="lg:col-span-7 rounded-[12px] bg-white border border-pebble shadow-2xs overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-pebble bg-stone flex items-center justify-between">
            <span className="text-xs font-bold text-onyx uppercase tracking-wider">
              All Jobs Cost Overview ({filteredJobs.length})
            </span>
            <span className="text-[11px] text-ash">
              Click a job to view detailed cost flow
            </span>
          </div>

          <div className="overflow-x-auto flex-1 divide-y divide-pebble">
            {filteredJobs.length === 0 ? (
              <div className="p-8 text-center text-xs text-ash">
                No jobs match the current filters.
              </div>
            ) : (
              filteredJobs.map((js) => {
                const isSelected = js.jobId === activeSummary?.jobId;
                const percentSpent =
                  js.budget > 0
                    ? Math.min(100, Math.round((js.actualCost / js.budget) * 100))
                    : 0;
                const isOverBudget = js.actualCost > js.budget;

                return (
                  <div
                    key={js.jobId}
                    onClick={() => setSelectedJobId(js.jobId)}
                    className={`p-3.5 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-breath/70 border-l-4 border-l-onyx"
                        : "hover:bg-stone/50 border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-onyx text-xs">
                          {js.jobId}
                        </span>
                        <span className="text-[11px] font-medium text-ash truncate">
                          • {js.jobTitle}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-ash mt-1">
                        <span className="truncate max-w-[140px]">
                          {js.projectName}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[120px]">
                          {js.siteName}
                        </span>
                        <span>•</span>
                        <span>Assignee: {js.assignee}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-2 flex items-center gap-2 max-w-xs">
                        <div className="flex-1 h-1.5 bg-stone rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isOverBudget ? "bg-hazard" : "bg-forest"
                            }`}
                            style={{ width: `${percentSpent}%` }}
                          />
                        </div>
                        <span
                          className={`text-[10px] font-semibold ${
                            isOverBudget ? "text-hazard-text" : "text-ash"
                          }`}
                        >
                          {percentSpent}%
                        </span>
                      </div>
                    </div>

                    {/* Financial Numbers */}
                    <div className="text-right sm:shrink-0 text-xs">
                      <div className="font-black text-onyx">
                        {formatCurrency(js.actualCost)}
                      </div>
                      <div className="text-[11px] text-ash mt-0.5">
                        Budget: {formatCurrency(js.budget)}
                      </div>
                      <div
                        className={`text-[11px] font-semibold mt-0.5 ${
                          js.remainingBudget >= 0
                            ? "text-success-text"
                            : "text-hazard-text"
                        }`}
                      >
                        {js.remainingBudget >= 0
                          ? `Rem: ${formatCurrency(js.remainingBudget)}`
                          : `Over: ${formatCurrency(Math.abs(js.remainingBudget))}`}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Job Drilldown Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {activeSummary ? (
            <div className="rounded-[12px] bg-white border border-pebble p-5 shadow-2xs space-y-5">
              {/* Job Header */}
              <div className="border-b border-pebble pb-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-eyebrow font-semibold text-forest uppercase tracking-wider">
                    JOB COST BREAKDOWN
                  </span>
                  <span className="text-xs font-bold text-onyx bg-stone px-2 py-0.5 rounded-[6px] border border-pebble">
                    {activeSummary.jobId}
                  </span>
                </div>
                <h3 className="text-base font-bold text-onyx mt-1">
                  {activeSummary.jobTitle}
                </h3>
                <div className="flex items-center gap-2 text-xs text-ash mt-1">
                  <Building2 className="h-3.5 w-3.5 text-ash" />
                  <span>{activeSummary.projectName}</span>
                  <span>•</span>
                  <MapPin className="h-3.5 w-3.5 text-ash" />
                  <span>{activeSummary.siteName}</span>
                </div>
              </div>

              {/* 3 Overview Metric Pills */}
              <div className="grid grid-cols-3 gap-2 text-center p-3 bg-mist/60 rounded-[10px] border border-pebble">
                <div>
                  <span className="text-[10px] text-ash font-medium uppercase block">
                    Budget
                  </span>
                  <span className="text-sm font-black text-onyx mt-0.5 block">
                    {formatCurrency(activeSummary.budget)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-ash font-medium uppercase block">
                    Actual Cost
                  </span>
                  <span className="text-sm font-black text-onyx mt-0.5 block">
                    {formatCurrency(activeSummary.actualCost)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-ash font-medium uppercase block">
                    Remaining
                  </span>
                  <span
                    className={`text-sm font-black mt-0.5 block ${
                      activeSummary.remainingBudget >= 0
                        ? "text-success-text"
                        : "text-hazard-text"
                    }`}
                  >
                    {formatCurrency(activeSummary.remainingBudget)}
                  </span>
                </div>
              </div>

              {/* Cost Categories Live Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-onyx uppercase tracking-wider">
                  Cost Categories
                </h4>

                {activeSummary.categories.map((cat) => {
                  const percent =
                    cat.budget > 0
                      ? Math.min(100, Math.round((cat.actual / cat.budget) * 100))
                      : 0;
                  const isOver = cat.actual > cat.budget;

                  return (
                    <div
                      key={cat.category}
                      className="p-3 bg-stone rounded-[10px] border border-pebble space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-onyx">
                          {cat.category}
                        </span>
                        <div className="text-right">
                          <span className="font-black text-onyx">
                            {formatCurrency(cat.actual)}
                          </span>
                          <span className="text-ash text-[11px] ml-1">
                            / {formatCurrency(cat.budget)}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="h-1.5 bg-pebble rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isOver ? "bg-hazard" : "bg-forest"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-ash">
                        <span>
                          {cat.sourceCount > 0
                            ? `${cat.sourceCount} source entries`
                            : "No logged bills yet"}
                        </span>
                        <span
                          className={`font-semibold ${
                            isOver ? "text-hazard-text" : "text-success-text"
                          }`}
                        >
                          {isOver
                            ? `Over by ${formatCurrency(Math.abs(cat.variance))}`
                            : `Remaining: ${formatCurrency(cat.remaining)}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Source Records Audit Count */}
              <div className="p-3 bg-white rounded-[10px] border border-pebble text-xs space-y-1.5">
                <span className="font-bold text-onyx block text-[11px] uppercase tracking-wider">
                  Linked Financial Records
                </span>
                <div className="flex justify-between text-ash">
                  <span>Purchase Orders:</span>
                  <span className="font-semibold text-onyx">
                    {activeSummary.purchaseOrders.length}
                  </span>
                </div>
                <div className="flex justify-between text-ash">
                  <span>Supplier Bills:</span>
                  <span className="font-semibold text-onyx">
                    {activeSummary.bills.length}
                  </span>
                </div>
                <div className="flex justify-between text-ash">
                  <span>Customer Invoices:</span>
                  <span className="font-semibold text-onyx">
                    {activeSummary.invoices.length}
                  </span>
                </div>
                <div className="flex justify-between text-ash">
                  <span>Payments Recorded:</span>
                  <span className="font-semibold text-onyx">
                    {activeSummary.payments.length}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-ash bg-white rounded-[12px] border border-pebble">
              Select a job to view cost breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
