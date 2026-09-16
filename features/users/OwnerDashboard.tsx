"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useLeadFlowStore } from "@/store/leadFlowStore";
import { useTenderFlowStore } from "@/store/tenderFlowStore";
import {
  Users,
  FolderKanban,
  Target,
  FileCheck2,
  Calendar,
  CreditCard,
  UserPlus,
  ArrowRight,
  Clock,
  CheckSquare,
  Square,
  Check,
  Sparkles,
  Briefcase,
  Layers,
} from "lucide-react";

interface OwnerDashboardProps {
  companyName: string;
  currentPlan: string;
  hasAdmin: boolean;
  teamCount: number;
  roleCounts: {
    SALES_MANAGER: number;
    PROJECT_MANAGER: number;
    SITE_MANAGER?: number;
    FIELD_WORKER: number;
    FINANCE_MANAGER: number;
    ACCOUNT_ADMIN: number;
    OWNER: number;
  };
}

export default function OwnerDashboard({
  companyName,
  currentPlan,
  hasAdmin,
  teamCount,
  roleCounts,
}: OwnerDashboardProps) {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { leads = [], quotes = [], projects = [] } = useLeadFlowStore();
  const { jobs = [], contractors = [], toggleJob } = useTenderFlowStore();

  const firstName = currentUser?.name?.split(" ")[0] || "Owner";

  // Total Contract Value
  const totalContractVal = useMemo(() => {
    return contractors.reduce((sum, c) => sum + (c.awardedAmount || 0), 0);
  }, [contractors]);

  // Recent Activities
  const recentActivities = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      subtitle: string;
      time: string;
      icon: typeof UserPlus;
      iconBg: string;
      iconColor: string;
    }> = [];

    contractors.slice(0, 2).forEach((c) => {
      list.push({
        id: `con-${c.id}`,
        title: `Contractor ${c.name} Awarded`,
        subtitle: `${c.trade} package for ${c.projectName}`,
        time: c.awardDate || "Recently",
        icon: Briefcase,
        iconBg: "bg-clear-bg",
        iconColor: "text-success-text",
      });
    });

    jobs.slice(0, 2).forEach((j) => {
      list.push({
        id: `job-${j.id}`,
        title: `Job ${j.completed ? "Completed" : "Assigned"}: ${j.title}`,
        subtitle: `Assigned to ${j.assignee} (${j.projectName})`,
        time: j.due || "Active",
        icon: FileCheck2,
        iconBg: "bg-breath",
        iconColor: "text-onyx",
      });
    });

    leads.slice(0, 2).forEach((l) => {
      list.push({
        id: `lead-${l.id}`,
        title: `Lead: ${l.companyName || l.contactPerson}`,
        subtitle: `${l.requirement || "General Works"} • Status: ${l.status}`,
        time: l.createdAt
          ? new Date(l.createdAt).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            })
          : "Recently",
        icon: Target,
        iconBg: "bg-sunfleck",
        iconColor: "text-onyx",
      });
    });

    quotes.slice(0, 2).forEach((q) => {
      list.push({
        id: `quote-${q.id}`,
        title: `Quotation ${q.quoteNo || q.id} (${q.status})`,
        subtitle: `To ${q.customerName} (₹${(q.value || 0).toLocaleString("en-IN")})`,
        time: q.validUntil ? `Due ${q.validUntil}` : "Pending",
        icon: FileCheck2,
        iconBg: "bg-mist",
        iconColor: "text-onyx",
      });
    });

    return list.slice(0, 5);
  }, [contractors, jobs, leads, quotes]);

  const inExecutionCount = useMemo(
    () => projects.filter((p) => p.status === "IN_PROGRESS").length,
    [projects]
  );

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
              <span className="text-onyx font-semibold">
                {currentUser?.role === "ACCOUNT_ADMIN" ? "System Admin" : "Executive Owner"} Overview
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-onyx tracking-tight leading-tight">
              Welcome back, {firstName}! <span className="inline-block">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-ash mt-1.5 leading-relaxed">
              Operational overview, project execution, and organizational performance for {companyName || "your enterprise"}.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="rounded-[12px] bg-stone/70 border border-pebble px-4 py-2.5 text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-ash block">
                Plan License
              </span>
              <span className="text-lg font-bold text-onyx leading-tight">
                {currentPlan} Tier
              </span>
            </div>

            <div className="flex items-center gap-2">
              {currentUser?.role === "OWNER" && !hasAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("open-add-admin-modal"));
                  }}
                  className="flex items-center gap-2 rounded-[10px] bg-onyx text-white px-4.5 py-2.5 text-xs font-semibold hover:bg-black transition shadow-2xs cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Add Admin</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => router.push("/team")}
                className="flex items-center gap-2 rounded-[10px] border border-pebble bg-white text-onyx px-4 py-2.5 text-xs font-semibold hover:bg-stone transition cursor-pointer"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Manage Team</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SIX EXECUTIVE KPI METRIC CARDS                                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Team Members */}
        <div
          onClick={() => router.push("/team")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-clear-bg text-success-text">
              <Users className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-ash">Team Members</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-onyx leading-tight">{teamCount}</p>
            <p className="text-[10px] font-medium text-ash mt-1">Registered members</p>
          </div>
        </div>

        {/* Card 2: Active Projects */}
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
              {inExecutionCount} in execution
            </p>
          </div>
        </div>

        {/* Card 3: Active Leads */}
        <div
          onClick={() => router.push("/leads")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-hazard-bg text-hazard-text">
              <Target className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-ash">Active Leads</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-onyx leading-tight">{leads.length}</p>
            <p className="text-[10px] font-medium text-ash mt-1">Open enquiry pipeline</p>
          </div>
        </div>

        {/* Card 4: Pending Quotations */}
        <div
          onClick={() => router.push("/quotations")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-caution-bg text-caution-text">
              <FileCheck2 className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-ash">Pending Quotes</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-onyx leading-tight">
              {quotes.filter((q) => q.status === "DRAFT" || q.status === "SENT").length}
            </p>
            <p className="text-[10px] font-medium text-ash mt-1">Awaiting client review</p>
          </div>
        </div>

        {/* Card 5: Active Jobs */}
        <div
          onClick={() => router.push("/jobs")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-breath text-onyx">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-ash">Active Jobs</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-onyx leading-tight">
              {jobs.filter((j) => !j.completed).length}
            </p>
            <p className="text-[10px] font-medium text-complete-status mt-1">
              {jobs.filter((j) => j.completed).length} completed
            </p>
          </div>
        </div>

        {/* Card 6: Contracted Value */}
        <div
          onClick={() => router.push("/contractors")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-mist text-onyx font-bold text-xs">
              ₹
            </div>
            <span className="text-[11px] font-medium text-ash">Contracts</span>
          </div>
          <div className="mt-3">
            <p className="text-lg font-bold text-onyx leading-tight">
              {totalContractVal > 0 ? `₹${(totalContractVal / 100000).toFixed(1)}L` : "₹0"}
            </p>
            <p className="text-[10px] font-medium text-ash mt-1">
              {contractors.length} active contracts
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MIDDLE ROW: CHARTS & FEATURE PROMO CARD                                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Project Progress */}
        <div className="lg:col-span-5 rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h2 className="text-sm font-bold text-onyx">Project Progress</h2>
                <p className="text-[11px] text-ash mt-0.5">
                  Milestone execution across active sites
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-ash">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-complete-status" /> Completed
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-sunfleck border border-pebble" /> In Progress
                </span>
              </div>
            </div>

            {projects.length === 0 ? (
              <div className="py-10 text-center">
                <FolderKanban className="h-8 w-8 text-ash/40 mx-auto mb-2" />
                <p className="text-xs font-semibold text-onyx">No active site projects yet</p>
                <button
                  type="button"
                  onClick={() => router.push("/projects")}
                  className="mt-2 text-xs font-semibold text-forest hover:underline"
                >
                  Create Project
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 4).map((p) => (
                  <div key={p.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-onyx">{p.name}</span>
                      <span className="text-ash font-medium">{p.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-stone rounded-full overflow-hidden">
                      <div
                        className="h-full bg-forest rounded-full transition-all"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Team Distribution (Donut Chart) */}
        <div className="lg:col-span-4 rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-onyx">Team Distribution</h2>
            <p className="text-[11px] text-ash mt-0.5">Total {teamCount} team members</p>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" stroke="#e6e6e6" strokeWidth="15" fill="transparent" />
                  {teamCount > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#181b19"
                      strokeWidth="15"
                      strokeDasharray={`${(roleCounts.SALES_MANAGER / teamCount) * 238.7} 238.7`}
                      strokeDashoffset="0"
                      fill="transparent"
                    />
                  )}
                  {teamCount > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#608164"
                      strokeWidth="15"
                      strokeDasharray={`${(roleCounts.PROJECT_MANAGER / teamCount) * 238.7} 238.7`}
                      strokeDashoffset={`-${(roleCounts.SALES_MANAGER / teamCount) * 238.7}`}
                      fill="transparent"
                    />
                  )}
                  {teamCount > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#f59e0b"
                      strokeWidth="15"
                      strokeDasharray={`${(roleCounts.FIELD_WORKER / teamCount) * 238.7} 238.7`}
                      strokeDashoffset={`-${((roleCounts.SALES_MANAGER + roleCounts.PROJECT_MANAGER) / teamCount) * 238.7}`}
                      fill="transparent"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-bold text-onyx leading-none">{teamCount}</span>
                  <span className="text-[8px] font-medium text-ash mt-0.5">Members</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs flex-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-onyx">
                    <span className="h-2 w-2 rounded-full bg-onyx" /> Sales
                  </span>
                  <span className="font-bold text-onyx">{roleCounts.SALES_MANAGER}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-onyx">
                    <span className="h-2 w-2 rounded-full bg-complete-status" /> Projects
                  </span>
                  <span className="font-bold text-onyx">{roleCounts.PROJECT_MANAGER}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-onyx">
                    <span className="h-2 w-2 rounded-full bg-caution" /> Field
                  </span>
                  <span className="font-bold text-onyx">{roleCounts.FIELD_WORKER}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-onyx">
                    <span className="h-2 w-2 rounded-full bg-pebble" /> Admin/Owner
                  </span>
                  <span className="font-bold text-onyx">
                    {roleCounts.ACCOUNT_ADMIN + roleCounts.OWNER}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Promo Card */}
        <div className="lg:col-span-3 rounded-[10px] bg-bark p-5 text-white relative overflow-hidden flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-base font-bold text-white leading-snug tracking-tight">
              Better
              <br />
              teams.
              <br />
              Stronger
              <br />
              projects.
            </h3>
            <p className="text-[11px] text-stone/80 mt-1">Role-based controls &amp; muster rolls</p>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={() => router.push("/team")}
              className="w-8 h-8 rounded-full bg-white text-bark flex items-center justify-center hover:scale-105 transition shadow-xs cursor-pointer"
            >
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM ROW: RECENT ACTIVITIES, UPCOMING TASKS, PLAN & SUBSCRIPTION     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activities */}
        <div className="rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-onyx">Recent Activities</h2>
              <button
                type="button"
                onClick={() => router.push("/reports")}
                className="text-[11px] font-medium text-ash hover:text-onyx"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {recentActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-[6px] ${act.iconBg} ${act.iconColor} shrink-0`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-onyx leading-tight truncate">
                          {act.title}
                        </p>
                        <p className="text-[10px] text-ash truncate">{act.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-ash shrink-0">{act.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-onyx">Upcoming Tasks</h2>
              <button
                type="button"
                onClick={() => router.push("/jobs")}
                className="text-[11px] font-medium text-ash hover:text-onyx"
              >
                View All
              </button>
            </div>

            <div className="space-y-2">
              {jobs.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleJob(task.id)}
                  className="flex items-center justify-between gap-2 p-1.5 rounded-[6px] hover:bg-stone transition cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
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
                  <span className="text-[10px] text-ash">{task.due}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plan & Subscription Card (EXCLUSIVELY FOR OWNER / ACCOUNT_ADMIN) */}
        <div className="rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-onyx">Plan &amp; Subscription</h2>
              <button
                type="button"
                onClick={() => router.push("/subscription")}
                className="rounded-[6px] border border-pebble px-2.5 py-1 text-[11px] font-semibold text-onyx hover:bg-stone transition cursor-pointer"
              >
                Manage Plan
              </button>
            </div>

            <div className="mt-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-onyx">{currentPlan} Plan</span>
                <span className="rounded-[4px] bg-clear-bg px-2 py-0.5 text-[10px] font-bold text-success-text">
                  Active
                </span>
              </div>

              <p className="mt-2 text-2xl font-bold text-onyx">
                {currentPlan === "Professional"
                  ? "₹9,999 / yr"
                  : currentPlan === "Enterprise"
                  ? "Custom Plan"
                  : "₹4,999 / yr"}
              </p>
              <p className="text-[10px] font-medium text-ash mt-0.5">
                Active Organization License
              </p>

              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-onyx">
                  <Check className="h-3 w-3 text-complete-status shrink-0" />
                  <span className="text-[11px]">Up to 50 active members</span>
                </div>
                <div className="flex items-center gap-2 text-onyx">
                  <Check className="h-3 w-3 text-complete-status shrink-0" />
                  <span className="text-[11px]">Unlimited site workspaces</span>
                </div>
                <div className="flex items-center gap-2 text-onyx">
                  <Check className="h-3 w-3 text-complete-status shrink-0" />
                  <span className="text-[11px]">Dedicated account manager</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}