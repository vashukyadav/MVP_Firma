"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  useTenderFlowStore,
  AwardedContractor,
  JobItem,
} from "@/store/tenderFlowStore";
import { useCrewStore } from "@/store/crewStore";
import { useAuthStore } from "@/store/authStore";
import {
  HardHat,
  Search,
  CheckCircle2,
  Calendar,
  Building2,
  FileText,
  Phone,
  Mail,
  Plus,
  ArrowRight,
  ClipboardList,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  X,
  Gavel,
  ChevronRight,
  Clock,
  Award,
  Sparkles,
  Users,
  RotateCcw,
} from "lucide-react";

export default function ContractorsPage() {
  const router = useRouter();
  const {
    contractors = [],
    jobs = [],
    tenders = [],
    suppliers = [],
    bids = [],
    opportunities = [],
    assignJobToContractor,
    awardTenderToSupplier,
    addContractor,
    seedSampleProjectBidders,
  } = useTenderFlowStore();

  // Tab State: "AWARDED" (Awarded Contractors) vs "ALL_BIDDERS" (All Project Bidders & Suppliers)
  const [activeTab, setActiveTab] = useState<"AWARDED" | "ALL_BIDDERS">("AWARDED");

  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Assign Job Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedContractor, setSelectedContractor] =
    useState<AwardedContractor | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobProject, setJobProject] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobPriority, setJobPriority] = useState<"High" | "Medium" | "Low">(
    "High"
  );
  const [jobDue, setJobDue] = useState("Next Week");
  const [jobDescription, setJobDescription] = useState("");

  // Details Modal State
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsContractor, setDetailsContractor] =
    useState<AwardedContractor | null>(null);

  // Add Contractor Modal State
  const crewMembers = useCrewStore((state) => state.members || []);
  const [showAddContractorModal, setShowAddContractorModal] = useState(false);
  const [selectedCrewMemberId, setSelectedCrewMemberId] = useState("");
  const [isManualContractor, setIsManualContractor] = useState(false);
  const [newConName, setNewConName] = useState("");
  const [newConTrade, setNewConTrade] = useState("Electrical");
  const [newConProject, setNewConProject] = useState("");
  const [newConValue, setNewConValue] = useState("");
  const [newConEmail, setNewConEmail] = useState("");
  const [newConPhone, setNewConPhone] = useState("");

  const handleSelectCrewForContractor = (memberId: string) => {
    if (memberId === "__MANUAL__") {
      setIsManualContractor(true);
      setSelectedCrewMemberId("__MANUAL__");
      setNewConName("");
      return;
    }

    setSelectedCrewMemberId(memberId);
    if (!memberId) {
      setNewConName("");
      return;
    }

    const member = crewMembers.find((m) => m.id === memberId);
    if (member) {
      setIsManualContractor(false);
      setNewConName(member.name);
      if (member.contact) setNewConPhone(member.contact);
      if (member.email) {
        setNewConEmail(member.email);
      } else {
        const cleanName = member.name.toLowerCase().replace(/\s+/g, ".");
        setNewConEmail(`${cleanName}@crew-firma.com`);
      }
      const tradeStr = member.trade?.toLowerCase() || "";
      if (tradeStr.includes("electr")) setNewConTrade("Electrical");
      else if (tradeStr.includes("plumb") || tradeStr.includes("pip")) setNewConTrade("Plumbing");
      else if (tradeStr.includes("hvac") || tradeStr.includes("air")) setNewConTrade("HVAC");
      else if (tradeStr.includes("paint")) setNewConTrade("Painting");
      else if (tradeStr.includes("carpent") || tradeStr.includes("wood")) setNewConTrade("Carpentry");
      else if (tradeStr.includes("mason") || tradeStr.includes("civil") || tradeStr.includes("steel")) setNewConTrade("Civil Works");
    }
  };

  // Combine all bidders from bids, suppliers, and awarded contractors
  const allBidders = useMemo(() => {
    const list: Array<{
      id: string;
      supplierId: string;
      name: string;
      trade: string;
      email: string;
      phone: string;
      projectName: string;
      tenderTitle: string;
      tenderId: string;
      quotationAmount: number;
      deliveryTime: string;
      status: "Awarded" | "Received" | "Shortlisted" | "Rejected" | "Registered";
      isAwarded: boolean;
      contractorId?: string;
      remarks?: string;
      isRecommended?: boolean;
    }> = [];

    // 1. From bids
    for (const b of bids) {
      const tender = tenders.find((t) => t.id === b.tenderId);
      const supplier = suppliers.find((s) => s.id === b.supplierId);
      const isAwarded =
        b.status === "Awarded" ||
        tender?.awardedSupplierId === b.supplierId ||
        contractors.some(
          (c) =>
            c.supplierId === b.supplierId ||
            (c.tenderId === b.tenderId && c.name.toLowerCase() === b.supplierName.toLowerCase())
        );

      list.push({
        id: b.id,
        supplierId: b.supplierId,
        name: b.supplierName || supplier?.name || "Contractor Partner",
        trade: supplier?.trade || tender?.category || "Specialty Trade",
        email: supplier?.email || "contractor@firma.com",
        phone: "+91 98102 34567",
        projectName:
          tender?.projectName ||
          (opportunities[0]?.projectName || "Won Project Site"),
        tenderTitle: tender?.title || "Trade Work Package",
        tenderId: b.tenderId,
        quotationAmount: b.quotationAmount,
        deliveryTime: b.deliveryTime,
        status: isAwarded ? "Awarded" : b.status,
        isAwarded,
        contractorId: contractors.find(
          (c) =>
            c.supplierId === b.supplierId ||
            c.name.toLowerCase() === (b.supplierName || "").toLowerCase()
        )?.id,
        remarks: b.remarks,
        isRecommended: b.isRecommended,
      });
    }

    // 2. From registered suppliers not in bids
    for (const sup of suppliers) {
      if (!list.some((item) => item.supplierId === sup.id)) {
        list.push({
          id: `SUP-${sup.id}`,
          supplierId: sup.id,
          name: sup.name,
          trade: sup.trade,
          email: sup.email,
          phone: "+91 98102 34567",
          projectName: opportunities[0]?.projectName || "Won Project Site",
          tenderTitle: "Registered Trade Partner",
          tenderId: tenders[0]?.id || "",
          quotationAmount: 0,
          deliveryTime: "Ready to deploy",
          status: "Registered",
          isAwarded: false,
        });
      }
    }

    // 3. From contractors not yet in list
    for (const con of contractors) {
      if (
        !list.some(
          (item) =>
            item.supplierId === con.supplierId ||
            item.name.toLowerCase() === con.name.toLowerCase()
        )
      ) {
        list.push({
          id: con.id,
          supplierId: con.supplierId,
          name: con.name,
          trade: con.trade,
          email: con.email,
          phone: con.phone,
          projectName: con.projectName,
          tenderTitle: con.tenderTitle,
          tenderId: con.tenderId,
          quotationAmount: con.awardedAmount,
          deliveryTime: con.deliveryTime || "20 days",
          status: "Awarded",
          isAwarded: true,
          contractorId: con.id,
        });
      }
    }

    return list;
  }, [bids, tenders, suppliers, contractors, opportunities]);

  // Filtered Contractors (Tab 1)
  const filteredContractors = useMemo(() => {
    return (contractors || []).filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.trade.toLowerCase().includes(search.toLowerCase()) ||
        c.projectName.toLowerCase().includes(search.toLowerCase()) ||
        c.tenderTitle.toLowerCase().includes(search.toLowerCase()) ||
        c.tenderId.toLowerCase().includes(search.toLowerCase());
      const matchTrade = tradeFilter === "ALL" || c.trade === tradeFilter;
      const matchStatus =
        statusFilter === "ALL" ||
        c.status === statusFilter ||
        (statusFilter === "Awarded" &&
          (c.status === "Awarded" ||
            c.status === "Active" ||
            c.status === "Mobilized"));
      return matchSearch && matchTrade && matchStatus;
    });
  }, [contractors, search, tradeFilter, statusFilter]);

  // Filtered Bidders (Tab 2)
  const filteredBidders = useMemo(() => {
    return allBidders.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.trade.toLowerCase().includes(search.toLowerCase()) ||
        b.projectName.toLowerCase().includes(search.toLowerCase()) ||
        b.tenderTitle.toLowerCase().includes(search.toLowerCase());
      const matchTrade = tradeFilter === "ALL" || b.trade === tradeFilter;
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "Awarded" && b.isAwarded) ||
        b.status === statusFilter;
      return matchSearch && matchTrade && matchStatus;
    });
  }, [allBidders, search, tradeFilter, statusFilter]);

  // Unique Trades across both
  const trades = useMemo(() => {
    const list = new Set([
      ...contractors.map((c) => c.trade),
      ...allBidders.map((b) => b.trade),
    ].filter(Boolean));
    return Array.from(list);
  }, [contractors, allBidders]);

  // Total Contract Value
  const totalContractValue = useMemo(() => {
    return contractors.reduce((sum, c) => sum + (c.awardedAmount || 0), 0);
  }, [contractors]);

  // Open Assign Modal for specific contractor
  const handleOpenAssignModal = (c: AwardedContractor) => {
    setSelectedContractor(c);
    setJobTitle(`Execute ${c.trade} Work Package – ${c.projectName}`);
    setJobProject(c.projectName || "Project Site");
    setJobLocation(`${c.projectName}, Main Site Area`);
    setJobPriority("High");
    setJobDue("Next Week");
    setJobDescription(
      `Deliver ${c.trade} installation according to awarded tender #${c.tenderId} specifications.`
    );
    setShowAssignModal(true);
  };

  // Submit Job Assignment
  const handleAssignJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractor || !jobTitle) return;

    assignJobToContractor({
      title: jobTitle,
      projectName: jobProject || selectedContractor.projectName,
      location: jobLocation || `${selectedContractor.projectName} Site`,
      contractorId: selectedContractor.id,
      contractorName: selectedContractor.name,
      trade: selectedContractor.trade,
      priority: jobPriority,
      due: jobDue,
      description: jobDescription,
      tenderId: selectedContractor.tenderId,
    });

    setShowAssignModal(false);
    alert(
      `Job successfully assigned to ${selectedContractor.name}! You can now view and manage it in Jobs.`
    );
  };

  // Submit Add Contractor Modal
  const handleAddContractorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConName.trim()) return;

    addContractor({
      name: newConName.trim(),
      trade: newConTrade,
      projectName: newConProject.trim() || (opportunities[0]?.projectName || "Won Project Site"),
      awardedAmount: Number(newConValue) || 250000,
      email: newConEmail.trim() || "contractor@firma.com",
      phone: newConPhone.trim() || "+91 98102 34567",
    });

    setShowAddContractorModal(false);
    setNewConName("");
    setNewConValue("");
    setNewConEmail("");
    setNewConPhone("");
    setActiveTab("AWARDED");
  };

  // 1-Click Award Bidder
  const handleAwardBidderDirectly = (bidder: typeof allBidders[0]) => {
    if (bidder.tenderId && bidder.supplierId) {
      awardTenderToSupplier(bidder.tenderId, bidder.supplierId);
      alert(`${bidder.name} has been awarded the contract! They are now active in Awarded Contractors.`);
      setActiveTab("AWARDED");
    } else {
      addContractor({
        name: bidder.name,
        trade: bidder.trade,
        projectName: bidder.projectName,
        awardedAmount: bidder.quotationAmount || 250000,
        email: bidder.email,
        phone: bidder.phone,
      });
      alert(`${bidder.name} is now added as an Awarded Contractor!`);
      setActiveTab("AWARDED");
    }
  };

  // Get jobs assigned to a specific contractor
  const getContractorJobs = (contractorId: string): JobItem[] => {
    return (jobs || []).filter((j) => j.contractorId === contractorId);
  };

  const currentUser = useAuthStore((state) => state.currentUser);
  const isSiteManager = currentUser?.role === "SITE_MANAGER";

  return (
    <FirmaLayout activeNav="Contractors">
      <div className="space-y-6 mt-4 pb-12">
        {/* Site Manager Coordination Notice */}
        {isSiteManager && (
          <div className="rounded-[12px] bg-blue-50 border border-blue-200 p-3.5 flex items-center justify-between text-xs text-blue-900 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <HardHat className="h-4 w-4 text-blue-700 shrink-0" />
              <span>
                <strong>Site Manager View (Site Coordination Scope):</strong> Viewing active contractors and trade teams mobilized across project sites. Coordinate daily work execution, assignments, and site access.
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-[6px] bg-blue-200/80 text-blue-900 font-bold text-[10px] shrink-0 uppercase tracking-wider">
              👁️ Site Coordination
            </span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* HEADER SECTION                                                            */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-pebble/60">
          <div>
            <span className="text-eyebrow font-semibold tracking-wider text-ash uppercase">
              PROJECT MANAGEMENT &amp; TRADES
            </span>
            <h1 className="text-display-h1 font-bold text-onyx mt-0.5 tracking-tight flex items-center gap-2.5">
              <HardHat className="h-6 w-6 text-forest" />
              <span>Contractors &amp; Project Bidders</span>
            </h1>
            <p className="text-sm text-ash mt-1">
              Subcontractors and trade bidders for your won projects. Review quotations, award contracts, and assign jobs.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => {
                setNewConProject(opportunities[0]?.projectName || "Skyline Corporate Tower");
                setShowAddContractorModal(true);
              }}
              className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>+ Add Contractor / Partner</span>
            </button>
            {allBidders.length === 0 && (
              <button
                type="button"
                onClick={() => {
                  seedSampleProjectBidders();
                  alert("Project bidders loaded! Check the 'All Project Bidders & Suppliers' tab.");
                }}
                className="flex items-center gap-1.5 rounded-[10px] bg-breath text-forest border border-forest/30 hover:bg-forest hover:text-white px-3 py-2 text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Load Won Project Bidders</span>
              </button>
            )}
            {!isSiteManager && (
              <button
                type="button"
                onClick={() => router.push("/tenders")}
                className="flex items-center gap-2 rounded-[10px] bg-white border border-pebble hover:bg-stone text-onyx px-3.5 py-2 text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <Gavel className="h-4 w-4 text-forest" />
                <span>Tenders Flow</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => router.push("/jobs")}
              className="flex items-center gap-2 rounded-[10px] bg-white border border-pebble hover:bg-stone text-onyx px-3.5 py-2 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <ClipboardList className="h-4 w-4 text-ash" />
              <span>Go to Jobs</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4 KPI SUMMARY METRICS                                                     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-[12px] bg-white p-4.5 border border-pebble shadow-2xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-clear-bg text-forest shrink-0">
              <HardHat className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-ash">
                Awarded Contractors
              </span>
              <p className="text-2xl font-extrabold text-onyx mt-0.5">
                {contractors.length}
              </p>
              <span className="text-[11px] text-success-text font-medium">
                Active in directory
              </span>
            </div>
          </div>

          <div className="rounded-[12px] bg-white p-4.5 border border-pebble shadow-2xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-sunfleck text-onyx shrink-0">
              <Users className="h-5 w-5 text-forest" />
            </div>
            <div>
              <span className="text-xs font-medium text-ash">
                Total Project Bidders
              </span>
              <p className="text-2xl font-extrabold text-onyx mt-0.5">
                {allBidders.length}
              </p>
              <span className="text-[11px] text-forest font-medium">
                Quotes &amp; trade register
              </span>
            </div>
          </div>

          <div className="rounded-[12px] bg-white p-4.5 border border-pebble shadow-2xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-breath text-onyx shrink-0">
              <Briefcase className="h-5 w-5 text-forest" />
            </div>
            <div>
              <span className="text-xs font-medium text-ash">
                Active Work Orders
              </span>
              <p className="text-2xl font-extrabold text-onyx mt-0.5">
                {jobs.length}
              </p>
              <span className="text-[11px] text-ash font-medium">
                Assigned on-site
              </span>
            </div>
          </div>

          <div className="rounded-[12px] bg-white p-4.5 border border-pebble shadow-2xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-forest text-white shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-ash">
                Committed Contract Value
              </span>
              <p className="text-2xl font-extrabold text-onyx mt-0.5">
                ₹{totalContractValue.toLocaleString("en-IN")}
              </p>
              <span className="text-[11px] text-forest font-medium">
                Locked in project budget
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TABS: Awarded Contractors vs All Project Bidders & Suppliers              */}
        {/* ========================================================================= */}
        <div className="border-b border-pebble/70 flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("AWARDED")}
            className={`pb-3 text-sm font-semibold transition relative cursor-pointer flex items-center gap-2 ${
              activeTab === "AWARDED"
                ? "text-forest border-b-2 border-forest"
                : "text-ash hover:text-onyx"
            }`}
          >
            <HardHat className="h-4 w-4" />
            <span>Awarded Contractors</span>
            <span className="bg-breath text-forest px-2 py-0.5 rounded-full text-[11px] font-bold">
              {contractors.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ALL_BIDDERS")}
            className={`pb-3 text-sm font-semibold transition relative cursor-pointer flex items-center gap-2 ${
              activeTab === "ALL_BIDDERS"
                ? "text-forest border-b-2 border-forest"
                : "text-ash hover:text-onyx"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>All Project Bidders &amp; Suppliers</span>
            <span className="bg-stone text-onyx px-2 py-0.5 rounded-full text-[11px] font-bold border border-pebble">
              {allBidders.length}
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SEARCH & FILTERS BAR                                                      */}
        {/* ========================================================================= */}
        <div className="rounded-[12px] bg-white p-3.5 border border-pebble shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 text-ash absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeTab === "AWARDED"
                  ? "Search awarded contractor, trade, or project..."
                  : "Search bidders, suppliers, or quotation details..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs text-onyx placeholder:text-ash bg-stone rounded-[8px] border border-pebble outline-none focus:border-forest transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {/* Trade Filter */}
            <select
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
              className="bg-stone text-xs font-semibold text-onyx border border-pebble rounded-[8px] px-3 py-2 outline-none cursor-pointer"
            >
              <option value="ALL">All Trades</option>
              {trades.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone text-xs font-semibold text-onyx border border-pebble rounded-[8px] px-3 py-2 outline-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="Awarded">Awarded</option>
              <option value="Received">Received Bid</option>
              <option value="Active">Active Site</option>
              <option value="Registered">Registered Partner</option>
            </select>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: AWARDED CONTRACTORS CARDS                                          */}
        {/* ========================================================================= */}
        {activeTab === "AWARDED" && (
          <div>
            {filteredContractors.length === 0 ? (
              <div className="rounded-[14px] bg-white border border-pebble/70 p-10 shadow-2xs text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-breath text-forest">
                  <HardHat className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-onyx">
                  {contractors.length === 0
                    ? "No Contractors Awarded Yet"
                    : "No matching contractors found"}
                </h3>
                <p className="text-xs text-ash max-w-md mx-auto leading-relaxed">
                  {contractors.length === 0
                    ? allBidders.length > 0
                      ? `You have ${allBidders.length} trade bidders who submitted quotes for won projects. You can award a tender to finalize them or view them in 'All Project Bidders'.`
                      : "Contractors are added when you award a tender in Tenders Workflow, or you can register a contractor partner directly."
                    : "Try adjusting your search criteria or filter to see available contractors."}
                </p>
                <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                  {allBidders.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("ALL_BIDDERS")}
                      className="inline-flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-5 py-2.5 text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      <Users className="h-4 w-4" />
                      <span>View All Project Bidders ({allBidders.length})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setNewConProject(opportunities[0]?.projectName || "Skyline Corporate Tower");
                      setShowAddContractorModal(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-[10px] bg-white border border-pebble hover:bg-stone text-onyx px-4 py-2.5 text-xs font-bold shadow-2xs transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ Add Contractor Directly</span>
                  </button>
                  {allBidders.length === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        seedSampleProjectBidders();
                        setActiveTab("ALL_BIDDERS");
                      }}
                      className="inline-flex items-center gap-2 rounded-[10px] bg-breath text-forest border border-forest/30 hover:bg-forest hover:text-white px-4 py-2.5 text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Load Won Project Bidders</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredContractors.map((contractor) => {
                  const assignedJobs = getContractorJobs(contractor.id);

                  return (
                    <div
                      key={contractor.id}
                      className="rounded-[14px] bg-white border border-pebble/80 shadow-2xs hover:shadow-xs transition p-5.5 flex flex-col justify-between space-y-4"
                    >
                      {/* Card Header: Name, Trade, Status */}
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-forest text-white font-black text-sm shrink-0 shadow-2xs">
                              {contractor.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-onyx">
                                  {contractor.name}
                                </h3>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-clear-bg text-success-text border border-success/30">
                                  {contractor.status}
                                </span>
                                {contractor.awardDate ===
                                  new Date().toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }) && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-breath text-forest border border-forest/30 shadow-2xs">
                                    Recent
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-semibold text-forest mt-0.5 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                                <span>{contractor.trade} Specialist</span>
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-bold text-ash uppercase tracking-wider block">
                              Contract Value
                            </span>
                            <span className="text-sm font-black text-onyx">
                              ₹{contractor.awardedAmount.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>

                        {/* Key Award & Project Info */}
                        <div className="mt-4 grid grid-cols-2 gap-2.5 p-3 rounded-[10px] bg-stone/70 border border-pebble/60 text-xs">
                          <div>
                            <span className="text-[10px] font-semibold text-ash block uppercase">
                              Project
                            </span>
                            <span className="font-bold text-onyx truncate block mt-0.5">
                              {contractor.projectName}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-ash block uppercase">
                              Tender Ref
                            </span>
                            <span className="font-bold text-onyx truncate block mt-0.5">
                              {contractor.tenderId}: {contractor.tenderTitle}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-ash block uppercase">
                              Award Date
                            </span>
                            <span className="font-medium text-onyx block mt-0.5">
                              {contractor.awardDate}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-ash block uppercase">
                              Contact
                            </span>
                            <span className="font-medium text-onyx truncate block mt-0.5">
                              {contractor.email}
                            </span>
                          </div>
                        </div>

                        {/* Assigned Work Orders / Jobs Section */}
                        <div className="mt-3 pt-3 border-t border-pebble/60">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-bold text-onyx flex items-center gap-1.5">
                              <ClipboardList className="h-3.5 w-3.5 text-forest" />
                              <span>Assigned Work Orders</span>
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone text-ash">
                              {assignedJobs.length} {assignedJobs.length === 1 ? "Job" : "Jobs"}
                            </span>
                          </div>

                          {assignedJobs.length === 0 ? (
                            <div className="p-2.5 rounded-[8px] bg-sunfleck/40 border border-pebble/60 text-[11px] text-ash flex items-center gap-2">
                              <AlertCircle className="h-3.5 w-3.5 text-onyx shrink-0" />
                              <span>
                                No site jobs assigned yet. Dispatch a job to initiate work.
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-1.5 max-h-36 overflow-y-auto">
                              {assignedJobs.map((j) => (
                                <div
                                  key={j.id}
                                  onClick={() => router.push("/jobs")}
                                  className="p-2 rounded-[8px] bg-stone/80 hover:bg-stone border border-pebble/50 flex items-center justify-between text-xs cursor-pointer transition"
                                >
                                  <div className="min-w-0 pr-2">
                                    <span className="font-bold text-onyx truncate block">
                                      {j.id}: {j.title}
                                    </span>
                                    <span className="text-[10px] text-ash block">
                                      Due: {j.due} • Priority: {j.priority}
                                    </span>
                                  </div>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                      j.completed
                                        ? "bg-clear-bg text-success-text"
                                        : "bg-caution-bg text-caution-text"
                                    }`}
                                  >
                                    {j.status || (j.completed ? "Completed" : "Scheduled")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-3 border-t border-pebble/60 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDetailsContractor(contractor);
                            setShowDetailsModal(true);
                          }}
                          className="px-3 py-1.5 rounded-[8px] text-xs font-semibold text-ash hover:text-onyx hover:bg-stone transition cursor-pointer"
                        >
                          View Scope
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => router.push("/jobs")}
                            className="px-3 py-1.5 rounded-[8px] text-xs font-semibold text-onyx border border-pebble hover:bg-stone transition cursor-pointer"
                          >
                            Jobs List
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenAssignModal(contractor)}
                            className="flex items-center gap-1.5 rounded-[8px] bg-forest hover:bg-forest-hover text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                            <span>Assign Job</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ALL PROJECT BIDDERS & SUPPLIERS                                    */}
        {/* ========================================================================= */}
        {activeTab === "ALL_BIDDERS" && (
          <div>
            {filteredBidders.length === 0 ? (
              <div className="rounded-[14px] bg-white border border-pebble/70 p-10 shadow-2xs text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sunfleck text-onyx">
                  <Users className="h-7 w-7 text-forest" />
                </div>
                <h3 className="text-base font-bold text-onyx">
                  No Project Bidders or Suppliers Found
                </h3>
                <p className="text-xs text-ash max-w-md mx-auto leading-relaxed">
                  Suppliers who submit quotations for your trade tenders will automatically appear here. You can also load sample bidders from won projects.
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      seedSampleProjectBidders();
                      alert("Project bidders loaded successfully!");
                    }}
                    className="inline-flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-5 py-2.5 text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Load Won Project Bidders</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddContractorModal(true)}
                    className="inline-flex items-center gap-2 rounded-[10px] bg-white border border-pebble hover:bg-stone text-onyx px-4 py-2.5 text-xs font-bold shadow-2xs transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ Add Supplier Manually</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredBidders.map((bidder) => (
                  <div
                    key={bidder.id}
                    className={`rounded-[14px] bg-white border p-5.5 flex flex-col justify-between space-y-4 shadow-2xs transition hover:shadow-xs ${
                      bidder.isAwarded
                        ? "border-forest/40 bg-clear-bg/10"
                        : "border-pebble/80"
                    }`}
                  >
                    <div>
                      {/* Top Row: Name, Badge, Quoted Amount */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-[10px] font-black text-sm shrink-0 shadow-2xs ${
                              bidder.isAwarded
                                ? "bg-forest text-white"
                                : "bg-breath text-forest"
                            }`}
                          >
                            {bidder.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-bold text-onyx">
                                {bidder.name}
                              </h3>
                              {bidder.isAwarded ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-clear-bg text-success-text border border-success/30">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Awarded Contractor</span>
                                </span>
                              ) : bidder.isRecommended ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-forest text-white shadow-2xs">
                                  <Sparkles className="h-3 w-3" />
                                  <span>Recommended</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone text-ash border border-pebble">
                                  {bidder.status === "Received" ? "Received Bid" : bidder.status}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-forest mt-0.5 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                              <span>{bidder.trade} Specialty</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-bold text-ash uppercase tracking-wider block">
                            {bidder.isAwarded ? "Awarded Value" : "Quoted Bid"}
                          </span>
                          <span className="text-sm font-black text-onyx">
                            {bidder.quotationAmount > 0
                              ? `₹${bidder.quotationAmount.toLocaleString("en-IN")}`
                              : "Registered Rate"}
                          </span>
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="mt-4 grid grid-cols-2 gap-2.5 p-3 rounded-[10px] bg-stone/70 border border-pebble/60 text-xs">
                        <div>
                          <span className="text-[10px] font-semibold text-ash block uppercase">
                            Project
                          </span>
                          <span className="font-bold text-onyx truncate block mt-0.5">
                            {bidder.projectName}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-ash block uppercase">
                            Tender Package
                          </span>
                          <span className="font-bold text-onyx truncate block mt-0.5">
                            {bidder.tenderTitle}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-ash block uppercase">
                            Delivery Timeline
                          </span>
                          <span className="font-medium text-onyx block mt-0.5">
                            {bidder.deliveryTime}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-ash block uppercase">
                            Contact
                          </span>
                          <span className="font-medium text-onyx truncate block mt-0.5">
                            {bidder.email}
                          </span>
                        </div>
                      </div>

                      {bidder.remarks && (
                        <div className="mt-2 text-[11px] text-ash bg-stone/50 px-3 py-1.5 rounded-[6px] border border-pebble/40 italic">
                          &quot;{bidder.remarks}&quot;
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-pebble/60 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-ash font-medium">
                        {bidder.isAwarded
                          ? "Contract active on site"
                          : "Proposal evaluated and ready"}
                      </span>

                      <div className="flex items-center gap-2">
                        {bidder.isAwarded ? (
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/jobs?contractorId=${bidder.contractorId}&openAssign=true`
                              )
                            }
                            className="flex items-center gap-1.5 rounded-[8px] bg-forest hover:bg-forest-hover text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition cursor-pointer"
                          >
                            <ClipboardList className="h-3.5 w-3.5" />
                            <span>Assign Job in Jobs →</span>
                          </button>
                        ) : isSiteManager ? (
                          <span className="text-[11px] font-medium text-ash italic px-2 py-1 bg-stone rounded-[6px]">
                            Awaiting PM Award
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => router.push("/tenders")}
                              className="px-3 py-1.5 rounded-[8px] text-xs font-semibold text-onyx border border-pebble hover:bg-stone transition cursor-pointer"
                            >
                              View in Tenders
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAwardBidderDirectly(bidder)}
                              className="flex items-center gap-1.5 rounded-[8px] bg-forest hover:bg-forest-hover text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition cursor-pointer"
                            >
                              <Award className="h-3.5 w-3.5" />
                              <span>Award Contract</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: ASSIGN JOB TO CONTRACTOR                                           */}
        {/* ========================================================================= */}
        {showAssignModal && selectedContractor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-lg rounded-[16px] bg-white p-6 shadow-2xl border border-pebble relative animate-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-ash hover:bg-stone hover:text-onyx transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 pb-3 border-b border-pebble">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-forest text-white">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-onyx">
                    Assign Work Order
                  </h2>
                  <p className="text-xs text-ash">
                    Assigning site job to{" "}
                    <span className="font-bold text-forest">
                      {selectedContractor.name}
                    </span>{" "}
                    ({selectedContractor.trade})
                  </p>
                </div>
              </div>

              <form onSubmit={handleAssignJobSubmit} className="mt-4 space-y-3.5">
                {/* Contractor & Tender Reference Box */}
                <div className="p-3 rounded-[10px] bg-stone/70 border border-pebble/70 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-ash uppercase">
                      Contractor
                    </span>
                    <p className="font-bold text-onyx">
                      {selectedContractor.name} ({selectedContractor.trade})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-ash uppercase">
                      Tender Package
                    </span>
                    <p className="font-semibold text-onyx">
                      {selectedContractor.tenderId} • ₹
                      {selectedContractor.awardedAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-onyx mb-1">
                    Job / Work Order Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Main DB Installation & Cable Laying"
                    className="w-full h-9 px-3 text-xs bg-stone rounded-[8px] border border-pebble outline-none focus:border-forest"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-onyx mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      required
                      value={jobProject}
                      onChange={(e) => setJobProject(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-stone rounded-[8px] border border-pebble outline-none focus:border-forest"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-onyx mb-1">
                      Site Location
                    </label>
                    <input
                      type="text"
                      required
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-stone rounded-[8px] border border-pebble outline-none focus:border-forest"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-onyx mb-1">
                      Priority
                    </label>
                    <select
                      value={jobPriority}
                      onChange={(e) =>
                        setJobPriority(
                          e.target.value as "High" | "Medium" | "Low"
                        )
                      }
                      className="w-full h-9 px-3 text-xs bg-stone rounded-[8px] border border-pebble outline-none focus:border-forest cursor-pointer"
                    >
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-onyx mb-1">
                      Target Due Date
                    </label>
                    <input
                      type="text"
                      value={jobDue}
                      onChange={(e) => setJobDue(e.target.value)}
                      placeholder="e.g. Next Friday"
                      className="w-full h-9 px-3 text-xs bg-stone rounded-[8px] border border-pebble outline-none focus:border-forest"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-onyx mb-1">
                    Work Scope Notes / Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Provide site instructions, safety guidelines, and delivery parameters..."
                    className="w-full p-2.5 text-xs bg-stone rounded-[8px] border border-pebble outline-none focus:border-forest"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-pebble">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 rounded-[8px] text-xs font-semibold text-ash hover:bg-stone transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-[8px] bg-forest hover:bg-forest-hover text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    Confirm &amp; Assign Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: VIEW CONTRACTOR SCOPE & DETAILS                                    */}
        {/* ========================================================================= */}
        {showDetailsModal && detailsContractor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-2xl border border-pebble relative animate-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-ash hover:bg-stone hover:text-onyx transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="pb-3 border-b border-pebble">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-onyx">
                    {detailsContractor.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-clear-bg text-success-text border border-success/30">
                    {detailsContractor.status}
                  </span>
                </div>
                <p className="text-xs text-forest font-semibold mt-0.5">
                  {detailsContractor.trade} Specialist
                </p>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <div className="p-3 bg-stone rounded-[10px] space-y-2 border border-pebble/70">
                  <div className="flex justify-between">
                    <span className="text-ash">Trade Specialty:</span>
                    <span className="font-bold text-onyx">
                      {detailsContractor.trade}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ash">Associated Project:</span>
                    <span className="font-bold text-onyx">
                      {detailsContractor.projectName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ash">Tender Title:</span>
                    <span className="font-bold text-onyx">
                      {detailsContractor.tenderTitle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ash">Tender ID:</span>
                    <span className="font-bold text-forest">
                      {detailsContractor.tenderId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ash">Awarded Contract Value:</span>
                    <span className="font-bold text-onyx text-sm">
                      ₹{detailsContractor.awardedAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ash">Award Date:</span>
                    <span className="font-semibold text-onyx">
                      {detailsContractor.awardDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ash">Delivery Timeline:</span>
                    <span className="font-semibold text-onyx">
                      {detailsContractor.deliveryTime || "As agreed in tender"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ash">Payment Terms:</span>
                    <span className="font-semibold text-onyx">
                      {detailsContractor.paymentTerms || "Milestone based"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-clear-bg rounded-[10px] border border-success/30 text-onyx">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  <span>
                    Contract terms signed and project budget allocated.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-pebble">
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 rounded-[8px] text-xs font-semibold text-ash hover:bg-stone transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleOpenAssignModal(detailsContractor);
                  }}
                  className="px-4.5 py-2 rounded-[8px] bg-forest hover:bg-forest-hover text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Assign Job Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: ADD CONTRACTOR / PARTNER DIRECTLY                                  */}
        {/* ========================================================================= */}
        {showAddContractorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-onyx/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-pebble/80 p-6 space-y-4 animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between pb-3 border-b border-pebble/60">
                <div>
                  <h2 className="text-base font-bold text-onyx">
                    Add Trade Contractor / Partner
                  </h2>
                  <p className="text-xs text-ash mt-0.5">
                    Register a trade subcontractor directly to this project.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddContractorModal(false)}
                  className="p-1 rounded-full text-ash hover:text-onyx hover:bg-stone transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddContractorSubmit} className="space-y-3.5 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-onyx">
                      Contractor / Company Name <span className="text-hazard">*</span>
                    </label>
                    {crewMembers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const nextManual = !isManualContractor;
                          setIsManualContractor(nextManual);
                          if (nextManual) {
                            setSelectedCrewMemberId("__MANUAL__");
                          } else {
                            setSelectedCrewMemberId("");
                          }
                        }}
                        className="text-[11px] font-medium text-forest hover:underline cursor-pointer"
                      >
                        {isManualContractor ? "👥 Select from Crew / People" : "✏️ Type Custom Name"}
                      </button>
                    )}
                  </div>

                  {isManualContractor || crewMembers.length === 0 ? (
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Power Solutions"
                      value={newConName}
                      onChange={(e) => setNewConName(e.target.value)}
                      className="w-full rounded-[8px] border border-pebble p-2.5 outline-none focus:border-forest"
                    />
                  ) : (
                    <select
                      value={selectedCrewMemberId}
                      onChange={(e) => handleSelectCrewForContractor(e.target.value)}
                      className="w-full rounded-[8px] border border-pebble p-2.5 outline-none focus:border-forest bg-white cursor-pointer"
                      required
                    >
                      <option value="">-- Select Crew / Person --</option>
                      <optgroup label="Available Crew / People">
                        {crewMembers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.role} • {m.trade || "General"})
                          </option>
                        ))}
                      </optgroup>
                      <option value="__MANUAL__">➕ Type Custom / Other Contractor Manually</option>
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-onyx mb-1">
                      Trade / Specialty <span className="text-hazard">*</span>
                    </label>
                    <select
                      value={newConTrade}
                      onChange={(e) => setNewConTrade(e.target.value)}
                      className="w-full rounded-[8px] border border-pebble p-2.5 outline-none focus:border-forest bg-white cursor-pointer"
                    >
                      <option value="Electrical">Electrical</option>
                      <option value="Plumbing">Plumbing &amp; Sanitary</option>
                      <option value="HVAC">HVAC &amp; Mechanical</option>
                      <option value="Civil Works">Civil &amp; Masonry</option>
                      <option value="Painting">Painting &amp; Finishing</option>
                      <option value="Carpentry">Carpentry &amp; Woodwork</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-onyx mb-1">
                      Contract Value (₹) <span className="text-hazard">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 500000"
                      value={newConValue}
                      onChange={(e) => setNewConValue(e.target.value)}
                      className="w-full rounded-[8px] border border-pebble p-2.5 outline-none focus:border-forest"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-onyx mb-1">
                    Associated Won Project <span className="text-hazard">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Skyline Corporate Tower"
                    value={newConProject}
                    onChange={(e) => setNewConProject(e.target.value)}
                    className="w-full rounded-[8px] border border-pebble p-2.5 outline-none focus:border-forest"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-onyx mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      placeholder="contractor@firma.com"
                      value={newConEmail}
                      onChange={(e) => setNewConEmail(e.target.value)}
                      className="w-full rounded-[8px] border border-pebble p-2.5 outline-none focus:border-forest"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-onyx mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98102 34567"
                      value={newConPhone}
                      onChange={(e) => setNewConPhone(e.target.value)}
                      className="w-full rounded-[8px] border border-pebble p-2.5 outline-none focus:border-forest"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-pebble">
                  <button
                    type="button"
                    onClick={() => setShowAddContractorModal(false)}
                    className="px-4 py-2 rounded-[8px] font-semibold text-ash hover:bg-stone transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-[8px] bg-forest hover:bg-forest-hover text-white font-bold shadow-xs transition cursor-pointer"
                  >
                    Add Contractor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </FirmaLayout>
  );
}
