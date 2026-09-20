"use client";

import { useState, useMemo } from "react";
import {
  useFinanceStore,
  CustomerInvoice,
  PaymentMethod,
} from "@/store/financeStore";
import { useLeadFlowStore } from "@/store/leadFlowStore";
import { useSiteStore } from "@/store/siteStore";
import { useTenderFlowStore } from "@/store/tenderFlowStore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/components/ui/toast";
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  CreditCard,
  Building2,
  MapPin,
  Briefcase,
  User,
  Calendar,
  IndianRupee,
  DollarSign,
  Download,
  Filter,
  Eye,
  Check,
} from "lucide-react";

interface InvoicesViewProps {
  initialJobFilter?: string;
  onOpenCreate?: () => void;
}

export default function InvoicesView({ initialJobFilter }: InvoicesViewProps) {
  const { invoices, addInvoice, updateInvoice, recordInvoicePayment, settings } =
    useFinanceStore();
  const { projects = [] } = useLeadFlowStore();
  const { sites = [] } = useSiteStore();
  const { jobs = [] } = useTenderFlowStore();
  const currentUser = useAuthStore((state) => state.currentUser);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [siteFilter, setSiteFilter] = useState("ALL");
  const [jobFilter, setJobFilter] = useState(initialJobFilter || "ALL");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(
    null
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Create Invoice Form State
  const [newCustomer, setNewCustomer] = useState("");
  const [newProjectId, setNewProjectId] = useState(projects[0]?.id || "");
  const [newSiteId, setNewSiteId] = useState("");
  const [newJobId, setNewJobId] = useState(initialJobFilter || "");
  const [newDescription, setNewDescription] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [applyGst, setApplyGst] = useState(false);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("Bank Transfer");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // Cascaded Sites for create form
  const availableSites = useMemo(() => {
    if (!newProjectId) return sites;
    const selectedProj = projects.find((p) => p.id === newProjectId);
    if (!selectedProj) return sites;
    return sites.filter(
      (s) =>
        s.projectName.toLowerCase() === selectedProj.name.toLowerCase() ||
        s.id === selectedProj.id
    );
  }, [newProjectId, projects, sites]);

  // Cascaded Jobs for create form
  const availableJobs = useMemo(() => {
    return jobs.filter((j) => {
      const matchProj =
        !newProjectId ||
        j.projectId === newProjectId ||
        projects.find((p) => p.id === newProjectId)?.name === j.projectName;
      return matchProj;
    });
  }, [newProjectId, projects, jobs]);

  // Filtered Invoices List
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
        inv.projectName.toLowerCase().includes(search.toLowerCase()) ||
        inv.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
        inv.jobId.toLowerCase().includes(search.toLowerCase()) ||
        inv.siteName.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PAID" && inv.status === "Paid") ||
        (statusFilter === "PARTIAL" && inv.status === "Partially Paid") ||
        (statusFilter === "SENT" && inv.status === "Sent") ||
        (statusFilter === "OVERDUE" && inv.status === "Overdue");

      const matchProj =
        projectFilter === "ALL" ||
        inv.projectId === projectFilter ||
        inv.projectName === projectFilter;

      const matchSite =
        siteFilter === "ALL" ||
        inv.siteId === siteFilter ||
        inv.siteName === siteFilter;

      const matchJob = jobFilter === "ALL" || inv.jobId === jobFilter;

      return matchSearch && matchStatus && matchProj && matchSite && matchJob;
    });
  }, [invoices, search, statusFilter, projectFilter, siteFilter, jobFilter]);

  const currencySymbol = settings.currencySymbol || "₹";

  const formatCurrency = (val: number) => {
    return `${currencySymbol}${val.toLocaleString("en-IN")}`;
  };

  const getStatusBadge = (status: CustomerInvoice["status"]) => {
    switch (status) {
      case "Paid":
        return {
          label: "Paid",
          color: "bg-clear-bg text-success-text border-pebble",
        };
      case "Partially Paid":
        return {
          label: "Partially Paid",
          color: "bg-sunfleck text-onyx border-pebble",
        };
      case "Sent":
        return {
          label: "Sent",
          color: "bg-breath text-onyx border-pebble",
        };
      case "Overdue":
        return {
          label: "Overdue",
          color: "bg-hazard-bg text-hazard-text border-pebble",
        };
      default:
        return {
          label: status,
          color: "bg-stone text-ash border-pebble",
        };
    }
  };

  // Open Payment Modal
  const handleOpenPayment = (inv: CustomerInvoice) => {
    setSelectedInvoice(inv);
    setPaymentAmount(String(inv.outstandingAmount || inv.totalAmount));
    setPaymentReference(`RTGS-${Date.now().toString().slice(-6)}`);
    setShowPaymentModal(true);
  };

  // Submit Payment
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    const amount = parseFloat(paymentAmount) || 0;
    if (amount <= 0) {
      toast.warning("Please enter a valid payment amount.");
      return;
    }

    recordInvoicePayment(
      selectedInvoice.id,
      amount,
      paymentMethod,
      paymentReference,
      currentUser?.name || "Finance Manager",
      paymentNotes
    );

    toast.success(`Payment of ${formatCurrency(amount)} recorded successfully!`);
    setShowPaymentModal(false);
    setSelectedInvoice(null);
  };

  // Submit Create Invoice
  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmt = parseFloat(newAmount) || 0;
    if (rawAmt <= 0) {
      toast.warning("Please enter a valid invoice amount.");
      return;
    }

    const proj =
      projects.find((p) => p.id === newProjectId) || projects[0];
    const site =
      sites.find((s) => s.id === newSiteId) || sites[0];
    const job =
      jobs.find((j) => j.id === newJobId) || jobs[0];

    if (!newCustomer.trim()) {
      toast.warning("Please enter a customer name.");
      return;
    }

    if (!proj || !site || !job) {
      toast.warning("Please select a valid Project, Site, and Job.");
      return;
    }

    const taxRate = applyGst ? 18 : 0;
    const taxAmt = applyGst ? Math.round((rawAmt * taxRate) / 100) : 0;
    const totalAmt = rawAmt + taxAmt;

    addInvoice({
      invoiceNumber: "",
      organizationId: currentUser?.companyId || "ORG-DEFAULT",
      customerName: newCustomer.trim(),
      projectId: proj.id,
      projectName: proj.name,
      siteId: site.id,
      siteName: site.name,
      jobId: job.id,
      jobTitle: job.title,
      amount: rawAmt,
      taxRate,
      taxAmount: taxAmt,
      totalAmount: totalAmt,
      paidAmount: 0,
      status: "Sent",
      issueDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      dueDate: newDueDate || "2026-10-18",
      lineItems: [
        {
          id: `li-${Date.now()}`,
          description: newDescription || "Project Milestone Billing",
          quantity: 1,
          unitPrice: rawAmt,
          amount: rawAmt,
        },
      ],
      createdBy: currentUser?.name || "Finance Manager",
      createdById: currentUser?.id ? String(currentUser.id) : "user-fm",
    });

    toast.success("Customer invoice created successfully!");
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-onyx tracking-tight">
            Customer Invoices
          </h2>
          <p className="text-body text-ash mt-0.5">
            Track billed receivables, milestone billing, and customer payments connected to projects and jobs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4 py-2.5 text-sm font-medium shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Create Customer Invoice</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-[12px] border border-pebble shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              { key: "ALL", label: "All Invoices" },
              { key: "SENT", label: "Sent / Pending" },
              { key: "PARTIAL", label: "Partially Paid" },
              { key: "PAID", label: "Fully Paid" },
              { key: "OVERDUE", label: "Overdue" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition cursor-pointer shrink-0 ${
                  statusFilter === tab.key
                    ? "bg-onyx text-white shadow-2xs font-semibold"
                    : "bg-stone text-ash hover:bg-mist hover:text-onyx"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="h-3.5 w-3.5 text-ash absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoice, customer, job, site..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs text-onyx placeholder:text-ash bg-stone rounded-[8px] border border-pebble outline-none focus:border-onyx transition"
            />
          </div>
        </div>

        {/* Cascaded Context Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-pebble/60 text-xs">
          {/* Project Filter */}
          <div className="flex items-center gap-2">
            <span className="text-ash font-medium shrink-0">Project:</span>
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

          {/* Site Filter */}
          <div className="flex items-center gap-2">
            <span className="text-ash font-medium shrink-0">Site:</span>
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

          {/* Job Filter */}
          <div className="flex items-center gap-2">
            <span className="text-ash font-medium shrink-0">Job:</span>
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="w-full bg-stone border border-pebble rounded-[6px] px-2.5 py-1 text-onyx outline-none focus:border-onyx"
            >
              <option value="ALL">All Jobs</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.id} - {j.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Contextual Table */}
      <div className="rounded-[12px] bg-white border border-pebble overflow-x-auto shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-pebble bg-stone text-eyebrow font-semibold text-ash uppercase tracking-wider">
              <th className="p-3.5">Invoice #</th>
              <th className="p-3.5">Customer</th>
              <th className="p-3.5">Project</th>
              <th className="p-3.5">Job Context</th>
              <th className="p-3.5">Site Yard</th>
              <th className="p-3.5 text-right">Amount</th>
              <th className="p-3.5 text-right">Paid</th>
              <th className="p-3.5 text-right">Outstanding</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-pebble text-body text-onyx">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-12 text-center text-ash text-xs">
                  No customer invoices match the selected filters. Create an invoice to begin.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => {
                const badge = getStatusBadge(inv.status);
                return (
                  <tr
                    key={inv.id}
                    className="hover:bg-stone/50 transition cursor-pointer group"
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    <td className="p-3.5 font-bold text-onyx">
                      <span className="group-hover:text-forest transition">
                        {inv.invoiceNumber}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium">{inv.customerName}</td>
                    <td className="p-3.5 text-ash">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-ash shrink-0" />
                        <span className="truncate max-w-[150px]">
                          {inv.projectName}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-onyx text-xs">
                        {inv.jobId}
                      </div>
                      <div className="text-[11px] text-ash truncate max-w-[160px]">
                        {inv.jobTitle}
                      </div>
                    </td>
                    <td className="p-3.5 text-ash">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-ash shrink-0" />
                        <span className="truncate max-w-[130px]">
                          {inv.siteName}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 text-right font-bold text-onyx">
                      {formatCurrency(inv.totalAmount || inv.amount)}
                    </td>
                    <td className="p-3.5 text-right font-medium text-success-text">
                      {formatCurrency(inv.paidAmount || 0)}
                    </td>
                    <td className="p-3.5 text-right font-bold text-hazard-text">
                      {formatCurrency(inv.outstandingAmount || 0)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-eyebrow font-semibold border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div
                        className="flex items-center justify-end gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {inv.outstandingAmount > 0 && (
                          <button
                            type="button"
                            onClick={() => handleOpenPayment(inv)}
                            className="bg-forest hover:bg-forest-hover text-white rounded-[6px] px-2.5 py-1 text-eyebrow font-medium cursor-pointer shadow-2xs transition"
                          >
                            Pay
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          className="border border-pebble rounded-[6px] px-2.5 py-1 text-eyebrow font-medium text-onyx bg-white hover:bg-mist cursor-pointer transition"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* INVOICE DETAIL MODAL                                                      */}
      {/* ========================================================================= */}
      {selectedInvoice && !showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-[18px] bg-white p-6 shadow-2xl border border-pebble animate-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedInvoice(null)}
              className="absolute right-4 top-4 rounded-[8px] p-1.5 text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-start justify-between border-b border-pebble pb-4 pr-8">
              <div>
                <span className="text-eyebrow font-semibold tracking-wider text-forest uppercase">
                  CUSTOMER INVOICE
                </span>
                <h3 className="text-2xl font-black text-onyx mt-0.5">
                  {selectedInvoice.invoiceNumber}
                </h3>
                <p className="text-xs text-ash mt-1">
                  Issued to{" "}
                  <strong className="text-onyx">
                    {selectedInvoice.customerName}
                  </strong>{" "}
                  on {selectedInvoice.issueDate}
                </p>
              </div>

              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                  getStatusBadge(selectedInvoice.status).color
                }`}
              >
                {getStatusBadge(selectedInvoice.status).label}
              </span>
            </div>

            {/* 4 Connected Context Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="p-3 bg-stone rounded-[10px] border border-pebble">
                <span className="text-[10px] font-semibold text-ash uppercase block">
                  PROJECT
                </span>
                <p className="text-xs font-bold text-onyx mt-1 truncate">
                  {selectedInvoice.projectName}
                </p>
                <span className="text-[10px] text-ash">
                  {selectedInvoice.projectId}
                </span>
              </div>

              <div className="p-3 bg-stone rounded-[10px] border border-pebble">
                <span className="text-[10px] font-semibold text-ash uppercase block">
                  SITE YARD
                </span>
                <p className="text-xs font-bold text-onyx mt-1 truncate">
                  {selectedInvoice.siteName}
                </p>
                <span className="text-[10px] text-ash">
                  {selectedInvoice.siteId}
                </span>
              </div>

              <div className="p-3 bg-stone rounded-[10px] border border-pebble">
                <span className="text-[10px] font-semibold text-ash uppercase block">
                  JOB ASSIGNMENT
                </span>
                <p className="text-xs font-bold text-onyx mt-1 truncate">
                  {selectedInvoice.jobId}
                </p>
                <span className="text-[10px] text-ash truncate block">
                  {selectedInvoice.jobTitle}
                </span>
              </div>

              <div className="p-3 bg-stone rounded-[10px] border border-pebble">
                <span className="text-[10px] font-semibold text-ash uppercase block">
                  DUE DATE
                </span>
                <p className="text-xs font-bold text-onyx mt-1">
                  {selectedInvoice.dueDate}
                </p>
                <span className="text-[10px] text-ash">
                  By {selectedInvoice.createdBy}
                </span>
              </div>
            </div>

            {/* Financial Totals Pill */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-mist/60 rounded-[12px] border border-pebble mb-5 text-center">
              <div>
                <span className="text-[11px] text-ash font-medium block">
                  Total Billed
                </span>
                <span className="text-lg font-black text-onyx mt-0.5 block">
                  {formatCurrency(selectedInvoice.totalAmount)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-ash font-medium block">
                  Paid to Date
                </span>
                <span className="text-lg font-black text-success-text mt-0.5 block">
                  {formatCurrency(selectedInvoice.paidAmount || 0)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-ash font-medium block">
                  Outstanding Due
                </span>
                <span className="text-lg font-black text-hazard-text mt-0.5 block">
                  {formatCurrency(selectedInvoice.outstandingAmount || 0)}
                </span>
              </div>
            </div>

            {/* Line items */}
            <div className="border border-pebble rounded-[10px] overflow-hidden mb-5">
              <table className="w-full text-xs">
                <thead className="bg-stone border-b border-pebble font-semibold text-ash">
                  <tr>
                    <th className="p-2.5 text-left">Description</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Rate</th>
                    <th className="p-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pebble">
                  {(selectedInvoice.lineItems || []).map((li, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium text-onyx">
                        {li.description}
                      </td>
                      <td className="p-2.5 text-center text-ash">
                        {li.quantity}
                      </td>
                      <td className="p-2.5 text-right text-ash">
                        {formatCurrency(li.unitPrice)}
                      </td>
                      <td className="p-2.5 text-right font-bold text-onyx">
                        {formatCurrency(li.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedInvoice.notes && (
              <p className="text-xs text-ash italic mb-5">
                Note: {selectedInvoice.notes}
              </p>
            )}

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pebble">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-[8px] border border-pebble text-xs font-medium text-onyx hover:bg-stone transition cursor-pointer"
              >
                Close
              </button>
              {selectedInvoice.outstandingAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  className="px-4 py-2 rounded-[8px] bg-forest text-white text-xs font-semibold hover:bg-forest-hover shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Record Customer Payment</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECORD PAYMENT MODAL                                                      */}
      {/* ========================================================================= */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[18px] bg-white p-6 shadow-2xl border border-pebble animate-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="absolute right-4 top-4 rounded-[8px] p-1.5 text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-forest text-xs font-semibold uppercase">
              <CreditCard className="h-4 w-4" />
              <span>Record Customer Receipt</span>
            </div>
            <h3 className="text-lg font-bold text-onyx mt-1">
              Payment for {selectedInvoice.invoiceNumber}
            </h3>
            <p className="text-xs text-ash mt-0.5">
              Customer: {selectedInvoice.customerName} • Job:{" "}
              {selectedInvoice.jobId}
            </p>

            <form onSubmit={handleRecordPaymentSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Payment Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx focus:ring-1 focus:ring-onyx"
                />
                <span className="text-[11px] text-ash mt-1 block">
                  Outstanding balance:{" "}
                  <strong>
                    {formatCurrency(selectedInvoice.outstandingAmount)}
                  </strong>
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  }
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Transaction / Bank Reference # *
                </label>
                <input
                  type="text"
                  required
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g. RTGS-991823"
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx focus:ring-1 focus:ring-onyx"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Received via primary escrow account"
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pebble mt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-[8px] border border-pebble text-xs font-medium text-onyx hover:bg-stone transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[8px] bg-forest text-white text-xs font-semibold hover:bg-forest-hover shadow-xs transition cursor-pointer"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE INVOICE MODAL                                                      */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-[18px] bg-white p-6 shadow-2xl border border-pebble animate-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 rounded-[8px] p-1.5 text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-eyebrow font-semibold tracking-wider text-forest uppercase">
                NEW INVOICE
              </span>
              <h3 className="text-lg font-bold text-onyx mt-0.5">
                Create Customer Invoice
              </h3>
              <p className="text-xs text-ash mt-0.5">
                Preserve Organization → Project → Site → Job context for receivables tracking.
              </p>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="mt-4 space-y-3.5">
              {/* Customer */}
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Customer / Developer Client *
                </label>
                <input
                  type="text"
                  required
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx focus:ring-1 focus:ring-onyx"
                />
              </div>

              {/* Project -> Site -> Job Cascading Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Project *
                  </label>
                  <select
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    className="w-full h-9 rounded-[8px] border border-pebble bg-white px-2 text-xs text-onyx outline-none focus:border-onyx"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Site *
                  </label>
                  <select
                    value={newSiteId}
                    onChange={(e) => setNewSiteId(e.target.value)}
                    className="w-full h-9 rounded-[8px] border border-pebble bg-white px-2 text-xs text-onyx outline-none focus:border-onyx"
                  >
                    {availableSites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Job *
                  </label>
                  <select
                    value={newJobId}
                    onChange={(e) => setNewJobId(e.target.value)}
                    className="w-full h-9 rounded-[8px] border border-pebble bg-white px-2 text-xs text-onyx outline-none focus:border-onyx"
                  >
                    {availableJobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.id} - {j.title.slice(0, 15)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Milestone / Description *
                </label>
                <input
                  type="text"
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Milestone description..."
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                />
              </div>

              {/* Amount & Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Base Amount ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Payment Due Date
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                  />
                </div>
              </div>

              {/* GST toggle */}
              <div className="flex items-center gap-2 p-2.5 bg-stone rounded-[8px] border border-pebble">
                <input
                  type="checkbox"
                  id="applyGst"
                  checked={applyGst}
                  onChange={(e) => setApplyGst(e.target.checked)}
                  className="h-4 w-4 rounded accent-forest cursor-pointer"
                />
                <label htmlFor="applyGst" className="text-xs text-onyx cursor-pointer font-medium">
                  Apply 18% GST (Tax: {formatCurrency(Math.round(((parseFloat(newAmount) || 0) * 18) / 100))})
                </label>
              </div>

              {/* Total summary */}
              <div className="p-3 bg-mist/60 rounded-[8px] border border-pebble text-right">
                <span className="text-xs text-ash block">Total Payable:</span>
                <span className="text-lg font-black text-onyx block">
                  {formatCurrency(
                    (parseFloat(newAmount) || 0) +
                      (applyGst
                        ? Math.round(((parseFloat(newAmount) || 0) * 18) / 100)
                        : 0)
                  )}
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pebble">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-[8px] border border-pebble text-xs font-medium text-onyx hover:bg-stone transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[8px] bg-forest text-white text-xs font-semibold hover:bg-forest-hover shadow-xs transition cursor-pointer"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
