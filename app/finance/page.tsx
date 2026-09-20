"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import FirmaLayout from "@/components/layout/FirmaLayout";
import InvoicesView from "@/features/finance/InvoicesView";
import PurchaseOrdersView from "@/features/finance/PurchaseOrdersView";
import SupplierBillsView from "@/features/finance/SupplierBillsView";
import PaymentsView from "@/features/finance/PaymentsView";
import JobCostsView from "@/features/finance/JobCostsView";
import BudgetsView from "@/features/finance/BudgetsView";
import FinancialReportsView from "@/features/finance/FinancialReportsView";
import PeopleSuppliersView from "@/features/finance/PeopleSuppliersView";
import FinanceSettingsView from "@/features/finance/FinanceSettingsView";
import FinanceManagerDashboard from "@/features/users/FinanceManagerDashboard";

export type FinanceTabKey =
  | "dashboard"
  | "invoices"
  | "purchase-orders"
  | "bills"
  | "payments"
  | "job-costs"
  | "budgets"
  | "reports"
  | "people-suppliers"
  | "settings";

const financeTabs: {
  key: FinanceTabKey;
  navName: string;
}[] = [
  { key: "dashboard", navName: "Dashboard" },
  { key: "invoices", navName: "Invoices" },
  { key: "purchase-orders", navName: "Purchase Orders" },
  { key: "bills", navName: "Bills & Supplier Invoices" },
  { key: "payments", navName: "Payments" },
  { key: "job-costs", navName: "Job Costs" },
  { key: "budgets", navName: "Budgets" },
  { key: "reports", navName: "Financial Reports" },
  { key: "people-suppliers", navName: "People & Suppliers" },
  { key: "settings", navName: "Settings" },
];

function FinanceContent() {
  const searchParams = useSearchParams();
  const rawTab = (searchParams.get("tab") || "invoices").toLowerCase() as FinanceTabKey;
  const initialJob = searchParams.get("jobId") || undefined;

  const activeTab: FinanceTabKey = useMemo(() => {
    const valid = financeTabs.some((t) => t.key === rawTab);
    return valid ? rawTab : "invoices";
  }, [rawTab]);

  const activeTabMeta = useMemo(() => {
    return (
      financeTabs.find((t) => t.key === activeTab) || financeTabs[1]
    );
  }, [activeTab]);

  return (
    <FirmaLayout activeNav={activeTabMeta.navName}>
      <div className="mt-4 pb-8">
        {activeTab === "dashboard" && <FinanceManagerDashboard />}
        {activeTab === "invoices" && <InvoicesView initialJobFilter={initialJob} />}
        {activeTab === "purchase-orders" && <PurchaseOrdersView initialJobFilter={initialJob} />}
        {activeTab === "bills" && <SupplierBillsView initialJobFilter={initialJob} />}
        {activeTab === "payments" && <PaymentsView initialJobFilter={initialJob} />}
        {activeTab === "job-costs" && <JobCostsView initialJobFilter={initialJob} />}
        {activeTab === "budgets" && <BudgetsView initialJobFilter={initialJob} />}
        {activeTab === "reports" && <FinancialReportsView />}
        {activeTab === "people-suppliers" && <PeopleSuppliersView />}
        {activeTab === "settings" && <FinanceSettingsView />}
      </div>
    </FirmaLayout>
  );
}

export default function FinancePage() {
  return (
    <Suspense
      fallback={
        <FirmaLayout activeNav="Invoices">
          <div className="p-12 text-center text-xs text-ash">
            Loading Finance Module...
          </div>
        </FirmaLayout>
      }
    >
      <FinanceContent />
    </Suspense>
  );
}