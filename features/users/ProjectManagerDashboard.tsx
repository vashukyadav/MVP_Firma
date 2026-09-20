"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useLeadFlowStore } from "@/store/leadFlowStore";
import { useTenderFlowStore } from "@/store/tenderFlowStore";
import {
  FolderKanban,
  Calendar,
  Briefcase,
  CheckSquare,
  Square,
  ArrowRight,
  Clock,
  Plus,
  Activity,
  HardHat,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from "lucide-react";

interface ProjectDashboardProps {
  companyName: string;
}

export default function ProjectManagerDashboard({ companyName }: ProjectDashboardProps) {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { projects = [], quotes = [] } = useLeadFlowStore();
  const { jobs = [], contractors = [], toggleJob } = useTenderFlowStore();

  const firstName = currentUser?.name?.split(" ")[0] || "Project Manager";

  const inExecutionProjects = useMemo(
    () => projects.filter((p) => p.status === "IN_PROGRESS"),
    [projects]
  );

  const pendingJobs = useMemo(() => jobs.filter((j) => !j.completed), [jobs]);
  const completedJobs = useMemo(() => jobs.filter((j) => j.completed), [jobs]);

  const totalContractVal = useMemo(() => {
    return contractors.reduce((sum, c) => sum + (c.awardedAmount || 0), 0);
  }, [contractors]);

  // Recent Site Activities
  const recentSiteActivities = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      subtitle: string;
      time: string;
      icon: typeof Briefcase;
      iconBg: string;
      iconColor: string;
    }> = [];

    contractors.slice(0, 3).forEach((c) => {
      list.push({
        id: `con-${c.id}`,
        title: `Contractor ${c.name} Dispatched`,
        subtitle: `${c.trade} package on ${c.projectName}`,
        time: c.awardDate || "Recently",
        icon: Briefcase,
        iconBg: "bg-clear-bg",
        iconColor: "text-success-text",
      });
    });

    jobs.slice(0, 3).forEach((j) => {
      list.push({
        id: `job-${j.id}`,
        title: `Work Order: ${j.title}`,
        subtitle: `Assigned to ${j.assignee} (${j.projectName})`,
        time: j.due || "Active",
        icon: FolderKanban,
        iconBg: "bg-breath",
        iconColor: "text-onyx",
      });
    });

    return list.slice(0, 5);
  }, [contractors, jobs]);

  return (
    <div className="space-y-6 mt-4">
      {/* ========================================================================= */}
      {/* 1. WELCOME BANNER (Role-Tailored, Clean Firma Card Styling)               */}
      {/* ========================================================================= */}
      <div className="rounded-[16px] bg-white border border-pebble/80 p-6 sm:p-7 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-stone border border-pebble px-3 py-1 text-[10px] font-bold tracking-wider text-ash uppercase mb-2.5">
              <Sparkles className="h-3 w-3 text-forest" />
              <span className="text-onyx font-semibold">Project &amp; Site Operations Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-onyx tracking-tight leading-tight">
              Welcome back, {firstName}! <span className="inline-block">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-ash mt-1.5 leading-relaxed">
              Track site execution, allocate subcontractor packages, and keep critical path milestones on schedule for {companyName || "your projects"}.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="rounded-[12px] bg-stone/70 border border-pebble px-4 py-2.5 text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-ash block">
                Active Sites
              </span>
              <span className="text-lg font-bold text-onyx leading-tight">
                {projects.length} Workspaces
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/projects")}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-[10px] bg-onyx text-white px-4 py-2.5 text-xs font-semibold hover:bg-black transition shadow-2xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Site</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/jobs")}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-[10px] border border-pebble bg-white text-onyx px-4 py-2.5 text-xs font-semibold hover:bg-stone transition cursor-pointer"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Assign Job</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SIX PROJECT KPI METRICS CARDS                                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div
          onClick={() => router.push("/projects")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-sunfleck text-onyx">
              <FolderKanban className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-ash">Active Sites</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-onyx leading-tight">{projects.length}</p>
            <p className="text-[10px] font-medium text-complete-status mt-1">
              {inExecutionProjects.length} in execution
            </p>
          </div>
        </div>

        <div
          onClick={() => router.push("/jobs")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-caution-bg text-caution-text">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-ash">Active Jobs</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-onyx leading-tight">{pendingJobs.length}</p>
            <p className="text-[10px] font-medium text-ash mt-1">Pending verification</p>
          </div>
        </div>

        <div
          onClick={() => router.push("/jobs")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-clear-bg text-success-text">
              <CheckSquare className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-ash">Completed</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-onyx leading-tight">{completedJobs.length}</p>
            <p className="text-[10px] font-medium text-success-text mt-1">Milestones finished</p>
          </div>
        </div>

        <div
          onClick={() => router.push("/contractors")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-breath text-onyx">
              <HardHat className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-ash">Contractors</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-onyx leading-tight">{contractors.length}</p>
            <p className="text-[10px] font-medium text-ash mt-1">Subcontractor packages</p>
          </div>
        </div>

        <div
          onClick={() => router.push("/contractors")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-mist text-onyx font-bold text-xs">
              ₹
            </div>
            <span className="text-[11px] font-medium text-ash">Contract Value</span>
          </div>
          <div className="mt-3">
            <p className="text-lg font-bold text-onyx leading-tight">
              {totalContractVal > 0 ? `₹${(totalContractVal / 100000).toFixed(1)}L` : "₹0"}
            </p>
            <p className="text-[10px] font-medium text-ash mt-1">Committed spend</p>
          </div>
        </div>

        <div
          onClick={() => router.push("/scheduling")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-clear-bg text-success-text">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-ash">Site Status</span>
          </div>
          <div className="mt-3">
            <p className="text-sm font-bold text-success-text leading-tight flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              On Schedule
            </p>
            <p className="text-[10px] font-medium text-ash mt-1">Zero delay flags</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MIDDLE ROW: PROJECT PROGRESS & JOB PRIORITIZATION                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Project Progress */}
        <div className="lg:col-span-8 rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-sm font-bold text-onyx">Active Project Site Progress</h2>
                <p className="text-[11px] text-ash mt-0.5">
                  Milestone execution and progress percentages across active worksites
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/projects")}
                className="text-xs font-semibold text-forest hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Sites</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="py-12 text-center">
                <FolderKanban className="h-8 w-8 text-ash/40 mx-auto mb-2" />
                <p className="text-xs font-semibold text-onyx">No active projects created yet</p>
                <p className="text-[11px] text-ash mt-0.5 max-w-xs mx-auto">
                  Create a new construction site project to track milestones and workers.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/projects")}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-forest hover:underline cursor-pointer"
                >
                  <span>Create First Project</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 4).map((p) => {
                  const linkedQuote = quotes.find(
                    (q) =>
                      (p.quoteId && (q.id === p.quoteId || q.quoteNo === p.quoteId)) ||
                      (p.sourceOpportunityId && q.opportunityId === p.sourceOpportunityId) ||
                      (q.opportunityTitle && p.name && q.opportunityTitle.trim().toLowerCase() === p.name.trim().toLowerCase())
                  );
                  const materialsCount = p.lineItems?.length || linkedQuote?.lineItems?.length || 0;

                  return (
                    <div
                      key={p.id}
                      onClick={() => router.push(`/projects?id=${p.id}`)}
                      className="space-y-1.5 p-3 rounded-[12px] hover:bg-stone/50 transition cursor-pointer border border-pebble/40 hover:border-forest/40 group bg-stone/20"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-onyx group-hover:text-forest transition">{p.name}</span>
                          <span className="text-[10px] text-ash flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {p.location || "On Site"}
                          </span>
                        </div>
                        <span className="text-ash font-bold">{p.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-mist rounded-full overflow-hidden">
                        <div
                          className="h-full bg-forest rounded-full transition-all"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-ash pt-0.5">
                        <span>Client: <strong className="text-onyx font-medium">{p.client || "Direct Contractor"}</strong></span>
                        <div className="flex items-center gap-2">
                          {materialsCount > 0 && (
                            <span className="text-forest text-[10px] font-bold flex items-center gap-1 bg-forest/10 px-2 py-0.5 rounded-full border border-forest/20">
                              <Layers className="h-2.5 w-2.5" /> {materialsCount} Materials
                            </span>
                          )}
                          <span>Budget: <strong className="text-onyx font-semibold">{p.budget || "₹2.4 Cr"}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Site Operations Card */}
        <div className="lg:col-span-4 rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-onyx">Site Command Hub</h2>
            <p className="text-[11px] text-ash mt-0.5">Quick access to field execution tools</p>

            <div className="mt-4 space-y-2.5 text-xs">
              <div
                onClick={() => router.push("/jobs")}
                className="p-3 rounded-[8px] border border-pebble/60 hover:border-onyx transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-onyx">Work Orders &amp; Jobs</p>
                  <p className="text-[10px] text-ash">{pendingJobs.length} active tasks</p>
                </div>
                <ArrowRight className="h-4 w-4 text-ash" />
              </div>

              <div
                onClick={() => router.push("/contractors")}
                className="p-3 rounded-[8px] border border-pebble/60 hover:border-onyx transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-onyx">Subcontractor Packages</p>
                  <p className="text-[10px] text-ash">{contractors.length} active crews</p>
                </div>
                <ArrowRight className="h-4 w-4 text-ash" />
              </div>

              <div
                onClick={() => router.push("/scheduling")}
                className="p-3 rounded-[8px] border border-pebble/60 hover:border-onyx transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-onyx">Gantt &amp; Scheduling</p>
                  <p className="text-[10px] text-ash">Critical path timeline</p>
                </div>
                <ArrowRight className="h-4 w-4 text-ash" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM ROW: UPCOMING TASKS CHECKLIST & RECENT SITE ACTIVITIES          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Upcoming Tasks Checklist */}
        <div className="lg:col-span-7 rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-onyx">Scheduled Tasks &amp; Work Orders</h2>
            <button
              type="button"
              onClick={() => router.push("/jobs")}
              className="text-xs font-semibold text-forest hover:underline cursor-pointer"
            >
              View All Tasks
            </button>
          </div>

          <div className="space-y-2">
            {jobs.length === 0 ? (
              <p className="text-xs text-ash py-6 text-center">No tasks assigned yet.</p>
            ) : (
              jobs.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleJob(task.id)}
                  className="flex items-center justify-between gap-2 p-2 rounded-[6px] hover:bg-stone transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button type="button" className="text-ash hover:text-onyx shrink-0">
                      {task.completed ? (
                        <CheckSquare className="h-4 w-4 text-complete-status" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                    <span
                      className={`text-xs truncate ${
                        task.completed ? "line-through text-ash" : "font-medium text-onyx"
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
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

        {/* Recent Site Activities */}
        <div className="lg:col-span-5 rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-onyx">Recent Field Logs</h2>
            <span className="text-[11px] text-ash">Live Sync</span>
          </div>

          <div className="space-y-3">
            {recentSiteActivities.length === 0 ? (
              <p className="text-xs text-ash py-6 text-center">No site logs recorded yet.</p>
            ) : (
              recentSiteActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div
                    key={act.id}
                    className="flex items-center justify-between gap-2.5 p-1.5 rounded-[6px] hover:bg-stone transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-[6px] ${act.iconBg} ${act.iconColor} shrink-0`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-onyx truncate">{act.title}</p>
                        <p className="text-[10px] text-ash truncate">{act.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-ash shrink-0">{act.time}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
