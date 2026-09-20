"use client";

import { useState, useMemo } from "react";
import { JobItem, useTenderFlowStore } from "@/store/tenderFlowStore";
import { type CurrentUserRef } from "@/lib/roleAccess";
import {
  Briefcase,
  Search,
  Filter,
  Calendar,
  Clock,
  Car,
  CheckCircle2,
  ChevronRight,
  Plus,
  Sparkles,
  X,
  Send,
  Info,
  HelpCircle,
  ArrowLeftRight,
  FileText,
  Upload,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { getJobScheduleState } from "@/lib/dateValidation";

interface FieldWorkerJobsViewProps {
  jobs: JobItem[];
  currentUser?: CurrentUserRef | null;
  onSelectJob: (id: string) => void;
}

type TabFilter = "ALL" | "TODAY" | "IN_PROGRESS" | "COMPLETED";

export default function FieldWorkerJobsView({
  jobs,
  currentUser,
  onSelectJob,
}: FieldWorkerJobsViewProps) {
  const { updateJobStatus, requestSelfAssignment, addRfi, addVariation } = useTenderFlowStore();

  const [activeTab, setActiveTab] = useState<TabFilter>("ALL");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [earlyTravelConfirmJob, setEarlyTravelConfirmJob] = useState<JobItem | null>(null);

  // Self-assignment modal state
  const [showSelfAssignModal, setShowSelfAssignModal] = useState(false);
  const [selectedAvailableJob, setSelectedAvailableJob] = useState("");
  const [selfAssignReason, setSelfAssignReason] = useState("");

  // Raise RFI modal state
  const [showRfiModal, setShowRfiModal] = useState(false);
  const [rfiTargetJob, setRfiTargetJob] = useState<JobItem | null>(null);
  const [rfiTitle, setRfiTitle] = useState("");
  const [rfiQuestion, setRfiQuestion] = useState("");
  const [rfiPriority, setRfiPriority] = useState<"High" | "Medium" | "Low">("High");
  const [rfiAttachmentName, setRfiAttachmentName] = useState("");

  // Raise Variation modal state
  const [showVarModal, setShowVarModal] = useState(false);
  const [varTargetJob, setVarTargetJob] = useState<JobItem | null>(null);
  const [varTitle, setVarTitle] = useState("");
  const [varDescription, setVarDescription] = useState("");
  const [varMaterials, setVarMaterials] = useState("");
  const [varCostImpact, setVarCostImpact] = useState("");
  const [varAttachmentName, setVarAttachmentName] = useState("");

  const handleOpenRfiModal = (job: JobItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setRfiTargetJob(job);
    setRfiTitle(`Clarification - ${job.title}`);
    setRfiQuestion("");
    setRfiPriority("High");
    setRfiAttachmentName("");
    setShowRfiModal(true);
  };

  const handleSubmitRfi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfiTargetJob || !rfiQuestion.trim()) return;

    const rfiTitleFinal = rfiTitle.trim() || `Technical Query - ${rfiTargetJob.title}`;
    const nextNum = (useTenderFlowStore.getState().rfis || []).length + 1;
    const rfiNumber = `RFI-${String(nextNum).padStart(3, "0")}`;

    addRfi({
      rfiNumber,
      organizationId: rfiTargetJob.organizationId || "ORG-DEFAULT",
      projectId: rfiTargetJob.projectId || "PRJ-ABC",
      projectName: rfiTargetJob.projectName || "ABC Commercial Building",
      siteId: rfiTargetJob.siteId || "SITE-BHP",
      siteName: rfiTargetJob.siteName || rfiTargetJob.location || "Bhopal Site",
      jobId: rfiTargetJob.id,
      jobTitle: rfiTargetJob.title,
      createdBy: currentUser?.name || "Salim",
      createdById: String(currentUser?.id || "user-salim"),
      creatorRole: "Field Worker",
      createdAt: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      title: rfiTitleFinal,
      question: rfiQuestion.trim(),
      priority: rfiPriority,
      status: "Open",
      attachments: rfiAttachmentName.trim()
        ? [{ id: `att-${Date.now()}`, name: rfiAttachmentName.trim(), size: "1.2 MB" }]
        : [],
    });

    toast.success(`${rfiNumber} raised against ${rfiTargetJob.id}!`);
    setShowRfiModal(false);
    setRfiTargetJob(null);
  };

  const handleOpenVarModal = (job: JobItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setVarTargetJob(job);
    setVarTitle(`Scope Variation - ${job.title}`);
    setVarDescription("");
    setVarMaterials("");
    setVarCostImpact("");
    setVarAttachmentName("");
    setShowVarModal(true);
  };

  const handleSubmitVar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!varTargetJob || !varDescription.trim() || !varCostImpact.trim()) return;

    const varTitleFinal = varTitle.trim() || `Scope Variation - ${varTargetJob.title}`;
    const nextNum = (useTenderFlowStore.getState().variations || []).length + 12;
    const variationNumber = `V-${String(nextNum).padStart(4, "0")}`;
    const costNum = parseFloat(varCostImpact.replace(/[^0-9.]/g, "")) || 0;

    addVariation({
      variationNumber,
      organizationId: varTargetJob.organizationId || "ORG-DEFAULT",
      projectId: varTargetJob.projectId || "PRJ-ABC",
      projectName: varTargetJob.projectName || "ABC Commercial Building",
      siteId: varTargetJob.siteId || "SITE-BHP",
      siteName: varTargetJob.siteName || varTargetJob.location || "Bhopal Site",
      jobId: varTargetJob.id,
      jobTitle: varTargetJob.title,
      createdBy: currentUser?.name || "Salim",
      createdById: String(currentUser?.id || "user-salim"),
      creatorRole: "Field Worker",
      createdAt: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      title: varTitleFinal,
      description: varDescription.trim(),
      additionalMaterials: varMaterials.trim(),
      costImpact: costNum,
      amount: costNum,
      status: "Awaiting PM Approval",
      attachments: varAttachmentName.trim()
        ? [{ id: `att-${Date.now()}`, name: varAttachmentName.trim(), size: "1.5 MB" }]
        : [],
    });

    toast.success(`${variationNumber} submitted against ${varTargetJob.id}!`);
    setShowVarModal(false);
    setVarTargetJob(null);
  };

  // Filter jobs strictly for this field worker
  const workerJobs = useMemo(() => {
    const user = (currentUser?.name || "").toLowerCase().trim();
    if (!user) return [];
    return jobs.filter((j) => {
      const assignee = (j.assignee || "").toLowerCase().trim();
      if (!assignee) return false;
      return (
        assignee === user ||
        assignee.includes(user) ||
        user.includes(assignee)
      );
    });
  }, [jobs, currentUser]);

  const availableUnassignedJobs = useMemo(() => {
    return jobs.filter(
      (j) => !j.assignee || !workerJobs.some((wj) => wj.id === j.id)
    );
  }, [jobs, workerJobs]);

  // Tab counts
  const allCount = workerJobs.length;
  const todayCount = workerJobs.filter((j) => !j.completed && j.status !== "Completed").length;
  const inProgressCount = workerJobs.filter(
    (j) => j.status === "In Progress" || j.status === "Travelling" || j.status === "On-site"
  ).length;
  const completedCount = workerJobs.filter((j) => j.completed || j.status === "Completed").length;

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return workerJobs.filter((j) => {
      // Tab filter
      if (activeTab === "TODAY" && (j.completed || j.status === "Completed")) return false;
      if (
        activeTab === "IN_PROGRESS" &&
        j.status !== "In Progress" &&
        j.status !== "Travelling" &&
        j.status !== "On-site"
      )
        return false;
      if (activeTab === "COMPLETED" && !j.completed && j.status !== "Completed") return false;

      // Status dropdown filter
      if (statusFilter !== "ALL") {
        if (statusFilter === "Upcoming" && j.status !== "Upcoming" && j.status !== "Scheduled")
          return false;
        if (statusFilter !== "Upcoming" && j.status !== statusFilter) return false;
      }

      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matches =
          j.id.toLowerCase().includes(query) ||
          j.title.toLowerCase().includes(query) ||
          j.location.toLowerCase().includes(query) ||
          j.projectName.toLowerCase().includes(query);
        if (!matches) return false;
      }

      return true;
    });
  }, [workerJobs, activeTab, statusFilter, search]);

  const handleAdvanceStatus = (job: JobItem, e: React.MouseEvent) => {
    e.stopPropagation();

    let nextStatus: JobItem["status"] = "Travelling";
    let message = "";

    if (job.status === "Scheduled") {
      nextStatus = "Travelling";
      message = `${job.id}: Status set to Travelling.`;
    } else if (job.status === "Travelling") {
      nextStatus = "On-site";
      message = `${job.id}: Marked On-site.`;
    } else if (job.status === "On-site" || job.status === "In Progress") {
      nextStatus = "Completed";
      message = `${job.id}: Work order marked Complete!`;
    } else {
      nextStatus = "Scheduled";
      message = `${job.id}: Re-opened as Scheduled.`;
    }

    updateJobStatus(job.id, nextStatus);
    toast.success(message);
  };

  const handleJobTravelAction = (job: JobItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (job.status === "Scheduled") {
      const sched = getJobScheduleState(job.startDate || job.due);
      if (!sched.allowDirectTravel) {
        setEarlyTravelConfirmJob(job);
        return;
      }
    }
    handleAdvanceStatus(job, e);
  };

  const handleSelfAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestSelfAssignment(
      selectedAvailableJob,
      currentUser?.name || "Rahul Kumar",
      selfAssignReason
    );
    toast.success("Self-assignment request submitted to PM for review.");
    setShowSelfAssignModal(false);
    setSelfAssignReason("");
  };

  const getStatusBadge = (status: JobItem["status"]) => {
    switch (status) {
      case "Travelling":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "On-site":
      case "In Progress":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Completed":
        return "bg-green-100 text-green-900 border-green-300";
      case "Upcoming":
        return "bg-stone text-ash border-pebble";
      default:
        return "bg-sky-50 text-sky-800 border-sky-200";
    }
  };

  return (
    <div className="space-y-5 mt-2 pb-12 font-sans">
      {/* ========================================================================= */}
      {/* 1. HEADER SECTION (Screen 2)                                              */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-display-h1 font-bold text-onyx tracking-tight flex items-center gap-2.5">
            <Briefcase className="h-6 w-6 text-forest" />
            <span>My Jobs</span>
          </h1>
          <p className="text-xs sm:text-sm text-ash mt-0.5">
            Track and execute your assigned daily tasks, update status, and log materials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowSelfAssignModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-forest hover:bg-[#083a2d] text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="h-4 w-4 text-breath" />
          <span>Request Self-Assignment</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. FILTER TABS (Screen 2: All, Today, In Progress, Completed)              */}
      {/* ========================================================================= */}
      <div className="border-b border-pebble/80">
        <div className="flex items-center gap-6 overflow-x-auto text-xs no-scrollbar">
          {(
            [
              { key: "ALL", label: `All (${allCount})` },
              { key: "TODAY", label: `Today (${todayCount})` },
              { key: "IN_PROGRESS", label: `In Progress (${inProgressCount})` },
              { key: "COMPLETED", label: `Completed (${completedCount})` },
            ] as { key: TabFilter; label: string }[]
          ).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 font-semibold transition cursor-pointer whitespace-nowrap relative ${
                  isActive
                    ? "text-forest font-bold border-b-2 border-forest"
                    : "text-ash hover:text-onyx"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SEARCH & STATUS DROPDOWN (Screen 2)                                    */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs..."
            className="w-full h-10 pl-9.5 pr-4 text-xs bg-white text-onyx font-medium rounded-[10px] border border-pebble/80 outline-none focus:border-forest placeholder:text-ash shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 text-xs bg-white text-onyx font-semibold rounded-[10px] border border-pebble/80 outline-none focus:border-forest shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Travelling">Travelling</option>
            <option value="On-site">On-site</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. JOBS LIST / TABLE (Screen 2)                                           */}
      {/* ========================================================================= */}
      <div className="rounded-[16px] bg-white border border-pebble/80 shadow-2xs overflow-hidden">
        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="h-8 w-8 text-ash mx-auto mb-2" />
            <p className="text-sm font-bold text-onyx">No jobs found</p>
            <p className="text-xs text-ash mt-1">
              Try adjusting your search query or filter criteria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-pebble/70">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onSelectJob(job.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 hover:bg-stone/40 transition cursor-pointer group"
              >
                {/* Left: Code + Title & Location */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="rounded-[8px] bg-stone px-2.5 py-1 text-xs font-bold text-onyx border border-pebble shrink-0">
                    {job.id}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-onyx truncate group-hover:text-forest transition">
                      {job.title}
                    </p>
                    <p className="text-[11px] text-ash truncate mt-0.5">
                      {job.location || job.projectName}
                    </p>
                  </div>
                </div>

                {/* Right: Date/Time + Status Badge + Action Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-pebble/50">
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-semibold text-onyx">
                      {job.due || "16 Sep 2025"}
                    </p>
                    <p className="text-[11px] text-ash">
                      {job.timeSlot || "08:00 AM - 10:00 AM"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${getStatusBadge(
                      job.status
                    )}`}
                  >
                    {job.status}
                  </span>

                  {/* Schedule Date Badge */}
                  {(() => {
                    const schedState = getJobScheduleState(job.startDate || job.due);
                    return (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border whitespace-nowrap ${schedState.badgeColor}`}
                        title={`Scheduled: ${schedState.scheduledDateFormatted}`}
                      >
                        {schedState.badgeText}
                      </span>
                    );
                  })()}

                  {/* Dynamic Action Button */}
                  {job.status === "Scheduled" ? (
                    (() => {
                      const schedState = getJobScheduleState(job.startDate || job.due);
                      if (schedState.allowDirectTravel) {
                        return (
                          <button
                            type="button"
                            onClick={(e) => handleJobTravelAction(job, e)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-forest hover:bg-[#083a2d] text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                          >
                            <Car className="h-3.5 w-3.5" />
                            <span>Start Travel</span>
                          </button>
                        );
                      }
                      if (schedState.category === "TOMORROW") {
                        return (
                          <button
                            type="button"
                            onClick={(e) => handleJobTravelAction(job, e)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                            title="Job scheduled for tomorrow. Click to confirm early travel."
                          >
                            <Clock className="h-3.5 w-3.5" />
                            <span>Starts Tomorrow</span>
                          </button>
                        );
                      }
                      return (
                        <button
                          type="button"
                          onClick={(e) => handleJobTravelAction(job, e)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-stone hover:bg-mist text-onyx border border-pebble text-xs font-semibold transition shadow-2xs cursor-pointer"
                          title={`Scheduled for ${schedState.scheduledDateFormatted}. Click to confirm early travel.`}
                        >
                          <Calendar className="h-3.5 w-3.5 text-ash" />
                          <span>{schedState.scheduledDateFormatted}</span>
                        </button>
                      );
                    })()
                  ) : job.status === "Travelling" ? (
                    <button
                      type="button"
                      onClick={(e) => handleAdvanceStatus(job, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-forest hover:bg-[#083a2d] text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Arrived On-Site</span>
                    </button>
                  ) : job.status === "On-site" || job.status === "In Progress" ? (
                    <button
                      type="button"
                      onClick={(e) => handleAdvanceStatus(job, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-forest hover:bg-[#083a2d] text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Complete Job</span>
                    </button>
                  ) : (
                    <span className="text-xs text-forest font-bold px-2 py-1">
                      Completed &#10003;
                    </span>
                  )}

                  {/* Quick Raise RFI & Raise Variation buttons */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      title="Raise RFI for this Job"
                      onClick={(e) => handleOpenRfiModal(job, e)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] bg-stone hover:bg-forest hover:text-white border border-pebble text-onyx text-[11px] font-bold transition shadow-2xs cursor-pointer"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-forest" />
                      <span className="hidden sm:inline">Raise</span> RFI
                    </button>
                    <button
                      type="button"
                      title="Raise Variation for this Job"
                      onClick={(e) => handleOpenVarModal(job, e)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] bg-stone hover:bg-amber-600 hover:text-white border border-pebble text-onyx text-[11px] font-bold transition shadow-2xs cursor-pointer"
                    >
                      <ArrowLeftRight className="h-3.5 w-3.5 text-amber-600" />
                      <span className="hidden sm:inline">Raise</span> Variation
                    </button>
                  </div>

                  <ChevronRight className="h-4 w-4 text-ash group-hover:text-onyx transition shrink-0 hidden sm:block" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. RAISE RFI MODAL (FIELD WORKER)                                         */}
      {/* ========================================================================= */}
      {showRfiModal && rfiTargetJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-[16px] bg-white border border-pebble p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-pebble/60 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-forest" />
                <h3 className="text-base font-bold text-onyx">Raise RFI from Job</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRfiModal(false)}
                className="text-ash hover:text-onyx cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Context Breadcrumb */}
            <div className="p-3 rounded-[10px] bg-stone/70 border border-pebble/70 text-xs space-y-1">
              <p className="font-bold text-[11px] uppercase tracking-wider text-ash">
                Target Context
              </p>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div>
                  <span className="text-[10px] text-ash block">Project</span>
                  <span className="font-bold text-onyx truncate block">
                    {rfiTargetJob.projectName || "ABC Commercial Building"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-ash block">Site</span>
                  <span className="font-bold text-onyx truncate block">
                    {rfiTargetJob.siteName || rfiTargetJob.location || "Bhopal Site"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-ash block">Job</span>
                  <span className="font-mono font-bold text-forest">
                    {rfiTargetJob.id}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-ash block">Field Worker</span>
                  <span className="font-bold text-onyx">
                    {currentUser?.name || "Salim"}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitRfi} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-onyx mb-1">
                  Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  value={rfiTitle}
                  onChange={(e) => setRfiTitle(e.target.value)}
                  placeholder="e.g. Clarification about electrical drawing"
                  className="w-full rounded-[8px] border border-pebble px-3 py-2 text-xs text-onyx focus:outline-forest placeholder:text-ash font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-onyx mb-1">
                  Question / Technical Clarification *
                </label>
                <textarea
                  rows={3}
                  required
                  value={rfiQuestion}
                  onChange={(e) => setRfiQuestion(e.target.value)}
                  placeholder="Explain clearly what clarification is needed on site..."
                  className="w-full rounded-[8px] border border-pebble px-3 py-2 text-xs text-onyx focus:outline-forest placeholder:text-ash"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-onyx mb-1">Priority</label>
                  <select
                    value={rfiPriority}
                    onChange={(e) =>
                      setRfiPriority(e.target.value as "High" | "Medium" | "Low")
                    }
                    className="w-full rounded-[8px] border border-pebble bg-stone/40 px-3 py-2 text-xs font-semibold text-onyx focus:outline-forest cursor-pointer"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-onyx mb-1">
                    Attachment (Drawing / Photo)
                  </label>
                  <input
                    type="text"
                    value={rfiAttachmentName}
                    onChange={(e) => setRfiAttachmentName(e.target.value)}
                    placeholder="e.g. DWG-E102-Rev3.pdf"
                    className="w-full rounded-[8px] border border-pebble px-3 py-2 text-xs text-onyx focus:outline-forest placeholder:text-ash"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-pebble/60">
                <button
                  type="button"
                  onClick={() => setShowRfiModal(false)}
                  className="px-3.5 py-2 rounded-[8px] bg-stone hover:bg-mist text-ash font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[8px] bg-forest hover:bg-[#083a2d] text-white font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit RFI</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. RAISE VARIATION MODAL (FIELD WORKER)                                   */}
      {/* ========================================================================= */}
      {showVarModal && varTargetJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-[16px] bg-white border border-pebble p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-pebble/60 pb-3">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-bold text-onyx">Raise Variation from Job</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVarModal(false)}
                className="text-ash hover:text-onyx cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Context Breadcrumb */}
            <div className="p-3 rounded-[10px] bg-stone/70 border border-pebble/70 text-xs space-y-1">
              <p className="font-bold text-[11px] uppercase tracking-wider text-ash">
                Target Context
              </p>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div>
                  <span className="text-[10px] text-ash block">Project</span>
                  <span className="font-bold text-onyx truncate block">
                    {varTargetJob.projectName || "ABC Commercial Building"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-ash block">Site</span>
                  <span className="font-bold text-onyx truncate block">
                    {varTargetJob.siteName || varTargetJob.location || "Bhopal Site"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-ash block">Job</span>
                  <span className="font-mono font-bold text-forest">
                    {varTargetJob.id}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-ash block">Field Worker</span>
                  <span className="font-bold text-onyx">
                    {currentUser?.name || "Salim"}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitVar} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-onyx mb-1">
                  Variation Title *
                </label>
                <input
                  type="text"
                  required
                  value={varTitle}
                  onChange={(e) => setVarTitle(e.target.value)}
                  placeholder="e.g. Additional conduit routing and sub-panel"
                  className="w-full rounded-[8px] border border-pebble px-3 py-2 text-xs text-onyx focus:outline-forest placeholder:text-ash font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-onyx mb-1">
                  Scope Description *
                </label>
                <textarea
                  rows={2.5}
                  required
                  value={varDescription}
                  onChange={(e) => setVarDescription(e.target.value)}
                  placeholder="Describe why the scope changed on site..."
                  className="w-full rounded-[8px] border border-pebble px-3 py-2 text-xs text-onyx focus:outline-forest placeholder:text-ash"
                />
              </div>

              <div>
                <label className="block font-bold text-onyx mb-1">
                  Additional Materials (Required)
                </label>
                <input
                  type="text"
                  value={varMaterials}
                  onChange={(e) => setVarMaterials(e.target.value)}
                  placeholder="e.g. 50m PVC conduit, 2x junction boxes"
                  className="w-full rounded-[8px] border border-pebble px-3 py-2 text-xs text-onyx focus:outline-forest placeholder:text-ash"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-onyx mb-1">
                    Cost Impact (₹) *
                  </label>
                  <input
                    type="text"
                    required
                    value={varCostImpact}
                    onChange={(e) => setVarCostImpact(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full rounded-[8px] border border-pebble px-3 py-2 text-xs text-onyx focus:outline-forest placeholder:text-ash font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-onyx mb-1">
                    Attachment / Spec
                  </label>
                  <input
                    type="text"
                    value={varAttachmentName}
                    onChange={(e) => setVarAttachmentName(e.target.value)}
                    placeholder="e.g. quote-or-site-note.pdf"
                    className="w-full rounded-[8px] border border-pebble px-3 py-2 text-xs text-onyx focus:outline-forest placeholder:text-ash"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-pebble/60">
                <button
                  type="button"
                  onClick={() => setShowVarModal(false)}
                  className="px-3.5 py-2 rounded-[8px] bg-stone hover:bg-mist text-ash font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[8px] bg-forest hover:bg-[#083a2d] text-white font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Variation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showSelfAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[16px] bg-white border border-pebble p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-pebble/60 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-forest" />
                <h3 className="text-base font-bold text-onyx">
                  Request Job Self-Assignment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSelfAssignModal(false)}
                className="text-ash hover:text-onyx cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSelfAssignSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-onyx mb-1">
                  Select Available Site Job
                </label>
                <select
                  value={selectedAvailableJob}
                  onChange={(e) => setSelectedAvailableJob(e.target.value)}
                  className="w-full rounded-[8px] border border-pebble bg-stone/40 px-3 py-2 text-xs font-semibold text-onyx focus:outline-forest"
                >
                  {availableUnassignedJobs.length === 0 ? (
                    <option value="" disabled>
                      No available unassigned site jobs
                    </option>
                  ) : (
                    availableUnassignedJobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.id} • {j.title} ({j.projectName || j.location || "Site"})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-onyx mb-1">
                  Request Note / Reason for PM
                </label>
                <textarea
                  rows={3}
                  value={selfAssignReason}
                  onChange={(e) => setSelfAssignReason(e.target.value)}
                  placeholder="e.g. Available to take on site tasks."
                  className="w-full rounded-[8px] border border-pebble px-3 py-2 text-xs text-onyx focus:outline-forest placeholder:text-ash"
                  required
                />
              </div>

              <div className="p-3 rounded-[8px] bg-stone border border-pebble/60 text-[11px] text-ash">
                <span className="font-bold text-onyx block mb-0.5">Note:</span>
                This request will be sent to the Project Manager or Site Manager for sign-off as per company policy.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-pebble/60">
                <button
                  type="button"
                  onClick={() => setShowSelfAssignModal(false)}
                  className="px-3.5 py-2 rounded-[8px] bg-stone hover:bg-mist text-ash font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[8px] bg-forest hover:bg-[#083a2d] text-white font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Early Travel Confirmation Modal */}
      {earlyTravelConfirmJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[16px] bg-white border border-pebble p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-pebble/60 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-bold text-onyx">Early Travel Confirmation</h3>
              </div>
              <button
                type="button"
                onClick={() => setEarlyTravelConfirmJob(null)}
                className="text-ash hover:text-onyx cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-[10px] bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-xs">
                  <Calendar className="h-4 w-4 text-amber-700 shrink-0" />
                  <span>
                    Job scheduled for{" "}
                    {getJobScheduleState(earlyTravelConfirmJob.startDate || earlyTravelConfirmJob.due).scheduledDateFormatted} (
                    {getJobScheduleState(earlyTravelConfirmJob.startDate || earlyTravelConfirmJob.due).category === "TOMORROW"
                      ? "Tomorrow"
                      : "Future Date"}
                    )
                  </span>
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  This work order is scheduled for a future date. Starting travel now will notify your Project Manager and Site Manager that you are mobilizing early.
                </p>
              </div>

              <div className="p-3 rounded-[8px] bg-stone/70 border border-pebble space-y-1">
                <p className="font-bold text-onyx">{earlyTravelConfirmJob.id}: {earlyTravelConfirmJob.title}</p>
                <p className="text-[11px] text-ash">
                  Site: {earlyTravelConfirmJob.projectName || earlyTravelConfirmJob.location || "Assigned Site"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-pebble/60">
              <button
                type="button"
                onClick={() => setEarlyTravelConfirmJob(null)}
                className="px-3.5 py-2 rounded-[8px] bg-stone hover:bg-mist text-ash hover:text-onyx font-bold text-xs transition cursor-pointer"
              >
                Cancel (Wait for Date)
              </button>
              <button
                type="button"
                onClick={() => {
                  const j = earlyTravelConfirmJob;
                  setEarlyTravelConfirmJob(null);
                  updateJobStatus(j.id, "Travelling");
                  toast.success(`${j.id}: Status changed to Travelling (early mobilization). Safe travels!`);
                }}
                className="px-4 py-2 rounded-[8px] bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Car className="h-3.5 w-3.5" />
                <span>Confirm &amp; Start Travel Early</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
