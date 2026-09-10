"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

  // Interactive Tasks State
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Review quotation for Metro Heights",
      due: "Today",
      priority: "High",
      priorityColor: "bg-rose-50 text-rose-600 border border-rose-100",
      completed: false,
    },
    {
      id: 2,
      title: "Team meeting with project managers",
      due: "Today",
      priority: "Medium",
      priorityColor: "bg-amber-50 text-amber-700 border border-amber-100",
      completed: false,
    },
    {
      id: 3,
      title: "Approve new user requests",
      due: "Tomorrow",
      priority: "Medium",
      priorityColor: "bg-amber-50 text-amber-700 border border-amber-100",
      completed: false,
    },
    {
      id: 4,
      title: "Client call – GreenBuild Ltd.",
      due: "Tomorrow",
      priority: "Low",
      priorityColor: "bg-emerald-50 text-emerald-700 border border-emerald-100",
      completed: false,
    },
    {
      id: 5,
      title: "Monthly report review",
      due: "28 May",
      priority: "Low",
      priorityColor: "bg-emerald-50 text-emerald-700 border border-emerald-100",
      completed: false,
    },
  ]);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const user = currentUser || {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@abcsolutions.com",
    role: "OWNER",
    size: 0,
  };

  const firstName = user.name?.split(" ")[0] || "Rahul";

  // Data Fetching Logic Preserved
  useEffect(() => {
    async function loadData() {
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
      <div className="rounded-3xl bg-[#EDEAE4] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xs mt-4">
        {/* Left Content */}
        <div className="z-10 max-w-md">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            {greeting}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight flex items-center gap-2">
            Welcome back, {firstName}!
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Here&apos;s what&apos;s happening with your business today.
          </p>

          {/* Create New ▾ Pill Button with Dropdown */}
          <div className="relative mt-5 inline-block">
            <button
              type="button"
              onClick={() => setCreateNewOpen(!createNewOpen)}
              className="flex items-center gap-2 rounded-xl bg-[#182E25] hover:bg-[#12231B] text-white px-4 py-2.5 text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <span>Create New</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-300" />
            </button>

            {createNewOpen && (
              <div className="absolute left-0 mt-2 w-48 rounded-xl border border-slate-100 bg-white py-1.5 shadow-xl z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setCreateNewOpen(false);
                    router.push("/team");
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5 text-slate-500" />
                  Add Team Member
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreateNewOpen(false);
                    router.push("/projects");
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <FolderPlus className="h-3.5 w-3.5 text-slate-500" />
                  New Project
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreateNewOpen(false);
                    router.push("/quotations");
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 text-slate-500" />
                  New Quotation
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Architectural Visual & Branding */}
        <div className="flex items-center gap-6 z-10 self-end md:self-center">
          <div className="relative w-48 sm:w-60 h-36 sm:h-40 rounded-2xl overflow-hidden shadow-md">
            <Image
              src="/images/architecture_hero.jpg"
              alt="Modern Architecture FIRMA"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="hidden sm:block text-left">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              FIRMA
            </h3>
            <p className="text-xs font-semibold text-slate-700 leading-tight mt-0.5">
              Build Smarter.
              <br />
              Together.
            </p>
            <p className="text-[11px] text-slate-500 mt-3 leading-snug max-w-[120px]">
              Turning ambition into real progress.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SIX STAT / KPI METRIC CARDS                                               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Team Members */}
        <div
          onClick={() => router.push("/team")}
          className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F4EA] text-[#2E7D32]">
              <Users className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              Team Members
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-slate-900 leading-tight">
              12
            </p>
            <p className="text-[10px] font-medium text-emerald-600 mt-1 flex items-center gap-0.5">
              <span>↗</span> +2 this month
            </p>
          </div>
        </div>

        {/* Card 2: Active Projects */}
        <div
          onClick={() => router.push("/projects")}
          className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF7E2] text-[#C98A19]">
              <FolderKanban className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              Active Projects
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-slate-900 leading-tight">
              8
            </p>
            <p className="text-[10px] font-medium text-emerald-600 mt-1 flex items-center gap-0.5">
              <span>↗</span> +2 this month
            </p>
          </div>
        </div>

        {/* Card 3: Open Enquiries */}
        <div
          onClick={() => router.push("/quotations")}
          className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FCE8E6] text-[#D84A38]">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              Open Enquiries
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-slate-900 leading-tight">
              14
            </p>
            <p className="text-[10px] font-medium text-rose-500 mt-1 flex items-center gap-0.5">
              <span>↗</span> +6 this week
            </p>
          </div>
        </div>

        {/* Card 4: Pending Quotations */}
        <div
          onClick={() => router.push("/quotations")}
          className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0E5] text-[#D46E2A]">
              <FileCheck2 className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              Pending Quotations
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-slate-900 leading-tight">
              6
            </p>
            <p className="text-[10px] font-medium text-emerald-600 mt-1 flex items-center gap-0.5">
              <span>↗</span> +2 this week
            </p>
          </div>
        </div>

        {/* Card 5: Active Jobs */}
        <div
          onClick={() => router.push("/jobs")}
          className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#2E7D32]">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              Active Jobs
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-slate-900 leading-tight">
              10
            </p>
            <p className="text-[10px] font-medium text-emerald-600 mt-1 flex items-center gap-0.5">
              <span>↗</span> +4 this month
            </p>
          </div>
        </div>

        {/* Card 6: Pending Payments */}
        <div
          onClick={() => router.push("/subscription")}
          className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDEFE7] text-[#D35B20] font-bold text-sm">
              ₹
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              Pending Payments
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xl font-extrabold text-slate-900 leading-tight">
              ₹2,48,000
            </p>
            <p className="text-[10px] font-medium text-rose-500 mt-1 flex items-center gap-0.5">
              <span>↗</span> +12% from last month
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MIDDLE ROW: CHARTS & FEATURE PROMO CARD                                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Project Progress (Stacked Bar Chart) */}
        <div className="lg:col-span-5 rounded-2xl bg-white p-5 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Project Progress
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Track the status of your projects
                </p>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#418654]" />
                  Completed
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#EAB340]" />
                  In Progress
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#E06A3B]" />
                  At Risk
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#C84334]" />
                  Delayed
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div className="h-44 w-full flex items-end">
                <div className="flex flex-col justify-between h-36 text-[9px] text-slate-400 pr-2 select-none">
                  <span>20</span>
                  <span>15</span>
                  <span>10</span>
                  <span>5</span>
                  <span>0</span>
                </div>

                <div className="flex-1 h-36 relative flex items-end justify-between px-2 sm:px-4 border-b border-slate-200">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                    <div className="border-b border-dashed border-slate-200 w-full" />
                    <div className="border-b border-dashed border-slate-200 w-full" />
                    <div className="border-b border-dashed border-slate-200 w-full" />
                    <div className="border-b border-dashed border-slate-200 w-full" />
                    <div className="w-full" />
                  </div>

                  {/* Jan */}
                  <div className="flex flex-col items-center gap-1 z-10 w-6 sm:w-8">
                    <div className="w-full flex flex-col-reverse rounded-t-sm overflow-hidden shadow-2xs">
                      <div className="bg-[#418654] w-full" style={{ height: "26px" }} />
                      <div className="bg-[#EAB340] w-full" style={{ height: "20px" }} />
                      <div className="bg-[#E06A3B] w-full" style={{ height: "18px" }} />
                    </div>
                    <span className="text-[10px] text-slate-400">Jan</span>
                  </div>

                  {/* Feb */}
                  <div className="flex flex-col items-center gap-1 z-10 w-6 sm:w-8">
                    <div className="w-full flex flex-col-reverse rounded-t-sm overflow-hidden shadow-2xs">
                      <div className="bg-[#418654] w-full" style={{ height: "32px" }} />
                      <div className="bg-[#EAB340] w-full" style={{ height: "24px" }} />
                      <div className="bg-[#E06A3B] w-full" style={{ height: "16px" }} />
                    </div>
                    <span className="text-[10px] text-slate-400">Feb</span>
                  </div>

                  {/* Mar */}
                  <div className="flex flex-col items-center gap-1 z-10 w-6 sm:w-8">
                    <div className="w-full flex flex-col-reverse rounded-t-sm overflow-hidden shadow-2xs">
                      <div className="bg-[#418654] w-full" style={{ height: "48px" }} />
                      <div className="bg-[#EAB340] w-full" style={{ height: "26px" }} />
                      <div className="bg-[#E06A3B] w-full" style={{ height: "16px" }} />
                      <div className="bg-[#C84334] w-full" style={{ height: "10px" }} />
                    </div>
                    <span className="text-[10px] text-slate-400">Mar</span>
                  </div>

                  {/* Apr */}
                  <div className="flex flex-col items-center gap-1 z-10 w-6 sm:w-8">
                    <div className="w-full flex flex-col-reverse rounded-t-sm overflow-hidden shadow-2xs">
                      <div className="bg-[#418654] w-full" style={{ height: "40px" }} />
                      <div className="bg-[#EAB340] w-full" style={{ height: "24px" }} />
                      <div className="bg-[#E06A3B] w-full" style={{ height: "16px" }} />
                    </div>
                    <span className="text-[10px] text-slate-400">Apr</span>
                  </div>

                  {/* May */}
                  <div className="flex flex-col items-center gap-1 z-10 w-6 sm:w-8">
                    <div className="w-full flex flex-col-reverse rounded-t-sm overflow-hidden shadow-2xs">
                      <div className="bg-[#418654] w-full" style={{ height: "30px" }} />
                      <div className="bg-[#EAB340] w-full" style={{ height: "24px" }} />
                      <div className="bg-[#E06A3B] w-full" style={{ height: "18px" }} />
                    </div>
                    <span className="text-[10px] text-slate-400">May</span>
                  </div>

                  {/* Jun */}
                  <div className="flex flex-col items-center gap-1 z-10 w-6 sm:w-8">
                    <div className="w-full flex flex-col-reverse rounded-t-sm overflow-hidden shadow-2xs">
                      <div className="bg-[#418654] w-full" style={{ height: "54px" }} />
                      <div className="bg-[#EAB340] w-full" style={{ height: "28px" }} />
                      <div className="bg-[#E06A3B] w-full" style={{ height: "18px" }} />
                      <div className="bg-[#C84334] w-full" style={{ height: "14px" }} />
                    </div>
                    <span className="text-[10px] text-slate-400">Jun</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Distribution (Donut Chart & Legend) */}
        <div className="lg:col-span-4 rounded-2xl bg-white p-5 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Team Distribution
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Total 12 team members
            </p>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" stroke="#F1F5F2" strokeWidth="15" fill="transparent" />
                  <circle cx="50" cy="50" r="38" stroke="#183D2D" strokeWidth="15" strokeDasharray="59.7 179" strokeDashoffset="0" fill="transparent" />
                  <circle cx="50" cy="50" r="38" stroke="#4E8F67" strokeWidth="15" strokeDasharray="79.5 159" strokeDashoffset="-59.7" fill="transparent" />
                  <circle cx="50" cy="50" r="38" stroke="#F3C044" strokeWidth="15" strokeDasharray="39.8 199" strokeDashoffset="-139.2" fill="transparent" />
                  <circle cx="50" cy="50" r="38" stroke="#7FA88B" strokeWidth="15" strokeDasharray="39.8 199" strokeDashoffset="-179" fill="transparent" />
                  <circle cx="50" cy="50" r="38" stroke="#CAD2CC" strokeWidth="15" strokeDasharray="19.9 218" strokeDashoffset="-218.8" fill="transparent" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-slate-900 leading-none">12</span>
                  <span className="text-[9px] font-medium text-slate-400 mt-0.5">Members</span>
                </div>
              </div>

              <div className="space-y-2 text-xs flex-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-[#183D2D]" />
                    Sales Manager
                  </span>
                  <span className="font-bold text-slate-900">3</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-[#7FA88B]" />
                    Project Manager
                  </span>
                  <span className="font-bold text-slate-900">2</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-[#4E8F67]" />
                    Field Worker
                  </span>
                  <span className="font-bold text-slate-900">4</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-[#F3C044]" />
                    Finance Manager
                  </span>
                  <span className="font-bold text-slate-900">2</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-[#CAD2CC]" />
                    Account Admin
                  </span>
                  <span className="font-bold text-slate-900">1</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Promo Card ("Better teams. Brighter tomorrows.") */}
        <div className="lg:col-span-3 rounded-2xl bg-[#182F24] p-5 text-white relative overflow-hidden flex flex-col justify-between min-h-[200px] shadow-sm group">
          <div className="absolute inset-0 pointer-events-none opacity-45">
            <Image
              src="/images/tropical_leaf.jpg"
              alt="Tropical Monstera Leaf"
              fill
              className="object-cover"
            />
          </div>

          <div className="relative z-10">
            <h3 className="text-base font-bold text-white leading-snug tracking-tight">
              Better
              <br />
              teams.
              <br />
              Brighter
              <br />
              tomorrows.
            </h3>
          </div>

          <div className="relative z-10 flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/team")}
              className="w-8 h-8 rounded-full bg-white text-[#182F24] flex items-center justify-center hover:scale-110 transition shadow-md cursor-pointer"
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
        <div className="rounded-2xl bg-white p-5 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Recent Activities
              </h2>
              <button
                type="button"
                onClick={() => router.push("/reports")}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-900 transition cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E6F4EA] text-[#2E7D32] shrink-0">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      Pooja Verma
                    </p>
                    <p className="text-[11px] text-slate-400">
                      New account admin added
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  Just now
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FEF7E2] text-[#C98A19] shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      New project &quot;Riverside Apartments&quot; created
                    </p>
                    <p className="text-[11px] text-slate-400">
                      by Amit Kumar
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  2h ago
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F4ECFF] text-[#8244E3] shrink-0">
                    <FileCheck2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      Quotation #Q-1023 sent
                    </p>
                    <p className="text-[11px] text-slate-400">
                      to GreenBuild Ltd.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  5h ago
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#2E7D32] shrink-0">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      Payment of ₹75,000 received
                    </p>
                    <p className="text-[11px] text-slate-400">
                      from Horizon Infra
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  1d ago
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E6F3FB] text-[#257AB9] shrink-0">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      Ravi Patel marked a job as completed
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Site Visit – Sector 62
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  1d ago
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Upcoming Tasks
              </h2>
              <button
                type="button"
                onClick={() => router.push("/jobs")}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-900 transition cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
                    >
                      {task.completed ? (
                        <CheckSquare className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                    <span
                      className={`text-xs text-slate-700 truncate ${
                        task.completed
                          ? "line-through text-slate-400"
                          : "font-medium"
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400">
                      {task.due}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${task.priorityColor}`}
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
        <div className="rounded-2xl bg-white p-5 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 top-12 w-28 pointer-events-none opacity-80">
            <Image
              src="/images/subscription_branch.jpg"
              alt="Botanical branch"
              fill
              className="object-contain object-right-bottom mix-blend-multiply"
            />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Plan &amp; Subscription
              </h2>
              <button
                type="button"
                onClick={() => router.push("/subscription")}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Manage Plan
              </button>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {currentPlan} Plan
                </span>
                <span className="rounded-full bg-[#E6F4EA] px-2 py-0.5 text-[10px] font-bold text-[#2E7D32]">
                  Active
                </span>
              </div>

              <p className="mt-2 text-xl font-black text-slate-900">
                ₹4,999 / year
              </p>
              <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                Valid till 26 May 2026
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Check className="h-3.5 w-3.5 text-[#2E7D32] shrink-0 stroke-[2.5]" />
                  <span className="text-[11px]">Up to 50 team members</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Check className="h-3.5 w-3.5 text-[#2E7D32] shrink-0 stroke-[2.5]" />
                  <span className="text-[11px]">Project management</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Check className="h-3.5 w-3.5 text-[#2E7D32] shrink-0 stroke-[2.5]" />
                  <span className="text-[11px]">Basic reporting</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Check className="h-3.5 w-3.5 text-[#2E7D32] shrink-0 stroke-[2.5]" />
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