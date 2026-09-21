import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getActiveCompanyId,
  createTenantStorage,
  registerStoreRehydrator,
} from "@/lib/tenantContext";
import type { JobTimesheetEntry, JobVariation } from "./tenderFlowStore";

export type CostCategory =
  | "Materials"
  | "Labour"
  | "Subcontractor"
  | "Equipment"
  | "Other";

export type InvoiceStatus =
  | "Draft"
  | "Sent"
  | "Partially Paid"
  | "Paid"
  | "Overdue"
  | "Cancelled";

export type POStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Rejected"
  | "Billed"
  | "Completed";

export type BillStatus =
  | "Pending"
  | "Approved"
  | "Paid"
  | "Partially Paid"
  | "Overdue"
  | "Rejected";

export type PaymentType = "CUSTOMER_PAYMENT" | "SUPPLIER_PAYMENT";

export type PaymentMethod =
  | "Bank Transfer"
  | "UPI"
  | "Cheque"
  | "Credit Card"
  | "Cash";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface CustomerInvoice {
  id: string; // e.g. "INV-1001"
  invoiceNumber: string;
  organizationId: string;
  customerId?: string | number;
  customerName: string; // e.g. "ABC Developer"
  projectId: string; // e.g. "PRJ-ABC"
  projectName: string; // e.g. "ABC Commercial Building"
  siteId: string; // e.g. "SITE-BHP"
  siteName: string; // e.g. "Bhopal Site"
  jobId: string; // e.g. "J-1025"
  jobTitle: string; // e.g. "Electrical Drawing & Conduit Installation"
  amount: number; // Subtotal before tax e.g. 5000000
  taxRate: number; // e.g. 18 for 18% GST (or 0)
  taxAmount: number;
  totalAmount: number; // e.g. 5000000 or with tax
  paidAmount: number; // e.g. 3000000
  outstandingAmount: number; // e.g. 2000000
  status: InvoiceStatus;
  issueDate: string; // e.g. "18 Sep 2026"
  dueDate: string; // e.g. "18 Oct 2026"
  lineItems: InvoiceLineItem[];
  notes?: string;
  createdBy: string;
  createdById?: string;
  createdAt: string;
}

