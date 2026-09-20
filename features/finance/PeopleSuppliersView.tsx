"use client";

import { useState, useMemo } from "react";
import { useFinanceStore, SupplierLedgerSummary } from "@/store/financeStore";
import { useTenderFlowStore } from "@/store/tenderFlowStore";
import {
  Users,
  Search,
  Building2,
  Phone,
  Mail,
  IndianRupee,
  DollarSign,
  ClipboardList,
  FileCheck2,
  CreditCard,
  X,
  ExternalLink,
  ChevronRight,
  HardHat,
} from "lucide-react";

export default function PeopleSuppliersView() {
  const { getAllSuppliers, getSupplierLedger, settings } = useFinanceStore();
  const { contractors = [] } = useTenderFlowStore();

  const [search, setSearch] = useState("");
  const [selectedSupplierName, setSelectedSupplierName] = useState<string | null>(
    null
  );

  const currencySymbol = settings.currencySymbol || "₹";

  const formatCurrency = (val: number) => {
    return `${currencySymbol}${val.toLocaleString("en-IN")}`;
  };

  const allSuppliers = useMemo(() => {
    const list = getAllSuppliers();
    return list.map((name) => getSupplierLedger(name));
  }, [getAllSuppliers, getSupplierLedger]);

  const filteredSuppliers = useMemo(() => {
    return allSuppliers.filter((s) =>
      s.supplierName.toLowerCase().includes(search.toLowerCase())
    );
  }, [allSuppliers, search]);

  const activeLedger: SupplierLedgerSummary | null = useMemo(() => {
    if (!selectedSupplierName) return null;
    return getSupplierLedger(selectedSupplierName);
  }, [selectedSupplierName, getSupplierLedger]);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-onyx tracking-tight">
            People &amp; Suppliers Financial Directory
          </h2>
          <p className="text-body text-ash mt-0.5">
            Vendor accounts connecting purchase orders, bills, payments, and active project jobs.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="h-3.5 w-3.5 text-ash absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs text-onyx placeholder:text-ash bg-white rounded-[8px] border border-pebble outline-none focus:border-onyx transition shadow-2xs"
          />
        </div>
      </div>

      {/* Suppliers Grid */}
      {filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-[14px] border border-pebble p-8 text-center shadow-2xs space-y-2">
          <HardHat className="h-8 w-8 text-ash mx-auto" />
          <h3 className="text-sm font-bold text-onyx">No Suppliers or Vendors Found</h3>
          <p className="text-xs text-ash max-w-sm mx-auto">
            Suppliers and subcontractors will appear here automatically as purchase orders and vendor bills are recorded.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((sup) => {
            return (
              <div
                key={sup.supplierName}
                onClick={() => setSelectedSupplierName(sup.supplierName)}
                className="bg-white rounded-[12px] border border-pebble p-4 shadow-2xs hover:shadow-xs transition cursor-pointer space-y-3.5 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-onyx group-hover:text-forest transition">
                      {sup.supplierName}
                    </h3>
                    <span className="text-[11px] text-ash font-medium">
                      Verified Vendor / Supplier
                    </span>
                  </div>
                  <div className="h-8 w-8 rounded-[8px] bg-stone text-ash flex items-center justify-center group-hover:bg-breath group-hover:text-onyx transition">
                    <HardHat className="h-4 w-4" />
                  </div>
                </div>

                {/* 3 Metric Counts */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-stone rounded-[8px] text-center text-xs">
                  <div>
                    <span className="text-[10px] text-ash block">POs</span>
                    <span className="font-bold text-onyx mt-0.5 block">
                      {sup.totalPOs} ({formatCurrency(sup.totalPOsValue)})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ash block">Billed</span>
                    <span className="font-bold text-onyx mt-0.5 block">
                      {formatCurrency(sup.totalBilledAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ash block">Outstanding</span>
                    <span
                      className={`font-bold mt-0.5 block ${
                        sup.outstandingBalance > 0
                          ? "text-hazard-text"
                          : "text-success-text"
                      }`}
                    >
                      {formatCurrency(sup.outstandingBalance)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-forest font-semibold pt-1">
                  <span>View Full Financial Ledger</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUPPLIER FINANCIAL LEDGER MODAL                                           */}
      {/* ========================================================================= */}
      {activeLedger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-[18px] bg-white p-6 shadow-2xl border border-pebble animate-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedSupplierName(null)}
              className="absolute right-4 top-4 rounded-[8px] p-1.5 text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-forest text-xs font-semibold uppercase">
              <HardHat className="h-4 w-4" />
              <span>SUPPLIER FINANCIAL LEDGER</span>
            </div>
            <h3 className="text-2xl font-black text-onyx mt-0.5">
              {activeLedger.supplierName}
            </h3>
            <p className="text-xs text-ash mt-0.5">
              Complete transaction audit trail: PO → Bill → Payment → Job.
            </p>

            {/* Financial Summary */}
            <div className="grid grid-cols-4 gap-2.5 my-4 text-center p-3.5 bg-mist/60 rounded-[10px] border border-pebble text-xs">
              <div>
                <span className="text-[10px] text-ash block">Purchase Orders</span>
                <span className="font-bold text-onyx mt-0.5 block">
                  {formatCurrency(activeLedger.totalPOsValue)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-ash block">Total Billed</span>
                <span className="font-bold text-onyx mt-0.5 block">
                  {formatCurrency(activeLedger.totalBilledAmount)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-ash block">Total Disbursed</span>
                <span className="font-bold text-success-text mt-0.5 block">
                  {formatCurrency(activeLedger.totalPaidAmount)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-ash block">Outstanding Due</span>
                <span className="font-bold text-hazard-text mt-0.5 block">
                  {formatCurrency(activeLedger.outstandingBalance)}
                </span>
              </div>
            </div>

            {/* Traceability Flow Example Box */}
            <div className="p-3 bg-stone rounded-[10px] border border-pebble text-xs mb-4">
              <span className="font-bold text-onyx block text-[11px] uppercase tracking-wider mb-2">
                Traceability Path:
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-onyx">
                <span className="bg-white px-2 py-1 rounded-[6px] border border-pebble">
                  Supplier: {activeLedger.supplierName}
                </span>
                <span>→</span>
                <span className="bg-white px-2 py-1 rounded-[6px] border border-pebble text-forest">
                  PO: {activeLedger.pos[0]?.poNumber || "None"}
                </span>
                <span>→</span>
                <span className="bg-white px-2 py-1 rounded-[6px] border border-pebble text-onyx">
                  Bill: {activeLedger.bills[0]?.billNumber || "None"}
                </span>
                <span>→</span>
                <span className="bg-white px-2 py-1 rounded-[6px] border border-pebble text-success-text">
                  Payment: {activeLedger.payments[0]?.paymentNumber || "None"}
                </span>
                <span>→</span>
                <span className="bg-white px-2 py-1 rounded-[6px] border border-pebble text-onyx">
                  Job: {activeLedger.bills[0]?.jobId || activeLedger.pos[0]?.jobId || "None"}
                </span>
              </div>
            </div>

            {/* Connected Bills */}
            <div className="space-y-2 mb-4">
              <h4 className="text-xs font-bold text-onyx uppercase tracking-wider">
                Supplier Invoices &amp; Bills ({activeLedger.bills.length})
              </h4>
              {activeLedger.bills.length === 0 ? (
                <p className="text-xs text-ash">No bills recorded yet.</p>
              ) : (
                <div className="border border-pebble rounded-[8px] overflow-hidden text-xs divide-y divide-pebble">
                  {activeLedger.bills.map((b) => (
                    <div
                      key={b.id}
                      className="p-2.5 flex items-center justify-between bg-white"
                    >
                      <div>
                        <span className="font-bold text-onyx">
                          {b.billNumber}
                        </span>
                        <span className="text-ash text-[11px] ml-2">
                          PO: {b.poNumber || "Direct"} • Job: {b.jobId}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-onyx block">
                          {formatCurrency(b.amount)}
                        </span>
                        <span className="text-[10px] text-success-text">
                          Paid: {formatCurrency(b.paidAmount || 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Connected Payments */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-onyx uppercase tracking-wider">
                Payments Disbursed ({activeLedger.payments.length})
              </h4>
              {activeLedger.payments.length === 0 ? (
                <p className="text-xs text-ash">No payments recorded yet.</p>
              ) : (
                <div className="border border-pebble rounded-[8px] overflow-hidden text-xs divide-y divide-pebble">
                  {activeLedger.payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 flex items-center justify-between bg-white"
                    >
                      <div>
                        <span className="font-bold text-onyx">
                          {p.paymentNumber}
                        </span>
                        <span className="text-ash text-[11px] ml-2">
                          Ref: {p.reference} • Bill: {p.billNumber}
                        </span>
                      </div>
                      <span className="font-bold text-success-text">
                        {formatCurrency(p.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-pebble mt-5">
              <button
                type="button"
                onClick={() => setSelectedSupplierName(null)}
                className="px-4 py-2 rounded-[8px] border border-pebble text-xs font-medium text-onyx hover:bg-stone transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
