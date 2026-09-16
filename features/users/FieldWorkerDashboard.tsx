"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useTenderFlowStore, JobItem } from "@/store/tenderFlowStore";
import {
  HardHat,
  CheckSquare,
  Square,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Camera,
} from "lucide-react";
import JobPhotoModal from "@/components/jobs/JobPhotoModal";

interface FieldWorkerDashboardProps {
  companyName: string;
}

export default function FieldWorkerDashboard({ companyName }: FieldWorkerDashboardProps) {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { jobs = [], toggleJob } = useTenderFlowStore();

  const [photoJob, setPhotoJob] = useState<JobItem | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const firstName = currentUser?.name?.split(" ")[0] || "Worker";

  const myJobs = useMemo(() => {
    // If jobs are assigned to worker by name or show all active jobs
    return jobs;
  }, [jobs]);

  const pendingCount = myJobs.filter((j) => !j.completed).length;
  const completedCount = myJobs.filter((j) => j.completed).length;

  return (
    <div className="space-y-6 mt-4">
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 1. WELCOME BANNER (Role-Tailored, Clean Firma Card Styling)               */}
      {/* ========================================================================= */}
      <div className="rounded-[16px] bg-white border border-pebble/80 p-6 sm:p-7 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-stone border border-pebble px-3 py-1 text-[10px] font-bold tracking-wider text-ash uppercase mb-2.5">
              <Sparkles className="h-3 w-3 text-forest" />
              <span className="text-onyx font-semibold">Field Worker &amp; Site Tasks Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-onyx tracking-tight leading-tight">
              Welcome back, {firstName}! <span className="inline-block">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-ash mt-1.5 leading-relaxed">
              Check off your assigned daily work orders, log site progress, and view safety protocols for {companyName || "today's site"}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-[12px] bg-stone/70 border border-pebble px-4 py-2.5 text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-ash block">
                Today&apos;s Status
              </span>
              <span className="text-sm font-bold text-onyx flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-complete-status animate-pulse" />
                Checked In On Site
              </span>
            </div>
            <button
              type="button"
              onClick={() => router.push("/jobs")}
              className="flex items-center gap-1.5 rounded-[10px] bg-onyx text-white px-4 py-2.5 text-xs font-semibold hover:bg-black transition shadow-2xs cursor-pointer"
            >
              <span>View All Jobs</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FOUR FIELD KPI CARDS                                                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-ash" />
            <span className="text-xs font-medium text-ash">Assigned Tasks</span>
          </div>
          <p className="text-2xl font-bold text-onyx mt-2">{myJobs.length}</p>
          <p className="text-[10px] text-ash mt-0.5">Total for this site</p>
        </div>

        <div className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-caution" />
            <span className="text-xs font-medium text-ash">Pending Today</span>
          </div>
          <p className="text-2xl font-bold text-caution-text mt-2">{pendingCount}</p>
          <p className="text-[10px] text-ash mt-0.5">Needs completion</p>
        </div>

        <div className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-success" />
            <span className="text-xs font-medium text-ash">Completed</span>
          </div>
          <p className="text-2xl font-bold text-success-text mt-2">{completedCount}</p>
          <p className="text-[10px] text-ash mt-0.5">Verified work orders</p>
        </div>

        <div className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-complete-status" />
            <span className="text-xs font-medium text-ash">Site Safety</span>
          </div>
          <p className="text-sm font-bold text-complete-status mt-2">100% Compliant</p>
          <p className="text-[10px] text-ash mt-0.5">PPE Hardhat verified</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TASK CHECKLIST & GUIDELINES                                            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs">
          <h2 className="text-sm font-bold text-onyx mb-1">My Work Orders Checklist</h2>
          <p className="text-[11px] text-ash mb-4">
            Tap a work order checkbox once finished to log completion for your site engineer.
          </p>

          <div className="space-y-2">
            {myJobs.length === 0 ? (
              <p className="text-xs text-ash py-6 text-center">No jobs currently assigned to you.</p>
            ) : (
              myJobs.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleJob(task.id)}
                  className="flex items-center justify-between gap-3 p-3 rounded-[8px] border border-pebble/60 hover:bg-stone transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button type="button" className="text-ash hover:text-onyx shrink-0">
                      {task.completed ? (
                        <CheckSquare className="h-5 w-5 text-complete-status" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p
                        className={`text-xs ${
                          task.completed ? "line-through text-ash" : "font-bold text-onyx"
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-[11px] text-ash truncate">
                        Project: {task.projectName} • Assigned to: {task.assignee}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoJob(task);
                        setShowPhotoModal(true);
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-[6px] bg-breath hover:bg-forest hover:text-white text-forest text-xs font-bold transition cursor-pointer border border-forest/20 shadow-2xs"
                      title="Upload or view site photos for this work order"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span>
                        {task.photos && task.photos.length > 0
                          ? `${task.photos.length} Photos`
                          : "Send Photo"}
                      </span>
                    </button>
                    <span className="text-[10px] text-ash">{task.due}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-[4px] ${task.priorityColor}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-4 rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-onyx">Site Guidelines &amp; DPR</h2>
            <p className="text-[11px] text-ash mt-0.5">Safety &amp; equipment notices</p>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded-[8px] bg-stone border border-pebble/60">
                <p className="font-bold text-onyx">Daily Muster Roll Check</p>
                <p className="text-[11px] text-ash mt-1">
                  Ensure muster roll is marked with supervisor before starting civil work.
                </p>
              </div>
              <div className="p-3 rounded-[8px] bg-stone border border-pebble/60">
                <p className="font-bold text-onyx">Safety Hardhat &amp; Shoes</p>
                <p className="text-[11px] text-ash mt-1">
                  Wear high-visibility vest and steel-toe safety footwear at all times.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-pebble/60">
            <button
              type="button"
              onClick={() => router.push("/contractors")}
              className="w-full text-center py-2.5 rounded-[8px] bg-onyx text-white text-xs font-bold hover:bg-black transition cursor-pointer"
            >
              Open Site Attendance
            </button>
          </div>
        </div>
      </div>

      {photoJob && (
        <JobPhotoModal
          job={photoJob}
          isOpen={showPhotoModal}
          onClose={() => {
            setShowPhotoModal(false);
            setPhotoJob(null);
          }}
          currentUserName={currentUser?.name || "Field Worker"}
        />
      )}
    </div>
  );
}
