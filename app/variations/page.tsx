"use client";

import { useState, useMemo } from "react";
import FirmaLayout from "@/components/layout/FirmaLayout";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/lib/permissions";
import { useTenderFlowStore, JobVariation } from "@/store/tenderFlowStore";
import { useAuthStore } from "@/store/authStore";
import { isFieldWorker, isJobAssignedToUser, isVariationVisibleToUser, canApproveVariation } from "@/lib/roleAccess";
import {
  ArrowLeftRight,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  FileCheck2,
  Building2,
  MapPin,
  Briefcase,
  User,
  IndianRupee,
  Layers,
  Paperclip,
  Check,
} from "lucide-react";

export default function VariationsPage() {
  const { variations, jobs = [], addVariation, updateVariationStatus } = useTenderFlowStore();
  const currentUser = useAuthStore((state) => state.currentUser);
  const { hasPermission } = usePermissions();
  const isWorker = isFieldWorker(currentUser);
  const userCanApprove = hasPermission("variations", "approve");
  const canCreateVariation = hasPermission("variations", "create");

  const userJobs = useMemo(() => {
    if (!isWorker) return jobs;
    return jobs.filter((j) => isJobAssignedToUser(j, [], [], currentUser));
  }, [jobs, isWorker, currentUser]);

  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedVarId, setSelectedVarId] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // Approval Form State
  const [approvalRemarks, setApprovalRemarks] = useState("");

  // New Variation Form State
  const [newJobId, setNewJobId] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newMaterials, setNewMaterials] = useState("");
  const [newCostImpact, setNewCostImpact] = useState("");
  const [newAttachmentName, setNewAttachmentName] = useState("");

  const selectedVar = useMemo(() => {
    if (!selectedVarId) return null;
    return variations.find((v) => v.id === selectedVarId) || null;
  }, [selectedVarId, variations]);

  const handleOpenDetail = (v: JobVariation) => {
    setSelectedVarId(v.id);
    setApprovalRemarks(v.reviewRemarks || "");
  };

  const handleApprove = () => {
    if (!selectedVar) return;
    updateVariationStatus(selectedVar.id, "Approved", {
      approvedBy: currentUser?.name || "Project Manager",
      approvedAt: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      reviewRemarks: approvalRemarks.trim() || "Scope adjustment authorized by Project Manager.",
    });
    setSelectedVarId(null);
  };

  const handleReject = () => {
    if (!selectedVar) return;
    updateVariationStatus(selectedVar.id, "Rejected", {
      approvedBy: currentUser?.name || "Project Manager",
      approvedAt: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      reviewRemarks: approvalRemarks.trim() || "Variation request not approved within project scope.",
    });
    setSelectedVarId(null);
  };

  const handleCreateVariation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    const chosenJob = jobs.find((j) => j.id === newJobId) || userJobs[0] || jobs[0];
    const cost = parseFloat(newCostImpact.replace(/[^0-9.]/g, "")) || 0;
    const attachments = newAttachmentName.trim()
      ? [{ id: `att-${Date.now()}`, name: newAttachmentName.trim() }]
      : undefined;

    addVariation({
      jobId: chosenJob?.id || "J-1025",
      jobTitle: chosenJob?.title || "Electrical Drawing & Conduit Installation",
      projectId: chosenJob?.projectId || "PRJ-ABC",
      projectName: chosenJob?.projectName || "ABC Commercial Building",
      siteId: chosenJob?.siteId || "SITE-BHP",
      siteName: chosenJob?.siteName || "Bhopal Site",
      createdBy: currentUser?.name || "Salim",
      createdById: currentUser?.id ? String(currentUser.id) : "1025",
      creatorRole: currentUser?.role || "FIELD_WORKER",
      createdAt: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      description: newDesc.trim(),
      additionalMaterials: newMaterials.trim() || undefined,
      costImpact: cost,
      status: "Pending",
      attachments,
    });

    setShowNewModal(false);
    setNewJobId("");
    setNewDesc("");
    setNewMaterials("");
    setNewCostImpact("");
    setNewAttachmentName("");
  };

  // Visibility filtering
  const visibleVariations = useMemo(() => {
    return variations.filter((v) => isVariationVisibleToUser(v, currentUser));
  }, [variations, currentUser]);

  const filteredVariations = useMemo(() => {
    return visibleVariations.filter((v) => {
      const q = search.toLowerCase();
      const matchesSearch =
        v.id.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.projectName.toLowerCase().includes(q) ||
        v.siteName.toLowerCase().includes(q) ||
        v.jobId.toLowerCase().includes(q) ||
        v.jobTitle.toLowerCase().includes(q) ||
        v.createdBy.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (activeFilter === "Pending") return v.status === "Pending";
      if (activeFilter === "Approved") return v.status === "Approved";
      if (activeFilter === "Rejected") return v.status === "Rejected";
      return true;
    });
  }, [visibleVariations, search, activeFilter]);

  const selectedJobContext = useMemo(() => {
    return jobs.find((j) => j.id === newJobId) || userJobs[0] || jobs[0];
  }, [newJobId, jobs, userJobs]);

  return (
    <FirmaLayout activeNav="Variations">
      <PermissionGuard module="variations" action="view">
        <div className="space-y-6 mt-2">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-stone border border-pebble px-3 py-1 text-[10px] font-bold tracking-wider text-ash uppercase mb-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Scope Modifications &amp; Cost Impacts</span>
            </div>
            <h1 className="text-display-h1 font-bold text-onyx tracking-tight flex items-center gap-2.5">
              <ArrowLeftRight className="h-6 w-6 text-forest" />
              <span>Variations</span>
            </h1>
            <p className="text-xs sm:text-sm text-ash mt-0.5">
              Track on-site scope modifications, extra materials, and cost approvals with complete project context.
            </p>
          </div>

          {canCreateVariation && (
            <button
              type="button"
              onClick={() => {
                setNewJobId(userJobs[0]?.id || jobs[0]?.id || "J-1025");
                setShowNewModal(true);
              }}
              className="px-4 py-2 rounded-[10px] bg-forest text-white text-xs font-bold hover:bg-forest-hover transition shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Raise Variation
            </button>
          )}
        </div>

        {/* Filter Pills & Search */}
        <div className="rounded-[16px] bg-white border border-pebble/80 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { label: `All Variations (${visibleVariations.length})`, key: "All" },
                {
                  label: `Pending (${visibleVariations.filter((v) => v.status === "Pending").length})`,
                  key: "Pending",
                },
                {
                  label: `Approved (${visibleVariations.filter((v) => v.status === "Approved").length})`,
                  key: "Approved",
                },
                {
                  label: `Rejected (${visibleVariations.filter((v) => v.status === "Rejected").length})`,
                  key: "Rejected",
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

          {/* Table: Variation | Project | Job | Site | Raised By | Cost Impact | Status | Actions */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-pebble/80 text-ash text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Variation</th>
                  <th className="py-2.5 px-3">Project</th>
                  <th className="py-2.5 px-3">Job</th>
                  <th className="py-2.5 px-3">Site</th>
                  <th className="py-2.5 px-3">Raised By</th>
                  <th className="py-2.5 px-3">Cost Impact</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pebble/40">
                {filteredVariations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-ash text-sm">
                      <ArrowLeftRight className="h-9 w-9 text-ash/50 mx-auto mb-2 stroke-[1.5]" />
                      <p className="font-bold text-onyx">No variations recorded</p>
                      <p className="text-xs text-ash mt-1">
                        Field workers log scope changes directly from assigned jobs or via &quot;+ Raise Variation&quot; above.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredVariations.map((v) => (
                    <tr key={v.id} className="hover:bg-stone/50 transition">
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-onyx block">{v.id}</span>
                        <span className="text-[11px] text-ash truncate block max-w-[200px]" title={v.description}>
                          {v.description}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-onyx block">{v.projectName}</span>
                        <span className="text-[10px] text-ash font-mono">{v.projectId}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-[6px] bg-stone font-bold text-onyx border border-pebble text-[11px] inline-block mb-0.5">
                          {v.jobId}
                        </span>
                        <span className="text-[11px] text-ash block truncate max-w-[140px]" title={v.jobTitle}>
                          {v.jobTitle}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-onyx font-medium">
                        {v.siteName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-onyx block">{v.createdBy}</span>
                        <span className="text-[10px] text-ash">{v.creatorRole || "Field Worker"}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-onyx">
                        ₹ {Number(v.costImpact || 0).toLocaleString("en-IN")}
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
                          onClick={() => handleOpenDetail(v)}
                          className="px-3 py-1 rounded-[6px] bg-stone hover:bg-forest hover:text-white border border-pebble text-onyx font-bold transition text-xs cursor-pointer"
                        >
                          {userCanApprove && v.status === "Pending" ? "Review" : "View"}
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
          <div className="bg-white rounded-[16px] max-w-xl w-full p-6 shadow-2xl border border-pebble relative space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-pebble/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-[5px] bg-stone border border-pebble text-xs font-mono font-bold text-onyx">
                    {selectedVar.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold ${
                      selectedVar.status === "Pending"
                        ? "bg-amber-100 text-amber-800"
                        : selectedVar.status === "Approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {selectedVar.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-onyx mt-1.5">Scope Variation &amp; Cost Impact</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVarId(null)}
                className="h-7 w-7 rounded-full bg-stone hover:bg-pebble/50 flex items-center justify-center text-onyx cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Context Hierarchy: Organization -> Project -> Site -> Job -> Created By */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-[12px] bg-stone/70 border border-pebble/60 text-xs">
              <div>
                <span className="text-ash text-[10px] uppercase font-bold flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> Project
                </span>
                <span className="font-bold text-onyx block truncate" title={selectedVar.projectName}>
                  {selectedVar.projectName}
                </span>
                <span className="text-[10px] text-ash font-mono">{selectedVar.projectId}</span>
              </div>
              <div>
                <span className="text-ash text-[10px] uppercase font-bold flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Site
                </span>
                <span className="font-bold text-onyx block truncate" title={selectedVar.siteName}>
                  {selectedVar.siteName}
                </span>
                <span className="text-[10px] text-ash font-mono">{selectedVar.siteId}</span>
              </div>
              <div>
                <span className="text-ash text-[10px] uppercase font-bold flex items-center gap-1">
                  <Briefcase className="h-3 w-3" /> Job
                </span>
                <span className="font-bold text-onyx block font-mono">{selectedVar.jobId}</span>
                <span className="text-[10px] text-ash truncate block" title={selectedVar.jobTitle}>
                  {selectedVar.jobTitle}
                </span>
              </div>
              <div>
                <span className="text-ash text-[10px] uppercase font-bold flex items-center gap-1">
                  <User className="h-3 w-3" /> Raised By
                </span>
                <span className="font-bold text-onyx block">{selectedVar.createdBy}</span>
                <span className="text-[10px] text-ash">
                  {selectedVar.creatorRole || "Field Worker"} • {selectedVar.createdAt}
                </span>
              </div>
            </div>

            {/* Scope Details & Cost Impact */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-[10px] bg-stone/50 border border-pebble text-xs space-y-1">
                <p className="font-bold text-onyx uppercase text-[10px] tracking-wide">Scope Description</p>
                <p className="text-onyx font-medium leading-relaxed">{selectedVar.description}</p>
              </div>

              {selectedVar.additionalMaterials && (
                <div className="p-3.5 rounded-[10px] bg-stone/50 border border-pebble text-xs space-y-1">
                  <p className="font-bold text-onyx uppercase text-[10px] tracking-wide flex items-center gap-1">
                    <Layers className="h-3 w-3 text-forest" /> Additional Materials Required
                  </p>
                  <p className="text-onyx font-medium">{selectedVar.additionalMaterials}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-[10px] bg-stone/70 border border-pebble text-xs">
                <div>
                  <span className="text-ash text-[10px] uppercase font-bold block flex items-center gap-1">
                    <IndianRupee className="h-3 w-3" /> Cost Impact
                  </span>
                  <span className="text-lg font-black text-onyx font-mono">
                    ₹ {Number(selectedVar.costImpact || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-ash text-[10px] uppercase font-bold block">Status</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold inline-block mt-1 ${
                      selectedVar.status === "Pending"
                        ? "bg-amber-100 text-amber-800"
                        : selectedVar.status === "Approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {selectedVar.status}
                  </span>
                </div>
              </div>

              {selectedVar.attachments && selectedVar.attachments.length > 0 && (
                <div className="p-3 rounded-[8px] bg-stone/50 border border-pebble flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-[10px] text-ash font-semibold flex items-center gap-1">
                    <Paperclip className="h-3 w-3" /> Attachments:
                  </span>
                  {selectedVar.attachments.map((att, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-[6px] bg-white border border-pebble text-[11px] font-mono text-onyx"
                    >
                      {typeof att === "string" ? att : att.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* PM / Admin Review & Authorization Section */}
            {userCanApprove ? (
              <div className="space-y-3 pt-2 border-t border-pebble/60">
                <label className="text-xs font-bold text-onyx flex items-center gap-1.5">
                  <FileCheck2 className="h-4 w-4 text-forest" /> Project Manager Authorization
                </label>

                {selectedVar.approvedBy && (
                  <div className="p-2.5 rounded-[8px] bg-stone/60 border border-pebble text-[11px] text-onyx">
                    <span className="font-bold">Last Decision:</span> {selectedVar.status} by {selectedVar.approvedBy} on {selectedVar.approvedAt}
                    {selectedVar.reviewRemarks && (
                      <p className="text-ash mt-0.5">&ldquo;{selectedVar.reviewRemarks}&rdquo;</p>
                    )}
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[11px] text-ash font-medium">Remarks / Authorization Note:</span>
                  <input
                    type="text"
                    value={approvalRemarks}
                    onChange={(e) => setApprovalRemarks(e.target.value)}
                    placeholder="Enter approval rationale, client sign-off reference, or rejection reason..."
                    className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx outline-none focus:border-forest"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedVarId(null)}
                    className="px-3.5 py-1.5 rounded-[8px] border border-pebble text-onyx text-xs font-bold hover:bg-stone cursor-pointer"
                  >
                    Close
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleReject}
                      className="px-3.5 py-1.5 rounded-[8px] bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject Variation
                    </button>
                    <button
                      type="button"
                      onClick={handleApprove}
                      className="px-4 py-1.5 rounded-[8px] bg-forest text-white text-xs font-bold hover:bg-forest-hover shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve Variation
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-pebble/60">
                <p className="text-xs font-bold text-onyx flex items-center gap-1.5">
                  <FileCheck2 className="h-4 w-4 text-forest" /> Approval Status
                </p>
                {selectedVar.approvedBy ? (
                  <div className="p-3 rounded-[8px] bg-stone/50 border border-pebble text-xs text-onyx space-y-1">
                    <p className="font-semibold text-onyx">
                      Decision: <span className={selectedVar.status === "Approved" ? "text-emerald-700 font-bold" : "text-rose-700 font-bold"}>{selectedVar.status}</span>
                    </p>
                    <p className="text-[11px] text-ash">
                      Reviewed by {selectedVar.approvedBy} on {selectedVar.approvedAt}
                    </p>
                    {selectedVar.reviewRemarks && (
                      <p className="text-[11px] text-onyx italic mt-1">&ldquo;{selectedVar.reviewRemarks}&rdquo;</p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-[8px] bg-stone/50 border border-pebble text-xs text-ash italic">
                    Pending Project Manager review and cost authorization.
                  </div>
                )}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedVarId(null)}
                    className="px-4 py-1.5 rounded-[8px] border border-pebble text-onyx text-xs font-bold hover:bg-stone cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
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
            <div className="flex items-center justify-between border-b border-pebble/60 pb-3">
              <h3 className="text-base font-bold text-onyx flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-forest" /> Raise Scope Variation
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="h-7 w-7 rounded-full bg-stone hover:bg-pebble/50 flex items-center justify-center text-onyx cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Job selector */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-onyx block">Select Related Job *</label>
              <select
                required
                value={newJobId}
                onChange={(e) => setNewJobId(e.target.value)}
                className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx"
              >
                <option value="">-- Choose Job --</option>
                {(userJobs.length > 0 ? userJobs : jobs).map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.id} - {j.title} ({j.projectName || "ABC Commercial Building"})
                  </option>
                ))}
              </select>
            </div>

            {/* Auto-populated Context preview */}
            {selectedJobContext && (
              <div className="p-2.5 rounded-[8px] bg-stone/70 border border-pebble/80 text-[11px] grid grid-cols-2 gap-2 text-onyx">
                <div>
                  <span className="text-ash block text-[10px] font-bold uppercase">Project</span>
                  <span className="font-semibold">{selectedJobContext.projectName || "ABC Commercial Building"}</span>
                </div>
                <div>
                  <span className="text-ash block text-[10px] font-bold uppercase">Site</span>
                  <span className="font-semibold">{selectedJobContext.siteName || "Bhopal Site"}</span>
                </div>
              </div>
            )}

            {/* Scope description */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-onyx block">Scope Description *</label>
              <textarea
                rows={2}
                required
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="e.g. Additional conduit trenching required due to unforeseen foundation beam..."
                className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx outline-none focus:border-forest"
              />
            </div>

            {/* Additional Materials */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-onyx block">Additional Materials (Optional)</label>
              <input
                type="text"
                value={newMaterials}
                onChange={(e) => setNewMaterials(e.target.value)}
                placeholder="e.g. 50m PVC heavy conduit, 2 junction boxes"
                className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx outline-none focus:border-forest"
              />
            </div>

            {/* Cost Impact */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-onyx block">Cost Impact (₹) *</label>
              <input
                type="number"
                required
                min="0"
                step="100"
                value={newCostImpact}
                onChange={(e) => setNewCostImpact(e.target.value)}
                placeholder="e.g. 15000"
                className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx outline-none focus:border-forest"
              />
            </div>

            {/* Attachment */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-onyx block">Attachment Ref (Optional)</label>
              <input
                type="text"
                value={newAttachmentName}
                onChange={(e) => setNewAttachmentName(e.target.value)}
                placeholder="e.g. site_photo_trench.jpg"
                className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx outline-none focus:border-forest"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-pebble/60">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-3.5 py-1.5 rounded-[8px] border border-pebble text-onyx text-xs font-bold hover:bg-stone cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-[8px] bg-forest text-white text-xs font-bold hover:bg-forest-hover shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Submit Variation
              </button>
            </div>
          </form>
        </div>
      )}
      </PermissionGuard>
    </FirmaLayout>
  );
}
