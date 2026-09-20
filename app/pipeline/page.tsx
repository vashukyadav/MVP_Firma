"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  useLeadFlowStore,
  type Opportunity,
  type OpportunityStage,
} from "@/store/leadFlowStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  Plus,
  Search,
  Building,
  Calendar,
  IndianRupee,
  X,
  FileCheck2,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Briefcase,
  Layers,
  FileText,
  User,
  AlertCircle,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { useCrewStore } from "@/store/crewStore";
import { db } from "@/lib/db";
import { useMemo } from "react";

function PipelineContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    opportunities,
    handoverToProject,
    projects,
    deleteOpportunity,
    clearAllDummyData,
  } = useLeadFlowStore();

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);

  // New Opportunity Modal
  const [showNewOppModal, setShowNewOppModal] = useState(false);
  const [newOppTitle, setNewOppTitle] = useState("");
  const [newOppCustomer, setNewOppCustomer] = useState("");
  const [newOppContact, setNewOppContact] = useState("");
  const [newOppValue, setNewOppValue] = useState("");
  const [newOppCloseDate, setNewOppCloseDate] = useState("");
  const [newOppStage, setNewOppStage] = useState<OpportunityStage>("NEW");
  const [newOppDesc, setNewOppDesc] = useState("");

  // Handover Success Modal (Step 8)
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handedOverProjectId, setHandedOverProjectId] = useState<string | null>(null);
  const [handedOverOpp, setHandedOverOpp] = useState<Opportunity | null>(null);
  const [handoverSiteManagerName, setHandoverSiteManagerName] = useState("");

  const crewMembers = useCrewStore((state) => state.members) || [];
  const [dbManagers, setDbManagers] = useState<
    { id: string; name: string; contact?: string; role: string }[]
  >([]);

  useEffect(() => {
    setMounted(true);
    async function loadManagers() {
      try {
        const users = await db.users.toArray();
        const siteMgrs = users
          .filter((u) => u.role === "SITE_MANAGER")
          .map((u) => ({
            id: `user-${u.id}`,
            name: u.name,
            role: "Site Manager",
            contact: "+91 98000 00000",
          }));
        setDbManagers(siteMgrs);
      } catch (err) {}
    }
    loadManagers();
  }, []);

  const availableSiteManagers = useMemo(() => {
    const list = [...dbManagers];
    const managersFromCrew = crewMembers.filter((m) => m.role === "Site Manager");
    for (const m of managersFromCrew) {
      if (!list.some((x) => x.name.toLowerCase() === m.name.toLowerCase())) {
        list.push({
          id: m.id,
          name: m.name,
          role: "Site Manager",
          contact: m.contact,
        });
      }
    }
    // Only provide fallback default Site Manager if no site managers exist yet
    if (list.length === 0) {
      list.push({
        id: "user-default-sm",
        name: "Site Manager",
        role: "Site Manager",
        contact: "+91 98000 00000",
      });
    }
    return list;
  }, [dbManagers, crewMembers]);

  const oppList = mounted ? opportunities : [];

  // Stages configuration
  const stages: { key: OpportunityStage; label: string; bgBadge: string }[] = [
    { key: "NEW", label: "New Opportunity", bgBadge: "bg-mist text-onyx" },
    { key: "QUALIFIED", label: "Lead Qualified", bgBadge: "bg-blue-50 text-blue-700" },
    { key: "PROPOSAL", label: "Proposal Submitted", bgBadge: "bg-purple-50 text-purple-700" },
    { key: "NEGOTIATION", label: "Negotiation", bgBadge: "bg-amber-50 text-amber-700" },
    { key: "WON", label: "Contract Won", bgBadge: "bg-clear-bg text-success-text" },
  ];

  const filteredOpps = oppList.filter((opp) => {
    const term = search.toLowerCase();
    return (
      opp.title.toLowerCase().includes(term) ||
      opp.customerName.toLowerCase().includes(term) ||
      opp.id.toLowerCase().includes(term) ||
      opp.owner.toLowerCase().includes(term)
    );
  });

  const selectedOpp = oppList.find((o) => o.id === selectedOppId);

  // Calculate totals
  const totalPipelineValue = oppList.reduce((acc, o) => acc + (o.estimatedValue || 0), 0);
  const wonValue = oppList
    .filter((o) => o.stage === "WON")
    .reduce((acc, o) => acc + (o.estimatedValue || 0), 0);

  // Handle stage update
  const handleUpdateStage = (newStage: OpportunityStage) => {
    if (!selectedOpp) return;
    useLeadFlowStore.setState((state) => ({
      opportunities: state.opportunities.map((o) =>
        o.id === selectedOpp.id
          ? {
              ...o,
              stage: newStage,
              winReason: newStage === "WON" ? (o.winReason || "Customer accepted quote") : o.winReason,
              winNotes: newStage === "WON" ? (o.winNotes || "Contract terms finalized with customer.") : o.winNotes,
              actualCloseDate: newStage === "WON" ? (o.actualCloseDate || new Date().toISOString().split("T")[0]) : o.actualCloseDate,
            }
          : o
      ),
    }));
  };

  // Handle creating new opportunity manually
  const handleCreateNewOpp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOppTitle.trim() || !newOppCustomer.trim()) return;

    const newId = `OPP-${Math.floor(100 + Math.random() * 900)}`;
    const newOpportunity: Opportunity = {
      id: newId,
      title: newOppTitle.trim(),
      customerName: newOppCustomer.trim(),
      contactPerson: newOppContact.trim() || "Commercial Lead",
      estimatedValue: Number(newOppValue) || 2000000,
      expectedCloseDate: newOppCloseDate,
      stage: newOppStage,
      description: newOppDesc.trim(),
      owner: "Dewald",
      createCustomer: true,
      createContact: true,
      createdAt: new Date().toISOString().split("T")[0],
    };

    useLeadFlowStore.setState((state) => ({
      opportunities: [newOpportunity, ...state.opportunities],
    }));

    setShowNewOppModal(false);
    setNewOppTitle("");
    setNewOppCustomer("");
    setNewOppContact("");
    setNewOppValue("");
    setNewOppDesc("");
    setSelectedOppId(newId);
  };

  // Handle Handover to Project (Step 8)
  const handleInitiateHandover = () => {
    if (!selectedOpp) return;
    const found = availableSiteManagers.find((m) => m.name === handoverSiteManagerName);
    const project = handoverToProject(selectedOpp.id, {
      winReason: selectedOpp.winReason || "Customer accepted quote",
      winNotes: selectedOpp.winNotes || "Project awarded. Handover to execution team.",
      projectManager: "Project Lead",
      siteManagerId: found?.id || undefined,
      siteManagerName: handoverSiteManagerName || undefined,
    });

    setHandedOverProjectId(project.id);
    setHandedOverOpp(selectedOpp);
    setShowHandoverModal(true);
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <span className="text-eyebrow font-semibold tracking-wider text-ash uppercase">
              SALES &amp; BID OPPORTUNITIES
            </span>
            <h1 className="text-display-h1 font-bold text-onyx mt-0.5 tracking-tight">
              Opportunity Pipeline
            </h1>
            <p className="text-body text-ash mt-1">
              Track active bids, proposal stages, and contract handovers to execution.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setShowNewOppModal(true)}
              className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4.5 py-2.5 text-sm font-medium shadow-xs transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>New Opportunity</span>
            </button>
          </div>
        </div>

        {/* Top KPI Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-[10px] bg-white p-4.5 border border-pebble/60 shadow-2xs">
            <span className="text-xs font-semibold text-ash">Active Opportunities</span>
            <p className="text-2xl font-bold text-onyx mt-1">{oppList.length}</p>
            <p className="text-xs font-medium text-ash mt-1">Across all pipeline stages</p>
          </div>

          <div className="rounded-[10px] bg-white p-4.5 border border-pebble/60 shadow-2xs">
            <span className="text-xs font-semibold text-ash">Total Pipeline Value</span>
            <p className="text-2xl font-bold text-onyx mt-1">
              ₹{totalPipelineValue.toLocaleString("en-IN")}
            </p>
            <p className="text-xs font-medium text-ash mt-1">Weighted commercial volume</p>
          </div>

          <div className="rounded-[10px] bg-white p-4.5 border border-pebble/60 shadow-2xs">
            <span className="text-xs font-semibold text-ash">Won &amp; Handed Over</span>
            <p className="text-2xl font-bold text-success-text mt-1">
              ₹{wonValue.toLocaleString("en-IN")}
            </p>
            <p className="text-xs font-medium text-complete-status mt-1">
              {oppList.filter((o) => o.stage === "WON").length} deals won
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-[10px] border border-pebble/60 shadow-2xs">
          <div className="relative w-full max-w-md">
            <Search className="h-3.5 w-3.5 text-ash absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search opportunity, customer, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs text-onyx placeholder-ash bg-stone rounded-[10px] border border-pebble outline-none focus:border-onyx focus:bg-white transition"
            />
          </div>
          <span className="text-xs font-medium text-ash hidden sm:inline-block">
            Showing {filteredOpps.length} opportunities
          </span>
        </div>

        {/* Kanban Board Columns (5 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 items-start">
          {stages.map((st) => {
            const stageDeals = filteredOpps.filter((d) => d.stage === st.key);
            const stageSum = stageDeals.reduce((sum, d) => sum + (d.estimatedValue || 0), 0);

            return (
              <div
                key={st.key}
                className="bg-stone p-3.5 rounded-[12px] border border-pebble space-y-3 min-h-[520px] flex flex-col"
              >
                {/* Column Header */}
                <div className="pb-2.5 border-b border-pebble">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-onyx tracking-tight">
                      {st.label}
                    </h3>
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-white border border-pebble text-onyx shadow-2xs">
                      {stageDeals.length}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-ash mt-1">
                    ₹{(stageSum / 100000).toFixed(1)}L
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 flex-1">
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      onClick={() => setSelectedOppId(deal.id)}
                      className="bg-white p-3.5 rounded-[10px] border border-pebble hover:border-onyx hover:shadow-xs transition-all space-y-2.5 cursor-pointer relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-ash uppercase tracking-wider">
                          {deal.id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {deal.stage === "WON" ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-clear-bg text-success-text border border-clear-bg flex items-center gap-1">
                              <Trophy className="h-2.5 w-2.5" /> Won
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-ash flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {deal.expectedCloseDate}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete deal "${deal.title}"?`)) {
                                deleteOpportunity(deal.id);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-ash hover:text-hazard-text hover:bg-hazard-bg/20 rounded transition cursor-pointer"
                            title="Delete Opportunity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-onyx leading-snug group-hover:text-forest transition">
                        {deal.title}
                      </h4>

                      <div className="flex items-center gap-1.5 text-[11px] text-ash">
                        <Building className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{deal.customerName}</span>
                      </div>

                      <div className="pt-2 border-t border-pebble/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-onyx">
                          ₹{(deal.estimatedValue || 0).toLocaleString("en-IN")}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-stone text-onyx border border-pebble">
                          {deal.owner}
                        </span>
                      </div>

                      {deal.handedOverToProject && (
                        <div className="text-[10px] font-semibold text-forest flex items-center gap-1 bg-forest/5 p-1 rounded">
                          <CheckCircle2 className="h-3 w-3" /> Handed over ({deal.linkedProjectId})
                        </div>
                      )}
                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="py-8 text-center text-xs text-ash border border-dashed border-pebble rounded-[10px]">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      {/* Opportunity Detail Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-[16px] shadow-2xl border border-pebble overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-pebble flex items-center justify-between bg-stone/50">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-pebble text-onyx uppercase tracking-wider">
                  {selectedOpp.id}
                </span>
                <div>
                  <h2 className="text-lg font-bold text-onyx">{selectedOpp.title}</h2>
                  <p className="text-xs text-ash flex items-center gap-2 mt-0.5">
                    <span>{selectedOpp.customerName}</span>
                    <span>•</span>
                    <span>Contact: {selectedOpp.contactPerson}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete deal "${selectedOpp.title}"?`)) {
                      deleteOpportunity(selectedOpp.id);
                      setSelectedOppId(null);
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-[8px] text-xs font-semibold text-ash hover:bg-hazard-bg/20 hover:text-hazard-text transition cursor-pointer flex items-center gap-1.5 border border-pebble"
                  title="Delete Opportunity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOppId(null)}
                  className="p-1.5 rounded-[8px] text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Stage Progress Selector */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-ash">Pipeline Stage</Label>
                <div className="grid grid-cols-5 gap-1.5">
                  {stages.map((s) => {
                    const isActive = selectedOpp.stage === s.key;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => handleUpdateStage(s.key)}
                        className={`py-2 px-1 text-center rounded-[8px] text-xs font-semibold border transition cursor-pointer ${
                          isActive
                            ? "bg-forest text-white border-forest shadow-xs"
                            : "bg-stone text-ash hover:bg-mist hover:text-onyx border-pebble"
                        }`}
                      >
                        {s.label.split(" ")[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Value & Dates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-[12px] bg-stone/40 border border-pebble">
                <div>
                  <span className="text-[11px] font-medium text-ash">Estimated Value</span>
                  <p className="text-base font-bold text-onyx mt-0.5">
                    ₹{(selectedOpp.estimatedValue || 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-ash">Expected Close</span>
                  <p className="text-sm font-semibold text-onyx mt-0.5">
                    {selectedOpp.expectedCloseDate}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-ash">Deal Owner</span>
                  <p className="text-sm font-semibold text-onyx mt-0.5">
                    {selectedOpp.owner}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-ash">Description &amp; Requirements</span>
                <p className="text-xs text-onyx leading-relaxed bg-stone/30 p-3 rounded-[8px] border border-pebble/60">
                  {selectedOpp.description || "No specific notes provided for this commercial opportunity."}
                </p>
              </div>

              {/* Step 8: Won Details & Handover Section */}
              {selectedOpp.stage === "WON" && (
                <div className="p-5 rounded-[12px] bg-clear-bg border border-green-200 space-y-4">
                  <div className="flex items-center gap-2.5 text-success-text">
                    <Trophy className="h-5 w-5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-onyx">Opportunity Won!</h4>
                      <p className="text-xs text-ash">
                        Quote approved and terms finalized. Ready for project execution.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-[8px] border border-green-100">
                      <span className="text-[10px] font-semibold text-ash block uppercase">
                        Win Reason
                      </span>
                      <span className="font-bold text-onyx">
                        {selectedOpp.winReason || "Customer accepted quote"}
                      </span>
                    </div>
                    <div className="p-3 bg-white rounded-[8px] border border-green-100">
                      <span className="text-[10px] font-semibold text-ash block uppercase">
                        Win Notes
                      </span>
                      <span className="font-medium text-onyx">
                        {selectedOpp.winNotes || "Project awarded. Transferred to project manager."}
                      </span>
                    </div>
                  </div>

                  {/* Handover to Project Action */}
                  <div className="pt-2 border-t border-green-200/60 flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-onyx block">
                          Handover to Project
                        </span>
                        <p className="text-[11px] text-ash">
                          {selectedOpp.handedOverToProject
                            ? `Already handed over as Project #${selectedOpp.linkedProjectId}`
                            : "Create new project from this opportunity and assign execution team."}
                        </p>
                      </div>

                      {selectedOpp.handedOverToProject && (
                        <Button
                          type="button"
                          onClick={() => router.push(`/projects`)}
                          className="bg-forest hover:bg-forest-hover text-white text-xs h-9 font-medium cursor-pointer"
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          <span>View in Projects</span>
                        </Button>
                      )}
                    </div>

                    {!selectedOpp.handedOverToProject && (
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 bg-white p-3 rounded-lg border border-pebble">
                        <div className="flex-1 space-y-1 w-full">
                          <label className="text-[11px] font-semibold text-onyx block">
                            Assign Site Manager:
                          </label>
                          <select
                            value={handoverSiteManagerName}
                            onChange={(e) => setHandoverSiteManagerName(e.target.value)}
                            className="w-full text-xs h-8 bg-stone/40 border border-pebble rounded-md px-2 text-onyx font-medium outline-none focus:border-forest"
                          >
                            <option value="">-- Select Site Manager (Optional) --</option>
                            {availableSiteManagers.map((m) => (
                              <option key={m.id} value={m.name}>
                                {m.name} ({m.role})
                              </option>
                            ))}
                          </select>
                        </div>
                        <Button
                          type="button"
                          onClick={handleInitiateHandover}
                          className="bg-forest hover:bg-forest-hover text-white text-xs h-8 font-medium shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                          <Briefcase className="h-3.5 w-3.5" />
                          <span>Create Project</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-pebble flex items-center justify-between bg-stone/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedOppId(null)}
                className="text-xs cursor-pointer"
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                {selectedOpp.stage !== "WON" && (
                  <Button
                    type="button"
                    onClick={() => {
                      // Navigate to quotations page to create quote for this opportunity (Step 6)
                      router.push(`/quotations?opportunityId=${selectedOpp.id}`);
                    }}
                    className="bg-forest hover:bg-forest-hover text-white text-xs h-9 font-medium cursor-pointer flex items-center gap-1.5"
                  >
                    <FileCheck2 className="h-3.5 w-3.5" />
                    <span>Create Quote</span>
                  </Button>
                )}

                {selectedOpp.stage !== "WON" && (
                  <Button
                    type="button"
                    onClick={() => handleUpdateStage("WON")}
                    className="bg-onyx hover:bg-black text-white text-xs h-9 font-medium cursor-pointer"
                  >
                    <span>Mark as Won</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Opportunity Modal */}
      {showNewOppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-[16px] shadow-2xl border border-pebble overflow-hidden">
            <div className="p-5 border-b border-pebble flex items-center justify-between bg-stone/50">
              <h3 className="text-base font-bold text-onyx">Add New Opportunity</h3>
              <button
                type="button"
                onClick={() => setShowNewOppModal(false)}
                className="p-1 rounded-md text-ash hover:text-onyx"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewOpp} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-onyx">Opportunity Title *</Label>
                <Input
                  required
                  placeholder="e.g. Warehouse PEB Construction"
                  value={newOppTitle}
                  onChange={(e) => setNewOppTitle(e.target.value)}
                  className="text-xs h-9 rounded-[8px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-onyx">Customer Name *</Label>
                  <Input
                    required
                    placeholder="e.g. Skyline Logistics"
                    value={newOppCustomer}
                    onChange={(e) => setNewOppCustomer(e.target.value)}
                    className="text-xs h-9 rounded-[8px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-onyx">Contact Person</Label>
                  <Input
                    placeholder="e.g. Vikram Singh"
                    value={newOppContact}
                    onChange={(e) => setNewOppContact(e.target.value)}
                    className="text-xs h-9 rounded-[8px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-onyx">Estimated Value (₹) *</Label>
                  <Input
                    type="number"
                    required
                    placeholder="e.g. 2500000"
                    value={newOppValue}
                    onChange={(e) => setNewOppValue(e.target.value)}
                    className="text-xs h-9 rounded-[8px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-onyx">Expected Close Date</Label>
                  <Input
                    type="date"
                    value={newOppCloseDate}
                    onChange={(e) => setNewOppCloseDate(e.target.value)}
                    className="text-xs h-9 rounded-[8px]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-onyx">Pipeline Stage</Label>
                <select
                  value={newOppStage}
                  onChange={(e) => setNewOppStage(e.target.value as OpportunityStage)}
                  className="w-full px-3 py-2 text-xs text-onyx bg-stone rounded-[8px] border border-pebble outline-none focus:border-onyx focus:bg-white"
                >
                  <option value="NEW">New Opportunity</option>
                  <option value="QUALIFIED">Lead Qualified</option>
                  <option value="PROPOSAL">Proposal Submitted</option>
                  <option value="NEGOTIATION">Negotiation</option>
                  <option value="WON">Contract Won</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-onyx">Description</Label>
                <Input
                  placeholder="Scope notes, bid details, etc."
                  value={newOppDesc}
                  onChange={(e) => setNewOppDesc(e.target.value)}
                  className="text-xs h-9 rounded-[8px]"
                />
              </div>

              <div className="pt-3 border-t border-pebble flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewOppModal(false)}
                  className="text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-forest hover:bg-forest-hover text-white text-xs h-9 font-medium"
                >
                  Create Opportunity
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Step 8 Handover Success Modal */}
      {showHandoverModal && handedOverOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-md bg-white rounded-[20px] shadow-2xl border border-pebble p-6 text-center space-y-5">
            {/* Trophy Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-forest/10 border-2 border-forest/30 flex items-center justify-center text-forest">
              <Trophy className="h-8 w-8 text-forest" />
            </div>

            <div>
              <span className="text-[10px] font-bold text-forest uppercase tracking-widest bg-forest/10 px-2.5 py-0.5 rounded-full">
                Step 8 • Handover Success
              </span>
              <h2 className="text-xl font-bold text-onyx mt-2">
                Opportunity Won!
              </h2>
              <p className="text-xs text-ash mt-1">
                Project handover initiated successfully for <span className="font-semibold text-onyx">{handedOverOpp.title}</span>.
              </p>
            </div>

            {/* Checklist of Handover Steps */}
            <div className="text-left bg-stone/50 p-4 rounded-[12px] border border-pebble space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-onyx">
                <CheckCircle2 className="h-4 w-4 text-forest shrink-0" />
                <span className="font-medium">Customer Account Confirmed</span>
              </div>
              <div className="flex items-center gap-2.5 text-onyx">
                <CheckCircle2 className="h-4 w-4 text-forest shrink-0" />
                <span className="font-medium">Project Scope &amp; Line Items Transferred</span>
              </div>
              <div className="flex items-center gap-2.5 text-onyx">
                <CheckCircle2 className="h-4 w-4 text-forest shrink-0" />
                <span className="font-medium">Created Project: <span className="font-bold text-forest">#{handedOverProjectId}</span></span>
              </div>
              <div className="flex items-center gap-2.5 text-onyx">
                <CheckCircle2 className="h-4 w-4 text-forest shrink-0" />
                <span className="font-medium">
                  Site Manager Assigned:{" "}
                  <span className="font-bold text-forest">
                    {handoverSiteManagerName || "Unassigned"}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                type="button"
                onClick={() => {
                  setShowHandoverModal(false);
                  router.push("/projects");
                }}
                className="w-full bg-forest hover:bg-forest-hover text-white text-xs h-10 font-semibold shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>View Project</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowHandoverModal(false)}
                className="w-full text-xs h-9 cursor-pointer"
              >
                Back to Pipeline
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PipelinePage() {
  return (
    <FirmaLayout activeNav="Pipeline">
      <Suspense fallback={<div className="p-8 text-center text-xs text-ash">Loading pipeline...</div>}>
        <PipelineContent />
      </Suspense>
    </FirmaLayout>
  );
}