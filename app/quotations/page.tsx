"use client";

import { useState } from "react";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  FileCheck2,
  Plus,
  Search,
  Download,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  Eye,
} from "lucide-react";

export default function QuotationsPage() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const quotations = [
    {
      id: "Q-1023",
      title: "Commercial Glass Facade & Glazing",
      client: "GreenBuild Ltd.",
      amount: "₹45,00,000",
      status: "SENT",
      date: "08 Sep 2026",
      validUntil: "25 Sep 2026",
    },
    {
      id: "Q-1022",
      title: "Foundation & Sub-Structure Package",
      client: "Horizon Infra Pvt. Ltd.",
      amount: "₹85,00,000",
      status: "APPROVED",
      date: "07 Sep 2026",
      validUntil: "30 Sep 2026",
    },
    {
      id: "Q-1021",
      title: "Structural Reinforcement & Beams",
      client: "Metro Realty Group",
      amount: "₹32,00,000",
      status: "UNDER_REVIEW",
      date: "04 Sep 2026",
      validUntil: "20 Sep 2026",
    },
    {
      id: "Q-1020",
      title: "Clubhouse Interior & Landscaping",
      client: "Silverline Properties",
      amount: "₹22,50,000",
      status: "DRAFT",
      date: "01 Sep 2026",
      validUntil: "15 Oct 2026",
    },
    {
      id: "Q-1019",
      title: "Warehouse Pre-Engineered Steel Shed",
      client: "Skyline Freight Solutions",
      amount: "₹65,00,000",
      status: "APPROVED",
      date: "28 Aug 2026",
      validUntil: "15 Sep 2026",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          label: "Approved",
          color: "bg-[#E6F4EA] text-[#2E7D32] border-[#C8E6C9]",
        };
      case "SENT":
        return {
          label: "Sent to Client",
          color: "bg-[#EBF3FB] text-[#257AB9] border-[#CFE4F6]",
        };
      case "UNDER_REVIEW":
        return {
          label: "Under Review",
          color: "bg-[#FEF7E2] text-[#C98A19] border-[#FBECC5]",
        };
      case "DRAFT":
        return {
          label: "Draft",
          color: "bg-slate-100 text-slate-700 border-slate-200",
        };
      default:
        return {
          label: status,
          color: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  };

  const filtered = quotations.filter((q) => {
    const matchSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.client.toLowerCase().includes(search.toLowerCase()) ||
      q.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === "ALL" || q.status === filter;
    return matchSearch && matchStatus;
  });

  return (
    <FirmaLayout activeNav="Quotations">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pb-2">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            COMMERCIAL ESTIMATION
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight flex items-center gap-2">
            Quotations &amp; Proposals
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate cost estimates, send formal proposals, and track client approvals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Create quotation form opening...")}
          className="flex items-center gap-2 rounded-xl bg-[#182E25] hover:bg-[#12231B] text-white px-4 py-2 text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-medium text-slate-400">Open Enquiries</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">14</p>
          <p className="text-[10px] font-medium text-rose-500 mt-1">↗ +6 this week</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-medium text-slate-400">Pending Quotations</span>
          <p className="text-2xl font-extrabold text-[#C98A19] mt-1">6</p>
          <p className="text-[10px] font-medium text-emerald-600 mt-1">↗ +2 this week</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-medium text-slate-400">Total Quoted Volume</span>
          <p className="text-2xl font-extrabold text-[#2E7D32] mt-1">₹2,49,50,000</p>
          <p className="text-[10px] font-medium text-slate-500 mt-1">5 active proposals</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { key: "ALL", label: "All Proposals" },
            { key: "SENT", label: "Sent" },
            { key: "UNDER_REVIEW", label: "Under Review" },
            { key: "APPROVED", label: "Approved" },
            { key: "DRAFT", label: "Drafts" },
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
            placeholder="Search by quote # or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-[#182E25] focus:bg-white transition"
          />
        </div>
      </div>

      {/* Quotations Table */}
      <div className="rounded-2xl bg-white border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Quote #</th>
                <th className="px-6 py-3.5">Scope Title</th>
                <th className="px-6 py-3.5">Client</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Valid Till</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((item) => {
                const badge = getStatusBadge(item.status);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-extrabold text-slate-900">
                      #{item.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {item.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {item.client}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {item.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {item.validUntil}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </FirmaLayout>
  );
}