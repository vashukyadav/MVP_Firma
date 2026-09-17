"use client";

import { useState, useMemo } from "react";
import FirmaLayout from "@/components/layout/FirmaLayout";
import { useTenderFlowStore } from "@/store/tenderFlowStore";
import { useAuthStore } from "@/store/authStore";
import { isFieldWorker, isJobAssignedToUser } from "@/lib/roleAccess";
import {
  ArrowLeftRight,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  X,
  IndianRupee,
  Briefcase,
  FileCheck2,
} from "lucide-react";

interface VariationItem {
  id: string;
  job: string;
  description: string;
  value: string;
  raisedBy: string;
  status: "Pending" | "Approved" | "Rejected";
  date?: string;
  details?: string;
}

const initialVariations: VariationItem[] = [];

export default function VariationsPage() {
  const { jobs = [] } = useTenderFlowStore();
  const currentUser = useAuthStore((state) => state.currentUser);
  const isWorker = isFieldWorker(currentUser);

  const userJobs = useMemo(() => {
    if (!isWorker) return jobs;
    return jobs.filter((j) => isJobAssignedToUser(j, [], [], currentUser));
  }, [jobs, isWorker, currentUser]);

  const [variations, setVariations] = useState<VariationItem[]>(initialVariations);
  const [activeFilter, setActiveFilter] = useState("My Variations");
  const [search, setSearch] = useState("");
  const [selectedVar, setSelectedVar] = useState<VariationItem | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // Form state
  const [newJob, setNewJob] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newValue, setNewValue] = useState("");

  const filteredVariations = variations.filter((v) => {
    const matchesSearch =
      v.id.toLowerCase().includes(search.toLowerCase()) ||
      v.job.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase()) ||
      v.raisedBy.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === "Pending") return v.status === "Pending";
    if (activeFilter === "Approved") return v.status === "Approved";
    if (activeFilter === "Rejected") return v.status === "Rejected";
    return true;
  });

  const handleCreateVariation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || !newValue) return;

    const newId = `V-${Math.floor(100 + Math.random() * 900)}`;
    const newItem: VariationItem = {
      id: newId,
      job: newJob || (jobs[0]?.id || "General"),
      description: newDesc,
      value: `₹ ${newValue}`,
      raisedBy: currentUser?.name || "Site Team",
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: "Pending",
      details: "Site scope variation logged for PM and client sign-off.",
    };

    setVariations([newItem, ...variations]);
    setShowNewModal(false);
    setNewDesc("");
    setNewValue("");
  };

  return (
    <FirmaLayout activeNav="Variations">
      <div className="space-y-6 mt-2">
        {/* Page Header matching screen 9 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-stone border border-pebble px-3 py-1 text-[10px] font-bold tracking-wider text-ash uppercase mb-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Scope &amp; Cost Impacts</span>
            </div>
            <h1 className="text-display-h1 font-bold text-onyx tracking-tight flex items-center gap-2.5">
              <ArrowLeftRight className="h-6 w-6 text-forest" />
              <span>Variations</span>
            </h1>
            <p className="text-xs sm:text-sm text-ash mt-0.5">
              Record on-site scope modifications, extra works, and cost approvals.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setNewJob(jobs[0]?.id || "");
              setShowNewModal(true);
            }}
            className="px-4 py-2 rounded-[10px] bg-forest text-white text-xs font-bold hover:bg-forest-hover transition shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" /> New Variation
          </button>
        </div>

        {/* Filter Pills & Search matching Screen 7 */}
        <div className="rounded-[16px] bg-white border border-pebble/80 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { label: `My Variations (${variations.length})`, key: "My Variations" },
                {
                  label: `Pending (${variations.filter((v) => v.status === "Pending").length})`,
                  key: "Pending",
                },
                {
                  label: `Approved (${variations.filter((v) => v.status === "Approved").length})`,
                  key: "Approved",
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-3.5 py-1.5 rounded-[8px] text-xs font-bold transition cursor-pointer shrink-0 ${
                    activeFilter === tab.key
                      ? "bg-forest text-white shadow-2xs"
                      : "bg-stone text-ash hover:text-onyx hover:bg-mist/70"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-[8px] bg-stone px-3 py-1.5 border border-pebble text-xs w-full sm:w-64">
              <Search className="h-3.5 w-3.5 text-ash shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search variations..."
                className="bg-transparent w-full outline-none text-xs text-onyx placeholder-ash"
              />
            </div>
          </div>

          {/* Table matching Screen 7 (# | Description | Job | Status | Actions) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-pebble/80 text-ash text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Job</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pebble/40">
                {filteredVariations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-ash text-sm">
                      <ArrowLeftRight className="h-9 w-9 text-ash/50 mx-auto mb-2 stroke-[1.5]" />
                      <p className="font-bold text-onyx">No variations recorded yet</p>
                      <p className="text-xs text-ash mt-1">
                        Click &quot;+ Raise Variation&quot; above to submit an on-site change order or scope adjustment.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredVariations.map((v) => (
                    <tr key={v.id} className="hover:bg-stone/50 transition">
                      <td className="py-3 px-3 font-bold font-mono text-ash">{v.id}</td>
                      <td className="py-3 px-3 font-bold text-onyx">{v.description}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-[6px] bg-stone font-bold text-onyx border border-pebble text-[11px]">
                          {v.job}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold ${
                            v.status === "Pending"
                              ? "bg-amber-100 text-amber-800"
                              : v.status === "Approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedVar(v)}
                          className="px-3 py-1 rounded-[6px] bg-stone hover:bg-forest hover:text-white border border-pebble text-onyx font-bold transition text-xs cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Variation Detail Modal */}
      {selectedVar && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-[16px] max-w-lg w-full p-6 shadow-2xl border border-pebble relative space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-[4px] bg-stone border border-pebble text-xs font-mono font-bold text-onyx">
                  {selectedVar.id}
                </span>
                <h3 className="text-lg font-bold text-onyx mt-1.5">{selectedVar.description}</h3>
                <p className="text-xs text-ash">Linked Job: {selectedVar.job} • Raised by {selectedVar.raisedBy}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVar(null)}
                className="h-7 w-7 rounded-full bg-stone hover:bg-pebble/50 flex items-center justify-center text-onyx cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-[10px] bg-stone/70 border border-pebble/60 text-xs">
              <div>
                <span className="text-ash text-[10px] uppercase font-bold block">Estimated Amount</span>
                <span className="text-base font-black text-onyx">{selectedVar.value}</span>
              </div>
              <div>
                <span className="text-ash text-[10px] uppercase font-bold block">Status</span>
                <span
                  className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold inline-block mt-0.5 ${selectedVar.status === "Pending"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                    }`}
                >
                  {selectedVar.status}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-[8px] bg-white border border-pebble text-xs text-onyx">
              <p className="font-semibold text-ash text-[10px] uppercase mb-1">Scope Explanation</p>
              <p>{selectedVar.details}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedVar(null)}
                className="px-3 py-1.5 rounded-[8px] border border-pebble text-onyx text-xs font-bold hover:bg-stone cursor-pointer"
              >
                Close
              </button>
              {selectedVar.status === "Pending" && (
                <button
                  type="button"
                  onClick={() => {
                    alert("Approval request sent to Project Manager for cost authorization.");
                    setSelectedVar(null);
                  }}
                  className="px-4 py-1.5 rounded-[8px] bg-forest text-white text-xs font-bold hover:bg-forest-hover shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <FileCheck2 className="h-3.5 w-3.5" /> Request PM Approval
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Variation Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <form
            onSubmit={handleCreateVariation}
            className="bg-white rounded-[16px] max-w-md w-full p-6 shadow-2xl border border-pebble relative space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-onyx flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-forest" /> Create New Variation
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="h-7 w-7 rounded-full bg-stone hover:bg-pebble/50 flex items-center justify-center text-onyx cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-onyx block">Linked Job</label>
              <select
                value={newJob}
                onChange={(e) => setNewJob(e.target.value)}
                className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx"
              >
                <option value="">-- Select Linked Job --</option>
                {userJobs.length > 0 ? (
                  userJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.id} - {j.title} ({j.projectName})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No assigned jobs found</option>
                )}
              </select>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-onyx block">Variation Description *</label>
              <input
                type="text"
                required
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="e.g. Extra power distribution board"
                className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx outline-none focus:border-forest"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-onyx block">Estimated Value (₹) *</label>
              <input
                type="text"
                required
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="e.g. 35,000"
                className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx outline-none focus:border-forest"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-3 py-1.5 rounded-[8px] border border-pebble text-onyx text-xs font-bold hover:bg-stone cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-[8px] bg-forest text-white text-xs font-bold hover:bg-forest-hover shadow-xs cursor-pointer"
              >
                Submit Variation
              </button>
            </div>
          </form>
        </div>
      )}
    </FirmaLayout>
  );
}
