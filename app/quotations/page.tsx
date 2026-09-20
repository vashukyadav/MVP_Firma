"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  useLeadFlowStore,
  type Quote,
  type QuoteLineItem,
  type QuoteStatus,
} from "@/store/leadFlowStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import {
  FileCheck2,
  Plus,
  Search,
  Download,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  Eye,
  Trash2,
  Building,
  Calendar,
  IndianRupee,
  ArrowRight,
  Sparkles,
  X,
  Trophy,
  Check,
  AlertCircle,
} from "lucide-react";

function QuotationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialOppId = searchParams.get("opportunityId");

  const {
    quotes,
    opportunities,
    createQuote,
    acceptQuote,
    updateQuoteStatus,
    deleteQuote,
    clearAllDummyData,
  } = useLeadFlowStore();

  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Create Quote Modal State (Step 6)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOppId, setSelectedOppId] = useState<string>("");
  const [quoteNo, setQuoteNo] = useState("");
  const [validUntil, setValidUntil] = useState("2026-11-30");
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([
    { id: 1, description: "", qty: 1, rate: 0, amount: 0 },
  ]);

  // Preview Modal
  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null);

  // Quote Accepted Feedback Modal (Step 7 -> 8 prompt)
  const [acceptedQuoteInfo, setAcceptedQuoteInfo] = useState<Quote | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if opened from Pipeline with ?opportunityId=...
  useEffect(() => {
    if (initialOppId && mounted) {
      const opp = opportunities.find((o) => o.id === initialOppId);
      if (opp) {
        setSelectedOppId(opp.id);
        const nextQuoteNum = `Q-00${quotes.length + 12}`;
        setQuoteNo(nextQuoteNum);
        // Pre-fill line item based on opp estimated value
        setLineItems([
          {
            id: 1,
            description: `${opp.title} - Main Contract Scope`,
            qty: 1,
            rate: opp.estimatedValue || 2000000,
            amount: opp.estimatedValue || 2000000,
          },
        ]);
        setShowCreateModal(true);
      }
    }
  }, [initialOppId, mounted, opportunities, quotes.length]);

  const quoteList = mounted ? quotes : [];
  const oppList = mounted ? opportunities : [];

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case "ACCEPTED":
        return {
          label: "Accepted / Won",
          color: "bg-clear-bg text-success-text border-clear-bg",
        };
      case "SENT":
        return {
          label: "Sent to Client",
          color: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "DRAFT":
        return {
          label: "Draft",
          color: "bg-mist text-onyx border-pebble",
        };
      case "REJECTED":
        return {
          label: "Rejected",
          color: "bg-hazard-bg text-hazard-text border-hazard-bg",
        };
      default:
        return {
          label: status,
          color: "bg-mist text-onyx border-pebble",
        };
    }
  };

  const filtered = quoteList.filter((q) => {
    const term = search.toLowerCase();
    const matchSearch =
      q.quoteNo.toLowerCase().includes(term) ||
      q.opportunityTitle.toLowerCase().includes(term) ||
      q.customerName.toLowerCase().includes(term);
    const matchStatus = filter === "ALL" || q.status === filter;
    return matchSearch && matchStatus;
  });

  // Calculate totals for Create Quote form
  const subtotal = lineItems.reduce((acc, item) => acc + (item.amount || 0), 0);
  const gst = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gst;

  // Add line item
  const handleAddLineItem = () => {
    const newItem: QuoteLineItem = {
      id: Date.now(),
      description: "Additional Construction Works & Material",
      qty: 1,
      rate: 100000,
      amount: 100000,
    };
    setLineItems([...lineItems, newItem]);
  };

  // Update line item
  const handleUpdateLineItem = (id: number, field: keyof QuoteLineItem, value: any) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "qty" || field === "rate") {
          updated.amount = (Number(updated.qty) || 0) * (Number(updated.rate) || 0);
        }
        return updated;
      })
    );
  };

  // Remove line item
  const handleRemoveLineItem = (id: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((i) => i.id !== id));
  };

  // Open Create Quote Modal
  const openCreateModal = () => {
    const nextQuoteNum = `Q-00${quoteList.length + 12}`;
    setQuoteNo(nextQuoteNum);
    if (!selectedOppId && oppList.length > 0) {
      setSelectedOppId(oppList[0].id);
      setLineItems([
        {
          id: 1,
          description: `${oppList[0].title} - Main Contract Scope`,
          qty: 1,
          rate: oppList[0].estimatedValue || 2000000,
          amount: oppList[0].estimatedValue || 2000000,
        },
      ]);
    }
    setShowCreateModal(true);
  };

  // Save or Send Quote
  const handleSaveQuote = (status: "DRAFT" | "SENT") => {
    if (!selectedOppId) return;

    createQuote(selectedOppId, {
      quoteNo: quoteNo || `Q-00${quoteList.length + 12}`,
      validUntil,
      lineItems,
      status,
    });

    setShowCreateModal(false);
  };

  // Step 7: Handle Accept Quote
  const handleAcceptQuote = (quote: Quote) => {
    acceptQuote(quote.id);
    setAcceptedQuoteInfo(quote);
  };

  // KPI Calculations
  const totalVolume = quoteList.reduce((acc, q) => acc + (q.value || 0), 0);
  const acceptedCount = quoteList.filter((q) => q.status === "ACCEPTED").length;
  const sentCount = quoteList.filter((q) => q.status === "SENT").length;

  const currentSelectedOpp = oppList.find((o) => o.id === selectedOppId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pb-2">
        <div>
          <span className="text-eyebrow text-ash uppercase tracking-wider font-semibold">
            COMMERCIAL ESTIMATION
          </span>
          <h1 className="text-display-h1 font-bold text-onyx mt-0.5 tracking-tight flex items-center gap-2">
            Quotations &amp; Proposals
          </h1>
          <p className="text-body text-ash mt-1">
            Generate line-item estimates, send customer proposals, and mark accepted deals for handover.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4.5 py-2.5 text-sm font-medium shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 text-breath" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[10px] bg-white p-4.5 border border-pebble/60 shadow-2xs">
          <span className="text-xs font-semibold text-ash">Pending / Sent Proposals</span>
          <p className="text-2xl font-bold text-blue-700 mt-1">{sentCount}</p>
          <p className="text-xs font-medium text-ash mt-1">Awaiting client sign-off</p>
        </div>

        <div className="rounded-[10px] bg-white p-4.5 border border-pebble/60 shadow-2xs">
          <span className="text-xs font-semibold text-ash">Accepted Contracts</span>
          <p className="text-2xl font-bold text-success-text mt-1">{acceptedCount}</p>
          <p className="text-xs font-medium text-complete-status mt-1">Ready for project handover</p>
        </div>

        <div className="rounded-[10px] bg-white p-4.5 border border-pebble/60 shadow-2xs">
          <span className="text-xs font-semibold text-ash">Total Quoted Volume</span>
          <p className="text-2xl font-bold text-onyx mt-1">
            ₹{totalVolume.toLocaleString("en-IN")}
          </p>
          <p className="text-xs font-medium text-ash mt-1">{quoteList.length} total proposals issued</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-[10px] border border-pebble/60 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { key: "ALL", label: "All Proposals" },
            { key: "SENT", label: "Sent to Client" },
            { key: "ACCEPTED", label: "Accepted" },
            { key: "DRAFT", label: "Drafts" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3.5 py-2 rounded-[10px] text-sm font-medium transition cursor-pointer shrink-0 ${
                filter === tab.key
                  ? "bg-forest text-white shadow-xs"
                  : "bg-stone text-ash hover:bg-mist hover:text-onyx"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="h-3.5 w-3.5 text-ash absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quote #, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs text-onyx placeholder-ash bg-stone rounded-[10px] border border-pebble outline-none focus:border-onyx focus:bg-white transition"
          />
        </div>
      </div>

      {/* Quotations Table */}
      <div className="rounded-[10px] bg-white border border-pebble/60 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-pebble bg-mist/40 text-[11px] font-semibold text-onyx uppercase tracking-wider">
                <th className="px-6 py-3.5">Quote #</th>
                <th className="px-6 py-3.5">Opportunity / Scope</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Valid Till</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pebble/40 text-xs">
              {filtered.map((item) => {
                const badge = getStatusBadge(item.status);
                return (
                  <tr key={item.id} className="hover:bg-stone/60 transition">
                    <td className="px-6 py-4 font-bold text-onyx">
                      #{item.quoteNo}
                    </td>
                    <td className="px-6 py-4 font-semibold text-onyx">
                      <div>{item.opportunityTitle}</div>
                      <span className="text-[10px] text-ash">Opp ID: {item.opportunityId}</span>
                    </td>
                    <td className="px-6 py-4 text-ash font-medium">
                      {item.customerName}
                    </td>
                    <td className="px-6 py-4 font-bold text-onyx">
                      ₹{(item.value || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-ash">
                      {item.validUntil}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Step 7: Mark as Accepted Action */}
                        {item.status === "SENT" && (
                          <Button
                            type="button"
                            onClick={() => handleAcceptQuote(item)}
                            className="bg-forest hover:bg-forest-hover text-white text-[11px] h-7 px-2.5 font-medium cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <Check className="h-3 w-3" />
                            <span>Mark as Accepted</span>
                          </Button>
                        )}

                        {item.status === "ACCEPTED" && (
                          <button
                            type="button"
                            onClick={() => router.push("/pipeline")}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest hover:underline cursor-pointer px-2 py-1"
                          >
                            <span>Go to Handover</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setPreviewQuote(item)}
                          className="p-1.5 rounded-[6px] text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
                          title="Preview Quote"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete quote #${item.quoteNo}?`)) {
                              deleteQuote(item.id);
                            }
                          }}
                          className="p-1.5 rounded-[6px] text-ash hover:bg-hazard-bg/20 hover:text-hazard-text transition cursor-pointer"
                          title="Delete Quote"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-ash text-xs">
                    No quotations found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Step 6: Create Quote Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-white rounded-[16px] shadow-2xl border border-pebble overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-pebble flex items-center justify-between bg-stone/50">
              <div>
                <span className="text-[10px] font-bold text-ash uppercase tracking-wider">
                  Step 6 • Commercial Proposal
                </span>
                <h3 className="text-lg font-bold text-onyx">Create Quote</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-md text-ash hover:text-onyx"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Quote Meta Details Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-[12px] bg-stone/40 border border-pebble">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-ash">Quote Name / No. *</Label>
                  <Input
                    value={quoteNo}
                    onChange={(e) => setQuoteNo(e.target.value)}
                    placeholder="Q-0012"
                    className="text-xs h-8.5 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-ash">Opportunity *</Label>
                  <select
                    value={selectedOppId}
                    onChange={(e) => {
                      setSelectedOppId(e.target.value);
                      const opp = oppList.find((o) => o.id === e.target.value);
                      if (opp) {
                        setLineItems([
                          {
                            id: 1,
                            description: `${opp.title} - Scope of Work`,
                            qty: 1,
                            rate: opp.estimatedValue || 2000000,
                            amount: opp.estimatedValue || 2000000,
                          },
                        ]);
                      }
                    }}
                    className="w-full px-3 py-1.5 text-xs text-onyx bg-white rounded-[8px] border border-pebble outline-none focus:border-onyx"
                  >
                    {oppList.map((opp) => (
                      <option key={opp.id} value={opp.id}>
                        {opp.title} ({opp.customerName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-ash">Customer</Label>
                  <div className="text-xs font-bold text-onyx bg-white p-2 rounded-[8px] border border-pebble truncate">
                    {currentSelectedOpp?.customerName || "Customer"}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-ash">Valid Till Date</Label>
                  <Input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="text-xs h-8.5 bg-white"
                  />
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-onyx uppercase tracking-wider">
                    Commercial Line Items
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="flex items-center gap-1 text-xs font-semibold text-forest hover:underline cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="border border-pebble rounded-[10px] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone border-b border-pebble text-[10px] font-bold text-ash uppercase">
                      <tr>
                        <th className="px-3 py-2.5">Description</th>
                        <th className="px-3 py-2.5 w-20">Qty</th>
                        <th className="px-3 py-2.5 w-32">Rate (₹)</th>
                        <th className="px-3 py-2.5 w-32">Amount (₹)</th>
                        <th className="px-3 py-2.5 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pebble/60">
                      {lineItems.map((item) => (
                        <tr key={item.id} className="hover:bg-stone/30">
                          <td className="p-2">
                            <Input
                              value={item.description}
                              onChange={(e) =>
                                handleUpdateLineItem(item.id, "description", e.target.value)
                              }
                              className="text-xs h-8"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) =>
                                handleUpdateLineItem(item.id, "qty", Number(e.target.value))
                              }
                              className="text-xs h-8 text-center"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={item.rate}
                              onChange={(e) =>
                                handleUpdateLineItem(item.id, "rate", Number(e.target.value))
                              }
                              className="text-xs h-8"
                            />
                          </td>
                          <td className="p-2 font-bold text-onyx">
                            ₹{(item.amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(item.id)}
                              disabled={lineItems.length <= 1}
                              className="text-ash hover:text-red-500 disabled:opacity-30 cursor-pointer p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Calculation Card */}
              <div className="p-4 rounded-[12px] bg-stone/40 border border-pebble ml-auto max-w-xs space-y-2 text-xs">
                <div className="flex justify-between text-ash">
                  <span>Subtotal</span>
                  <span className="font-semibold text-onyx">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-ash">
                  <span>GST / Tax (18%)</span>
                  <span className="font-semibold text-onyx">₹{gst.toLocaleString("en-IN")}</span>
                </div>
                <div className="pt-2 border-t border-pebble flex justify-between font-bold text-sm text-onyx">
                  <span>Total Amount</span>
                  <span className="text-forest">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-pebble flex items-center justify-between bg-stone/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSaveQuote("DRAFT")}
                  className="text-xs border-pebble text-onyx"
                >
                  Save Draft
                </Button>

                <Button
                  type="button"
                  onClick={() => handleSaveQuote("SENT")}
                  className="bg-forest hover:bg-forest-hover text-white text-xs h-9 font-medium shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send to Customer</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote Preview Modal */}
      {previewQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-[16px] shadow-2xl border border-pebble p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-pebble pb-4">
              <div>
                <span className="text-[10px] font-bold text-forest uppercase tracking-widest">
                  COMMERCIAL QUOTATION
                </span>
                <h3 className="text-xl font-bold text-onyx mt-0.5">
                  Quote #{previewQuote.quoteNo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewQuote(null)}
                className="p-1 text-ash hover:text-onyx"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-ash block">Billed To:</span>
                <strong className="text-onyx text-sm">{previewQuote.customerName}</strong>
                <p className="text-ash mt-0.5">Project: {previewQuote.opportunityTitle}</p>
              </div>
              <div className="text-right">
                <span className="text-ash block">Proposal Date:</span>
                <span className="font-semibold text-onyx">{previewQuote.createdAt}</span>
                <span className="text-ash block mt-1">Valid Until:</span>
                <span className="font-semibold text-onyx">{previewQuote.validUntil}</span>
              </div>
            </div>

            <div className="border border-pebble rounded-[10px] overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-stone text-ash font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2">Item Description</th>
                    <th className="px-4 py-2 text-center">Qty</th>
                    <th className="px-4 py-2 text-right">Rate</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pebble/60">
                  {previewQuote.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2.5 font-medium text-onyx">{item.description}</td>
                      <td className="px-4 py-2.5 text-center text-ash">{item.qty}</td>
                      <td className="px-4 py-2.5 text-right text-ash">₹{item.rate.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-onyx">₹{item.amount.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-ash">Status: <strong className="text-onyx uppercase">{previewQuote.status}</strong></span>
              <div className="text-right">
                <span className="text-xs text-ash block">Total Quoted Value</span>
                <span className="text-xl font-bold text-forest">₹{(previewQuote.value || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="border-t border-pebble pt-4 flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (confirm(`Delete quote #${previewQuote.quoteNo}?`)) {
                    deleteQuote(previewQuote.id);
                    setPreviewQuote(null);
                  }
                }}
                className="text-xs text-hazard-text hover:bg-hazard-bg/20 border-pebble flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Quote</span>
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreviewQuote(null)}
                  className="text-xs"
                >
                  Close Preview
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    toast.success("Quotation PDF generated successfully!");
                  }}
                  className="bg-forest hover:bg-forest-hover text-white text-xs"
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  <span>Download PDF</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 7 -> 8: Quote Accepted Notification Modal */}
      {acceptedQuoteInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-md bg-white rounded-[20px] shadow-2xl border border-pebble p-6 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-clear-bg border border-green-200 flex items-center justify-center text-success-text">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div>
              <span className="text-[10px] font-bold text-forest uppercase tracking-widest bg-forest/10 px-2.5 py-0.5 rounded-full">
                Step 7 • Quote Accepted
              </span>
              <h2 className="text-lg font-bold text-onyx mt-2">
                Quote #{acceptedQuoteInfo.quoteNo} Accepted!
              </h2>
              <p className="text-xs text-ash mt-1">
                Customer <span className="font-bold text-onyx">{acceptedQuoteInfo.customerName}</span> has approved this quotation.
                Opportunity has been automatically moved to <span className="font-bold text-success-text">Contract Won</span> stage.
              </p>
            </div>

            <div className="p-3 bg-stone/50 rounded-[10px] border border-pebble text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-ash">Opportunity:</span>
                <span className="font-semibold text-onyx">{acceptedQuoteInfo.opportunityTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ash">Quoted Value:</span>
                <span className="font-bold text-forest">₹{acceptedQuoteInfo.value.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button
                type="button"
                onClick={() => {
                  setAcceptedQuoteInfo(null);
                  router.push("/pipeline");
                }}
                className="w-full bg-forest hover:bg-forest-hover text-white text-xs h-10 font-semibold shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Proceed to Handover in Pipeline</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAcceptedQuoteInfo(null)}
                className="w-full text-xs h-9"
              >
                Stay on Quotations
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuotationsPage() {
  return (
    <FirmaLayout activeNav="Quotations">
      <Suspense fallback={<div className="p-8 text-center text-xs text-ash">Loading quotations...</div>}>
        <QuotationsContent />
      </Suspense>
    </FirmaLayout>
  );
}