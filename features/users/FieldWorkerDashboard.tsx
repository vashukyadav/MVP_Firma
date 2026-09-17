"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useTenderFlowStore, JobItem } from "@/store/tenderFlowStore";
import {
  Calendar,
  Sun,
  Briefcase,
  Clock,
  CheckCircle2,
  Bell,
  MapPin,
  ArrowRight,
  ChevronRight,
  Camera,
  FileText,
  AlertCircle,
  Car,
  Navigation,
  Check,
  Send,
  X,
  Info,
  Sparkles,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import JobPhotoModal from "@/components/jobs/JobPhotoModal";

interface FieldWorkerDashboardProps {
  companyName: string;
}

export default function FieldWorkerDashboard({
  companyName,
}: FieldWorkerDashboardProps) {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { jobs = [], updateJobStatus, requestSelfAssignment } =
    useTenderFlowStore();

  const [photoJob, setPhotoJob] = useState<JobItem | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showSelfAssignModal, setShowSelfAssignModal] = useState(false);
  const [selectedAvailableJob, setSelectedAvailableJob] = useState("");
  const [selfAssignReason, setSelfAssignReason] = useState("");

  const firstName = currentUser?.name ? currentUser.name.split(" ")[0] : "Worker";

  // Filter jobs assigned strictly to this worker
  const myJobs = useMemo(() => {
    const userName = (currentUser?.name || "").toLowerCase().trim();
    if (!userName) return [];
    return jobs.filter((j) => {
      const assignee = (j.assignee || "").toLowerCase().trim();
      if (!assignee) return false;
      return (
        assignee === userName ||
        assignee.includes(userName) ||
        userName.includes(assignee)
      );
    });
  }, [jobs, currentUser]);

  // Unassigned jobs available for self-assignment request
  const availableUnassignedJobs = useMemo(() => {
    return jobs.filter(
      (j) => !j.assignee || !myJobs.some((mj) => mj.id === j.id)
    );
  }, [jobs, myJobs]);

  // Today's jobs
  const todayJobs = useMemo(() => {
    return myJobs.filter((j) => !j.completed || j.status !== "Completed");
  }, [myJobs]);

  const inProgressJobs = useMemo(() => {
    return myJobs.filter(
      (j) => j.status === "In Progress" || j.status === "Travelling" || j.status === "On-site"
    );
  }, [myJobs]);

  // Dynamic status progression for J-001 or any job
  const handleAdvanceStatus = (job: JobItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    let nextStatus: JobItem["status"] = "Travelling";
    let message = "";

    if (job.status === "Scheduled") {
      nextStatus = "Travelling";
      message = `${job.id}: Status changed to Travelling. Safe travels to the site!`;
    } else if (job.status === "Travelling") {
      nextStatus = "On-site";
      message = `${job.id}: Marked On-site. You can now log progress and upload photos.`;
    } else if (job.status === "On-site" || job.status === "In Progress") {
      nextStatus = "Completed";
      message = `${job.id}: Marked as Complete! Great job.`;
    } else {
      nextStatus = "Scheduled";
      message = `${job.id}: Re-opened to Scheduled.`;
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
    toast.success(
      "Self-assignment request submitted to Project Manager & Site Admin for approval."
    );
    setShowSelfAssignModal(false);
    setSelfAssignReason("");
  };

  return (
    <div className="space-y-6 mt-2 pb-12 font-sans">
      {/* ========================================================================= */}
      {/* 1. GREETING BANNER WITH DATE & WEATHER (Screen 1)                        */}
      {/* ========================================================================= */}
      <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-breath text-onyx shrink-0 border border-pebble/60 shadow-2xs">
              <Calendar className="h-5 w-5 text-forest" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-onyx tracking-tight">
                Good morning, {firstName}!
              </h1>
              <p className="text-xs sm:text-sm text-ash mt-0.5 font-medium">
                Here are your jobs for today.
              </p>
            </div>
          </div>

          {/* Date & Weather widget */}
          <div className="flex items-center gap-4 self-end sm:self-center">
            <div className="text-right">
              <p className="text-xs font-bold text-onyx">Tue, 16 Sep 2025</p>
              <p className="text-[11px] text-ash font-medium mt-0.5">
                {companyName || "Riverside Project"}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-stone px-3 py-1.5 border border-pebble/80">
              <Sun className="h-4 w-4 text-amber-500 fill-amber-400" />
              <div className="text-left leading-tight">
                <span className="text-xs font-bold text-onyx block">28°C</span>
                <span className="text-[9px] font-semibold text-ash block uppercase tracking-wider">
                  Sunny
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FOUR KPI CARDS (Screen 1)                                              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Today's Jobs */}
        <div
          onClick={() => router.push("/jobs")}
          className="rounded-[14px] bg-white p-4 border border-pebble/80 shadow-2xs hover:border-forest/40 transition cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
              <Briefcase className="h-5 w-5 text-forest" />
            </div>
            <div>
              <p className="text-2xl font-black text-onyx tracking-tight leading-none group-hover:text-forest transition">
                {todayJobs.length}
              </p>
              <p className="text-xs font-medium text-ash mt-1.5">Today&apos;s Jobs</p>
            </div>
          </div>
        </div>

        {/* KPI 2: In Progress */}
        <div
          onClick={() => router.push("/jobs?filter=in-progress")}
          className="rounded-[14px] bg-white p-4 border border-pebble/80 shadow-2xs hover:border-sky-500/40 transition cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-sky-50 text-sky-700 border border-sky-200/60 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-onyx tracking-tight leading-none group-hover:text-sky-700 transition">
                {inProgressJobs.length}
              </p>
              <p className="text-xs font-medium text-ash mt-1.5">In Progress</p>
            </div>
          </div>
        </div>

        {/* KPI 3: Pending Approval */}
        <div
          onClick={() => router.push("/timesheets")}
          className="rounded-[14px] bg-white p-4 border border-pebble/80 shadow-2xs hover:border-amber-500/40 transition cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-onyx tracking-tight leading-none group-hover:text-amber-700 transition">
                0
              </p>
              <p className="text-xs font-medium text-ash mt-1.5">Pending Approval</p>
            </div>
          </div>
        </div>

        {/* KPI 4: Unread Updates */}
        <div
          onClick={() => router.push("/rfis")}
          className="rounded-[14px] bg-white p-4 border border-pebble/80 shadow-2xs hover:border-rose-500/40 transition cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-rose-50 text-rose-700 border border-rose-200/60 shrink-0">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-onyx tracking-tight leading-none group-hover:text-rose-700 transition">
                0
              </p>
              <p className="text-xs font-medium text-ash mt-1.5">Unread Updates</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TWO-COLUMN LAYOUT: TODAY'S JOBS (LEFT) & RECENT ACTIVITY (RIGHT)       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Today's Jobs (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-base font-bold text-onyx tracking-tight">
                Today&apos;s Jobs
              </h2>
              <button
                type="button"
                onClick={() => router.push("/jobs")}
                className="text-xs font-bold text-forest hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {/* Job Items List */}
            <div className="space-y-3">
              {todayJobs.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-[12px] border border-dashed border-pebble bg-stone/30">
                  <Calendar className="h-8 w-8 text-ash/60 mx-auto mb-2.5" />
                  <p className="text-sm font-semibold text-onyx">No jobs scheduled for today</p>
                  <p className="text-xs text-ash mt-1 max-w-sm mx-auto">
                    When tasks are assigned to you by your Site Manager or Project Manager, they will appear here.
                  </p>
                </div>
              ) : (
                todayJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => router.push(`/jobs?jobId=${job.id}`)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-[12px] border border-pebble/80 hover:bg-stone/50 transition cursor-pointer bg-white group"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="rounded-[8px] bg-stone px-2 py-1 text-xs font-bold text-onyx border border-pebble/70 shrink-0">
                        {job.id}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-onyx truncate group-hover:text-forest transition">
                          {job.title}
                        </p>
                        <p className="text-[11px] text-ash truncate mt-0.5">
                          {job.projectName || job.location || "Assigned Site"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-pebble/50">
                      <span className="text-xs text-ash font-medium whitespace-nowrap">
                        {job.timeSlot || job.due || "Today"}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                          job.status === "Travelling"
                            ? "bg-purple-50 text-purple-800 border-purple-200"
                            : job.status === "On-site" || job.status === "In Progress"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : job.status === "Completed"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-sky-50 text-sky-800 border-sky-200"
                        }`}
                      >
                        {job.status || "Scheduled"}
                      </span>

                      {job.status === "Scheduled" ? (
                        <button
                          type="button"
                          onClick={(e) => handleAdvanceStatus(job, e)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-[8px] bg-forest hover:bg-[#083a2d] text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                        >
                          <Car className="h-3.5 w-3.5" />
                          <span>Start Travel</span>
                        </button>
                      ) : job.status === "Travelling" ? (
                        <button
                          type="button"
                          onClick={(e) => handleAdvanceStatus(job, e)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-[8px] bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          <span>Arrive On-site</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/jobs?jobId=${job.id}`);
                          }}
                          className="px-3 py-1.5 rounded-[8px] bg-white hover:bg-stone text-onyx border border-pebble text-xs font-semibold transition shadow-2xs cursor-pointer"
                        >
                          View Details
                        </button>
                      )}

                      <ChevronRight className="h-4 w-4 text-ash group-hover:text-onyx transition shrink-0 hidden sm:block" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity (4 or 5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-base font-bold text-onyx tracking-tight">
                Recent Activity
              </h2>
              <button
                type="button"
                onClick={() => router.push("/photos")}
                className="text-xs font-bold text-forest hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {/* Activity Stream */}
            <div className="space-y-4">
              {myJobs.length === 0 ? (
                <div className="text-center py-8 px-3 rounded-[12px] border border-dashed border-pebble bg-stone/30">
                  <Clock className="h-7 w-7 text-ash/60 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-onyx">No recent activity</p>
                  <p className="text-[11px] text-ash mt-0.5">
                    Actions like site photos and job updates will appear here.
                  </p>
                </div>
              ) : (
                myJobs.slice(0, 4).map((j) => (
                  <div
                    key={j.id}
                    onClick={() => router.push(`/jobs?jobId=${j.id}`)}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone border border-pebble text-onyx shrink-0 group-hover:bg-breath transition">
                      {j.status === "Completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Briefcase className="h-4 w-4 text-forest" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-onyx group-hover:text-forest transition leading-snug">
                        Job {j.id}: {j.title}
                      </p>
                      <p className="text-[11px] text-ash mt-0.5">
                        Status: {j.status || "Assigned"} • Due: {j.due || "Pending"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-pebble/60">
            <button
              type="button"
              onClick={() => router.push("/photos")}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-[10px] bg-stone hover:bg-mist text-onyx text-xs font-bold border border-pebble/70 transition cursor-pointer"
            >
              <Camera className="h-3.5 w-3.5 text-forest" />
              <span>Open Site Photo Log</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SELF-ASSIGNMENT REQUEST BANNER (As per PDF Note in Diagram)             */}
      {/* ========================================================================= */}
      <div className="rounded-[14px] bg-breath border border-forest/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-7 w-7 rounded-full bg-forest text-white flex items-center justify-center shrink-0 mt-0.5">
            <Info className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-onyx leading-snug">
              Field Worker can also request to self-assign to other available jobs, but it requires approval from Project Manager or Admin (as per PDF).
            </p>
            <p className="text-[11px] text-ash mt-0.5">
              Need extra work or scheduled on-site early? Submit a self-assignment request.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSelfAssignModal(true)}
          className="px-4 py-2 rounded-[10px] bg-onyx hover:bg-black text-white text-xs font-bold shrink-0 transition shadow-2xs cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
        >
          <Sparkles className="h-3.5 w-3.5 text-breath" />
          <span>Request Self-Assignment</span>
        </button>
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
                  placeholder="e.g. Completed today's work early and I am available on-site with required tools and PPE."
                  className="w-full rounded-[8px] border border-pebble px-3 py-2 text-xs text-onyx focus:outline-forest placeholder:text-ash"
                  required
                />
              </div>

              <div className="p-3 rounded-[8px] bg-stone border border-pebble/60 text-[11px] text-ash">
                <span className="font-bold text-onyx block mb-0.5">Note:</span>
                This request will be routed to your Site Manager or Project Manager for approval before being added to your active schedule.
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

      {/* Photo inspection modal */}
      {photoJob && (
        <JobPhotoModal
          job={photoJob}
          isOpen={showPhotoModal}
          onClose={() => {
            setShowPhotoModal(false);
            setPhotoJob(null);
          }}
          currentUserName={currentUser?.name || "Rahul Kumar"}
        />
      )}
    </div>
  );
}
