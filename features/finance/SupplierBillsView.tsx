"use client";

import { useState, useMemo } from "react";
import {
  useFinanceStore,
  SupplierBill,
  PaymentMethod,
  CostCategory,
} from "@/store/financeStore";
import { useLeadFlowStore } from "@/store/leadFlowStore";
import { useSiteStore } from "@/store/siteStore";
import { useTenderFlowStore } from "@/store/tenderFlowStore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/components/ui/toast";
import {
  FileCheck2,
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
  Eye,
  Filter,
} from "lucide-react";

interface SupplierBillsViewProps {
  initialJobFilter?: string;
  onOpenCreate?: () => void;
}

export default function SupplierBillsView({
  initialJobFilter,
}: SupplierBillsViewProps) {
  const {
    supplierBills,
    purchaseOrders,
    addSupplierBill,
    recordBillPayment,
    settings,
    getAllSuppliers,
  } = useFinanceStore();

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
  const [selectedBill, setSelectedBill] = useState<SupplierBill | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Create Bill Form State
  const [supplierName, setSupplierName] = useState("");
  const [linkedPoId, setLinkedPoId] = useState("");
  const [newProjectId, setNewProjectId] = useState(projects[0]?.id || "");
  const [newSiteId, setNewSiteId] = useState("");
  const [newJobId, setNewJobId] = useState(initialJobFilter || "");
  const [newAmount, setNewAmount] = useState("");
  const [newBillNumber, setNewBillNumber] = useState("");
  const [newCategory, setNewCategory] = useState<CostCategory>("Materials");
  const [newDueDate, setNewDueDate] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("Bank Transfer");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  const suppliersList = useMemo(() => {
    return getAllSuppliers();
  }, [getAllSuppliers]);

  // When PO is selected, auto-fill project/site/job/supplier/category
  const handleSelectPO = (poId: string) => {
    setLinkedPoId(poId);
    if (poId === "NONE") return;
    const po = purchaseOrders.find((p) => p.id === poId);
    if (po) {
      setSupplierName(po.supplierName);
      setNewProjectId(po.projectId);
      setNewSiteId(po.siteId);
      setNewJobId(po.jobId);
      setNewCategory(po.category);
      setNewAmount(String(po.amount));
    }
  };

  // Filtered Bills List
  const filteredBills = useMemo(() => {
    return supplierBills.filter((bill) => {
      const matchSearch =
        bill.billNumber.toLowerCase().includes(search.toLowerCase()) ||
        bill.supplierName.toLowerCase().includes(search.toLowerCase()) ||
        (bill.poNumber &&
          bill.poNumber.toLowerCase().includes(search.toLowerCase())) ||
        bill.projectName.toLowerCase().includes(search.toLowerCase()) ||
        bill.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
        bill.jobId.toLowerCase().includes(search.toLowerCase()) ||
        bill.siteName.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PENDING" && bill.status === "Pending") ||
        (statusFilter === "PAID" && bill.status === "Paid") ||
        (statusFilter === "PARTIAL" && bill.status === "Partially Paid") ||
        (statusFilter === "OVERDUE" && bill.status === "Overdue");

      const matchProj =
        projectFilter === "ALL" ||
        bill.projectId === projectFilter ||
        bill.projectName === projectFilter;

      const matchSite =
        siteFilter === "ALL" ||
        bill.siteId === siteFilter ||
        bill.siteName === siteFilter;

      const matchJob = jobFilter === "ALL" || bill.jobId === jobFilter;

      return matchSearch && matchStatus && matchProj && matchSite && matchJob;
    });
  }, [supplierBills, search, statusFilter, projectFilter, siteFilter, jobFilter]);

  const currencySymbol = settings.currencySymbol || "₹";

  const formatCurrency = (val: number) => {
    return `${currencySymbol}${val.toLocaleString("en-IN")}`;
  };

  const getStatusBadge = (status: SupplierBill["status"]) => {
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
      case "Pending":
        return {
          label: "Pending",
          color: "bg-caution-bg text-caution-text border-pebble",
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
  const handleOpenPayment = (bill: SupplierBill) => {
    setSelectedBill(bill);
    setPaymentAmount(String(bill.outstandingAmount || bill.amount));
    setPaymentReference(`NEFT-${Date.now().toString().slice(-6)}`);
    setShowPaymentModal(true);
  };

  // Submit Payment
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;

    const amt = parseFloat(paymentAmount) || 0;
    if (amt <= 0) {
      toast.warning("Please enter a valid payment amount.");
      return;
    }

    recordBillPayment(
      selectedBill.id,
      amt,
      paymentMethod,
      paymentReference,
      currentUser?.name || "Finance Manager",
      paymentNotes
    );

    toast.success(`Payment of ${formatCurrency(amt)} recorded successfully against ${selectedBill.billNumber}!`);
    setShowPaymentModal(false);
    setSelectedBill(null);
  };

  // Submit Create Bill
  const handleCreateBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmt = parseFloat(newAmount) || 0;
    if (rawAmt <= 0) {
      toast.warning("Please enter a valid bill amount.");
      return;
    }

    const proj =
      projects.find((p) => p.id === newProjectId) || projects[0];
    const site =
      sites.find((s) => s.id === newSiteId) || sites[0];
    const job =
      jobs.find((j) => j.id === newJobId) || jobs[0];

    if (!supplierName.trim()) {
      toast.warning("Please enter a supplier name.");
      return;
    }

    if (!proj || !site || !job) {
      toast.warning("Please select a valid Project, Site, and Job.");
      return;
    }

    const po = purchaseOrders.find((p) => p.id === linkedPoId);

    addSupplierBill({
      billNumber: newBillNumber.trim() || "",
      organizationId: currentUser?.companyId || "ORG-DEFAULT",
      supplierId: `SUP-${supplierName.toUpperCase().replace(/\s+/g, "")}`,
      supplierName: supplierName.trim(),
      poId: po ? po.id : undefined,
      poNumber: po ? po.poNumber : undefined,
      projectId: proj.id,
      projectName: proj.name,
      siteId: site.id,
      siteName: site.name,
      jobId: job.id,
      jobTitle: job.title,
      amount: rawAmt,
      paidAmount: 0,
      status: "Pending",
      category: newCategory,
      billDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      dueDate: newDueDate || "2026-10-15",
      notes: newNotes,
      createdBy: currentUser?.name || "Finance Manager",
      createdById: currentUser?.id ? String(currentUser.id) : "user-fm",
    });

    toast.success("Supplier Bill recorded successfully!");
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-onyx tracking-tight">
            Bills &amp; Supplier Invoices
          </h2>
          <p className="text-body text-ash mt-0.5">
            Track vendor invoices, PO settlements, and supplier payments linked directly to jobs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4 py-2.5 text-sm font-medium shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Record Supplier Bill</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-[12px] border border-pebble shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              { key: "ALL", label: "All Bills" },
              { key: "PENDING", label: "Pending" },
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
              placeholder="Search bill, supplier, PO, job..."
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

      {/* Supplier Bills Contextual Table */}
      <div className="rounded-[12px] bg-white border border-pebble overflow-x-auto shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-pebble bg-stone text-eyebrow font-semibold text-ash uppercase tracking-wider">
              <th className="p-3.5">Bill #</th>
              <th className="p-3.5">Supplier</th>
              <th className="p-3.5">PO Ref</th>
              <th className="p-3.5">Project</th>
              <th className="p-3.5">Job Context</th>
              <th className="p-3.5">Site Yard</th>
              <th className="p-3.5 text-right">Amount</th>
              <th className="p-3.5 text-right">Paid</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-pebble text-body text-onyx">
            {filteredBills.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-12 text-center text-ash text-xs">
                  No supplier bills found matching the selected filters.
                </td>
              </tr>
            ) : (
              filteredBills.map((bill) => {
                const badge = getStatusBadge(bill.status);
                return (
                  <tr
                    key={bill.id}
                    className="hover:bg-stone/50 transition cursor-pointer group"
                    onClick={() => setSelectedBill(bill)}
                  >
                    <td className="p-3.5 font-bold text-onyx">
                      <span className="group-hover:text-forest transition">
                        {bill.billNumber}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium">{bill.supplierName}</td>
                    <td className="p-3.5">
                      {bill.poNumber ? (
                        <span className="font-semibold text-forest text-xs">
                          {bill.poNumber}
                        </span>
                      ) : (
                        <span className="text-ash text-xs">Direct Bill</span>
                      )}
                    </td>
                    <td className="p-3.5 text-ash">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-ash shrink-0" />
                        <span className="truncate max-w-[140px]">
                          {bill.projectName}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-onyx text-xs">
                        {bill.jobId}
                      </div>
                      <div className="text-[11px] text-ash truncate max-w-[150px]">
                        {bill.jobTitle}
                      </div>
                    </td>
                    <td className="p-3.5 text-ash">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-ash shrink-0" />
                        <span className="truncate max-w-[120px]">
                          {bill.siteName}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 text-right font-bold text-onyx">
                      {formatCurrency(bill.amount)}
                    </td>
                    <td className="p-3.5 text-right font-medium text-success-text">
                      {formatCurrency(bill.paidAmount || 0)}
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
                        {bill.outstandingAmount > 0 && (
                          <button
                            type="button"
                            onClick={() => handleOpenPayment(bill)}
                            className="bg-forest hover:bg-forest-hover text-white rounded-[6px] px-2.5 py-1 text-eyebrow font-medium cursor-pointer shadow-2xs transition"
                          >
                            Pay
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedBill(bill)}
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
      {/* BILL DETAIL MODAL                                                         */}
      {/* ========================================================================= */}
      {selectedBill && !showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-[18px] bg-white p-6 shadow-2xl border border-pebble animate-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedBill(null)}
              className="absolute right-4 top-4 rounded-[8px] p-1.5 text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-start justify-between border-b border-pebble pb-4 pr-8">
              <div>
                <span className="text-eyebrow font-semibold tracking-wider text-forest uppercase">
                  SUPPLIER INVOICE / BILL
                </span>
                <h3 className="text-2xl font-black text-onyx mt-0.5">
                  {selectedBill.billNumber}
                </h3>
                <p className="text-xs text-ash mt-1">
                  Issued by{" "}
                  <strong className="text-onyx">{selectedBill.supplierName}</strong>{" "}
                  • Category: {selectedBill.category}
                </p>
              </div>

              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                  getStatusBadge(selectedBill.status).color
                }`}
              >
                {getStatusBadge(selectedBill.status).label}
              </span>
            </div>

            {/* Context Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="p-3 bg-stone rounded-[10px] border border-pebble">
                <span className="text-[10px] font-semibold text-ash uppercase block">
                  PROJECT
                </span>
                <p className="text-xs font-bold text-onyx mt-1 truncate">
                  {selectedBill.projectName}
                </p>
                <span className="text-[10px] text-ash">{selectedBill.projectId}</span>
              </div>

              <div className="p-3 bg-stone rounded-[10px] border border-pebble">
                <span className="text-[10px] font-semibold text-ash uppercase block">
                  SITE YARD
                </span>
                <p className="text-xs font-bold text-onyx mt-1 truncate">
                  {selectedBill.siteName}
                </p>
                <span className="text-[10px] text-ash">{selectedBill.siteId}</span>
              </div>

              <div className="p-3 bg-stone rounded-[10px] border border-pebble">
                <span className="text-[10px] font-semibold text-ash uppercase block">
                  JOB ASSIGNMENT
                </span>
                <p className="text-xs font-bold text-onyx mt-1 truncate">
                  {selectedBill.jobId}
                </p>
                <span className="text-[10px] text-ash truncate block">
                  {selectedBill.jobTitle}
                </span>
              </div>

              <div className="p-3 bg-stone rounded-[10px] border border-pebble">
                <span className="text-[10px] font-semibold text-ash uppercase block">
                  PO REFERENCE
                </span>
                <p className="text-xs font-bold text-forest mt-1">
                  {selectedBill.poNumber || "Direct Vendor Bill"}
                </p>
                <span className="text-[10px] text-ash">
                  Due {selectedBill.dueDate}
                </span>
              </div>
            </div>

            {/* Amounts Pill */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-mist/60 rounded-[12px] border border-pebble mb-5 text-center">
              <div>
                <span className="text-[11px] text-ash font-medium block">
                  Total Bill Amount
                </span>
                <span className="text-lg font-black text-onyx mt-0.5 block">
                  {formatCurrency(selectedBill.amount)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-ash font-medium block">
                  Settled to Date
                </span>
                <span className="text-lg font-black text-success-text mt-0.5 block">
                  {formatCurrency(selectedBill.paidAmount || 0)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-ash font-medium block">
                  Outstanding Payable
                </span>
                <span className="text-lg font-black text-hazard-text mt-0.5 block">
                  {formatCurrency(selectedBill.outstandingAmount || 0)}
                </span>
              </div>
            </div>

            {selectedBill.notes && (
              <p className="text-xs text-ash italic mb-5">
                Note: {selectedBill.notes}
              </p>
            )}

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pebble">
              <button
                type="button"
                onClick={() => setSelectedBill(null)}
                className="px-4 py-2 rounded-[8px] border border-pebble text-xs font-medium text-onyx hover:bg-stone transition cursor-pointer"
              >
                Close
              </button>
              {selectedBill.outstandingAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  className="px-4 py-2 rounded-[8px] bg-forest text-white text-xs font-semibold hover:bg-forest-hover shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Record Supplier Payment</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECORD PAYMENT MODAL                                                      */}
      {/* ========================================================================= */}
      {showPaymentModal && selectedBill && (
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
              <span>Record Supplier Disbursement</span>
            </div>
            <h3 className="text-lg font-bold text-onyx mt-1">
              Payment for {selectedBill.billNumber}
            </h3>
            <p className="text-xs text-ash mt-0.5">
              Payable to: {selectedBill.supplierName} • Job: {selectedBill.jobId}
            </p>

            <form onSubmit={handleRecordPaymentSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Disbursement Amount ({currencySymbol}) *
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
                  Remaining balance to pay:{" "}
                  <strong>
                    {formatCurrency(selectedBill.outstandingAmount)}
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
                  placeholder="e.g. NEFT-889012"
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx focus:ring-1 focus:ring-onyx"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Payment Notes
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Cleared via corporate account"
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
      {/* CREATE BILL MODAL                                                         */}
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
                NEW SUPPLIER BILL
              </span>
              <h3 className="text-lg font-bold text-onyx mt-0.5">
                Record Supplier Invoice / Bill
              </h3>
              <p className="text-xs text-ash mt-0.5">
                Associate vendor bill with PO, Project, Site, and Job.
              </p>
            </div>

            <form onSubmit={handleCreateBillSubmit} className="mt-4 space-y-3.5">
              {/* Optional PO Link */}
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Link to Purchase Order (Optional)
                </label>
                <select
                  value={linkedPoId}
                  onChange={(e) => handleSelectPO(e.target.value)}
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                >
                  <option value="NONE">Direct Bill (No PO)</option>
                  {purchaseOrders.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.poNumber} — {p.supplierName} ({formatCurrency(p.amount)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Bill # */}
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Supplier Bill / Invoice Number *
                </label>
                <input
                  type="text"
                  required
                  value={newBillNumber}
                  onChange={(e) => setNewBillNumber(e.target.value)}
                  placeholder="e.g. BILL-001 or INV-001"
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx focus:ring-1 focus:ring-onyx"
                />
              </div>

              {/* Supplier */}
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  list="billSuppliersList"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Enter supplier name"
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                />
                <datalist id="billSuppliersList">
                  {suppliersList.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              {/* Project -> Site -> Job Grid */}
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
                    {sites.map((s) => (
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
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.id} - {j.title.slice(0, 15)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount & Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Bill Amount ({currencySymbol}) *
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

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Cost Category *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as CostCategory)}
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                >
                  <option value="Materials">Materials</option>
                  <option value="Labour">Labour</option>
                  <option value="Subcontractor">Subcontractor</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Final settlement after inspection"
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                />
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
                  Record Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
