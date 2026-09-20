"use client";

import { useState, useMemo } from "react";
import {
  useFinanceStore,
  PaymentRecord,
  PaymentMethod,
  PaymentType,
} from "@/store/financeStore";
import { useLeadFlowStore } from "@/store/leadFlowStore";
import { useSiteStore } from "@/store/siteStore";
import { useTenderFlowStore } from "@/store/tenderFlowStore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/components/ui/toast";
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  MapPin,
  Briefcase,
  User,
  Calendar,
  IndianRupee,
  DollarSign,
  Download,
} from "lucide-react";

interface PaymentsViewProps {
  initialJobFilter?: string;
}

export default function PaymentsView({ initialJobFilter }: PaymentsViewProps) {
  const {
    payments,
    invoices,
    supplierBills,
    recordInvoicePayment,
    recordBillPayment,
    settings,
  } = useFinanceStore();

  const { projects = [] } = useLeadFlowStore();
  const { sites = [] } = useSiteStore();
  const { jobs = [] } = useTenderFlowStore();
  const currentUser = useAuthStore((state) => state.currentUser);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "CUSTOMER" | "SUPPLIER">("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [jobFilter, setJobFilter] = useState(initialJobFilter || "ALL");

  // Modals
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  // Form State
  const [targetType, setTargetType] = useState<PaymentType>("CUSTOMER_PAYMENT");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(
    invoices[0]?.id || ""
  );
  const [selectedBillId, setSelectedBillId] = useState(
    supplierBills[0]?.id || ""
  );
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("Bank Transfer");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const currencySymbol = settings.currencySymbol || "₹";

  const formatCurrency = (val: number) => {
    return `${currencySymbol}${val.toLocaleString("en-IN")}`;
  };

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch =
        p.paymentNumber.toLowerCase().includes(search.toLowerCase()) ||
        (p.customerName &&
          p.customerName.toLowerCase().includes(search.toLowerCase())) ||
        (p.supplierName &&
          p.supplierName.toLowerCase().includes(search.toLowerCase())) ||
        (p.invoiceNumber &&
          p.invoiceNumber.toLowerCase().includes(search.toLowerCase())) ||
        (p.billNumber &&
          p.billNumber.toLowerCase().includes(search.toLowerCase())) ||
        p.projectName.toLowerCase().includes(search.toLowerCase()) ||
        p.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
        p.jobId.toLowerCase().includes(search.toLowerCase()) ||
        p.reference.toLowerCase().includes(search.toLowerCase());

      const matchType =
        typeFilter === "ALL" ||
        (typeFilter === "CUSTOMER" && p.type === "CUSTOMER_PAYMENT") ||
        (typeFilter === "SUPPLIER" && p.type === "SUPPLIER_PAYMENT");

      const matchProj =
        projectFilter === "ALL" ||
        p.projectId === projectFilter ||
        p.projectName === projectFilter;

      const matchJob = jobFilter === "ALL" || p.jobId === jobFilter;

      return matchSearch && matchType && matchProj && matchJob;
    });
  }, [payments, search, typeFilter, projectFilter, jobFilter]);

  // Totals
  const customerTotal = useMemo(() => {
    return payments
      .filter((p) => p.type === "CUSTOMER_PAYMENT")
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const supplierTotal = useMemo(() => {
    return payments
      .filter((p) => p.type === "SUPPLIER_PAYMENT")
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  // Handle Form Submit
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmount) || 0;
    if (amt <= 0) {
      toast.warning("Please enter a valid payment amount.");
      return;
    }

    if (targetType === "CUSTOMER_PAYMENT") {
      const inv = invoices.find((i) => i.id === selectedInvoiceId);
      if (!inv) {
        toast.warning("Please select a valid customer invoice.");
        return;
      }
      recordInvoicePayment(
        inv.id,
        amt,
        paymentMethod,
        reference || `TXN-${Date.now().toString().slice(-6)}`,
        currentUser?.name || "Finance Manager",
        notes
      );
      toast.success(`Customer payment of ${formatCurrency(amt)} recorded against ${inv.invoiceNumber}!`);
    } else {
      const bill = supplierBills.find((b) => b.id === selectedBillId);
      if (!bill) {
        toast.warning("Please select a valid supplier bill.");
        return;
      }
      recordBillPayment(
        bill.id,
        amt,
        paymentMethod,
        reference || `NEFT-${Date.now().toString().slice(-6)}`,
        currentUser?.name || "Finance Manager",
        notes
      );
      toast.success(`Supplier payment of ${formatCurrency(amt)} recorded against ${bill.billNumber}!`);
    }

    setShowRecordModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-onyx tracking-tight">
            Payments Ledger &amp; Cash Flow
          </h2>
          <p className="text-body text-ash mt-0.5">
            Track customer receipts and supplier disbursements connected directly to jobs and invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setReference(`TXN-${Date.now().toString().slice(-6)}`);
            setShowRecordModal(true);
          }}
          className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4 py-2.5 text-sm font-medium shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[12px] bg-white p-4.5 border border-pebble shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ash">
              Customer Collections (Inflows)
            </span>
            <div className="h-8 w-8 rounded-[8px] bg-clear-bg text-success-text flex items-center justify-center">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-onyx mt-2">
            {formatCurrency(customerTotal)}
          </p>
          <span className="text-[11px] text-ash mt-1 block">
            {payments.filter((p) => p.type === "CUSTOMER_PAYMENT").length} receipts credited
          </span>
        </div>

        <div className="rounded-[12px] bg-white p-4.5 border border-pebble shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ash">
              Supplier Payments (Outflows)
            </span>
            <div className="h-8 w-8 rounded-[8px] bg-sunfleck text-onyx flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-onyx mt-2">
            {formatCurrency(supplierTotal)}
          </p>
          <span className="text-[11px] text-ash mt-1 block">
            {payments.filter((p) => p.type === "SUPPLIER_PAYMENT").length} disbursements paid
          </span>
        </div>

        <div className="rounded-[12px] bg-white p-4.5 border border-pebble shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ash">
              Net Cash Flow
            </span>
            <div className="h-8 w-8 rounded-[8px] bg-breath text-onyx flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p
            className={`text-2xl font-bold mt-2 ${
              customerTotal >= supplierTotal
                ? "text-success-text"
                : "text-hazard-text"
            }`}
          >
            {formatCurrency(customerTotal - supplierTotal)}
          </p>
          <span className="text-[11px] text-ash mt-1 block">
            Operational liquidity surplus
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-[12px] border border-pebble shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Type Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              { key: "ALL", label: "All Transactions" },
              { key: "CUSTOMER", label: "Customer Receipts" },
              { key: "SUPPLIER", label: "Supplier Disbursements" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTypeFilter(tab.key as any)}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition cursor-pointer shrink-0 ${
                  typeFilter === tab.key
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
              placeholder="Search reference, party, job..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs text-onyx placeholder:text-ash bg-stone rounded-[8px] border border-pebble outline-none focus:border-onyx transition"
            />
          </div>
        </div>

        {/* Cascaded Context Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-pebble/60 text-xs">
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

      {/* Payments Contextual Table */}
      <div className="rounded-[12px] bg-white border border-pebble overflow-x-auto shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-pebble bg-stone text-eyebrow font-semibold text-ash uppercase tracking-wider">
              <th className="p-3.5">Payment #</th>
              <th className="p-3.5">Type</th>
              <th className="p-3.5">Customer / Supplier</th>
              <th className="p-3.5">Invoice / Bill Ref</th>
              <th className="p-3.5">Job Context</th>
              <th className="p-3.5">Method &amp; Ref</th>
              <th className="p-3.5">Date</th>
              <th className="p-3.5 text-right">Amount</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-pebble text-body text-onyx">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-12 text-center text-ash text-xs">
                  No payment records found matching the selected filters.
                </td>
              </tr>
            ) : (
              filteredPayments.map((p) => {
                const isCustomer = p.type === "CUSTOMER_PAYMENT";
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-stone/50 transition cursor-pointer group"
                    onClick={() => setSelectedPayment(p)}
                  >
                    <td className="p-3.5 font-bold text-onyx">
                      <span className="group-hover:text-forest transition">
                        {p.paymentNumber}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-eyebrow font-semibold border ${
                          isCustomer
                            ? "bg-clear-bg text-success-text border-pebble"
                            : "bg-sunfleck text-onyx border-pebble"
                        }`}
                      >
                        {isCustomer ? (
                          <>
                            <ArrowDownLeft className="h-3 w-3" /> Receipt
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="h-3 w-3" /> Disbursement
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium">
                      {isCustomer ? p.customerName : p.supplierName}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-forest text-xs">
                        {isCustomer ? p.invoiceNumber : p.billNumber}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-onyx text-xs">
                        {p.jobId}
                      </div>
                      <div className="text-[11px] text-ash truncate max-w-[150px]">
                        {p.jobTitle}
                      </div>
                    </td>
                    <td className="p-3.5 text-xs">
                      <div className="text-onyx font-medium">
                        {p.paymentMethod}
                      </div>
                      <div className="text-[11px] text-ash">{p.reference}</div>
                    </td>
                    <td className="p-3.5 text-xs text-ash">{p.paymentDate}</td>
                    <td
                      className={`p-3.5 text-right font-black ${
                        isCustomer ? "text-success-text" : "text-onyx"
                      }`}
                    >
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-eyebrow font-semibold bg-clear-bg text-success-text border border-pebble">
                        Completed
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedPayment(p)}
                        className="border border-pebble rounded-[6px] px-2.5 py-1 text-eyebrow font-medium text-onyx bg-white hover:bg-mist cursor-pointer transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* PAYMENT DETAIL MODAL                                                      */}
      {/* ========================================================================= */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-[18px] bg-white p-6 shadow-2xl border border-pebble animate-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              onClick={() => setSelectedPayment(null)}
              className="absolute right-4 top-4 rounded-[8px] p-1.5 text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-forest text-xs font-semibold uppercase">
              <CreditCard className="h-4 w-4" />
              <span>
                {selectedPayment.type === "CUSTOMER_PAYMENT"
                  ? "Customer Receipt Voucher"
                  : "Supplier Payment Voucher"}
              </span>
            </div>
            <h3 className="text-2xl font-black text-onyx mt-0.5">
              {selectedPayment.paymentNumber}
            </h3>
            <p className="text-xs text-ash mt-0.5">
              Transaction Ref: <strong>{selectedPayment.reference}</strong> on{" "}
              {selectedPayment.paymentDate}
            </p>

            <div className="my-4 p-4 bg-mist/60 rounded-[12px] border border-pebble text-center">
              <span className="text-xs text-ash font-medium block">
                Transaction Value
              </span>
              <span className="text-3xl font-black text-onyx mt-0.5 block">
                {formatCurrency(selectedPayment.amount)}
              </span>
              <span className="text-xs text-success-text font-semibold inline-flex items-center gap-1 mt-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Reconciled &amp; Settled
              </span>
            </div>

            <div className="space-y-2 text-xs border border-pebble rounded-[10px] p-3.5 bg-stone">
              <div className="flex justify-between py-1 border-b border-pebble/60">
                <span className="text-ash">Party Name:</span>
                <span className="font-bold text-onyx">
                  {selectedPayment.customerName || selectedPayment.supplierName}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-pebble/60">
                <span className="text-ash">Document Reference:</span>
                <span className="font-bold text-forest">
                  {selectedPayment.invoiceNumber || selectedPayment.billNumber}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-pebble/60">
                <span className="text-ash">Project:</span>
                <span className="font-medium text-onyx">
                  {selectedPayment.projectName}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-pebble/60">
                <span className="text-ash">Site Yard:</span>
                <span className="font-medium text-onyx">
                  {selectedPayment.siteName}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-pebble/60">
                <span className="text-ash">Job:</span>
                <span className="font-semibold text-onyx">
                  {selectedPayment.jobId} - {selectedPayment.jobTitle}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ash">Payment Method:</span>
                <span className="font-medium text-onyx">
                  {selectedPayment.paymentMethod}
                </span>
              </div>
            </div>

            {selectedPayment.notes && (
              <p className="text-xs text-ash italic mt-3">
                Note: {selectedPayment.notes}
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pebble mt-5">
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-2 rounded-[8px] border border-pebble text-xs font-medium text-onyx hover:bg-stone transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECORD NEW PAYMENT MODAL                                                  */}
      {/* ========================================================================= */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[18px] bg-white p-6 shadow-2xl border border-pebble animate-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowRecordModal(false)}
              className="absolute right-4 top-4 rounded-[8px] p-1.5 text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-eyebrow font-semibold tracking-wider text-forest uppercase">
                NEW PAYMENT
              </span>
              <h3 className="text-lg font-bold text-onyx mt-0.5">
                Record Financial Transaction
              </h3>
              <p className="text-xs text-ash mt-0.5">
                Apply payment against a customer invoice or supplier bill.
              </p>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="mt-4 space-y-3.5">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-stone rounded-[10px] border border-pebble">
                <button
                  type="button"
                  onClick={() => setTargetType("CUSTOMER_PAYMENT")}
                  className={`py-1.5 text-xs font-semibold rounded-[8px] transition cursor-pointer ${
                    targetType === "CUSTOMER_PAYMENT"
                      ? "bg-white text-onyx shadow-2xs"
                      : "text-ash hover:text-onyx"
                  }`}
                >
                  Customer Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType("SUPPLIER_PAYMENT")}
                  className={`py-1.5 text-xs font-semibold rounded-[8px] transition cursor-pointer ${
                    targetType === "SUPPLIER_PAYMENT"
                      ? "bg-white text-onyx shadow-2xs"
                      : "text-ash hover:text-onyx"
                  }`}
                >
                  Supplier Payment
                </button>
              </div>

              {/* Target Document Selection */}
              {targetType === "CUSTOMER_PAYMENT" ? (
                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Select Customer Invoice *
                  </label>
                  <select
                    value={selectedInvoiceId}
                    onChange={(e) => setSelectedInvoiceId(e.target.value)}
                    className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                  >
                    {invoices.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.invoiceNumber} — {i.customerName} (Due: {formatCurrency(i.outstandingAmount)})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Select Supplier Bill *
                  </label>
                  <select
                    value={selectedBillId}
                    onChange={(e) => setSelectedBillId(e.target.value)}
                    className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                  >
                    {supplierBills.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.billNumber} — {b.supplierName} (Due: {formatCurrency(b.outstandingAmount)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Payment Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx focus:ring-1 focus:ring-onyx"
                />
              </div>

              {/* Method */}
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

              {/* Reference */}
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Transaction Reference # *
                </label>
                <input
                  type="text"
                  required
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. TXN-889123"
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Payment verified by account executive"
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pebble mt-4">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 rounded-[8px] border border-pebble text-xs font-medium text-onyx hover:bg-stone transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[8px] bg-forest text-white text-xs font-semibold hover:bg-forest-hover shadow-xs transition cursor-pointer"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