export interface POLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface PurchaseOrder {
  id: string; // e.g. "PO-001"
  poNumber: string;
  organizationId: string;
  supplierId: string;
  supplierName: string; // e.g. "BuildPro"
  supplierEmail?: string;
  supplierPhone?: string;
  projectId: string; // e.g. "PRJ-ABC"
  projectName: string; // e.g. "ABC Commercial Building"
  siteId: string; // e.g. "SITE-BHP"
  siteName: string; // e.g. "Bhopal Site"
  jobId: string; // e.g. "J-1025"
  jobTitle: string; // e.g. "Electrical Drawing & Conduit Installation"
  amount: number; // e.g. 300000
  taxAmount?: number;
  category: CostCategory; // Default "Materials"
  status: POStatus;
  orderDate: string; // e.g. "18 Sep 2026"
  expectedDelivery?: string;
  items: POLineItem[];
  notes?: string;
  createdBy: string;
  createdById?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface SupplierBill {
  id: string; // e.g. "BILL-204"
  billNumber: string;
  organizationId: string;
  supplierId: string;
  supplierName: string; // e.g. "BuildPro"
  poId?: string; // e.g. "PO-001"
  poNumber?: string;
  projectId: string; // e.g. "PRJ-ABC"
  projectName: string; // e.g. "ABC Commercial Building"
  siteId: string; // e.g. "SITE-BHP"
  siteName: string; // e.g. "Bhopal Site"
  jobId: string; // e.g. "J-1025"
  jobTitle: string; // e.g. "Electrical Drawing & Conduit Installation"
  amount: number; // e.g. 295000
  taxAmount?: number;
  paidAmount: number; // e.g. 295000
  outstandingAmount: number; // 0
  status: BillStatus;
  category: CostCategory; // "Materials"
  billDate: string; // e.g. "18 Sep 2026"
  dueDate: string; // e.g. "02 Oct 2026"
  notes?: string;
  createdBy: string;
  createdById?: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string; // e.g. "PAY-001"
  paymentNumber: string;
  type: PaymentType;
  organizationId: string;
  // If Customer Payment
  customerId?: string | number;
  customerName?: string; // e.g. "ABC Developer"
  invoiceId?: string; // e.g. "INV-1001"
  invoiceNumber?: string;
  // If Supplier Payment
  supplierId?: string;
  supplierName?: string; // e.g. "BuildPro"
  billId?: string; // e.g. "BILL-204"
  billNumber?: string;
  poId?: string; // e.g. "PO-001"
  poNumber?: string;
  // Job Hierarchy
  projectId: string; // e.g. "PRJ-ABC"
  projectName: string; // e.g. "ABC Commercial Building"
  siteId: string; // e.g. "SITE-BHP"
  siteName: string; // e.g. "Bhopal Site"
  jobId: string; // e.g. "J-1025"
  jobTitle: string; // e.g. "Electrical Drawing & Conduit Installation"
  amount: number; // e.g. 295000 or 3000000
  paymentMethod: PaymentMethod;
  reference: string; // e.g. "NEFT-991204"
  paymentDate: string; // e.g. "18 Sep 2026"
  status: "Completed" | "Pending" | "Failed";
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface BudgetCategoryAllocation {
  category: CostCategory;
  budget: number;
  notes?: string;
}

export interface JobBudgetRecord {
  id: string;
  jobId: string; // e.g. "J-1025"
  jobTitle: string;
  projectId: string; // e.g. "PRJ-ABC"
  projectName: string;
  siteId: string; // e.g. "SITE-BHP"
  siteName: string;
  contractValue: number; // e.g. 5000000
  totalBudget: number; // e.g. 3800000
  categories: BudgetCategoryAllocation[];
  updatedAt: string;
}

export interface FinanceSettings {
  baseCurrency: "INR" | "USD";
  currencySymbol: string;
  defaultTaxRate: number; // e.g. 18
  defaultPaymentTerms: string; // "Net 30"
  invoicePrefix: string;
  poPrefix: string;
  billPrefix: string;
  paymentPrefix: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
}

export interface JobCostCategoryBreakdown {
  category: CostCategory;
  budget: number;
  actual: number;
  remaining: number;
  variance: number; // budget - actual
  sourceCount: number;
}

export interface JobFinancialSummary {
  jobId: string;
  jobTitle: string;
  projectName: string;
  siteName: string;
  contractValue: number;
  budget: number;
  actualCost: number;
  remainingBudget: number;
  variance: number;
  totalInvoiced: number;
  totalRevenueCollected: number;
  outstandingReceivable: number;
  totalSupplierBills: number;
  totalSupplierPaid: number;
  outstandingPayable: number;
  grossProfit: number; // totalInvoiced (or contractValue) - actualCost
  grossMarginPercent: number;
  categories: JobCostCategoryBreakdown[];
  invoices: CustomerInvoice[];
  purchaseOrders: PurchaseOrder[];
  bills: SupplierBill[];
  payments: PaymentRecord[];
}

export interface SupplierLedgerSummary {
  supplierName: string;
  totalPOs: number;
  totalPOsValue: number;
  totalBills: number;
  totalBilledAmount: number;
  totalPaidAmount: number;
  outstandingBalance: number;
  pos: PurchaseOrder[];
  bills: SupplierBill[];
  payments: PaymentRecord[];
}

interface FinanceState {
  invoices: CustomerInvoice[];
  purchaseOrders: PurchaseOrder[];
  supplierBills: SupplierBill[];
  payments: PaymentRecord[];
  budgets: JobBudgetRecord[];
  settings: FinanceSettings;

  // Invoice actions
  addInvoice: (invoice: Omit<CustomerInvoice, "id" | "createdAt" | "outstandingAmount">) => CustomerInvoice;
  updateInvoice: (id: string, updates: Partial<CustomerInvoice>) => void;
  deleteInvoice: (id: string) => void;

  // PO actions
  addPurchaseOrder: (po: Omit<PurchaseOrder, "id" | "createdAt">) => PurchaseOrder;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => void;
  deletePurchaseOrder: (id: string) => void;
  approvePurchaseOrder: (id: string, approvedBy: string) => void;
  rejectPurchaseOrder: (id: string, remarks?: string) => void;

  // Bill actions
  addSupplierBill: (bill: Omit<SupplierBill, "id" | "createdAt" | "outstandingAmount">) => SupplierBill;
  createBillFromPO: (poId: string, customAmount?: number, billNumber?: string) => SupplierBill | null;
  updateSupplierBill: (id: string, updates: Partial<SupplierBill>) => void;
  deleteSupplierBill: (id: string) => void;

  // Payment actions
  addPayment: (payment: Omit<PaymentRecord, "id" | "createdAt">) => PaymentRecord;
  recordInvoicePayment: (
    invoiceId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    reference: string,
    recordedBy: string,
    notes?: string
  ) => PaymentRecord | null;
  recordBillPayment: (
    billId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    reference: string,
    recordedBy: string,
    notes?: string
  ) => PaymentRecord | null;
  deletePayment: (id: string) => void;

  // Budget actions
  setJobBudget: (budget: Omit<JobBudgetRecord, "id" | "updatedAt">) => JobBudgetRecord;
  updateJobBudget: (jobId: string, updates: Partial<JobBudgetRecord>) => void;

  // Settings
  updateSettings: (updates: Partial<FinanceSettings>) => void;

  // Selectors / Helpers
  getJobFinancialSummary: (
    jobId: string,
    externalData?: {
      timesheets?: JobTimesheetEntry[];
      variations?: JobVariation[];
    }
  ) => JobFinancialSummary;

  getSupplierLedger: (supplierName: string) => SupplierLedgerSummary;
  getAllSuppliers: () => string[];
  resetToDefaults: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT CONFIGURATION & EMPTY DATA ARRAYS
// ─────────────────────────────────────────────────────────────────────────────

const defaultSettings: FinanceSettings = {
  baseCurrency: "INR",
  currencySymbol: "₹",
  defaultTaxRate: 18,
  defaultPaymentTerms: "Net 30",
  invoicePrefix: "INV-",
  poPrefix: "PO-",
  billPrefix: "BILL-",
  paymentPrefix: "PAY-",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  upiId: "",
};

const defaultBudgets: JobBudgetRecord[] = [];
const defaultPurchaseOrders: PurchaseOrder[] = [];
const defaultSupplierBills: SupplierBill[] = [];
const defaultInvoices: CustomerInvoice[] = [];
const defaultPayments: PaymentRecord[] = [];

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      invoices: defaultInvoices,
      purchaseOrders: defaultPurchaseOrders,
      supplierBills: defaultSupplierBills,
      payments: defaultPayments,
      budgets: defaultBudgets,
      settings: defaultSettings,

      // ─────────────────────────────────────────────────────────
      // INVOICE ACTIONS
      // ─────────────────────────────────────────────────────────
      addInvoice: (data) => {
        const nextNum = get().invoices.length + 1001;
        const id = `${get().settings.invoicePrefix || "INV-"}${nextNum}`;
        const total = data.totalAmount || data.amount;
        const paid = data.paidAmount || 0;
        const outstanding = Math.max(0, total - paid);

        const newInvoice: CustomerInvoice = {
          ...data,
          id,
          invoiceNumber: id,
          outstandingAmount: outstanding,
          createdAt: new Date().toISOString().split("T")[0],
        };

        set((state) => ({
          invoices: [newInvoice, ...state.invoices],
        }));
        return newInvoice;
      },

      updateInvoice: (id, updates) => {
        set((state) => ({
          invoices: state.invoices.map((inv) => {
            if (inv.id !== id) return inv;
            const updated = { ...inv, ...updates };
            const total = updated.totalAmount || updated.amount;
            const paid = updated.paidAmount || 0;
            updated.outstandingAmount = Math.max(0, total - paid);
            if (updated.paidAmount >= total && total > 0) {
              updated.status = "Paid";
            } else if (updated.paidAmount > 0) {
              updated.status = "Partially Paid";
            }
            return updated;
          }),
        }));
      },

      deleteInvoice: (id) => {
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== id),
        }));
      },

      // ─────────────────────────────────────────────────────────
      // PO ACTIONS
      // ─────────────────────────────────────────────────────────
      addPurchaseOrder: (data) => {
        const nextNum = String(get().purchaseOrders.length + 1).padStart(3, "0");
        const id = `${get().settings.poPrefix || "PO-"}${nextNum}`;

        const newPO: PurchaseOrder = {
          ...data,
          id,
          poNumber: id,
          createdAt: new Date().toISOString().split("T")[0],
        };

        set((state) => ({
          purchaseOrders: [newPO, ...state.purchaseOrders],
        }));
        return newPO;
      },

      updatePurchaseOrder: (id, updates) => {
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((po) =>
            po.id === id ? { ...po, ...updates } : po
          ),
        }));
      },

      deletePurchaseOrder: (id) => {
        set((state) => ({
          purchaseOrders: state.purchaseOrders.filter((po) => po.id !== id),
        }));
      },

      approvePurchaseOrder: (id, approvedBy) => {
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((po) =>
            po.id === id
              ? {
                  ...po,
                  status: "Approved",
                  approvedBy,
                  approvedAt: new Date().toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }),
                }
              : po
          ),
        }));
      },

      rejectPurchaseOrder: (id, remarks) => {
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((po) =>
            po.id === id
              ? {
                  ...po,
                  status: "Rejected",
                  notes: remarks ? `${po.notes || ""} [Rejected: ${remarks}]` : po.notes,
                }
              : po
          ),
        }));
      },

      // ─────────────────────────────────────────────────────────
      // BILL ACTIONS
      // ─────────────────────────────────────────────────────────
      addSupplierBill: (data) => {
        const nextNum = get().supplierBills.length + 201;
        const id = `${get().settings.billPrefix || "BILL-"}${nextNum}`;
        const paid = data.paidAmount || 0;
        const outstanding = Math.max(0, data.amount - paid);

        const newBill: SupplierBill = {
          ...data,
          id,
          billNumber: id,
          outstandingAmount: outstanding,
          createdAt: new Date().toISOString().split("T")[0],
        };

        // If linked to PO, mark PO as Billed
        if (newBill.poId) {
          get().updatePurchaseOrder(newBill.poId, { status: "Billed" });
        }

        set((state) => ({
          supplierBills: [newBill, ...state.supplierBills],
        }));
        return newBill;
      },

      createBillFromPO: (poId, customAmount, billNumber) => {
        const po = get().purchaseOrders.find((p) => p.id === poId);
        if (!po) return null;

        const nextNum = get().supplierBills.length + 201;
        const id = billNumber || `${get().settings.billPrefix || "BILL-"}${nextNum}`;
        const amount = customAmount !== undefined ? customAmount : po.amount;

        const newBill: SupplierBill = {
          id,
          billNumber: id,
          organizationId: po.organizationId,
          supplierId: po.supplierId,
          supplierName: po.supplierName,
          poId: po.id,
          poNumber: po.poNumber,
          projectId: po.projectId,
          projectName: po.projectName,
          siteId: po.siteId,
          siteName: po.siteName,
          jobId: po.jobId,
          jobTitle: po.jobTitle,
          amount,
          paidAmount: 0,
          outstandingAmount: amount,
          status: "Pending",
          category: po.category,
          billDate: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          dueDate: new Date(Date.now() + 14 * 86400000).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          notes: `Generated from Purchase Order ${po.poNumber}`,
          createdBy: "Finance Manager",
          createdAt: new Date().toISOString().split("T")[0],
        };

        get().updatePurchaseOrder(po.id, { status: "Billed" });

        set((state) => ({
          supplierBills: [newBill, ...state.supplierBills],
        }));
        return newBill;
      },

      updateSupplierBill: (id, updates) => {
        set((state) => ({
          supplierBills: state.supplierBills.map((bill) => {
            if (bill.id !== id) return bill;
            const updated = { ...bill, ...updates };
            const paid = updated.paidAmount || 0;
            updated.outstandingAmount = Math.max(0, updated.amount - paid);
            if (updated.paidAmount >= updated.amount && updated.amount > 0) {
              updated.status = "Paid";
            } else if (updated.paidAmount > 0) {
              updated.status = "Partially Paid";
            }
            return updated;
          }),
        }));
      },

      deleteSupplierBill: (id) => {
        set((state) => ({
          supplierBills: state.supplierBills.filter((bill) => bill.id !== id),
        }));
      },

      // ─────────────────────────────────────────────────────────
      // PAYMENT ACTIONS
      // ─────────────────────────────────────────────────────────
      addPayment: (data) => {
        const nextNum = String(get().payments.length + 1).padStart(3, "0");
        const id = `${get().settings.paymentPrefix || "PAY-"}${nextNum}`;

        const newPayment: PaymentRecord = {
          ...data,
          id,
          paymentNumber: id,
          createdAt: new Date().toISOString().split("T")[0],
        };

        set((state) => ({
          payments: [newPayment, ...state.payments],
        }));
        return newPayment;
      },

      recordInvoicePayment: (invoiceId, amount, paymentMethod, reference, recordedBy, notes) => {
        const inv = get().invoices.find((i) => i.id === invoiceId);
        if (!inv) return null;

        const nextNum = String(get().payments.length + 1).padStart(3, "0");
        const payId = `${get().settings.paymentPrefix || "PAY-"}${nextNum}`;

        const newPayment: PaymentRecord = {
          id: payId,
          paymentNumber: payId,
          type: "CUSTOMER_PAYMENT",
          organizationId: inv.organizationId,
          customerId: inv.customerId,
          customerName: inv.customerName,
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          projectId: inv.projectId,
          projectName: inv.projectName,
          siteId: inv.siteId,
          siteName: inv.siteName,
          jobId: inv.jobId,
          jobTitle: inv.jobTitle,
          amount,
          paymentMethod,
          reference: reference || `TXN-${Date.now().toString().slice(-6)}`,
          paymentDate: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          status: "Completed",
          notes,
          recordedBy,
          createdAt: new Date().toISOString().split("T")[0],
        };

        // Update invoice paid amount
        const newPaid = (inv.paidAmount || 0) + amount;
        get().updateInvoice(inv.id, { paidAmount: newPaid });

        set((state) => ({
          payments: [newPayment, ...state.payments],
        }));
        return newPayment;
      },

      recordBillPayment: (billId, amount, paymentMethod, reference, recordedBy, notes) => {
        const bill = get().supplierBills.find((b) => b.id === billId);
        if (!bill) return null;

        const nextNum = String(get().payments.length + 1).padStart(3, "0");
        const payId = `${get().settings.paymentPrefix || "PAY-"}${nextNum}`;

        const newPayment: PaymentRecord = {
          id: payId,
          paymentNumber: payId,
          type: "SUPPLIER_PAYMENT",
          organizationId: bill.organizationId,
          supplierId: bill.supplierId,
          supplierName: bill.supplierName,
          billId: bill.id,
          billNumber: bill.billNumber,
          poId: bill.poId,
          poNumber: bill.poNumber,
          projectId: bill.projectId,
          projectName: bill.projectName,
          siteId: bill.siteId,
          siteName: bill.siteName,
          jobId: bill.jobId,
          jobTitle: bill.jobTitle,
          amount,
          paymentMethod,
          reference: reference || `NEFT-${Date.now().toString().slice(-6)}`,
          paymentDate: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          status: "Completed",
          notes,
          recordedBy,
          createdAt: new Date().toISOString().split("T")[0],
        };

        // Update bill paid amount
        const newPaid = (bill.paidAmount || 0) + amount;
        get().updateSupplierBill(bill.id, { paidAmount: newPaid });

        set((state) => ({
          payments: [newPayment, ...state.payments],
        }));
        return newPayment;
      },

      deletePayment: (id) => {
        set((state) => ({
          payments: state.payments.filter((p) => p.id !== id),
        }));
      },

      // ─────────────────────────────────────────────────────────
      // BUDGET ACTIONS
      // ─────────────────────────────────────────────────────────
      setJobBudget: (data) => {
        const id = `BUD-${data.jobId}`;
        const newBudget: JobBudgetRecord = {
          ...data,
          id,
          updatedAt: new Date().toISOString().split("T")[0],
        };

        set((state) => {
          const filtered = state.budgets.filter((b) => b.jobId !== data.jobId);
          return { budgets: [newBudget, ...filtered] };
        });
        return newBudget;
      },

      updateJobBudget: (jobId, updates) => {
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.jobId === jobId
              ? {
                  ...b,
                  ...updates,
                  updatedAt: new Date().toISOString().split("T")[0],
                }
              : b
          ),
        }));
      },

      // ─────────────────────────────────────────────────────────
      // SETTINGS
      // ─────────────────────────────────────────────────────────
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      // ─────────────────────────────────────────────────────────
      // COMPUTED SELECTORS / HELPERS
      // ─────────────────────────────────────────────────────────
      getJobFinancialSummary: (jobId, externalData) => {
        const state = get();
        const budgetRec = state.budgets.find((b) => b.jobId === jobId);

        // Filter connected records
        const jobInvoices = state.invoices.filter((inv) => inv.jobId === jobId);
        const jobPOs = state.purchaseOrders.filter((po) => po.jobId === jobId);
        const jobBills = state.supplierBills.filter((bill) => bill.jobId === jobId);
        const jobPayments = state.payments.filter((p) => p.jobId === jobId);

        // Revenue calculations
        const totalInvoiced = jobInvoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount), 0);
        const totalRevenueCollected = jobInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
        const outstandingReceivable = jobInvoices.reduce((sum, inv) => sum + (inv.outstandingAmount || 0), 0);

        // Supplier bills & payments
        const totalSupplierBills = jobBills.reduce((sum, b) => sum + b.amount, 0);
        const totalSupplierPaid = jobBills.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
        const outstandingPayable = jobBills.reduce((sum, b) => sum + (b.outstandingAmount || 0), 0);

        // Compute actual cost category breakdown:
        // Sources:
        // 1. Supplier Bills (billed actual costs)
        // 2. Approved Variations (cost impact)
        // 3. Timesheets (labour hours * rate)
        const categoriesMap: Record<CostCategory, { budget: number; actual: number; count: number }> = {
          Materials: { budget: 0, actual: 0, count: 0 },
          Labour: { budget: 0, actual: 0, count: 0 },
          Subcontractor: { budget: 0, actual: 0, count: 0 },
          Equipment: { budget: 0, actual: 0, count: 0 },
          Other: { budget: 0, actual: 0, count: 0 },
        };

        if (budgetRec?.categories) {
          budgetRec.categories.forEach((cat) => {
            if (categoriesMap[cat.category]) {
              categoriesMap[cat.category].budget = cat.budget;
            }
          });
        }

        // Supplier bills flow into categories
        jobBills.forEach((b) => {
          const cat = b.category || "Materials";
          if (categoriesMap[cat]) {
            categoriesMap[cat].actual += b.amount;
            categoriesMap[cat].count += 1;
          }
        });

        // POs that don't have bills yet can count as committed if needed, but actual cost is bill-based
        // Timesheets for Labour
        if (externalData?.timesheets) {
          const hourlyRate = 600; // standard hourly rate in ₹
          const timesheetLabourCost = externalData.timesheets.reduce(
            (sum, t) => sum + (t.hours || 0) * hourlyRate,
            0
          );
          if (timesheetLabourCost > 0) {
            categoriesMap.Labour.actual += timesheetLabourCost;
            categoriesMap.Labour.count += externalData.timesheets.length;
          }
        }

        // Approved Variations flow into Other or Materials
        if (externalData?.variations) {
          const approvedVars = externalData.variations.filter(
            (v) => v.status === "Approved"
          );
          const varCost = approvedVars.reduce((sum, v) => sum + (v.costImpact || 0), 0);
          if (varCost > 0) {
            categoriesMap.Other.actual += varCost;
            categoriesMap.Other.count += approvedVars.length;
          }
        }

        const categoriesList: JobCostCategoryBreakdown[] = Object.entries(categoriesMap).map(
          ([cat, data]) => ({
            category: cat as CostCategory,
            budget: data.budget,
            actual: data.actual,
            remaining: Math.max(0, data.budget - data.actual),
            variance: data.budget - data.actual,
            sourceCount: data.count,
          })
        );

        const totalBudget = budgetRec?.totalBudget || 3800000;
        const totalActualCost = categoriesList.reduce((sum, c) => sum + c.actual, 0);
        const remainingBudget = totalBudget - totalActualCost;
        const contractVal = budgetRec?.contractValue || 5000000;

        const grossProfit = (totalInvoiced || contractVal) - totalActualCost;
        const grossMarginPercent = contractVal > 0 ? Math.round((grossProfit / contractVal) * 100) : 0;

        return {
          jobId,
          jobTitle: budgetRec?.jobTitle || "Electrical Drawing & Conduit Installation",
          projectName: budgetRec?.projectName || "ABC Commercial Building",
          siteName: budgetRec?.siteName || "Bhopal Site",
          contractValue: contractVal,
          budget: totalBudget,
          actualCost: totalActualCost,
          remainingBudget,
          variance: totalBudget - totalActualCost,
          totalInvoiced,
          totalRevenueCollected,
          outstandingReceivable,
          totalSupplierBills,
          totalSupplierPaid,
          outstandingPayable,
          grossProfit,
          grossMarginPercent,
          categories: categoriesList,
          invoices: jobInvoices,
          purchaseOrders: jobPOs,
          bills: jobBills,
          payments: jobPayments,
        };
      },

      getSupplierLedger: (supplierName) => {
        const state = get();
        const norm = supplierName.trim().toLowerCase();

        const pos = state.purchaseOrders.filter(
          (p) => p.supplierName.trim().toLowerCase() === norm
        );
        const bills = state.supplierBills.filter(
          (b) => b.supplierName.trim().toLowerCase() === norm
        );
        const payments = state.payments.filter(
          (p) =>
            p.type === "SUPPLIER_PAYMENT" &&
            p.supplierName &&
            p.supplierName.trim().toLowerCase() === norm
        );

        const totalPOsValue = pos.reduce((sum, p) => sum + p.amount, 0);
        const totalBilledAmount = bills.reduce((sum, b) => sum + b.amount, 0);
        const totalPaidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        const outstandingBalance = Math.max(0, totalBilledAmount - totalPaidAmount);

        return {
          supplierName,
          totalPOs: pos.length,
          totalPOsValue,
          totalBills: bills.length,
          totalBilledAmount,
          totalPaidAmount,
          outstandingBalance,
          pos,
          bills,
          payments,
        };
      },

      getAllSuppliers: () => {
        const state = get();
        const setOfNames = new Set<string>();
        state.purchaseOrders.forEach((p) => p.supplierName && setOfNames.add(p.supplierName));
        state.supplierBills.forEach((b) => b.supplierName && setOfNames.add(b.supplierName));
        state.payments.forEach((p) => p.supplierName && setOfNames.add(p.supplierName));
        return Array.from(setOfNames);
      },

      resetToDefaults: () => {
        set({
          invoices: defaultInvoices,
          purchaseOrders: defaultPurchaseOrders,
          supplierBills: defaultSupplierBills,
          payments: defaultPayments,
          budgets: defaultBudgets,
          settings: defaultSettings,
        });
      },
    }),
    {
      name: "mini-firma-finance-store-v2",
      storage: createTenantStorage("mini-firma-finance-store-v2"),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const currentCompany = getActiveCompanyId();
        if (currentCompany === "ORG-DEFAULT") {
          if (!state.budgets || state.budgets.length === 0) {
            state.budgets = [...defaultBudgets];
          }
          if (!state.purchaseOrders || state.purchaseOrders.length === 0) {
            state.purchaseOrders = [...defaultPurchaseOrders];
          }
        } else {
          if (!state.invoices) state.invoices = [];
          if (!state.purchaseOrders) state.purchaseOrders = [];
          if (!state.supplierBills) state.supplierBills = [];
          if (!state.payments) state.payments = [];
          if (!state.budgets) state.budgets = [];
        }
      },
    }
  )
);

// Register store for automatic tenant rehydration
if (typeof window !== "undefined") {
  registerStoreRehydrator(() => {
    const cId = getActiveCompanyId();
    if (cId !== "ORG-DEFAULT") {
      useFinanceStore.setState({
        budgets: [],
        purchaseOrders: [],
        invoices: [],
        supplierBills: [],
        payments: [],
      });
    }
    useFinanceStore.persist.rehydrate();
  });
}
