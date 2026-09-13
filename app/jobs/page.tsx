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
      priorityColor: "bg-hazard-bg text-hazard-text border-pebble",
      due: "Today",
      completed: false,
    },
    {
      id: "JOB-402",
      title: "Plumbing & Drainage Pressure Leak Test",
      location: "Metro Heights Plaza, Andheri",
      assignee: "Suresh Meena",
      priority: "Medium",
      priorityColor: "bg-caution-bg text-caution-text border-pebble",
      due: "Today",
      completed: false,
    },
    {
      id: "JOB-403",
      title: "Electrical Conduiting Quality Audit – Floor 4",
      location: "GreenBuild Tower, Whitefield",
      assignee: "Deepak Yadav",
      priority: "Low",
      priorityColor: "bg-clear-bg text-success-text border-pebble",
      due: "Tomorrow",
      completed: false,
    },
    {
      id: "JOB-404",
      title: "Concrete Slab Curing Inspection – Block B",
      location: "Apex Horizon, Sector 137",
      assignee: "Manoj Kumar",
      priority: "High",
      priorityColor: "bg-hazard-bg text-hazard-text border-pebble",
      due: "Tomorrow",
      completed: false,
    },
    {
      id: "JOB-405",
      title: "HVAC Duct Alignment & Ceiling Clearance Check",
      location: "Silver Oaks Community, Pune",
      assignee: "Ravi Patel",
      priority: "Medium",
      priorityColor: "bg-caution-bg text-caution-text border-pebble",
      due: "28 May",
      completed: false,
    },
    {
      id: "JOB-406",
      title: "Safety Netting & Scaffolding Certification",
      location: "Skyline Logistics Hub, Manesar",
      assignee: "Suresh Meena",
      priority: "High",
      priorityColor: "bg-hazard-bg text-hazard-text border-pebble",
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
          <span className="text-eyebrow font-semibold tracking-wider text-ash uppercase">
            FIELD &amp; SITE OPERATIONS
          </span>
          <h1 className="text-display-h1 font-bold text-onyx mt-0.5 tracking-tight flex items-center gap-2">
            Active Jobs &amp; Work Orders
          </h1>
          <p className="text-body text-ash mt-1">
            Coordinate field technicians, schedule site visits, and track daily inspection tasks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Dispatch new job dialog opening...")}
          className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4.5 py-2.5 text-sm font-medium shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Dispatch Job</span>
        </button>
      </div>

      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[10px] bg-white p-4.5 border border-pebble flex items-center gap-3.5 shadow-2xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-breath text-onyx">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-ash">Total Work Orders</span>
            <p className="text-2xl font-bold text-onyx">10</p>
            <p className="text-xs font-medium text-success-text mt-0.5">↗ +4 this month</p>
          </div>
        </div>

        <div className="rounded-[10px] bg-white p-4.5 border border-pebble flex items-center gap-3.5 shadow-2xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-caution-bg text-caution-text">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-ash">Active Site Work</span>
            <p className="text-2xl font-bold text-onyx">4</p>
            <p className="text-xs font-medium text-caution-text mt-0.5">In execution today</p>
          </div>
        </div>

        <div className="rounded-[10px] bg-white p-4.5 border border-pebble flex items-center gap-3.5 shadow-2xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-clear-bg text-success-text">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-ash">Completed &amp; Signed</span>
            <p className="text-2xl font-bold text-onyx">6</p>
            <p className="text-xs font-medium text-success-text mt-0.5">All sign-offs acquired</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-[10px] bg-white p-3 border border-pebble flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { key: "ALL", label: "All Jobs" },
            { key: "SCHEDULED", label: "Scheduled" },
            { key: "IN_PROGRESS", label: "In Progress" },
            { key: "COMPLETED", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3.5 py-2 rounded-[10px] text-sm font-medium transition cursor-pointer shrink-0 ${
                filter === tab.key
                  ? "bg-forest text-white shadow-xs"
                  : "bg-stone text-ash hover:bg-mist hover:text-onyx"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="h-3.5 w-3.5 text-ash absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search job or assignee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-body text-onyx placeholder:text-ash bg-stone rounded-[10px] border border-pebble outline-none focus:border-onyx transition"
          />
        </div>
      </div>

      {/* Jobs Task List */}
      <div className="rounded-[10px] bg-white p-5 border border-pebble space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleJob(item.id)}
            className={`flex items-center justify-between gap-4 p-3.5 rounded-[10px] border transition cursor-pointer ${
              item.completed
                ? "bg-stone/60 border-pebble opacity-60"
                : "bg-white border-pebble hover:border-onyx"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                className="text-ash hover:text-onyx shrink-0 cursor-pointer"
              >
                {item.completed ? (
                  <CheckSquare className="h-5 w-5 text-complete-status" />
                ) : (
                  <Square className="h-5 w-5 text-ash" />
                )}
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-eyebrow font-bold text-ash uppercase">
                    {item.id}
                  </span>
                  <span
                    className={`text-eyebrow font-semibold px-2 py-0.5 rounded-full border ${item.priorityColor}`}
                  >
                    {item.priority}
                  </span>
                </div>
                <h3
                  className={`text-body mt-0.5 truncate ${
                    item.completed
                      ? "line-through text-ash"
                      : "font-bold text-onyx"
                  }`}
                >
                  {item.title}
                </h3>
                <p className="text-eyebrow text-ash flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" /> {item.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 text-right">
              <div className="hidden sm:block">
                <span className="text-eyebrow text-ash block">Assigned To</span>
                <span className="text-body font-semibold text-onyx">
                  {item.assignee}
                </span>
              </div>
              <div className="bg-stone border border-pebble px-2.5 py-1 rounded-[6px] text-eyebrow font-medium text-onyx">
                {item.due}
              </div>
            </div>
          </div>
        ))}
      </div>
    </FirmaLayout>
  );
}