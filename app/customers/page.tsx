"use client";

import { useState } from "react";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  Layers,
  Plus,
  Search,
  Building,
  Mail,
  Phone,
  FolderKanban,
  CheckCircle2,
  Clock,
  MoreVertical,
} from "lucide-react";

export default function CustomersPage() {
  const [search, setSearch] = useState("");

  const customers = [
    {
      id: "CST-01",
      name: "Horizon Infra Pvt. Ltd.",
      type: "Commercial Developer",
      contactPerson: "Vikram Verma",
      email: "contact@horizoninfra.com",
      phone: "+91 98201 44521",
      activeProjects: 3,
      totalBilled: "₹1,45,00,000",
      status: "Active",
    },
    {
      id: "CST-02",
      name: "GreenBuild Ltd.",
      type: "Eco Architecture & Engineering",
      contactPerson: "Sarah Alston",
      email: "contracts@greenbuild.com",
      phone: "+91 98110 33412",
      activeProjects: 2,
      totalBilled: "₹85,00,000",
      status: "Active",
    },
    {
      id: "CST-03",
      name: "Metro Realty Group",
      type: "Urban Infrastructure",
      contactPerson: "Karan Malhotra",
      email: "karan@metrorealty.in",
      phone: "+91 99200 88123",
      activeProjects: 4,
      totalBilled: "₹2,10,00,000",
      status: "Active",
    },
    {
      id: "CST-04",
      name: "Apex Developers",
      type: "Residential Housing",
      contactPerson: "Sunita Gupta",
      email: "s.gupta@apexdev.com",
      phone: "+91 97180 55678",
      activeProjects: 1,
      totalBilled: "₹60,00,000",
      status: "Completed",
    },
    {
      id: "CST-05",
      name: "Silverline Properties",
      type: "Luxury Communities",
      contactPerson: "Rahul Mehta",
      email: "r.mehta@silverline.co",
      phone: "+91 98450 12345",
      activeProjects: 2,
      totalBilled: "₹72,00,000",
      status: "Active",
    },
    {
      id: "CST-06",
      name: "Skyline Freight Solutions",
      type: "Industrial Warehousing",
      contactPerson: "Dinesh Kulkarni",
      email: "dinesh@skyline.com",
      phone: "+91 98765 43210",
      activeProjects: 1,
      totalBilled: "₹95,00,000",
      status: "Under Review",
    },
  ];

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <FirmaLayout activeNav="Customers">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pb-2">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            CLIENT RELATIONSHIPS
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight flex items-center gap-2">
            Customers &amp; Clients
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage client profiles, active construction contracts, and key company stakeholders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Add customer form opening...")}
          className="flex items-center gap-2 rounded-xl bg-[#182E25] hover:bg-[#12231B] text-white px-4 py-2 text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EA] text-[#2E7D32]">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400">Total Clients</span>
            <p className="text-2xl font-extrabold text-slate-900">24</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FEF7E2] text-[#C98A19]">
            <FolderKanban className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400">Active Contracts</span>
            <p className="text-2xl font-extrabold text-slate-900">18</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E5EDE7] text-[#182E25]">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400">Enterprise Accounts</span>
            <p className="text-2xl font-extrabold text-slate-900">6</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by client company name or contact person..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 bg-white rounded-2xl border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] outline-none focus:border-[#182E25] transition"
        />
      </div>

      {/* Customer Directory Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl bg-white p-5 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition cursor-pointer"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5EDE7] text-[#182E25] font-black text-sm">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {item.name}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {item.type}
                    </span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    item.status === "Active"
                      ? "bg-[#E6F4EA] text-[#2E7D32] border-[#C8E6C9]"
                      : item.status === "Completed"
                      ? "bg-slate-100 text-slate-700 border-slate-200"
                      : "bg-[#FEF7E2] text-[#C98A19] border-[#FBECC5]"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Primary Contact:</span>
                  <span className="font-semibold text-slate-900">{item.contactPerson}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-medium text-slate-700">{item.email}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Active Projects:</span>
                  <span className="font-bold text-slate-900">{item.activeProjects}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Total Volume</span>
                <span className="font-bold text-slate-900">{item.totalBilled}</span>
              </div>
              <button
                type="button"
                className="text-[11px] font-semibold text-[#182E25] hover:underline"
              >
                View Account →
              </button>
            </div>
          </div>
        ))}
      </div>
    </FirmaLayout>
  );
}