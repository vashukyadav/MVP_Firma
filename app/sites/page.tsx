"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import FirmaLayout from "@/components/layout/FirmaLayout";
import { db } from "@/lib/db";
import {
  useSiteStore,
  type ConstructionSite,
  type SiteStatus,
} from "@/store/siteStore";
import { useCrewStore } from "@/store/crewStore";
import { useSchedulingStore } from "@/store/schedulingStore";
import { useTenderFlowStore } from "@/store/tenderFlowStore";
import { useLeadFlowStore } from "@/store/leadFlowStore";
import { useAuthStore } from "@/store/authStore";
import { getAssignedSites, getAssignedProjects, isSiteManager, isFieldWorker } from "@/lib/roleAccess";
import {
  MapPin,
  Building2,
  HardHat,
  Wrench,
  UserCheck,
  Plus,
  Search,
  Phone,
  Edit2,
  Trash2,
  Calendar,
  X,
  Check,
  ExternalLink,
  Briefcase,
  AlertCircle,
  Clock,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  ShieldCheck,
  Compass,
} from "lucide-react";

export default function SitesPage() {
  const router = useRouter();

  // Stores
  const { sites, addSite, updateSite, deleteSite } = useSiteStore();
  const { members: crewMembers = [] } = useCrewStore();
  const { scheduledJobs = [] } = useSchedulingStore();
  const { jobs: tenderJobs = [], contractors = [] } = useTenderFlowStore();
  const { projects = [] } = useLeadFlowStore();

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | SiteStatus>("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

  // Add Site Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newProject, setNewProject] = useState("Skyline Apartments");
  const [newAddress, setNewAddress] = useState("");
  const [newCity, setNewCity] = useState("Gurugram");
  const [newState, setNewState] = useState("Haryana");
  const [newPincode, setNewPincode] = useState("122011");
  const [newManagerId, setNewManagerId] = useState("");
  const [newManagerName, setNewManagerName] = useState("");
  const [newManagerPhone, setNewManagerPhone] = useState("");
  const [newStatus, setNewStatus] = useState<SiteStatus>("Active");
  const [newStartDate, setNewStartDate] = useState("15 Sep 2026");
  const [newExpectedCompletion, setNewExpectedCompletion] =
    useState("31 Dec 2026");
  const [newArea, setNewArea] = useState("60,000 sq.ft");
  const [newNotes, setNewNotes] = useState("");
  const [addError, setAddError] = useState("");

  // Edit Site Modal State
  const [editingSite, setEditingSite] = useState<ConstructionSite | null>(null);
  const [editName, setEditName] = useState("");
  const [editProject, setEditProject] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editPincode, setEditPincode] = useState("");
  const [editManagerName, setEditManagerName] = useState("");
  const [editManagerPhone, setEditManagerPhone] = useState("");
  const [editStatus, setEditStatus] = useState<SiteStatus>("Active");
  const [editStartDate, setEditStartDate] = useState("");
  const [editExpectedCompletion, setEditExpectedCompletion] = useState("");
  const [editArea, setEditArea] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Site Details Modal
  const [viewingSite, setViewingSite] = useState<ConstructionSite | null>(null);

  // Available Site Managers from IndexedDB db.users + CrewStore
  const [dbManagers, setDbManagers] = useState<
    { id: string; name: string; contact?: string; role: string }[]
  >([]);

  useEffect(() => {
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
      } catch (err) {
        console.error("Failed to load managers from db.users:", err);
      }
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

  const currentUser = useAuthStore((state) => state.currentUser);
  const isSM = isSiteManager(currentUser);
  const isFW = isFieldWorker(currentUser);

  const assignedProjects = useMemo(() => {
    return getAssignedProjects(projects, sites, currentUser);
  }, [projects, sites, currentUser]);

  const roleSites = useMemo(() => {
    return getAssignedSites(sites, currentUser, assignedProjects);
  }, [sites, currentUser, assignedProjects]);

  // Derive Dynamic Stats
  const stats = useMemo(() => {
    const total = roleSites.length;
    const active = roleSites.filter((s) => s.status === "Active").length;
    const mobilizing = roleSites.filter((s) => s.status === "Mobilizing").length;
    const uniqueManagers = new Set(roleSites.map((s) => s.siteManagerName)).size;
    return { total, active, mobilizing, uniqueManagers };
  }, [roleSites]);

  // Filtered Sites
  const filteredSites = useMemo(() => {
    return roleSites.filter((site) => {
      // Status filter
      if (statusFilter !== "ALL" && site.status !== statusFilter) {
        return false;
      }
      // Search query
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        site.name.toLowerCase().includes(q) ||
        site.projectName.toLowerCase().includes(q) ||
        site.address.toLowerCase().includes(q) ||
        site.city.toLowerCase().includes(q) ||
        site.siteManagerName.toLowerCase().includes(q) ||
        site.id.toLowerCase().includes(q)
      );
    });
  }, [roleSites, statusFilter, search]);

  // Open Add Site Modal with prefill
  const handleOpenAddSite = () => {
    setNewName("");
    setNewProject(projects[0]?.name || "Skyline Apartments");
    setNewAddress("");
    setNewCity("Gurugram");
    setNewState("Haryana");
    setNewPincode("122011");
    if (availableSiteManagers.length > 0) {
      setNewManagerId(availableSiteManagers[0].id);
      setNewManagerName(availableSiteManagers[0].name);
      setNewManagerPhone(availableSiteManagers[0].contact || "+91 98000 00000");
    } else {
      setNewManagerId("");
      setNewManagerName("");
      setNewManagerPhone("");
    }
    setNewStatus("Active");
    setNewStartDate("15 Sep 2026");
    setNewExpectedCompletion("31 Dec 2026");
    setNewArea("50,000 sq.ft");
    setNewNotes("");
    setAddError("");
    setShowAddModal(true);
  };

  // Submit Add Site
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setAddError("Please enter site name (e.g. Tower A & Commercial Block)");
      return;
    }
    if (!newAddress.trim()) {
      setAddError("Please enter the physical site street address");
      return;
    }

    addSite({
      name: newName.trim(),
      projectName: newProject.trim() || "Skyline Apartments",
      address: newAddress.trim(),
      city: newCity.trim() || "Gurugram",
      state: newState.trim() || "Haryana",
      pincode: newPincode.trim() || "122001",
      siteManagerId: newManagerId || undefined,
      siteManagerName: newManagerName.trim() || "Unassigned",
      siteManagerPhone: newManagerPhone.trim() || undefined,
      status: newStatus,
      startDate: newStartDate.trim() || "15 Sep 2026",
      expectedCompletion: newExpectedCompletion.trim() || "31 Dec 2026",
      totalAreaSqFt: newArea.trim() || undefined,
      notes: newNotes.trim() || undefined,
    });

    setShowAddModal(false);
  };

  // Open Edit Site Modal
  const handleOpenEdit = (site: ConstructionSite) => {
    setEditingSite(site);
    setEditName(site.name);
    setEditProject(site.projectName);
    setEditAddress(site.address);
    setEditCity(site.city);
    setEditState(site.state);
    setEditPincode(site.pincode);
    setEditManagerName(site.siteManagerName);
    setEditManagerPhone(site.siteManagerPhone || "+91 98765 43210");
    setEditStatus(site.status);
    setEditStartDate(site.startDate);
    setEditExpectedCompletion(site.expectedCompletion);
    setEditArea(site.totalAreaSqFt || "");
    setEditNotes(site.notes || "");
  };

  // Submit Edit Site
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite) return;

    const selMgr = availableSiteManagers.find(
      (m) => m.name === editManagerName
    );
    const resolvedManagerId = selMgr?.id || editingSite.siteManagerId;

    const siteData = {
      name: editName.trim() || editingSite.name,
      projectName: editProject.trim() || editingSite.projectName,
      address: editAddress.trim() || editingSite.address,
      city: editCity.trim() || editingSite.city,
      state: editState.trim() || editingSite.state,
      pincode: editPincode.trim() || editingSite.pincode,
      siteManagerName: editManagerName.trim() || editingSite.siteManagerName,
      siteManagerId: resolvedManagerId,
      siteManagerPhone: editManagerPhone.trim() || editingSite.siteManagerPhone,
      status: editStatus,
      startDate: editStartDate.trim() || editingSite.startDate,
      expectedCompletion:
        editExpectedCompletion.trim() || editingSite.expectedCompletion,
      totalAreaSqFt: editArea.trim() || editingSite.totalAreaSqFt,
      notes: editNotes.trim() || editingSite.notes,
    };

    const existsInStore = sites.some((s) => s.id === editingSite.id);
    if (existsInStore) {
      updateSite(editingSite.id, siteData);
    } else {
      addSite(siteData);
    }

    setEditingSite(null);
  };

  // Helper to gather all jobs (tender work packages + scheduling jobs) executing on this site
  const getSiteWorkPackages = (site: ConstructionSite) => {
    const sName = (site.name || "").toLowerCase().trim();
    const pName = (site.projectName || "").toLowerCase().trim();
    const sId = (site.id || "").toLowerCase().trim();

    // 1. Match tenderFlowStore jobs (awarded contractor packages like JOB-405, plus field tasks)
    const matchedTenderJobs = tenderJobs.filter((j) => {
      const jLoc = (j.location || "").toLowerCase().trim();
      const jProj = (j.projectName || "").toLowerCase().trim();
      const jSite = ((j as any).siteName || (j as any).site || "").toLowerCase().trim();
      const jSiteId = ((j as any).siteId || "").toLowerCase().trim();

      const matchesSiteId = Boolean(jSiteId && (jSiteId === sId || sId.includes(jSiteId)));
      const matchesLoc = Boolean(jLoc && (jLoc.includes(sName) || sName.includes(jLoc)));
      const matchesSiteName = Boolean(jSite && (jSite.includes(sName) || sName.includes(jSite)));
      const matchesProj = Boolean(
        pName &&
          jProj &&
          (jProj === pName || jProj.includes(pName) || pName.includes(jProj))
      );

      return matchesSiteId || matchesLoc || matchesSiteName || matchesProj;
    });

    // 2. Match schedulingStore scheduledJobs (if any not already in tenderJobs)
    const matchedSchedJobs = scheduledJobs.filter((sj) => {
      if (matchedTenderJobs.some((tj) => tj.id === sj.id)) return false;
      const sjLoc = (sj.site || "").toLowerCase().trim();
      const sjProj = (sj.project || "").toLowerCase().trim();
      return (
        (sjLoc && (sjLoc.includes(sName) || sName.includes(sjLoc))) ||
        (sjProj && pName && (sjProj === pName || sjProj.includes(pName) || pName.includes(sjProj)))
      );
    });

    // Unified package list
    const allJobs = [
      ...matchedTenderJobs.map((tj) => ({
        id: tj.id,
        title: tj.title,
        projectName: tj.projectName,
        contractorName: tj.contractorName || (tj.isContractorJob ? tj.assignee : undefined),
        isContractorJob: Boolean(tj.isContractorJob || tj.contractorName),
        trade: tj.trade || (tj.isContractorJob ? "Specialty Trade" : undefined),
        status: tj.status || "Scheduled",
        startDate: tj.startDate || "15 Sep 2026",
        endDate: tj.endDate || tj.due || "30 Nov 2026",
        assignee: tj.assignee,
      })),
      ...matchedSchedJobs.map((sj) => ({
        id: sj.id,
        title: sj.title,
        projectName: sj.project,
        contractorName: sj.contractorName,
        isContractorJob: Boolean(sj.contractorName),
        trade: sj.contractorName ? "Trade Contractor" : undefined,
        status: sj.status || "Scheduled",
        startDate: sj.startDate || sj.date || "15 Sep 2026",
        endDate: sj.endDate || sj.deadline || "30 Nov 2026",
        assignee: sj.contractorName || sj.worker,
      })),
    ];

    const contractorPackages = allJobs.filter((j) => j.isContractorJob);
    const internalTasks = allJobs.filter((j) => !j.isContractorJob);

    // Unique active contractors on this site
    const activeContractors: Array<{ name: string; trade: string; jobId?: string }> = [];
    contractorPackages.forEach((cp) => {
      const cName = cp.contractorName || cp.assignee;
      if (
        cName &&
        !activeContractors.some((ac) => ac.name.toLowerCase() === cName.toLowerCase())
      ) {
        activeContractors.push({
          name: cName,
          trade: cp.trade || "Specialty Trade",
          jobId: cp.id,
        });
      }
    });

    // Also look up any awarded contractors in contractors array matching this project
    contractors.forEach((con) => {
      const cProj = (con.projectName || "").toLowerCase().trim();
      if (
        (cProj === pName || cProj.includes(pName) || pName.includes(cProj)) &&
        !activeContractors.some((ac) => ac.name.toLowerCase() === con.name.toLowerCase())
      ) {
        activeContractors.push({
          name: con.name,
          trade: con.trade || "Specialty Trade",
        });
      }
    });

    return {
      allJobs,
      contractorPackages,
      internalTasks,
      activeContractors,
    };
  };

  // Helper to count active jobs on this site
  const getSiteLiveJobs = (site: ConstructionSite) => {
    return getSiteWorkPackages(site).allJobs;
  };

  // Status Badge Helper
  const getStatusBadge = (status: SiteStatus) => {
    switch (status) {
      case "Active":
        return {
          bg: "bg-forest/15 text-forest border-forest/30",
          dot: "bg-forest animate-pulse",
          label: "Active Site",
        };
      case "Mobilizing":
        return {
          bg: "bg-amber-100 text-amber-900 border-amber-300",
          dot: "bg-amber-600",
          label: "Mobilizing",
        };
      case "Completed":
        return {
          bg: "bg-stone text-ash border-pebble",
          dot: "bg-ash",
          label: "Completed",
        };
      case "On Hold":
        return {
          bg: "bg-hazard-bg text-hazard-text border-hazard-bg",
          dot: "bg-red-500",
          label: "On Hold",
        };
    }
  };

  return (
    <FirmaLayout activeNav="Sites">
      <div className="space-y-5 mt-2">
        {/* ========================================================================= */}
        {/* TOP SUMMARY KPI STATS                                                     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Total Sites */}
          <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-ash uppercase tracking-wider">
                Total Sites
              </p>
              <h3 className="text-2xl font-black text-onyx mt-1">
                {stats.total}
              </h3>
              <p className="text-[11px] text-ash mt-0.5">Physical locations</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
          </div>

          {/* Active Running Sites */}
          <div
            onClick={() => setStatusFilter("Active")}
            className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs flex items-center justify-between cursor-pointer hover:border-forest/50 transition group"
          >
            <div>
              <p className="text-xs font-semibold text-forest uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-forest animate-pulse" />
                <span>Active Running Sites</span>
              </p>
              <h3 className="text-2xl font-black text-onyx mt-1 group-hover:text-forest transition">
                {stats.active}
              </h3>
              <p className="text-[11px] text-ash mt-0.5">Execution underway</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-forest text-white flex items-center justify-center shadow-xs">
              <Compass className="h-5 w-5" />
            </div>
          </div>

          {/* Mobilizing Sites */}
          <div
            onClick={() => setStatusFilter("Mobilizing")}
            className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition group"
          >
            <div>
              <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                Mobilizing Sites
              </p>
              <h3 className="text-2xl font-black text-onyx mt-1 group-hover:text-amber-800 transition">
                {stats.mobilizing}
              </h3>
              <p className="text-[11px] text-ash mt-0.5">Pre-construction</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          {/* Site Managers Deployed */}
          <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-ash uppercase tracking-wider">
                Site Managers
              </p>
              <h3 className="text-2xl font-black text-onyx mt-1">
                {stats.uniqueManagers}
              </h3>
              <p className="text-[11px] text-ash mt-0.5">Assigned in charge</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-stone text-onyx flex items-center justify-center">
              <HardHat className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN SITES DIRECTORY CARD                                                 */}
        {/* ========================================================================= */}
        <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs">
          {/* Header Title & Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-onyx tracking-tight flex items-center gap-2">
                <MapPin className="h-6 w-6 text-forest" />
                <span>Construction Sites & Locations</span>
              </h1>
              <p className="text-xs sm:text-sm text-ash mt-0.5">
                Active site yards with physical addresses, assigned site
                managers, project link, and live work status.
              </p>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/scheduling")}
                className="inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-pebble/90 bg-white hover:bg-stone text-onyx px-3.5 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer shrink-0"
              >
                <Calendar className="h-4 w-4 text-forest" />
                <span>Site Calendar</span>
              </button>
              {!isSM && !isFW && (
                <button
                  type="button"
                  onClick={handleOpenAddSite}
                  className="inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4 py-2 text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>Add Site</span>
                </button>
              )}
            </div>
          </div>

          {/* Search & Filter Controls Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mt-5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" />
              <input
                type="text"
                placeholder="Search site name, address, project, or manager..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-[10px] border border-pebble/80 bg-white pl-9.5 pr-4 py-2 text-xs sm:text-sm text-onyx placeholder:text-ash focus:outline-none focus:ring-1 focus:ring-forest/50"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ash hover:text-onyx"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Buttons & View Mode Toggle */}
            <div className="flex items-center gap-2">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-stone/70 p-1 rounded-[10px] border border-pebble/60 text-xs font-semibold shrink-0">
                <button
                  type="button"
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-3 py-1.5 rounded-[7px] transition cursor-pointer ${
                    statusFilter === "ALL"
                      ? "bg-white text-onyx shadow-2xs font-bold"
                      : "text-ash hover:text-onyx"
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("Active")}
                  className={`px-3 py-1.5 rounded-[7px] transition cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === "Active"
                      ? "bg-forest text-white shadow-2xs font-bold"
                      : "text-ash hover:text-onyx"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Active ({stats.active})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("Mobilizing")}
                  className={`px-3 py-1.5 rounded-[7px] transition cursor-pointer ${
                    statusFilter === "Mobilizing"
                      ? "bg-white text-amber-900 shadow-2xs font-bold"
                      : "text-ash hover:text-onyx"
                  }`}
                >
                  Mobilizing ({stats.mobilizing})
                </button>
              </div>

              {/* View Mode Toggle (Cards vs Table) */}
              <div className="flex items-center bg-stone/70 p-1 rounded-[10px] border border-pebble/60 text-xs font-semibold shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("GRID")}
                  className={`p-1.5 rounded-[7px] transition cursor-pointer ${
                    viewMode === "GRID"
                      ? "bg-white text-forest shadow-2xs"
                      : "text-ash hover:text-onyx"
                  }`}
                  title="Card View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("TABLE")}
                  className={`p-1.5 rounded-[7px] transition cursor-pointer ${
                    viewMode === "TABLE"
                      ? "bg-white text-forest shadow-2xs"
                      : "text-ash hover:text-onyx"
                  }`}
                  title="Table View"
                >
                  <TableIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SITES CONTENT (CARDS GRID OR TABLE)                                       */}
          {/* ========================================================================= */}
          {filteredSites.length === 0 ? (
            <div className="py-16 text-center text-ash">
              <MapPin className="h-10 w-10 mx-auto text-pebble mb-2.5" />
              <h3 className="text-base font-bold text-onyx">
                {isSM ? "No Construction Sites Assigned to You" : "No Sites Found"}
              </h3>
              <p className="text-xs text-ash mt-1 max-w-sm mx-auto">
                {isSM
                  ? `You (${currentUser?.name || "Site Manager"}) are currently not assigned to any active construction sites. Contact your Project Manager or Owner to assign a site to you.`
                  : search
                  ? `No construction sites matching "${search}". Try another keyword.`
                  : "No sites under this status. Click '+ Add Site' to register a new site yard."}
              </p>
            </div>
          ) : viewMode === "GRID" ? (
            /* 1. GRID CARDS VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              {filteredSites.map((site) => {
                const sitePkg = getSiteWorkPackages(site);
                const liveJobs = sitePkg.allJobs;
                const statusBadge = getStatusBadge(site.status);

                return (
                  <div
                    key={site.id}
                    className="rounded-[14px] bg-white border border-pebble/80 p-5 shadow-2xs flex flex-col justify-between hover:border-forest/50 transition group relative"
                  >
                    <div>
                      {/* Top Row: Site ID, Project Badge & Status Badge */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-xs text-forest bg-clear-bg px-2.5 py-0.5 rounded-md">
                            {site.id}
                          </span>
                          <span className="text-[11px] font-bold text-onyx bg-stone px-2.5 py-0.5 rounded-md flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-ash" />
                            <span>{site.projectName}</span>
                          </span>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge.bg}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`}
                          />
                          <span>{statusBadge.label}</span>
                        </span>
                      </div>

                      {/* Site Name */}
                      <h3 className="text-base font-bold text-onyx tracking-tight group-hover:text-forest transition">
                        {site.name}
                      </h3>

                      {/* PHYSICAL ADDRESS (Primary User Requirement) */}
                      <div className="mt-3 p-2.5 rounded-[10px] bg-stone/40 border border-pebble/60 flex items-start gap-2.5">
                        <MapPin className="h-4 w-4 text-forest shrink-0 mt-0.5" />
                        <div className="text-xs text-onyx min-w-0">
                          <p className="font-semibold leading-snug">
                            {site.address}
                          </p>
                          <p className="text-[11px] text-ash mt-0.5">
                            {site.city}, {site.state} - {site.pincode}
                          </p>
                        </div>
                      </div>

                      {/* ASSIGNED SITE MANAGER (Primary User Requirement) */}
                      <div className="mt-3 p-2.5 rounded-[10px] bg-clear-bg/40 border border-forest/20 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8 w-8 rounded-full bg-forest text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {site.siteManagerName
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-forest uppercase tracking-wider block">
                              Assigned Site Manager
                            </span>
                            <span className="text-xs font-bold text-onyx truncate block leading-tight">
                              {site.siteManagerName}
                            </span>
                          </div>
                        </div>

                        {site.siteManagerPhone && (
                          <a
                            href={`tel:${site.siteManagerPhone.replace(
                              /\s+/g,
                              ""
                            )}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest hover:underline bg-white px-2 py-1 rounded-md border border-forest/30 shadow-2xs shrink-0"
                          >
                            <Phone className="h-3 w-3" />
                            <span>{site.siteManagerPhone}</span>
                          </a>
                        )}
                      </div>

                      {/* ON-SITE TRADE CONTRACTORS & WORK PACKAGES */}
                      <div className="mt-3 p-2.5 rounded-[10px] bg-forest/5 border border-forest/20">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
                            <HardHat className="h-3.5 w-3.5" />
                            <span>Trade Contractors on Site ({sitePkg.activeContractors.length})</span>
                          </span>
                          {sitePkg.contractorPackages.length > 0 && (
                            <span className="text-[10px] font-bold text-onyx bg-white px-2 py-0.5 rounded border border-pebble/80 shadow-2xs">
                              {sitePkg.contractorPackages.length} Work Package{sitePkg.contractorPackages.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>

                        {sitePkg.activeContractors.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {sitePkg.activeContractors.map((ac) => (
                              <span
                                key={ac.name}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-white border border-forest/30 text-xs font-bold text-onyx shadow-2xs"
                              >
                                <Wrench className="h-3 w-3 text-forest" />
                                <span>{ac.name}</span>
                                <span className="text-ash font-medium text-[10px]">({ac.trade})</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-ash mt-1 flex items-center gap-1">
                            <span>Direct execution by internal site crew</span>
                          </p>
                        )}
                      </div>

                      {/* Live Execution Stats & Dates */}
                      <div className="mt-3 pt-3 border-t border-pebble/40 grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-ash">
                          <Briefcase className="h-3.5 w-3.5 text-forest shrink-0" />
                          <span>Active Tasks:</span>
                          <span className="font-bold text-onyx">
                            {liveJobs.length}
                          </span>
                          {sitePkg.contractorPackages.length > 0 && (
                            <span className="text-[10px] font-bold text-forest bg-forest/10 px-1.5 py-0.2 rounded border border-forest/20">
                              {sitePkg.contractorPackages.length} trade
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-ash">
                          <Calendar className="h-3.5 w-3.5 text-forest shrink-0" />
                          <span>Due:</span>
                          <span className="font-bold text-onyx truncate">
                            {site.expectedCompletion}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-pebble/40 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingSite(site)}
                          className="px-2.5 py-1 rounded-[7px] text-xs font-semibold text-onyx hover:bg-stone border border-pebble transition cursor-pointer"
                        >
                          View Scope
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push("/scheduling")}
                          className="px-2.5 py-1 rounded-[7px] text-xs font-semibold text-forest hover:bg-forest/10 border border-forest/30 transition cursor-pointer flex items-center gap-1"
                        >
                          <span>Calendar</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>

                      {!isFW && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(site)}
                          className="p-1.5 rounded-[6px] text-ash hover:text-onyx hover:bg-stone transition cursor-pointer"
                          title="Edit Site Details & Manager"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to delete ${site.name}?`
                              )
                            ) {
                              deleteSite(site.id);
                            }
                          }}
                          className="p-1.5 rounded-[6px] text-ash hover:text-danger-text hover:bg-hazard-bg transition cursor-pointer"
                          title="Delete Site"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 2. TABLE VIEW */
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b border-pebble/60 text-[11px] uppercase font-bold text-ash tracking-wider bg-stone/30">
                    <th className="py-3 px-3">Site & Project</th>
                    <th className="py-3 px-3">Physical Address</th>
                    <th className="py-3 px-3">Assigned Site Manager</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Live Tasks</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pebble/40">
                  {filteredSites.map((site) => {
                    const sitePkg = getSiteWorkPackages(site);
                    const liveJobs = sitePkg.allJobs;
                    const statusBadge = getStatusBadge(site.status);

                    return (
                      <tr key={site.id} className="hover:bg-stone/20 transition">
                        {/* Site & Project */}
                        <td className="py-3 px-3">
                          <span className="font-extrabold text-[11px] text-forest bg-clear-bg px-2 py-0.2 rounded mr-1.5">
                            {site.id}
                          </span>
                          <span className="font-bold text-onyx block mt-0.5">
                            {site.name}
                          </span>
                          <span className="text-[11px] text-ash block">
                            Project: {site.projectName}
                          </span>
                        </td>

                        {/* Physical Address */}
                        <td className="py-3 px-3 text-onyx">
                          <div className="flex items-start gap-1.5 max-w-xs">
                            <MapPin className="h-3.5 w-3.5 text-forest shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-xs leading-tight">
                                {site.address}
                              </p>
                              <p className="text-[11px] text-ash mt-0.5">
                                {site.city}, {site.state} - {site.pincode}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Assigned Site Manager */}
                        <td className="py-3 px-3 text-onyx">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-forest text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                              {site.siteManagerName
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-xs block leading-tight">
                                {site.siteManagerName}
                              </span>
                              {site.siteManagerPhone && (
                                <a
                                  href={`tel:${site.siteManagerPhone.replace(
                                    /\s+/g,
                                    ""
                                  )}`}
                                  className="text-[11px] text-forest hover:underline"
                                >
                                  {site.siteManagerPhone}
                                </a>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge.bg}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`}
                            />
                            <span>{statusBadge.label}</span>
                          </span>
                        </td>

                        {/* Live Tasks */}
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1">
                            <span className="bg-stone px-2 py-0.5 rounded text-xs font-semibold text-onyx w-fit">
                              {liveJobs.length} tasks
                            </span>
                            {sitePkg.activeContractors.length > 0 && (
                              <span className="text-[10px] text-forest font-bold flex items-center gap-1">
                                <HardHat className="h-3 w-3" />
                                <span>{sitePkg.activeContractors.length} Contractor{sitePkg.activeContractors.length > 1 ? "s" : ""}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewingSite(site)}
                              className="px-2.5 py-1 rounded-[6px] text-xs font-semibold text-forest hover:bg-forest/10 border border-forest/30 transition cursor-pointer"
                              title="View Scope & Contractors"
                            >
                              View Scope
                            </button>
                            {!isFW && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(site)}
                                  className="p-1.5 rounded-[6px] text-ash hover:text-onyx hover:bg-stone transition cursor-pointer"
                                  title="Edit Site"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (
                                      confirm(
                                        `Are you sure you want to delete ${site.name}?`
                                      )
                                    ) {
                                      deleteSite(site.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-[6px] text-ash hover:text-danger-text hover:bg-hazard-bg transition cursor-pointer"
                                  title="Delete Site"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD CONSTRUCTION SITE                                              */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-[16px] bg-white border border-pebble p-6 shadow-xl relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3.5 border-b border-pebble/60">
              <div>
                <h3 className="text-lg font-bold text-onyx flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-forest" />
                  <span>Register New Construction Site</span>
                </h3>
                <p className="text-xs text-ash mt-0.5">
                  Set up running site location, physical address, and assign a
                  site manager.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-[6px] text-ash hover:text-onyx hover:bg-stone transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {addError && (
              <div className="mt-3 p-2.5 rounded-[8px] bg-hazard-bg text-hazard-text text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4">
              {/* Site Name */}
              <div>
                <label className="text-xs font-bold text-onyx block mb-1">
                  Site Name / Block Identifier{" "}
                  <span className="text-danger-text">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Skyline Apartments • Tower A & Podium"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (addError) setAddError("");
                  }}
                  className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                  required
                />
              </div>

              {/* Project & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Linked Project <span className="text-danger-text">*</span>
                  </label>
                  <select
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.id})
                      </option>
                    ))}
                    <option value="Skyline Apartments">Skyline Apartments</option>
                    <option value="Warehouse Project">Warehouse Project</option>
                    <option value="Commercial Tower">Commercial Tower</option>
                    <option value="Greenview Residency">
                      Greenview Residency
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Current Execution Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as SiteStatus)}
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
                  >
                    <option value="Active">Active (Under Construction)</option>
                    <option value="Mobilizing">Mobilizing (Setting Up)</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              {/* PHYSICAL ADDRESS (Primary User Requirement) */}
              <div>
                <label className="text-xs font-bold text-onyx block mb-1">
                  Physical Street Address{" "}
                  <span className="text-danger-text">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Plot 42, Sector 62, Golf Course Extension Road"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                  required
                />
              </div>

              {/* City, State, Pincode */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Gurugram"
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    placeholder="Haryana"
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    placeholder="122011"
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              {/* ASSIGNED SITE MANAGER (Primary User Requirement) */}
              <div className="p-3.5 rounded-[12px] bg-stone/40 border border-pebble/80 space-y-3">
                <div className="flex items-center gap-2">
                  <HardHat className="h-4 w-4 text-forest" />
                  <span className="text-xs font-bold text-onyx uppercase tracking-wider">
                    Site Manager Assignment
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-onyx block mb-1">
                      Select Site Manager{" "}
                      <span className="text-danger-text">*</span>
                    </label>
                    <select
                      value={newManagerName}
                      onChange={(e) => {
                        setNewManagerName(e.target.value);
                        const sel = availableSiteManagers.find(
                          (m) => m.name === e.target.value
                        );
                        if (sel) {
                          setNewManagerId(sel.id);
                          setNewManagerPhone(sel.contact || "+91 98765 43210");
                        }
                      }}
                      className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
                    >
                      {availableSiteManagers.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({m.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-onyx block mb-1">
                      Manager Direct Phone
                    </label>
                    <input
                      type="text"
                      value={newManagerPhone}
                      onChange={(e) => setNewManagerPhone(e.target.value)}
                      placeholder="+91 98765 43213"
                      className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                    />
                  </div>
                </div>
              </div>

              {/* Dates & Scope */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Execution Start Date
                  </label>
                  <input
                    type="text"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    placeholder="15 Sep 2026"
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Expected Handover
                  </label>
                  <input
                    type="text"
                    value={newExpectedCompletion}
                    onChange={(e) => setNewExpectedCompletion(e.target.value)}
                    placeholder="31 Dec 2026"
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              {/* Scope Notes */}
              <div>
                <label className="text-xs font-bold text-onyx block mb-1">
                  Scope & Engineering Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Key deliverables, crane allocations, safety requirements..."
                  className="w-full rounded-[8px] border border-pebble bg-white p-2.5 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pebble/60 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-[8px] border border-pebble bg-white px-4 py-2 text-xs font-semibold text-onyx hover:bg-stone transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-[8px] bg-forest hover:bg-forest-hover text-white px-5 py-2 text-xs font-semibold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Register Site</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT SITE & RE-ASSIGN MANAGER                                      */}
      {/* ========================================================================= */}
      {editingSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-[16px] bg-white border border-pebble p-6 shadow-xl relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3.5 border-b border-pebble/60">
              <div>
                <h3 className="text-lg font-bold text-onyx flex items-center gap-2">
                  <Edit2 className="h-5 w-5 text-forest" />
                  <span>Edit Site Details</span>
                </h3>
                <p className="text-xs text-ash mt-0.5">
                  Update location, physical address, or re-assign Site Manager.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSite(null)}
                className="p-1 rounded-[6px] text-ash hover:text-onyx hover:bg-stone transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-bold text-onyx block mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Project
                  </label>
                  <input
                    type="text"
                    value={editProject}
                    onChange={(e) => setEditProject(e.target.value)}
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as SiteStatus)}
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Mobilizing">Mobilizing</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-onyx block mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value)}
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              {/* Re-assign Site Manager */}
              <div className="p-3.5 rounded-[12px] bg-stone/40 border border-pebble/80 space-y-3">
                <div className="flex items-center gap-2">
                  <HardHat className="h-4 w-4 text-forest" />
                  <span className="text-xs font-bold text-onyx uppercase tracking-wider">
                    Site Manager
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-onyx block mb-1">
                      Assigned Site Manager
                    </label>
                    <select
                      value={editManagerName}
                      onChange={(e) => {
                        setEditManagerName(e.target.value);
                        const sel = availableSiteManagers.find(
                          (m) => m.name === e.target.value
                        );
                        if (sel) {
                          setEditManagerPhone(
                            sel.contact || "+91 98765 43210"
                          );
                        }
                      }}
                      className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
                    >
                      {availableSiteManagers.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({m.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-onyx block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editManagerPhone}
                      onChange={(e) => setEditManagerPhone(e.target.value)}
                      className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pebble/60 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingSite(null)}
                  className="rounded-[8px] border border-pebble bg-white px-4 py-2 text-xs font-semibold text-onyx hover:bg-stone transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-[8px] bg-forest hover:bg-forest-hover text-white px-5 py-2 text-xs font-semibold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW SITE SCOPE & DETAILS                                          */}
      {/* ========================================================================= */}
      {viewingSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-[16px] bg-white border border-pebble p-6 shadow-xl relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3.5 border-b border-pebble/60">
              <div>
                <span className="font-extrabold text-xs text-forest bg-clear-bg px-2.5 py-0.5 rounded-md">
                  {viewingSite.id}
                </span>
                <h3 className="text-base font-bold text-onyx mt-1.5">
                  {viewingSite.name}
                </h3>
                <p className="text-xs text-ash mt-0.5">
                  Project: {viewingSite.projectName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingSite(null)}
                className="p-1 rounded-[6px] text-ash hover:text-onyx hover:bg-stone transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              {/* Address Card */}
              <div className="p-3 rounded-[10px] bg-stone/40 border border-pebble/70 flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-forest shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-ash uppercase">
                    Site Location
                  </p>
                  <p className="text-xs font-bold text-onyx mt-0.5">
                    {viewingSite.address}
                  </p>
                  <p className="text-xs text-ash">
                    {viewingSite.city}, {viewingSite.state} -{" "}
                    {viewingSite.pincode}
                  </p>
                </div>
              </div>

              {/* Site Manager Card */}
              <div className="p-3 rounded-[10px] bg-clear-bg/40 border border-forest/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-forest text-white flex items-center justify-center text-xs font-bold">
                    {viewingSite.siteManagerName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-forest uppercase">
                      Site Manager in Charge
                    </span>
                    <p className="text-xs font-bold text-onyx">
                      {viewingSite.siteManagerName}
                    </p>
                  </div>
                </div>

                {viewingSite.siteManagerPhone && (
                  <a
                    href={`tel:${viewingSite.siteManagerPhone.replace(
                      /\s+/g,
                      ""
                    )}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:underline bg-white px-2.5 py-1 rounded-md border border-forest/30 shadow-2xs"
                  >
                    <Phone className="h-3 w-3" />
                    <span>{viewingSite.siteManagerPhone}</span>
                  </a>
                )}
              </div>

              {/* Key Specs */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-[8px] bg-stone/20 border border-pebble/60">
                  <span className="text-[10px] font-bold text-ash uppercase">
                    Execution Timeline
                  </span>
                  <p className="font-semibold text-onyx mt-0.5">
                    {viewingSite.startDate} – {viewingSite.expectedCompletion}
                  </p>
                </div>
                <div className="p-2.5 rounded-[8px] bg-stone/20 border border-pebble/60">
                  <span className="text-[10px] font-bold text-ash uppercase">
                    Total Plot / Build Area
                  </span>
                  <p className="font-semibold text-onyx mt-0.5">
                    {viewingSite.totalAreaSqFt || "50,000 sq.ft"}
                  </p>
                </div>
              </div>

              {viewingSite.notes && (
                <div className="p-3 rounded-[8px] bg-stone/20 border border-pebble/60 text-onyx">
                  <p className="text-[11px] font-bold text-forest mb-0.5">
                    Scope & Operations Notes:
                  </p>
                  <p className="text-xs text-onyx/90 leading-relaxed">
                    {viewingSite.notes}
                  </p>
                </div>
              )}

              {/* ================================================================= */}
              {/* TRADE CONTRACTORS & WORK PACKAGES ACTIVE ON THIS SITE             */}
              {/* ================================================================= */}
              {(() => {
                const sitePkg = viewingSite ? getSiteWorkPackages(viewingSite) : null;
                const contractorPackages = sitePkg?.contractorPackages || [];

                return (
                  <div className="pt-3 border-t border-pebble/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HardHat className="h-4 w-4 text-forest" />
                        <h4 className="text-xs font-bold text-onyx uppercase tracking-wider">
                          Trade Contractors &amp; Work Packages Active on this Site
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold text-forest bg-forest/10 px-2.5 py-0.5 rounded-full border border-forest/20">
                        {contractorPackages.length} Trade Package{contractorPackages.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {contractorPackages.length === 0 ? (
                      <div className="p-4 rounded-[10px] bg-stone/40 border border-pebble text-center text-ash text-xs">
                        <HardHat className="h-6 w-6 mx-auto mb-1 text-ash/40" />
                        <p className="font-semibold text-onyx">No Trade Contractors Awarded for this Site Yet</p>
                        <p className="text-[11px] text-ash mt-0.5">
                          Contractors awarded tenders for {viewingSite.projectName} will appear here with their execution packages.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setViewingSite(null);
                            router.push("/contractors");
                          }}
                          className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-forest hover:underline cursor-pointer"
                        >
                          <span>Go to Contractors Directory</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {contractorPackages.map((pkg) => (
                          <div
                            key={pkg.id}
                            className="p-3 rounded-[10px] bg-stone/30 border border-pebble/80 hover:border-forest/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-extrabold text-forest bg-clear-bg px-2 py-0.5 rounded border border-forest/20">
                                  {pkg.id}
                                </span>
                                <span className="text-[10px] font-bold text-onyx bg-white px-2 py-0.5 rounded border border-pebble">
                                  {pkg.trade || "Specialty Trade"}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    pkg.status === "Completed"
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                      : pkg.status === "In Progress"
                                      ? "bg-amber-50 text-amber-800 border-amber-200"
                                      : "bg-sky-50 text-sky-800 border-sky-200"
                                  }`}
                                >
                                  {pkg.status}
                                </span>
                              </div>

                              <p className="font-bold text-onyx text-xs mt-1 truncate">
                                {pkg.title}
                              </p>

                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-ash mt-1">
                                <span className="font-bold text-onyx flex items-center gap-1">
                                  <HardHat className="h-3 w-3 text-forest" />
                                  <span>Contractor: {pkg.contractorName || pkg.assignee}</span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-ash" />
                                  <span>{pkg.startDate} &ndash; {pkg.endDate}</span>
                                </span>
                                <span>•</span>
                                <span className="text-forest font-semibold">
                                  Supervised by: {viewingSite.siteManagerName}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                              <button
                                type="button"
                                onClick={() => {
                                  setViewingSite(null);
                                  router.push(`/jobs?jobId=${pkg.id}`);
                                }}
                                className="px-2.5 py-1.5 rounded-[7px] bg-forest text-white hover:bg-forest-hover text-xs font-semibold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                              >
                                <span>Inspect Job</span>
                                <ExternalLink className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-pebble/60 mt-4">
              <button
                type="button"
                onClick={() => {
                  setViewingSite(null);
                  router.push(`/jobs?site=${encodeURIComponent(viewingSite.name)}`);
                }}
                className="rounded-[8px] border border-forest/30 bg-forest/5 hover:bg-forest/10 text-forest px-3.5 py-2 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>View All Site Jobs</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingSite(null)}
                  className="rounded-[8px] border border-pebble bg-white px-4 py-2 text-xs font-semibold text-onyx hover:bg-stone transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewingSite(null);
                    router.push("/scheduling");
                  }}
                  className="rounded-[8px] bg-forest hover:bg-forest-hover text-white px-4 py-2 text-xs font-semibold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View in Scheduling</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </FirmaLayout>
  );
}
