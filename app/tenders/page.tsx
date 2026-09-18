"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  useTenderFlowStore,
  type TenderFlowStep,
  type OpportunityStage,
} from "@/store/tenderFlowStore";
import { db, type Customer } from "@/lib/db";
import { useAuthStore } from "@/store/authStore";
import { useLeadFlowStore } from "@/store/leadFlowStore";
import { useCrewStore, type CrewMember } from "@/store/crewStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FolderKanban,
  Plus,
  Search,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Building,
  Mail,
  Check,
  Award,
  Sparkles,
  Layers,
  BarChart3,
  TrendingUp,
  FileCheck2,
  Send,
  Eye,
  RotateCcw,
  IndianRupee,
  Clock,
  ShieldCheck,
  X,
  ChevronRight,
  ExternalLink,
  Users,
  HardHat,
  ClipboardList,
} from "lucide-react";

export default function TenderPage() {
  const router = useRouter();
  const {
    currentStep,
    activeOpportunityId,
    activeTenderId,
    opportunities,
    tenders,
    suppliers,
    bids,
    setStep,
    setActiveOpportunity,
    setActiveTender,
    createOpportunity,
    createTender,
    addSupplier,
    toggleSupplierSelection,
    sendRfqToSelectedSuppliers,
    awardTenderToSupplier,
    completeTenderFlow,
    resetFlowToDefault,
  } = useTenderFlowStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Opportunity List State (Step 1)
  const [oppFilter, setOppFilter] = useState<string>("All");
  const [oppSearch, setOppSearch] = useState<string>("");
  const [showNewOppModal, setShowNewOppModal] = useState<boolean>(false);
  const [newOppName, setNewOppName] = useState<string>("");
  const [newOppClient, setNewOppClient] = useState<string>("");
  const [newOppValue, setNewOppValue] = useState<string>("");
  const [newOppLocation, setNewOppLocation] = useState<string>("");
  const [newOppExpectedStart, setNewOppExpectedStart] = useState<string>("");
  const [newOppDesc, setNewOppDesc] = useState<string>("");

  // Registered Clients and Pipeline Opportunities for auto-filling
  const currentUser = useAuthStore((state) => state.currentUser);

  useEffect(() => {
    if (currentUser && (currentUser.role === "SITE_MANAGER" || currentUser.role === "FIELD_WORKER")) {
      router.replace("/dashboard");
    }
  }, [currentUser, router]);

  const leadOpportunities = useLeadFlowStore((state) => state.opportunities || []);
  const leadList = useLeadFlowStore((state) => state.leads || []);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string>("");

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const companyId = currentUser?.companyId || "ORG-DEFAULT";
        const list = await db.customer.where("companyId").equals(companyId).toArray();
        setCustomers(list);
      } catch (err) {
        console.error("Failed to load customers for tenders:", err);
      }
    };
    loadCustomers();
  }, [currentUser?.companyId, showNewOppModal]);

  const handleSelectSource = (value: string) => {
    setSelectedSourceId(value);
    if (!value) return;

    if (value.startsWith("cust_")) {
      const custId = parseInt(value.replace("cust_", ""), 10);
      const cust = customers.find((c) => c.id === custId);
      if (cust) {
        setNewOppClient(cust.companyName);
        if (!newOppName || newOppName.startsWith("Project for ") || newOppName.includes("Commercial Works") || newOppName.includes("Project")) {
          setNewOppName(`${cust.companyName} Commercial Works`);
        }
        if (cust.address) {
          setNewOppLocation(cust.address);
        }
        if (cust.notes || cust.industry) {
          setNewOppDesc(cust.notes || `${cust.industry} construction & fitout for ${cust.companyName}`);
        }
        if (!newOppExpectedStart) {
          setNewOppExpectedStart(
            new Date(Date.now() + 15 * 86400000).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          );
        }
      }
    } else if (value.startsWith("opp_")) {
      const oppId = value.replace("opp_", "");
      const opp = leadOpportunities.find((o) => o.id === oppId);
      if (opp) {
        setNewOppName(opp.title);
        setNewOppClient(opp.customerName);
        setNewOppValue(opp.estimatedValue ? `${opp.estimatedValue}` : "1000000");
        setNewOppExpectedStart(opp.expectedCloseDate || "");
        setNewOppDesc(opp.description || `Won Opportunity for ${opp.customerName}`);

        if (opp.leadId) {
          const linkedLead = leadList.find((l) => l.id === opp.leadId);
          if (linkedLead?.location) {
            setNewOppLocation(linkedLead.location);
          }
        }
      }
    } else if (value.startsWith("lead_")) {
      const leadId = value.replace("lead_", "");
      const lead = leadList.find((l) => l.id === leadId);
      if (lead) {
        setNewOppName(`${lead.companyName} Project`);
        setNewOppClient(lead.companyName);
        setNewOppValue(lead.estimatedValue ? `${lead.estimatedValue}` : "1000000");
        setNewOppLocation(lead.location || "");
        setNewOppDesc(lead.requirement || lead.notes || "");
      }
    }
  };

  // Step 2 Tabs
  const [step2Tab, setStep2Tab] = useState<"Overview" | "Details" | "Documents" | "Activity">("Overview");

  // Step 3 Create Tender Form State
  const [tenderTitle, setTenderTitle] = useState<string>("");
  const [tenderCategory, setTenderCategory] = useState<string>("Electrical");
  const [tenderDesc, setTenderDesc] = useState<string>("");
  const [tenderEstimatedValue, setTenderEstimatedValue] = useState<string>("");
  const [tenderDeadline, setTenderDeadline] = useState<string>("");

  // Step 4/6/8 Tabs
  const [tenderTab, setTenderTab] = useState<
    "Details" | "Suppliers" | "Bids" | "Award" | "Budget Impact" | "Activity"
  >("Details");

  // Step 5: Add Supplier Modal State
  const crewMembers = useCrewStore((state) => state.members || []);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState<boolean>(false);
  const [selectedCrewMemberId, setSelectedCrewMemberId] = useState<string>("");
  const [isManualSupplier, setIsManualSupplier] = useState<boolean>(false);
  const [autoFilledCrewInfo, setAutoFilledCrewInfo] = useState<string | null>(null);
  const [newSupName, setNewSupName] = useState<string>("");
  const [newSupTrade, setNewSupTrade] = useState<string>("Electrical");
  const [newSupEmail, setNewSupEmail] = useState<string>("");

  // View Project Budget Modal / Overlay in Step 8
  const [showBudgetModal, setShowBudgetModal] = useState<boolean>(false);

  // Active items
  const activeOpp =
    opportunities.find((o) => o.id === activeOpportunityId) ||
    (opportunities.length > 0 ? opportunities[0] : null);

  const activeTender =
    tenders.find((t) => t.id === activeTenderId) ||
    (tenders.length > 0 ? tenders[0] : null);

  const tenderBids = activeTender
    ? bids.filter((b) => b.tenderId === activeTender.id)
    : [];

  const selectedSuppliersCount = suppliers.filter((s) => s.selected).length;

  // Step Navigation Helper
  const goToStep = (step: TenderFlowStep) => {
    setStep(step);
    if (step === 6) {
      setTenderTab("Bids");
    } else if (step === 8) {
      setTenderTab("Award");
    } else if (step === 4) {
      setTenderTab("Details");
    }
  };

  // Return to Opportunities and cleanly reset active tender selection
  const handleReturnToOpportunities = () => {
    setActiveTender("");
    setActiveOpportunity("");
    completeTenderFlow();
  };

  // Stage Badge Styles
  const getStageBadge = (stage: OpportunityStage) => {
    switch (stage) {
      case "Won":
        return "bg-clear-bg text-success-text border-pebble/60";
      case "Proposal":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Negotiation":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Lost":
        return "bg-hazard-bg text-hazard-text border-hazard-bg";
      default:
        return "bg-stone text-onyx border-pebble/60";
    }
  };

  // Step 1: Create New Opportunity Form Submit
  const handleCreateNewOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOppName.trim() || !newOppClient.trim()) return;

    const numVal = parseInt(newOppValue.replace(/[^0-9]/g, ""), 10) || 1000000;
    const newId = createOpportunity({
      projectName: newOppName.trim(),
      client: newOppClient.trim(),
      value: numVal,
      stage: "Won",
      location: newOppLocation.trim() || "Delhi NCR",
      expectedStart:
        newOppExpectedStart.trim() ||
        new Date(Date.now() + 15 * 86400000).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      description: newOppDesc.trim() || "Commercial & civil construction project.",
    });

    setActiveOpportunity(newId);
    setShowNewOppModal(false);
    setNewOppName("");
    setNewOppClient("");
    setNewOppValue("");
    setNewOppLocation("");
    setNewOppExpectedStart("");
    setNewOppDesc("");
    setSelectedSourceId("");

    // Navigate to Step 2 to view details
    goToStep(2);
  };

  // Step 3: Initialize Tender Form when opening
  const handleOpenCreateTender = () => {
    if (activeOpp) {
      const existingTrades = tenders
        .filter((t) => t.opportunityId === activeOpp.id)
        .map((t) => t.category);
      const allTrades = [
        "Electrical",
        "Plumbing",
        "HVAC",
        "Civil Works",
        "Painting",
        "Carpentry",
      ];
      const nextTrade =
        allTrades.find((trade) => !existingTrades.includes(trade)) || "Specialty";

      setTenderTitle(`${activeOpp.projectName} - ${nextTrade} Package`);
      setTenderCategory(nextTrade === "Specialty" ? "Electrical" : nextTrade);
      setTenderDesc(
        `Complete ${nextTrade.toLowerCase()} installations, trade packages, and specifications for ${activeOpp.projectName}.`
      );
      setTenderEstimatedValue(String(Math.round(activeOpp.value * 0.25)));
      setTenderDeadline(
        new Date(Date.now() + 30 * 86400000).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      );
    } else {
      setTenderTitle("");
      setTenderCategory("Electrical");
      setTenderDesc("");
      setTenderEstimatedValue("");
      setTenderDeadline("");
    }
    goToStep(3);
  };

  // Step 3: Create Tender Form Submit
  const handleCreateTenderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenderTitle.trim() || !activeOpp) return;

    const numVal = parseInt(tenderEstimatedValue.replace(/[^0-9]/g, ""), 10) || 250000;
    const newTenderId = createTender({
      opportunityId: activeOpp.id,
      projectName: activeOpp.projectName,
      title: tenderTitle.trim(),
      category: tenderCategory,
      description: tenderDesc.trim(),
      estimatedValue: numVal,
      submissionDeadline:
        tenderDeadline.trim() ||
        new Date(Date.now() + 30 * 86400000).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    });

    setActiveTender(newTenderId);
    goToStep(4);
  };

  // Smart trade matching for crew members
  const matchTradeCategory = (tradeStr?: string): string => {
    if (!tradeStr) return "Electrical";
    const lower = tradeStr.toLowerCase();
    if (lower.includes("electr")) return "Electrical";
    if (lower.includes("plumb") || lower.includes("pip")) return "Plumbing";
    if (lower.includes("hvac") || lower.includes("air") || lower.includes("vent")) return "HVAC";
    if (lower.includes("paint")) return "Painting";
    if (lower.includes("carpent") || lower.includes("wood") || lower.includes("shutter")) return "Carpentry";
    if (
      lower.includes("mason") ||
      lower.includes("civil") ||
      lower.includes("steel") ||
      lower.includes("floor") ||
      lower.includes("tile") ||
      lower.includes("labor") ||
      lower.includes("struct")
    )
      return "Civil";
    return "Electrical";
  };

  // Step 5: Open Add Supplier Modal
  const handleOpenAddSupplierModal = () => {
    setSelectedCrewMemberId("");
    setIsManualSupplier(false);
    setAutoFilledCrewInfo(null);
    setNewSupName("");
    setNewSupTrade(activeTender?.category || "Electrical");
    setNewSupEmail("");
    setShowAddSupplierModal(true);
  };

  // Step 5: Select Crew Member
  const handleSelectCrewMember = (memberId: string) => {
    if (memberId === "__MANUAL__") {
      setIsManualSupplier(true);
      setSelectedCrewMemberId("__MANUAL__");
      setAutoFilledCrewInfo(null);
      setNewSupName("");
      return;
    }

    setSelectedCrewMemberId(memberId);

    if (!memberId) {
      setAutoFilledCrewInfo(null);
      setNewSupName("");
      setNewSupEmail("");
      return;
    }

    const member = crewMembers.find((m) => m.id === memberId);
    if (member) {
      setIsManualSupplier(false);
      setNewSupName(member.name);
      const matched = matchTradeCategory(member.trade);
      if (matched) {
        setNewSupTrade(matched);
      }
      if (member.email) {
        setNewSupEmail(member.email);
      } else {
        const cleanName = member.name.toLowerCase().replace(/\s+/g, ".");
        setNewSupEmail(`${cleanName}@crew-firma.com`);
      }
      setAutoFilledCrewInfo(`${member.name} (${member.role} • ${member.trade || "General"})`);
    }
  };

  // Step 5: Add New Supplier
  const handleAddSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName.trim()) return;

    addSupplier({
      name: newSupName.trim(),
      trade: newSupTrade,
      email: newSupEmail.trim() || `${newSupName.toLowerCase().replace(/\s+/g, ".")}@supplier.com`,
    });

    setNewSupName("");
    setNewSupEmail("");
    setSelectedCrewMemberId("");
    setIsManualSupplier(false);
    setAutoFilledCrewInfo(null);
    setShowAddSupplierModal(false);
  };

  // Step 5: Issue RFQ Submit
  const handleSendRfqSubmit = () => {
    if (!activeTender) return;
    sendRfqToSelectedSuppliers(activeTender.id);
    goToStep(6);
  };

  // Step 7: Award Tender to Supplier
  const handleAwardSupplier = (supplierId: string) => {
    if (!activeTender) return;
    awardTenderToSupplier(activeTender.id, supplierId);
    goToStep(8);
  };

  if (!mounted) {
    return (
      <FirmaLayout activeNav="Tenders">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-2">
            <div className="h-6 w-6 border-2 border-forest border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-ash">Loading Tender Flow...</p>
          </div>
        </div>
      </FirmaLayout>
    );
  }

  // Filtered Opportunities for Step 1
  const filteredOpps = opportunities.filter((opp) => {
    const matchFilter = oppFilter === "All" || opp.stage === oppFilter;
    const matchSearch =
      opp.projectName.toLowerCase().includes(oppSearch.toLowerCase()) ||
      opp.client.toLowerCase().includes(oppSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Calculate project financial metrics dynamically
  const projectTotalValue = activeOpp?.value || 0;
  const tenderAwardedAmount = activeTender?.awardedAmount || 0;
  const tenderEstimatedVal = activeTender?.estimatedValue || 0;
  const remainingBudget = Math.max(0, projectTotalValue - tenderAwardedAmount);
  const costSavings =
    tenderEstimatedVal > tenderAwardedAmount ? tenderEstimatedVal - tenderAwardedAmount : 0;
  const committedPercentage =
    projectTotalValue > 0
      ? Math.min(100, Math.round((tenderAwardedAmount / projectTotalValue) * 100))
      : 0;

  if (currentUser?.role === "SITE_MANAGER" || currentUser?.role === "FIELD_WORKER") {
    return (
      <FirmaLayout activeNav="Dashboard">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Eye className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-onyx">Access Restricted</h2>
          <p className="text-xs text-ash max-w-md">
            Tenders, bidding, and procurement workflows are restricted to Project Managers and Administrators. Redirecting to Dashboard...
          </p>
        </div>
      </FirmaLayout>
    );
  }

  return (
    <FirmaLayout activeNav="Tenders">
      <div className="space-y-6 mt-1">

        {/* ========================================================================= */}
        {/* FLOW STEPPER PROGRESS BAR (8 Steps from user diagram)                     */}
        {/* ========================================================================= */}
        <div className="rounded-[14px] bg-white border border-pebble/80 p-3.5 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-pebble/50">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-forest text-white font-bold text-xs shadow-xs">
                {currentStep}/8
              </div>
              <div>
                <span className="text-[11px] font-bold text-forest uppercase tracking-wider block leading-none">
                  Tender Flow Workflow
                </span>
                <p className="text-sm font-bold text-onyx mt-0.5 leading-tight">
                  {currentStep === 1 && "1. Project Opportunity List (View Project)"}
                  {currentStep === 2 && "2. View Project / Opportunity Details"}
                  {currentStep === 3 && "3. Create Tender"}
                  {currentStep === 4 && "4. Tender Details (Issue RFQ)"}
                  {currentStep === 5 && "5. Select Suppliers and Send RFQ"}
                  {currentStep === 6 && "6. Bids Received"}
                  {currentStep === 7 && "7. Compare Bids and Award"}
                  {currentStep === 8 && "8. Tender Awarded (Connected to Project Budget)"}
                </p>
              </div>
            </div>

            {/* Quick Actions & Reset */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetFlowToDefault}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ash hover:text-onyx bg-stone hover:bg-mist rounded-[8px] border border-pebble transition cursor-pointer"
                title="Reset wizard stepper to Step 1 (Contractors and tenders are safely preserved)"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Flow</span>
              </button>
            </div>
          </div>

          {/* Stepper Dots / Pills */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-3">
            {[
              { num: 1, label: "Opportunities" },
              { num: 2, label: "View Project" },
              { num: 3, label: "Create Tender" },
              { num: 4, label: "Tender Details" },
              { num: 5, label: "Send RFQ" },
              { num: 6, label: "Bids Received" },
              { num: 7, label: "Compare Bids" },
              { num: 8, label: "Awarded & Budget" },
            ].map((s) => {
              const isCurrent = currentStep === s.num;
              const isDone = currentStep > s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => goToStep(s.num as TenderFlowStep)}
                  className={`flex flex-col items-center p-2 rounded-[8px] text-center transition cursor-pointer border ${
                    isCurrent
                      ? "bg-forest text-white border-forest shadow-2xs font-semibold"
                      : isDone
                      ? "bg-clear-bg text-success-text border-success/30 font-medium hover:bg-clear-bg/80"
                      : "bg-stone/60 text-ash border-pebble/60 hover:bg-mist/70 hover:text-onyx"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {isDone ? (
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    ) : (
                      <span className="text-[11px] font-bold">{s.num}</span>
                    )}
                  </div>
                  <span className="text-[10px] truncate max-w-full mt-0.5 leading-tight">
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: PROJECT OPPORTUNITY LIST (View Project)                           */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
              <div>
                <span className="text-eyebrow font-semibold tracking-wider text-ash uppercase">
                  PROJECT OPPORTUNITY LIST
                </span>
                <h1 className="text-display-h1 font-bold text-onyx mt-0.5 tracking-tight flex items-center gap-2">
                  <FolderKanban className="h-6 w-6 text-forest" />
                  <span>Opportunities</span>
                </h1>
                <p className="text-sm text-ash mt-1">
                  Track projects won or in negotiation to initiate trade packages and tenders.
                </p>
              </div>

              <Button
                onClick={() => setShowNewOppModal(true)}
                className="bg-forest hover:bg-forest-hover text-white rounded-[10px] px-4.5 py-2.5 text-sm font-medium shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>New Opportunity</span>
              </Button>
            </div>

            {/* Filter Tabs & Search */}
            <div className="rounded-[10px] bg-white p-3 border border-pebble/70 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                {["All", "Open", "Won", "Lost"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setOppFilter(tab)}
                    className={`px-3.5 py-1.5 rounded-[8px] text-xs font-semibold transition cursor-pointer ${
                      oppFilter === tab
                        ? "bg-forest text-white shadow-2xs"
                        : "text-ash hover:text-onyx hover:bg-stone"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="h-4 w-4 text-ash absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  value={oppSearch}
                  onChange={(e) => setOppSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-sm text-onyx placeholder:text-ash bg-stone rounded-[8px] border border-pebble outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 transition"
                />
              </div>
            </div>

            {/* Opportunities Table */}
            <div className="rounded-[10px] bg-white border border-pebble/70 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-onyx">
                  <thead>
                    <tr className="border-b border-pebble bg-stone/70 text-xs font-semibold text-ash uppercase tracking-wider">
                      <th className="py-3 px-4 w-12">#</th>
                      <th className="py-3 px-4">Project Name</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Value</th>
                      <th className="py-3 px-4">Tender Packages</th>
                      <th className="py-3 px-4">Stage</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pebble/60">
                    {filteredOpps.map((item, idx) => {
                      const oppTenders = tenders.filter(
                        (t) => t.opportunityId === item.id
                      );
                      const hasAwarded = oppTenders.some(
                        (t) => t.status === "Awarded"
                      );

                      return (
                        <tr key={item.id} className="hover:bg-stone/60 transition">
                          <td className="py-3.5 px-4 text-ash font-medium text-xs">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-onyx">
                            {item.projectName}
                          </td>
                          <td className="py-3.5 px-4 text-ash font-medium">
                            {item.client}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-onyx">
                            ₹{item.value.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 px-4">
                            {oppTenders.length === 0 ? (
                              <span className="text-xs text-ash">0 Packages</span>
                            ) : (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-semibold text-onyx">
                                  {oppTenders.length}{" "}
                                  {oppTenders.length === 1 ? "Package" : "Packages"}
                                </span>
                                {hasAwarded && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-clear-bg text-success-text border border-success/30 shadow-2xs">
                                    ✓ Awarded
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStageBadge(
                                item.stage
                              )}`}
                            >
                              {item.stage}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setActiveOpportunity(item.id);
                                goToStep(2);
                              }}
                              className="rounded-[6px] border-pebble text-xs font-medium px-3.5 py-1 hover:bg-breath hover:text-onyx cursor-pointer"
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredOpps.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-14 text-center text-ash">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone text-ash">
                              <FolderKanban className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-semibold text-onyx">No project opportunities found</p>
                            <p className="text-xs text-ash max-w-sm">
                              Get started by adding your first project opportunity to begin the tender and procurement flow.
                            </p>
                            <Button
                              onClick={() => setShowNewOppModal(true)}
                              className="mt-2 bg-forest hover:bg-forest-hover text-white rounded-[8px] text-xs font-semibold px-4 py-2 cursor-pointer shadow-xs"
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Add Project Opportunity
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: VIEW PROJECT / OPPORTUNITY DETAILS                                */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Top Navigation */}
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-ash hover:text-onyx transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>&lt; Back to Opportunities</span>
            </button>

            {!activeOpp ? (
              <div className="rounded-[14px] bg-white border border-pebble/70 p-10 text-center space-y-3">
                <p className="text-sm font-semibold text-onyx">No opportunity selected</p>
                <p className="text-xs text-ash">Please choose an opportunity from the list or create a new one.</p>
                <Button onClick={() => goToStep(1)} className="bg-forest text-white text-xs">
                  Go to Opportunities
                </Button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-pebble/60">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-onyx tracking-tight">
                      {activeOpp.projectName}
                    </h1>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStageBadge(
                        activeOpp.stage
                      )}`}
                    >
                      {activeOpp.stage}
                    </span>
                  </div>

                  <Button
                    onClick={handleOpenCreateTender}
                    className="bg-forest hover:bg-forest-hover text-white rounded-[10px] px-4.5 py-2.5 text-sm font-semibold shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ Create Tender</span>
                  </Button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 border-b border-pebble/60 pb-1">
                  {(["Overview", "Details", "Documents", "Activity"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setStep2Tab(tab)}
                      className={`px-4 py-2 text-xs font-semibold rounded-[8px] transition cursor-pointer ${
                        step2Tab === tab
                          ? "bg-white text-onyx border border-pebble shadow-2xs"
                          : "text-ash hover:text-onyx hover:bg-stone"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Overview Card */}
                {step2Tab === "Overview" && (
                  <div className="rounded-[14px] bg-white border border-pebble/70 p-6 shadow-2xs space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                      <div>
                        <span className="text-xs font-semibold text-ash block uppercase tracking-wider">
                          Client
                        </span>
                        <p className="font-bold text-onyx text-base mt-1">
                          {activeOpp.client}
                        </p>
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-ash block uppercase tracking-wider">
                          Project Value
                        </span>
                        <p className="font-bold text-forest text-base mt-1">
                          ₹{activeOpp.value.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-ash block uppercase tracking-wider">
                          Location
                        </span>
                        <p className="font-semibold text-onyx mt-1">
                          {activeOpp.location || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-ash block uppercase tracking-wider">
                          Expected Start
                        </span>
                        <p className="font-semibold text-onyx mt-1">
                          {activeOpp.expectedStart || "Pending"}
                        </p>
                      </div>

                      <div className="sm:col-span-2 pt-2 border-t border-pebble/50">
                        <span className="text-xs font-semibold text-ash block uppercase tracking-wider">
                          Description
                        </span>
                        <p className="text-sm text-onyx mt-1.5 leading-relaxed bg-stone/70 p-3.5 rounded-[10px] border border-pebble/60">
                          {activeOpp.description || "No project description specified."}
                        </p>
                      </div>
                    </div>

                    {/* Project Tender Packages Section */}
                    <div className="pt-4 border-t border-pebble/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-onyx flex items-center gap-2">
                            <Layers className="h-4 w-4 text-forest" />
                            <span>Work Packages &amp; Tenders ({tenders.filter((t) => t.opportunityId === activeOpp.id).length})</span>
                          </h3>
                          <p className="text-xs text-ash mt-0.5">
                            Trade packages, RFQs, and awarded subcontracts for {activeOpp.projectName}
                          </p>
                        </div>
                        <Button
                          onClick={handleOpenCreateTender}
                          className="bg-forest hover:bg-forest-hover text-white rounded-[8px] text-xs font-semibold px-3.5 py-1.5 cursor-pointer shadow-xs"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          + Create Tender Package
                        </Button>
                      </div>

                      {tenders.filter((t) => t.opportunityId === activeOpp.id).length === 0 ? (
                        <div className="rounded-[10px] bg-stone/60 border border-dashed border-pebble p-6 text-center space-y-2">
                          <p className="text-xs font-semibold text-onyx">No tender packages created yet for this project</p>
                          <p className="text-[11px] text-ash max-w-sm mx-auto">
                            Break down your project into trade packages (e.g. Electrical, Plumbing, HVAC) to invite competitive bids.
                          </p>
                          <Button
                            onClick={handleOpenCreateTender}
                            variant="outline"
                            className="text-xs font-semibold text-forest border-forest/30 hover:bg-breath mt-1"
                          >
                            + Create First Tender Package
                          </Button>
                        </div>
                      ) : (
                        <div className="divide-y divide-pebble/60 rounded-[10px] border border-pebble/70 overflow-hidden bg-stone/30">
                          {tenders
                            .filter((t) => t.opportunityId === activeOpp.id)
                            .map((tender) => {
                              const isAwarded = tender.status === "Awarded";
                              const hasBids = bids.some((b) => b.tenderId === tender.id);

                              return (
                                <div
                                  key={tender.id}
                                  className="p-3.5 bg-white hover:bg-stone/50 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="text-sm font-bold text-onyx">
                                        {tender.title}
                                      </h4>
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone text-ash border border-pebble">
                                        {tender.category}
                                      </span>
                                      {isAwarded ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-clear-bg text-success-text border border-success/30">
                                          ✓ Awarded: {tender.awardedSupplierName}
                                        </span>
                                      ) : hasBids ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                          Bids Received
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone text-ash border border-pebble">
                                          {tender.status}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-ash flex-wrap">
                                      <span>
                                        Est. Value: <strong className="text-onyx font-semibold">₹{(tender.estimatedValue || 0).toLocaleString("en-IN")}</strong>
                                      </span>
                                      {isAwarded && tender.awardedAmount && (
                                        <span className="text-forest font-semibold">
                                          Awarded Value: ₹{tender.awardedAmount.toLocaleString("en-IN")}
                                        </span>
                                      )}
                                      <span>Deadline: {tender.submissionDeadline}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setActiveTender(tender.id);
                                        if (tender.status === "Awarded") {
                                          goToStep(8);
                                        } else if (hasBids) {
                                          goToStep(7);
                                        } else {
                                          goToStep(4);
                                        }
                                      }}
                                      className="rounded-[6px] border-pebble text-xs font-semibold px-3 py-1 hover:bg-stone cursor-pointer"
                                    >
                                      View Package &rarr;
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step2Tab !== "Overview" && (
                  <div className="rounded-[14px] bg-white border border-pebble/70 p-8 text-center text-ash text-sm">
                    <p className="font-medium text-onyx">{step2Tab} for {activeOpp.projectName}</p>
                    <p className="text-xs text-ash mt-1">
                      Site blueprints, structural notes, specifications and progress logs.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: CREATE TENDER                                                     */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-150 max-w-3xl">
            {/* Top Navigation */}
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-ash hover:text-onyx transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>&lt; Back to Project</span>
            </button>

            {/* Form Card */}
            <div className="rounded-[18px] bg-white border border-pebble/80 p-6 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-pebble/60">
                <div>
                  <h2 className="text-xl font-bold text-onyx">Create Tender</h2>
                  <p className="text-xs text-ash mt-0.5">
                    Define work package details and prepare RFQ parameters.
                  </p>
                </div>
                <div className="text-xs font-bold text-forest bg-breath px-3 py-1 rounded-[6px] self-start sm:self-auto">
                  Project: {activeOpp?.projectName || "New Project"}
                </div>
              </div>

              <form onSubmit={handleCreateTenderSubmit} className="mt-5 space-y-4.5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-onyx">
                    Tender Title <span className="text-hazard">*</span>
                  </Label>
                  <Input
                    value={tenderTitle}
                    onChange={(e) => setTenderTitle(e.target.value)}
                    placeholder="e.g. Electrical Work - Main Building"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-onyx">
                    Category <span className="text-hazard">*</span>
                  </Label>
                  <select
                    value={tenderCategory}
                    onChange={(e) => setTenderCategory(e.target.value)}
                    className="h-10 w-full rounded-[10px] border border-pebble bg-white px-3 text-sm text-onyx shadow-2xs outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20 cursor-pointer"
                    required
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing &amp; Sanitary</option>
                    <option value="HVAC">HVAC &amp; Ventilation</option>
                    <option value="Civil Works">Civil &amp; Masonry</option>
                    <option value="Painting">Painting &amp; Finishing</option>
                    <option value="Carpentry">Carpentry &amp; Woodwork</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-onyx">
                    Description
                  </Label>
                  <textarea
                    rows={3}
                    value={tenderDesc}
                    onChange={(e) => setTenderDesc(e.target.value)}
                    placeholder="Provide scope, materials, and specification notes..."
                    className="w-full rounded-[10px] border border-pebble bg-white p-3 text-sm text-onyx placeholder:text-ash shadow-2xs outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-onyx">
                      Estimated Value (₹)
                    </Label>
                    <Input
                      value={tenderEstimatedValue}
                      onChange={(e) => setTenderEstimatedValue(e.target.value)}
                      placeholder="e.g. 250000"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-onyx">
                      Submission Deadline
                    </Label>
                    <Input
                      value={tenderDeadline}
                      onChange={(e) => setTenderDeadline(e.target.value)}
                      placeholder="e.g. 30 Sep 2025"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-pebble/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => goToStep(2)}
                    className="rounded-[10px] border-pebble text-xs font-medium px-4 py-2 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-forest hover:bg-forest-hover text-white rounded-[10px] text-xs font-semibold px-5 py-2 shadow-xs cursor-pointer"
                  >
                    Create Tender
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: TENDER DETAILS (Issue RFQ)                                        */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Top Navigation */}
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-ash hover:text-onyx transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>&lt; Back to Project</span>
            </button>

            {!activeTender ? (
              <div className="rounded-[14px] bg-white border border-pebble/70 p-10 text-center space-y-3">
                <p className="text-sm font-semibold text-onyx">No tender created yet</p>
                <p className="text-xs text-ash">Please create a tender first.</p>
                <Button onClick={() => goToStep(3)} className="bg-forest text-white text-xs">
                  Create Tender
                </Button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-pebble/60">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-onyx tracking-tight">
                      {activeTender.title}
                    </h1>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone border border-pebble text-ash">
                      {activeTender.status}
                    </span>
                  </div>

                  <Button
                    onClick={() => goToStep(5)}
                    className="bg-forest hover:bg-forest-hover text-white rounded-[10px] px-5 py-2.5 text-xs font-semibold shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    <span>Issue RFQ</span>
                  </Button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 border-b border-pebble/60 pb-1">
                  {(["Details", "Suppliers", "Bids", "Activity"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setTenderTab(tab)}
                      className={`px-4 py-2 text-xs font-semibold rounded-[8px] transition cursor-pointer ${
                        tenderTab === tab
                          ? "bg-white text-onyx border border-pebble shadow-2xs"
                          : "text-ash hover:text-onyx hover:bg-stone"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Details Content */}
                <div className="rounded-[14px] bg-white border border-pebble/70 p-6 shadow-2xs space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 text-sm">
                    <div>
                      <span className="text-xs font-semibold text-ash block uppercase tracking-wider">
                        Tender ID
                      </span>
                      <p className="font-bold text-onyx text-base mt-1">
                        {activeTender.id}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-ash block uppercase tracking-wider">
                        Project
                      </span>
                      <button
                        type="button"
                        onClick={() => goToStep(2)}
                        className="font-bold text-forest hover:underline text-base mt-1 text-left cursor-pointer"
                      >
                        {activeTender.projectName}
                      </button>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-ash block uppercase tracking-wider">
                        Category
                      </span>
                      <p className="font-semibold text-onyx mt-1">
                        {activeTender.category}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-ash block uppercase tracking-wider">
                        Estimated Value
                      </span>
                      <p className="font-bold text-onyx mt-1">
                        ₹{activeTender.estimatedValue.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-ash block uppercase tracking-wider">
                        Submission Deadline
                      </span>
                      <p className="font-semibold text-onyx mt-1">
                        {activeTender.submissionDeadline}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-ash block uppercase tracking-wider">
                        Status
                      </span>
                      <p className="font-semibold text-ash mt-1">
                        {activeTender.status}
                      </p>
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-pebble/50">
                      <span className="text-xs font-semibold text-ash block uppercase tracking-wider">
                        Description
                      </span>
                      <p className="text-sm text-onyx mt-1.5 leading-relaxed bg-stone/70 p-3.5 rounded-[10px] border border-pebble/60">
                        {activeTender.description || "No specific details provided."}
                      </p>
                    </div>
                  </div>

                  {/* Call to action card */}
                  <div className="pt-4 border-t border-pebble/60 flex items-center justify-between gap-4 bg-clear-bg/40 p-4 rounded-[10px] border border-clear-bg">
                    <div>
                      <p className="text-xs font-bold text-success-text">
                        Step 4 Ready: Send Request for Quotations (RFQ)
                      </p>
                      <p className="text-[11px] text-ash mt-0.5">
                        Select specialty trade contractors from your supplier register and invite competitive bids.
                      </p>
                    </div>
                    <Button
                      onClick={() => goToStep(5)}
                      className="bg-forest hover:bg-forest-hover text-white rounded-[8px] text-xs font-semibold px-4.5 py-2 cursor-pointer shadow-xs shrink-0"
                    >
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                      Issue RFQ Now
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: SELECT SUPPLIERS AND SEND RFQ                                     */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-in fade-in duration-150 max-w-4xl">
            {/* Top Navigation */}
            <button
              type="button"
              onClick={() => goToStep(4)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-ash hover:text-onyx transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>&lt; Back to Tender Details</span>
            </button>

            <div className="rounded-[18px] bg-white border border-pebble/80 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-onyx">
                    Issue RFQ - {activeTender?.category || "Trade"} Work
                  </h2>
                  <p className="text-xs text-ash mt-0.5">
                    Select suppliers to send Request for Quotation (RFQ)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenAddSupplierModal}
                    className="text-xs font-semibold gap-1.5 rounded-[8px] cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Add Supplier</span>
                  </Button>
                </div>
              </div>

              {/* Selection Table */}
              <div className="rounded-[10px] border border-pebble/70 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-sm text-onyx">
                  <thead>
                    <tr className="border-b border-pebble bg-stone/70 text-xs font-semibold text-ash uppercase tracking-wider">
                      <th className="py-3 px-4 w-12 text-center">Select</th>
                      <th className="py-3 px-4">Supplier Name</th>
                      <th className="py-3 px-4">Trade</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pebble/60">
                    {suppliers.map((sup) => (
                      <tr
                        key={sup.id}
                        onClick={() => toggleSupplierSelection(sup.id)}
                        className={`transition cursor-pointer ${
                          sup.selected ? "bg-breath/30 hover:bg-breath/50" : "hover:bg-stone/60"
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={sup.selected}
                            onChange={() => toggleSupplierSelection(sup.id)}
                            className="h-4 w-4 rounded-[4px] accent-forest cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-onyx">
                          {sup.name}
                        </td>
                        <td className="py-3.5 px-4 text-ash font-medium">
                          {sup.trade}
                        </td>
                        <td className="py-3.5 px-4 text-ash font-medium">
                          {sup.email}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              sup.selected
                                ? "bg-clear-bg text-success-text border-success/30"
                                : "bg-stone text-ash border-pebble"
                            }`}
                          >
                            {sup.selected ? "Selected" : "Not Selected"}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {suppliers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-ash">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <HardHat className="h-6 w-6 text-ash" />
                            <p className="text-sm font-semibold text-onyx">No suppliers added yet</p>
                            <p className="text-xs text-ash">
                              Click &quot;+ Add Supplier&quot; above to add your trade contractor partners.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-pebble/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => goToStep(4)}
                  className="rounded-[10px] border-pebble text-xs font-medium px-4 py-2 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSendRfqSubmit}
                  disabled={selectedSuppliersCount === 0}
                  className="bg-forest hover:bg-forest-hover text-white rounded-[10px] text-xs font-semibold px-5 py-2 shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send RFQ ({selectedSuppliersCount} Suppliers)</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: BIDS RECEIVED                                                     */}
        {/* ========================================================================= */}
        {currentStep === 6 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Top Navigation */}
            <button
              type="button"
              onClick={() => goToStep(5)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-ash hover:text-onyx transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>&lt; Back to RFQ Selection</span>
            </button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-pebble/60">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-onyx tracking-tight">
                  {activeTender?.title || "Tender Work Package"}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-clear-bg text-success-text border border-success/30">
                  Open
                </span>
              </div>

              <Button
                onClick={() => goToStep(7)}
                disabled={tenderBids.length === 0}
                className="bg-forest hover:bg-forest-hover text-white rounded-[10px] px-5 py-2.5 text-xs font-semibold shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Compare Bids</span>
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-pebble/60 pb-1">
              {(["Details", "Suppliers", "Bids", "Activity"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTenderTab(tab)}
                  className={`px-4 py-2 text-xs font-semibold rounded-[8px] transition cursor-pointer flex items-center gap-1.5 ${
                    tab === "Bids"
                      ? "bg-white text-onyx border border-pebble shadow-2xs font-bold"
                      : "text-ash hover:text-onyx hover:bg-stone"
                  }`}
                >
                  <span>{tab}</span>
                  {tab === "Bids" && (
                    <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-forest text-white text-[10px]">
                      {tenderBids.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Bids Table */}
            <div className="rounded-[10px] bg-white border border-pebble/70 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-onyx">
                  <thead>
                    <tr className="border-b border-pebble bg-stone/70 text-xs font-semibold text-ash uppercase tracking-wider">
                      <th className="py-3 px-4 w-12">#</th>
                      <th className="py-3 px-4">Supplier</th>
                      <th className="py-3 px-4">Quotation Amount (₹)</th>
                      <th className="py-3 px-4">Submitted On</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pebble/60">
                    {tenderBids.map((b, idx) => (
                      <tr key={b.id} className="hover:bg-stone/60 transition">
                        <td className="py-3.5 px-4 text-ash font-medium text-xs">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-onyx">
                          {b.supplierName}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-onyx">
                          ₹{b.quotationAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-ash font-medium text-xs">
                          {b.submittedOn}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-clear-bg text-success-text border border-success/30">
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToStep(7)}
                            className="rounded-[6px] border-pebble text-xs font-medium px-3.5 py-1 hover:bg-breath hover:text-onyx cursor-pointer"
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}

                    {tenderBids.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-ash">
                          No bids received yet. Please send RFQ to suppliers in Step 5.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Compare Callout footer */}
              {tenderBids.length > 0 && (
                <div className="p-4 border-t border-pebble/60 flex items-center justify-between bg-stone/50">
                  <span className="text-xs text-ash font-medium">
                    All {tenderBids.length} contractor proposals submitted and ready for evaluation.
                  </span>
                  <Button
                    onClick={() => goToStep(7)}
                    className="bg-forest hover:bg-forest-hover text-white rounded-[8px] text-xs font-semibold px-4 py-2 cursor-pointer shadow-xs"
                  >
                    Proceed to Compare Bids →
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 7: COMPARE BIDS AND AWARD                                            */}
        {/* ========================================================================= */}
        {currentStep === 7 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Top Navigation */}
            <button
              type="button"
              onClick={() => goToStep(6)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-ash hover:text-onyx transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>&lt; Back to Bids</span>
            </button>

            {/* Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-onyx tracking-tight">
                Compare Bids
              </h1>
              <p className="text-xs text-ash mt-1">
                Review quotations and select the best supplier
              </p>
            </div>

            {tenderBids.length === 0 ? (
              <div className="rounded-[14px] bg-white border border-pebble/70 p-10 text-center space-y-3">
                <p className="text-sm font-semibold text-onyx">No bids available for comparison</p>
                <p className="text-xs text-ash">Please send RFQ to suppliers in Step 5 first.</p>
                <Button onClick={() => goToStep(5)} className="bg-forest text-white text-xs">
                  Select Suppliers &amp; Send RFQ
                </Button>
              </div>
            ) : (
              /* Comparison Matrix Table Card */
              <div className="rounded-[14px] bg-white border border-pebble/80 p-6 shadow-2xs space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-onyx border-collapse">
                    <thead>
                      <tr>
                        <th className="py-4 px-4 font-bold text-ash text-xs uppercase tracking-wider w-1/4 border-b border-pebble">
                          Criteria
                        </th>
                        {tenderBids.map((b) => (
                          <th
                            key={b.id}
                            className={`py-4 px-4 font-bold text-center border-b border-pebble transition relative ${
                              b.isRecommended
                                ? "bg-clear-bg/60 text-onyx border-t-2 border-forest rounded-t-[10px]"
                                : "text-onyx"
                            }`}
                          >
                            {b.isRecommended && (
                              <div className="mb-1.5 inline-flex items-center gap-1 bg-forest text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs uppercase tracking-wider">
                                <Sparkles className="h-2.5 w-2.5" />
                                Recommended
                              </div>
                            )}
                            <div className="text-sm font-extrabold">{b.supplierName}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pebble/60">
                      {/* Row 1: Quotation Amount */}
                      <tr className="hover:bg-stone/40">
                        <td className="py-4 px-4 font-semibold text-ash text-xs uppercase tracking-wider">
                          Quotation Amount (₹)
                        </td>
                        {tenderBids.map((b) => (
                          <td
                            key={b.id}
                            className={`py-4 px-4 text-center font-bold text-base ${
                              b.isRecommended ? "bg-clear-bg/40 text-forest" : "text-onyx"
                            }`}
                          >
                            ₹{b.quotationAmount.toLocaleString("en-IN")}
                          </td>
                        ))}
                      </tr>

                      {/* Row 2: Delivery Time */}
                      <tr className="hover:bg-stone/40">
                        <td className="py-4 px-4 font-semibold text-ash text-xs uppercase tracking-wider">
                          Delivery Time
                        </td>
                        {tenderBids.map((b) => (
                          <td
                            key={b.id}
                            className={`py-4 px-4 text-center font-medium ${
                              b.isRecommended ? "bg-clear-bg/40 font-bold text-onyx" : "text-ash"
                            }`}
                          >
                            {b.deliveryTime}
                          </td>
                        ))}
                      </tr>

                      {/* Row 3: Payment Terms */}
                      <tr className="hover:bg-stone/40">
                        <td className="py-4 px-4 font-semibold text-ash text-xs uppercase tracking-wider">
                          Payment Terms
                        </td>
                        {tenderBids.map((b) => (
                          <td
                            key={b.id}
                            className={`py-4 px-4 text-center font-medium ${
                              b.isRecommended ? "bg-clear-bg/40 font-bold text-onyx" : "text-ash"
                            }`}
                          >
                            {b.paymentTerms}
                          </td>
                        ))}
                      </tr>

                      {/* Row 4: Remarks */}
                      <tr className="hover:bg-stone/40">
                        <td className="py-4 px-4 font-semibold text-ash text-xs uppercase tracking-wider">
                          Remarks
                        </td>
                        {tenderBids.map((b) => (
                          <td
                            key={b.id}
                            className={`py-4 px-4 text-center font-semibold ${
                              b.isRecommended
                                ? "bg-clear-bg/40 text-success-text font-bold"
                                : "text-ash"
                            }`}
                          >
                            {b.remarks}
                          </td>
                        ))}
                      </tr>

                      {/* Row 5: Action to Award each */}
                      <tr>
                        <td className="py-4 px-4 font-semibold text-ash text-xs uppercase tracking-wider">
                          Decision
                        </td>
                        {tenderBids.map((b) => (
                          <td
                            key={b.id}
                            className={`py-4 px-4 text-center ${
                              b.isRecommended ? "bg-clear-bg/40 rounded-b-[10px]" : ""
                            }`}
                          >
                            <Button
                              onClick={() => handleAwardSupplier(b.supplierId)}
                              className={`rounded-[8px] text-xs font-semibold px-4 py-2 cursor-pointer shadow-xs ${
                                b.isRecommended
                                  ? "bg-forest hover:bg-forest-hover text-white ring-2 ring-forest/30"
                                  : "bg-stone hover:bg-mist text-onyx border border-pebble"
                              }`}
                            >
                              Award to {b.supplierName.split(" ")[0]}
                            </Button>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Bottom Recommended Action */}
                {tenderBids.find((b) => b.isRecommended) && (
                  <div className="pt-3 border-t border-pebble/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-ash">
                      Recommended contractor:{" "}
                      <span className="font-bold text-onyx">
                        {tenderBids.find((b) => b.isRecommended)?.supplierName}
                      </span>{" "}
                      offers the most optimal balance of cost and delivery schedule.
                    </div>
                    <Button
                      onClick={() =>
                        handleAwardSupplier(
                          tenderBids.find((b) => b.isRecommended)!.supplierId
                        )
                      }
                      className="bg-forest hover:bg-forest-hover text-white rounded-[10px] px-6 py-2.5 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2 self-stretch sm:self-auto"
                    >
                      <Award className="h-4 w-4" />
                      <span>
                        Award to {tenderBids.find((b) => b.isRecommended)?.supplierName}
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 8: TENDER AWARDED (Connected to Project Budget)                       */}
        {/* ========================================================================= */}
        {currentStep === 8 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Top Navigation */}
            <button
              type="button"
              onClick={() => goToStep(7)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-ash hover:text-onyx transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>&lt; Back to Compare Bids</span>
            </button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-pebble/60">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-onyx tracking-tight">
                  {activeTender?.title || "Tender Work Package"}
                </h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-clear-bg text-success-text border border-success/30 shadow-2xs">
                  Awarded
                </span>
              </div>

              <Button
                variant="outline"
                onClick={handleReturnToOpportunities}
                className="rounded-[10px] border-pebble text-xs font-semibold px-4 py-2 hover:bg-stone cursor-pointer"
              >
                Back to Opportunities
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-pebble/60 pb-1">
              {(["Details", "Suppliers", "Bids", "Award", "Budget Impact", "Activity"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setTenderTab(tab)}
                    className={`px-4 py-2 text-xs font-semibold rounded-[8px] transition cursor-pointer ${
                      tenderTab === tab
                        ? "bg-white text-onyx border border-pebble shadow-2xs font-bold"
                        : "text-ash hover:text-onyx hover:bg-stone"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            {/* Award Details Card */}
            <div className="rounded-[14px] bg-white border border-pebble/70 p-6 sm:p-7 shadow-2xs space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 text-sm">
                <div>
                  <span className="text-xs font-semibold text-ash block uppercase tracking-wider">
                    Awarded To
                  </span>
                  <p className="font-extrabold text-forest text-lg mt-1">
                    {activeTender?.awardedSupplierName || "Contractor Partner"}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-ash block uppercase tracking-wider">
                    Awarded Amount
                  </span>
                  <p className="font-extrabold text-onyx text-lg mt-1">
                    ₹{tenderAwardedAmount.toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-ash block uppercase tracking-wider">
                    Award Date
                  </span>
                  <p className="font-semibold text-onyx mt-1">
                    {activeTender?.awardDate ||
                      new Date().toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-ash block uppercase tracking-wider">
                    Status
                  </span>
                  <p className="font-semibold text-success-text mt-1 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Awarded</span>
                  </p>
                </div>
              </div>

              {/* Green Banner: Connected to Project Budget */}
              <div className="rounded-[12px] bg-clear-bg border border-success/30 p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-white shrink-0 shadow-xs">
                    <Check className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-onyx">
                      This tender cost has been added to the project Budget.
                    </p>
                    <p className="text-xs text-ash mt-0.5">
                      Committed cost of ₹{tenderAwardedAmount.toLocaleString("en-IN")} mapped to{" "}
                      {activeTender?.projectName || "project"}.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBudgetModal(true)}
                  className="font-bold text-forest hover:underline text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap bg-white px-3.5 py-2 rounded-[8px] border border-success/30 shadow-2xs"
                >
                  <span>View Project Budget</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Banner: Awarded Contractor Directory & Dispatch Link */}
              <div className="rounded-[12px] bg-breath/60 border border-forest/30 p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-white shrink-0 shadow-xs">
                    <HardHat className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-onyx">
                      {activeTender?.awardedSupplierName || "Contractor"} added to Contractors Directory!
                    </p>
                    <p className="text-xs text-ash mt-0.5">
                      Subcontractor profile ready. The Project Manager can now assign jobs &amp; work orders in Jobs.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                  <button
                    type="button"
                    onClick={() => router.push("/contractors")}
                    className="font-bold text-forest hover:bg-stone text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap bg-white px-3.5 py-2 rounded-[8px] border border-pebble shadow-2xs flex-1 sm:flex-initial"
                  >
                    <span>View in Contractors</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/jobs?contractorId=CON-${activeTender?.awardedSupplierId}&openAssign=true`
                      )
                    }
                    className="font-bold text-white bg-forest hover:bg-forest-hover text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap px-4 py-2 rounded-[8px] shadow-xs flex-1 sm:flex-initial"
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    <span>Assign Job in Jobs</span>
                  </button>
                </div>
              </div>

              {/* Budget Breakdown Summary */}
              <div className="pt-4 border-t border-pebble/60 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-onyx uppercase tracking-wider">
                    Project Financial Allocation
                  </span>
                  {costSavings > 0 && (
                    <span className="text-xs font-bold text-forest">
                      Budget Efficiency: ₹{costSavings.toLocaleString("en-IN")} saved under estimate
                    </span>
                  )}
                </div>

                <div className="w-full bg-stone h-3 rounded-full overflow-hidden flex border border-pebble">
                  <div
                    className="bg-forest h-full"
                    style={{ width: `${committedPercentage}%` }}
                    title={`Trade Package (${committedPercentage}%)`}
                  />
                  <div
                    className="bg-pebble/60 h-full"
                    style={{ width: `${100 - committedPercentage}%` }}
                    title="Remaining Project Scope"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div className="p-3 bg-stone rounded-[10px] border border-pebble/60">
                    <span className="text-[11px] text-ash font-medium">Total Opportunity Value</span>
                    <p className="text-base font-bold text-onyx mt-0.5">
                      ₹{projectTotalValue.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="p-3 bg-breath/50 rounded-[10px] border border-breath">
                    <span className="text-[11px] text-forest font-semibold">Tender Committed Cost</span>
                    <p className="text-base font-bold text-forest mt-0.5">
                      ₹{tenderAwardedAmount.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="p-3 bg-stone rounded-[10px] border border-pebble/60">
                    <span className="text-[11px] text-ash font-medium">Remaining Budget Pool</span>
                    <p className="text-base font-bold text-onyx mt-0.5">
                      ₹{remainingBudget.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Awarded Action Completion Bar */}
              <div className="pt-4 border-t border-pebble/60 flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone/70 p-4 rounded-[12px] border border-pebble">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-white shrink-0 shadow-2xs">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-onyx">
                      Tender Package Award Completed
                    </p>
                    <p className="text-[11px] text-ash">
                      {activeTender?.awardedSupplierName || "Contractor"} is active in Contractors. You can reset wizard to tender another package or return to project opportunities.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveTender("");
                      setTenderTitle("");
                      setTenderDesc("");
                      setTenderEstimatedValue("");
                      goToStep(3);
                    }}
                    className="rounded-[8px] border-pebble text-xs font-semibold px-3.5 py-2 hover:bg-white cursor-pointer shadow-2xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1 text-forest" />
                    + Tender Another Package
                  </Button>

                  <Button
                    onClick={handleReturnToOpportunities}
                    className="bg-forest hover:bg-forest-hover text-white rounded-[8px] text-xs font-semibold px-4 py-2 shadow-xs cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Finish &amp; Reset Flow
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* ========================================================================= */}
        {/* NEW OPPORTUNITY MODAL (Step 1)                                            */}
        {/* ========================================================================= */}
        {showNewOppModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="relative w-full max-w-lg rounded-[18px] bg-white p-6 shadow-2xl border border-pebble">
              <div className="flex items-center justify-between pb-3 border-b border-pebble/60">
                <h3 className="text-lg font-bold text-onyx">Add Project Opportunity</h3>
                <button
                  type="button"
                  onClick={() => setShowNewOppModal(false)}
                  className="p-1 rounded-[6px] text-ash hover:text-onyx hover:bg-stone cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNewOpportunity} className="mt-4 space-y-3.5">
                {/* Auto-fill from Existing Client / Opportunity Dropdown */}
                <div className="space-y-1.5 p-3 rounded-[12px] bg-stone/70 border border-pebble">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-onyx flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-forest" />
                      Select Existing Client / Opportunity
                    </Label>
                    <span className="text-[10px] text-forest font-semibold uppercase tracking-wider">
                      Auto-fill details
                    </span>
                  </div>

                  <select
                    value={selectedSourceId}
                    onChange={(e) => handleSelectSource(e.target.value)}
                    className="w-full rounded-[10px] border border-pebble bg-white px-3 py-2 text-xs font-medium text-onyx outline-none transition focus:border-forest shadow-2xs"
                  >
                    <option value="">-- Choose registered Client or Opportunity --</option>

                    {customers.length > 0 && (
                      <optgroup label="📋 Registered Clients (Customers)">
                        {customers.map((c) => (
                          <option key={`cust_${c.id}`} value={`cust_${c.id}`}>
                            {c.companyName} {c.contactPerson ? `(${c.contactPerson})` : ""} {c.address ? `• ${c.address}` : ""}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {leadOpportunities.length > 0 && (
                      <optgroup label="🎯 Won Opportunities (Pipeline)">
                        {leadOpportunities.map((o) => (
                          <option key={`opp_${o.id}`} value={`opp_${o.id}`}>
                            {o.title} • {o.customerName} (₹{(o.estimatedValue || 0).toLocaleString("en-IN")})
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {leadList.length > 0 && (
                      <optgroup label="⚡ Active Leads">
                        {leadList.map((l) => (
                          <option key={`lead_${l.id}`} value={`lead_${l.id}`}>
                            {l.companyName} {l.location ? `(${l.location})` : ""}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>

                  {customers.length === 0 && leadOpportunities.length === 0 && leadList.length === 0 ? (
                    <p className="text-[11px] text-ash">
                      No clients or leads recorded yet. You can add them under &apos;Customers&apos; or fill in manually below.
                    </p>
                  ) : (
                    <p className="text-[10px] text-ash">
                      Selecting an option above will automatically populate client name, location, and project details without typos.
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-onyx">Project Name *</Label>
                  <Input
                    required
                    value={newOppName}
                    onChange={(e) => setNewOppName(e.target.value)}
                    placeholder="e.g. ABC Apartment Renovation"
                    autoFocus
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-onyx">Client Name *</Label>
                  <Input
                    required
                    list="clients-datalist"
                    value={newOppClient}
                    onChange={(e) => {
                      setNewOppClient(e.target.value);
                      const matched = customers.find(
                        (c) => c.companyName.toLowerCase() === e.target.value.toLowerCase()
                      );
                      if (matched && matched.address && !newOppLocation) {
                        setNewOppLocation(matched.address);
                      }
                    }}
                    placeholder="e.g. ABC Pvt Ltd"
                  />
                  <datalist id="clients-datalist">
                    {customers.map((c) => (
                      <option key={c.id} value={c.companyName} />
                    ))}
                  </datalist>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-onyx">Project Value (₹) *</Label>
                    <Input
                      required
                      value={newOppValue}
                      onChange={(e) => setNewOppValue(e.target.value)}
                      placeholder="e.g. 1000000"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-onyx">Location</Label>
                    <Input
                      value={newOppLocation}
                      onChange={(e) => setNewOppLocation(e.target.value)}
                      placeholder="e.g. Indore, MP"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-onyx">Expected Start Date</Label>
                  <Input
                    value={newOppExpectedStart}
                    onChange={(e) => setNewOppExpectedStart(e.target.value)}
                    placeholder="e.g. 01 Oct 2025"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-onyx">Description</Label>
                  <textarea
                    rows={2}
                    value={newOppDesc}
                    onChange={(e) => setNewOppDesc(e.target.value)}
                    placeholder="Project scope and initial notes..."
                    className="w-full rounded-[10px] border border-pebble bg-white p-2.5 text-sm text-onyx placeholder:text-ash shadow-2xs outline-none transition focus:border-forest"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pebble/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewOppModal(false)}
                    className="text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-forest hover:bg-forest-hover text-white text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    Save Opportunity
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ADD SUPPLIER MODAL (Step 5)                                               */}
        {/* ========================================================================= */}
        {showAddSupplierModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="relative w-full max-w-md rounded-[18px] bg-white p-6 shadow-2xl border border-pebble max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-pebble/60">
                <div>
                  <h3 className="text-lg font-bold text-onyx">Add Trade Supplier</h3>
                  <p className="text-xs text-ash mt-0.5">
                    Select from internal crew / personnel or register a trade contractor.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSupplierModal(false);
                    setSelectedCrewMemberId("");
                    setIsManualSupplier(false);
                    setAutoFilledCrewInfo(null);
                  }}
                  className="p-1 rounded-[6px] text-ash hover:text-onyx hover:bg-stone cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddSupplierSubmit} className="mt-4 space-y-3.5">
                {/* Auto-filled banner */}
                {autoFilledCrewInfo && (
                  <div className="flex items-center justify-between rounded-[8px] bg-clear-bg border border-success/30 px-3 py-2 text-xs text-success-text animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      <span>
                        Auto-filled from Crew: <strong>{autoFilledCrewInfo}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCrewMemberId("");
                        setAutoFilledCrewInfo(null);
                        setNewSupName("");
                        setNewSupEmail("");
                      }}
                      className="text-[11px] font-semibold text-ash hover:text-onyx underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-onyx">
                      Supplier / Contractor Name <span className="text-hazard">*</span>
                    </Label>
                    {crewMembers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const nextManual = !isManualSupplier;
                          setIsManualSupplier(nextManual);
                          if (nextManual) {
                            setSelectedCrewMemberId("__MANUAL__");
                            setAutoFilledCrewInfo(null);
                          } else {
                            setSelectedCrewMemberId("");
                            setAutoFilledCrewInfo(null);
                          }
                        }}
                        className="text-[11px] font-medium text-forest hover:underline cursor-pointer"
                      >
                        {isManualSupplier ? "👥 Select from Crew / People" : "✏️ Type Custom Name"}
                      </button>
                    )}
                  </div>

                  {isManualSupplier || crewMembers.length === 0 ? (
                    <Input
                      required
                      value={newSupName}
                      onChange={(e) => setNewSupName(e.target.value)}
                      placeholder="e.g. Apex Electrical Works"
                      autoFocus
                    />
                  ) : (
                    <select
                      value={selectedCrewMemberId}
                      onChange={(e) => handleSelectCrewMember(e.target.value)}
                      className="h-10 w-full rounded-[10px] border border-pebble bg-white px-3 text-sm text-onyx shadow-2xs outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20 cursor-pointer"
                      required
                      autoFocus
                    >
                      <option value="">-- Select Crew / Person --</option>
                      {/* Active category recommendation if matching */}
                      {activeTender?.category && (
                        <optgroup label={`Recommended for ${activeTender.category} Package`}>
                          {crewMembers
                            .filter((m) => matchTradeCategory(m.trade) === activeTender.category)
                            .map((m) => (
                              <option key={`rec-${m.id}`} value={m.id}>
                                ⭐ {m.name} ({m.role} • {m.trade})
                              </option>
                            ))}
                        </optgroup>
                      )}
                      <optgroup label={`All Available Crew / People (${crewMembers.length})`}>
                        {crewMembers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.role} • {m.trade || "General"})
                          </option>
                        ))}
                      </optgroup>
                      <option value="__MANUAL__">➕ Type Custom / External Supplier Manually</option>
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-onyx">Trade Category *</Label>
                  <select
                    value={newSupTrade}
                    onChange={(e) => setNewSupTrade(e.target.value)}
                    className="h-10 w-full rounded-[10px] border border-pebble bg-white px-3 text-sm text-onyx shadow-2xs outline-none transition focus:border-forest cursor-pointer"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Civil">Civil</option>
                    <option value="Painting">Painting</option>
                    <option value="Carpentry">Carpentry</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-onyx">Email Address</Label>
                  <Input
                    type="email"
                    value={newSupEmail}
                    onChange={(e) => setNewSupEmail(e.target.value)}
                    placeholder="contact@supplier.com"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pebble/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddSupplierModal(false);
                      setSelectedCrewMemberId("");
                      setIsManualSupplier(false);
                      setAutoFilledCrewInfo(null);
                    }}
                    className="text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-forest hover:bg-forest-hover text-white text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    Add Supplier
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW PROJECT BUDGET OVERLAY (Step 8 Connection)                           */}
        {/* ========================================================================= */}
        {showBudgetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="relative w-full max-w-2xl rounded-[18px] bg-white p-6 sm:p-7 shadow-2xl border border-pebble space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-pebble/60">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-forest text-white">
                    <IndianRupee className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-onyx">
                      Project Cost &amp; Budget Ledger
                    </h3>
                    <p className="text-xs text-ash">
                      {activeOpp?.projectName || "Project"} — Connected Financials
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(false)}
                  className="p-1.5 rounded-[6px] text-ash hover:text-onyx hover:bg-stone cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status Banner */}
              <div className="rounded-[10px] bg-clear-bg border border-success/30 p-3.5 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <p className="text-xs text-success-text">
                  <strong>Tender Award Verified:</strong> The awarded amount of{" "}
                  <strong>₹{tenderAwardedAmount.toLocaleString("en-IN")}</strong> is officially posted
                  to this project&apos;s trade work accounts.
                </p>
              </div>

              {/* Budget breakdown list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-onyx uppercase tracking-wider">
                  Cost Breakdown Packages
                </h4>

                <div className="rounded-[10px] border border-pebble overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-stone p-2.5 font-bold text-ash uppercase">
                    <div className="col-span-5">Trade Package</div>
                    <div className="col-span-3">Assigned Contractor</div>
                    <div className="col-span-2 text-right">Committed (₹)</div>
                    <div className="col-span-2 text-right">Status</div>
                  </div>

                  {/* Electrical - Just Awarded */}
                  <div className="grid grid-cols-12 p-3 border-t border-pebble bg-clear-bg/40 items-center font-medium">
                    <div className="col-span-5 font-bold text-onyx">
                      {activeTender?.title || "Trade Package"}
                    </div>
                    <div className="col-span-3 text-forest font-bold">
                      {activeTender?.awardedSupplierName || "Contractor Partner"}
                    </div>
                    <div className="col-span-2 text-right font-bold text-onyx">
                      ₹{tenderAwardedAmount.toLocaleString("en-IN")}
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="bg-clear-bg text-success-text px-2 py-0.5 rounded-full font-bold">
                        Awarded
                      </span>
                    </div>
                  </div>

                  {/* Remaining Scope */}
                  <div className="grid grid-cols-12 p-3 border-t border-pebble bg-stone/40 items-center text-ash">
                    <div className="col-span-5 font-semibold text-onyx">
                      Remaining Scope &amp; Contingency
                    </div>
                    <div className="col-span-3 text-ash">Unallocated Budget</div>
                    <div className="col-span-2 text-right font-bold text-forest">
                      ₹{remainingBudget.toLocaleString("en-IN")}
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="bg-breath text-onyx px-2 py-0.5 rounded-full font-medium">
                        Reserve
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  onClick={() => setShowBudgetModal(false)}
                  className="bg-forest hover:bg-forest-hover text-white text-xs font-semibold px-4 py-2 cursor-pointer"
                >
                  Close &amp; Return to Tender
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FirmaLayout>
  );
}