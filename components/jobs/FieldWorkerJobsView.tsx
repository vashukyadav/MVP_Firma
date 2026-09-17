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
} from "lucide-react";
import { toast } from "@/components/ui/toast";

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
  const { updateJobStatus, requestSelfAssignment } = useTenderFlowStore();

  const [activeTab, setActiveTab] = useState<TabFilter>("ALL");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Self-assignment modal state
  const [showSelfAssignModal, setShowSelfAssignModal] = useState(false);
  const [selectedAvailableJob, setSelectedAvailableJob] = useState("");
  const [selfAssignReason, setSelfAssignReason] = useState("");

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

                  {/* Dynamic Action Button */}
                  {job.status === "Scheduled" ? (
                    <button
                      type="button"
                      onClick={(e) => handleAdvanceStatus(job, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-forest hover:bg-[#083a2d] text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      <Car className="h-3.5 w-3.5" />
                      <span>Start Travel</span>
                    </button>
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

                  <ChevronRight className="h-4 w-4 text-ash group-hover:text-onyx transition shrink-0 hidden sm:block" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. REQUEST SELF-ASSIGNMENT MODAL                                          */}
      {/* ========================================================================= */}
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
    </div>
  );
}
