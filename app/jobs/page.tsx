"use client";

import { useState } from "react";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  Briefcase,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Square,
  CheckSquare,
  MapPin,
  User,
  Calendar,
} from "lucide-react";

export default function JobsPage() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [jobs, setJobs] = useState([
    {
      id: "JOB-401",
      title: "Site Visit – Sector 62 Foundation Inspection",
      location: "Riverside Apartments, Sector 62",
      assignee: "Ravi Patel",
      priority: "High",
      priorityColor: "bg-rose-50 text-rose-600 border-rose-100",
      due: "Today",
      completed: false,
    },
    {
      id: "JOB-402",
      title: "Plumbing & Drainage Pressure Leak Test",
      location: "Metro Heights Plaza, Andheri",
      assignee: "Suresh Meena",
      priority: "Medium",
      priorityColor: "bg-amber-50 text-amber-700 border-amber-100",
      due: "Today",
      completed: false,
    },
    {
      id: "JOB-403",
      title: "Electrical Conduiting Quality Audit – Floor 4",
      location: "GreenBuild Tower, Whitefield",
      assignee: "Deepak Yadav",
      priority: "Low",
      priorityColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
      due: "Tomorrow",
      completed: false,
    },
    {
      id: "JOB-404",
      title: "Concrete Slab Curing Inspection – Block B",
      location: "Apex Horizon, Sector 137",
      assignee: "Manoj Kumar",
      priority: "High",
      priorityColor: "bg-rose-50 text-rose-600 border-rose-100",
      due: "Tomorrow",
      completed: false,
    },
    {
      id: "JOB-405",
      title: "HVAC Duct Alignment & Ceiling Clearance Check",
      location: "Silver Oaks Community, Pune",
      assignee: "Ravi Patel",
      priority: "Medium",
      priorityColor: "bg-amber-50 text-amber-700 border-amber-100",
      due: "28 May",
      completed: false,
    },
    {
      id: "JOB-406",
      title: "Safety Netting & Scaffolding Certification",
      location: "Skyline Logistics Hub, Manesar",
      assignee: "Suresh Meena",
      priority: "High",
      priorityColor: "bg-rose-50 text-rose-600 border-rose-100",
      due: "29 May",
      completed: true,
    },
  ]);

  const toggleJob = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, completed: !j.completed } : j))
    );
  };

  const filtered = jobs.filter((j) => {
    const matchSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.assignee.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase());
    const matchPriority = filter === "ALL" || j.priority === filter;
    return matchSearch && matchPriority;
  });

  const completedCount = jobs.filter((j) => j.completed).length;
  const activeCount = jobs.filter((j) => !j.completed).length;

  return (
    <FirmaLayout activeNav="Jobs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pb-2">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            FIELD &amp; SITE OPERATIONS
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight flex items-center gap-2">
            Active Jobs &amp; Work Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Coordinate field technicians, schedule site visits, and track daily inspection tasks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Dispatch new job dialog opening...")}
          className="flex items-center gap-2 rounded-xl bg-[#182E25] hover:bg-[#12231B] text-white px-4 py-2 text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Dispatch Job</span>
        </button>
      </div>

      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#2E7D32]">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400">Total Work Orders</span>
            <p className="text-2xl font-extrabold text-slate-900">10</p>
            <p className="text-[10px] font-medium text-emerald-600 mt-0.5">↗ +4 this month</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FEF7E2] text-[#C98A19]">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400">In Progress On Site</span>
            <p className="text-2xl font-extrabold text-slate-900">{activeCount}</p>
            <p className="text-[10px] font-medium text-slate-500 mt-0.5">Pending completion</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EA] text-[#2E7D32]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400">Completed Deliveries</span>
            <p className="text-2xl font-extrabold text-slate-900">{completedCount}</p>
            <p className="text-[10px] font-medium text-emerald-600 mt-0.5">Signed off</p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { key: "ALL", label: "All Jobs" },
            { key: "High", label: "High Priority" },
            { key: "Medium", label: "Medium" },
            { key: "Low", label: "Low" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                filter === tab.key
                  ? "bg-[#182E25] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search job or assignee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-[#182E25] focus:bg-white transition"
          />
        </div>
      </div>

      {/* Jobs Task List */}
      <div className="rounded-2xl bg-white p-5 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleJob(item.id)}
            className={`flex items-center justify-between gap-4 p-3.5 rounded-xl border transition cursor-pointer ${
              item.completed
                ? "bg-slate-50/70 border-slate-200/60 opacity-60"
                : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
              >
                {item.completed ? (
                  <CheckSquare className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Square className="h-5 w-5 text-slate-400" />
                )}
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {item.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${item.priorityColor}`}
                  >
                    {item.priority}
                  </span>
                </div>
                <h3
                  className={`text-xs mt-0.5 truncate ${
                    item.completed
                      ? "line-through text-slate-400"
                      : "font-bold text-slate-900"
                  }`}
                >
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" /> {item.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 text-right">
              <div className="hidden sm:block">
                <span className="text-[10px] text-slate-400 block">Assigned To</span>
                <span className="text-xs font-semibold text-slate-700">
                  {item.assignee}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-medium text-slate-600">
                {item.due}
              </div>
            </div>
          </div>
        ))}
      </div>
    </FirmaLayout>
  );
}