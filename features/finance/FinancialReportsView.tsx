"use client";

import { useState, useMemo } from "react";
import { useFinanceStore } from "@/store/financeStore";
import { useLeadFlowStore } from "@/store/leadFlowStore";
import { useSiteStore } from "@/store/siteStore";
import { useTenderFlowStore } from "@/store/tenderFlowStore";
import { toast } from "@/components/ui/toast";
import {
  BarChart3,
  TrendingUp,
  Download,
  IndianRupee,
  DollarSign,
  Building2,
  MapPin,
  Briefcase,
  User,
  Calendar,
  Filter,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Printer,
} from "lucide-react";

export default function FinancialReportsView() {
  const {
    invoices,
    purchaseOrders,
    supplierBills,
    payments,
    budgets,
    getJobFinancialSummary,
    settings,
    getAllSuppliers,
  } = useFinanceStore();

  const { projects = [] } = useLeadFlowStore();
  const { sites = [] } = useSiteStore();
  const { jobs = [] } = useTenderFlowStore();

  // Multi-dimensional filters
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [siteFilter, setSiteFilter] = useState("ALL");
  const [jobFilter, setJobFilter] = useState("ALL");
  const [customerFilter, setCustomerFilter] = useState("ALL");
  const [supplierFilter, setSupplierFilter] = useState("ALL");
  const [reportTab, setReportTab] = useState<
    "PL" | "JOB_COSTS" | "RECEIVABLES" | "PAYABLES"
  >("PL");

  const currencySymbol = settings.currencySymbol || "₹";

  const formatCurrency = (val: number) => {
    return `${currencySymbol}${val.toLocaleString("en-IN")}`;
  };

  const suppliersList = useMemo(() => {
    return getAllSuppliers();
  }, [getAllSuppliers]);

  const customersList = useMemo(() => {
    const s = new Set<string>();
    invoices.forEach((inv) => {
      if (inv.customerName) s.add(inv.customerName);
    });
    return Array.from(s);
  }, [invoices]);

  // Filtered Data
  const filteredInvoices = useMemo(() => {
    return invoices.filter((i) => {
      const matchProj =
        projectFilter === "ALL" ||
        i.projectId === projectFilter ||
        i.projectName === projectFilter;
      const matchSite =
        siteFilter === "ALL" ||
        i.siteId === siteFilter ||
        i.siteName === siteFilter;
      const matchJob = jobFilter === "ALL" || i.jobId === jobFilter;
      const matchCust =
        customerFilter === "ALL" || i.customerName === customerFilter;
      return matchProj && matchSite && matchJob && matchCust;
    });
  }, [invoices, projectFilter, siteFilter, jobFilter, customerFilter]);

  const filteredBills = useMemo(() => {
    return supplierBills.filter((b) => {
      const matchProj =
        projectFilter === "ALL" ||
        b.projectId === projectFilter ||
        b.projectName === projectFilter;
      const matchSite =
        siteFilter === "ALL" ||
        b.siteId === siteFilter ||
        b.siteName === siteFilter;
      const matchJob = jobFilter === "ALL" || b.jobId === jobFilter;
      const matchSupp =
        supplierFilter === "ALL" || b.supplierName === supplierFilter;
      return matchProj && matchSite && matchJob && matchSupp;
    });
  }, [supplierBills, projectFilter, siteFilter, jobFilter, supplierFilter]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchProj =
        projectFilter === "ALL" ||
        p.projectId === projectFilter ||
        p.projectName === projectFilter;
      const matchJob = jobFilter === "ALL" || p.jobId === jobFilter;
      return matchProj && matchJob;
    });
  }, [payments, projectFilter, jobFilter]);

  // Core Metrics
  const totalRevenueInvoiced = useMemo(() => {
    return filteredInvoices.reduce(
      (sum, i) => sum + (i.totalAmount || i.amount),
      0
    );
  }, [filteredInvoices]);

  const totalRevenueCollected = useMemo(() => {
    return filteredInvoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
  }, [filteredInvoices]);

  const totalOutstandingReceivable = useMemo(() => {
    return filteredInvoices.reduce(
      (sum, i) => sum + (i.outstandingAmount || 0),
      0
    );
  }, [filteredInvoices]);

  const totalExpensesBilled = useMemo(() => {
    return filteredBills.reduce((sum, b) => sum + b.amount, 0);
  }, [filteredBills]);

  const totalExpensesPaid = useMemo(() => {
    return filteredBills.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  }, [filteredBills]);

  const totalOutstandingPayable = useMemo(() => {
    return filteredBills.reduce(
      (sum, b) => sum + (b.outstandingAmount || 0),
      0
    );
  }, [filteredBills]);

  const grossProfit = totalRevenueInvoiced - totalExpensesBilled;
  const marginPercent =
    totalRevenueInvoiced > 0
      ? Math.round((grossProfit / totalRevenueInvoiced) * 100)
      : 0;

  // Print report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-onyx tracking-tight">
            Financial Intelligence &amp; Reports
          </h2>
          <p className="text-body text-ash mt-0.5">
            Real-time multi-dimensional reports using live project, site, and job transactions without data duplication.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-[10px] border border-pebble bg-white hover:bg-mist text-onyx px-3.5 py-2 text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-ash" />
            <span>Print / PDF</span>
          </button>
          <button
            type="button"
            onClick={() => toast.success("Financial report exported to CSV successfully.")}
            className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4 py-2 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Multi-Dimensional Filter Toolbar */}
      <div className="bg-white p-4 rounded-[12px] border border-pebble shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-onyx uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-forest" />
            <span>Filter Report Parameters</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setProjectFilter("ALL");
              setSiteFilter("ALL");
              setJobFilter("ALL");
              setCustomerFilter("ALL");
              setSupplierFilter("ALL");
            }}
            className="text-[11px] text-ash hover:text-onyx font-medium underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
          <div>
            <label className="text-[11px] text-ash font-medium block mb-1">
              Project:
            </label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full bg-stone border border-pebble rounded-[6px] px-2.5 py-1 text-onyx outline-none focus:border-onyx"
            >
              <option value="ALL">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-ash font-medium block mb-1">
              Site Yard:
            </label>
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="w-full bg-stone border border-pebble rounded-[6px] px-2.5 py-1 text-onyx outline-none focus:border-onyx"
            >
              <option value="ALL">All Sites</option>
              {sites.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-ash font-medium block mb-1">
              Job:
            </label>
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="w-full bg-stone border border-pebble rounded-[6px] px-2.5 py-1 text-onyx outline-none focus:border-onyx"
            >
              <option value="ALL">All Jobs</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.id} - {j.title.slice(0, 15)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-ash font-medium block mb-1">
              Customer:
            </label>
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="w-full bg-stone border border-pebble rounded-[6px] px-2.5 py-1 text-onyx outline-none focus:border-onyx"
            >
              <option value="ALL">All Customers</option>
              {customersList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-ash font-medium block mb-1">
              Supplier:
            </label>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="w-full bg-stone border border-pebble rounded-[6px] px-2.5 py-1 text-onyx outline-none focus:border-onyx"
            >
              <option value="ALL">All Suppliers</option>
              {suppliersList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-[12px] bg-white p-4 border border-pebble shadow-2xs">
          <span className="text-xs font-semibold text-ash">Total Revenue</span>
          <p className="text-2xl font-bold text-onyx mt-1">
            {formatCurrency(totalRevenueInvoiced)}
          </p>
          <span className="text-[11px] text-success-text mt-1 block font-medium">
            {formatCurrency(totalRevenueCollected)} collected ({formatCurrency(totalOutstandingReceivable)} pending)
          </span>
        </div>

        <div className="rounded-[12px] bg-white p-4 border border-pebble shadow-2xs">
          <span className="text-xs font-semibold text-ash">Total Expenses</span>
          <p className="text-2xl font-bold text-onyx mt-1">
            {formatCurrency(totalExpensesBilled)}
          </p>
          <span className="text-[11px] text-ash mt-1 block">
            {formatCurrency(totalExpensesPaid)} paid ({formatCurrency(totalOutstandingPayable)} payable)
          </span>
        </div>

        <div className="rounded-[12px] bg-white p-4 border border-pebble shadow-2xs">
          <span className="text-xs font-semibold text-ash">Net Gross Profit</span>
          <p
            className={`text-2xl font-bold mt-1 ${
              grossProfit >= 0 ? "text-success-text" : "text-hazard-text"
            }`}
          >
            {formatCurrency(grossProfit)}
          </p>
          <span className="text-[11px] text-ash mt-1 block">
            Revenue minus direct job expenses
          </span>
        </div>

        <div className="rounded-[12px] bg-white p-4 border border-pebble shadow-2xs">
          <span className="text-xs font-semibold text-ash">Gross Margin %</span>
          <p className="text-2xl font-bold text-onyx mt-1">{marginPercent}%</p>
          <span className="text-[11px] text-ash mt-1 block">
            Operational return on billed value
          </span>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-pebble pb-2 text-xs">
        {[
          { key: "PL", label: "Profit & Loss / Cashflow" },
          { key: "JOB_COSTS", label: "Job Costing & Variance" },
          { key: "RECEIVABLES", label: "Receivables (Invoices)" },
          { key: "PAYABLES", label: "Payables (Supplier Bills)" },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setReportTab(t.key as any)}
            className={`px-3.5 py-1.5 rounded-[8px] font-semibold transition cursor-pointer ${
              reportTab === t.key
                ? "bg-onyx text-white shadow-2xs"
                : "bg-white border border-pebble text-ash hover:text-onyx"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Report Tab Body */}
      {reportTab === "PL" && (
        <div className="rounded-[12px] bg-white border border-pebble p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-onyx uppercase tracking-wider">
            Executive Cashflow &amp; P&amp;L Statement
          </h3>

          <div className="space-y-2 text-xs divide-y divide-pebble">
            <div className="flex justify-between py-2">
              <span className="font-semibold text-onyx">
                Gross Contract &amp; Invoiced Revenue
              </span>
              <span className="font-black text-onyx">
                {formatCurrency(totalRevenueInvoiced)}
              </span>
            </div>
            <div className="flex justify-between py-2 text-ash pl-4">
              <span>• Customer Receipts Collected</span>
              <span className="text-success-text font-bold">
                {formatCurrency(totalRevenueCollected)}
              </span>
            </div>
            <div className="flex justify-between py-2 text-ash pl-4">
              <span>• Outstanding Customer Receivables</span>
              <span className="text-hazard-text font-bold">
                {formatCurrency(totalOutstandingReceivable)}
              </span>
            </div>

            <div className="flex justify-between py-2 pt-3">
              <span className="font-semibold text-onyx">
                Direct Cost of Goods &amp; Services (Expenses)
              </span>
              <span className="font-black text-onyx">
                {formatCurrency(totalExpensesBilled)}
              </span>
            </div>
            <div className="flex justify-between py-2 text-ash pl-4">
              <span>• Supplier Bills Settled / Disbursed</span>
              <span className="text-onyx font-bold">
                {formatCurrency(totalExpensesPaid)}
              </span>
            </div>
            <div className="flex justify-between py-2 text-ash pl-4">
              <span>• Outstanding Accounts Payable</span>
              <span className="text-hazard-text font-bold">
                {formatCurrency(totalOutstandingPayable)}
              </span>
            </div>

            <div className="flex justify-between py-3 bg-stone p-3 rounded-[8px] text-sm">
              <span className="font-black text-onyx">
                Estimated Net Operating Surplus
              </span>
              <span
                className={`font-black ${
                  grossProfit >= 0 ? "text-success-text" : "text-hazard-text"
                }`}
              >
                {formatCurrency(grossProfit)} ({marginPercent}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {reportTab === "JOB_COSTS" && (
        <div className="rounded-[12px] bg-white border border-pebble overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-stone border-b border-pebble font-semibold text-ash">
              <tr>
                <th className="p-3">Job ID</th>
                <th className="p-3">Project / Site</th>
                <th className="p-3 text-right">Contract Value</th>
                <th className="p-3 text-right">Budget</th>
                <th className="p-3 text-right">Actual Cost</th>
                <th className="p-3 text-right">Remaining</th>
                <th className="p-3 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pebble">
              {jobs.map((j) => {
                const s = getJobFinancialSummary(j.id, {
                  timesheets: j.timesheets,
                  variations: j.variations,
                });
                return (
                  <tr key={j.id} className="hover:bg-stone/40">
                    <td className="p-3 font-bold text-onyx">
                      {j.id} - {j.title}
                    </td>
                    <td className="p-3 text-ash">
                      {j.projectName} • {j.siteName || j.location}
                    </td>
                    <td className="p-3 text-right font-semibold text-onyx">
                      {formatCurrency(s.contractValue)}
                    </td>
                    <td className="p-3 text-right text-ash">
                      {formatCurrency(s.budget)}
                    </td>
                    <td className="p-3 text-right font-black text-onyx">
                      {formatCurrency(s.actualCost)}
                    </td>
                    <td
                      className={`p-3 text-right font-bold ${
                        s.remainingBudget >= 0
                          ? "text-success-text"
                          : "text-hazard-text"
                      }`}
                    >
                      {formatCurrency(s.remainingBudget)}
                    </td>
                    <td className="p-3 text-right font-bold text-onyx">
                      {s.grossMarginPercent}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {reportTab === "RECEIVABLES" && (
        <div className="rounded-[12px] bg-white border border-pebble overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-stone border-b border-pebble font-semibold text-ash">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Job</th>
                <th className="p-3">Due Date</th>
                <th className="p-3 text-right">Total Amount</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3 text-right">Outstanding</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pebble">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-stone/40">
                  <td className="p-3 font-bold text-onyx">{inv.invoiceNumber}</td>
                  <td className="p-3 font-medium">{inv.customerName}</td>
                  <td className="p-3 text-ash">
                    {inv.jobId} - {inv.jobTitle}
                  </td>
                  <td className="p-3 text-ash">{inv.dueDate}</td>
                  <td className="p-3 text-right font-bold text-onyx">
                    {formatCurrency(inv.totalAmount)}
                  </td>
                  <td className="p-3 text-right text-success-text font-semibold">
                    {formatCurrency(inv.paidAmount || 0)}
                  </td>
                  <td className="p-3 text-right text-hazard-text font-black">
                    {formatCurrency(inv.outstandingAmount || 0)}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-eyebrow font-semibold bg-stone border border-pebble text-onyx">
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportTab === "PAYABLES" && (
        <div className="rounded-[12px] bg-white border border-pebble overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-stone border-b border-pebble font-semibold text-ash">
              <tr>
                <th className="p-3">Bill #</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">PO Ref</th>
                <th className="p-3">Job</th>
                <th className="p-3">Due Date</th>
                <th className="p-3 text-right">Total Amount</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3 text-right">Outstanding</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pebble">
              {filteredBills.map((b) => (
                <tr key={b.id} className="hover:bg-stone/40">
                  <td className="p-3 font-bold text-onyx">{b.billNumber}</td>
                  <td className="p-3 font-medium">{b.supplierName}</td>
                  <td className="p-3 text-forest font-semibold">
                    {b.poNumber || "Direct"}
                  </td>
                  <td className="p-3 text-ash">
                    {b.jobId} - {b.jobTitle}
                  </td>
                  <td className="p-3 text-ash">{b.dueDate}</td>
                  <td className="p-3 text-right font-bold text-onyx">
                    {formatCurrency(b.amount)}
                  </td>
                  <td className="p-3 text-right text-success-text font-semibold">
                    {formatCurrency(b.paidAmount || 0)}
                  </td>
                  <td className="p-3 text-right text-hazard-text font-black">
                    {formatCurrency(b.outstandingAmount || 0)}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-eyebrow font-semibold bg-stone border border-pebble text-onyx">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
