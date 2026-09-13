"use client";

import { useState } from "react";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertCircle,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from "lucide-react";

interface Invoice {
  id: string;
  client: string;
  project: string;
  amount: string;
  status: "PAID" | "PENDING" | "OVERDUE";
  dueDate: string;
}

export default function FinancePage() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const invoices: Invoice[] = [
    {
      id: "INV-2024-089",
      client: "Riverside Real Estate Ltd",
      project: "Riverside Luxury Villas",
      amount: "₹1,250,000",
      status: "PAID",
      dueDate: "15 May 2024",
    },
    {
      id: "INV-2024-090",
      client: "Metro Construction Corp",
      project: "Metro Heights Commercial Complex",
      amount: "₹3,400,000",
      status: "PENDING",
      dueDate: "28 May 2024",
    },
    {
      id: "INV-2024-091",
      client: "GreenBuild Infrastructure",
      project: "Whitefield Tech Park Block 3",
      amount: "₹890,000",
      status: "PAID",
      dueDate: "10 May 2024",
    },
    {
      id: "INV-2024-092",
      client: "Apex Developers",
      project: "Apex Horizon Towers",
      amount: "₹2,100,000",
      status: "OVERDUE",
      dueDate: "02 May 2024",
    },
    {
      id: "INV-2024-093",
      client: "Silver Oaks Society",
      project: "Residential Clubhouse & Pool",
      amount: "₹650,000",
      status: "PENDING",
      dueDate: "05 Jun 2024",
    },
  ];

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "PAID":
        return { label: "Paid", color: "bg-clear-bg text-success-text border-pebble" };
      case "PENDING":
        return { label: "Pending", color: "bg-caution-bg text-caution-text border-pebble" };
      case "OVERDUE":
        return { label: "Overdue", color: "bg-hazard-bg text-hazard-text border-pebble" };
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.client.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.project.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter === "ALL" || inv.status === filter;
    return matchesSearch && matchesStatus;
  });

  return (
    <FirmaLayout activeNav="Finance">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <span className="text-eyebrow font-semibold tracking-wider text-ash uppercase">
              FINANCIAL ACCOUNTS &amp; BILLING
            </span>
            <h1 className="text-display-h1 font-bold text-onyx mt-0.5 tracking-tight">
              Financial Overview
            </h1>
            <p className="text-body text-ash mt-1">
              Monitor project cashflow, track outstanding invoices, and control company expenses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert("Export report...")}
              className="flex items-center gap-2 rounded-[10px] border border-pebble bg-white hover:bg-mist text-onyx px-3.5 py-2 text-body font-medium transition cursor-pointer"
            >
              <Download className="h-4 w-4 text-ash" />
              <span>Export</span>
            </button>
            <button
              type="button"
              onClick={() => alert("Create invoice...")}
              className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4.5 py-2.5 text-sm font-medium shadow-xs transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Invoice</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-[10px] bg-white p-4 border border-pebble">
            <div className="flex items-center justify-between">
              <span className="text-eyebrow font-medium text-ash">Total Invoiced</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-breath text-onyx">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-onyx mt-2">₹8,290,000</p>
            <div className="flex items-center gap-1 mt-1 text-eyebrow text-success-text">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+18.4% vs last quarter</span>
            </div>
          </div>

          <div className="rounded-[10px] bg-white p-4 border border-pebble">
            <div className="flex items-center justify-between">
              <span className="text-eyebrow font-medium text-ash">Collected Revenue</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-clear-bg text-success-text">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-onyx mt-2">₹2,140,000</p>
            <div className="flex items-center gap-1 mt-1 text-eyebrow text-success-text">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>Paid in 30 days</span>
            </div>
          </div>

          <div className="rounded-[10px] bg-white p-4 border border-pebble">
            <div className="flex items-center justify-between">
              <span className="text-eyebrow font-medium text-ash">Pending Receivables</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-sunfleck text-onyx">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-onyx mt-2">₹4,050,000</p>
            <span className="text-eyebrow text-ash mt-1 block">2 active invoices awaiting payment</span>
          </div>

          <div className="rounded-[10px] bg-white p-4 border border-pebble">
            <div className="flex items-center justify-between">
              <span className="text-eyebrow font-medium text-ash">Overdue Receivables</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-hazard-bg text-hazard-text">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-onyx mt-2">₹2,100,000</p>
            <div className="flex items-center gap-1 mt-1 text-eyebrow text-hazard-text">
              <ArrowDownRight className="h-3.5 w-3.5" />
              <span>Requires immediate follow-up</span>
            </div>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-[10px] border border-pebble">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { key: "ALL", label: "All Invoices" },
              { key: "PAID", label: "Paid" },
              { key: "PENDING", label: "Pending" },
              { key: "OVERDUE", label: "Overdue" },
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

          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 text-ash absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoices or clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-body text-onyx placeholder:text-ash bg-stone rounded-[10px] border border-pebble outline-none focus:border-onyx transition"
            />
          </div>
        </div>

        {/* Invoices Table */}
        <div className="rounded-[10px] bg-white border border-pebble overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-pebble bg-stone text-eyebrow font-semibold text-ash uppercase tracking-wider">
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Client</th>
                <th className="p-4">Project</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Due Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-pebble text-body text-onyx">
              {filteredInvoices.map((item) => {
                const badge = getStatusBadge(item.status);
                return (
                  <tr key={item.id} className="hover:bg-stone/50 transition">
                    <td className="p-4 font-bold text-onyx">{item.id}</td>
                    <td className="p-4 font-medium">{item.client}</td>
                    <td className="p-4 text-ash">{item.project}</td>
                    <td className="p-4 font-bold text-onyx">{item.amount}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-eyebrow font-semibold border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-4 text-ash text-eyebrow">{item.dueDate}</td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => alert(`Viewing details for ${item.id}`)}
                        className="border border-pebble rounded-[6px] px-2.5 py-1 text-eyebrow font-medium text-onyx bg-white hover:bg-mist cursor-pointer"
                      >
                        View
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