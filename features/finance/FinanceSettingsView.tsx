"use client";

import { useState } from "react";
import { useFinanceStore, FinanceSettings } from "@/store/financeStore";
import { Settings, Save, CheckCircle2, Building, CreditCard, Landmark } from "lucide-react";
import { toast } from "@/components/ui/toast";

export default function FinanceSettingsView() {
  const { settings, updateSettings } = useFinanceStore();

  const [currency, setCurrency] = useState<"INR" | "USD">(
    settings.baseCurrency || "INR"
  );
  const [taxRate, setTaxRate] = useState(String(settings.defaultTaxRate || 18));
  const [paymentTerms, setPaymentTerms] = useState(
    settings.defaultPaymentTerms || "Net 30"
  );
  const [invoicePrefix, setInvoicePrefix] = useState(
    settings.invoicePrefix || "INV-"
  );
  const [poPrefix, setPoPrefix] = useState(settings.poPrefix || "PO-");
  const [billPrefix, setBillPrefix] = useState(settings.billPrefix || "BILL-");
  const [paymentPrefix, setPaymentPrefix] = useState(
    settings.paymentPrefix || "PAY-"
  );
  const [bankName, setBankName] = useState(settings.bankName || "");
  const [accountNumber, setAccountNumber] = useState(
    settings.accountNumber || ""
  );
  const [ifscCode, setIfscCode] = useState(settings.ifscCode || "");
  const [upiId, setUpiId] = useState(settings.upiId || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      baseCurrency: currency,
      currencySymbol: currency === "INR" ? "₹" : "$",
      defaultTaxRate: parseFloat(taxRate) || 18,
      defaultPaymentTerms: paymentTerms,
      invoicePrefix,
      poPrefix,
      billPrefix,
      paymentPrefix,
      bankName,
      accountNumber,
      ifscCode,
      upiId,
    });
    toast.success("Finance settings saved successfully!");
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-onyx tracking-tight">
          Financial Preferences &amp; Settings
        </h2>
        <p className="text-body text-ash mt-0.5">
          Configure default currencies, tax rates, invoice numbering prefixes, and banking remittance details.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Currency & Tax */}
        <div className="bg-white rounded-[14px] border border-pebble p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-onyx uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-forest" />
            <span>Currency &amp; Taxation</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-onyx block mb-1">
                Base Accounting Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "INR" | "USD")}
                className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
              >
                <option value="INR">Indian Rupee (₹ INR)</option>
                <option value="USD">US Dollar ($ USD)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-onyx block mb-1">
                Default GST / Tax Rate (%)
              </label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="18"
                className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-onyx block mb-1">
                Default Payment Terms
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 60">Net 60 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Numbering Prefixes */}
        <div className="bg-white rounded-[14px] border border-pebble p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-onyx uppercase tracking-wider flex items-center gap-2">
            <Building className="h-4 w-4 text-forest" />
            <span>Document Numbering Prefixes</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-onyx block mb-1">
                Customer Invoices
              </label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-onyx block mb-1">
                Purchase Orders
              </label>
              <input
                type="text"
                value={poPrefix}
                onChange={(e) => setPoPrefix(e.target.value)}
                className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-onyx block mb-1">
                Supplier Bills
              </label>
              <input
                type="text"
                value={billPrefix}
                onChange={(e) => setBillPrefix(e.target.value)}
                className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-onyx block mb-1">
                Payments
              </label>
              <input
                type="text"
                value={paymentPrefix}
                onChange={(e) => setPaymentPrefix(e.target.value)}
                className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
              />
            </div>
          </div>
        </div>

        {/* Remittance & Banking Details */}
        <div className="bg-white rounded-[14px] border border-pebble p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-onyx uppercase tracking-wider flex items-center gap-2">
            <Landmark className="h-4 w-4 text-forest" />
            <span>Bank Remittance &amp; Payment Gateway (Invoice Details)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-onyx block mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Enter bank name"
                className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-onyx block mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-onyx block mb-1">
                IFSC / Routing Code
              </label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="Enter IFSC / Routing code"
                className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-onyx block mb-1">
                UPI ID (QR / Instant Pay)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="Enter UPI ID (optional)"
                className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-5 py-2.5 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
