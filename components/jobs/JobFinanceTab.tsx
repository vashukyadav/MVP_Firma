"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useFinanceStore,
  CustomerInvoice,
  PurchaseOrder,
  SupplierBill,
  PaymentRecord,
  CostCategory,
  PaymentMethod,
} from "@/store/financeStore";
import { JobItem } from "@/store/tenderFlowStore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/components/ui/toast";
import {
  DollarSign,
  Plus,
  CreditCard,
  FileText,
  FileCheck2,
  ClipboardList,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  ExternalLink,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  X,
} from "lucide-react";

interface JobFinanceTabProps {
  job: JobItem;
}

export default function JobFinanceTab({ job }: JobFinanceTabProps) {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.currentUser);
  const {
    invoices,
    purchaseOrders,
    supplierBills,
    payments,
    budgets,
    getJobFinancialSummary,
    addPurchaseOrder,
    addSupplierBill,
    addInvoice,
    recordInvoicePayment,
    recordBillPayment,
    settings,
  } = useFinanceStore();

  // Modals for creating directly from Job view
  const [showCreatePOModal, setShowCreatePOModal] = useState(false);
  const [showCreateBillModal, setShowCreateBillModal] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);

  // Forms
  const [poSupplier, setPoSupplier] = useState("");
  const [poAmount, setPoAmount] = useState("");
  const [poCategory, setPoCategory] = useState<CostCategory>("Materials");
  const [poDesc, setPoDesc] = useState("");

  const [billSupplier, setBillSupplier] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billCategory, setBillCategory] = useState<CostCategory>("Materials");

  const [invAmount, setInvAmount] = useState("");
  const [invDesc, setInvDesc] = useState("");

  const currencySymbol = settings.currencySymbol || "₹";

  const formatCurrency = (val: number) => {
    return `${currencySymbol}${val.toLocaleString("en-IN")}`;
  };

  const summary = useMemo(() => {
    return getJobFinancialSummary(job.id, {
      timesheets: job.timesheets,
      variations: job.variations,
    });
  }, [job, getJobFinancialSummary]);

  // Connected POs, Bills, Invoices, Payments for this Job
  const jobPOs = useMemo(() => {
    return purchaseOrders.filter((p) => p.jobId === job.id);
  }, [purchaseOrders, job.id]);

  const jobBills = useMemo(() => {
    return supplierBills.filter((b) => b.jobId === job.id);
  }, [supplierBills, job.id]);

  const jobInvoices = useMemo(() => {
    return invoices.filter((i) => i.jobId === job.id);
  }, [invoices, job.id]);

  const jobPayments = useMemo(() => {
    return payments.filter((p) => p.jobId === job.id);
  }, [payments, job.id]);

  // Handle PO Creation
  const handleCreatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(poAmount) || 0;
    if (amt <= 0) return;

    addPurchaseOrder({
      poNumber: "",
      organizationId: job.organizationId || "ORG-DEFAULT",
      supplierId: `SUP-${poSupplier.toUpperCase().replace(/\s+/g, "")}`,
      supplierName: poSupplier,
      projectId: job.projectId || "",
      projectName: job.projectName,
      siteId: job.siteId || "",
      siteName: job.siteName || job.location,
      jobId: job.id,
      jobTitle: job.title,
      amount: amt,
      category: poCategory,
      status: "Approved",
      orderDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      items: [
        {
          id: `poi-${Date.now()}`,
          description: poDesc || "Job Procurement Item",
          quantity: 1,
          unitPrice: amt,
          amount: amt,
        },
      ],
      createdBy: currentUser?.name || "Finance Manager",
    });

    toast.success("Purchase Order created and locked to this Job!");
    setShowCreatePOModal(false);
  };

  // Handle Bill Creation
  const handleCreateBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(billAmount) || 0;
    if (amt <= 0) return;

    addSupplierBill({
      billNumber: billNumber.trim() || `BILL-${Date.now().toString().slice(-4)}`,
      organizationId: job.organizationId || "ORG-DEFAULT",
      supplierId: `SUP-${billSupplier.toUpperCase().replace(/\s+/g, "")}`,
      supplierName: billSupplier,
      projectId: job.projectId || "",
      projectName: job.projectName,
      siteId: job.siteId || "",
      siteName: job.siteName || job.location,
      jobId: job.id,
      jobTitle: job.title,
      amount: amt,
      paidAmount: 0,
      status: "Pending",
      category: billCategory,
      billDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
      notes: "Direct bill entered from Job View",
      createdBy: currentUser?.name || "Finance Manager",
    });

    toast.success("Supplier Bill recorded for this Job!");
    setShowCreateBillModal(false);
  };

  // Handle Customer Invoice Creation
  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(invAmount) || 0;
    if (amt <= 0) return;

    addInvoice({
      invoiceNumber: "",
      organizationId: job.organizationId || "ORG-DEFAULT",
      customerName: job.client || "Client Partner",
      projectId: job.projectId || "",
      projectName: job.projectName,
      siteId: job.siteId || "",
      siteName: job.siteName || job.location,
      jobId: job.id,
      jobTitle: job.title,
      amount: amt,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: amt,
      paidAmount: 0,
      status: "Sent",
      issueDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      lineItems: [
        {
          id: `li-${Date.now()}`,
          description: invDesc || "Job Milestone Billing",
          quantity: 1,
          unitPrice: amt,
          amount: amt,
        },
      ],
      createdBy: currentUser?.name || "Finance Manager",
    });

    toast.success("Customer Invoice created and linked to this Job!");
    setShowCreateInvoiceModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Overview Context Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Contract Value */}
        <div className="rounded-[12px] bg-white p-4 border border-pebble shadow-2xs">
          <span className="text-xs font-semibold text-ash">Contract Value</span>
          <p className="text-2xl font-bold text-onyx mt-1">
            {formatCurrency(summary.contractValue)}
          </p>
          <span className="text-[11px] text-ash mt-1 block">
            Agreed customer price
          </span>
        </div>

        {/* Budget */}
        <div className="rounded-[12px] bg-white p-4 border border-pebble shadow-2xs">
          <span className="text-xs font-semibold text-ash">Approved Budget</span>
          <p className="text-2xl font-bold text-onyx mt-1">
            {formatCurrency(summary.budget)}
          </p>
          <span className="text-[11px] text-ash mt-1 block">
            Cost allocation ceiling
          </span>
        </div>

        {/* Actual Cost */}
        <div className="rounded-[12px] bg-white p-4 border border-pebble shadow-2xs">
          <span className="text-xs font-semibold text-ash">Actual Incurred Cost</span>
          <p className="text-2xl font-bold text-onyx mt-1">
            {formatCurrency(summary.actualCost)}
          </p>
          <span className="text-[11px] text-ash mt-1 block">
            From bills, timesheets &amp; variations
          </span>
        </div>

        {/* Remaining Budget */}
        <div className="rounded-[12px] bg-white p-4 border border-pebble shadow-2xs">
          <span className="text-xs font-semibold text-ash">Remaining Budget</span>
          <p
            className={`text-2xl font-bold mt-1 ${
              summary.remainingBudget >= 0
                ? "text-success-text"
                : "text-hazard-text"
            }`}
          >
            {formatCurrency(summary.remainingBudget)}
          </p>
          <span className="text-[11px] font-semibold mt-1 block text-ash">
            {summary.remainingBudget >= 0 ? "Under budget" : "Over budget deficit"}
          </span>
        </div>
      </div>

      {/* Traceability Flow Box */}
      <div className="rounded-[14px] bg-white border border-pebble p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-onyx uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-forest" />
            <span>Complete Financial Traceability for Job {job.id}</span>
          </span>
          <span className="text-xs text-ash">
            {job.projectName} • {job.siteName || job.location}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Procurement Path */}
          <div className="p-3 bg-stone rounded-[10px] border border-pebble space-y-1.5">
            <span className="text-[11px] font-bold text-forest uppercase block">
              Procurement &amp; Expense Trail:
            </span>
            {jobPOs.length > 0 || jobBills.length > 0 ? (
              <>
                <div className="flex items-center gap-2 flex-wrap font-semibold text-onyx text-xs">
                  <span className="bg-white px-2 py-0.5 rounded-[6px] border border-pebble">
                    JOB {job.id}
                  </span>
                  {jobPOs[0] && (
                    <>
                      <span>↓</span>
                      <span className="bg-white px-2 py-0.5 rounded-[6px] border border-pebble text-forest">
                        {jobPOs[0].poNumber}
                      </span>
                    </>
                  )}
                  {jobBills[0] && (
                    <>
                      <span>↓</span>
                      <span className="bg-white px-2 py-0.5 rounded-[6px] border border-pebble">
                        {jobBills[0].billNumber}
                      </span>
                    </>
                  )}
                  {jobPayments.find((p) => p.type === "SUPPLIER_PAYMENT") && (
                    <>
                      <span>↓</span>
                      <span className="bg-white px-2 py-0.5 rounded-[6px] border border-pebble text-success-text">
                        {jobPayments.find((p) => p.type === "SUPPLIER_PAYMENT")?.paymentNumber}
                      </span>
                    </>
                  )}
                </div>
                <span className="text-[11px] text-ash block">
                  Supplier: {jobBills[0]?.supplierName || jobPOs[0]?.supplierName || "—"} • Amount: {formatCurrency(jobBills[0]?.amount || jobPOs[0]?.amount || 0)}
                </span>
              </>
            ) : (
              <span className="text-[11px] text-ash block italic">
                No purchase orders or vendor bills recorded yet for this job.
              </span>
            )}
          </div>

          {/* Revenue Path */}
          <div className="p-3 bg-stone rounded-[10px] border border-pebble space-y-1.5">
            <span className="text-[11px] font-bold text-forest uppercase block">
              Customer Billing &amp; Collection Trail:
            </span>
            {jobInvoices.length > 0 ? (
              <>
                <div className="flex items-center gap-2 flex-wrap font-semibold text-onyx text-xs">
                  <span className="bg-white px-2 py-0.5 rounded-[6px] border border-pebble">
                    JOB {job.id}
                  </span>
                  <span>↓</span>
                  <span className="bg-white px-2 py-0.5 rounded-[6px] border border-pebble text-forest">
                    {jobInvoices[0].invoiceNumber}
                  </span>
                  {jobPayments.find((p) => p.type === "CUSTOMER_PAYMENT") && (
                    <>
                      <span>↓</span>
                      <span className="bg-white px-2 py-0.5 rounded-[6px] border border-pebble text-success-text">
                        {jobPayments.find((p) => p.type === "CUSTOMER_PAYMENT")?.paymentNumber}
                      </span>
                    </>
                  )}
                </div>
                <span className="text-[11px] text-ash block">
                  Customer: {jobInvoices[0].customerName} • Paid: {formatCurrency(jobInvoices[0].paidAmount)} (Due: {formatCurrency(jobInvoices[0].outstandingAmount)})
                </span>
              </>
            ) : (
              <span className="text-[11px] text-ash block italic">
                No customer invoices billed yet for this job.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="rounded-[14px] bg-white border border-pebble p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-onyx uppercase tracking-wider">
          Cost Categories vs Budget
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-pebble bg-stone text-eyebrow font-semibold text-ash uppercase tracking-wider">
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Allocated Budget</th>
                <th className="p-3 text-right">Actual Incurred</th>
                <th className="p-3 text-right">Remaining</th>
                <th className="p-3">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pebble">
              {summary.categories.map((cat) => {
                const percent =
                  cat.budget > 0
                    ? Math.min(100, Math.round((cat.actual / cat.budget) * 100))
                    : 0;
                const isOver = cat.actual > cat.budget;

                return (
                  <tr key={cat.category} className="hover:bg-stone/40 transition">
                    <td className="p-3 font-bold text-onyx">{cat.category}</td>
                    <td className="p-3 text-right font-medium text-onyx">
                      {formatCurrency(cat.budget)}
                    </td>
                    <td className="p-3 text-right font-bold text-onyx">
                      {formatCurrency(cat.actual)}
                    </td>
                    <td
                      className={`p-3 text-right font-semibold ${
                        isOver ? "text-hazard-text" : "text-success-text"
                      }`}
                    >
                      {formatCurrency(cat.remaining)}
                    </td>
                    <td className="p-3 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-stone rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isOver ? "bg-hazard" : "bg-forest"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-ash w-7 text-right">
                          {percent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4 Bottom Connected Tables: POs, Bills, Invoices, Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Connected Purchase Orders */}
        <div className="rounded-[14px] bg-white border border-pebble shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-pebble flex items-center justify-between bg-stone/50">
            <div>
              <h4 className="text-xs font-bold text-onyx uppercase tracking-wider">
                Purchase Orders ({jobPOs.length})
              </h4>
              <span className="text-[11px] text-ash">
                Procurement locked to Job {job.id}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowCreatePOModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-forest text-white rounded-[6px] hover:bg-forest-hover shadow-2xs cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              <span>Create PO</span>
            </button>
          </div>

          <div className="divide-y divide-pebble text-xs">
            {jobPOs.length === 0 ? (
              <p className="p-4 text-center text-ash text-xs">
                No purchase orders created for this job yet.
              </p>
            ) : (
              jobPOs.map((p) => (
                <div key={p.id} className="p-3 flex items-center justify-between hover:bg-stone/30">
                  <div>
                    <span className="font-bold text-onyx">{p.poNumber}</span>
                    <span className="text-ash text-[11px] ml-2">
                      {p.supplierName} • {p.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-onyx block">
                      {formatCurrency(p.amount)}
                    </span>
                    <span className="text-[10px] text-forest font-semibold">
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Connected Supplier Bills */}
        <div className="rounded-[14px] bg-white border border-pebble shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-pebble flex items-center justify-between bg-stone/50">
            <div>
              <h4 className="text-xs font-bold text-onyx uppercase tracking-wider">
                Supplier Bills ({jobBills.length})
              </h4>
              <span className="text-[11px] text-ash">
                Actual vendor costs incurred
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateBillModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-forest text-white rounded-[6px] hover:bg-forest-hover shadow-2xs cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              <span>Add Bill</span>
            </button>
          </div>

          <div className="divide-y divide-pebble text-xs">
            {jobBills.length === 0 ? (
              <p className="p-4 text-center text-ash text-xs">
                No supplier bills recorded for this job yet.
              </p>
            ) : (
              jobBills.map((b) => (
                <div key={b.id} className="p-3 flex items-center justify-between hover:bg-stone/30">
                  <div>
                    <span className="font-bold text-onyx">{b.billNumber}</span>
                    <span className="text-ash text-[11px] ml-2">
                      {b.supplierName} • PO: {b.poNumber || "Direct"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-onyx block">
                      {formatCurrency(b.amount)}
                    </span>
                    <span className="text-[10px] text-success-text font-semibold">
                      {b.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Connected Customer Invoices */}
        <div className="rounded-[14px] bg-white border border-pebble shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-pebble flex items-center justify-between bg-stone/50">
            <div>
              <h4 className="text-xs font-bold text-onyx uppercase tracking-wider">
                Customer Invoices ({jobInvoices.length})
              </h4>
              <span className="text-[11px] text-ash">
                Milestone billings to customer
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateInvoiceModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-forest text-white rounded-[6px] hover:bg-forest-hover shadow-2xs cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              <span>Create Invoice</span>
            </button>
          </div>

          <div className="divide-y divide-pebble text-xs">
            {jobInvoices.length === 0 ? (
              <p className="p-4 text-center text-ash text-xs">
                No customer invoices issued for this job yet.
              </p>
            ) : (
              jobInvoices.map((inv) => (
                <div key={inv.id} className="p-3 flex items-center justify-between hover:bg-stone/30">
                  <div>
                    <span className="font-bold text-onyx">{inv.invoiceNumber}</span>
                    <span className="text-ash text-[11px] ml-2">
                      {inv.customerName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-onyx block">
                      {formatCurrency(inv.totalAmount)}
                    </span>
                    <span className="text-[10px] text-ash font-medium">
                      Paid: {formatCurrency(inv.paidAmount || 0)} (Due: {formatCurrency(inv.outstandingAmount || 0)})
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Connected Payments */}
        <div className="rounded-[14px] bg-white border border-pebble shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-pebble flex items-center justify-between bg-stone/50">
            <div>
              <h4 className="text-xs font-bold text-onyx uppercase tracking-wider">
                Payment Transactions ({jobPayments.length})
              </h4>
              <span className="text-[11px] text-ash">
                Receipts &amp; vendor settlements
              </span>
            </div>
            <button
              type="button"
              onClick={() => router.push("/finance?tab=payments")}
              className="text-xs font-semibold text-forest hover:underline cursor-pointer"
            >
              All Payments →
            </button>
          </div>

          <div className="divide-y divide-pebble text-xs">
            {jobPayments.length === 0 ? (
              <p className="p-4 text-center text-ash text-xs">
                No payments recorded for this job yet.
              </p>
            ) : (
              jobPayments.map((p) => {
                const isCust = p.type === "CUSTOMER_PAYMENT";
                return (
                  <div key={p.id} className="p-3 flex items-center justify-between hover:bg-stone/30">
                    <div>
                      <span className="font-bold text-onyx">{p.paymentNumber}</span>
                      <span className="text-ash text-[11px] ml-2">
                        {isCust ? `Receipt (${p.customerName})` : `Disbursement (${p.supplierName})`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-black block ${
                          isCust ? "text-success-text" : "text-onyx"
                        }`}
                      >
                        {formatCurrency(p.amount)}
                      </span>
                      <span className="text-[10px] text-ash">
                        {p.paymentMethod} • {p.paymentDate}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE PO LOCKED TO JOB                                            */}
      {/* ========================================================================= */}
      {showCreatePOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[18px] bg-white p-6 shadow-2xl border border-pebble animate-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              onClick={() => setShowCreatePOModal(false)}
              className="absolute right-4 top-4 rounded-[8px] p-1.5 text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-eyebrow font-semibold tracking-wider text-forest uppercase">
                PROCUREMENT FOR JOB {job.id}
              </span>
              <h3 className="text-lg font-bold text-onyx mt-0.5">
                Create Purchase Order
              </h3>
              <p className="text-xs text-ash mt-0.5">
                Automatically locked to {job.projectName} • {job.siteName || job.location}.
              </p>
            </div>

            <form onSubmit={handleCreatePOSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  value={poSupplier}
                  onChange={(e) => setPoSupplier(e.target.value)}
                  placeholder="Enter supplier name"
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Order Amount ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={poAmount}
                    onChange={(e) => setPoAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Category *
                  </label>
                  <select
                    value={poCategory}
                    onChange={(e) => setPoCategory(e.target.value as CostCategory)}
                    className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                  >
                    <option value="Materials">Materials</option>
                    <option value="Labour">Labour</option>
                    <option value="Subcontractor">Subcontractor</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Item Description *
                </label>
                <input
                  type="text"
                  required
                  value={poDesc}
                  onChange={(e) => setPoDesc(e.target.value)}
                  placeholder="Item details..."
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pebble mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreatePOModal(false)}
                  className="px-4 py-2 rounded-[8px] border border-pebble text-xs font-medium text-onyx hover:bg-stone transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[8px] bg-forest text-white text-xs font-semibold hover:bg-forest-hover shadow-xs transition cursor-pointer"
                >
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE BILL LOCKED TO JOB                                          */}
      {/* ========================================================================= */}
      {showCreateBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[18px] bg-white p-6 shadow-2xl border border-pebble animate-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              onClick={() => setShowCreateBillModal(false)}
              className="absolute right-4 top-4 rounded-[8px] p-1.5 text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-eyebrow font-semibold tracking-wider text-forest uppercase">
                RECORD BILL FOR JOB {job.id}
              </span>
              <h3 className="text-lg font-bold text-onyx mt-0.5">
                Record Supplier Bill
              </h3>
              <p className="text-xs text-ash mt-0.5">
                Directly affects actual cost of Job {job.id}.
              </p>
            </div>

            <form onSubmit={handleCreateBillSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Supplier Bill # *
                </label>
                <input
                  type="text"
                  required
                  value={billNumber}
                  onChange={(e) => setBillNumber(e.target.value)}
                  placeholder="e.g. BILL-001"
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  value={billSupplier}
                  onChange={(e) => setBillSupplier(e.target.value)}
                  placeholder="Enter supplier name"
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Billed Amount ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Cost Category *
                  </label>
                  <select
                    value={billCategory}
                    onChange={(e) =>
                      setBillCategory(e.target.value as CostCategory)
                    }
                    className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                  >
                    <option value="Materials">Materials</option>
                    <option value="Labour">Labour</option>
                    <option value="Subcontractor">Subcontractor</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pebble mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateBillModal(false)}
                  className="px-4 py-2 rounded-[8px] border border-pebble text-xs font-medium text-onyx hover:bg-stone transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[8px] bg-forest text-white text-xs font-semibold hover:bg-forest-hover shadow-xs transition cursor-pointer"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE INVOICE LOCKED TO JOB                                       */}
      {/* ========================================================================= */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[18px] bg-white p-6 shadow-2xl border border-pebble animate-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              onClick={() => setShowCreateInvoiceModal(false)}
              className="absolute right-4 top-4 rounded-[8px] p-1.5 text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-eyebrow font-semibold tracking-wider text-forest uppercase">
                BILLING FOR JOB {job.id}
              </span>
              <h3 className="text-lg font-bold text-onyx mt-0.5">
                Issue Customer Invoice
              </h3>
              <p className="text-xs text-ash mt-0.5">
                Client: {job.client || "Client Partner"} • Project: {job.projectName}
              </p>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Invoice Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  value={invAmount}
                  onChange={(e) => setInvAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Description / Milestone *
                </label>
                <input
                  type="text"
                  required
                  value={invDesc}
                  onChange={(e) => setInvDesc(e.target.value)}
                  placeholder="Milestone description..."
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pebble mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="px-4 py-2 rounded-[8px] border border-pebble text-xs font-medium text-onyx hover:bg-stone transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[8px] bg-forest text-white text-xs font-semibold hover:bg-forest-hover shadow-xs transition cursor-pointer"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
