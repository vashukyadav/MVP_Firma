"use client";

import { useState } from "react";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Building2,
  Clock,
  ExternalLink,
  Award,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

interface Tender {
  id: string;
  authority: string;
  title: string;
  category: string;
  estimatedValue: string;
  submissionDeadline: string;
  status: "OPEN" | "SUBMITTED" | "UNDER_EVALUATION" | "AWARDED";
  emdAmount: string;
}

export default function TenderPage() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const tenders: Tender[] = [
    {
      id: "TND-2024-041",
      authority: "National Highway Authority of India (NHAI)",
      title: "Construction of 4-Lane Elevated Corridor – Package 2",
      category: "Highways & Civil",
      estimatedValue: "₹18.5 Cr",
      submissionDeadline: "18 Jun 2024",
      status: "OPEN",
      emdAmount: "₹37,00,000",
    },
    {
      id: "TND-2024-042",
      authority: "Mumbai Metropolitan Region Development Authority",
      title: "Design & Construction of Multi-Modal Transit Terminal",
      category: "Urban Infra",
      estimatedValue: "₹42.0 Cr",
      submissionDeadline: "25 Jun 2024",
      status: "OPEN",
      emdAmount: "₹84,00,000",
    },
    {
      id: "TND-2024-043",
      authority: "Central Public Works Department (CPWD)",
      title: "Construction of Central Laboratory & Research Wing",
      category: "Institutional",
      estimatedValue: "₹12.8 Cr",
      submissionDeadline: "02 Jun 2024",
      status: "UNDER_EVALUATION",
      emdAmount: "₹25,60,000",
    },
    {
      id: "TND-2024-044",
      authority: "Karnataka Urban Infrastructure Development",
      title: "Underground Drainage & Water Treatment Facility",
      category: "Water & Utilities",
      estimatedValue: "₹29.4 Cr",
      submissionDeadline: "14 May 2024",
      status: "AWARDED",
      emdAmount: "₹58,80,000",
    },
  ];

  const getStatusBadge = (status: Tender["status"]) => {
    switch (status) {
      case "OPEN":
        return { label: "Open for Bidding", color: "bg-breath text-onyx border-pebble" };
      case "SUBMITTED":
        return { label: "Submitted", color: "bg-caution-bg text-caution-text border-pebble" };
      case "UNDER_EVALUATION":
        return { label: "Under Evaluation", color: "bg-sunfleck text-onyx border-pebble" };
      case "AWARDED":
        return { label: "Contract Awarded", color: "bg-clear-bg text-success-text border-pebble" };
    }
  };

  const filtered = tenders.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.authority.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter === "ALL" || t.status === filter;
    return matchesSearch && matchesStatus;
  });

  return (
    <FirmaLayout activeNav="Tenders">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <span className="text-eyebrow font-semibold tracking-wider text-ash uppercase">
              PUBLIC &amp; PRIVATE PROCUREMENT
            </span>
            <h1 className="text-display-h1 font-bold text-onyx mt-0.5 tracking-tight">
              Tenders &amp; Bid Notices
            </h1>
            <p className="text-body text-ash mt-1">
              Participate in government and institutional procurement opportunities and track EMD guarantees.
            </p>
          </div>

          <button
            type="button"
            onClick={() => alert("Add new tender notification...")}
            className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4 py-2.5 text-sm font-medium transition cursor-pointer self-start sm:self-auto shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Track New Tender</span>
          </button>
        </div>

        {/* 3 KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-[10px] bg-white p-4.5 border border-pebble shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ash">Active Tenders Tracked</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-breath text-onyx">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-onyx mt-2">4 Opportunities</p>
            <p className="text-xs font-medium text-ash mt-1">Cumulative Value: ₹102.7 Cr</p>
          </div>

          <div className="rounded-[10px] bg-white p-4.5 border border-pebble shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ash">Under Evaluation</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-sunfleck text-onyx">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-onyx mt-2">1 Bid Pending</p>
            <p className="text-xs font-medium text-ash mt-1">Technical qualification passed</p>
          </div>

          <div className="rounded-[10px] bg-white p-4.5 border border-pebble shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ash">Earnest Money (EMD)</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-clear-bg text-success-text">
                <ShieldAlert className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-onyx mt-2">₹1.85 Cr</p>
            <p className="text-xs font-medium text-ash mt-1">Backed by Bank Guarantees</p>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-[10px] border border-pebble shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { key: "ALL", label: "All Tenders" },
              { key: "OPEN", label: "Open" },
              { key: "UNDER_EVALUATION", label: "Under Evaluation" },
              { key: "AWARDED", label: "Awarded" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3.5 py-2 rounded-[10px] text-sm font-medium transition cursor-pointer shrink-0 ${
                  filter === tab.key
                    ? "bg-forest text-white shadow-2xs"
                    : "bg-stone text-ash hover:bg-mist hover:text-onyx"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 text-ash absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by tender ID or authority..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-sm text-onyx placeholder:text-ash bg-stone rounded-[10px] border border-pebble outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 transition"
            />
          </div>
        </div>

        {/* Tenders Table */}
        <div className="rounded-[10px] bg-white border border-pebble overflow-x-auto shadow-2xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-pebble bg-stone text-xs font-semibold text-ash uppercase tracking-wider">
                <th className="p-4">Tender ID &amp; Authority</th>
                <th className="p-4">Project Description</th>
                <th className="p-4">Category</th>
                <th className="p-4">Estimated Value</th>
                <th className="p-4">Status</th>
                <th className="p-4">Submission Due</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-pebble text-sm text-onyx">
              {filtered.map((item) => {
                const badge = getStatusBadge(item.status);
                return (
                  <tr key={item.id} className="hover:bg-stone/50 transition">
                    <td className="p-4">
                      <span className="text-xs font-semibold text-ash uppercase block">{item.id}</span>
                      <span className="font-bold text-onyx">{item.authority}</span>
                    </td>
                    <td className="p-4 max-w-xs">{item.title}</td>
                    <td className="p-4 text-ash">{item.category}</td>
                    <td className="p-4 font-bold text-onyx">{item.estimatedValue}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-eyebrow font-semibold border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-4 text-ash text-eyebrow">{item.submissionDeadline}</td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => alert(`Opening tender ${item.id}`)}
                        className="border border-pebble rounded-[6px] px-2.5 py-1 text-eyebrow font-medium text-onyx bg-white hover:bg-mist cursor-pointer"
                      >
                        Details
                      </button>
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