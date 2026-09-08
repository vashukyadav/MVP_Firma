"use client";

import { useState } from "react";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Calendar,
  IndianRupee,
  ChevronRight,
  User,
} from "lucide-react";

export default function ProjectsPage() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const projects = [
    {
      id: "PRJ-101",
      name: "Riverside Apartments",
      location: "Sector 62, Gurgaon",
      client: "Horizon Infra Pvt. Ltd.",
      budget: "₹45,00,000",
      progress: 75,
      status: "IN_PROGRESS",
      lead: "Amit Kumar",
      due: "15 Oct 2026",
    },
    {
      id: "PRJ-102",
      name: "Metro Heights Plaza",
      location: "Andheri East, Mumbai",
      client: "Metro Realty Group",
      budget: "₹1,20,00,000",
      progress: 40,
      status: "AT_RISK",
      lead: "Rajesh Joshi",
      due: "28 Dec 2026",
    },
    {
      id: "PRJ-103",
      name: "GreenBuild Commercial Tower",
      location: "Whitefield, Bangalore",
      client: "GreenBuild Ltd.",
      budget: "₹85,00,000",
      progress: 90,
      status: "IN_PROGRESS",
      lead: "Ananya Roy",
      due: "30 Sep 2026",
    },
    {
      id: "PRJ-104",
      name: "Apex Horizon Residences",
      location: "Noida Expressway, Sector 137",
      client: "Apex Developers",
      budget: "₹60,00,000",
      progress: 100,
      status: "COMPLETED",
      lead: "Pooja Verma",
      due: "Finished Aug 2026",
    },
    {
      id: "PRJ-105",
      name: "Silver Oaks Villa Community",
      location: "Baner Hills, Pune",
      client: "Silverline Properties",
      budget: "₹38,00,000",
      progress: 25,
      status: "IN_PROGRESS",
      lead: "Rajesh Joshi",
      due: "14 Feb 2027",
    },
    {
      id: "PRJ-106",
      name: "Skyline Logistics Hub",
      location: "Manesar, Haryana",
      client: "Skyline Freight Solutions",
      budget: "₹95,00,000",
      progress: 60,
      status: "IN_PROGRESS",
      lead: "Vikram Singh",
      due: "10 Nov 2026",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return {
          label: "Completed",
          color: "bg-[#E6F4EA] text-[#2E7D32] border-[#C8E6C9]",
        };
      case "IN_PROGRESS":
        return {
          label: "In Progress",
          color: "bg-[#FEF7E2] text-[#C98A19] border-[#FBECC5]",
        };
      case "AT_RISK":
        return {
          label: "At Risk",
          color: "bg-[#FCE8E6] text-[#D84A38] border-[#FAD2CF]",
        };
      default:
        return {
          label: status,
          color: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  };

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === "ALL" || p.status === filter;
    return matchSearch && matchStatus;
  });

  return (
    <FirmaLayout activeNav="Projects">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pb-2">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            PROJECT MANAGEMENT
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight flex items-center gap-2">
            Active Projects
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor real-time progress, budgets, deadlines, and on-site milestones.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("New project creation wizard opening...")}
          className="flex items-center gap-2 rounded-xl bg-[#182E25] hover:bg-[#12231B] text-white px-4 py-2 text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-medium text-slate-400">Total Projects</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">8</p>
          <p className="text-[10px] font-medium text-emerald-600 mt-1">↗ +2 this month</p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-medium text-slate-400">In Progress</span>
          <p className="text-2xl font-extrabold text-[#C98A19] mt-1">5</p>
          <p className="text-[10px] font-medium text-slate-500 mt-1">Active on-site</p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-medium text-slate-400">Completed</span>
          <p className="text-2xl font-extrabold text-[#2E7D32] mt-1">12</p>
          <p className="text-[10px] font-medium text-slate-500 mt-1">Delivered on time</p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-medium text-slate-400">At Risk / Delayed</span>
          <p className="text-2xl font-extrabold text-[#D84A38] mt-1">2</p>
          <p className="text-[10px] font-medium text-rose-500 mt-1">Needs attention</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { key: "ALL", label: "All Projects" },
            { key: "IN_PROGRESS", label: "In Progress" },
            { key: "AT_RISK", label: "At Risk" },
            { key: "COMPLETED", label: "Completed" },
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
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-[#182E25] focus:bg-white transition"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => {
          const badge = getStatusBadge(item.status);
          return (
            <div
              key={item.id}
              className="rounded-2xl bg-white p-5 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {item.id}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-[#182E25] transition">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{item.location}</p>
                <p className="text-[11px] text-slate-600 mt-1 font-medium">
                  Client: {item.client}
                </p>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Completion</span>
                    <span className="font-bold text-slate-900">{item.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.status === "COMPLETED"
                          ? "bg-[#2E7D32]"
                          : item.status === "AT_RISK"
                          ? "bg-[#D84A38]"
                          : "bg-[#182E25]"
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Budget</span>
                  <span className="font-bold text-slate-900">{item.budget}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Project Lead</span>
                  <span className="font-medium text-slate-700">{item.lead}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </FirmaLayout>
  );
}