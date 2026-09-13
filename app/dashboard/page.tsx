"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { db } from "@/lib/db";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  Users,
  FolderKanban,
  FileText,
  Calendar,
  CreditCard,
  FileCheck2,
  ChevronDown,
  UserPlus,
  FolderPlus,
  Square,
  CheckSquare,
  Check,
  ArrowRight,
  Briefcase,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();

  const [companyName, setCompanyName] = useState("ABC Solutions Pvt. Ltd.");
  const [currentPlan, setCurrentPlan] = useState("Starter");
  const [createNewOpen, setCreateNewOpen] = useState(false);

  // Interactive Tasks State with Firma Status Tokens
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Review quotation for Metro Heights",
      due: "Today",
      priority: "High",
      priorityColor: "bg-hazard-bg text-hazard-text border border-hazard-bg",
      completed: false,
    },
    {
      id: 2,
      title: "Team meeting with project managers",
      due: "Today",
      priority: "Medium",
      priorityColor: "bg-caution-bg text-caution-text border border-caution-bg",
      completed: false,
    },
    {
      id: 3,
      title: "Approve new user requests",
      due: "Tomorrow",
      priority: "Medium",
      priorityColor: "bg-caution-bg text-caution-text border border-caution-bg",
      completed: false,
    },
    {
      id: 4,
      title: "Client call – GreenBuild Ltd.",
      due: "Tomorrow",
      priority: "Low",
      priorityColor: "bg-clear-bg text-success-text border border-clear-bg",
      completed: false,
    },
    {
      id: 5,
      title: "Monthly report review",
      due: "28 May",
      priority: "Low",
      priorityColor: "bg-clear-bg text-success-text border border-clear-bg",
      completed: false,
    },
  ]);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const [teamCount, setTeamCount] = useState(0);

  const user = currentUser || {
    id: 0,
    name: "User",
    email: "",
    role: "OWNER",
    size: 0,
  };

  const firstName = currentUser?.name?.split(" ")[0] || "User";

  useEffect(() => {
    async function loadData() {
      try {
        const usersCount = await db.users.count();
        setTeamCount(usersCount);
      } catch {
        setTeamCount(0);
      }
      if (currentUser?.id) {
        const comp = await db.company.get(currentUser.id);
        if (comp?.companyName) {
          setCompanyName(comp.companyName);
        }

        const onboard = await db.onboarding.get(currentUser.id);
        if (onboard?.plan) {
          const planFormatted =
            onboard.plan.charAt(0) + onboard.plan.slice(1).toLowerCase();
          setCurrentPlan(planFormatted);
        }
      }
    }
    loadData();
  }, [currentUser?.id]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "GOOD MORNING" : hour < 17 ? "GOOD AFTERNOON" : "GOOD EVENING";

  return (
    <FirmaLayout activeNav="Dashboard">
      {/* ========================================================================= */}
      {/* HERO / WELCOME BANNER                                                     */}
      {/* ========================================================================= */}
      <div className="rounded-[16px] bg-[#eaede7] border border-pebble/70 p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-2xs mt-4">
        {/* Left Content */}
        <div className="z-10 max-w-xl">
          <span className="text-xs font-semibold tracking-wider text-ash uppercase">
            {greeting}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-onyx mt-1 tracking-tight">
            Welcome back, {firstName}! <span className="inline-block">👋</span>
          </h1>
          <p className="text-sm text-ash mt-1">
            Here&apos;s what&apos;s happening with your business today.
          </p>

          {/* Create New ▾ Pill Button with Dropdown */}
          <div className="relative mt-4 inline-block">
            <button
              type="button"
              onClick={() => setCreateNewOpen(!createNewOpen)}
              className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4.5 py-2.5 text-sm font-medium shadow-xs transition cursor-pointer"
            >
              <span>Create New</span>
              <ChevronDown className="h-4 w-4 text-breath" />
            </button>

            {createNewOpen && (
              <div className="absolute left-0 mt-2 w-52 rounded-[10px] border border-pebble bg-white py-1.5 shadow-xl z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setCreateNewOpen(false);
                    router.push("/team");
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-onyx hover:bg-stone transition cursor-pointer"
                >
                  <UserPlus className="h-4 w-4 text-ash" />
                  Add Team Member
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreateNewOpen(false);
                    router.push("/projects");
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-onyx hover:bg-stone transition cursor-pointer"
                >
                  <FolderPlus className="h-4 w-4 text-ash" />
                  New Project
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreateNewOpen(false);
                    router.push("/quotations");
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-onyx hover:bg-stone transition cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-ash" />
                  New Quotation
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Firma Brand Card */}
        <div className="z-10 hidden sm:flex flex-col justify-center rounded-[12px] bg-white/70 backdrop-blur-sm border border-pebble/70 p-4.5 min-w-[210px] shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-onyx uppercase tracking-wider">
              FIRMA
            </span>
            <span className="h-2 w-2 rounded-full bg-forest" />
          </div>
          <p className="text-xs font-semibold text-onyx leading-snug mt-1.5">
            Build Smarter. Together.
          </p>
          <div className="w-6 h-[2px] bg-forest/30 my-2 rounded-full" />
          <p className="text-[11px] text-ash leading-relaxed">
            Turning ambition into real progress.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SIX STAT / KPI METRIC CARDS                                               */}
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
            <span className="text-[11px] font-medium text-ash">
              Team Members
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-onyx leading-tight">
              {teamCount}
            </p>
            <p className="text-[10px] font-medium text-ash mt-1 flex items-center gap-0.5">
              Registered members
            </p>
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
            <span className="text-[11px] font-medium text-ash">
              Active Projects
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-onyx leading-tight">
              8
            </p>
            <p className="text-[10px] font-medium text-complete-status mt-1 flex items-center gap-0.5">
              <span>↗</span> +2 this month
            </p>
          </div>
        </div>

        {/* Card 3: Open Enquiries */}
        <div
          onClick={() => router.push("/quotations")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-hazard-bg text-hazard-text">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-ash">
              Open Enquiries
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-onyx leading-tight">
              14
            </p>
            <p className="text-[10px] font-medium text-delayed-status mt-1 flex items-center gap-0.5">
              <span>↗</span> +6 this week
            </p>
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
            <span className="text-[11px] font-medium text-ash">
              Pending Quotes
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-onyx leading-tight">
              6
            </p>
            <p className="text-[10px] font-medium text-complete-status mt-1 flex items-center gap-0.5">
              <span>↗</span> +2 this week
            </p>
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
            <span className="text-[11px] font-medium text-ash">
              Active Jobs
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-onyx leading-tight">
              10
            </p>
            <p className="text-[10px] font-medium text-complete-status mt-1 flex items-center gap-0.5">
              <span>↗</span> +4 this month
            </p>
          </div>
        </div>

        {/* Card 6: Pending Payments */}
        <div
          onClick={() => router.push("/subscription")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-mist text-onyx font-bold text-xs">
              ₹
            </div>
            <span className="text-[11px] font-medium text-ash">
              Pending Bills
            </span>
          </div>
          <div className="mt-3">
            <p className="text-lg font-bold text-onyx leading-tight">
              ₹2.48L
            </p>
            <p className="text-[10px] font-medium text-delayed-status mt-1 flex items-center gap-0.5">
              <span>↗</span> +12% vs last mo
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MIDDLE ROW: CHARTS & FEATURE PROMO CARD                                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Project Progress (Stacked Bar Chart) */}
        <div className="lg:col-span-5 rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-heading-h3 font-medium text-onyx">
                  Project Progress
                </h2>
                <p className="text-[11px] text-ash mt-0.5">
                  Track milestone distribution across active sites
                </p>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap text-[10px] text-ash">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-complete-status" />
                  Completed
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-sunfleck border border-pebble" />
                  In Progress
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-at-risk-status" />
                  At Risk
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-delayed-status" />
                  Delayed
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div className="h-44 w-full flex items-end">
                <div className="flex flex-col justify-between h-36 text-[9px] text-ash pr-2 select-none">
                  <span>20</span>
                  <span>15</span>
                  <span>10</span>
                  <span>5</span>
                  <span>0</span>
                </div>

                <div className="flex-1 h-36 relative flex items-end justify-between px-2 sm:px-4 border-b border-pebble">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                    <div className="border-b border-dashed border-pebble w-full" />
                    <div className="border-b border-dashed border-pebble w-full" />
                    <div className="border-b border-dashed border-pebble w-full" />
                    <div className="border-b border-dashed border-pebble w-full" />
                    <div className="w-full" />
                  </div>

                  {/* Jan */}
                  <div className="flex flex-col items-center gap-1 z-10 w-6 sm:w-8">
                    <div className="w-full flex flex-col-reverse rounded-t-[4px] overflow-hidden shadow-2xs">
                      <div className="bg-complete-status w-full" style={{ height: "26px" }} />
                      <div className="bg-sunfleck w-full" style={{ height: "20px" }} />
                      <div className="bg-at-risk-status w-full" style={{ height: "18px" }} />
                    </div>
                    <span className="text-[10px] text-ash">Jan</span>
                  </div>

                  {/* Feb */}
                  <div className="flex flex-col items-center gap-1 z-10 w-6 sm:w-8">
                    <div className="w-full flex flex-col-reverse rounded-t-[4px] overflow-hidden shadow-2xs">
                      <div className="bg-complete-status w-full" style={{ height: "32px" }} />
                      <div className="bg-sunfleck w-full" style={{ height: "24px" }} />
                      <div className="bg-at-risk-status w-full" style={{ height: "16px" }} />
                    </div>
                    <span className="text-[10px] text-ash">Feb</span>
                  </div>

                  {/* Mar */}
                  <div className="flex flex-col items-center gap-1 z-10 w-6 sm:w-8">
                    <div className="w-full flex flex-col-reverse rounded-t-[4px] overflow-hidden shadow-2xs">
                      <div className="bg-complete-status w-full" style={{ height: "48px" }} />
                      <div className="bg-sunfleck w-full" style={{ height: "26px" }} />
                      <div className="bg-at-risk-status w-full" style={{ height: "16px" }} />
                      <div className="bg-delayed-status w-full" style={{ height: "10px" }} />
                    </div>
                    <span className="text-[10px] text-ash">Mar</span>
                  </div>

                  {/* Apr */}
                  <div className="flex flex-col items-center gap-1 z-10 w-6 sm:w-8">
                    <div className="w-full flex flex-col-reverse rounded-t-[4px] overflow-hidden shadow-2xs">
                      <div className="bg-complete-status w-full" style={{ height: "40px" }} />
                      <div className="bg-sunfleck w-full" style={{ height: "24px" }} />
                      <div className="bg-at-risk-status w-full" style={{ height: "16px" }} />
                    </div>
                    <span className="text-[10px] text-ash">Apr</span>
                  </div>

                  {/* May */}
                  <div className="flex flex-col items-center gap-1 z-10 w-6 sm:w-8">
                    <div className="w-full flex flex-col-reverse rounded-t-[4px] overflow-hidden shadow-2xs">
                      <div className="bg-complete-status w-full" style={{ height: "30px" }} />
                      <div className="bg-sunfleck w-full" style={{ height: "24px" }} />
                      <div className="bg-at-risk-status w-full" style={{ height: "18px" }} />
                    </div>
                    <span className="text-[10px] text-ash">May</span>
                  </div>

                  {/* Jun */}
                  <div className="flex flex-col items-center gap-1 z-10 w-6 sm:w-8">
                    <div className="w-full flex flex-col-reverse rounded-t-[4px] overflow-hidden shadow-2xs">
                      <div className="bg-complete-status w-full" style={{ height: "54px" }} />
                      <div className="bg-sunfleck w-full" style={{ height: "28px" }} />
                      <div className="bg-at-risk-status w-full" style={{ height: "18px" }} />
                      <div className="bg-delayed-status w-full" style={{ height: "14px" }} />
                    </div>
                    <span className="text-[10px] text-ash">Jun</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Distribution (Donut Chart & Legend) */}
        <div className="lg:col-span-4 rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-heading-h3 font-medium text-onyx">
              Team Distribution
            </h2>
            <p className="text-[11px] text-ash mt-0.5">
              Total 12 team members
            </p>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" stroke="#e6e6e6" strokeWidth="15" fill="transparent" />
                  <circle cx="50" cy="50" r="38" stroke="#181b19" strokeWidth="15" strokeDasharray="59.7 179" strokeDashoffset="0" fill="transparent" />
                  <circle cx="50" cy="50" r="38" stroke="#608164" strokeWidth="15" strokeDasharray="79.5 159" strokeDashoffset="-59.7" fill="transparent" />
                  <circle cx="50" cy="50" r="38" stroke="#f59e0b" strokeWidth="15" strokeDasharray="39.8 199" strokeDashoffset="-139.2" fill="transparent" />
                  <circle cx="50" cy="50" r="38" stroke="#dae4de" strokeWidth="15" strokeDasharray="39.8 199" strokeDashoffset="-179" fill="transparent" />
                  <circle cx="50" cy="50" r="38" stroke="#cdcdcd" strokeWidth="15" strokeDasharray="19.9 218" strokeDashoffset="-218.8" fill="transparent" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-onyx leading-none">12</span>
                  <span className="text-[9px] font-medium text-ash mt-0.5">Members</span>
                </div>
              </div>

              <div className="space-y-2 text-xs flex-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-onyx">
                    <span className="h-2 w-2 rounded-full bg-onyx" />
                    Sales Manager
                  </span>
                  <span className="font-bold text-onyx">3</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-onyx">
                    <span className="h-2 w-2 rounded-full bg-breath border border-pebble" />
                    Project Manager
                  </span>
                  <span className="font-bold text-onyx">2</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-onyx">
                    <span className="h-2 w-2 rounded-full bg-complete-status" />
                    Field Worker
                  </span>
                  <span className="font-bold text-onyx">4</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-onyx">
                    <span className="h-2 w-2 rounded-full bg-caution" />
                    Finance Manager
                  </span>
                  <span className="font-bold text-onyx">2</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-onyx">
                    <span className="h-2 w-2 rounded-full bg-pebble" />
                    Account Admin
                  </span>
                  <span className="font-bold text-onyx">1</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Promo Card ("Better teams. Brighter tomorrows.") */}
        <div className="lg:col-span-3 rounded-[10px] bg-bark p-5 text-white relative overflow-hidden flex flex-col justify-between min-h-[200px] shadow-sm group">
          <div className="relative z-10">
            <h3 className="text-base font-bold text-white leading-snug tracking-tight">
              Better
              <br />
              teams.
              <br />
              Stronger
              <br />
              projects.
            </h3>
          </div>

          <div className="relative z-10 flex justify-end">
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
      {/* BOTTOM ROW: RECENT ACTIVITIES, UPCOMING TASKS, PLAN & SUBSCRIPTION         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activities */}
        <div className="rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-heading-h3 font-medium text-onyx">
                Recent Activities
              </h2>
              <button
                type="button"
                onClick={() => router.push("/reports")}
                className="text-[11px] font-medium text-ash hover:text-onyx transition cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-clear-bg text-success-text shrink-0">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-onyx leading-tight">
                      Team Role Updated
                    </p>
                    <p className="text-[11px] text-ash">
                      Account permissions configured
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-ash shrink-0">
                  Just now
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-sunfleck text-onyx shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-onyx leading-tight">
                      New project &quot;Riverside Apartments&quot; created
                    </p>
                    <p className="text-[11px] text-ash">
                      by Amit Kumar
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-ash shrink-0">
                  2h ago
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-breath text-onyx shrink-0">
                    <FileCheck2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-onyx leading-tight">
                      Quotation #Q-1023 sent
                    </p>
                    <p className="text-[11px] text-ash">
                      to GreenBuild Ltd.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-ash shrink-0">
                  5h ago
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-clear-bg text-success-text shrink-0">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-onyx leading-tight">
                      Payment of ₹75,000 received
                    </p>
                    <p className="text-[11px] text-ash">
                      from Horizon Infra
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-ash shrink-0">
                  1d ago
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-mist text-onyx shrink-0">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-onyx leading-tight">
                      Ravi Patel marked a job as completed
                    </p>
                    <p className="text-[11px] text-ash">
                      Site Visit – Sector 62
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-ash shrink-0">
                  1d ago
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-heading-h3 font-medium text-onyx">
                Upcoming Tasks
              </h2>
              <button
                type="button"
                onClick={() => router.push("/jobs")}
                className="text-[11px] font-medium text-ash hover:text-onyx transition cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center justify-between gap-2 p-1.5 rounded-[6px] hover:bg-stone transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      className="text-ash hover:text-onyx shrink-0 cursor-pointer"
                    >
                      {task.completed ? (
                        <CheckSquare className="h-4 w-4 text-complete-status" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                    <span
                      className={`text-xs truncate ${
                        task.completed
                          ? "line-through text-ash"
                          : "font-medium text-onyx"
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-ash">
                      {task.due}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-[4px] ${task.priorityColor}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plan & Subscription Card */}
        <div className="rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-heading-h3 font-medium text-onyx">
                Plan &amp; Subscription
              </h2>
              <button
                type="button"
                onClick={() => router.push("/subscription")}
                className="rounded-[6px] border border-pebble px-2.5 py-1 text-[11px] font-semibold text-onyx hover:bg-stone transition cursor-pointer"
              >
                Manage Plan
              </button>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-onyx">
                  {currentPlan} Plan
                </span>
                <span className="rounded-[4px] bg-clear-bg px-2 py-0.5 text-[10px] font-bold text-success-text">
                  Active
                </span>
              </div>

              <p className="mt-2 text-2xl font-bold text-onyx">
                ₹4,999 / year
              </p>
              <p className="text-[10px] font-medium text-ash mt-0.5">
                Valid till 26 May 2026
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-onyx">
                  <Check className="h-3.5 w-3.5 text-complete-status shrink-0 stroke-[2.5]" />
                  <span className="text-[11px]">Up to 50 team members</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-onyx">
                  <Check className="h-3.5 w-3.5 text-complete-status shrink-0 stroke-[2.5]" />
                  <span className="text-[11px]">Project management</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-onyx">
                  <Check className="h-3.5 w-3.5 text-complete-status shrink-0 stroke-[2.5]" />
                  <span className="text-[11px]">Basic reporting</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-onyx">
                  <Check className="h-3.5 w-3.5 text-complete-status shrink-0 stroke-[2.5]" />
                  <span className="text-[11px]">Email support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}