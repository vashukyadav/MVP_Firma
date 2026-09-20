"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  useFinanceStore,
  CustomerInvoice,
  PurchaseOrder,
  SupplierBill,
} from "@/store/financeStore";
import { useLeadFlowStore } from "@/store/leadFlowStore";
import { useSiteStore } from "@/store/siteStore";
import { useTenderFlowStore } from "@/store/tenderFlowStore";
import { canApprovePurchaseOrder, canApproveSupplierBill } from "@/lib/roleAccess";
import {
  DollarSign,
  CreditCard,
  Clock,
  FileText,
  Plus,
  Calendar,
  ChevronDown,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  ShoppingCart,
  Landmark,
  BarChart3,
  Settings,
  Download,
  Eye,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Filter,
  Building2,
  MapPin,
  Briefcase,
  ExternalLink,
} from "lucide-react";

interface FinanceDashboardProps {
  companyName?: string;
}

export default function FinanceManagerDashboard({
  companyName,
}: FinanceDashboardProps) {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const firstName = currentUser?.name?.split(" ")[0] || "Finance Manager";
  const userCanApprovePO = canApprovePurchaseOrder(currentUser);
  const userCanApproveBill = canApproveSupplierBill(currentUser);

  // Stores
  const {
    invoices,
    purchaseOrders,
    supplierBills,
    payments,
    settings,
    approvePurchaseOrder,
    rejectPurchaseOrder,
    updateSupplierBill,
  } = useFinanceStore();

  const { projects = [] } = useLeadFlowStore();
  const { sites = [] } = useSiteStore();
  const { jobs = [], variations = [] } = useTenderFlowStore();

  // Filters
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [siteFilter, setSiteFilter] = useState("ALL");
  const [jobFilter, setJobFilter] = useState("ALL");
  const [currency, setCurrency] = useState<"INR" | "USD">(
    settings.baseCurrency || "INR"
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currencySymbol = currency === "INR" ? "₹" : "$";

  const formatMoney = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString("en-IN")}`;
  };

  // Filtered Records based on Project / Site / Job
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchProj =
        projectFilter === "ALL" ||
        inv.projectId === projectFilter ||
        inv.projectName === projectFilter;
      const matchSite =
        siteFilter === "ALL" ||
        inv.siteId === siteFilter ||
        inv.siteName === siteFilter;
      const matchJob = jobFilter === "ALL" || inv.jobId === jobFilter;
      return matchProj && matchSite && matchJob;
    });
  }, [invoices, projectFilter, siteFilter, jobFilter]);

  const filteredBills = useMemo(() => {
    return supplierBills.filter((bill) => {
      const matchProj =
        projectFilter === "ALL" ||
        bill.projectId === projectFilter ||
        bill.projectName === projectFilter;
      const matchSite =
        siteFilter === "ALL" ||
        bill.siteId === siteFilter ||
        bill.siteName === siteFilter;
      const matchJob = jobFilter === "ALL" || bill.jobId === jobFilter;
      return matchProj && matchSite && matchJob;
    });
  }, [supplierBills, projectFilter, siteFilter, jobFilter]);

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchProj =
        projectFilter === "ALL" ||
        po.projectId === projectFilter ||
        po.projectName === projectFilter;
      const matchSite =
        siteFilter === "ALL" ||
        po.siteId === siteFilter ||
        po.siteName === siteFilter;
      const matchJob = jobFilter === "ALL" || po.jobId === jobFilter;
      return matchProj && matchSite && matchJob;
    });
  }, [purchaseOrders, projectFilter, siteFilter, jobFilter]);

  // KPI Metrics
  const totalInvoiced = useMemo(() => {
    return filteredInvoices.reduce(
      (sum, inv) => sum + (inv.totalAmount || inv.amount),
      0
    );
  }, [filteredInvoices]);

  const totalPaid = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  }, [filteredInvoices]);

  const totalOutstanding = useMemo(() => {
    return filteredInvoices.reduce(
      (sum, inv) => sum + (inv.outstandingAmount || 0),
      0
    );
  }, [filteredInvoices]);

  const totalSupplierBills = useMemo(() => {
    return filteredBills.reduce((sum, b) => sum + b.amount, 0);
  }, [filteredBills]);

  // Combined Pending Approvals (POs awaiting approval, Bills awaiting approval, Variations)
  const pendingApprovals = useMemo(() => {
    const list: {
      id: string;
      type: "Purchase Order" | "Supplier Bill" | "Variation";
      ref: string;
      party: string;
      jobId: string;
      amount: number;
      date: string;
      rawId: string;
    }[] = [];

    filteredPOs
      .filter((p) => p.status === "Pending Approval")
      .forEach((p) => {
        list.push({
          id: `po-${p.id}`,
          type: "Purchase Order",
          ref: p.poNumber,
          party: p.supplierName,
          jobId: p.jobId,
          amount: p.amount,
          date: p.orderDate,
          rawId: p.id,
        });
      });

    filteredBills
      .filter((b) => b.status === "Pending")
      .forEach((b) => {
        list.push({
          id: `bill-${b.id}`,
          type: "Supplier Bill",
          ref: b.billNumber,
          party: b.supplierName,
          jobId: b.jobId,
          amount: b.amount,
          date: b.billDate,
          rawId: b.id,
        });
      });

    variations
      .filter(
        (v) =>
          v.status === "Pending PM Approval" ||
          v.status === "Awaiting PM Approval"
      )
      .forEach((v) => {
        list.push({
          id: `var-${v.id}`,
          type: "Variation",
          ref: v.variationNumber,
          party: v.siteName || v.projectName,
          jobId: v.jobId,
          amount: v.costImpact || 0,
          date: v.createdAt,
          rawId: v.id,
        });
      });

    return list;
  }, [filteredPOs, filteredBills, variations]);

  // Actions
  const handleApprove = (type: string, rawId: string, ref: string) => {
    if (type === "Purchase Order") {
      approvePurchaseOrder(rawId, currentUser?.name || "Finance Manager");
      showToast(`✓ PO ${ref} approved successfully!`);
    } else if (type === "Supplier Bill") {
      updateSupplierBill(rawId, { status: "Approved" });
      showToast(`✓ Supplier Bill ${ref} approved!`);
    } else {
      showToast(`✓ Variation ${ref} marked for verification.`);
    }
  };

  const handleReject = (type: string, rawId: string, ref: string) => {
    if (type === "Purchase Order") {
      rejectPurchaseOrder(rawId, "Rejected by Finance Manager");
      showToast(`✕ PO ${ref} marked as rejected.`);
    } else if (type === "Supplier Bill") {
      updateSupplierBill(rawId, { status: "Rejected" });
      showToast(`✕ Bill ${ref} marked as rejected.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 rounded-[10px] bg-onyx text-white px-4 py-2.5 text-xs font-semibold shadow-xl border border-pebble/40 animate-in fade-in slide-in-from-top-3 duration-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-forest" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div>
          <span className="text-eyebrow font-semibold tracking-wider text-ash uppercase">
            {companyName ? `${companyName} • ` : ""}FINANCE COMMAND CENTER
          </span>
          <h1 className="text-display-h1 font-bold text-onyx mt-0.5 tracking-tight">
            Financial Overview
          </h1>
          <p className="text-body text-ash mt-1">
            Welcome back, {firstName}. Monitor project cash flow, track receivables, and audit job costs.
          </p>
        </div>

        {/* Quick Nav Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/finance?tab=invoices")}
            className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Invoice</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/finance?tab=purchase-orders")}
            className="flex items-center gap-2 rounded-[10px] border border-pebble bg-white hover:bg-mist text-onyx px-3.5 py-2 text-xs font-medium shadow-2xs transition cursor-pointer"
          >
            <ShoppingCart className="h-3.5 w-3.5 text-ash" />
            <span>New PO</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/finance?tab=payments")}
            className="flex items-center gap-2 rounded-[10px] border border-pebble bg-white hover:bg-mist text-onyx px-3.5 py-2 text-xs font-medium shadow-2xs transition cursor-pointer"
          >
            <CreditCard className="h-3.5 w-3.5 text-ash" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Context Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-[12px] border border-pebble shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-onyx font-bold">
          <Filter className="h-4 w-4 text-forest" />
          <span>Financial Scope:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full sm:w-auto">
          {/* Project */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-stone border border-pebble rounded-[6px] px-2.5 py-1 text-onyx outline-none focus:border-onyx"
          >
            <option value="ALL">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Site */}
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="bg-stone border border-pebble rounded-[6px] px-2.5 py-1 text-onyx outline-none focus:border-onyx"
          >
            <option value="ALL">All Sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Job */}
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="bg-stone border border-pebble rounded-[6px] px-2.5 py-1 text-onyx outline-none focus:border-onyx"
          >
            <option value="ALL">All Jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.id} - {j.title.slice(0, 15)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Core Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoiced */}
        <div className="rounded-[12px] bg-white p-4.5 border border-pebble shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-eyebrow font-medium text-ash">
              Total Invoiced
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-breath text-onyx">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-onyx mt-2">
            {formatMoney(totalInvoiced)}
          </p>
          <div className="flex items-center justify-between text-eyebrow text-ash mt-1">
            <span>{filteredInvoices.length} invoices generated</span>
            <span className="text-forest font-semibold cursor-pointer hover:underline" onClick={() => router.push("/finance?tab=invoices")}>
              View
            </span>
          </div>
        </div>

        {/* Total Paid */}
        <div className="rounded-[12px] bg-white p-4.5 border border-pebble shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-eyebrow font-medium text-ash">
              Collected Revenue
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-clear-bg text-success-text">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-onyx mt-2">
            {formatMoney(totalPaid)}
          </p>
          <div className="flex items-center justify-between text-eyebrow text-ash mt-1">
            <span>
              {totalInvoiced > 0
                ? `${Math.round((totalPaid / totalInvoiced) * 100)}% collection rate`
                : "No billings"}
            </span>
            <span className="text-forest font-semibold cursor-pointer hover:underline" onClick={() => router.push("/finance?tab=payments")}>
              Ledger
            </span>
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="rounded-[12px] bg-white p-4.5 border border-pebble shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-eyebrow font-medium text-ash">
              Pending Receivables
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-sunfleck text-onyx">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-hazard-text mt-2">
            {formatMoney(totalOutstanding)}
          </p>
          <div className="flex items-center justify-between text-eyebrow text-ash mt-1">
            <span>Customer balance due</span>
            <span className="text-hazard-text font-semibold cursor-pointer hover:underline" onClick={() => router.push("/finance?tab=invoices")}>
              Follow up
            </span>
          </div>
        </div>

        {/* Supplier Bills */}
        <div className="rounded-[12px] bg-white p-4.5 border border-pebble shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-eyebrow font-medium text-ash">
              Supplier Bills (Payables)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-mist text-onyx">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-onyx mt-2">
            {formatMoney(totalSupplierBills)}
          </p>
          <div className="flex items-center justify-between text-eyebrow text-ash mt-1">
            <span>{filteredBills.length} recorded vendor bills</span>
            <span className="text-forest font-semibold cursor-pointer hover:underline" onClick={() => router.push("/finance?tab=bills")}>
              Audit
            </span>
          </div>
        </div>
      </div>

      {/* Two Detail Tables: Recent Invoices & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Invoices */}
        <div className="rounded-[14px] bg-white border border-pebble shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-pebble flex items-center justify-between bg-stone/40">
              <div>
                <h3 className="text-sm font-bold text-onyx">Recent Customer Invoices</h3>
                <p className="text-[11px] text-ash mt-0.5">
                  Connected client billings with job and project context
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/finance?tab=invoices")}
                className="text-xs font-semibold text-forest hover:underline cursor-pointer"
              >
                View All →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-pebble bg-stone text-eyebrow font-semibold text-ash uppercase tracking-wider">
                    <th className="py-2.5 px-3.5">Invoice #</th>
                    <th className="py-2.5 px-3.5">Customer</th>
                    <th className="py-2.5 px-3.5">Job</th>
                    <th className="py-2.5 px-3.5 text-right">Amount</th>
                    <th className="py-2.5 px-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pebble">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-xs text-ash">
                        No customer invoices found.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.slice(0, 5).map((inv) => (
                      <tr
                        key={inv.id}
                        onClick={() => router.push("/finance?tab=invoices")}
                        className="hover:bg-stone/50 transition cursor-pointer"
                      >
                        <td className="py-2.5 px-3.5 font-bold text-onyx">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-2.5 px-3.5 font-medium">{inv.customerName}</td>
                        <td className="py-2.5 px-3.5 text-ash">
                          {inv.jobId} - {inv.jobTitle}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-black text-onyx">
                          {formatMoney(inv.totalAmount)}
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-eyebrow font-semibold ${
                              inv.status === "Paid"
                                ? "bg-clear-bg text-success-text"
                                : inv.status === "Partially Paid"
                                ? "bg-sunfleck text-onyx"
                                : "bg-caution-bg text-caution-text"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="rounded-[14px] bg-white border border-pebble shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-pebble flex items-center justify-between bg-stone/40">
              <div>
                <h3 className="text-sm font-bold text-onyx">
                  Pending Approvals ({pendingApprovals.length})
                </h3>
                <p className="text-[11px] text-ash mt-0.5">
                  Purchase orders and bills requiring authorization
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/finance?tab=purchase-orders")}
                className="text-xs font-semibold text-forest hover:underline cursor-pointer"
              >
                View POs →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-pebble bg-stone text-eyebrow font-semibold text-ash uppercase tracking-wider">
                    <th className="py-2.5 px-3.5">Type</th>
                    <th className="py-2.5 px-3.5">Ref #</th>
                    <th className="py-2.5 px-3.5">Party / Job</th>
                    <th className="py-2.5 px-3.5 text-right">Amount</th>
                    <th className="py-2.5 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pebble">
                  {pendingApprovals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-xs text-ash">
                        All financial requests and procurement items are approved.
                      </td>
                    </tr>
                  ) : (
                    pendingApprovals.map((app) => (
                      <tr key={app.id} className="hover:bg-stone/50 transition">
                        <td className="py-2.5 px-3.5">
                          <span className="px-2 py-0.5 rounded-full text-eyebrow font-semibold bg-stone border border-pebble text-onyx">
                            {app.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 font-bold text-forest">
                          {app.ref}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <div className="font-medium text-onyx">{app.party}</div>
                          <div className="text-[10px] text-ash">{app.jobId}</div>
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-black text-onyx">
                          {formatMoney(app.amount)}
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleApprove(app.type, app.rawId, app.ref)
                              }
                              className="bg-forest hover:bg-forest-hover text-white rounded-[6px] px-2 py-1 text-eyebrow font-medium cursor-pointer shadow-2xs transition"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleReject(app.type, app.rawId, app.ref)
                              }
                              className="border border-pebble text-ash hover:text-hazard-text rounded-[6px] px-2 py-1 text-eyebrow font-medium cursor-pointer transition"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
