"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useLeadFlowStore, type Lead, type Quote } from "@/store/leadFlowStore";
import {
  Target,
  FileCheck2,
  FileText,
  Users,
  TrendingUp,
  Award,
  ArrowRight,
  Clock,
  Plus,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  DollarSign,
  AlertCircle,
  Briefcase,
} from "lucide-react";

interface SalesDashboardProps {
  companyName: string;
  customerCount: number;
}

export default function SalesManagerDashboard({
  companyName,
  customerCount,
}: SalesDashboardProps) {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { leads = [], quotes = [] } = useLeadFlowStore();

  const firstName = currentUser?.name?.split(" ")[0] || "Sales Manager";

  // Calculations
  const pendingQuotes = useMemo(
    () => quotes.filter((q) => q.status === "DRAFT" || q.status === "SENT"),
    [quotes]
  );

  const acceptedQuotes = useMemo(
    () => quotes.filter((q) => q.status === "ACCEPTED"),
    [quotes]
  );

  const totalPipelineValue = useMemo(() => {
    const leadVal = leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
    const quoteVal = quotes.reduce((sum, q) => sum + (q.value || 0), 0);
    return leadVal > 0 ? leadVal : quoteVal;
  }, [leads, quotes]);

  const totalWonValue = useMemo(() => {
    return acceptedQuotes.reduce((sum, q) => sum + (q.value || 0), 0);
  }, [acceptedQuotes]);

  const leadStatusCounts = useMemo(() => {
    return {
      NEW: leads.filter((l) => l.status === "NEW").length,
      CONTACTED: leads.filter((l) => l.status === "CONTACTED").length,
      QUALIFIED: leads.filter((l) => l.status === "QUALIFIED").length,
      CONVERTED: leads.filter((l) => l.status === "CONVERTED").length,
    };
  }, [leads]);

  const conversionRate = useMemo(() => {
    if (leads.length === 0) return 0;
    const wonCount = leads.filter((l) => l.status === "CONVERTED").length + acceptedQuotes.length;
    return Math.min(100, Math.round((wonCount / (leads.length + quotes.length || 1)) * 100));
  }, [leads, quotes, acceptedQuotes]);

  // Recent Sales Activities
  const recentSalesActivities = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      subtitle: string;
      time: string;
      badge: string;
      badgeColor: string;
    }> = [];

    quotes.slice(0, 3).forEach((q) => {
      items.push({
        id: `q-${q.id}`,
        title: `Quotation ${q.quoteNo || q.id} (${q.status})`,
        subtitle: `Client: ${q.customerName} • ₹${(q.value || 0).toLocaleString("en-IN")}`,
        time: q.validUntil ? `Valid till ${q.validUntil}` : "Recently",
        badge: q.status,
        badgeColor:
          q.status === "ACCEPTED"
            ? "bg-clear-bg text-success-text"
            : q.status === "SENT"
            ? "bg-caution-bg text-caution-text"
            : "bg-mist text-onyx",
      });
    });

    leads.slice(0, 3).forEach((l) => {
      items.push({
        id: `l-${l.id}`,
        title: `Lead: ${l.companyName || l.contactPerson}`,
        subtitle: `${l.requirement || "Commercial Scope"} • ₹${(l.estimatedValue || 0).toLocaleString("en-IN")}`,
        time: l.createdAt
          ? new Date(l.createdAt).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            })
          : "Recently",
        badge: l.status,
        badgeColor:
          l.status === "CONVERTED"
            ? "bg-clear-bg text-success-text"
            : "bg-sunfleck text-onyx",
      });
    });

    return items.slice(0, 5);
  }, [quotes, leads]);

  return (
    <div className="space-y-6 mt-4">
      {/* ========================================================================= */}
      {/* 1. WELCOME BANNER (Role-Tailored, Clean Firma Card Styling)               */}
      {/* ========================================================================= */}
      <div className="rounded-[16px] bg-white border border-pebble/80 p-6 sm:p-7 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* Left Text */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-stone border border-pebble px-3 py-1 text-[10px] font-bold tracking-wider text-ash uppercase mb-2.5">
              <Sparkles className="h-3 w-3 text-forest" />
              <span className="text-onyx font-semibold">Sales &amp; Client CRM Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-onyx tracking-tight leading-tight">
              Welcome back, {firstName}! <span className="inline-block">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-ash mt-1.5 leading-relaxed">
              Track open leads, expedite quotation approvals, and accelerate your client conversion pipeline for {companyName || "your enterprise"}.
            </p>
          </div>

          {/* Right Action & Live Metric Chips */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="rounded-[12px] bg-stone/70 border border-pebble px-4 py-2.5 text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-ash block">
                Open Pipeline
              </span>
              <span className="text-lg font-bold text-onyx leading-tight">
                ₹{(totalPipelineValue / 100000).toFixed(1)} Lakhs
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/leads")}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-[10px] bg-onyx text-white px-4 py-2.5 text-xs font-semibold hover:bg-black transition shadow-2xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Lead</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/quotations")}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-[10px] border border-pebble bg-white text-onyx px-4 py-2.5 text-xs font-semibold hover:bg-stone transition cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>New Quote</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SIX SALES KPI METRICS CARDS                                            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Metric 1: Active Leads */}
        <div
          onClick={() => router.push("/leads")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-hazard-bg text-hazard-text">
              <Target className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-ash">Active Leads</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-onyx leading-tight">{leads.length}</p>
            <p className="text-[10px] font-medium text-ash mt-1">Open enquiries</p>
          </div>
        </div>

        {/* Metric 2: Pending Quotes */}
        <div
          onClick={() => router.push("/quotations")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-caution-bg text-caution-text">
              <FileCheck2 className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-ash">Pending Quotes</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-onyx leading-tight">{pendingQuotes.length}</p>
            <p className="text-[10px] font-medium text-caution-text mt-1">Awaiting client review</p>
          </div>
        </div>

        {/* Metric 3: Accepted Deals */}
        <div
          onClick={() => router.push("/opportunities")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-clear-bg text-success-text">
              <Award className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-ash">Won Deals</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-onyx leading-tight">{acceptedQuotes.length}</p>
            <p className="text-[10px] font-medium text-success-text mt-1">
              ₹{(totalWonValue / 100000).toFixed(1)}L closed
            </p>
          </div>
        </div>

        {/* Metric 4: Total Pipeline */}
        <div
          onClick={() => router.push("/leads")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-sunfleck text-onyx">
              <DollarSign className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-ash">Pipeline Value</span>
          </div>
          <div className="mt-3">
            <p className="text-lg font-bold text-onyx leading-tight">
              ₹{(totalPipelineValue / 100000).toFixed(1)}L
            </p>
            <p className="text-[10px] font-medium text-ash mt-1">Estimated deals</p>
          </div>
        </div>

        {/* Metric 5: Active Customers */}
        <div
          onClick={() => router.push("/customers")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-breath text-onyx">
              <Users className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-ash">Client CRM</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-onyx leading-tight">{customerCount}</p>
            <p className="text-[10px] font-medium text-ash mt-1">Saved accounts</p>
          </div>
        </div>

        {/* Metric 6: Conversion Rate */}
        <div
          onClick={() => router.push("/leads")}
          className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs flex flex-col justify-between hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-mist text-onyx">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-ash">Win Rate</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-complete-status leading-tight">
              {conversionRate}%
            </p>
            <p className="text-[10px] font-medium text-ash mt-1">Lead-to-deal</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MIDDLE ROW: QUOTATION PIPELINE & LEADS BY STAGE                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Recent Client Quotations */}
        <div className="lg:col-span-7 rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-sm font-bold text-onyx">Client Quotation Status</h2>
                <p className="text-[11px] text-ash mt-0.5">
                  Live status of submitted BOQ proposals and pricing estimates
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/quotations")}
                className="text-xs font-semibold text-forest hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>All Quotes</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {quotes.length === 0 ? (
              <div className="py-10 text-center">
                <FileText className="h-8 w-8 text-ash/40 mx-auto mb-2" />
                <p className="text-xs font-semibold text-onyx">No client quotations created yet</p>
                <p className="text-[11px] text-ash mt-0.5 max-w-xs mx-auto">
                  Build your first BOQ estimate and generate stamped client proposals.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/quotations")}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-forest hover:underline cursor-pointer"
                >
                  <span>Create First Quotation</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="divide-y divide-pebble/40">
                {quotes.slice(0, 4).map((q) => (
                  <div
                    key={q.id}
                    onClick={() => router.push("/quotations")}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-stone/60 px-2 rounded-[6px] transition cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-onyx">{q.quoteNo || q.id}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] ${
                            q.status === "ACCEPTED"
                              ? "bg-clear-bg text-success-text"
                              : q.status === "SENT"
                              ? "bg-caution-bg text-caution-text"
                              : "bg-mist text-onyx"
                          }`}
                        >
                          {q.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-ash mt-0.5 truncate">
                        Client: {q.customerName || "Standard Client"} • Scope:{" "}
                        {q.opportunityTitle || "RCC & Structural"}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-onyx">
                        ₹{(q.value || 0).toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-ash mt-0.5">
                        {q.validUntil ? `Due ${q.validUntil}` : "Draft"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Lead Pipeline Stages */}
        <div className="lg:col-span-5 rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-sm font-bold text-onyx">Leads Pipeline Distribution</h2>
                <p className="text-[11px] text-ash mt-0.5">
                  Enquiries moving from initial contact to client conversion
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/leads")}
                className="text-xs font-semibold text-forest hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Pipeline</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-onyx flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-hazard" />
                    New Inquiries
                  </span>
                  <span className="font-bold text-onyx">{leadStatusCounts.NEW}</span>
                </div>
                <div className="h-2 w-full bg-stone rounded-full overflow-hidden">
                  <div
                    className="h-full bg-hazard rounded-full"
                    style={{
                      width: `${(leadStatusCounts.NEW / (leads.length || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-onyx flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-caution" />
                    Contacted &amp; Site Visited
                  </span>
                  <span className="font-bold text-onyx">{leadStatusCounts.CONTACTED}</span>
                </div>
                <div className="h-2 w-full bg-stone rounded-full overflow-hidden">
                  <div
                    className="h-full bg-caution rounded-full"
                    style={{
                      width: `${(leadStatusCounts.CONTACTED / (leads.length || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-onyx flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-breath border border-pebble" />
                    Qualified &amp; Proposal Stage
                  </span>
                  <span className="font-bold text-onyx">{leadStatusCounts.QUALIFIED}</span>
                </div>
                <div className="h-2 w-full bg-stone rounded-full overflow-hidden">
                  <div
                    className="h-full bg-complete-status rounded-full"
                    style={{
                      width: `${(leadStatusCounts.QUALIFIED / (leads.length || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-onyx flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    Converted into Contracts
                  </span>
                  <span className="font-bold text-success-text">{leadStatusCounts.CONVERTED}</span>
                </div>
                <div className="h-2 w-full bg-stone rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full"
                    style={{
                      width: `${(leadStatusCounts.CONVERTED / (leads.length || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Action Prompt */}
            <div className="mt-5 pt-4 border-t border-pebble/60 flex items-center justify-between text-xs">
              <span className="text-ash">Need to add new inquiry?</span>
              <button
                type="button"
                onClick={() => router.push("/leads")}
                className="text-xs font-bold text-forest hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>+ Log Inquiry</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM ROW: RECENT SALES ACTIVITY & CLIENT CRM SHORTCUTS               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recent Activity Stream */}
        <div className="lg:col-span-8 rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-onyx">Recent Sales &amp; Proposal Activity</h2>
            <span className="text-[11px] text-ash">Live Sync</span>
          </div>

          <div className="space-y-3">
            {recentSalesActivities.length === 0 ? (
              <p className="text-xs text-ash py-4">No recent sales records found.</p>
            ) : (
              recentSalesActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-[6px] hover:bg-stone transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-[6px] bg-stone border border-pebble/70 flex items-center justify-center text-onyx shrink-0">
                      <Target className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-onyx truncate">{act.title}</p>
                      <p className="text-[11px] text-ash truncate">{act.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] ${act.badgeColor}`}
                    >
                      {act.badge}
                    </span>
                    <span className="text-[10px] text-ash">{act.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Client CRM Quick Links Card */}
        <div className="lg:col-span-4 rounded-[10px] bg-white p-5 border border-pebble/60 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-onyx">Client CRM Hub</h2>
            <p className="text-[11px] text-ash mt-0.5">
              Quick access to customer directory &amp; contract documents
            </p>

            <div className="mt-4 space-y-2.5 text-xs">
              <div
                onClick={() => router.push("/customers")}
                className="p-3 rounded-[8px] border border-pebble/60 hover:border-onyx transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-onyx">Client Accounts</p>
                  <p className="text-[10px] text-ash">{customerCount} active clients</p>
                </div>
                <ArrowRight className="h-4 w-4 text-ash" />
              </div>

              <div
                onClick={() => router.push("/quotations")}
                className="p-3 rounded-[8px] border border-pebble/60 hover:border-onyx transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-onyx">BOQ Quotation Engine</p>
                  <p className="text-[10px] text-ash">Export stamped client PDFs</p>
                </div>
                <ArrowRight className="h-4 w-4 text-ash" />
              </div>

              <div
                onClick={() => router.push("/opportunities")}
                className="p-3 rounded-[8px] border border-pebble/60 hover:border-onyx transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-onyx">Won Opportunities</p>
                  <p className="text-[10px] text-ash">Ready for site handover</p>
                </div>
                <ArrowRight className="h-4 w-4 text-ash" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
