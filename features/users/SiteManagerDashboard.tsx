"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  ArrowRight,
  Plus,
  Camera,
  Eye,
  Users,
  Building2,
  HelpCircle,
  ArrowLeftRight,
  ShieldAlert,
  ShieldCheck,
  ListChecks,
  HardHat,
  ChevronRight,
  FileText,
  Sun,
  CloudSun,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useTenderFlowStore } from "@/store/tenderFlowStore";
import { useSiteStore } from "@/store/siteStore";
import { useSchedulingStore } from "@/store/schedulingStore";
import { useLeadFlowStore } from "@/store/leadFlowStore";
import {
  getAssignedProjects,
  getAssignedSites,
  getAssignedJobs,
} from "@/lib/roleAccess";
import { db } from "@/lib/db";
import { getJobScheduleState, formatDisplayDate } from "@/lib/dateValidation";

interface SiteDashboardProps {
  companyName: string;
}

export default function SiteManagerDashboard({ companyName }: SiteDashboardProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const rawJobs = useTenderFlowStore((state) => state.jobs) || [];
  const rawSites = useSiteStore((state) => state.sites) || [];
  const rawScheduledJobs = useSchedulingStore((state) => state.scheduledJobs) || [];
  const allProjects = useLeadFlowStore((state) => state.projects) || [];

  const [scheduleTab, setScheduleTab] = useState<"TODAY" | "UPCOMING">("TODAY");

  const assignedProjects = useMemo(() => {
    return getAssignedProjects(allProjects, rawSites, currentUser);
  }, [allProjects, rawSites, currentUser]);

  const sites = useMemo(() => {
    return getAssignedSites(rawSites, currentUser, assignedProjects);
  }, [rawSites, currentUser, assignedProjects]);

  const jobs = useMemo(() => {
    return getAssignedJobs(rawJobs, assignedProjects, sites, currentUser);
  }, [rawJobs, assignedProjects, sites, currentUser]);

  const scheduledJobs = useMemo(() => {
    return rawScheduledJobs.filter((sj) => {
      const siteMatch = sites.some(
        (s) =>
          (s.name && s.name.toLowerCase() === (sj.site || "").toLowerCase()) ||
          (s.projectName && s.projectName.toLowerCase() === (sj.site || "").toLowerCase())
      );
      const jobMatch = jobs.some(
        (j) => j.id === sj.id || j.title.toLowerCase() === sj.title.toLowerCase()
      );
      return siteMatch || jobMatch;
    });
  }, [rawScheduledJobs, sites, jobs]);

  // Separate Today's jobs from Upcoming & Tomorrow's jobs
  const todayScheduledJobs = useMemo(() => {
    return scheduledJobs.filter((sj) => {
      const sched = getJobScheduleState(sj.startDate || sj.date);
      return sched.category === "TODAY" || sched.category === "OVERDUE" || sj.status === "In Progress" || sj.status === "Completed";
    });
  }, [scheduledJobs]);

  const upcomingScheduledJobs = useMemo(() => {
    return scheduledJobs.filter((sj) => {
      const sched = getJobScheduleState(sj.startDate || sj.date);
      return sched.category === "TOMORROW" || sched.category === "FUTURE";
    });
  }, [scheduledJobs]);

  const [teamCount, setTeamCount] = useState<number>(0);

  useEffect(() => {
    const companyId = currentUser?.companyId || "ORG-DEFAULT";
    db.users
      .where("companyId")
      .equals(companyId)
      .count()
      .then((count) => setTeamCount(count))
      .catch(() => {});
  }, [currentUser?.companyId]);

  // Compute metrics from live store data
  const totalJobs = jobs.length;
  const inProgressJobs = jobs.filter((j) => j.status === "In Progress").length;
  const scheduledCount = scheduledJobs.length;

  // Real photos derived from all jobs (tenderFlow + scheduled)
  const realFieldPhotos = useMemo(() => {
    const seenIds = new Set<string>();
    const allPhotos: Array<{ id: string; title: string; time: string; author: string; url: string; stage: string }> = [];

    // From tenderFlow jobs
    jobs.forEach((j) => {
      (j.photos || []).forEach((p) => {
        if (!seenIds.has(p.id)) {
          seenIds.add(p.id);
          allPhotos.push({
            id: p.id,
            title: p.title || j.title,
            time: p.timestamp || "",
            author: p.uploadedBy || j.assignee || "Field Worker",
            url: p.url,
            stage: p.stage || j.trade || "Field Progress",
          });
        }
      });
    });

    // From scheduledJobs
    scheduledJobs.forEach((sj) => {
      (sj.photos || []).forEach((p) => {
        if (!seenIds.has(p.id)) {
          seenIds.add(p.id);
          allPhotos.push({
            id: p.id,
            title: (p as any).title || sj.title,
            time: (p as any).timestamp || "",
            author: (p as any).uploadedBy || sj.worker || "Field Worker",
            url: p.url,
            stage: (p as any).stage || "Field Progress",
          });
        }
      });
    });

    return allPhotos;
  }, [jobs, scheduledJobs]);

  // Real recent activities derived from store jobs & photos
  const recentActivities = useMemo(() => {
    const list: Array<{
      author: string;
      action: string;
      target: string;
      time: string;
      icon: any;
      color: string;
    }> = [];

    // Photos uploaded
    jobs.forEach((j) => {
      (j.photos || []).forEach((p) => {
        list.push({
          author: p.uploadedBy || "Field Worker",
          action: "uploaded photo",
          target: j.title,
          time: p.timestamp || "Recently",
          icon: Camera,
          color: "bg-emerald-100 text-emerald-800",
        });
      });
    });

    // Recent job assignments or progress
    jobs.slice(0, 5).forEach((j) => {
      list.push({
        author: j.assignee || "Assigned Worker",
        action: `status: ${j.status}`,
        target: j.title,
        time: j.due || "Recently",
        icon: Briefcase,
        color: j.status === "Completed" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800",
      });
    });

    return list.slice(0, 5);
  }, [jobs]);

  const displayName = currentUser?.name || "Site Manager";

  return (
    <div className="space-y-6 mt-2">
      {/* ========================================================================= */}
      {/* 1. GREETING & CONTEXT HEADER                                              */}
      {/* ========================================================================= */}
      <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-800 mb-2">
              <HardHat className="h-3.5 w-3.5 text-emerald-700" />
              <span>Site Manager Workspace</span>
              <span className="text-emerald-300">•</span>
              <span className="text-emerald-900 font-semibold">
                {companyName || currentUser?.companyId || "Site Operations"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-onyx tracking-tight flex items-center gap-2">
              Good Morning, {displayName}! <span>👷</span>
            </h1>
            <p className="text-xs sm:text-sm text-ash mt-1">
              On-site execution, daily reporting, crew coordination, and site operations overview.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-stone border border-pebble text-xs text-onyx font-medium">
              <Sun className="h-4 w-4 text-amber-500" />
              <span>Active Site: <strong>Normal Weather</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-stone border border-pebble text-xs text-ash">
              <Calendar className="h-4 w-4 text-ash" />
              <span className="font-semibold text-onyx">Live Workspace</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 4 PRIMARY KPI CARDS (SCREEN 1)                                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Jobs */}
        <Link
          href="/jobs"
          className="p-5 rounded-[14px] bg-white border border-pebble/80 shadow-2xs hover:shadow-md hover:border-forest/50 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ash">Active Jobs</span>
            <span className="h-8 w-8 rounded-[8px] bg-emerald-50 text-forest flex items-center justify-center group-hover:bg-forest group-hover:text-white transition">
              <Briefcase className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-onyx">{totalJobs}</span>
              {inProgressJobs > 0 && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {inProgressJobs} In-Progress
                </span>
              )}
            </div>
            <p className="text-[11px] text-ash mt-1.5 flex items-center justify-between">
              <span>{scheduledCount} Scheduled on timeline</span>
              <ArrowRight className="h-3 w-3 text-ash group-hover:text-forest group-hover:translate-x-0.5 transition" />
            </p>
          </div>
        </Link>

        {/* Card 2: Team On Site */}
        <Link
          href="/crew"
          className="p-5 rounded-[14px] bg-white border border-pebble/80 shadow-2xs hover:shadow-md hover:border-forest/50 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ash">Team Members</span>
            <span className="h-8 w-8 rounded-[8px] bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-onyx">{teamCount}</span>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                Database
              </span>
            </div>
            <p className="text-[11px] text-ash mt-1.5 flex items-center justify-between">
              <span>{teamCount > 0 ? "Active registered users" : "No users yet"}</span>
              <ArrowRight className="h-3 w-3 text-ash group-hover:text-forest group-hover:translate-x-0.5 transition" />
            </p>
          </div>
        </Link>

        {/* Card 3: Open RFIs */}
        <Link
          href="/rfis"
          className="p-5 rounded-[14px] bg-white border border-pebble/80 shadow-2xs hover:shadow-md hover:border-rose-300 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ash">Open RFIs</span>
            <span className="h-8 w-8 rounded-[8px] bg-rose-50 text-rose-700 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition">
              <HelpCircle className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-onyx">0</span>
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                0 Pending
              </span>
            </div>
            <p className="text-[11px] text-ash mt-1.5 flex items-center justify-between">
              <span>View &amp; raise RFIs</span>
              <ArrowRight className="h-3 w-3 text-ash group-hover:text-rose-600 group-hover:translate-x-0.5 transition" />
            </p>
          </div>
        </Link>

        {/* Card 4: Open Variations */}
        <Link
          href="/variations"
          className="p-5 rounded-[14px] bg-white border border-pebble/80 shadow-2xs hover:shadow-md hover:border-amber-300 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ash">Variations</span>
            <span className="h-8 w-8 rounded-[8px] bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
              <ArrowLeftRight className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-onyx">0</span>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                Clean
              </span>
            </div>
            <p className="text-[11px] text-ash mt-1.5 flex items-center justify-between">
              <span>Manage site variations</span>
              <ArrowRight className="h-3 w-3 text-ash group-hover:text-amber-600 group-hover:translate-x-0.5 transition" />
            </p>
          </div>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE GRID: SCHEDULE & RECENT ACTIVITIES (SCREEN 1)            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Today's Schedule + Active Sites */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule Card */}
          <div className="rounded-[16px] bg-white border border-pebble/80 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-pebble/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setScheduleTab("TODAY")}
                    className={`px-3 py-1 rounded-[8px] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      scheduleTab === "TODAY"
                        ? "bg-forest text-white shadow-xs"
                        : "bg-stone text-ash hover:text-onyx"
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Today&apos;s Schedule ({todayScheduledJobs.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleTab("UPCOMING")}
                    className={`px-3 py-1 rounded-[8px] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      scheduleTab === "UPCOMING"
                        ? "bg-forest text-white shadow-xs"
                        : "bg-stone text-ash hover:text-onyx"
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>Upcoming ({upcomingScheduledJobs.length})</span>
                  </button>
                </div>
                <p className="text-[11px] text-ash mt-1.5">
                  {scheduleTab === "TODAY"
                    ? "Execution slots scheduled for today and active shifts."
                    : "Jobs and contractor packages planned for tomorrow or future dates."}
                </p>
              </div>
              <Link
                href="/scheduling"
                className="text-xs font-bold text-forest hover:underline flex items-center gap-1 self-end sm:self-auto"
              >
                <span>Full Timeline</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="p-6">
              {(() => {
                const activeList = scheduleTab === "TODAY" ? todayScheduledJobs : upcomingScheduledJobs;
                if (activeList.length === 0) {
                  return (
                    <div className="p-8 text-center bg-stone/20 rounded-[12px] border border-dashed border-pebble/80">
                      <Calendar className="h-8 w-8 text-ash mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-semibold text-onyx">
                        {scheduleTab === "TODAY"
                          ? "No jobs scheduled for today"
                          : "No upcoming jobs found"}
                      </p>
                      <p className="text-xs text-ash mt-1 max-w-sm mx-auto">
                        {scheduleTab === "TODAY"
                          ? "Check the Upcoming tab to view tomorrow's or future scheduled work."
                          : "Assign field workers to upcoming project milestones on the scheduling timeline."}
                      </p>
                      <Link
                        href="/scheduling"
                        className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-1.5 rounded-[8px] bg-forest text-white text-xs font-semibold hover:bg-forest-hover transition cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Go to Scheduling</span>
                      </Link>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {activeList.slice(0, 6).map((item) => {
                      const schedState = getJobScheduleState(item.startDate || item.date);
                      return (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-[12px] bg-stone/40 border border-pebble/60 hover:bg-stone/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <div className="h-10 w-16 rounded-[8px] bg-white border border-pebble/80 flex items-center justify-center font-black text-xs text-onyx shrink-0 shadow-2xs">
                              {item.timeSlot || "Slot"}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-onyx">{item.title}</h4>
                              <p className="text-xs text-ash mt-0.5 flex items-center gap-2">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-ash" /> {item.site || "General Site"}
                                </span>
                                <span className="text-pebble">•</span>
                                <span>{item.worker || "Unassigned"}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-center">
                            {/* Schedule Badge */}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${schedState.badgeColor}`}
                            >
                              {schedState.badgeText}
                            </span>

                            <span
                              className={`px-2.5 py-1 rounded-[6px] text-xs font-bold ${
                                item.status === "Completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : item.status === "In Progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-stone text-onyx border border-pebble"
                              }`}
                            >
                              {item.status}
                            </span>
                            <Link
                              href="/jobs"
                              className="p-1.5 rounded-[6px] hover:bg-white text-ash hover:text-onyx transition"
                              title="View Job"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Active Sites Overview */}
          <div className="rounded-[16px] bg-white border border-pebble/80 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-pebble/60 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-onyx flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-forest" />
                  <span>Active Construction Sites</span>
                </h2>
                <p className="text-xs text-ash mt-0.5">Real-time status across active locations.</p>
              </div>
              <Link
                href="/sites"
                className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
              >
                <span>All Sites ({sites.length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="p-6">
              {sites.length === 0 ? (
                <div className="p-8 text-center bg-stone/20 rounded-[12px] border border-dashed border-pebble/80">
                  <Building2 className="h-8 w-8 text-ash mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-onyx">No construction sites assigned yet</p>
                  <p className="text-xs text-ash mt-1 max-w-sm mx-auto">
                    You do not have any active construction sites assigned to you. Once your Project Manager or Owner assigns a site to you, it will appear here.
                  </p>
                  <Link
                    href="/sites"
                    className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-1.5 rounded-[8px] bg-forest text-white text-xs font-semibold hover:bg-forest-hover transition cursor-pointer"
                  >
                    <span>View Sites Directory</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sites.slice(0, 4).map((site) => {
                    const siteProgress = site.status === "Completed" ? 100 : site.status === "Active" ? 60 : 25;
                    const siteLocation = site.city ? `${site.city}, ${site.state}` : site.address || "Location not set";
                    return (
                      <div
                        key={site.id}
                        className="p-4 rounded-[12px] bg-stone/40 border border-pebble/70 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="px-2 py-0.5 rounded-[4px] bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {site.status || "Active"}
                            </span>
                            <h4 className="text-sm font-bold text-onyx mt-1">{site.name}</h4>
                            <p className="text-xs text-ash flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 text-ash" /> {siteLocation}
                            </p>
                          </div>
                          <span className="text-xs font-black text-onyx">{siteProgress}% Done</span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-pebble/60 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-forest h-full rounded-full"
                            style={{ width: `${siteProgress}%` }}
                          />
                        </div>

                        <div className="pt-2 border-t border-pebble/50 flex items-center justify-between text-xs text-ash">
                          <span>{site.siteManagerName ? `Manager: ${site.siteManagerName}` : "Active Site"}</span>
                          <div className="flex items-center gap-2">
                            <Link href="/site-reports" className="text-forest hover:underline font-semibold">
                              Daily Report
                            </Link>
                            <span>•</span>
                            <Link href="/punch-lists" className="text-forest hover:underline font-semibold">
                              Punch List
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Activity Feed, Quick Actions & Photo Preview */}
        <div className="space-y-6">
          {/* Quick Actions Hub */}
          <div className="rounded-[16px] bg-white border border-pebble/80 shadow-2xs p-5 space-y-3">
            <h3 className="text-sm font-bold text-onyx">Site Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2">
              <Link
                href="/site-reports"
                className="p-3 rounded-[10px] bg-stone/50 hover:bg-forest hover:text-white border border-pebble/60 transition group flex items-center justify-between text-xs font-semibold text-onyx"
              >
                <span className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-forest group-hover:text-white transition" />
                  <span>+ New Daily Site Report</span>
                </span>
                <ChevronRight className="h-4 w-4 text-ash group-hover:text-white transition" />
              </Link>

              <Link
                href="/photos"
                className="p-3 rounded-[10px] bg-stone/50 hover:bg-forest hover:text-white border border-pebble/60 transition group flex items-center justify-between text-xs font-semibold text-onyx"
              >
                <span className="flex items-center gap-2.5">
                  <Camera className="h-4 w-4 text-forest group-hover:text-white transition" />
                  <span>📷 Upload Field Photos</span>
                </span>
                <ChevronRight className="h-4 w-4 text-ash group-hover:text-white transition" />
              </Link>

              <Link
                href="/rfis"
                className="p-3 rounded-[10px] bg-stone/50 hover:bg-forest hover:text-white border border-pebble/60 transition group flex items-center justify-between text-xs font-semibold text-onyx"
              >
                <span className="flex items-center gap-2.5">
                  <HelpCircle className="h-4 w-4 text-forest group-hover:text-white transition" />
                  <span>+ Raise New RFI</span>
                </span>
                <ChevronRight className="h-4 w-4 text-ash group-hover:text-white transition" />
              </Link>

              <Link
                href="/safety"
                className="p-3 rounded-[10px] bg-stone/50 hover:bg-rose-600 hover:text-white border border-pebble/60 transition group flex items-center justify-between text-xs font-semibold text-onyx"
              >
                <span className="flex items-center gap-2.5">
                  <ShieldAlert className="h-4 w-4 text-amber-600 group-hover:text-white transition" />
                  <span>⚠️ Log Safety Incident</span>
                </span>
                <ChevronRight className="h-4 w-4 text-ash group-hover:text-white transition" />
              </Link>

              <Link
                href="/punch-lists"
                className="p-3 rounded-[10px] bg-stone/50 hover:bg-forest hover:text-white border border-pebble/60 transition group flex items-center justify-between text-xs font-semibold text-onyx"
              >
                <span className="flex items-center gap-2.5">
                  <ListChecks className="h-4 w-4 text-forest group-hover:text-white transition" />
                  <span>✓ Add Punch List Item</span>
                </span>
                <ChevronRight className="h-4 w-4 text-ash group-hover:text-white transition" />
              </Link>
            </div>
          </div>

          {/* Recent Site Activity */}
          <div className="rounded-[16px] bg-white border border-pebble/80 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-pebble/60 flex items-center justify-between">
              <h3 className="text-sm font-bold text-onyx">Recent Site Activity</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
                Live Feed
              </span>
            </div>

            <div className="p-5">
              {recentActivities.length === 0 ? (
                <div className="p-4 text-center">
                  <HardHat className="h-6 w-6 text-ash mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-onyx">No recent site activity</p>
                  <p className="text-[11px] text-ash mt-0.5">
                    Field worker logs and job status changes will appear here live.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {recentActivities.map((act, i) => {
                    const Icon = act.icon;
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <span
                          className={`h-7 w-7 rounded-full ${act.color} flex items-center justify-center shrink-0`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-onyx font-medium leading-snug">
                            <strong>{act.author}</strong> {act.action} for{" "}
                            <span className="font-bold text-forest">{act.target}</span>
                          </p>
                          <span className="text-[10px] text-ash block mt-0.5">{act.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Field Photos Mini Widget */}
          <div className="rounded-[16px] bg-white border border-pebble/80 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-pebble/60 flex items-center justify-between">
              <h3 className="text-sm font-bold text-onyx flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-forest" />
                <span>Field Photos</span>
              </h3>
              <Link
                href="/photos"
                className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
              >
                <span>View All ({realFieldPhotos.length})</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-4">
              {realFieldPhotos.length === 0 ? (
                <div className="p-4 text-center">
                  <Camera className="h-6 w-6 text-ash mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-onyx">No field photos uploaded</p>
                  <p className="text-[11px] text-ash mt-0.5">
                    Workers can attach photos directly from the Job detail view or Field App.
                  </p>
                  <Link
                    href="/photos"
                    className="inline-block mt-2 text-xs font-bold text-forest hover:underline"
                  >
                    Go to Photos Hub
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {realFieldPhotos.slice(0, 4).map((photo) => (
                    <Link
                      key={photo.id}
                      href="/photos"
                      className="group relative rounded-[10px] overflow-hidden border border-pebble/70 aspect-video bg-stone block"
                    >
                      <Image
                        src={photo.url}
                        alt={photo.title}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-2">
                        <span className="text-[10px] font-bold text-white truncate">{photo.title}</span>
                        <span className="text-[8px] text-stone truncate">{photo.author}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
