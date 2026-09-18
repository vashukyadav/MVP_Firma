"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
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
} from "lucide-react";

interface FinanceDashboardProps {
  companyName?: string;
}

interface InvoiceItem {
  id: string;
  customer: string;
  job: string;
  amount: number;
  status: "Paid" | "Outstanding" | "Partial";
  date: string;
}

interface ApprovalItem {
  id: string;
  type: "Supplier Bill" | "Purchase Order" | "Variation";
  ref: string;
  supplier: string;
  amount: number;
  submitted: string;
  status: "Pending" | "Approved" | "Rejected";
}

export default function FinanceManagerDashboard({ companyName }: FinanceDashboardProps) {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const firstName = currentUser?.name?.split(" ")[0] || "Finance Manager";

  // Currency & Date Range states
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");
  const [selectedPeriod, setSelectedPeriod] = useState("1 Apr 2024 – 30 Apr 2024");
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  // Invoices state
  const [invoices, setInvoices] = useState<InvoiceItem[]>([
    {
      id: "INV-1001",
      customer: "Buildwell Pty Ltd",
      job: "J-001 Oak Rd",
      amount: 50000,
      status: "Paid",
      date: "10 Apr 2024",
    },
    {
      id: "INV-1002",
      customer: "City Developments",
      job: "J-014 Riverdale",
      amount: 120000,
      status: "Outstanding",
      date: "08 Apr 2024",
    },
    {
      id: "INV-1003",
      customer: "Horizon Homes",
      job: "J-020 Lakeside",
      amount: 75000,
      status: "Partial",
      date: "05 Apr 2024",
    },
    {
      id: "INV-1004",
      customer: "Maple Constructions",
      job: "J-018 Greenview",
      amount: 90000,
      status: "Paid",
      date: "01 Apr 2024",
    },
  ]);

  // Approvals state
  const [approvals, setApprovals] = useState<ApprovalItem[]>([
    {
      id: "APP-1",
      type: "Supplier Bill",
      ref: "BILL-204",
      supplier: "BuildPro Supplies",
      amount: 12500,
      submitted: "12 Apr 2024",
      status: "Pending",
    },
    {
      id: "APP-2",
      type: "Purchase Order",
      ref: "PO-332",
      supplier: "Euro Tiles",
      amount: 8200,
      submitted: "11 Apr 2024",
      status: "Pending",
    },
    {
      id: "APP-3",
      type: "Variation",
      ref: "VAR-019",
      supplier: "J-014 Riverdale",
      amount: 15000,
      submitted: "10 Apr 2024",
      status: "Pending",
    },
    {
      id: "APP-4",
      type: "Supplier Bill",
      ref: "BILL-198",
      supplier: "Ace Plumbing",
      amount: 6450,
      submitted: "09 Apr 2024",
      status: "Pending",
    },
  ]);

  // Cash Flow Bar Chart Data
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const cashFlowData = [
    { month: "Jan", inflow: 190000, outflow: 140000 },
    { month: "Feb", inflow: 260000, outflow: 220000 },
    { month: "Mar", inflow: 330000, outflow: 240000 },
    { month: "Apr", inflow: 250000, outflow: 210000 },
    { month: "May", inflow: 170000, outflow: 145000 },
    { month: "Jun", inflow: 195000, outflow: 145000 },
  ];

  // Accounts Receivable Aging Data
  const agingData = [
    { label: "Current (0–30 days)", amount: 120000, color: "#10b981", percent: 44.4 },
    { label: "31–60 days", amount: 80000, color: "#f59e0b", percent: 29.6 },
    { label: "61–90 days", amount: 50000, color: "#f97316", percent: 18.5 },
    { label: "90+ days", amount: 20000, color: "#ef4444", percent: 7.4 },
  ];

  // Active Modals
  const [activeModal, setActiveModal] = useState<
    "createInvoice" | "recordPayment" | "newPo" | "reconcileBank" | "invoiceDetail" | null
  >(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form States
  const [newInvoiceData, setNewInvoiceData] = useState({
    customer: "",
    job: "",
    amount: "",
    status: "Outstanding" as "Paid" | "Outstanding" | "Partial",
  });

  const [paymentData, setPaymentData] = useState({
    invoiceId: "",
    amount: "",
    method: "Bank Transfer",
    reference: "",
  });

  const [newPoData, setNewPoData] = useState({
    supplier: "",
    ref: "",
    amount: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Currency Formatter
  const formatMoney = (amount: number) => {
    if (currency === "INR") {
      return `₹${amount.toLocaleString("en-IN")}`;
    }
    return `$${amount.toLocaleString("en-US")}`;
  };

  // Metric values
  const totalInvoiced = useMemo(() => {
    return 1250000;
  }, []);

  const totalPaid = useMemo(() => {
    return 980000;
  }, []);

  const totalOutstanding = useMemo(() => {
    return 270000;
  }, []);

  const totalSupplierBills = useMemo(() => {
    return 420000;
  }, []);

  // Handlers
  const handleApprove = (id: string, ref: string) => {
    setApprovals((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Approved" } : item))
    );
    showToast(`✓ ${ref} approved successfully!`);
  };

  const handleReject = (id: string, ref: string) => {
    setApprovals((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Rejected" } : item))
    );
    showToast(`✕ ${ref} marked as rejected.`);
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoiceData.customer || !newInvoiceData.amount) {
      alert("Please enter customer name and amount");
      return;
    }
    const newId = `INV-${1000 + invoices.length + 1}`;
    const newInv: InvoiceItem = {
      id: newId,
      customer: newInvoiceData.customer,
      job: newInvoiceData.job || "J-022 Commercial Plaza",
      amount: parseFloat(newInvoiceData.amount) || 25000,
      status: newInvoiceData.status,
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
    setInvoices([newInv, ...invoices]);
    setActiveModal(null);
    setNewInvoiceData({ customer: "", job: "", amount: "", status: "Outstanding" });
    showToast(`Invoice ${newId} created successfully!`);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentData.invoiceId) {
      alert("Please select an invoice");
      return;
    }
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === paymentData.invoiceId ? { ...inv, status: "Paid" } : inv
      )
    );
    setActiveModal(null);
    showToast(`Payment of ${formatMoney(parseFloat(paymentData.amount) || 50000)} recorded for ${paymentData.invoiceId}!`);
    setPaymentData({ invoiceId: "", amount: "", method: "Bank Transfer", reference: "" });
  };

  const handleNewPoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoData.supplier || !newPoData.amount) {
      alert("Please enter supplier name and amount");
      return;
    }
    const newRef = newPoData.ref || `PO-${300 + approvals.length + 1}`;
    const newApp: ApprovalItem = {
      id: `APP-${approvals.length + 1}`,
      type: "Purchase Order",
      ref: newRef,
      supplier: newPoData.supplier,
      amount: parseFloat(newPoData.amount) || 10000,
      submitted: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: "Pending",
    };
    setApprovals([newApp, ...approvals]);
    setActiveModal(null);
    setNewPoData({ supplier: "", ref: "", amount: "" });
    showToast(`Purchase Order ${newRef} submitted for approval!`);
  };

  // Chart max value
  const maxBarValue = 400000;

  return (
    <div className="space-y-6 mt-3 font-sans pb-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-onyx text-white px-4 py-3 rounded-[12px] shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200 border border-pebble/30">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP WELCOME & FILTER BAR                                               */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-onyx tracking-tight">
            Welcome, Finance Manager
          </h1>
          <p className="text-xs sm:text-sm text-ash mt-0.5">
            Here&apos;s your financial overview across all projects.
          </p>
        </div>

        {/* Right Controls: Date Picker & Currency Switcher */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Currency Toggle */}
          <div className="flex items-center bg-white border border-pebble/80 rounded-[10px] p-1 shadow-2xs text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={`px-2.5 py-1 rounded-[6px] transition cursor-pointer ${
                currency === "USD"
                  ? "bg-onyx text-white shadow-2xs"
                  : "text-ash hover:text-onyx"
              }`}
            >
              $ USD
            </button>
            <button
              type="button"
              onClick={() => setCurrency("INR")}
              className={`px-2.5 py-1 rounded-[6px] transition cursor-pointer ${
                currency === "INR"
                  ? "bg-onyx text-white shadow-2xs"
                  : "text-ash hover:text-onyx"
              }`}
            >
              ₹ INR
            </button>
          </div>

          {/* Date Range Picker Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="flex items-center gap-2.5 rounded-[10px] bg-white border border-pebble/80 px-3.5 py-2 text-xs font-medium text-onyx shadow-2xs hover:bg-mist/40 transition cursor-pointer"
            >
              <Calendar className="h-4 w-4 text-ash shrink-0" />
              <span>{selectedPeriod}</span>
              <ChevronDown className="h-3.5 w-3.5 text-ash" />
            </button>

            {showPeriodDropdown && (
              <div className="absolute right-0 mt-1.5 w-64 rounded-[12px] bg-white border border-pebble shadow-xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ash border-b border-pebble/40 mb-1">
                  Select Billing Period
                </div>
                {[
                  "1 Apr 2024 – 30 Apr 2024",
                  "1 Mar 2024 – 31 Mar 2024",
                  "1 Jan 2024 – 31 Mar 2024 (Q1)",
                  "1 Apr 2024 – 30 Jun 2024 (Q2)",
                  "1 Jan 2024 – 31 Dec 2024 (FY24)",
                ].map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => {
                      setSelectedPeriod(period);
                      setShowPeriodDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-[8px] transition cursor-pointer ${
                      selectedPeriod === period
                        ? "bg-breath font-semibold text-onyx"
                        : "text-ash hover:bg-stone hover:text-onyx"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP 4 FINANCIAL METRIC CARDS                                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Invoiced */}
        <div className="rounded-[14px] bg-white p-5 border border-pebble/70 shadow-2xs flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-emerald-500 text-white shrink-0 shadow-xs">
            <DollarSign className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-medium text-ash block">Total Invoiced</span>
            <p className="text-2xl font-bold text-onyx tracking-tight mt-0.5">
              {formatMoney(totalInvoiced)}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              <span className="inline-flex items-center text-emerald-600 font-bold">
                <ArrowUp className="h-3.5 w-3.5 stroke-[2.5] mr-0.5" />
                12%
              </span>
              <span className="text-ash text-[11px]">vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Paid */}
        <div className="rounded-[14px] bg-white p-5 border border-pebble/70 shadow-2xs flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-blue-500 text-white shrink-0 shadow-xs">
            <CreditCard className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-medium text-ash block">Total Paid</span>
            <p className="text-2xl font-bold text-onyx tracking-tight mt-0.5">
              {formatMoney(totalPaid)}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              <span className="inline-flex items-center text-emerald-600 font-bold">
                <ArrowUp className="h-3.5 w-3.5 stroke-[2.5] mr-0.5" />
                8%
              </span>
              <span className="text-ash text-[11px]">vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 3: Outstanding */}
        <div className="rounded-[14px] bg-white p-5 border border-pebble/70 shadow-2xs flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-amber-500 text-white shrink-0 shadow-xs">
            <Clock className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-medium text-ash block">Outstanding</span>
            <p className="text-2xl font-bold text-onyx tracking-tight mt-0.5">
              {formatMoney(totalOutstanding)}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              <span className="inline-flex items-center text-rose-500 font-bold">
                <ArrowDown className="h-3.5 w-3.5 stroke-[2.5] mr-0.5" />
                5%
              </span>
              <span className="text-ash text-[11px]">vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 4: Supplier Bills */}
        <div className="rounded-[14px] bg-white p-5 border border-pebble/70 shadow-2xs flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-purple-500 text-white shrink-0 shadow-xs">
            <FileText className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-medium text-ash block">Supplier Bills</span>
            <p className="text-2xl font-bold text-onyx tracking-tight mt-0.5">
              {formatMoney(totalSupplierBills)}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              <span className="inline-flex items-center text-emerald-600 font-bold">
                <ArrowUp className="h-3.5 w-3.5 stroke-[2.5] mr-0.5" />
                10%
              </span>
              <span className="text-ash text-[11px]">vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CHARTS SECTION (Cash Flow Bar Chart + Accounts Receivable Donut Chart)  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Chart: Cash Flow Grouped Bar Chart (~7 Cols) */}
        <div className="lg:col-span-7 rounded-[16px] bg-white p-6 border border-pebble/70 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-bold text-onyx">Cash Flow</h2>
                <p className="text-xs text-ash mt-0.5">Monthly billing vs payments comparison</p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-onyx">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Inflow (Invoices)
                </span>
                <span className="flex items-center gap-1.5 text-onyx">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  Outflow (Payments)
                </span>
              </div>
            </div>

            {/* SVG / HTML Bar Chart */}
            <div className="relative h-64 w-full flex items-end pt-6 pb-6">
              {/* Y-Axis Grid Lines and Labels */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 pr-2">
                {[400, 300, 200, 100, 0].map((val) => (
                  <div key={val} className="flex items-center w-full">
                    <span className="text-[10px] font-semibold text-ash w-10 text-left">
                      {currency === "INR" ? `₹${val}L` : `$${val}K`}
                    </span>
                    <div className="flex-1 border-b border-pebble/40 border-dashed" />
                  </div>
                ))}
              </div>

              {/* Bars Container */}
              <div className="relative z-10 pl-11 w-full h-full flex items-end justify-between gap-2 sm:gap-4">
                {cashFlowData.map((item, idx) => {
                  const inflowHeight = (item.inflow / maxBarValue) * 100;
                  const outflowHeight = (item.outflow / maxBarValue) * 100;
                  const isHovered = hoveredMonth === idx;

                  return (
                    <div
                      key={item.month}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                      onMouseEnter={() => setHoveredMonth(idx)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      {/* Tooltip on Hover */}
                      {isHovered && (
                        <div className="absolute -top-12 bg-onyx text-white rounded-[8px] px-2.5 py-1.5 text-[10px] shadow-lg z-30 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-100 border border-pebble/30">
                          <p className="font-bold text-center border-b border-pebble/40 pb-0.5 mb-0.5">
                            {item.month} Performance
                          </p>
                          <div className="flex items-center justify-between gap-3 text-emerald-400 font-semibold">
                            <span>Inflow:</span>
                            <span>{formatMoney(item.inflow)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-blue-300 font-semibold">
                            <span>Outflow:</span>
                            <span>{formatMoney(item.outflow)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-ash font-medium pt-0.5 border-t border-pebble/40 mt-0.5">
                            <span>Net Surplus:</span>
                            <span className="text-white font-bold">
                              +{formatMoney(item.inflow - item.outflow)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Dual Bars */}
                      <div className="flex items-end justify-center gap-1.5 w-full">
                        {/* Inflow Bar (Green) */}
                        <div
                          className="w-1/2 max-w-[20px] bg-emerald-500 rounded-t-[4px] transition-all duration-300 hover:brightness-110"
                          style={{ height: `${inflowHeight}%` }}
                        />
                        {/* Outflow Bar (Blue) */}
                        <div
                          className="w-1/2 max-w-[20px] bg-blue-500 rounded-t-[4px] transition-all duration-300 hover:brightness-110"
                          style={{ height: `${outflowHeight}%` }}
                        />
                      </div>

                      {/* X-Axis Month Label */}
                      <span className="text-[11px] font-semibold text-ash mt-2">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Chart: Accounts Receivable Aging Donut Chart (~5 Cols) */}
        <div className="lg:col-span-5 rounded-[16px] bg-white p-6 border border-pebble/70 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h2 className="text-base font-bold text-onyx">Accounts Receivable (Aging)</h2>
              <p className="text-xs text-ash mt-0.5">Overdue receivables aging distribution</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto pt-2">
              {/* Donut Chart SVG */}
              <div className="relative flex items-center justify-center shrink-0 w-44 h-44">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    stroke="#f1f3f1"
                    strokeWidth="18"
                    fill="transparent"
                  />
                  {/* Segment 1: Current 0-30 days (44.4%) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    stroke="#10b981"
                    strokeWidth="18"
                    strokeDasharray="128.3 289"
                    strokeDashoffset="0"
                    fill="transparent"
                    className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                  />
                  {/* Segment 2: 31-60 days (29.6%) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    stroke="#f59e0b"
                    strokeWidth="18"
                    strokeDasharray="85.5 289"
                    strokeDashoffset="-128.3"
                    fill="transparent"
                    className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                  />
                  {/* Segment 3: 61-90 days (18.5%) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    stroke="#f97316"
                    strokeWidth="18"
                    strokeDasharray="53.5 289"
                    strokeDashoffset="-213.8"
                    fill="transparent"
                    className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                  />
                  {/* Segment 4: 90+ days (7.4%) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    stroke="#ef4444"
                    strokeWidth="18"
                    strokeDasharray="21.7 289"
                    strokeDashoffset="-267.3"
                    fill="transparent"
                    className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                  />
                </svg>

                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                  <span className="text-base font-bold text-onyx leading-tight">
                    {formatMoney(270000)}
                  </span>
                  <span className="text-[10px] font-medium text-ash mt-0.5">Outstanding</span>
                </div>
              </div>

              {/* Legend with exact amounts */}
              <div className="space-y-3 text-xs flex-1 w-full">
                {agingData.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-onyx font-medium text-[11px]">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                    </span>
                    <span className="font-bold text-onyx text-[12px]">
                      {formatMoney(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. LOWER SECTION: TWO DETAIL TABLES (Recent Invoices & Pending Approvals) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Table: Recent Invoices */}
        <div className="rounded-[16px] bg-white border border-pebble/70 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-pebble/50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-onyx">Recent Invoices</h3>
                <p className="text-xs text-ash mt-0.5">
                  Latest client billing statements and settlement status
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/finance")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-pebble/60 bg-stone/40 text-[11px] font-semibold text-ash uppercase tracking-wider">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Job</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pebble/40 text-onyx font-medium">
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setActiveModal("invoiceDetail");
                      }}
                      className="hover:bg-stone/50 transition cursor-pointer"
                    >
                      <td className="py-3 px-4 font-bold text-onyx">{inv.id}</td>
                      <td className="py-3 px-4 text-onyx">{inv.customer}</td>
                      <td className="py-3 px-4 text-ash">{inv.job}</td>
                      <td className="py-3 px-4 font-bold text-onyx">
                        {formatMoney(inv.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === "Paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : inv.status === "Outstanding"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                              inv.status === "Paid"
                                ? "bg-emerald-600"
                                : inv.status === "Outstanding"
                                ? "bg-amber-600"
                                : "bg-yellow-600"
                            }`}
                          />
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-ash text-[11px]">{inv.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Table: Pending Approvals */}
        <div className="rounded-[16px] bg-white border border-pebble/70 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-pebble/50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-onyx">Pending Approvals</h3>
                <p className="text-xs text-ash mt-0.5">
                  Bills, purchase orders, and variations requiring sign-off
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/finance")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-pebble/60 bg-stone/40 text-[11px] font-semibold text-ash uppercase tracking-wider">
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Ref #</th>
                    <th className="py-3 px-4">Supplier / Job</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pebble/40 text-onyx font-medium">
                  {approvals.map((item) => (
                    <tr key={item.id} className="hover:bg-stone/50 transition">
                      <td className="py-3 px-4 font-semibold text-onyx">{item.type}</td>
                      <td className="py-3 px-4 text-ash font-medium">{item.ref}</td>
                      <td className="py-3 px-4 text-onyx">{item.supplier}</td>
                      <td className="py-3 px-4 font-bold text-onyx">
                        {formatMoney(item.amount)}
                      </td>
                      <td className="py-3 px-4 text-ash text-[11px]">{item.submitted}</td>
                      <td className="py-3 px-4 text-right">
                        {item.status === "Pending" ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApprove(item.id, item.ref)}
                              title="Approve"
                              className="p-1 rounded-[6px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(item.id, item.ref)}
                              title="Reject"
                              className="p-1 rounded-[6px] bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-[4px] ${
                              item.status === "Approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. BOTTOM SECTION: QUICK ACTIONS                                         */}
      {/* ========================================================================= */}
      <div>
        <h3 className="text-base font-bold text-onyx mb-3">Quick Actions</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Action 1: Create Invoice */}
          <button
            type="button"
            onClick={() => setActiveModal("createInvoice")}
            className="rounded-[12px] bg-white p-3.5 border border-pebble/70 shadow-2xs hover:shadow-xs hover:border-pebble transition flex items-center gap-3 cursor-pointer group text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-blue-500 text-white shrink-0 group-hover:scale-105 transition shadow-2xs">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-onyx leading-snug">
              Create Invoice
            </span>
          </button>

          {/* Action 2: Record Payment */}
          <button
            type="button"
            onClick={() => setActiveModal("recordPayment")}
            className="rounded-[12px] bg-white p-3.5 border border-pebble/70 shadow-2xs hover:shadow-xs hover:border-pebble transition flex items-center gap-3 cursor-pointer group text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-emerald-500 text-white shrink-0 group-hover:scale-105 transition shadow-2xs">
              <CreditCard className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-onyx leading-snug">
              Record Payment
            </span>
          </button>

          {/* Action 3: New Purchase Order */}
          <button
            type="button"
            onClick={() => setActiveModal("newPo")}
            className="rounded-[12px] bg-white p-3.5 border border-pebble/70 shadow-2xs hover:shadow-xs hover:border-pebble transition flex items-center gap-3 cursor-pointer group text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-amber-500 text-white shrink-0 group-hover:scale-105 transition shadow-2xs">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-onyx leading-snug">
              New Purchase Order
            </span>
          </button>

          {/* Action 4: Reconcile Bank */}
          <button
            type="button"
            onClick={() => setActiveModal("reconcileBank")}
            className="rounded-[12px] bg-white p-3.5 border border-pebble/70 shadow-2xs hover:shadow-xs hover:border-pebble transition flex items-center gap-3 cursor-pointer group text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-purple-500 text-white shrink-0 group-hover:scale-105 transition shadow-2xs">
              <Landmark className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-onyx leading-snug">
              Reconcile Bank
            </span>
          </button>

          {/* Action 5: View Reports */}
          <button
            type="button"
            onClick={() => router.push("/reports")}
            className="rounded-[12px] bg-white p-3.5 border border-pebble/70 shadow-2xs hover:shadow-xs hover:border-pebble transition flex items-center gap-3 cursor-pointer group text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-sky-500 text-white shrink-0 group-hover:scale-105 transition shadow-2xs">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-onyx leading-snug">
              View Reports
            </span>
          </button>

          {/* Action 6: Financial Settings */}
          <button
            type="button"
            onClick={() => router.push("/setting")}
            className="rounded-[12px] bg-white p-3.5 border border-pebble/70 shadow-2xs hover:shadow-xs hover:border-pebble transition flex items-center gap-3 cursor-pointer group text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-onyx text-white shrink-0 group-hover:scale-105 transition shadow-2xs">
              <Settings className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-onyx leading-snug">
              Financial Settings
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. INTERACTIVE ACTION MODALS                                              */}
      {/* ========================================================================= */}

      {/* Modal 1: Create Invoice */}
      {activeModal === "createInvoice" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-2xl border border-pebble animate-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 rounded-[6px] p-1 text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-lg font-bold text-onyx flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span>Create New Invoice</span>
            </h2>
            <p className="text-xs text-ash mt-0.5">
              Draft and issue a client bill for active project milestones.
            </p>

            <form onSubmit={handleCreateInvoiceSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Customer / Client Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Skyline Developments Pty Ltd"
                  value={newInvoiceData.customer}
                  onChange={(e) =>
                    setNewInvoiceData({ ...newInvoiceData, customer: e.target.value })
                  }
                  className="w-full h-9 rounded-[8px] border border-pebble px-3 text-xs outline-none focus:border-onyx transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Job Reference / Site
                </label>
                <input
                  type="text"
                  placeholder="e.g. J-035 Kensington Heights"
                  value={newInvoiceData.job}
                  onChange={(e) =>
                    setNewInvoiceData({ ...newInvoiceData, job: e.target.value })
                  }
                  className="w-full h-9 rounded-[8px] border border-pebble px-3 text-xs outline-none focus:border-onyx transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Invoice Amount ({currency}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 65000"
                    value={newInvoiceData.amount}
                    onChange={(e) =>
                      setNewInvoiceData({ ...newInvoiceData, amount: e.target.value })
                    }
                    className="w-full h-9 rounded-[8px] border border-pebble px-3 text-xs outline-none focus:border-onyx transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newInvoiceData.status}
                    onChange={(e) =>
                      setNewInvoiceData({
                        ...newInvoiceData,
                        status: e.target.value as "Paid" | "Outstanding" | "Partial",
                      })
                    }
                    className="w-full h-9 rounded-[8px] border border-pebble px-2.5 text-xs outline-none focus:border-onyx bg-white transition cursor-pointer"
                  >
                    <option value="Outstanding">Outstanding</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-pebble/50">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-[8px] text-xs font-medium text-ash hover:bg-stone transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[8px] bg-onyx text-white text-xs font-bold hover:bg-black transition cursor-pointer shadow-xs"
                >
                  Save &amp; Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Record Payment */}
      {activeModal === "recordPayment" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-2xl border border-pebble animate-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 rounded-[6px] p-1 text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-lg font-bold text-onyx flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-500" />
              <span>Record Client Payment</span>
            </h2>
            <p className="text-xs text-ash mt-0.5">
              Apply customer remittance against pending receivables.
            </p>

            <form onSubmit={handleRecordPaymentSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Select Outstanding Invoice <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={paymentData.invoiceId}
                  onChange={(e) => {
                    const chosen = invoices.find((inv) => inv.id === e.target.value);
                    setPaymentData({
                      ...paymentData,
                      invoiceId: e.target.value,
                      amount: chosen ? String(chosen.amount) : "",
                    });
                  }}
                  className="w-full h-9 rounded-[8px] border border-pebble px-2.5 text-xs outline-none focus:border-onyx bg-white transition cursor-pointer"
                >
                  <option value="">Choose an invoice</option>
                  {invoices
                    .filter((inv) => inv.status !== "Paid")
                    .map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.id} &mdash; {inv.customer} ({formatMoney(inv.amount)})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Amount Received ({currency}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50000"
                    value={paymentData.amount}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, amount: e.target.value })
                    }
                    className="w-full h-9 rounded-[8px] border border-pebble px-3 text-xs outline-none focus:border-onyx transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentData.method}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, method: e.target.value })
                    }
                    className="w-full h-9 rounded-[8px] border border-pebble px-2.5 text-xs outline-none focus:border-onyx bg-white transition cursor-pointer"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Direct Deposit">Direct Deposit</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cheque">Bank Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Bank Reference / Transaction #
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR-982347102934"
                  value={paymentData.reference}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, reference: e.target.value })
                  }
                  className="w-full h-9 rounded-[8px] border border-pebble px-3 text-xs outline-none focus:border-onyx transition"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-pebble/50">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-[8px] text-xs font-medium text-ash hover:bg-stone transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[8px] bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: New Purchase Order */}
      {activeModal === "newPo" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-2xl border border-pebble animate-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 rounded-[6px] p-1 text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-lg font-bold text-onyx flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-amber-500" />
              <span>Generate Purchase Order</span>
            </h2>
            <p className="text-xs text-ash mt-0.5">
              Issue commercial purchase order to trade suppliers or sub-contractors.
            </p>

            <form onSubmit={handleNewPoSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Supplier / Trade Merchant <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UltraTech Cement Corp"
                  value={newPoData.supplier}
                  onChange={(e) =>
                    setNewPoData({ ...newPoData, supplier: e.target.value })
                  }
                  className="w-full h-9 rounded-[8px] border border-pebble px-3 text-xs outline-none focus:border-onyx transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    PO Reference #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PO-345"
                    value={newPoData.ref}
                    onChange={(e) =>
                      setNewPoData({ ...newPoData, ref: e.target.value })
                    }
                    className="w-full h-9 rounded-[8px] border border-pebble px-3 text-xs outline-none focus:border-onyx transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Amount ({currency}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 18500"
                    value={newPoData.amount}
                    onChange={(e) =>
                      setNewPoData({ ...newPoData, amount: e.target.value })
                    }
                    className="w-full h-9 rounded-[8px] border border-pebble px-3 text-xs outline-none focus:border-onyx transition"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-pebble/50">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-[8px] text-xs font-medium text-ash hover:bg-stone transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[8px] bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition cursor-pointer shadow-xs"
                >
                  Create &amp; Submit PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Reconcile Bank */}
      {activeModal === "reconcileBank" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-[16px] bg-white p-6 shadow-2xl border border-pebble animate-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 rounded-[6px] p-1 text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-lg font-bold text-onyx flex items-center gap-2">
              <Landmark className="h-5 w-5 text-purple-500" />
              <span>Automated Bank Reconciliation</span>
            </h2>
            <p className="text-xs text-ash mt-0.5">
              Live bank feed match with FIRMA enterprise ledger.
            </p>

            <div className="mt-4 space-y-3">
              <div className="p-3 bg-stone/70 rounded-[10px] border border-pebble/70 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-onyx">Primary Operating Account</p>
                  <p className="text-[11px] text-ash">HDFC Bank • Ending 8492</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">3 Matched</p>
                  <p className="text-[10px] text-ash">1 Unmatched</p>
                </div>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                <div className="p-2.5 rounded-[8px] border border-emerald-200 bg-emerald-50/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-onyx block">Deposit: Buildwell Pty Ltd</span>
                    <span className="text-[10px] text-emerald-700">
                      Auto-matched with INV-1001 (10 Apr 2024)
                    </span>
                  </div>
                  <span className="font-bold text-emerald-800">
                    +{formatMoney(50000)}
                  </span>
                </div>

                <div className="p-2.5 rounded-[8px] border border-emerald-200 bg-emerald-50/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-onyx block">Deposit: Maple Constructions</span>
                    <span className="text-[10px] text-emerald-700">
                      Auto-matched with INV-1004 (01 Apr 2024)
                    </span>
                  </div>
                  <span className="font-bold text-emerald-800">
                    +{formatMoney(90000)}
                  </span>
                </div>

                <div className="p-2.5 rounded-[8px] border border-amber-200 bg-amber-50/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-onyx block">Debit: Vendor Wire Ace Plumbing</span>
                    <span className="text-[10px] text-amber-700">
                      Matched to Supplier Bill BILL-198
                    </span>
                  </div>
                  <span className="font-bold text-amber-800">
                    -{formatMoney(6450)}
                  </span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-pebble/50">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-[8px] text-xs font-medium text-ash hover:bg-stone transition cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    showToast("All matched bank feed transactions reconciled successfully!");
                  }}
                  className="px-4 py-2 rounded-[8px] bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition cursor-pointer shadow-xs"
                >
                  Reconcile All Matches
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Invoice Detail Quick View */}
      {activeModal === "invoiceDetail" && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-2xl border border-pebble animate-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 rounded-[6px] p-1 text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-onyx">{selectedInvoice.id}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedInvoice.status === "Paid"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {selectedInvoice.status}
              </span>
            </div>
            <p className="text-xs text-ash">Invoice settlement specifications</p>

            <div className="mt-4 space-y-2.5 text-xs bg-stone/40 p-4 rounded-[10px] border border-pebble/60">
              <div className="flex justify-between">
                <span className="text-ash">Customer:</span>
                <span className="font-bold text-onyx">{selectedInvoice.customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ash">Job Site:</span>
                <span className="font-semibold text-onyx">{selectedInvoice.job}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ash">Invoice Date:</span>
                <span className="font-semibold text-onyx">{selectedInvoice.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ash">Due Period:</span>
                <span className="font-semibold text-onyx">Net 30 Days</span>
              </div>
              <div className="border-t border-pebble/60 pt-2 flex justify-between text-sm">
                <span className="font-bold text-onyx">Total Billed:</span>
                <span className="font-black text-onyx">
                  {formatMoney(selectedInvoice.amount)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              {selectedInvoice.status !== "Paid" && (
                <button
                  type="button"
                  onClick={() => {
                    setInvoices((prev) =>
                      prev.map((i) =>
                        i.id === selectedInvoice.id ? { ...i, status: "Paid" } : i
                      )
                    );
                    setActiveModal(null);
                    showToast(`Marked ${selectedInvoice.id} as Paid!`);
                  }}
                  className="px-3.5 py-2 rounded-[8px] bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                >
                  Mark as Paid
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  showToast(`Invoice ${selectedInvoice.id} exported as PDF.`);
                }}
                className="px-3.5 py-2 rounded-[8px] bg-onyx text-white text-xs font-bold hover:bg-black transition cursor-pointer flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
