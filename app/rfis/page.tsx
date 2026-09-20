"use client";

import { useState, useMemo } from "react";
import FirmaLayout from "@/components/layout/FirmaLayout";
import { useTenderFlowStore, JobRFI } from "@/store/tenderFlowStore";
import { useAuthStore } from "@/store/authStore";
import { isFieldWorker, isJobAssignedToUser, isRfiVisibleToUser, canReviewRfi } from "@/lib/roleAccess";
import {
  HelpCircle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  X,
  FileText,
  User,
  Building2,
  MapPin,
  Briefcase,
  Paperclip,
  Send,
  Check,
} from "lucide-react";

export default function RfisPage() {
  const { rfis, jobs = [], addRfi, updateRfiStatus } = useTenderFlowStore();
  const currentUser = useAuthStore((state) => state.currentUser);
  const isWorker = isFieldWorker(currentUser);
  const userCanReview = canReviewRfi(currentUser);

  const userJobs = useMemo(() => {
    if (!isWorker) return jobs;
    return jobs.filter((j) => isJobAssignedToUser(j, [], [], currentUser));
  }, [jobs, isWorker, currentUser]);

  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedRfiId, setSelectedRfiId] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // Detail Modal Review Form State
  const [reviewResponse, setReviewResponse] = useState("");
  const [reviewStatus, setReviewStatus] = useState<JobRFI["status"]>("Answered");

  // New RFI Form State
  const [newJobId, setNewJobId] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newAttachmentName, setNewAttachmentName] = useState("");

  const selectedRfi = useMemo(() => {
    if (!selectedRfiId) return null;
    return rfis.find((r) => r.id === selectedRfiId) || null;
  }, [selectedRfiId, rfis]);

  // When opening detail modal, sync review inputs
  const handleOpenDetail = (rfi: JobRFI) => {
    setSelectedRfiId(rfi.id);
    setReviewResponse(rfi.reviewResponse || "");
    setReviewStatus(rfi.status === "Open" ? "Answered" : rfi.status);
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfi) return;

    updateRfiStatus(selectedRfi.id, reviewStatus, {
      reviewResponse: reviewResponse.trim() || undefined,
      reviewedBy: currentUser?.name || "Project Manager",
      reviewedAt: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    });

    setSelectedRfiId(null);
  };

  const handleCreateRfi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const chosenJob = jobs.find((j) => j.id === newJobId) || userJobs[0] || jobs[0];
    const attachments = newAttachmentName.trim()
      ? [{ id: `att-${Date.now()}`, name: newAttachmentName.trim() }]
      : undefined;

    addRfi({
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
      question: newQuestion.trim(),
      status: "Open",
      attachments,
    });

    setShowNewModal(false);
    setNewJobId("");
    setNewQuestion("");
    setNewAttachmentName("");
  };

  // Filter visible RFIs based on user permissions
  const visibleRfis = useMemo(() => {
    return rfis.filter((r) => isRfiVisibleToUser(r, currentUser));
  }, [rfis, currentUser]);

  const filteredRfis = useMemo(() => {
    return visibleRfis.filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch =
        r.id.toLowerCase().includes(q) ||
        r.question.toLowerCase().includes(q) ||
        r.projectName.toLowerCase().includes(q) ||
        r.siteName.toLowerCase().includes(q) ||
        r.jobId.toLowerCase().includes(q) ||
        r.jobTitle.toLowerCase().includes(q) ||
        r.createdBy.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (activeFilter === "Open") return r.status === "Open";
      if (activeFilter === "In Progress") return r.status === "In Progress";
      if (activeFilter === "Answered") return r.status === "Answered";
      if (activeFilter === "Closed") return r.status === "Closed";
      return true;
    });
  }, [visibleRfis, search, activeFilter]);

  const selectedJobContext = useMemo(() => {
    return jobs.find((j) => j.id === newJobId) || userJobs[0] || jobs[0];
  }, [newJobId, jobs, userJobs]);

  return (
    <FirmaLayout activeNav="RFIs">
      <div className="space-y-6 mt-2">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-stone border border-pebble px-3 py-1 text-[10px] font-bold tracking-wider text-ash uppercase mb-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>Technical Queries &amp; Site Directives</span>
            </div>
            <h1 className="text-display-h1 font-bold text-onyx tracking-tight flex items-center gap-2.5">
              <HelpCircle className="h-6 w-6 text-forest" />
              <span>RFIs (Request for Information)</span>
            </h1>
            <p className="text-xs sm:text-sm text-ash mt-0.5">
              Field queries raised from site jobs for project and site manager technical directives.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setNewJobId(userJobs[0]?.id || jobs[0]?.id || "J-1025");
              setShowNewModal(true);
            }}
            className="px-4 py-2 rounded-[10px] bg-forest text-white text-xs font-bold hover:bg-forest-hover transition shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Raise RFI
          </button>
        </div>

        {/* Filter Pills & Search */}
        <div className="rounded-[16px] bg-white border border-pebble/80 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { label: `All RFIs (${visibleRfis.length})`, key: "All" },
                {
                  label: `Open (${visibleRfis.filter((r) => r.status === "Open").length})`,
                  key: "Open",
                },
                {
                  label: `In Progress (${visibleRfis.filter((r) => r.status === "In Progress").length})`,
                  key: "In Progress",
                },
                {
                  label: `Answered (${visibleRfis.filter((r) => r.status === "Answered").length})`,
                  key: "Answered",
                },
                {
                  label: `Closed (${visibleRfis.filter((r) => r.status === "Closed").length})`,
                  key: "Closed",
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
                placeholder="Search by ID, job, project, worker..."
                className="bg-transparent w-full outline-none text-xs text-onyx placeholder-ash"
              />
            </div>
          </div>

          {/* Table: RFI | Project | Job | Site | Raised By | Date | Status | Actions */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-pebble/80 text-ash text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">RFI</th>
                  <th className="py-2.5 px-3">Project</th>
                  <th className="py-2.5 px-3">Job</th>
                  <th className="py-2.5 px-3">Site</th>
                  <th className="py-2.5 px-3">Raised By</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pebble/40">
                {filteredRfis.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-ash text-sm">
                      <HelpCircle className="h-9 w-9 text-ash/50 mx-auto mb-2 stroke-[1.5]" />
                      <p className="font-bold text-onyx">No RFIs found</p>
                      <p className="text-xs text-ash mt-1">
                        Field workers raise RFIs from their assigned jobs or using &quot;+ Raise RFI&quot; above.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredRfis.map((r) => (
                    <tr key={r.id} className="hover:bg-stone/50 transition">
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-onyx block">{r.id}</span>
                        <span className="text-[11px] text-ash truncate block max-w-[200px]" title={r.question}>
                          {r.question}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-onyx block">{r.projectName}</span>
                        <span className="text-[10px] text-ash font-mono">{r.projectId}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-[6px] bg-stone font-bold text-onyx border border-pebble text-[11px] inline-block mb-0.5">
                          {r.jobId}
                        </span>
                        <span className="text-[11px] text-ash block truncate max-w-[140px]" title={r.jobTitle}>
                          {r.jobTitle}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-onyx font-medium">
                        {r.siteName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-onyx block">{r.createdBy}</span>
                        <span className="text-[10px] text-ash">{r.creatorRole || "Field Worker"}</span>
                      </td>
                      <td className="py-3 px-3 text-ash whitespace-nowrap">
                        {r.createdAt}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold ${
                            r.status === "Open"
                              ? "bg-rose-100 text-rose-800"
                              : r.status === "In Progress"
                              ? "bg-amber-100 text-amber-800"
                              : r.status === "Answered"
                              ? "bg-teal-100 text-teal-800"
                              : "bg-stone text-ash border border-pebble"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(r)}
                          className="px-3 py-1 rounded-[6px] bg-stone hover:bg-forest hover:text-white border border-pebble text-onyx font-bold transition text-xs cursor-pointer"
                        >
                          {userCanReview && r.status === "Open" ? "Review" : "View"}
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

      {/* RFI Detail Modal */}
      {selectedRfi && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-[16px] max-w-xl w-full p-6 shadow-2xl border border-pebble relative space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-pebble/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-[5px] bg-stone border border-pebble text-xs font-mono font-bold text-onyx">
                    {selectedRfi.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold ${
                      selectedRfi.status === "Open"
                        ? "bg-rose-100 text-rose-800"
                        : selectedRfi.status === "In Progress"
                        ? "bg-amber-100 text-amber-800"
                        : selectedRfi.status === "Answered"
                        ? "bg-teal-100 text-teal-800"
                        : "bg-stone text-ash border border-pebble"
                    }`}
                  >
                    {selectedRfi.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-onyx mt-1.5">Technical Query &amp; Clarification</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRfiId(null)}
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
                <span className="font-bold text-onyx block truncate" title={selectedRfi.projectName}>
                  {selectedRfi.projectName}
                </span>
                <span className="text-[10px] text-ash font-mono">{selectedRfi.projectId}</span>
              </div>
              <div>
                <span className="text-ash text-[10px] uppercase font-bold flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Site
                </span>
                <span className="font-bold text-onyx block truncate" title={selectedRfi.siteName}>
                  {selectedRfi.siteName}
                </span>
                <span className="text-[10px] text-ash font-mono">{selectedRfi.siteId}</span>
              </div>
              <div>
                <span className="text-ash text-[10px] uppercase font-bold flex items-center gap-1">
                  <Briefcase className="h-3 w-3" /> Job
                </span>
                <span className="font-bold text-onyx block font-mono">{selectedRfi.jobId}</span>
                <span className="text-[10px] text-ash truncate block" title={selectedRfi.jobTitle}>
                  {selectedRfi.jobTitle}
                </span>
              </div>
              <div>
                <span className="text-ash text-[10px] uppercase font-bold flex items-center gap-1">
                  <User className="h-3 w-3" /> Raised By
                </span>
                <span className="font-bold text-onyx block">{selectedRfi.createdBy}</span>
                <span className="text-[10px] text-ash">
                  {selectedRfi.creatorRole || "Field Worker"} • {selectedRfi.createdAt}
                </span>
              </div>
            </div>

            {/* Question Box */}
            <div className="p-3.5 rounded-[10px] bg-stone/50 border border-pebble text-xs space-y-1.5">
              <p className="font-bold text-onyx uppercase text-[10px] tracking-wide flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-forest" /> Field Worker Question
              </p>
              <p className="text-onyx text-xs whitespace-pre-wrap font-medium leading-relaxed">
                &ldquo;{selectedRfi.question}&rdquo;
              </p>
              {selectedRfi.attachments && selectedRfi.attachments.length > 0 && (
                <div className="pt-2 border-t border-pebble/60 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-ash font-semibold flex items-center gap-1">
                    <Paperclip className="h-3 w-3" /> Attachments:
                  </span>
                  {selectedRfi.attachments.map((att, idx) => (
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

            {/* Review Section */}
            {userCanReview ? (
              <form onSubmit={handleSaveReview} className="space-y-3 pt-1 border-t border-pebble/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-onyx flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-forest" /> Manager Technical Directive &amp; Review
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-ash text-[11px] font-medium">Update Status:</span>
                    <select
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value as JobRFI["status"])}
                      className="bg-white border border-pebble rounded-[6px] px-2 py-1 text-xs text-onyx font-bold"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Answered">Answered</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={reviewResponse}
                  onChange={(e) => setReviewResponse(e.target.value)}
                  placeholder="Provide technical directive, approved drawing revision, or resolution instructions..."
                  className="w-full bg-white border border-pebble rounded-[8px] p-2.5 text-xs text-onyx outline-none focus:border-forest"
                />

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedRfiId(null)}
                    className="px-3.5 py-1.5 rounded-[8px] border border-pebble text-onyx text-xs font-bold hover:bg-stone cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-[8px] bg-forest text-white text-xs font-bold hover:bg-forest-hover shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" /> Save Directive
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2 pt-1 border-t border-pebble/60">
                <p className="text-xs font-bold text-onyx flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-forest" /> Project Manager Directive
                </p>
                {selectedRfi.reviewResponse ? (
                  <div className="p-3 rounded-[8px] bg-emerald-50/70 border border-emerald-200 text-xs text-onyx space-y-1">
                    <p className="font-medium leading-relaxed">{selectedRfi.reviewResponse}</p>
                    <p className="text-[10px] text-emerald-800 font-semibold pt-1">
                      Provided by {selectedRfi.reviewedBy || "Project Manager"} on {selectedRfi.reviewedAt}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-[8px] bg-stone/50 border border-pebble text-xs text-ash italic">
                    Pending review by Project Manager or Site Manager.
                  </div>
                )}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRfiId(null)}
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

      {/* New RFI Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <form
            onSubmit={handleCreateRfi}
            className="bg-white rounded-[16px] max-w-md w-full p-6 shadow-2xl border border-pebble relative space-y-4"
          >
            <div className="flex items-center justify-between border-b border-pebble/60 pb-3">
              <h3 className="text-base font-bold text-onyx flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-forest" /> Raise New RFI
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="h-7 w-7 rounded-full bg-stone hover:bg-pebble/50 flex items-center justify-center text-onyx cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Linked Job selector */}
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

            {/* Question */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-onyx block">Question / Technical Query *</label>
              <textarea
                rows={3}
                required
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="e.g. I need clarification about the electrical drawing conduit route at grid C-4..."
                className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx outline-none focus:border-forest"
              />
            </div>

            {/* Optional Attachment */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-onyx block">Attachment / Drawing Ref (Optional)</label>
              <input
                type="text"
                value={newAttachmentName}
                onChange={(e) => setNewAttachmentName(e.target.value)}
                placeholder="e.g. DWG-EL-04-REV2.pdf or site_photo_c4.jpg"
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
                <Plus className="h-3.5 w-3.5" /> Submit RFI
              </button>
            </div>
          </form>
        </div>
      )}
    </FirmaLayout>
  );
}
