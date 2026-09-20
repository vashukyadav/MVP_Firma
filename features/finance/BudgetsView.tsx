"use client";

import { useState, useMemo } from "react";
import {
  useFinanceStore,
  CostCategory,
  JobBudgetRecord,
} from "@/store/financeStore";
import { useTenderFlowStore, JobItem } from "@/store/tenderFlowStore";
import { useLeadFlowStore } from "@/store/leadFlowStore";
import { toast } from "@/components/ui/toast";
import {
  BarChart3,
  Plus,
  Search,
  Building2,
  MapPin,
  IndianRupee,
  DollarSign,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  X,
  TrendingUp,
  Percent,
} from "lucide-react";

interface BudgetsViewProps {
  initialJobFilter?: string;
}

export default function BudgetsView({ initialJobFilter }: BudgetsViewProps) {
  const { jobs = [] } = useTenderFlowStore();
  const { projects = [] } = useLeadFlowStore();
  const { budgets, setJobBudget, getJobFinancialSummary, settings } =
    useFinanceStore();

  const [selectedJobId, setSelectedJobId] = useState<string>(
    initialJobFilter || (jobs[0]?.id || "")
  );
  const [showEditModal, setShowEditModal] = useState(false);

  // Form State for Editing Budget
  const [editContractValue, setEditContractValue] = useState("");
  const [editTotalBudget, setEditTotalBudget] = useState("");
  const [editMaterials, setEditMaterials] = useState("");
  const [editLabour, setEditLabour] = useState("");
  const [editSubcontractor, setEditSubcontractor] = useState("");
  const [editEquipment, setEditEquipment] = useState("");
  const [editOther, setEditOther] = useState("");

  const currencySymbol = settings.currencySymbol || "₹";

  const formatCurrency = (val: number) => {
    return `${currencySymbol}${val.toLocaleString("en-IN")}`;
  };

  const selectedJob = useMemo(() => {
    return jobs.find((j) => j.id === selectedJobId) || jobs[0] || null;
  }, [jobs, selectedJobId]);

  const financialSummary = useMemo(() => {
    if (!selectedJob) return null;
    return getJobFinancialSummary(selectedJob.id, {
      timesheets: selectedJob.timesheets,
      variations: selectedJob.variations,
    });
  }, [selectedJob, getJobFinancialSummary]);

  // Open Edit Modal
  const handleOpenEdit = () => {
    if (!financialSummary) return;
    setEditContractValue(String(financialSummary.contractValue));
    setEditTotalBudget(String(financialSummary.budget));

    const getCatVal = (catName: CostCategory) => {
      const found = financialSummary.categories.find(
        (c) => c.category === catName
      );
      return String(found?.budget || 0);
    };

    setEditMaterials(getCatVal("Materials"));
    setEditLabour(getCatVal("Labour"));
    setEditSubcontractor(getCatVal("Subcontractor"));
    setEditEquipment(getCatVal("Equipment"));
    setEditOther(getCatVal("Other"));
    setShowEditModal(true);
  };

  // Submit Edit Modal
  const handleSaveBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    const mat = parseFloat(editMaterials) || 0;
    const lab = parseFloat(editLabour) || 0;
    const sub = parseFloat(editSubcontractor) || 0;
    const eq = parseFloat(editEquipment) || 0;
    const oth = parseFloat(editOther) || 0;
    const sumCategories = mat + lab + sub + eq + oth;
    const total = parseFloat(editTotalBudget) || sumCategories;

    setJobBudget({
      jobId: selectedJob.id,
      jobTitle: selectedJob.title,
      projectId: selectedJob.projectId || "PRJ-ABC",
      projectName: selectedJob.projectName,
      siteId: selectedJob.siteId || "SITE-BHP",
      siteName: selectedJob.siteName || selectedJob.location,
      contractValue: parseFloat(editContractValue) || 5000000,
      totalBudget: total,
      categories: [
        { category: "Materials", budget: mat },
        { category: "Labour", budget: lab },
        { category: "Subcontractor", budget: sub },
        { category: "Equipment", budget: eq },
        { category: "Other", budget: oth },
      ],
    });

    toast.success("Job budget allocation updated successfully!");
    setShowEditModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-onyx tracking-tight">
            Budgets vs Actual Analysis
          </h2>
          <p className="text-body text-ash mt-0.5">
            Compare estimated project budgets against actual incurred job costs and category variances.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenEdit}
          className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4 py-2.5 text-sm font-medium shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Edit2 className="h-4 w-4" />
          <span>Allocate / Adjust Budget</span>
        </button>
      </div>

      {/* Select Job Selector */}
      <div className="bg-white p-4 rounded-[12px] border border-pebble shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
          <span className="text-ash font-medium shrink-0">Selected Job:</span>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full sm:w-80 bg-stone border border-pebble rounded-[8px] px-3 py-1.5 text-onyx font-semibold outline-none focus:border-onyx"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.id} • {j.title} ({j.projectName})
              </option>
            ))}
          </select>
        </div>

        {selectedJob && (
          <div className="flex items-center gap-3 text-xs text-ash">
            <span className="flex items-center gap-1 font-medium">
              <Building2 className="h-3.5 w-3.5" />
              {selectedJob.projectName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium">
              <MapPin className="h-3.5 w-3.5" />
              {selectedJob.siteName || selectedJob.location}
            </span>
          </div>
        )}
      </div>

      {/* Overview Metric Cards */}
      {financialSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-[12px] bg-white p-4 border border-pebble shadow-2xs">
            <span className="text-xs font-semibold text-ash">Contract Value</span>
            <p className="text-2xl font-bold text-onyx mt-1">
              {formatCurrency(financialSummary.contractValue)}
            </p>
            <span className="text-[11px] text-ash mt-1 block">
              Agreed client contract
            </span>
          </div>

          <div className="rounded-[12px] bg-white p-4 border border-pebble shadow-2xs">
            <span className="text-xs font-semibold text-ash">Total Budget</span>
            <p className="text-2xl font-bold text-onyx mt-1">
              {formatCurrency(financialSummary.budget)}
            </p>
            <span className="text-[11px] text-ash mt-1 block">
              Allocated across 5 categories
            </span>
          </div>

          <div className="rounded-[12px] bg-white p-4 border border-pebble shadow-2xs">
            <span className="text-xs font-semibold text-ash">Actual Incurred</span>
            <p className="text-2xl font-bold text-onyx mt-1">
              {formatCurrency(financialSummary.actualCost)}
            </p>
            <span className="text-[11px] text-ash mt-1 block">
              {financialSummary.budget > 0
                ? `${Math.round(
                    (financialSummary.actualCost / financialSummary.budget) * 100
                  )}% of budget utilized`
                : "No budget recorded"}
            </span>
          </div>

          <div className="rounded-[12px] bg-white p-4 border border-pebble shadow-2xs">
            <span className="text-xs font-semibold text-ash">Remaining Variance</span>
            <p
              className={`text-2xl font-bold mt-1 ${
                financialSummary.variance >= 0
                  ? "text-success-text"
                  : "text-hazard-text"
              }`}
            >
              {financialSummary.variance >= 0
                ? formatCurrency(financialSummary.variance)
                : `-${formatCurrency(Math.abs(financialSummary.variance))}`}
            </p>
            <span
              className={`text-[11px] font-semibold mt-1 block ${
                financialSummary.variance >= 0
                  ? "text-success-text"
                  : "text-hazard-text"
              }`}
            >
              {financialSummary.variance >= 0
                ? "Under budget (Surplus)"
                : "Over budget (Deficit)"}
            </span>
          </div>
        </div>
      )}

      {/* Category Breakdown Table */}
      {financialSummary && (
        <div className="rounded-[12px] bg-white border border-pebble overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-pebble bg-stone flex items-center justify-between">
            <span className="text-xs font-bold text-onyx uppercase tracking-wider">
              Category-Wise Budget vs Actual Breakdown
            </span>
            <span className="text-xs text-ash">
              Live updates from supplier bills, timesheets, and variations
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-pebble bg-mist/50 text-eyebrow font-semibold text-ash uppercase tracking-wider">
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 text-right">Allocated Budget</th>
                  <th className="p-3.5 text-right">Actual Cost</th>
                  <th className="p-3.5 text-right">Remaining</th>
                  <th className="p-3.5 text-right">Variance</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5">Utilization</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-pebble text-xs text-onyx">
                {financialSummary.categories.map((cat) => {
                  const percent =
                    cat.budget > 0
                      ? Math.min(100, Math.round((cat.actual / cat.budget) * 100))
                      : 0;
                  const isOver = cat.actual > cat.budget;

                  return (
                    <tr key={cat.category} className="hover:bg-stone/40 transition">
                      <td className="p-3.5 font-bold text-onyx">
                        {cat.category}
                      </td>
                      <td className="p-3.5 text-right font-semibold text-onyx">
                        {formatCurrency(cat.budget)}
                      </td>
                      <td className="p-3.5 text-right font-black text-onyx">
                        {formatCurrency(cat.actual)}
                      </td>
                      <td className="p-3.5 text-right font-semibold text-success-text">
                        {formatCurrency(cat.remaining)}
                      </td>
                      <td
                        className={`p-3.5 text-right font-bold ${
                          cat.variance >= 0
                            ? "text-success-text"
                            : "text-hazard-text"
                        }`}
                      >
                        {cat.variance >= 0
                          ? `+${formatCurrency(cat.variance)}`
                          : `-${formatCurrency(Math.abs(cat.variance))}`}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-eyebrow font-semibold border ${
                            isOver
                              ? "bg-hazard-bg text-hazard-text border-hazard/30"
                              : "bg-clear-bg text-success-text border-pebble"
                          }`}
                        >
                          {isOver ? "Over Budget" : "On Track"}
                        </span>
                      </td>
                      <td className="p-3.5 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-stone rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isOver ? "bg-hazard" : "bg-forest"
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-ash w-8 text-right">
                            {percent}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ALLOCATE / ADJUST BUDGET MODAL                                            */}
      {/* ========================================================================= */}
      {showEditModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-[18px] bg-white p-6 shadow-2xl border border-pebble animate-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="absolute right-4 top-4 rounded-[8px] p-1.5 text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-eyebrow font-semibold tracking-wider text-forest uppercase">
                BUDGET ALLOCATION
              </span>
              <h3 className="text-lg font-bold text-onyx mt-0.5">
                Allocate Budget for {selectedJob.id}
              </h3>
              <p className="text-xs text-ash mt-0.5">
                {selectedJob.title} • {selectedJob.projectName}
              </p>
            </div>

            <form onSubmit={handleSaveBudgetSubmit} className="mt-4 space-y-3.5">
              {/* Contract Value & Total Budget */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Contract Value ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={editContractValue}
                    onChange={(e) => setEditContractValue(e.target.value)}
                    placeholder="e.g. 5000000"
                    className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Total Job Budget ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={editTotalBudget}
                    onChange={(e) => setEditTotalBudget(e.target.value)}
                    placeholder="e.g. 3800000"
                    className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                  />
                </div>
              </div>

              {/* Category Allocations */}
              <div className="space-y-2 pt-2 border-t border-pebble">
                <span className="text-xs font-bold text-onyx uppercase tracking-wider block">
                  Category Limits ({currencySymbol})
                </span>

                <div>
                  <label className="text-xs text-ash block mb-0.5">
                    1. Materials
                  </label>
                  <input
                    type="number"
                    value={editMaterials}
                    onChange={(e) => setEditMaterials(e.target.value)}
                    placeholder="e.g. 1200000"
                    className="w-full h-8.5 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                  />
                </div>

                <div>
                  <label className="text-xs text-ash block mb-0.5">
                    2. Labour
                  </label>
                  <input
                    type="number"
                    value={editLabour}
                    onChange={(e) => setEditLabour(e.target.value)}
                    placeholder="e.g. 1000000"
                    className="w-full h-8.5 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                  />
                </div>

                <div>
                  <label className="text-xs text-ash block mb-0.5">
                    3. Subcontractor
                  </label>
                  <input
                    type="number"
                    value={editSubcontractor}
                    onChange={(e) => setEditSubcontractor(e.target.value)}
                    placeholder="e.g. 1000000"
                    className="w-full h-8.5 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                  />
                </div>

                <div>
                  <label className="text-xs text-ash block mb-0.5">
                    4. Equipment
                  </label>
                  <input
                    type="number"
                    value={editEquipment}
                    onChange={(e) => setEditEquipment(e.target.value)}
                    placeholder="e.g. 400000"
                    className="w-full h-8.5 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                  />
                </div>

                <div>
                  <label className="text-xs text-ash block mb-0.5">
                    5. Other / Contingency
                  </label>
                  <input
                    type="number"
                    value={editOther}
                    onChange={(e) => setEditOther(e.target.value)}
                    placeholder="e.g. 200000"
                    className="w-full h-8.5 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pebble mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-[8px] border border-pebble text-xs font-medium text-onyx hover:bg-stone transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[8px] bg-forest text-white text-xs font-semibold hover:bg-forest-hover shadow-xs transition cursor-pointer"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
